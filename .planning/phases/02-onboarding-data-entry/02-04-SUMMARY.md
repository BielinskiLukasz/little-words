---
phase: 02-onboarding-data-entry
plan: "04"
subsystem: ui
tags: [react, zustand, dexie, dexie-react-hooks, useLiveQuery, shadcn, tailwind, i18n, tdd, add-entry, FAB]

requires:
  - phase: 02-01
    provides: Shadcn Sheet, Badge, Zustand UIState with addWordSheetOpen, i18n addWord.* keys
  - phase: 02-02
    provides: addWordEntry orchestrator, searchMeanings (startsWithIgnoreCase), findOrCreateWordForm

provides:
  - AddEntryFAB: fixed-position FAB button (bottom-20 right-4 z-50) opening sheet via useUIStore
  - AddEntrySheet: Shadcn Sheet side=bottom h-[90dvh] with word form + meaning rows + save button
  - WordFormInput: plain text input + debounced 500ms existing-meanings preview via useLiveQuery
  - MeaningAutocomplete: absolute dropdown from useMeaningSearch with Create new option
  - MeaningInput: composes MeaningAutocomplete + date input + CategoryChips per meaning row
  - CategoryChips: horizontal scroll overflow-x-auto flex-nowrap, all 14 CATEGORIES, multi-select Badge
  - useAddEntry hook: manages wordForm + meaningRows state; calls addWordEntry; closes sheet on success
  - useMeaningSearch hook: 500ms debounce; useLiveQuery startsWithIgnoreCase limit(10)
  - RootLayout updated: AddEntryFAB + AddEntrySheet rendered before BottomNav

affects:
  - 02-05-settings (SettingsPage builds on same Zustand + layout patterns)
  - 03 (Dashboard, Meanings, Word Forms pages will display entries saved via this flow)

tech-stack:
  added: []
  patterns:
    - "FAB pattern: fixed bottom-20 right-4 z-50 rounded-full above BottomNav (h-16)"
    - "Zustand selector in component: useUIStore((s) => s.fieldName) — avoids re-renders on unrelated state changes"
    - "useLiveQuery for reactive preview: sub-component scope keeps Dexie access local; debounced state drives query key"
    - "Category type safety: CategoryChips accepts Category[] (not string[]) to satisfy strict TypeScript build"
    - "Zustand mock in tests: vi.mock with selector function support (selector ? selector(state) : state)"

key-files:
  created:
    - src/features/add-entry/components/AddEntryFAB.tsx — fixed-position Plus button; opens sheet via useUIStore
    - src/features/add-entry/components/AddEntrySheet.tsx — Shadcn Sheet (side=bottom h-[90dvh]); full add-entry form
    - src/features/add-entry/components/WordFormInput.tsx — text input + ExistingMeaningsPreview sub-component (debounced useLiveQuery)
    - src/features/add-entry/components/MeaningInput.tsx — composes MeaningAutocomplete + date input + CategoryChips
    - src/features/add-entry/components/MeaningAutocomplete.tsx — absolute dropdown from useMeaningSearch; Create new option
    - src/features/add-entry/components/CategoryChips.tsx — horizontal scroll, 14 CATEGORIES, Badge variant toggle
    - src/features/add-entry/hooks/useAddEntry.ts — MeaningRowState interface; wordForm + meaningRows state; handleSave
    - src/features/add-entry/hooks/useMeaningSearch.ts — 500ms debounce; startsWithIgnoreCase limit(10)
    - src/features/add-entry/hooks/useAddEntry.test.ts — 7 tests for useAddEntry hook
    - src/features/add-entry/hooks/useMeaningSearch.test.ts — 5 tests for useMeaningSearch hook
  modified:
    - src/shared/components/RootLayout.tsx — AddEntryFAB + AddEntrySheet inserted before BottomNav

key-decisions:
  - "CategoryChips uses Category[] (typed union) for value/onChange props — required for strict tsc -b build; string[] would fail with MeaningRowState.categories"
  - "ExistingMeaningsPreview is a separate sub-component inside WordFormInput — keeps useLiveQuery scoped to the preview only, avoids re-rendering entire input on DB changes"
  - "useMeaningSearch clears debouncedPrefix immediately on empty input (not debounced) — prevents stale suggestions shown while input is clearing (Pitfall 2 in RESEARCH.md)"
  - "Zustand test mock uses selector function pattern: vi.fn((selector?) => selector ? selector(state) : state) — supports both selector and full-store call styles"

patterns-established:
  - "Feature directory structure: src/features/{feature}/components/ + src/features/{feature}/hooks/"
  - "ExistingMeaningsPreview sub-component: isolate useLiveQuery in scope-limited sub-components to avoid rendering the parent on every DB change"
  - "CategoryChips with Category[] type: always use the schema union type for category arrays, not string[], in all future components"

requirements-completed:
  - ENTRY-01
  - ENTRY-02
  - ENTRY-03

coverage:
  - id: D1
    description: "AddEntryFAB renders as fixed-position button (bottom-20 right-4 z-50) opening AddEntrySheet via useUIStore.setAddWordSheetOpen(true)"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "grep -c 'bottom-20' src/features/add-entry/components/AddEntryFAB.tsx = 1"
        status: pass
      - kind: unit
        ref: "grep -c 'AddEntryFAB' src/shared/components/RootLayout.tsx >= 1"
        status: pass
    human_judgment: false
  - id: D2
    description: "AddEntrySheet is a Shadcn Sheet side=bottom h-[90dvh] with word form input, meaning rows, + Add another meaning, and Save button"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "npx tsc --noEmit exits 0; npm run build exits 0"
        status: pass
    human_judgment: true
    rationale: "Sheet visibility and scroll behavior require browser rendering — TypeScript types alone cannot verify the mobile layout"
  - id: D3
    description: "useAddEntry manages wordForm + meaningRows state; handleSave calls addWordEntry and closes sheet on success; error state set on failure"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "src/features/add-entry/hooks/useAddEntry.test.ts — 7 tests passed"
        status: pass
    human_judgment: false
  - id: D4
    description: "WordFormInput shows debounced 500ms existing-meanings preview below input via useLiveQuery on wordForms + wordFormMeanings + meanings"
    requirement: ENTRY-02
    verification:
      - kind: unit
        ref: "npx tsc --noEmit exits 0; preview sub-component uses useLiveQuery with debouncedValue"
        status: pass
    human_judgment: true
    rationale: "Debounce timing and preview text rendering require browser interaction to verify (D-13 from CONTEXT.md)"
  - id: D5
    description: "useMeaningSearch returns Meaning[] for prefix matches (startsWithIgnoreCase, limit 10); clears immediately on empty input; returns undefined while loading"
    requirement: ENTRY-02
    verification:
      - kind: unit
        ref: "src/features/add-entry/hooks/useMeaningSearch.test.ts — 5 tests passed"
        status: pass
      - kind: unit
        ref: "grep -c 'limit(10)' src/features/add-entry/hooks/useMeaningSearch.ts = 2 (declaration + call)"
        status: pass
      - kind: unit
        ref: "grep -c 'startsWithIgnoreCase' src/features/add-entry/hooks/useMeaningSearch.ts = 1"
        status: pass
    human_judgment: false
  - id: D6
    description: "MeaningAutocomplete shows up to 10 suggestions from useMeaningSearch; shows Create new option when no exact match; clears when input is empty"
    requirement: ENTRY-02
    verification:
      - kind: unit
        ref: "npx tsc --noEmit exits 0; component renders null when meaningText is empty or suggestions empty"
        status: pass
    human_judgment: true
    rationale: "Autocomplete dropdown positioning and Create new option visibility require browser interaction to verify"
  - id: D7
    description: "CategoryChips renders all 14 CATEGORIES with horizontal scroll (overflow-x-auto flex-nowrap); Badge variant toggles default/outline on click; multi-select supported"
    requirement: ENTRY-03
    verification:
      - kind: unit
        ref: "grep -c 'CATEGORIES' src/features/add-entry/components/CategoryChips.tsx >= 1"
        status: pass
      - kind: unit
        ref: "grep -c 'overflow-x-auto' src/features/add-entry/components/CategoryChips.tsx = 1"
        status: pass
      - kind: unit
        ref: "grep -c 'flex-nowrap' src/features/add-entry/components/CategoryChips.tsx = 1"
        status: pass
    human_judgment: false
  - id: D8
    description: "73 tests pass (11 test files); TypeScript clean; production build succeeds (633kB JS bundle)"
    verification:
      - kind: unit
        ref: "npx vitest run: 11 test files, 73 tests passed"
        status: pass
      - kind: unit
        ref: "npx tsc --noEmit: exit 0"
        status: pass
      - kind: unit
        ref: "npm run build: built in 13.82s, 633kB JS"
        status: pass
    human_judgment: false

duration: 57min
completed: "2026-07-01"
status: complete
---

# Phase 02 Plan 04: Add Entry Vertical Slice Summary

**FAB + bottom sheet word-entry form: floating action button in RootLayout opens a 90dvh Shadcn Sheet with word form input (debounced existing-meanings preview), meaning autocomplete (startsWithIgnoreCase, limit 10), horizontal category chips (14 CATEGORIES, multi-select), multi-meaning rows, and save via addWordEntry service**

## Performance

- **Duration:** ~57 min
- **Started:** 2026-06-30T22:49:19Z
- **Completed:** 2026-07-01T00:46:00Z
- **Tasks:** 2 (Task 1: FAB + sheet + word form + hooks; Task 2: meaning autocomplete + category chips)
- **Files modified:** 11 files (10 created, 1 modified)

## Accomplishments

- `AddEntryFAB`: fixed-position `bottom-20 right-4 z-50 rounded-full` button with Plus icon; reads `t('addWord.title')` for aria-label; `setAddWordSheetOpen(true)` on click; renders in RootLayout above BottomNav
- `AddEntrySheet`: Shadcn `Sheet` side="bottom" h-[90dvh]; scrollable content area with WordFormInput, MeaningInput rows, "+ Add another meaning" ghost button, sticky Save button
- `WordFormInput`: plain text input + `ExistingMeaningsPreview` sub-component — debounced 500ms useLiveQuery joins wordForms → wordFormMeanings → meanings to show "already linked to: [meanings]" text
- `useAddEntry`: manages `wordForm: string` + `meaningRows: MeaningRowState[]` state; `addMeaningRow()`, `updateMeaningRow(id, partial)`, `handleSave()` → calls `addWordEntry` service → closes sheet on success; tracks `isLoading` and `error`
- `MeaningAutocomplete`: absolute dropdown (top-full) from `useMeaningSearch`; each suggestion clickable; "Create new meaning" option at bottom when no exact match; renders nothing when input is empty
- `useMeaningSearch`: 500ms debounce (clears immediately on empty); `useLiveQuery` with `startsWithIgnoreCase(prefix).limit(10)` — implements T-02-04-D1 denial-of-service protection
- `CategoryChips`: `overflow-x-auto -mx-1 px-1` wrapper + `flex gap-2 flex-nowrap pb-1` inner; all 14 `CATEGORIES` as `Badge` with variant toggle `default`/`outline` on click; typed as `Category[]` (not `string[]`)
- `MeaningInput`: composes MeaningAutocomplete + `<input type="date">` + CategoryChips into a bordered card per meaning row; `onSelect` wires autocomplete to `row.text`
- RootLayout updated: `<AddEntryFAB />` and `<AddEntrySheet />` inserted as siblings after `<main>` before `<BottomNav />`
- 12 new tests across 2 test files (7 useAddEntry + 5 useMeaningSearch); 73 total tests pass

## Task Commits

TDD RED→GREEN cycle:

1. **RED (test): failing tests for useAddEntry hook** — `912c7c0` (test)
2. **GREEN (feat): FAB + bottom sheet + word form input + useAddEntry hook** — `7959c7d` (feat)
3. **RED (test): failing tests for useMeaningSearch hook** — `222fe1e` (test)
4. **GREEN (feat): meaning autocomplete + category chips + multi-meaning form** — `3fdfe87` (feat)

## Files Created/Modified

**Created:**
- `src/features/add-entry/components/AddEntryFAB.tsx` — fixed-position FAB button
- `src/features/add-entry/components/AddEntrySheet.tsx` — bottom sheet with full add-entry form
- `src/features/add-entry/components/WordFormInput.tsx` — text input + debounced existing-meanings preview
- `src/features/add-entry/components/MeaningInput.tsx` — meaning row: autocomplete + date + chips
- `src/features/add-entry/components/MeaningAutocomplete.tsx` — dropdown from useMeaningSearch
- `src/features/add-entry/components/CategoryChips.tsx` — horizontal scrollable category multi-select
- `src/features/add-entry/hooks/useAddEntry.ts` — form state + addWordEntry orchestration
- `src/features/add-entry/hooks/useMeaningSearch.ts` — debounced Dexie reactive hook
- `src/features/add-entry/hooks/useAddEntry.test.ts` — 7 unit tests
- `src/features/add-entry/hooks/useMeaningSearch.test.ts` — 5 unit tests

**Modified:**
- `src/shared/components/RootLayout.tsx` — AddEntryFAB + AddEntrySheet added before BottomNav

## Decisions Made

- **CategoryChips uses `Category[]` (typed union) not `string[]`**: `tsc -b` (strict build) rejects `string[]` when `MeaningRowState.categories` is `Category[]`. Using the schema union type avoids a type cast at every call site.
- **ExistingMeaningsPreview is a sub-component**: `useLiveQuery` is isolated inside the preview sub-component scope so only the preview re-renders on DB changes — not the entire WordFormInput.
- **useMeaningSearch clears debouncedPrefix immediately on empty input**: Per Pitfall 2 in RESEARCH.md — clearing is not debounced to prevent stale suggestions appearing while the user deletes their text.
- **Zustand test mock with selector support**: `vi.fn((selector?) => selector ? selector(state) : state)` allows tests to work whether the hook uses the full-store pattern or the selector pattern. Required `as any` cast to satisfy strict TS mock typing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CategoryChips props typed string[] caused build failure**
- **Found during:** Task 2 GREEN verification (`npm run build`)
- **Issue:** `CategoryChips` defined `value: string[]` and `onChange: (categories: string[]) => void`. In `MeaningInput`, calling `onChange({ categories })` where `categories` is `Category[]` (from `MeaningRowState`) caused `tsc -b` error: `Type 'string[]' is not assignable to type 'Category[]'`.
- **Fix:** Changed `CategoryChips` props to `value: Category[]` and `onChange: (categories: Category[]) => void`; added `import type { Category }` from `@/db/types`.
- **Files modified:** `src/features/add-entry/components/CategoryChips.tsx`
- **Verification:** `npm run build` exits 0.
- **Committed in:** `3fdfe87` (Task 2 GREEN commit)

**2. [Rule 1 - Bug] useAddEntry.test.ts Zustand mock signature incompatible with strict TypeScript**
- **Found during:** Task 2 GREEN verification (`npm run build`)
- **Issue:** `vi.mocked(useUIStore).mockImplementation((selector?: (s: unknown) => unknown) => ...)` failed strict TypeScript because the actual Zustand store overload uses `(selector: (state: UIState) => unknown)` — `UIState` is not assignable to `unknown` at the parameter position.
- **Fix:** Added `as any` cast on the `mockImplementation` call and used `(s: any)` in the lambda. `eslint-disable` comment added for clarity.
- **Files modified:** `src/features/add-entry/hooks/useAddEntry.test.ts`
- **Verification:** `npm run build` exits 0; 73 tests pass.
- **Committed in:** `3fdfe87` (Task 2 GREEN commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes necessary for correctness and type safety. No scope creep.

## Issues Encountered

- Initial `useMeaningSearch.test.ts` had a test asserting `toEqual([])` when `useLiveQuery` mock returned `undefined` — the test expectation was wrong (the hook correctly forwards `undefined` loading state). Fixed the assertion to `toBeUndefined()`.

## Known Stubs

None — all components are fully implemented with real Dexie queries and service calls.

## Threat Flags

No new threat surface beyond the plan's threat model. All four threats addressed:
- T-02-04-T1: Text stored as plain string in IndexedDB; React JSX auto-escapes all rendered text
- T-02-04-T2: MeaningAutocomplete suggestions come from app's own IndexedDB (device-local); no external data source
- T-02-04-I1: Category selection state is ephemeral; only persisted to IndexedDB on save
- T-02-04-D1: `useMeaningSearch` applies `.limit(10)` cap on every Dexie query

## Next Phase Readiness

- FAB and Add Entry form are live in the app on all main screens (Dashboard, Meanings, Word Forms)
- Word entries can be saved and persist across page reload via IndexedDB
- `useAddEntry` and `useMeaningSearch` hooks are ready for any future form that needs the same patterns
- Plan 02-05 (Settings) can proceed — all layout and store patterns are established
- No blockers

## Self-Check: PASSED

- `src/features/add-entry/components/AddEntryFAB.tsx` — FOUND
- `src/features/add-entry/components/AddEntrySheet.tsx` — FOUND
- `src/features/add-entry/components/WordFormInput.tsx` — FOUND
- `src/features/add-entry/components/MeaningInput.tsx` — FOUND
- `src/features/add-entry/components/MeaningAutocomplete.tsx` — FOUND
- `src/features/add-entry/components/CategoryChips.tsx` — FOUND
- `src/features/add-entry/hooks/useAddEntry.ts` — FOUND
- `src/features/add-entry/hooks/useMeaningSearch.ts` — FOUND
- `src/shared/components/RootLayout.tsx` AddEntryFAB — FOUND
- Commits 912c7c0 (RED test), 7959c7d (GREEN feat), 222fe1e (RED test), 3fdfe87 (GREEN feat) — FOUND
- Tests: 11 test files, 73 tests passed
- TypeScript: `npx tsc --noEmit` exits 0
- Build: `npm run build` exits 0 (633kB bundle)

---
*Phase: 02-onboarding-data-entry*
*Completed: 2026-07-01*
