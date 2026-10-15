# Compleanni — Feature Roadmap (post-MVP, free tier)

Status: draft · Owner: product/engineering · Last updated: 2026-10-15

This document lists the features planned after the MVP for the **free version** of the app. Paid features (AI greeting cards, cloud backup, premium widgets) are out of scope here.

Guiding principles for the free tier:

- **No per-use server cost.** Anything that needs a backend must be cheap and justified by growth.
- **Local-first.** Data stays on the device unless the user explicitly shares it.
- **Privacy by default.** Sharing is always opt-in, minimal, and revocable.
- **Growth built in.** Every share action should be able to bring a new user.

> Name days (onomastico) are already covered and are out of scope.

---

## Summary

| # | Feature | Backend needed | Growth impact | Effort |
|---|---------|:--------------:|:-------------:|:------:|
| 1 | Fixed-template greeting messages (no AI) | No | Low | S |
| 2 | Recurring events beyond birthdays (anniversaries) | No | Low | M |
| 3 | Share your own date ("remember my birthday") | Minimal (landing page) | **High** | M |
| 4 | Shared birthday list for family / friend groups | Phase 1 no, Phase 2 yes | High | L |
| 5 | Date insights: zodiac sign and weekday of birth | No | Low | S |
| 6 | Nearby sharing (QR code, share sheet) | No | Medium | M |

Suggested order: **5 → 1 → 2 → 3 → 6 → 4**. Start with the cheap, self-contained features, then build the sharing features on top of a common "shareable payload" format (see feature 3).

---

## 1. Fixed-template greeting messages (no AI)

### Goal
Help users write a message quickly without any AI or server cost. It is also the free "taste" of the paid AI greeting-card feature.

### User stories
- As a user, I can open a birthday and pick a ready-made message that fits the relationship and tone.
- As a user, I can edit the text before sending.
- As a user, I can send it through WhatsApp, SMS, or any app via the system share sheet, or copy it.

### Scope
- A bundled library of messages, grouped by **relationship** (friend, family, colleague, partner, other) and **tone** (warm, funny, formal, short).
- Placeholders: `{name}`, `{age}` (only if the birth year is known), `{sender}`.
- Languages: Italian and English at launch; library stored per locale.
- Actions: shuffle, favorite, edit, copy, share.
- Avoid showing the same message twice in a row for the same person (remember the last used template ID).

### Data model
```ts
interface MessageTemplate {
  id: string;                 // stable, e.g. "it.friend.warm.012"
  locale: 'it' | 'en';
  relation: Relation | 'any';
  tone: 'warm' | 'funny' | 'formal' | 'short';
  text: string;               // with {name}, {age}, {sender}
  needsAge?: boolean;         // hide if birth year unknown
}
```
Stored as a bundled JSON file; favorites and "last used" kept in local storage.

### Acceptance criteria
- Templates that need `{age}` are never shown when the year is unknown.
- No unresolved placeholder (`{...}`) ever appears in the final text (covered by a unit test).
- Works fully offline.
- At least 15 templates per relation × tone combination in each language at launch.

### Open questions
- Who writes and reviews the Italian/English copy?
- Should the library be updatable without an app release (remote JSON) or only bundled?

---

## 2. Recurring events beyond birthdays

### Goal
Cover other yearly dates people care about, starting with **anniversaries**.

### User stories
- As a user, I can add an anniversary (wedding, relationship, work) with an optional start year.
- As a user, I see "10 years" or a milestone label (e.g. silver, golden) instead of an age.
- As a user, I get the same reminders and the same list view as for birthdays.

### Scope
- New event types: `birthday` (existing), `anniversary`, `custom` (free-text label, e.g. "Adoption day").
- Anniversary milestone labels for common years (1, 5, 10, 25, 50…), localized.
- Filter chips in the list: All / Birthdays / Anniversaries / Other.
- Reminders reuse the existing yearly local notification logic.
- The same leap-day rule applies (29 Feb is celebrated on 28 Feb in non-leap years).

### Data model change
```ts
type EventType = 'birthday' | 'anniversary' | 'custom';

interface CelebrationEvent {
  id: string;
  type: EventType;
  title: string;            // person's name, or couple / custom label
  day: number;
  month: number;
  year?: number;            // birth year or start year
  relation: Relation;
  notes?: string;
  customLabel?: string;     // for type 'custom'
  notificationId?: string;
}
```

### Migration
Storage key `birthdays:v1` → `events:v2`. On first launch, convert every v1 item to `type: 'birthday'`, keep the old key until the migration succeeds, and cover it with a test.

### Acceptance criteria
- Existing users lose no data after the update.
- Anniversaries sort correctly with birthdays in the "upcoming" list.
- The age text is replaced by "N years" / milestone label for non-birthday types.

### Open questions
- Should anniversaries use the same greeting templates (feature 1) with their own tone set?

---

## 3. Share your own date ("remember my birthday")

### Goal
Let a user send a friend a link or a small "ticket" that the friend opens and saves into the app in one tap. **Every invite is a potential new user.**

### User stories
- As a user, I can share my own birthday as a link or an image card ("Remember my birthday!").
- As a recipient with the app, tapping the link opens the app with a pre-filled "Save to my birthdays" screen.
- As a recipient without the app, the link opens a short landing page with store buttons and the shared date, so the date is not lost after install.

### Shareable payload (shared with features 4 and 6)
A small, versioned, self-describing payload:
```json
{ "v": 1, "type": "birthday", "name": "Giulia", "day": 10, "month": 10, "year": 1995 }
```
- `year` is optional and only included if the sender chooses so.
- The payload can be encoded in a URL fragment (`#...`), so the server never receives personal data.

### Scope
- Share sheet entry on the user's own card: "Share my birthday".
- Link format: `https://<domain>/b#<base64url(payload)>` using universal links (iOS) and app links (Android).
- Fallback landing page (static) showing the name and date, with App Store / Google Play buttons and a "copy the date" option.
- Optional image "ticket" generated on device (name, date, short invitation text) to share in chat apps.
- Receiving screen: shows the data, lets the user edit it, choose relation, and confirm the save. Nothing is saved without confirmation.
- Deferred deep link after installation, so a new user lands on the same receiving screen (requires a deep-link provider or a lightweight own implementation).

### Privacy and safety
- The sender picks exactly what is shared: name, day and month, optional year.
- The recipient must confirm before anything is stored.
- Validate and sanitize all incoming fields (length limits, valid date) before showing them.
- No tracking identifiers inside the link.

### Acceptance criteria
- Opening a valid link with the app installed shows the prefilled screen in under 2 seconds.
- Invalid or tampered payloads show a friendly error and never crash the app.
- The landing page works without JavaScript for the basic information (progressive enhancement).

### Open questions
- Is a custom domain available for the links?
- Do we count invites and installs (anonymous, aggregate only), and if so how?

---

## 4. Shared birthday list for family and friend groups

### Goal
One list that a family or a group of friends keeps together, so everyone sees the same dates and nobody has to enter them again.

### Phased approach

**Phase 1 — Snapshot sharing (no backend).**
Export a selected set of birthdays as a payload (same format as feature 3, as an array), shared via link, QR code, or file. The recipient previews the list, picks which items to import, and resolves duplicates (match on name + day + month). This is a one-way copy, not a live link.

**Phase 2 — Live group (backend and accounts).**
A group with members who all see updates. Required only if Phase 1 shows demand.

### User stories (Phase 2)
- As an owner, I create a group ("Family") and invite people with a link or code.
- As an editor, I can add and edit dates in the group.
- As a viewer, I can see the dates and get reminders, but not edit.
- As any member, I can leave the group, and my copy stays on my device.

### Scope (Phase 2)
- Roles: owner, editor, viewer.
- Free plan: join and read-only access; creating and editing a group may be reserved for the paid plan (to be decided).
- Conflict handling: last write wins per field, with a visible "updated by" note.
- Sync: pull on app open plus push notifications for changes; local copy always available offline.
- Sign-in: minimal (platform sign-in or email link). No password management.

### Data model (Phase 2)
```ts
interface Group { id: string; name: string; ownerId: string; createdAt: string; }
interface Membership { groupId: string; userId: string; role: 'owner' | 'editor' | 'viewer'; }
// Group events reuse CelebrationEvent with groupId and updatedBy / updatedAt.
```

### Privacy
- Members see only what was added to the group; personal lists are never exposed.
- Removing a person from a group removes their access, and deleting an entry removes it for everyone.
- Data export and account deletion available (GDPR).

### Acceptance criteria
- Phase 1: importing the same list twice does not create duplicates.
- Phase 2: an edit made offline appears for other members within one sync after reconnecting.

### Open questions
- Which features of groups are free and which paid?
- Hosting choice and cost model for the backend (see risk section).

---

## 5. Date insights: zodiac sign and weekday of birth

### Goal
Add a bit of fun to each person's card with data computed entirely on the device.

### User stories
- As a user, I see the person's zodiac sign next to their date.
- As a user, if the birth year is known, I see the weekday they were born (e.g. "born on a Tuesday").

### Scope
- **Zodiac sign** needs only day and month. Use the standard tropical date ranges:

| Sign | Range |
|------|-------|
| Capricorn | 22 Dec – 19 Jan |
| Aquarius | 20 Jan – 18 Feb |
| Pisces | 19 Feb – 20 Mar |
| Aries | 21 Mar – 19 Apr |
| Taurus | 20 Apr – 20 May |
| Gemini | 21 May – 20 Jun |
| Cancer | 21 Jun – 22 Jul |
| Leo | 23 Jul – 22 Aug |
| Virgo | 23 Aug – 22 Sep |
| Libra | 23 Sep – 22 Oct |
| Scorpio | 23 Oct – 21 Nov |
| Sagittarius | 22 Nov – 21 Dec |

- **Weekday of birth** needs the birth year; hidden when the year is unknown.
- Names localized through the platform's date/locale APIs.
- Shown in the detail screen and, optionally, as a small line on the list card.
- Pure functions in `utils/` with unit tests (boundary days, leap-day births).

### Acceptance criteria
- 29 Feb births resolve to Pisces and show the correct weekday for leap years.
- Sign boundaries (e.g. 19 Jan vs 20 Jan) are covered by tests.
- No network access is used.

### Note
Zodiac boundaries are a convention and can vary by a day depending on the year and source. The app should present them as informational, not as precise astronomy.

---

## 6. Nearby sharing (QR code and share sheet)

### Decision
Direct Bluetooth transfer (including Bluetooth Low Energy) is **out of scope**. The payload is tiny (a few dozen bytes per person), so simpler channels give the same experience with fewer problems.

### Options compared

| Option | Works iOS ↔ Android | Extra permissions | Works in Expo Go | Verdict |
|--------|:-------------------:|:-----------------:|:----------------:|---------|
| **QR code** shown on one phone and scanned by the other | Yes | Camera only | Yes | **Recommended first** |
| **System share sheet** with a link or `.json` file (AirDrop, Quick Share / Nearby Share, messaging apps) | Partly (the OS decides the channel) | None | Yes | **Recommended first** |
| **NFC** tap | Limited on iOS (read only, no device-to-device) | NFC | No | Not recommended |
| Platform-specific nearby APIs (Apple MultipeerConnectivity, Google Nearby Connections) | No, they don't interoperate | Several | No | Not recommended |

### Why not Bluetooth
- Classic Bluetooth file transfer between iOS and Android is not available to apps.
- Bluetooth Low Energy needs extra native modules and a custom build, plus permission prompts and discovery delays, making it less reliable than scanning a QR code.
- The "fallback landing page" from feature 3 does not work over Bluetooth, which loses the growth benefit of the invite link.

### Recommended plan
1. **Phase A:** QR code for a single date or a whole list (reuses the payload from feature 3). Works offline and across platforms, and the people are in the same room anyway.
2. **Phase B:** Share sheet with a `.birthdays` file for lists, so AirDrop and Quick Share can carry it.

### Privacy and safety
- The receiver always sees a preview and confirms before saving.
- QR codes for lists contain only the fields the sender selected.
- Large lists that do not fit in a QR code (rough practical limit of a few hundred bytes to a few kilobytes) are split or sent as a file.

### Acceptance criteria
- Scanning a QR code for a single date saves it in under 5 taps.
- A QR payload from an older app version is handled gracefully via the `v` field.

---

## Cross-cutting requirements

- **Localization:** all new text in Italian and English from day one.
- **Accessibility:** screen reader labels, minimum 44 px touch targets, sufficient contrast.
- **Testing:** pure logic (dates, zodiac, template placeholders, payload encode/decode, migration) covered by unit tests.
- **Payload versioning:** every shareable payload carries a `v` field and is validated on receipt.
- **Analytics:** none by default; if added, anonymous, aggregate, and opt-in.
- **Storage migrations:** always keep the previous data until the new format is verified.

## Risks

| Risk | Mitigation |
|------|------------|
| Link and universal-link setup is fiddly (domain, association files) | Build and test it early, on both platforms |
| Group sync adds backend cost and operations | Ship Phase 1 first and measure demand before Phase 2 |
| Shared data may expose personal information | Opt-in fields, confirmation on receipt, deletion and export |
| Message library feels repetitive | Enough variants per combination and "last used" tracking |
