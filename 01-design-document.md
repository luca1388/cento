# Cento — Design Document

Working name: **Cento** (from the Italian birthday wish *cento di questi giorni*).

Date: 2026-10-12

> Implemented in `demo/` (2026-10-12 → 2026-10-13). See `05-implementation-notes.md` for how the code maps to this document and where it deviates, and `demo/README.md` to run it.

## Goal

A mobile application (iOS + Android) that reminds the user of upcoming birthdays and helps organize the celebration, with:

- An "upcoming birthdays" view showing person name, date, days left, and the age they will turn.
- A home-screen widget showing the next upcoming birthday(s).
- A web app with the same functionality.
- Everything working fully offline, with all data stored locally on the device. No backend, no accounts.
- Multi-language UI: Italian is the default, English is the second language. The app picks the best language from the device locale and the user can override it in Settings. Adding a new language must be cheap.

## Main feature: offline first, privacy first

This is the headline of the product, not a technical detail. Every other feature is designed under it.

- **Your dates never leave your phone.** No account, no sign-up, no server, no cloud. The app works with the network switched off, forever.
- **Nothing is collected.** No analytics, no crash-reporting SDK that phones home, no ads, no third-party SDKs with network access. The App Store privacy label reads "Data Not Collected" and the Play Data safety section says the same.
- **You own the data.** Export everything (people, ideas, history) as JSON and ICS at any time; import it back on any device, including the web app.
- **Network is the exception and always optional.** The only feature that ever touches the network is the gift-idea link preview (page title and image). It is off by default, explained in one sentence when first offered, and the feature works without it.
- **No permission the feature does not need.** Contacts access only when the user taps Import, notifications only when they enable reminders, photos only when they attach one.

How it shows up for the user:
- Store listing first line: *"I tuoi compleanni restano sul tuo telefono. Nessun account, nessun cloud, nessuna pubblicità."* / *"Your birthdays stay on your phone. No account, no cloud, no ads."*
- Onboarding screen one says the same in one sentence, with the Import button under it.
- Settings opens with a "Privacy" card that repeats the promise and holds Export, Import and the link-preview switch.
- Privacy policy fits on one screen and is bundled in the app, readable offline.

Positioning: the phone already reminds people of birthdays. Cento owns what happens *after* the reminder: the gift, the party, and the Italian dates other apps ignore, and does it without ever asking for your data. Five features carry that positioning and are part of v1:

1. **Share-sheet gift capture** — save a link, photo or text from any app into a person's gift ideas, all year round.
2. **Onomastico** — name days from the Italian saints calendar, alongside birthdays.
3. **Gift history** — what you gave each year, so you never repeat a gift and the app accumulates memory.
4. **Two reminders, not one** — the birthday and the celebration, which often falls on a different day.
5. **Widget set** — home screen, lock screen and StandBy on iOS, resizable on Android, so the next date is always visible.

## Framework decision: React Native (Expo) over Flutter

**Recommendation: React Native with Expo.**

Reasons:

- **The web app is the deciding factor.** Expo Router builds the same screens as a real DOM-based web app, so mobile and web share almost all code. Flutter Web renders to a canvas: heavier bundles, weak SEO, poor text selection and accessibility, and a non-native feel for a simple list-and-forms app.
- **Home-screen widgets are native in both frameworks.** iOS widgets must be SwiftUI (WidgetKit); Android widgets must be RemoteViews or Glance. Neither framework renders its own UI inside a widget. Flutter's `home_widget` package and the Expo ecosystem both only bridge data to native widget code, so this is not a differentiator.
- **One language end to end.** TypeScript covers the app, the web, and the shared domain logic. If the team already works in React, the learning curve is near zero.
- **When Flutter would win instead:** if web were a low priority and Dart was preferred. Flutter's widget bridging is slightly more turnkey. Not the case here.

## Product design

### Data model

Keep it small. Store only source data; derive the rest.

Person:
- `id`
- `name`, `firstName` (used for the name-day suggestion)
- `birthDate` — calendar date (YYYY-MM-DD), **year optional**
- `nameDay` — `{ month, day } | null`, suggested from the first name at creation, editable (many names have several dates)
- `photoUri`
- `relationship` / tags — built-in tags (family, friend, work, neighbour) are stored as keys and translated at render time; user-created tags are stored as typed
- `notes`
- `reminderOffsets[]` for the birthday (e.g. 7 days, 1 day, same day)

GiftIdea (many per person, captured any time of the year):
- `id`, `personId`
- `title`, `note`
- `url` (from the share sheet), `imageUri` (shared photo or page preview if it was fetched while online)
- `source` — `share` | `manual`
- `status` — `idea` | `bought` | `given`
- `createdAt`

GiftRecord (the history, one per gift actually given):
- `id`, `personId`
- `year`, `occasion` — `birthday` | `nameday` | `other`
- `title`, `amount?`, `currency?`, `note`
- `giftIdeaId?` — set when an idea was marked as given

Celebration (zero or one per person per year):
- `id`, `personId`, `year`
- `date` (calendar date), `time?`, `place?`, `notes`
- `checklist[]` — `{ text, done }`
- `reminderOffsets[]` — independent from the birthday reminders

Everything that can appear in the upcoming list is normalised by the core package into an **Event**:
- `{ personId, kind: birthday | nameday | celebration, date, label, age? }`

Derived per person (never stored):
- next occurrence of each event kind
- days until
- age they will turn (hidden when the birth year is unknown)
- whether the next birthday is a milestone (18, 30, 40, 50, 60, 70, 80, 90, 100)

### Screens (shared across mobile and web)

1. **Upcoming list** — all events sorted by days until, grouped into Today / This week / This month / Later. Each row: name, date, days left, and a kind glyph: cake for birthday ("turns N"), small flame for name day, confetti for a celebration ("Giulia's party · Sat 18 Oct"). Name days can be hidden with a filter chip.
2. **Person detail** — birthday and name day at the top, then the celebration card for this year (date, place, checklist, its own reminders), gift ideas (with link previews and idea / bought / given status), gift history by year, notes.
3. **Add / edit person** — plus import from device contacts. When a first name matches the saints calendar the name day is pre-filled with a "change date" link.
4. **Celebration editor** — opened from the person detail: date (defaults to the birthday, usually moved to the nearest weekend), time, place, checklist, reminder offsets. One per year; last year's checklist can be copied.
5. **Save gift idea (share sheet)** — the screen that opens when something is shared into Cento from another app: a preview of the link, photo or text, a person picker with recent people first, an optional note, Save. Two taps from any app.
6. **"What did you give?" prompt** — the day after a birthday or celebration, a card at the top of the upcoming list (and one local notification) asks what was given. Picking an idea marks it given and creates the history record; "nothing" or "skip" dismisses it.
7. **Settings** — a Privacy card first (the promise, Export, Import, link-preview switch), then language (System / Italiano / English), name days on/off and calendar, default reminder lead times for birthdays and for celebrations, notification time of day, widget options, export/import backup.

### Edge cases (handled in the shared core package)

- **February 29** birthdays: fall back to Feb 28 or Mar 1 on non-leap years, by user preference.
- **Time zones:** store calendar dates, not timestamps, so a birthday never shifts by a day.
- **Unknown birth year:** skip the age everywhere.
- **Name day with several dates:** the suggestion picks the most common date for that name; the user can change it. Unknown names simply have no name day.
- **Celebration without birthday year:** fine, the celebration never shows an age.
- Lunar/other calendars: out of scope for v1.

## Technical architecture

### Monorepo layout

- `packages/core` — pure TypeScript domain logic, no React dependency, fully unit tested:
  - next-occurrence math, sorting, age computation
  - a "widget snapshot" builder producing the next ~10 events as plain JSON
- `packages/i18n` — translation catalogs and locale config, shared by app, web, notifications and the widget snapshot (see Localization).
- `apps/app` — one Expo project with Expo Router targeting iOS, Android, and web.
  - local-first storage behind a small repository interface
  - SQLite (`expo-sqlite`) on mobile, IndexedDB on web

### Offline-only storage (no server)

Engineering rules that keep the main feature true:
- The app has no network layer except the optional link-preview fetch, which lives in one module behind the Settings switch. A lint rule flags any other `fetch` or networking import.
- No analytics or remote crash reporting. Crash logs stay on device and can be exported by the user if they want to report a bug.
- Dependencies are reviewed for network access before being added; SDKs that phone home are rejected.
- The release checklist includes verifying the App Store privacy label and Play Data safety form against the actual binary.

- **Mobile:** SQLite on the device. All reads, writes, sorting happen locally. Contacts import is local.
- **Notifications:** local notifications scheduled on the device; fire without connectivity.
- **Widget:** app writes the snapshot JSON into the iOS App Group container / Android SharedPreferences; the widget reads only that. Midnight timeline refresh needs no network.
- **Web:** same screens with IndexedDB storage. Installed PWA with a service worker caching the static bundle, so it works offline once loaded.

**Consequence:** phone and browser each hold their own copy, since a web page cannot read the phone's database. Options to move data between devices, simplest first:

1. **Export / import a file** (JSON and/or ICS) from the settings screen, via the system share sheet on mobile and a file download on web. Also doubles as backup. **Ship this first.**
2. **Sync through a file in the user's own cloud drive** (iCloud Drive / Google Drive). No backend, no accounts, but uses the network when running.
3. **Local-network sync** between devices on the same Wi-Fi. Works without internet but is a lot of code for little gain.

### Share-sheet gift capture

- Library: **expo-share-intent**. It adds the iOS Share Extension target and the Android `ACTION_SEND` / `SEND_MULTIPLE` intent filters through a config plugin, and opens the app with the shared payload (URL, text, images). No custom native code.
- On open the app routes to the "Save gift idea" screen with the payload already parsed. The person picker lists recent people first, then everyone alphabetically, with a search field.
- Everything is saved offline immediately: title defaults to the page title if the share payload carries one, otherwise to the URL host. Link previews (page title and image fetched from the web) are **off by default** and switched on in Settings → Privacy; when on and online, the app fetches them once and stores them locally. The feature never depends on the fetch.
- Shared photos are copied into the app's document directory so the idea survives the original being deleted.
- The share extension on iOS shows the app name and icon in the share sheet; the store listing should mention "Save gift ideas from Safari, Instagram or Amazon" since this is the main hook.

### Onomastico (name days)

- A bundled calendar in `packages/core/namedays/it.json`: `{ "MM-DD": ["Giulia", "Giuliana", ...] }` plus a reverse index built at startup (`name → [dates]`). The Italian calendar covers the common liturgical saints; rare names fall back to "no name day".
- Suggestion at person creation: first name, lower-cased and accent-folded, looked up in the reverse index. If one date → pre-filled. If several → pre-filled with the most common one and a "change" link. Name-day dates are stored on the person, so a later calendar update never silently moves someone's date.
- The calendar is **per country, not per language**: `namedays/<country>.json`. At launch only `it` exists. The feature is on by default when the device region is Italy, off otherwise, and can be switched on in Settings with the calendar to use. Adding a country is one JSON file.
- Name days show in the list, in notifications and in the widget with their own glyph, and have their own default reminder (same day, morning) since they rarely need a gift.

### Gift history

- A `GiftRecord` is created in three ways: marking an idea as given, the "What did you give?" prompt the day after an event, or manually from the person detail.
- Person detail shows the history as a short timeline: year, occasion, title, amount. Ideas that were given disappear from the ideas list and appear here.
- Optional yearly total per person and across people, in Settings → Spending, always local.
- Export includes gift ideas and history, so the backup is a real memory, not just dates.

### Two reminders: birthday and celebration

- The birthday reminder works as before: offsets per person, defaults in Settings.
- The celebration is a separate dated object for the current year, with its own date (often the nearest Saturday), time, place, checklist and offsets. Defaults for celebration reminders: 3 days before and on the day, 2 hours before the time if a time is set.
- The upcoming list shows both events. When a celebration exists for the next birthday, the birthday row gets a small "party Sat 18" subline so the two do not look unrelated.
- The widget shows whichever event comes first and labels it, e.g. "Festa di Giulia · sabato".
- When the birthday passes without a celebration set, nothing happens. When a celebration passes, its checklist is archived with the year, and next year's editor offers "copy last year's checklist".

### Widget set

iOS (WidgetKit, SwiftUI, all fed by the same snapshot):
- **Home screen small:** next event, countdown, age or kind.
- **Home screen medium:** next event plus the following three.
- **Home screen large:** the next seven events with dates.
- **Lock screen circular:** the countdown number with a tiny cake or flame glyph.
- **Lock screen rectangular:** name, kind, countdown.
- **Lock screen inline:** "Giulia · 3 giorni".
- **StandBy** reuses the home screen widgets automatically.
- Widget configuration (one intent parameter): show *all events* or *birthdays only*.

Android (Glance):
- Resizable widget with 2x2, 4x2 and 4x4 layouts, same content tiers as iOS small, medium, large.
- Android has no lock screen widgets; the notification on the day serves that role.

Snapshot changes: each day entry now carries, per event, `kind`, `name`, a `short` line for lock screen sizes and a `long` line for home screen sizes, both already localized, plus a `deepLink`. Nothing else in the widget code needs to know what a name day or a celebration is.

### Reminders / notifications

- `expo-notifications`, local scheduling per event per reminder offset: birthday offsets, celebration offsets, name-day morning reminder, and the single "What did you give?" prompt the day after.
- iOS caps pending local notifications at 64: schedule only the nearest batch and reschedule on app open and from a daily background task.

### Home-screen widget

Shows the next events (birthdays, name days, celebrations) with name, days left, and the age they turn. The full list of sizes and families is in "Widget set" above.

- **Data handoff:** whenever people change (or the language changes), the app writes the snapshot JSON to the iOS App Group container and Android SharedPreferences. The widget never touches the database. The snapshot is already localized: it contains one pre-formatted entry per day for the next 14 days, so the native widget code has no strings of its own (see Localization).
- **iOS:** WidgetKit extension in SwiftUI, added to the Expo project with the `@bacons/apple-targets` config plugin. The timeline provider emits one entry per midnight for the next few days so "in 3 days" becomes "in 2 days" overnight without the app running.
- **Android:** either `react-native-android-widget` (describe the widget in JSX, rendered to RemoteViews) or a Kotlin Glance widget. A daily WorkManager job refreshes it at midnight.
- Tapping the widget deep-links into the person detail screen via Expo Router.

### Web

- Same Expo project exported as a static site (Expo Router web output).
- Deployed on Vercel / Netlify (or any static host).
- PWA manifest + service worker so it installs on desktop and works offline.

## Localization (i18n)

### Requirements

- Supported languages at launch: **Italian (`it`, default)** and **English (`en`)**.
- On first launch the app detects the best language from the device locale list. Region variants map to the base language (`it-CH` → `it`, `en-GB` → `en`). If nothing matches, fall back to Italian.
- Settings has a **Language** option: *System (automatic)*, *Italiano*, *English*. The override is stored locally and wins over detection. "System" re-evaluates the device locale on every launch.
- Changing the language takes effect immediately, without restart, and also updates everything that was generated earlier in the old language: scheduled notifications and the widget snapshot.
- Adding a language must not require touching app code: one new catalog file plus one line of configuration.

### Library and structure

- **i18next + react-i18next**, with **expo-localization** for device locales on mobile and `navigator.languages` on web. ICU-style plurals through i18next's plural rules (`turns_one` / `turns_other` style keys), so "compie 1 anno" vs "compie 7 anni" and "in 1 day" vs "in 3 days" are handled per language.
- Catalogs live in `packages/i18n/locales/<lang>.json`, one flat file per language, grouped by namespace prefix (`upcoming.*`, `person.*`, `settings.*`, `notifications.*`, `widget.*`). Italian is the **source catalog**: TypeScript key types are generated from `it.json`, so a missing or misspelled key fails type-checking in every app.
- `packages/i18n/config.ts` holds the single list of supported locales:

  ```ts
  export const SUPPORTED_LOCALES = {
    it: { label: 'Italiano', dateFns: () => import('date-fns/locale/it') },
    en: { label: 'English',  dateFns: () => import('date-fns/locale/en-GB') },
  } as const;
  export const DEFAULT_LOCALE = 'it';
  ```

  Everything else (the language picker in Settings, detection, date formatting, widget snapshot) is derived from this object. No other file enumerates languages.
- **Dates, weekdays, numbers** are never hand-formatted. Use `Intl.DateTimeFormat` / `date-fns` with the active locale: "mer 15 ott" vs "Wed 15 Oct", first day of week, 24h vs 12h in the notification time picker. Birthdays stay stored as `YYYY-MM-DD` regardless of language.
- **Relative days** ("Oggi", "Domani", "Tra 3 giorni" / "Today", "Tomorrow", "In 3 days") are one helper in `packages/core` that takes the catalog, so list rows, notifications and the widget all say the same thing.

### Language resolution

```
override = settings.language          // 'system' | 'it' | 'en' | ...
if override != 'system' → use override
else → first device locale whose language subtag ∈ SUPPORTED_LOCALES, else DEFAULT_LOCALE
```

The resolved locale is set once at startup and re-set when the Settings value changes. `<html lang>` follows it on web.

### Notifications

Notification title and body are rendered from the catalog **at scheduling time**. When the language changes, the app cancels and reschedules all pending notifications in the new language (this is cheap: only the nearest batch is ever scheduled).

### Widget

The widget must not contain its own translations, otherwise every new language means Swift and Kotlin changes. Instead, the app does all localization in TypeScript and writes a **pre-rendered, day-indexed snapshot**:

```json
{
  "locale": "it",
  "generatedAt": "2026-10-12",
  "days": [
    { "date": "2026-10-12", "headline": "Prossimo compleanno",
      "items": [ { "id": "p1", "name": "Marta Rossi", "line": "Oggi · compie 34 anni" },
                 { "id": "p2", "name": "Giulia Bianchi", "line": "Tra 3 giorni · compie 29 anni" } ] },
    { "date": "2026-10-13", "headline": "Prossimo compleanno",
      "items": [ { "id": "p2", "name": "Giulia Bianchi", "line": "Tra 2 giorni · compie 29 anni" } ] }
  ]
}
```

- The iOS timeline provider and the Android daily job just pick the entry for the current date. Countdowns still tick at midnight without the app, for 14 days ahead.
- The daily background task in the app regenerates the snapshot, so the 14-day horizon is normally never reached.
- The snapshot is rewritten on every people change and on every language change.
- Locale-dependent things the widget cannot avoid (none at launch) would be the only native localization work.

### Web

Same `packages/i18n` package. Detection from `navigator.languages`, override stored in IndexedDB alongside the data. The static export ships all catalogs (they are a few KB each); no per-language build.

### Name days and localization

Name-day calendars are tied to a **country**, not a language, and live in `packages/core/namedays/`. A German-speaking user in Italy keeps the Italian calendar; an Italian speaker in Switzerland may switch to a Swiss one once it exists. The language catalogs only provide the labels ("Onomastico" / "Name day").

### Checklist for adding a language (for example German)

1. Copy `locales/it.json` to `locales/de.json` and translate the values. A CI script fails if any key is missing or unused.
2. Add one entry to `SUPPORTED_LOCALES` in `packages/i18n/config.ts` with the label and the `date-fns` locale import.
3. Add the store listing text (App Store / Play Store) in the release checklist.
4. No changes in screens, notifications, widget, or web code.

Design rules that keep this true:

- No string literal in UI code; everything goes through `t('key')`. An ESLint rule flags literal text in JSX.
- No string concatenation for sentences; use interpolation (`t('person.turns', { age })`) so word order can differ per language.
- Plurals and gender-sensitive words go through plural keys or separate keys, never through `if (n === 1)` in code.

## Build order

1. `packages/core` (events engine with birthday, name day, celebration) + `packages/i18n` + upcoming list + add/edit flow + name-day suggestion (local only).
2. Local notifications for all event kinds, localized at scheduling time.
3. Celebration editor and the second reminder set.
4. Gift ideas, share-sheet capture (expo-share-intent), gift history and the "What did you give?" prompt.
5. iOS widget set (home, lock screen) and Android resizable widget.
6. Web export as an offline PWA (share-sheet capture is mobile only; the web has a paste-a-link field instead).
7. Backup export/import (JSON, ICS), contacts import, calendar export, Privacy card in Settings, bundled privacy policy.

## Explicitly out of scope for v1

- Backend, accounts, cloud sync, auth.
- Lunar or non-Gregorian calendars.
- Group gifts, money collection, shared lists.
- Generated greeting messages. Quick actions open WhatsApp or the dialer with the person; the words are the user's.
- Shared/collaborative lists.
- Right-to-left languages (the i18n structure allows them, but layouts are not tested for RTL in v1).
