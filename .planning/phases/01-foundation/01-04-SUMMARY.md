---
phase: 01-foundation
plan: 04
status: complete
completed: 2026-06-30
---

# 01-04 Summary: Hash Router Shell

## What was done

Executed the full TDD cycle (RED → GREEN → REFACTOR) for the hash router shell feature.

## Commits

1. `86b5d53` — `test(01-04): add failing tests for BottomNav` (RED)
2. `9c4c7f2` — `feat(01-04): implement hash router shell with 4-tab BottomNav and 9 route stubs` (GREEN)
3. `1d4a4c0` — `refactor(01-04): clean up BottomNav tabs array` (REFACTOR — empty, tabs const already correct)
4. `46facc6` — `fix(db): cast Dexie add() return type to resolve build TS errors` (pre-existing build issue fixed)

## Files created

### Test infrastructure
- `src/test-setup.ts` — imports `@testing-library/jest-dom` to extend Vitest matchers
- `vitest.config.ts` — updated to include `test-setup.ts` in `setupFiles`

### Feature files
- `src/shared/components/BottomNav.test.tsx` — 4 behavior assertions (RED phase)
- `src/shared/components/BottomNav.tsx` — 4-tab nav using NavLink, Lucide icons, i18next labels
- `src/shared/components/RootLayout.tsx` — Outlet + BottomNav, `h-[100dvh]`
- `src/router/index.tsx` — `createHashRouter` with 9 routes; OnboardingPage outside layout

### Pages (9 stubs)
- `src/pages/DashboardPage.tsx`
- `src/pages/MeaningsPage.tsx`
- `src/pages/WordFormsPage.tsx`
- `src/pages/MorePage.tsx` — links to Categories, Timeline, Doctor Report, Settings
- `src/pages/CategoriesPage.tsx`
- `src/pages/TimelinePage.tsx`
- `src/pages/DoctorReportPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/OnboardingPage.tsx`

### Other
- `src/stores/ui.store.ts` — Zustand UIState stub with `_placeholder: null`
- `src/features/.gitkeep`
- `src/shared/hooks/.gitkeep`
- `src/shared/utils/.gitkeep`

## Test results

| Suite | Tests | Status |
|-------|-------|--------|
| `src/db/schema.test.ts` | 3 | pass |
| `src/db/db.test.ts` | 8 | pass |
| `src/i18n/i18n.test.ts` | 9 | pass |
| `src/shared/components/BottomNav.test.tsx` | 4 | pass |
| **Total** | **24** | **pass** |

## Build status

- `npx tsc --noEmit` — exit 0
- `npm run build` — exit 0 (193 kB JS bundle, 13 kB CSS, SW generated)

## Notes

- `@testing-library/jest-dom` was not yet installed; added as devDependency and wired into vitest `setupFiles`
- Pre-existing build error in 4 service stubs (`number | undefined` vs `Promise<number>`) fixed with `as Promise<number>` cast — these errors predated this plan
- Tabs const is defined as a typed `const` array outside the component render, satisfying the REFACTOR criterion
- Default language is Polish; BottomNav test asserts Polish labels (Pulpit, Znaczenia, Formy słów, Więcej)
