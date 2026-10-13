# Cento — design package and implementation

Design generated 2026-10-12; implementation 2026-10-12 → 2026-10-13.

**Main feature: offline first, privacy first.** No account, no cloud, no analytics, no ads. Everything stays on the device and can be exported. Every other feature is designed under this rule.

## Documents

| File | What it is |
|------|------------|
| `01-design-document.md` | Full design: React Native (Expo) vs Flutter decision, positioning and the five v1 differentiators (share-sheet gift capture, onomastico, gift history, birthday + celebration reminders, widget set), data model, offline-only architecture, localization (it default, en), build order. |
| `02-mockups.html` | Screen mockups: 6 phone screens (upcoming list with name days and parties, person detail with celebration, gift ideas and history, add/edit, share-sheet capture, settings, Italian home screen), iOS home and lock-screen widgets, Android widget, web layout. Open in any browser, no network needed. |
| `03-naming-and-brand.html` | Five name candidates (Cento recommended, then Soffio, Candela, Auguri, Festa) with logo marks, app icons, palettes, taglines in it/en, and a pre-launch naming checklist. |
| `04-cento-palettes.html` | Chosen name: Cento. Current palette plus five alternatives (Pistacchio, Lampone, Cobalto, Grafite, Pesca) applied to mark, icon, widget and list, with hex values and WCAG contrast. |
| `05-implementation-notes.md` | How the code in `demo/` maps to the design: architecture as built, data flow for notifications and widgets, decisions taken where the design left room, deviations from the design document, what is verified and what still needs a device build. |

## Code

| Folder | What it is |
|--------|------------|
| `demo/` | The implementation: an npm-workspaces monorepo with `packages/core` (pure domain logic, unit-tested), `packages/i18n` (catalogs and locale config) and `apps/app` (Expo SDK 57 + Expo Router, one codebase for iOS, Android and web, plus the iOS WidgetKit target). All seven steps of the design document's build order are implemented. See `demo/README.md` to run it. |

Quick start:

```bash
cd demo && npm install && npm test && npm run web
```

Online copies (private links):
- Mockups: https://claude.ai/artifact/Uu2o4w2tDBta6FfYCGvShv
- Naming and brand: https://claude.ai/artifact/BuXuvjgz6B7eN6i6RxCGzN
- Cento palettes: https://claude.ai/artifact/FdemgZo3efLQnZPE7qZSku
