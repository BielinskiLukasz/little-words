# Phase 6: Pre-release Polish - Context

**Gathered:** 2026-09-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 closes all blocking issues before the 1.0 release. It delivers:
1. **Dexie v3 schema migration** — `firstObservationDate`, `lastUsedDate`, `isActive` move to `WordFormMeaning` (pair-level); `Meaning` retains aggregated versions
2. **Editing** — inline edit on Meaning detail (text + categories + per-pair fields); inline edit on Word Form detail (form text + per-pair fields)
3. **UI bug fixes** — categories i18n in Meaning detail, word-form navigation in Meaning detail, dashboard stat card navigation
4. **Pairs screen** — new bottom nav tab listing all word-form↔meaning pairs with expandable rows and dual navigation chips
5. **Report enhancements** — age as "X years Y months", per-category meaning list with word-form counts, most-recent additions section, inactive section with 5 most-forgotten meanings

Out of scope: gestures (v2), spontaneous/imitated tracking (v2), search/filter, custom categories.

</domain>

<decisions>
## Implementation Decisions

### Schema v3 Migration

- **D-01:** `WordFormMeaning` gains 3 new fields: `firstObservationDate` (ISO 8601 string), `lastUsedDate` (ISO 8601 string), `isActive` (boolean). Schema updated to `db.version(3).stores({ wordFormMeanings: '++id,[wordFormId+meaningId],wordFormId,meaningId' }).upgrade(tx => ...)`. — **Reversibility: one-way** — Dexie schema versions cannot be decremented; a v3→v2 rollback requires a full database wipe or a separate v4 reverse migration.

- **D-02:** `Meaning` retains its existing fields (`firstUseDate`, `lastUseDate`, `isActive`, `categories`, `text`) but they become **aggregated** from the linked pairs. Aggregation rules:
  - `Meaning.isActive = true` if ANY linked `WordFormMeaning.isActive` is `true`
  - `Meaning.lastUseDate = max(linked pairs' lastUsedDate)`
  - `Meaning.firstUseDate = min(linked pairs' firstObservationDate)`
  - `Meaning.categories` stays a direct field on Meaning (not aggregated from pairs)
  - Service layer handles aggregation on every pair write — `Meaning` fields must be kept in sync.

- **D-03:** Dexie v3 `upgrade()` migration copies existing Meaning values to all linked pairs: `pair.firstObservationDate = meaning.firstUseDate`, `pair.lastUsedDate = meaning.lastUseDate`, `pair.isActive = meaning.isActive`. Meanings with no linked pairs are left unchanged (edge case — should not exist in practice).

- **D-04:** `AddEntrySheet` date input now explicitly sets `pair.firstObservationDate` on the new `WordFormMeaning` row. Historical backdating is supported — parent can enter a date before today. After saving, service layer aggregates `Meaning.firstUseDate` from the pair.

### Edit UX

- **D-05:** Meaning detail page uses inline tap-to-edit. An **Edit** button at the top of the page enters edit mode. In edit mode: meaning text becomes a text input, category chips become toggleable (same `CategoryChips` component). A **Save** button commits. Cancel returns to read mode without saving. — **Reversibility: reversible**

- **D-06:** Per-pair rows on Meaning detail (the linked word forms section): each row expands on tap to reveal pair metadata — `firstObservationDate` (`<input type="date">`), `lastUsedDate` (`<input type="date">`), `isActive` (Switch). A navigation arrow `→` at the right of the collapsed row navigates to `/word-forms/:id`. Pair field changes save immediately (no separate Save button per pair).

- **D-07:** Word Form detail page: **Edit** button enters inline edit mode for the form text (text input, same pattern as D-05). Per-pair rows (linked meanings section) expand on tap to show pair dates + isActive + navigation arrow `→` to `/meanings/:id`. Pair field changes save immediately.

- **D-08:** All date inputs on edit/pair rows use `<input type="date">` — consistent with the onboarding birth date input pattern. No Popover/Calendar component for dates.

### Report Enhancements

- **D-09:** Age display: always format as "X years Y months" regardless of whether months is 0 (e.g., "2 years 0 months", "2 years 10 months", "14 months" for children under 1 year — under 12 months show months only). The current threshold (< 2 years → months only) is replaced by: < 12 months → "X months"; ≥ 12 months → "X years Y months". — **Reversibility: reversible**

- **D-10:** New report section: **Per-category meaning list** — for each category that has at least 1 active meaning, list all active meaning texts under that category label, with word-form count in parentheses (e.g., `  - banana (3 forms)`). Sorted alphabetically within each category.

- **D-11:** New report section: **5 most recently added meanings** — sorted by `firstUseDate` descending (or by `min(pair.firstObservationDate)` after v3 migration), showing the 5 most recently first-observed meanings.

- **D-12:** Inactive section enhancement: show count + list of **5 most-recently-forgotten meanings** — meanings where `isActive = false`, sorted by `lastUseDate` descending (most recently used, now inactive). Label: "Recently forgotten (last 5)".

### Pairs Screen

- **D-13:** New 5th bottom nav tab. Updated tab order: Dashboard | Meanings | Word Forms | Pairs | More. `BottomNav` component updated; new route `/#/pairs` → `PairsPage.tsx`. — **Reversibility: costly** — nav restructure touches `BottomNav.tsx`, `RootLayout.tsx`, router index, and all navigation-related tests.

- **D-14:** Each row in the Pairs list shows two tappable chips side by side: **[word form text]** chip (navigates to `/word-forms/:id`) and **[meaning text]** chip (navigates to `/meanings/:id`). The row is collapsible — tapping the row body (not a chip) expands to reveal: firstObservationDate, lastUsedDate, isActive badge.

- **D-15:** Sort selector (same pattern as Meanings and Word Forms list views): 3 options — "Newest first" (by `firstObservationDate` descending), "A–Z by word form", "A–Z by meaning". Default: newest first.

### UI Bug Fixes

- **D-16:** `MeaningDetailPage` — category badges render `t('category.' + cat)` instead of raw `cat`. No UI structure change.

- **D-17:** Dashboard stat cards (Active Meanings, Active Word Forms, New This Month) — each card wrapped in `<Link>` navigating to `/meanings`, `/word-forms`, and `/meanings` (filtered by new-this-month) respectively. Same visual appearance; tap now navigates.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data Model
- `src/db/schema.ts` — current TypeScript interfaces for `WordForm`, `Meaning`, `WordFormMeaning`, `ChildProfile`; `CATEGORIES` constant
- `src/db/db.ts` — Dexie `AppDB` class with current schema versions (v1→v2); v3 upgrade goes here
- `src/db/services/meaning.service.ts` — existing meaning service; aggregation logic must be added here
- `src/db/services/wordForm.service.ts` — existing word form service

### Phase Requirements
- `.planning/ROADMAP.md` §Phase 6 — Phase goal and 5 success criteria
- `.planning/REQUIREMENTS.md` §Browse Views — BROWSE-01, BROWSE-02 (detail page requirements that editing fulfils)

### UI Patterns & Components
- `src/features/onboarding/components/OnboardingWizard.tsx` — `<input type="date">` pattern (reuse for all date fields)
- `src/features/add-entry/components/AddEntrySheet.tsx` — current add-entry form; D-04 requires updating the date field to write to the pair
- `src/features/add-entry/components/CategoryChips.tsx` — reuse for inline category editing on Meaning detail
- `src/shared/components/BottomNav.tsx` — add 5th Pairs tab here
- `src/router/index.tsx` — add `/pairs` route here
- `src/pages/MeaningsPage.tsx` — sort toggle pattern to replicate in PairsPage
- `src/i18n/locales/pl/common.json` and `src/i18n/locales/en/common.json` — all new i18n keys go here

### Architecture
- `.planning/PROJECT.md` §Constraints — GitHub Pages, hash routing, IndexedDB only
- `.planning/phases/03-browse-views/03-CONTEXT.md` — established detail page pattern, sort toggle pattern
- `.planning/phases/04-doctor-report-data-management/04-CONTEXT.md` — established report generator pattern; report text must stay copy-pasteable plain text

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/add-entry/components/CategoryChips.tsx` — existing multi-select chips for categories; reuse directly in inline edit mode on Meaning detail
- `src/components/ui/switch.tsx` — existing Switch; use for per-pair isActive toggle in expanded rows
- `src/components/ui/badge.tsx` — existing Badge; use for active/inactive status indicator in Pairs list
- `src/components/ui/button.tsx` — existing Button variants (ghost, outline, destructive)
- `src/features/doctor-report/services/reportGenerator.ts` — current report generator; extend in place
- `src/pages/MeaningsPage.tsx` — sort toggle (newest/alpha) pattern to copy for Pairs sort selector
- `src/i18n/locales/pl/common.json` `category.*` keys — already defined; fixes D-16 (currently rendered but category text not passed through `t()`)

### Established Patterns
- Service layer: all IndexedDB reads/writes through `src/db/services/`; never direct Dexie calls from components
- `useLiveQuery` from `dexie-react-hooks` — reactive data in all page components
- `useTranslation('common')` — all user-visible strings via i18n
- Sonner toast for user feedback (import `toast` from `sonner`)
- Inline date input: `<input type="date">` with Tailwind border/rounded/focus-ring styling (see OnboardingWizard.tsx:99-106)
- `useNavigate` + `useParams` for detail page routing (see existing detail pages)
- `finally` block pattern for UI state reset on save/delete (see AddEntrySheet, MeaningDetailPage)

### Integration Points
- `src/db/db.ts` — add `version(3).stores({...}).upgrade(tx => ...)` block
- `src/db/schema.ts` — add `firstObservationDate`, `lastUsedDate`, `isActive` to `WordFormMeaning` interface
- `src/features/add-entry/components/AddEntrySheet.tsx` — date input must write to `WordFormMeaning.firstObservationDate` (not `Meaning.firstUseDate`)
- `src/pages/MeaningDetailPage.tsx` — major update: inline edit mode + expandable per-pair rows
- `src/pages/WordFormDetailPage.tsx` — major update: inline edit mode + expandable per-pair rows
- `src/pages/DashboardPage.tsx` — wrap stat cards in `<Link>`
- `src/shared/components/BottomNav.tsx` — add Pairs tab
- `src/router/index.tsx` — add `/pairs` route

### Critical Notes
- `Meaning.isActive` aggregation must be recalculated on every `WordFormMeaning` write (create, update, delete) — service layer must update the parent `Meaning` row atomically in the same transaction
- `WordFormMeaning` compound key `[wordFormId+meaningId]` — v3 upgrade must not touch the key schema; only add new fields
- `flex-1` on calendar day cells (Tailwind v4) — irrelevant after replacing Calendar popover with `<input type="date">`

</code_context>

<specifics>
## Specific Ideas

- Inline edit mode UX: entering edit mode on Meaning detail should not change the page layout significantly — the text becomes a text input in place, category chips gain a toggle ring. The page header area gets Edit/Save/Cancel buttons rather than moving to a separate screen.
- Pairs screen row: the two chips sit on one line; below them (when expanded) a compact two-column grid shows dates and isActive. The Collapsible Shadcn component (`src/components/ui/collapsible.tsx`) is already installed — use it for expand/collapse.
- Report age format: use `date-fns` `differenceInMonths` for total months, then compute `years = Math.floor(totalMonths / 12)`, `remainingMonths = totalMonths % 12`. For < 12 months: show months only.
- Per-pair saves: debounce or blur-triggered save on date inputs (same pattern as `handleNotesBlur` in `DoctorReportPage.tsx`) to avoid a save on every keystroke.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 6-pre-release-polish*
*Context gathered: 2026-09-02*
