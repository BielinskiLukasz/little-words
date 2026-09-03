---
phase: 06-pre-release-polish
plan: "05"
subsystem: PairsPage
tags: [ui, routing, navigation, pairs, i18n]
status: complete

dependency_graph:
  requires:
    - "06-01 (getPairsWithDetails service function)"
    - "06-02 (i18n keys: nav.pairs, sort.*, pairs.*, pair.* groups)"
  provides:
    - PairsPage accessible at /#/pairs from BottomNav 5th tab
    - Collapsible pair rows with dual-chip navigation to word forms and meanings
    - Sort selector with newest/azForm/azMeaning options
  affects:
    - src/pages/PairsPage.tsx
    - src/shared/components/BottomNav.tsx
    - src/router/index.tsx

tech_stack:
  added: []
  patterns:
    - Radix Collapsible for per-pair expandable rows (same as MeaningDetailPage/WordFormDetailPage)
    - CollapsibleTrigger asChild wrapping row body; chips use e.stopPropagation() for independent navigation
    - useLiveQuery + getPairsWithDetails for reactive pair list
    - Native <select> for sort selector (same approach as plan spec; simpler than Button toggle for 3 options)
    - GitBranch lucide icon for Pairs tab in BottomNav

key_files:
  created:
    - src/pages/PairsPage.tsx
  modified:
    - src/shared/components/BottomNav.tsx
    - src/router/index.tsx

decisions:
  - "Used t('pair.active') / t('wordForm.inactive') for isActive Badge — no top-level 'inactive' key exists; wordForm.inactive is the closest equivalent"
  - "CollapsibleTrigger asChild wraps the entire row body div; chips call e.stopPropagation() to prevent Collapsible toggle when navigating"
  - "Chip className uses max-w-[45vw] min-w-0 (not max-w-[45%]) to cap at viewport-relative width, ensuring both chips fit at 320px minimum"

metrics:
  duration_min: 12
  completed_date: "2026-09-03"
  tasks_completed: 2
  commits: 2

estimate:
  tokens: 70000

actuals:
  tokens: 9000
  tasks: 2
  commits: 2
---

# Phase 06 Plan 05: PairsPage Summary

**One-liner:** PairsPage created at /#/pairs with Collapsible dual-chip rows (word form + meaning navigation chips), sort selector, and empty state; BottomNav updated to 5 tabs with GitBranch icon; /pairs route wired in router.

## What Was Built

### Task 1 (Tracer): PairsPage flat rows + BottomNav + router

Created `src/pages/PairsPage.tsx`:
- **Data**: `useLiveQuery(() => getPairsWithDetails(), [])` — reactive pair list from Plan 01 service
- **Loading state**: centered `t('app.loading')` paragraph when pairs === undefined
- **Sort state**: `useState<SortOrder>('newest')` with 3-option native `<select>` (newestFirst / azWordForm / azMeaning using `sort.*` i18n keys)
- **Sorting**: in-memory sort on the resolved `pairs` array — descending firstObservationDate / localeCompare on wordFormText / localeCompare on meaningText
- **Empty state**: `t('pairs.emptyHeading')` + `t('pairs.emptyBody')` centered in a py-16 flex column
- **Row chips**: two `<Button variant="outline" size="sm">` chips per row navigating to `/word-forms/:id` and `/meanings/:id`
- **Page header**: `<h1 className="text-2xl font-bold">{t('nav.pairs')}</h1>`

Updated `src/shared/components/BottomNav.tsx`:
- Imported `GitBranch` from lucide-react
- Added `{ to: '/pairs', icon: GitBranch, labelKey: 'nav.pairs' as const }` as 4th tab entry
- Tab order now matches D-13: Dashboard | Meanings | Word Forms | Pairs | More

Updated `src/router/index.tsx`:
- Imported `PairsPage` from '../pages/PairsPage'
- Added `{ path: 'pairs', element: <PairsPage /> }` child route under RootLayout

### Task 2 (Auto): Collapsible row expansion

Refactored `src/pages/PairsPage.tsx` flat rows into Collapsible rows:
- **Collapsible wrapper**: `<Collapsible className="rounded-lg border border-border bg-card">`
- **CollapsibleTrigger asChild**: wraps the row header div (cursor-pointer) so tapping the row body toggles expansion
- **Chip onClick**: `e.stopPropagation()` before navigate() — chip taps navigate without triggering Collapsible toggle
- **Chip className**: `truncate max-w-[45vw] min-w-0` — viewport-relative cap ensures both chips fit at 320px minimum width
- **CollapsibleContent**: two-column grid showing:
  - `t('pair.firstObserved')`: firstObservationDate
  - `t('pair.lastUsed')`: lastUsedDate
  - `<Badge variant={pair.isActive ? 'default' : 'secondary'}>` with `t('pair.active')` / `t('wordForm.inactive')`

## Commits

| Hash | Message |
|------|---------|
| cb870e1 | feat(06-05): add PairsPage, /pairs route, and 5th BottomNav tab |
| bcedc0c | feat(06-05): add Collapsible row expansion to PairsPage |

## Verification Results

All 6 plan verification checks pass:
1. `npm run build` exits 0
2. `grep -c "PairsPage" src/router/index.tsx` → 2
3. `grep -c "pairs" src/shared/components/BottomNav.tsx` → 1
4. `grep -c "getPairsWithDetails" src/pages/PairsPage.tsx` → 2
5. `grep -c "CollapsibleContent" src/pages/PairsPage.tsx` → 3
6. `grep -c "sort" src/pages/PairsPage.tsx` → 10

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used t('wordForm.inactive') instead of t('inactive') for inactive Badge label**
- **Found during:** Task 2 implementation
- **Issue:** Plan says "if `t('inactive')` key exists; if not, use `t('pair.active')` + logic". There is no top-level `inactive` key in i18n. `t('wordForm.inactive')` exists with value "Inactive" (EN) — same semantic meaning.
- **Fix:** Used `pair.isActive ? t('pair.active') : t('wordForm.inactive')` — matches the plan's guidance
- **Files modified:** src/pages/PairsPage.tsx

## Known Stubs

None.

## Threat Flags

None — chip navigation uses DB-sourced numeric IDs (T-06-05-02 accepted); large list uses native scroll (T-06-05-03 accepted); no new data exposure (T-06-05-01 accepted).

## Self-Check: PASSED

- src/pages/PairsPage.tsx: created and present
- src/shared/components/BottomNav.tsx: modified and present
- src/router/index.tsx: modified and present
- Commit cb870e1 exists in git log
- Commit bcedc0c exists in git log
- npm run build exits 0
- All 6 verification grep checks pass
