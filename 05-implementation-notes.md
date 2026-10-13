# Cento — implementation notes

Written 2026-10-13, after the seven steps of the build order in `01-design-document.md` were implemented in `demo/`. This document records how the design was realised, the decisions taken where the design left room, and the places where the code deviates from the design document. For how to run the code, see `demo/README.md`.

## 1. Architecture as built

The design asked for a monorepo with `packages/core`, `packages/i18n` and one Expo app. That is what exists:

| Design | Implementation |
|--------|----------------|
| `packages/core`: next-occurrence math, sorting, age, widget snapshot | `demo/packages/core/src/{dates,events,snapshot}.ts`, plus `namedays.ts`, `notifications.ts`, `prompts.ts`, `backup.ts` which the design placed in the app but are pure and testable, so they moved into core |
| `packages/i18n`: catalogs, `SUPPORTED_LOCALES`, key types from `it.json` | `demo/packages/i18n/src/{config,keys,index}.ts`, `locales/{it,en}.json`, `scripts/check-catalogs.mjs` |
| `apps/app`: Expo Router, repository interface, SQLite on mobile, IndexedDB on web | `demo/apps/app/src/storage/{repository,createRepository.native,createRepository.web}.ts` |
| Share sheet via `expo-share-intent` | `app.json` plugin config + `src/app/share.tsx`; routing from the intent happens in `_layout.tsx` |
| Notifications via `expo-notifications`, nearest batch only, rescheduled on open and daily | `src/notifications/scheduler.native.ts`, `useNotificationSync.ts`, `src/background/dailyTask.native.ts` |
| iOS widgets via `@bacons/apple-targets`, Android via `react-native-android-widget` | `targets/widget/*.swift`, `src/widgets/*` |
| Web as static export, PWA | `public/index.html`, `public/manifest.json`, `public/sw.js`, registered only in production builds |

### Data flow for everything derived

```
people, celebrations, settings, locale
          │
          ▼  sync/build.ts → buildDerived()
   ┌──────┴──────────┐
   ▼                 ▼
widget snapshot   notification plan      (both pure, both fully localized, both from packages/core)
   │                 │
   ▼                 ▼
snapshotStore     scheduler.native
 iOS: App Group file   cancel all, schedule the nearest ≤60 future entries
 Android: file + requestWidgetUpdate
```

Triggered by `useDerivedSync` (debounced 400 ms) whenever people, celebrations, the relevant settings or the resolved locale change, and by the daily background task. Nothing is patched incrementally: the design's "cancel and reschedule everything in the new language" became the general rule.

### Storage

Each table stores a JSON document per row plus the columns needed for lookups (`id`, `person_id`, `year`, `created_at`). This keeps the SQLite schema stable while the model evolves; the IndexedDB store mirrors it with an index on `personId`. `settings` is one JSON row. The `Repository` interface also has `exportAll()` and `importAll(data, mode)` for backups, both transactional.

### Localization

- Resolution is exactly the pseudo-code in the design (`override` else first supported device language else `it`). On web, `navigator.languages` is used; on native, `expo-localization`.
- `TranslationKey` is derived from `it.json` with plural suffixes stripped, so `t('event.turns', { count })` typechecks and `t('event.turns_one')` does not.
- The widget snapshot and the notification plan are built with the same `t` and the same date formatter as the screens, in `sync/build.ts`; the background task recreates them headlessly with `headlessLocale()`.
- The Swift widget contains no strings of its own except the configuration intent's titles (iOS requires compile-time titles there).

## 2. Decisions taken where the design left room

| Topic | Decision | Why |
|-------|----------|-----|
| Name-day suggestion for names with several dates | A small `it.preferred.json` names the date to pre-fill; all candidates are offered in the "change date" picker | The design said "most common date"; a preferred map is explicit and editable |
| Compound first names ("Anna Chiara") | Exact match first, then the first word | Catches the common case without a fuzzy matcher |
| Reminder time of day | One setting, `notificationTime`, default 09:00, applied to every reminder; the party heads-up fires two hours before the party time | The design mentions a time-of-day setting; one value keeps the plan predictable |
| Notification cap | 60 of iOS's 64 | Leaves room for anything else the OS counts |
| "What did you give?" window | The prompt card stays for 7 days after the event; the notification fires once, the day after | A single day is easy to miss |
| Prompt identity | `personId:occasion:year`; a party counts as the birthday occasion | One question per person per year even when the party is on another day |
| Deep links | `cento://person/<id>` and `cento://person/<id>/record?occasion=&year=` | Same paths as the routes, so widgets, notifications and the share extension all land on real screens |
| Gift history currency | Amounts stored with `EUR`; formatted with `Intl.NumberFormat` for the active locale | A currency picker was not in v1 |
| Sample data | Fixed ids (`sample_<firstname>`) | Re-adding replaces instead of duplicating |
| Contacts import ids | `contact_<systemId>` | Re-importing updates the same person; "already added" shown in the picker |
| Backup validation | Rows that point at unknown people are dropped; unknown fields are kept | A newer export still round-trips through an older app |
| Web "share" | A paste-a-link field on `/share`, reachable from the 🎁 entry on the list | Browsers have no share-target without a server-side handler |
| Confirm dialogs | `window.confirm` on web, `Alert.alert` on native | The only place screens branch on platform |

## 3. Deviations from the design document

- **Widget snapshot shape.** The design's example had `{ id, name, line }` per item. The implemented item carries `kind`, `short` (lock screen), `long` (home screen), `deepLink` and keeps `line` as an alias of `long`, as the later "Widget set" section of the design requires.
- **Core is larger than planned.** Notification planning, prompt detection and backup/ICS generation live in `packages/core` instead of the app so they are unit-tested and shared by the background task.
- **Android widget refresh.** The design mentions a WorkManager job at midnight. `react-native-android-widget` provides a periodic update (`updatePeriodMillis`, set to 30 minutes, the platform minimum) whose handler picks today's snapshot entry; combined with the app's daily background task this gives the same result without custom Kotlin.
- **Web notifications.** Out of scope: the web `scheduler.web.ts` is a no-op and Settings says so. Service-worker notifications would need a push server, which the privacy rule forbids.
- **Contacts photos** are not imported (the design listed photos only "when the user attaches one").
- **Lint rule for `fetch`.** The design wanted an ESLint rule flagging network imports; ESLint could not be installed in the environment where this was built (registry policy). The convention is documented and checkable with `grep`, and `expo lint` can be enabled later without code changes.
- **Spending view.** The design put yearly totals in a Settings → Spending section; implemented as one line in Settings (current year total) plus per-record amounts in the person history.

## 4. Verification status

| Area | Status |
|------|--------|
| `packages/core` | 28 unit tests pass (`npm test`) |
| Catalogs | `it.json` and `en.json` have the same 267 keys |
| TypeScript | every workspace typechecks, including platform-specific files and typed routes |
| Web app | every screen exercised in a browser at phone and desktop widths, light and dark: list with prompt card, person detail, add/edit with name-day suggestion, party editor, gift idea by paste, gift record, settings, export download, privacy policy, language switch, data persistence across reloads |
| Production web export | builds; `index.html` carries manifest link, theme colour, description, `lang="it"`; `sw.js` and icons are in the output |
| Native (notifications, share extension, widgets, contacts, background task) | implemented, not run on a device from this repository; requires `npx expo prebuild` with an `ios.appleTeamId` |

## 5. Suggested next steps

1. Development build on an iPhone and an Android phone; walk the native column of the "what works where" table in `demo/README.md`.
2. Widget preview images (`previewImage` for Android, asset catalog for iOS) and a screenshot pass against `02-mockups.html`.
3. Store metadata: privacy labels ("Data Not Collected"), the listing text from the design, and `NSContactsUsageDescription` / notification copy reviewed by a native speaker.
4. ESLint with a rule forbidding `fetch`/network imports outside `src/network/`, once the registry allows installing it.
5. Optional: a second name-day calendar and a currency setting, both one-file changes by design.
