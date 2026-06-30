---
phase: 02-onboarding-data-entry
plan: "02"
subsystem: database
tags: [dexie, indexeddb, service-layer, tdd, find-or-create, idempotent]

requires:
  - phase: 02-01
    provides: Dexie schema v1 with wordForms, meanings, wordFormMeanings tables and base service stubs

provides:
  - findOrCreateWordForm(formText) — atomic, case-insensitive find-or-create for word forms
  - searchMeanings(prefix) — case-insensitive prefix autocomplete up to 10 results
  - linkMeaningToWordForm(wordFormId, meaningId) — idempotent junction row insert
  - addWordEntry(data) — orchestrator creating word form + meanings + junction rows atomically
  - WordEntryInput, WordEntryMeaningInput, WordEntryResult interfaces
  - Dexie schema v2 with text index on meanings table

affects:
  - 02-03 (onboarding wizard calls addWordEntry for first word entry)
  - 02-04 (add-entry sheet uses findOrCreateWordForm, searchMeanings, addWordEntry)
  - 02-05 (word list reads wordForms; editing paths go through these services)

tech-stack:
  added: []
  patterns:
    - "Dexie schema versioning: bump version number, list all tables again; no .upgrade() needed for index-only additions"
    - "vi.mock with async importOriginal + getter pattern for replacing Dexie singleton in service tests"
    - "findOrCreateWordForm pattern: normalize to lowercase, transaction-wrapped query-then-insert"
    - "Idempotent junction insert: query compound index [A+B] before add()"
    - "navigator.storage.persist() as fire-and-forget optional call after first data entry"

key-files:
  created:
    - src/db/services/wordEntry.service.ts
    - src/db/services/wordForm.service.test.ts
    - src/db/services/meaning.service.test.ts
    - src/db/services/wordEntry.service.test.ts
  modified:
    - src/db/services/wordForm.service.ts
    - src/db/services/meaning.service.ts
    - src/db/services/wordFormMeaning.service.ts
    - src/db/db.ts

key-decisions:
  - "Dexie schema bumped to v2 to add text index on meanings — required for startsWithIgnoreCase prefix search; no data migration needed (index-only change)"
  - "findOrCreateWordForm stores form text normalized to lowercase (not original case) — ensures consistent case-insensitive deduplication"
  - "linkMeaning alias kept as @deprecated export for backward compat; linkMeaningToWordForm is the canonical idempotent version"
  - "navigator.storage.persist() triggered only when total wordFormMeanings count === 1 (first ever entry across app lifetime)"

patterns-established:
  - "Service test isolation: vi.mock('../db') with get db() { return testDb } getter + fresh AppDB in beforeEach"
  - "Schema v2 pattern: repeat all table definitions in version(2).stores() — Dexie requires full re-declaration"

requirements-completed:
  - ENTRY-02
  - ONBD-03
  - ENTRY-01

coverage:
  - id: D1
    description: "findOrCreateWordForm — atomic case-insensitive find-or-create, throws on empty input"
    requirement: ENTRY-02
    verification:
      - kind: unit
        ref: "src/db/services/wordForm.service.test.ts#wordForm.service - findOrCreateWordForm"
        status: pass
    human_judgment: false
  - id: D2
    description: "searchMeanings — case-insensitive prefix match, limit 10, empty string guard"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "src/db/services/meaning.service.test.ts#meaning.service - searchMeanings"
        status: pass
    human_judgment: false
  - id: D3
    description: "linkMeaningToWordForm — idempotent junction row insert via compound index check"
    requirement: ENTRY-02
    verification:
      - kind: unit
        ref: "src/db/services/wordEntry.service.test.ts#wordFormMeaning.service - linkMeaningToWordForm idempotency"
        status: pass
    human_judgment: false
  - id: D4
    description: "addWordEntry orchestrator — creates word form + meanings + junction rows, find-or-create, validates input, triggers storage.persist"
    requirement: ONBD-03
    verification:
      - kind: unit
        ref: "src/db/services/wordEntry.service.test.ts#wordEntry.service - addWordEntry"
        status: pass
    human_judgment: false
  - id: D5
    description: "Dexie schema v2 with text index on meanings table enabling startsWithIgnoreCase queries"
    verification:
      - kind: unit
        ref: "src/db/db.test.ts (all 8 schema tests pass after v2 addition)"
        status: pass
    human_judgment: false

duration: 24min
completed: "2026-06-30"
status: complete
---

# Phase 02 Plan 02: Service Layer — findOrCreateWordForm, searchMeanings, addWordEntry Summary

**Atomic Dexie service layer with case-insensitive find-or-create, prefix autocomplete, idempotent junction inserts, and addWordEntry orchestrator; 55 tests pass (up from 28)**

## Performance

- **Duration:** 24 min
- **Started:** 2026-06-30T21:18:49Z
- **Completed:** 2026-06-30T21:43:05Z
- **Tasks:** 3 (RED, GREEN, REFACTOR)
- **Files modified:** 8

## Accomplishments

- `findOrCreateWordForm` — Dexie transaction-wrapped, normalizes to lowercase, deduplicates on case-insensitive match, throws on empty/whitespace input
- `searchMeanings` — `startsWithIgnoreCase` prefix query, max 10 results, empty-string guard returns `[]` immediately
- `linkMeaningToWordForm` — idempotent: checks compound index `[wordFormId+meaningId]` before insert; `linkMeaning` alias kept for backward compat
- `addWordEntry` orchestrator — validates input, calls find-or-create, creates meanings, links junction rows, triggers `navigator.storage.persist()` after first ever entry
- Dexie schema bumped to v2 to add `text` index on `meanings` table (required for `startsWithIgnoreCase`)
- 3 test files with 27 new tests (55 total, up from 28); full RED→GREEN→REFACTOR TDD cycle

## Task Commits

1. **RED: Failing tests for findOrCreateWordForm, searchMeanings, addWordEntry** — `74d96fe` (test)
2. **GREEN: Implement all service functions** — `266ab90` (feat)
3. **REFACTOR: Clarify storage persist guard comment; fix Category type cast in test** — `a30f142` (refactor)

## Files Created/Modified

- `src/db/db.ts` — schema v2 with `text` index on `meanings` table
- `src/db/services/wordForm.service.ts` — adds `findOrCreateWordForm`
- `src/db/services/meaning.service.ts` — adds `searchMeanings`
- `src/db/services/wordFormMeaning.service.ts` — adds idempotent `linkMeaningToWordForm`; `linkMeaning` becomes `@deprecated` alias
- `src/db/services/wordEntry.service.ts` — new orchestrator with `WordEntryInput`, `WordEntryMeaningInput`, `WordEntryResult` interfaces
- `src/db/services/wordForm.service.test.ts` — 8 tests for `findOrCreateWordForm`
- `src/db/services/meaning.service.test.ts` — 6 tests for `searchMeanings`
- `src/db/services/wordEntry.service.test.ts` — 13 tests for `addWordEntry` and `linkMeaningToWordForm`

## Decisions Made

- **Schema v2 for text index**: `startsWithIgnoreCase` requires an explicit index on `text`. Dexie schema incremented to v2; all table definitions repeated (Dexie requirement). No `.upgrade()` needed — index-only addition.
- **Lowercase normalization in findOrCreateWordForm**: Form text is stored normalized (`form = formText.toLowerCase()`) to make deduplication consistent. The original-case input from UI is lowercased on write.
- **linkMeaning kept as deprecated alias**: The existing `linkMeaning` non-idempotent export is preserved with `@deprecated` JSDoc. Callers from prior phases can migrate when convenient.
- **navigator.storage.persist() at count === 1**: Only fires on the very first junction row in the entire database (not per-call). This matches browser recommendation to request durable storage when meaningful data first exists.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing `text` index on `meanings` table caused SchemaError**
- **Found during:** GREEN phase (running tests after implementing `searchMeanings`)
- **Issue:** `startsWithIgnoreCase` on `text` field requires an IndexedDB index. The v1 schema had `++id, isActive, firstUseDate, lastUseDate, *categories` — no `text` index. Dexie threw `SchemaError: KeyPath text on object store meanings is not indexed`.
- **Fix:** Added Dexie schema v2 with `text` added to the `meanings` index definition. No data migration needed (index-only addition, fake-indexeddb handles upgrade automatically in tests).
- **Files modified:** `src/db/db.ts`
- **Verification:** All 5 previously-failing `searchMeanings` tests now pass; existing 28 tests unaffected.
- **Committed in:** `266ab90` (GREEN phase commit)

**2. [Rule 1 - Bug] TypeScript error: `['Verbs'] as const` assigned to mutable `Category[]`**
- **Found during:** REFACTOR phase (`npm run build` TypeScript check)
- **Issue:** `Array.from(...)` with `categories: ['Verbs'] as const` produces `readonly ["Verbs"]` which is incompatible with `Category[]` (mutable array).
- **Fix:** Changed to `categories: ['Verbs' as const]` — element-level `as const` widened to `Category[]`.
- **Files modified:** `src/db/services/meaning.service.test.ts`
- **Verification:** `npm run build` exits 0.
- **Committed in:** `a30f142` (REFACTOR commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes necessary for correctness and type safety. No scope creep.

## Issues Encountered

- `vi.mock('../db')` with `async importOriginal + get db()` getter pattern required to allow `testDb` variable replacement between `beforeEach` calls — standard `vi.mock` static factory alone cannot see the updated `testDb` reference. This pattern is now established for all service tests.

## Known Stubs

None — all service functions fully implemented with real IndexedDB queries.

## Threat Flags

No new threat surface beyond what was covered in the plan's `<threat_model>`. All three threats addressed:
- T-02-02-T1: Empty input validation in `findOrCreateWordForm` and `addWordEntry`
- T-02-02-T2: Compound index dedup check in `linkMeaningToWordForm`
- T-02-02-I1: `navigator.storage.persist()` result not logged; failure silent

## Next Phase Readiness

- `findOrCreateWordForm`, `searchMeanings`, `addWordEntry` are ready for Plan 03 (onboarding wizard) and Plan 04 (add-entry sheet) to call
- All exported interfaces (`WordEntryInput`, `WordEntryMeaningInput`, `WordEntryResult`) are stable
- Schema v2 is deployed; no further migration needed for Plans 03–05
- `useMeaningSearch` hook (Plan 04) can wire directly to `searchMeanings`

## Self-Check: PASSED

- `src/db/services/wordForm.service.ts` — FOUND
- `src/db/services/meaning.service.ts` — FOUND
- `src/db/services/wordFormMeaning.service.ts` — FOUND
- `src/db/services/wordEntry.service.ts` — FOUND
- `src/db/services/wordForm.service.test.ts` — FOUND
- `src/db/services/meaning.service.test.ts` — FOUND
- `src/db/services/wordEntry.service.test.ts` — FOUND
- `src/db/db.ts` — FOUND (schema v2)
- Commit `74d96fe` (RED): FOUND
- Commit `266ab90` (GREEN): FOUND
- Commit `a30f142` (REFACTOR): FOUND
- Tests: 55 passed / 8 test files
- TypeScript: `npx tsc --noEmit` exits 0
- Build: `npm run build` exits 0

---
*Phase: 02-onboarding-data-entry*
*Completed: 2026-06-30*
