# Requirements: Little Words

**Defined:** 2026-06-30
**Core Value:** A parent can walk into a specialist consultation and present objective, structured observations instead of relying on memory.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Vite + React + TypeScript scaffold with `base: '/little-words/'`, tsconfig strict mode, Tailwind CSS v4, and Shadcn/UI initialized
- [ ] **FOUND-02**: Dexie.js schema v1 defining all entities: ChildProfile, WordForm, Meaning (with categories as `string[]`), WordFormMeaning junction table, with TypeScript interfaces for all entities
- [ ] **FOUND-03**: react-i18next initialized before React tree mounts; Polish and English locale files bundled as static imports; TypeScript key augmentation configured so missing keys cause compile errors
- [ ] **FOUND-04**: `createHashRouter` configured with hash-based routes (`/#/path`), root layout with bottom nav tabs (3–4 tabs + overflow), and onboarding gate in App.tsx that redirects to onboarding if no child profile exists

### Onboarding

- [ ] **ONBD-01**: Parent cannot access the main app until a child profile is created; onboarding wizard collects mandatory fields: child name, birth date, and languages used at home
- [ ] **ONBD-02**: Optional child profile fields (premature birth, speech therapy, neurological care, parent notes for doctor report) are accessible after the wizard and editable from a profile/settings screen
- [ ] **ONBD-03**: `navigator.storage.persist()` is called silently after the first word form is added to request persistent storage and prevent browser eviction
- [ ] **ONBD-04**: After the first word form is added, iOS users see a "Add to Home Screen" instruction (detected via user agent) framed as a data-protection feature

### Data Entry

- [ ] **ENTRY-01**: A floating action button (FAB) is present on all main screens; tapping it opens a bottom sheet with the add-word form
- [ ] **ENTRY-02**: The Meaning field in the add-word form shows autocomplete suggestions from existing meanings as the parent types; if no match exists, a "Create new meaning" option is shown; the selected or created meaning is linked to the word form
- [ ] **ENTRY-03**: Each meaning can be tagged with one or more categories from the fixed default list (Nouns, Verbs, Adjectives, People, Food, Animals, Vehicles, Body Parts, Onomatopoeia, Requests, Social Communication, Emotions, Places, Other); multiple selection is supported

### Dashboard

- [ ] **DASH-01**: Dashboard displays Active Meanings count as a large, prominent primary card — this is the most important number in the app
- [ ] **DASH-02**: Dashboard displays Active Word Forms count and New Meanings This Month count as secondary metric cards
- [ ] **DASH-03**: Dashboard displays a "Review these?" section listing meanings whose last-use date is 30+ days ago, with a one-tap shortcut to the meaning detail page

### Browse Views

- [ ] **BROWSE-01**: Meanings view shows a scrollable list of all meanings; tapping a meaning opens a detail page showing its word forms, categories, first/last use dates, and an Active/Inactive toggle
- [ ] **BROWSE-02**: Word Forms view shows a scrollable list of all word forms; tapping a word form opens a detail page showing all linked meanings
- [ ] **BROWSE-03**: Categories view shows all default categories with a count of meanings in each category; tapping a category filters to that category's meanings
- [ ] **BROWSE-04**: Timeline view shows monthly vocabulary growth as both a line/bar chart (Recharts via Shadcn chart) and a data table below it

### Doctor Report

- [ ] **REPORT-01**: Doctor Report generates structured plain text including: child name and computed age, active meaning count, inactive meaning count, new meanings in last 3 months, active word form count, top 3 categories, languages used at home, premature birth flag, speech therapy flag, neurological care flag, parent notes, and report date
- [ ] **REPORT-02**: A "Copy to clipboard" button copies the full plain-text report; success is confirmed with a toast notification

### Data Management

- [ ] **DATA-01**: Settings → Data screen provides JSON export that writes all app data (child profile, word forms, meanings, junction rows) as a single JSON file with a `schemaVersion` field
- [ ] **DATA-02**: Settings → Data screen provides JSON import that reads a previously exported JSON file, validates `schemaVersion`, and restores all data (with a warning that existing data will be replaced)
- [ ] **DATA-03**: Settings → Data screen provides CSV export of all meanings with columns: meaning label, categories, first use date, last use date, active status, linked word forms

### PWA

- [ ] **PWA-01**: App works fully offline after first load; vite-plugin-pwa generates a Workbox service worker that precaches all assets; `navigateFallback` is null (hash routing handles all navigation)
- [ ] **PWA-02**: PWA manifest is correctly configured with app name "Little Words", theme color, icons at required sizes, `start_url: '/#/'`, and `display: 'standalone'`; app is installable on Android and iOS
- [ ] **PWA-03**: When a new service worker version is available, a toast notification prompts the user to refresh; the `onNeedRefresh` Workbox hook triggers this prompt

## v2 Requirements

### Gestures

- **GEST-01**: Parent can record a gesture with description, first observed date, last observed date, and notes
- **GEST-02**: Gestures appear in the Doctor Report under "Observed Gestures"
- **GEST-03**: Gestures view shows all recorded gestures

### Usage Type Tracking

- **USAGE-01**: Each meaning records whether its first or typical use is Spontaneous or Imitated (clinical SLP terminology)
- **USAGE-02**: Spontaneous vs. Imitated split is included in the Doctor Report

### Enhanced Dashboard

- **DASH-V2-01**: Recently Added Meanings section showing the last 3–5 entries

### Deployment

- **DEPLOY-01**: GitHub Actions workflow automatically deploys to `gh-pages` branch on push to `main`

### Future

- **SRCH-01**: Search across word forms and meanings
- **CAT-01**: User-defined custom categories
- **REPT-01**: PDF Doctor Report export
- **MEDIA-01**: Photo attachments on word forms or meanings
- **AUDIO-01**: Audio clip attachments
- **MULTI-01**: Multiple child profiles
- **BACKUP-01**: Cloud backup (OneDrive or similar)
- **COMBO-01**: Two-word combination tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Developmental norms / milestone comparison | App is not a diagnostic tool; never compares children against standards |
| User accounts / login | No backend; parent owns all data locally |
| Backend server | Privacy-first; all data stays on device |
| Analytics / tracking | No analytics, no advertising, no telemetry |
| Multi-device sync | No backend; JSON export is the explicit migration path |
| Occurrence logging (every use) | Only first + last date tracked; reduces burden, encourages sustained use |

## Traceability

*Updated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| ONBD-01 | Phase 2 | Pending |
| ONBD-02 | Phase 2 | Pending |
| ONBD-03 | Phase 2 | Pending |
| ONBD-04 | Phase 2 | Pending |
| ENTRY-01 | Phase 2 | Pending |
| ENTRY-02 | Phase 2 | Pending |
| ENTRY-03 | Phase 2 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| BROWSE-01 | Phase 3 | Pending |
| BROWSE-02 | Phase 3 | Pending |
| BROWSE-03 | Phase 3 | Pending |
| BROWSE-04 | Phase 3 | Pending |
| REPORT-01 | Phase 4 | Pending |
| REPORT-02 | Phase 4 | Pending |
| DATA-01 | Phase 4 | Pending |
| DATA-02 | Phase 4 | Pending |
| DATA-03 | Phase 4 | Pending |
| PWA-01 | Phase 5 | Pending |
| PWA-02 | Phase 5 | Pending |
| PWA-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-30*
*Last updated: 2026-06-30 after initial definition*
