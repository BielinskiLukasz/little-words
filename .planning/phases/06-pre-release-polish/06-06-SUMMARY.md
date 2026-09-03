---
phase: 06-pre-release-polish
plan: "06"
subsystem: doctor-report
tags: [tdd, report, i18n, doctor-report]
status: complete

dependency_graph:
  requires:
    - "06-01"
    - "06-02"
  provides:
    - Enhanced doctor report (D-09 D-10 D-11 D-12) for PREREL-05
  affects:
    - src/features/doctor-report/services/reportGenerator.ts
    - src/features/doctor-report/services/reportGenerator.test.ts
    - src/pages/DoctorReportPage.tsx

tech_stack:
  added: []
  patterns:
    - TDD RED/GREEN/REFACTOR cycle for pure function enhancements
    - bulletSection helper to DRY list-section building
    - differenceInMonths for age calculation (replaces differenceInYears)

key_files:
  created: []
  modified:
    - src/features/doctor-report/services/reportGenerator.ts
    - src/features/doctor-report/services/reportGenerator.test.ts
    - src/pages/DoctorReportPage.tsx
    - src/shared/components/BottomNav.test.tsx

decisions:
  - "D-09: threshold changed from 24 months to 12 months; ageYears/ageMonths keys replaced with months/yearsMonths"
  - "meaningWordFormCounts is optional on ReportInput so existing call-sites compile without changes"
  - "bulletSection helper extracted for D-11/D-12 to reduce repetition"
  - "Blank-line separators chosen over --- dividers for section boundaries"

metrics:
  duration_min: 15
  completed_date: "2026-09-03"
  tasks_completed: 3
  commits: 4

estimate:
  tokens: 80000

actuals:
  tokens: 22000
  tasks: 3
  commits: 4
---

# Phase 06 Plan 06: Doctor Report TDD Enhancements Summary

**One-liner:** Four report enhancements via strict TDD — age uses `yearsMonths` format, per-category meaning list with word-form counts, recent additions section, and recently-forgotten inactive section.

## What Was Built

### Task 1 (RED): Failing tests for D-09 through D-12

Updated `reportGenerator.test.ts`:
- Updated global `t` stub to handle `report.yearsMonths` → `Xy Ym` format
- Updated 3 existing age-format tests to expect new `Xy Ym` format (these became failing RED tests)
- Updated 1 existing age test to use < 12 months birthDate (D-09 threshold changed from 24 to 12 months)
- Added 4 new describe blocks: D-09 age format (4 tests), D-10 per-category (6 tests), D-11 recent additions (3 tests), D-12 inactive section (4 tests)
- Added `meaningWordFormCounts?: Record<number, number>` to `ReportInput` (type-only, enables test compilation)

Result: 19 tests failing, 27 passing (46 total) — RED confirmed.

### Task 2 (GREEN): Implement all four enhancements

`reportGenerator.ts`:
- **D-09**: `differenceInYears` import removed; `differenceInMonths` used for `totalMonths`; `< 12` uses `report.months`, `>= 12` uses `report.yearsMonths` with `years/months` params
- **D-10**: Per-category section after topCategories — categories with active meanings sorted alphabetically, meanings sorted alphabetically within each, word-form count from `meaningWordFormCounts[id] ?? 0` in parentheses
- **D-11**: Recent additions section — top 5 active by `firstUseDate` descending
- **D-12**: Recent forgotten section — top 5 inactive by `lastUseDate` descending

`DoctorReportPage.tsx`:
- Added `useLiveQuery(() => db.wordFormMeanings.toArray())` for pairs
- Computed `meaningWordFormCounts: Record<number, number>` with a `forEach` accumulator
- Passed `meaningWordFormCounts` to `generateReport`

Result: 46 tests passing — GREEN confirmed.

### Task 3 (REFACTOR): Clean up

- Extracted `bulletSection(heading, items)` helper for D-11/D-12 sections (eliminates duplicated loop pattern)
- Inlined `topCategories` as a single pipeline (map → filter → sort → slice → map)
- Condensed age ternary into single expression
- Added section-comment headers (`--- Age (D-09) ---` etc.) for code navigation

Result: 46 tests still passing.

## TDD Gate Compliance

RED gate: commit `3f3de4e` — `test(06-06): add failing tests for D-09 D-10 D-11 D-12`
GREEN gate: commit `5b0106e` — `feat(06-06): implement D-09 D-10 D-11 D-12 report enhancements`
REFACTOR gate: commit `3608dfb` — `refactor(06-06): clean up report generator sections`

All three gates present in correct order.

## Commits

| Hash | Message |
|------|---------|
| 3f3de4e | test(06-06): add failing tests for D-09 D-10 D-11 D-12 |
| 5b0106e | feat(06-06): implement D-09 D-10 D-11 D-12 report enhancements |
| 3608dfb | refactor(06-06): clean up report generator sections |
| bf200dd | fix(06-06): update BottomNav test count for 5th Pairs tab |

## Verification Results

1. `npx vitest run reportGenerator.test.ts` — 46 passed, 0 failed
2. `npm run build` — exits 0 (✓ built in ~14s)
3. `grep -c "report.yearsMonths" reportGenerator.ts` → 1 ✓
4. `grep -c "report.byCategory" reportGenerator.ts` → 1 ✓
5. `grep -c "report.recentAdditions" reportGenerator.ts` → 1 ✓
6. `grep -c "report.recentForgotten" reportGenerator.ts` → 1 ✓
7. `grep -c "meaningWordFormCounts" DoctorReportPage.tsx` → 3 ✓
8. Full test suite: 165 passed, 0 failed across 14 test files

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated age test birthDate for new D-09 threshold**
- **Found during:** GREEN phase — test `'age < 2 years → uses month count'` used birthDate 18 months ago; under D-09 this is >= 12 months and now shows `1y6m` not `18`
- **Fix:** Renamed test and changed birthDate to 10 months ago (< 12 month threshold)
- **Files modified:** `src/features/doctor-report/services/reportGenerator.test.ts`
- **Commit:** 5b0106e

**2. [Rule 1 - Bug] Fixed pre-existing BottomNav test count mismatch**
- **Found during:** Full `npm run test` run
- **Issue:** `BottomNav.test.tsx` expected 4 links; Plan 06-05 added the 5th Pairs tab without updating the test
- **Fix:** Updated `toHaveLength(4)` → `toHaveLength(5)`
- **Files modified:** `src/shared/components/BottomNav.test.tsx`
- **Commit:** bf200dd

## Known Stubs

None.

## Threat Flags

None — report generator is a pure function over local DB data; no new network endpoints, auth paths, or schema changes introduced.

## Self-Check: PASSED

- `src/features/doctor-report/services/reportGenerator.ts` — exists and modified
- `src/features/doctor-report/services/reportGenerator.test.ts` — exists and modified
- `src/pages/DoctorReportPage.tsx` — exists and modified
- All 4 commits (3f3de4e, 5b0106e, 3608dfb, bf200dd) confirmed in git log
- 165 tests pass, build exits 0
