# Walking Skeleton — Little Words

**Phase:** 1
**Generated:** 2026-06-30

## Capability Proven End-to-End

A parent opens the app for the first time, sees the "Little Words" splash screen while the database initializes, lands on the onboarding placeholder (no child profile exists yet), and can tap any of the 4 bottom navigation tabs to reach its stub page — all assets load from `/little-words/` with no 404 errors.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Build tool | Vite 7 + @vitejs/plugin-react@5 | GitHub Pages static hosting; v5 required for Vite 7 (v6 requires Vite 8) |
| Base path | `/little-words/` | IMMUTABLE — must match the GitHub repo slug; all asset URLs include this prefix |
| Routing | React Router v7, `createHashRouter` | Hash routing (`/#/path`) works on GitHub Pages without server-side rewrite rules; `createBrowserRouter` would 404 on direct link |
| Data layer | Dexie 4.4.4 + dexie-react-hooks (`useLiveQuery`) | Reactive IndexedDB queries with cross-tab support; EntityTable provides TypeScript typing; no backend required |
| i18n | react-i18next + i18next, static imports, Polish default | Polish is the primary language (D-05); static bundling works offline from first load |
| Styling | Tailwind v4 + Shadcn/UI (Neutral base + OKLCH custom theme) | Warm neutral + teal theme (D-14); system dark mode via `prefers-color-scheme` (D-15); zero runtime CSS cost |
| State | Zustand at `src/stores/` for UI state; `useLiveQuery` for data state | Clear separation: Zustand is ephemeral session state, Dexie is persisted data state |
| PWA scaffold | vite-plugin-pwa 1.3.0, `navigateFallback: null` | Hash routing means no navigation fallback needed; full PWA config (icons, manifest branding) deferred to Phase 5 |
| Directory layout | 3-layer: `src/pages/` → `src/db/services/` → `src/db/` + `src/features/<name>/{components,hooks}/` | UI imports only services; services import only db; no direct Dexie calls in components |

## Stack Touched in Phase 1

- [x] Project scaffold — Vite 7 + React 19 + TypeScript 5 (strict mode), Tailwind v4, Shadcn/UI
- [x] Routing — `createHashRouter` with 9 routes; `RootLayout` with `BottomNav` (4 tabs)
- [x] Database — Dexie schema v1 opens; `useLiveQuery` watches `childProfile.count()` in `AppGate`
- [x] UI — `BottomNav` (4 tabs with icons, active state), splash screen, 9 route stub pages
- [x] Deployment — local dev works (`npm run dev`); build produces `/little-words/`-prefixed assets (`npm run build`)

## Out of Scope (Deferred to Later Slices)

- Child profile creation wizard — Phase 2
- Word form and meaning data entry — Phase 2
- Language switcher UI — Phase 2 (Settings screen)
- Dashboard metrics (Active Meanings count, etc.) — Phase 3
- Browse views (Meanings list, Word Forms list, Categories, Timeline) — Phase 3
- Doctor Report generation and clipboard copy — Phase 4
- JSON/CSV export and import — Phase 4
- PWA icons, manifest branding, service worker update prompt — Phase 5
- Gesture entity in schema — v2 (GEST-01 deferred)
- Usage type (Spontaneous/Imitated) on Meaning — v2 (USAGE-01 deferred)

## Smoke Test (Walking Skeleton Validation)

Run this after Phase 1 completes to confirm the skeleton works:

1. `npm run build` — exits 0; `dist/index.html` contains `/little-words/`
2. `npm run preview` — app serves on localhost
3. Open `http://localhost:4173/little-words/#/` — splash screen appears briefly, then OnboardingPage placeholder loads
4. Tap (or click) each of the 4 BottomNav tabs — each navigates to its stub page without 404
5. Navigate directly to `/#/dashboard` — DashboardPage placeholder loads, BottomNav active state shows on Dashboard tab
6. `npx tsc --noEmit` — exits 0 (no TypeScript errors)
7. `npx vitest run` — all tests pass

## Subsequent Slice Plan

Each later phase adds one vertical user capability on top of this skeleton without renegotiating any Phase 1 architectural decision:

- Phase 2: Parent can create a child profile and log their first word form with meanings
- Phase 3: Parent can browse all entered words, meanings, categories, and timeline chart
- Phase 4: Parent can generate a Doctor Report and export/import all data
- Phase 5: App works fully offline, is installable on iOS/Android, and notifies on new version
