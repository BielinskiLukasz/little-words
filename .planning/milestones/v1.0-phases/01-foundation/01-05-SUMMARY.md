---
phase: 01-foundation
plan: 05
status: complete
completed: 2026-06-30
---

# 01-05 Summary: App Shell — ErrorBoundary, AppGate, main.tsx import order

## What was done

Executed the full TDD cycle (RED → GREEN → REFACTOR) for the App shell feature. This is the final integration layer for Phase 1, wiring i18n + Dexie + router into a working app shell with an onboarding gate and error boundary.

## Commits

1. `7ad5818` — `test(01-05): add failing tests for AppGate and ErrorBoundary` (RED)
2. `49b0700` — `feat(01-05): implement ErrorBoundary and AppGate with i18n-first main.tsx` (GREEN)
3. `b12cc22` — `refactor(01-05): name AppGate component for React DevTools clarity` (REFACTOR — empty, AppGate was already a named function)

## Files created/modified

### Test
- `src/App.test.tsx` — 4 behavior assertions: splash on undefined, onboarding on 0, router on >0, ErrorBoundary fallback

### Feature files
- `src/shared/components/ErrorBoundary.tsx` — class component with `getDerivedStateFromError`, `componentDidCatch`, DEV/prod branch using `import.meta.env.DEV`, Reload button
- `src/App.tsx` — `AppGate` function component using `useLiveQuery` watching `db.childProfile.count()`; `App` default export wraps AppGate in ErrorBoundary
- `src/main.tsx` — i18n import first, then React, ReactDOM, App, CSS (critical import order enforced)

## Test results

| Suite | Tests | Status |
|-------|-------|--------|
| `src/App.test.tsx` | 4 | pass |
| `src/db/schema.test.ts` | 3 | pass |
| `src/db/db.test.ts` | 8 | pass |
| `src/i18n/i18n.test.ts` | 9 | pass |
| `src/shared/components/BottomNav.test.tsx` | 4 | pass |
| **Total** | **28** | **pass** |

## Build status

- `npx tsc --noEmit` — exit 0
- `npm run build` — exit 0 (446 kB JS bundle, 13 kB CSS, SW generated, PWA v1.3.0 generateSW)
- `dist/index.html` contains `/little-words/` base path

## Implementation notes

- `RouterProvider` imports correctly from `'react-router'` (no `/dom` suffix needed in React Router v7)
- `require()` in Vitest ESM context fails — test was updated to use top-level ESM `import` for ErrorBoundary instead
- The `profileCount > 0` test asserts `coming soon` text because RouterProvider with `createHashRouter` navigates to `/dashboard` which shows `DashboardPage` ("Dashboard coming soon")
- `import.meta.env.DEV` is used in ErrorBoundary (not `process.env.NODE_ENV`) — tree-shaken in production builds
- AppGate renders OnboardingPage directly (not via navigate()) so no router context is needed before a profile exists

## Phase 1 success criteria — all satisfied

1. App shell renders with splash → onboarding gate driven by Dexie profile count
2. ErrorBoundary wraps app root; dev shows error.message, prod shows generic message
3. i18n initializes before React tree mounts (main.tsx import order)
4. All 28 tests passing, TypeScript clean, build succeeds
