# Roadmap: Little Words

## Overview

Little Words ships in five vertical phases. Phase 1 locks the immutable decisions (Vite base path, Dexie schema version, hash routing) that cannot be changed after first deploy. Phase 2 makes the app usable — a parent can create a child profile and log their first word. Phase 3 validates the data model through read-only browse views. Phase 4 delivers the primary value moment: the Doctor Report and data portability. Phase 5 hardens offline capability, PWA installability, and the service worker update flow.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Immutable scaffold: Vite base path, Dexie schema v1, i18n, hash router shell
- [ ] **Phase 2: Onboarding & Data Entry** - App becomes usable: child profile wizard and FAB → bottom sheet word entry
- [ ] **Phase 3: Browse Views** - Read-only aggregations validating the data model across all list and detail views
- [ ] **Phase 4: Doctor Report & Data Management** - Primary value delivery: report to clipboard, JSON/CSV export and import
- [ ] **Phase 5: PWA Polish** - Full offline capability, installability, service worker update prompt, manifest verification

## Phase Details

### Phase 1: Foundation
**Goal**: Project is scaffolded with all immutable decisions locked — Vite base path, Dexie schema v1, i18n type safety, and hash-based router shell are in place before any feature is built.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. `npm run build` produces a `dist/` where all asset paths start with `/little-words/` — deployment to GitHub Pages works without path errors
  2. Dexie schema v1 is defined with all entities (ChildProfile, WordForm, Meaning, WordFormMeaning) and TypeScript interfaces compile without errors
  3. `t('meaning', { count: 2 })` returns the correct Polish plural form (_few) in both dev and preview builds
  4. Navigating to `/#/dashboard` lands on the correct route; navigating to `/#/` redirects to onboarding when no child profile exists
**Plans**: 5 plans
Plans:
- [x] 01-01-PLAN.md — Vite scaffold, dependencies, Shadcn/UI init, Tailwind v4 OKLCH theme, Vitest config
- [x] 01-02-PLAN.md — Dexie schema v1: 4 entities, TypeScript interfaces, service stubs, schema tests
- [x] 01-03-PLAN.md — react-i18next init: Polish default, locale files, TypeScript augmentation, i18n tests
- [x] 01-04-PLAN.md — Hash router, RootLayout, BottomNav (4 tabs), 9 page stubs, folder skeleton
- [x] 01-05-PLAN.md — ErrorBoundary, AppGate (useLiveQuery gate), main.tsx import order, App tests
**UI hint**: yes

### Phase 2: Onboarding & Data Entry
**Goal**: A parent can open the app for the first time, create a child profile, and log their first word form with meanings — the app is no longer a blank shell.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ENTRY-01, ENTRY-02, ENTRY-03
**Success Criteria** (what must be TRUE):
  1. A new visitor cannot reach any main app screen until the onboarding wizard is completed with child name, birth date, and at least one home language
  2. After completing onboarding, the parent can tap the FAB, fill in a word form and meaning, select categories, and save — the entry persists across page reloads
  3. When typing a meaning, previously entered meanings appear as autocomplete suggestions; choosing one links the word form to an existing meaning without creating a duplicate
  4. On iOS, after the first word is saved, the parent sees an instruction to add the app to the Home Screen framed as a data-protection step
**Plans**: 5 plans
Plans:
- [ ] 02-01-PLAN.md — Setup: install react-hook-form/zod/date-fns, add Shadcn Sheet/Collapsible/Badge/Calendar, extend Zustand store, populate i18n locale files
- [ ] 02-02-PLAN.md — Service layer TDD: findOrCreateWordForm, searchMeanings, addWordEntry orchestrator with atomicity and storage persist
- [ ] 02-03-PLAN.md — Onboarding vertical slice: wizard form, LanguageChips, MedicalContextSection, WelcomeScreen, ProfileEditPage
- [ ] 02-04-PLAN.md — Add-entry vertical slice: FAB, bottom sheet, MeaningAutocomplete, CategoryChips, multi-meaning form
- [ ] 02-05-PLAN.md — Settings screen: Language switcher, Profile edit link, Data placeholders, About; iOS install prompt; Dashboard greeting
**UI hint**: yes

### Phase 3: Browse Views
**Goal**: A parent can review all entered data through the Dashboard, Meanings, Word Forms, Categories, and Timeline views — the full data model is observable and editable.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, BROWSE-01, BROWSE-02, BROWSE-03, BROWSE-04
**Success Criteria** (what must be TRUE):
  1. The Dashboard prominently displays the Active Meanings count; secondary cards show Active Word Forms, New Meanings This Month, and a "Review these?" section listing meanings unused for 30+ days
  2. The Meanings list is scrollable; tapping a meaning opens a detail page where the parent can see linked word forms, dates, categories, and toggle Active/Inactive
  3. The Word Forms list is scrollable; tapping a word form opens a detail page showing all linked meanings; deleting the word form removes the link but the meaning survives
  4. The Categories view shows each default category with its meaning count; tapping a category filters to that category's meanings
  5. The Timeline view displays monthly vocabulary growth as both a chart and a data table
**Plans**: TBD
**UI hint**: yes

### Phase 4: Doctor Report & Data Management
**Goal**: A parent can generate a structured Doctor Report and copy it to clipboard in one tap, and can export or import all app data from Settings.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: REPORT-01, REPORT-02, DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Tapping "Generate Report" produces a plain-text summary containing child name, computed age, active/inactive meaning counts, new meanings in last 3 months, active word form count, top 3 categories, languages, medical flags, parent notes, and report date
  2. Tapping "Copy to clipboard" copies the full report text and a toast confirms success
  3. From Settings → Data, the parent can export all data as a JSON file containing a `schemaVersion` field and all entities
  4. From Settings → Data, the parent can import a previously exported JSON file; a warning is shown that existing data will be replaced; data is fully restored after import
  5. From Settings → Data, the parent can export all meanings as a CSV with meaning label, categories, first/last use dates, active status, and linked word forms
**Plans**: TBD

### Phase 5: PWA Polish
**Goal**: The app works fully offline after first load, is installable on Android and iOS, and notifies the user when a new version is available.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: PWA-01, PWA-02, PWA-03
**Success Criteria** (what must be TRUE):
  1. After first load, the parent can disable their network connection and continue using the app without any errors or missing assets
  2. On Android, the browser offers an "Add to Home Screen" / install prompt; on iOS, the app can be added via Share → Add to Home Screen and launches in standalone mode
  3. When a new version of the app is deployed, a toast notification appears prompting the parent to refresh; tapping it reloads to the new version
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete | 2026-06-30 |
| 2. Onboarding & Data Entry | 0/TBD | Not started | - |
| 3. Browse Views | 0/TBD | Not started | - |
| 4. Doctor Report & Data Management | 0/TBD | Not started | - |
| 5. PWA Polish | 0/TBD | Not started | - |
