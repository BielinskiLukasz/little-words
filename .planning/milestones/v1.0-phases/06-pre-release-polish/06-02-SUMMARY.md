---
phase: 06-pre-release-polish
plan: "02"
subsystem: i18n / Dashboard navigation
tags: [i18n, dashboard, navigation, accessibility]
status: complete

dependency_graph:
  requires: []
  provides:
    - Phase 6 i18n key set in pl/en common.json (unblocks Plans 03–06)
    - Dashboard stat card navigation (D-17)
  affects:
    - src/i18n/locales/pl/common.json
    - src/i18n/locales/en/common.json
    - src/pages/DashboardPage.tsx

tech_stack:
  added: []
  patterns:
    - react-router Link wrapping Card for tappable stat cards
    - i18next nested group keys for sort/pairs/pair/report domains

key_files:
  created: []
  modified:
    - src/i18n/locales/pl/common.json
    - src/i18n/locales/en/common.json
    - src/pages/DashboardPage.tsx

decisions:
  - "common.saveChanges/discardChanges/edit placed in common group alongside save/cancel/delete for consistency"
  - "Link wrapper uses className=block to preserve Card flex layout; focus-visible ring added for keyboard accessibility"

metrics:
  duration_min: 9
  completed_date: "2026-09-03"
  tasks_completed: 2
  commits: 2

estimate:
  tokens: 40000

actuals:
  tokens: 12000
  tasks: 2
  commits: 2
---

# Phase 06 Plan 02: i18n Keys + Dashboard Stat Card Links Summary

**One-liner:** Added all Phase 6 i18n keys to pl/en locale files and wrapped Dashboard stat cards in React Router Links for D-17 navigation.

## What Was Built

### Task 1: Add Phase 6 i18n keys (Tracer)

Added the following keys to both `src/i18n/locales/pl/common.json` and `src/i18n/locales/en/common.json`:

| Group | Keys Added |
|-------|-----------|
| `nav` | `pairs` |
| `common` | `edit`, `saveChanges`, `discardChanges` |
| `sort` (new) | `newestFirst`, `azWordForm`, `azMeaning` |
| `pairs` (new) | `emptyHeading`, `emptyBody` |
| `pair` (new) | `firstObserved`, `lastUsed`, `active`, `goToWordForm`, `goToMeaning` |
| `report` | `byCategory`, `recentAdditions`, `recentForgotten`, `yearsMonths`, `months` |

Both locale files remain valid JSON. Build passes with 0 TypeScript errors.

### Task 2: Wrap Dashboard stat cards in Link (D-17)

`DashboardPage.tsx` already imported `Link` from `react-router`. Wrapped all three stat cards:

- Active Meanings card → `<Link to="/meanings">`
- Active Word Forms card → `<Link to="/word-forms">`
- New This Month card → `<Link to="/meanings">`

Each Link wrapper uses `className="block focus-visible:ring-2 focus-visible:ring-ring rounded-lg"`. Card interior markup and visual appearance are unchanged.

## Commits

| Hash | Message |
|------|---------|
| 45a2d2a | feat(06-02): add Phase 6 i18n keys to pl/en common.json |
| 8a2c83b | feat(06-02): wrap dashboard stat cards in Link for navigation (D-17) |

## Verification Results

- `npm run build` exits 0 (both tasks)
- `grep -c "saveChanges" pl/common.json` → 1
- `grep -c "saveChanges" en/common.json` → 1
- `grep -c 'to="/meanings"' DashboardPage.tsx` → 3 (Active Meanings + New This Month + seeAllReview link)
- `grep -c 'to="/word-forms"' DashboardPage.tsx` → 1

## Deviations from Plan

None — plan executed exactly as written. `Link` was already imported in DashboardPage.tsx so no new import was needed.

## Known Stubs

None.

## Threat Flags

None — all route targets are hardcoded string literals; no new network endpoints or auth paths introduced.

## Self-Check: PASSED

- src/i18n/locales/pl/common.json: modified with all required keys
- src/i18n/locales/en/common.json: modified with all required keys
- src/pages/DashboardPage.tsx: modified with Link wrappers
- Commits 45a2d2a and 8a2c83b exist in git log
