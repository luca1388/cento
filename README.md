# Cento — implementation

Offline-first, privacy-first birthday app: upcoming birthdays, Italian name days (onomastico), party planning with its own reminders, gift ideas captured from the share sheet, gift history, home-screen widgets. No account, no server, no analytics. This folder is the code for the design package in the parent directory; `../05-implementation-notes.md` explains how the code maps to the design.

## Layout

```
demo/
├── package.json            npm workspaces root: test / typecheck / web / app scripts
├── packages/core           pure TypeScript domain logic, no React, 28 vitest tests
│   └── src/
│       ├── types.ts        Person, GiftIdea, GiftRecord, Celebration, UpcomingEvent, Settings-adjacent types
│       ├── dates.ts        calendar-date helpers (YYYY-MM-DD / --MM-DD), leap years, day arithmetic without DST drift
│       ├── events.ts       next occurrence, Feb 29 policy, age and milestones, event normalisation, grouping, nearest Saturday
│       ├── namedays.ts     Italian saints calendar (namedays/it.json), reverse index, suggestion with preferred date
│       ├── snapshot.ts     widget snapshot: 14 pre-rendered, localized day entries
│       ├── notifications.ts  the notification plan (which reminder fires when, with which localized text)
│       ├── prompts.ts      "What did you give?" detection the days after a birthday or party
│       ├── backup.ts       backup file (JSON) serialize/parse/validate, ICS calendar export
│       └── relative.ts, ids.ts
├── packages/i18n
│   └── src/
│       ├── config.ts       SUPPORTED_LOCALES + DEFAULT_LOCALE: the only list of languages in the repo
│       ├── locales/it.json source catalog (267 keys), en.json
│       ├── keys.ts         TranslationKey type derived from it.json (plural suffixes stripped)
│       └── index.ts        createI18n(): configured i18next instance
│   └── scripts/check-catalogs.mjs  fails when a catalog has missing or extra keys
└── apps/app                Expo SDK 57, Expo Router, React Native 0.86, TypeScript 6
    ├── index.ts            custom entry: registers the Android widget handler and the daily background task
    ├── app.json            scheme, bundle ids, App Group, plugins (router, sqlite, localization, notifications,
    │                       contacts, share-intent, sharing, background-task, android-widget, apple-targets)
    ├── public/             index.html template, manifest.json, sw.js, PWA icons
    ├── targets/widget/     iOS WidgetKit extension (SwiftUI) linked by @bacons/apple-targets
    └── src/
        ├── app/            routes (one file = one screen, see below)
        ├── components/     ui.tsx primitives, EventRow, PersonForm, NameDayPicker, ChecklistEditor, PromptCard
        ├── storage/        Repository interface; SQLite (native) and IndexedDB (web) implementations; DataProvider
        ├── i18n/           LocaleProvider (detection + override), useT (typed t)
        ├── notifications/  scheduler.{native,web}.ts, useNotificationSync (rebuild plan + snapshot on change)
        ├── widgets/        snapshotStore.{ios,android,web}, CentoWidget (Android JSX), register.android (headless)
        ├── background/     dailyTask.{native}.ts (expo-background-task)
        ├── backup/         files.{native,web}.ts: share/download a file, pick a file, keep a shared image
        ├── contacts/       importContacts.{native,web}.ts
        ├── sync/build.ts   builds snapshot + notification plan from data (used by the hook and the background task)
        ├── theme/          "Mezzanotte" palette, light and dark
        └── utils/          URL handling, date formatting (date-fns), sample data, safe goBack
```

Platform-specific files use Metro's resolution: `x.native.ts`, `x.ios.ts`, `x.android.tsx`, `x.web.ts`, and a plain `x.ts` that re-exports one of them so TypeScript (which does not know platform extensions) has a module to resolve. All variants are typechecked.

## Screens (`apps/app/src/app`)

| Route | Screen |
|-------|--------|
| `/` | Upcoming list: Today / This week / This month / Later, kind glyphs (🎂 🕯️ 🎉), today highlight, milestone tag, party subline, birthdays-only filter, "What did you give?" prompt cards, gift (share) and settings entries, add button |
| `/person/new`, `/person/[id]/edit` | Add / edit person: name, day/month/optional year, name-day pre-filled from the saints calendar with "change date", relationship tags, birthday reminder offsets, notes |
| `/person/[id]` | Person detail: countdown tiles, birthday card, party card with checklist, gift ideas (idea → bought → given), gift history by year with amounts, notes, delete |
| `/person/[id]/celebration` | Party editor: date (defaults to the Saturday on or after the birthday), time, place, checklist, copy last year's checklist, own reminder offsets |
| `/person/[id]/gift` | Gift idea by hand: title, link, note; URL host is used when no title is entered |
| `/person/[id]/record` | "What did you give?": pick a saved idea or type, amount, occasion, year; "Nothing this time" dismisses the prompt |
| `/share` | Save gift idea from the share sheet (link, text, photo) or from a pasted link on web / Expo Go; person picker with recent people first |
| `/import-contacts` | Reads name and birthday from device contacts, once; tick who to import |
| `/settings` | Privacy card first (export JSON / ICS, import merge or replace, contacts import, policy), language, notifications (on/off, time of day, scheduled count), name days and calendar, Feb 29 policy, widget refresh, yearly spend, sample data, delete all |
| `/privacy` | The privacy policy, bundled, readable offline |

## Run

Requires Node 20.19+ (`.nvmrc` pins 22). First install takes a while on a slow registry.

```bash
npm install
npm test            # core unit tests (vitest) + catalog key check
npm run typecheck   # tsc --noEmit in every workspace
npm run web         # web app with hot reload on http://localhost:8081
npm run app         # Metro for iOS/Android; scan the QR with Expo Go (Android Expo Go: no notifications, see table)
```

Settings → "Add sample data" seeds six people (fixed ids, so adding twice does not duplicate).

### What works where

| Feature | Web | Expo Go | Development build |
|---------|-----|---------|-------------------|
| List, people, parties, gift ideas, history, prompts, settings, export/import, policy | yes | yes | yes |
| Local notifications | no | iOS yes, Android no (SDK 53 removed the module from Expo Go; the app skips it there instead of erroring) | yes |
| Contacts import | no | yes | yes |
| Share sheet from other apps | no (paste a link instead) | no (paste a link instead) | yes |
| Home / lock-screen widgets | no | no | yes |
| Daily background refresh | no | no | yes |
| Installable PWA, offline after first load | yes (production export) | — | — |

Development build:

```bash
cd apps/app
# set "ios": { "appleTeamId": "..." } in app.json first (Xcode → Signing & Capabilities)
npx expo prebuild
npx expo run:ios        # or: npx expo run:android
```

`npx expo prebuild` generates `ios/` and `android/` from `app.json` and the config plugins; never edit those folders by hand. The iOS widget sources live in `targets/widget` and are linked into the Xcode project by `@bacons/apple-targets`.

Production web export:

```bash
cd apps/app && npx expo export --platform web
# dist/ is a static site: index.html, manifest.json, sw.js, hashed bundles. Deploy to any static host.
```

## Testing

- `packages/core/test/*.test.ts`: dates (DST, leap years, year-less dates), events (sorting, ages, milestones, Feb 29 policies, grouping, celebrations), name days (folding, preferred dates, compound names), snapshot (per-day countdown text), notifications (offsets, party 2h heads-up, day-after prompt, limit), prompts (window, answered, dismissed), backup (round trip, validation, ICS).
- `packages/i18n/scripts/check-catalogs.mjs`: every catalog must have exactly the keys of `it.json`.
- Typed translation keys: `t('upcoming.titel')` is a compile error.
- No automated UI tests; the screens were exercised manually on web.

## Conventions

- **No network.** `grep -rn "fetch(" apps/app/src` must return no matches. Dependencies are checked for network access before being added. The service worker caches only same-origin GET requests.
- **No string literals in screens.** Everything goes through `useT()`; plurals use `_one` / `_other` keys; sentences use interpolation, never concatenation.
- **Dates are calendar dates.** `YYYY-MM-DD`, or `--MM-DD` when the year is unknown. Arithmetic in `packages/core/src/dates.ts` uses UTC so DST never produces a 23-hour day.
- **Everything derived is rebuilt, never patched.** On any change to people, parties, settings or language, `useDerivedSync` recomputes the whole notification plan and the whole widget snapshot and hands them to the OS. The daily background task does the same without the app open.
- **Platform code behind small interfaces.** `Repository`, `scheduler`, `snapshotStore`, `files`, `importContacts` each have a native and a web implementation with the same signature; screens never check `Platform.OS` for storage or notifications (only for `confirm` dialogs).

### Adding a language

1. Copy `packages/i18n/src/locales/it.json` to `<lang>.json` and translate the values. `npm test -w packages/i18n` fails until every key is present.
2. Add one entry to `SUPPORTED_LOCALES` in `packages/i18n/src/config.ts` (label + `date-fns` locale import).
3. Nothing else: the language picker, detection, date formatting, notifications and widget snapshot derive from that object.

### Adding a name-day country

1. Add `packages/core/src/namedays/<country>.json` (`{ "MM-DD": ["Name", …] }`) and optionally `<country>.preferred.json` for names with several dates.
2. Register it in the `CALENDARS` map in `packages/core/src/namedays.ts`.
3. Add the `settings.namedays.calendar.<country>` label to the catalogs.

## Known gaps

- Native paths (notification delivery, share extension, widgets, contacts, background task) are implemented but have not been run on a device from this repository.
- Widget preview images and the Android widget `previewImage` are not provided.
- Export on web downloads a file; there is no "share" sheet. Import works through the browser file picker.
- Contacts import skips contacts without a birthday and ignores non-Gregorian birthdays.
