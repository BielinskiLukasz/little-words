---
phase: quick-260914-gm6
plan: 01
subsystem: ui/pairs, ui/doctor-report, i18n, db/services
tags: [pairs, table, csv-export, doctor-report, configurable-limits, tdd, i18n]
status: complete

dependency_graph:
  requires: []
  provides:
    - PairsPage table layout with CSV export
    - Doctor Report configurable recentAdditions/recentForgotten limits
  affects:
    - src/pages/PairsPage.tsx
    - src/pages/DoctorReportPage.tsx
    - src/features/doctor-report/services/reportGenerator.ts
    - src/i18n/locales/en/common.json
    - src/i18n/locales/pl/common.json

tech_stack:
  added: []
  patterns:
    - Shadcn Table component replacing Collapsible card list
    - UTF-8 BOM CSV export via Blob + createObjectURL (T-gm6-03 revoke on click)
    - Separate "input" vs "applied" state for deferred regeneration
    - TDD RED/GREEN cycle for service-layer param extension

key_files:
  created: []
  modified:
    - src/pages/PairsPage.tsx
    - src/pages/DoctorReportPage.tsx
    - src/features/doctor-report/services/reportGenerator.ts
    - src/features/doctor-report/services/reportGenerator.test.ts
    - src/i18n/locales/en/common.json
    - src/i18n/locales/pl/common.json

decisions:
  - Used separate additionsInput/appliedAdditionsLimit state pair — report updates only on Regenerate, not on every keystroke
  - CSV wraps wordFormText and meaningText in double-quotes with internal double-quote escaping to handle commas and quotes in values
  - Updated test stub to return "${key}:${count}" for recentAdditions/recentForgotten headings so existing toContain checks still match while count is also visible
  - Input clamped to 1..50 range with Math.max/Math.min per threat model T-gm6-01

metrics:
  duration: 8min
  completed: 2026-09-14
  tasks_completed: 2
  commits: 3

estimate:
  tokens: 25000
  tasks: 2
  confidence: med

actuals:
  tokens: 6200
  tasks: 2
  commits: 3
---

# Quick Task 260914-gm6: Three Deferred UAT Follow-ups

**One-liner:** PairsPage Collapsible list replaced with a 5-column Shadcn Table with CSV export; Doctor Report gains two 1–50 number inputs and a Regenerate button for configurable recently-added/forgotten section limits.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | PairsPage — table layout and CSV export | 1ef16a2 | PairsPage.tsx, en/pl common.json |
| 2 (RED) | Failing tests for configurable report limits | a2f597a | reportGenerator.test.ts |
| 2 (GREEN) | Doctor Report — configurable limits | 1f2ba13 | reportGenerator.ts, reportGenerator.test.ts, DoctorReportPage.tsx, en/pl common.json |

## Verification Results

- `npm run build` — exit 0 (TypeScript clean)
- `npm run lint` — exit 0 (no new ESLint violations)
- `npm run test` — 171 tests pass across 14 test files (52 in reportGenerator.test.ts including 6 new limit-param tests)

## Changes by Area

### PairsPage (Task 1)

- Removed: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` imports
- Added: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- Table columns: Word Form (Button link → /word-forms/:id), Meaning (Button link → /meanings/:id), First Observed (ISO date), Last Used (ISO date), Active (Badge default/secondary)
- Sort select preserved unchanged in header
- Download CSV button (variant="outline" size="sm") added to left of sort select
- CSV: UTF-8 BOM prepended, double-quote wrapping with escaping for field values, `URL.revokeObjectURL` called immediately after click

### DoctorReportPage (Task 2)

- Added state: `additionsInput` (5), `forgottenInput` (5), `appliedAdditionsLimit` (5), `appliedForgottenLimit` (5)
- Controls section between parent notes textarea and report pre block:
  - "Recent additions to show" label + number input (1..50)
  - "Recently forgotten to show" label + number input (1..50)
  - Regenerate button (variant="outline" w-full) applies inputs to applied limits
- `generateReport` now receives `recentAdditionsLimit: appliedAdditionsLimit` and `recentForgottenLimit: appliedForgottenLimit`

### reportGenerator.ts (Task 2)

- `ReportInput` gains optional `recentAdditionsLimit?: number` and `recentForgottenLimit?: number`
- Both default to 5 via nullish coalescing
- `bulletSection` headings now call `t('report.recentAdditions', { count: recentAdditionsLimit })` (and recentForgotten equivalent)
- `.slice(0, 5)` replaced with `.slice(0, recentAdditionsLimit)` / `.slice(0, recentForgottenLimit)`

### i18n (Tasks 1 & 2)

| Key | en | pl |
|-----|----|----|
| pairs.downloadCsv | Download CSV | Pobierz CSV |
| report.recentAdditions | Recently added ({{count}}) | Ostatnio dodane ({{count}}) |
| report.recentForgotten | Recently forgotten ({{count}}) | Ostatnio zapomniane ({{count}}) |
| report.recentAdditionsLabel | Recent additions to show | Liczba ostatnio dodanych |
| report.recentForgottenLabel | Recently forgotten to show | Liczba ostatnio zapomnianych |
| report.regenerate | Regenerate | Odśwież raport |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — all surface is local-only (in-device IndexedDB data, no network, no new endpoints).

## Self-Check

- [x] `src/pages/PairsPage.tsx` exists with Table import and handleDownloadCsv
- [x] `src/pages/DoctorReportPage.tsx` exists with additionsInput/forgottenInput state and Regenerate button
- [x] `src/features/doctor-report/services/reportGenerator.ts` exports `recentAdditionsLimit`/`recentForgottenLimit` params
- [x] `src/i18n/locales/en/common.json` contains pairs.downloadCsv, report.regenerate, report.recentAdditionsLabel
- [x] `src/i18n/locales/pl/common.json` contains same keys in Polish
- [x] Commits 1ef16a2, a2f597a, 1f2ba13 exist in git log
- [x] 171/171 tests pass, 0 TypeScript errors, 0 lint errors

## Self-Check: PASSED
