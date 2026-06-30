---
phase: 01-foundation
plan: "01"
subsystem: scaffold
tags: [vite, react, typescript, tailwind, shadcn, vitest, pwa]
dependency_graph:
  requires: []
  provides: [build-toolchain, css-theme, test-runner]
  affects: [all-subsequent-plans]
tech_stack:
  added:
    - Vite 7.3.6 (build tool)
    - React 19.1.1 + react-dom 19.1.1
    - TypeScript 5.8.3
    - "@vitejs/plugin-react 5.0.3"
    - vite-plugin-pwa 1.3.0 (PWA generation)
    - "@tailwindcss/vite 4.3.2 (Tailwind v4 Vite plugin)"
    - tailwindcss 4.3.2
    - Shadcn/UI (default style, components via CLI)
    - "@radix-ui/react-slot 1.3.0"
    - class-variance-authority 0.7.1
    - clsx 2.1.1
    - tailwind-merge 3.6.0
    - lucide-react 1.22.0
    - react-router 7.18.1
    - dexie 4.4.4 + dexie-react-hooks 4.4.0
    - i18next 23.16.8 + react-i18next 15.7.4
    - zustand 5.0.14
    - vitest 4.1.9
    - "@testing-library/react 16.3.2"
    - "@testing-library/dom 10.4.1"
    - "@testing-library/user-event 14.6.1"
    - jsdom 29.1.1
    - "@types/node 26.0.1"
  patterns:
    - Tailwind v4 CSS-only config (no tailwind.config.js)
    - OKLCH color space for all theme variables
    - System prefers-color-scheme dark mode (no class toggle)
    - Shadcn/UI components via CLI (default style, neutral base)
    - Path alias @/* -> src/* in both tsconfig and vite resolve
    - Separate vitest.config.ts from vite.config.ts
key_files:
  created:
    - package.json (all Phase 1 runtime + dev deps)
    - vite.config.ts (base /little-words/, React + Tailwind + VitePWA plugins, resolve alias)
    - tsconfig.app.json (strict mode, ES2020, path aliases, PWA types)
    - tsconfig.json (added compilerOptions.paths for Shadcn resolution)
    - index.html (title: Little Words, relative script src)
    - src/index.css (Tailwind v4 import + full OKLCH light/dark theme)
    - src/App.tsx (minimal placeholder, will be replaced in later plans)
    - src/main.tsx (React root mount)
    - src/vite-env.d.ts (Vite type references)
    - src/lib/utils.ts (cn() helper with clsx + tailwind-merge)
    - src/components/ui/button.tsx (Shadcn Button component)
    - components.json (Shadcn config: default style, neutral base, cssVariables)
    - vitest.config.ts (jsdom environment, globals, @/* alias, passWithNoTests)
    - eslint.config.js (create-vite default ESLint config)
  modified:
    - .gitignore (added *.tsbuildinfo)
decisions:
  - "Resolved @/* alias by adding compilerOptions.paths to root tsconfig.json — Shadcn workspace loader reads the root tsconfig, not tsconfig.app.json"
  - "Used npm create vite@7 --overwrite flag (non-interactive mode) — restored .planning/ and .claude/ from git after overwrite deleted them"
  - "Added passWithNoTests: true to vitest.config.ts so vitest run exits 0 before any test files exist"
  - "Installed tailwindcss as an explicit devDependency so Shadcn CLI detects Tailwind v4 (it was only a transitive dep of @tailwindcss/vite before)"
  - "Kept style: default in components.json (plan spec) — Shadcn nova preset generates radix-nova style which is not what the plan specifies"
metrics:
  duration: "62 minutes"
  completed: "2026-06-30"
  tasks_completed: 3
  files_created: 13
  files_modified: 2
status: complete
---

# Phase 1 Plan 01: Scaffold + Tailwind + Vitest Summary

Vite 7 + React 19 + TypeScript PWA scaffold with `/little-words/` base path, full OKLCH warm-neutral + teal Tailwind v4 theme, Shadcn/UI (default style, neutral base), and Vitest jsdom test runner — all Phase 1 runtime and dev dependencies installed.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1.1 | Scaffold Vite project and install all Phase 1 dependencies | 37958a4 | package.json, vite.config.ts, tsconfig.app.json, index.html, src/App.tsx |
| 1.2 | Initialize Shadcn/UI and write Tailwind v4 + OKLCH theme CSS | 9d4ff9a | components.json, src/index.css, src/lib/utils.ts, src/components/ui/button.tsx |
| 1.3 | Configure Vitest with jsdom environment | 1c904a5 | vitest.config.ts, package.json (test scripts) |

## Verification Results

| Check | Status | Detail |
|-------|--------|--------|
| `npm run build` exits 0 | PASS | dist/index.html contains `/little-words/` in all asset paths |
| `dist/index.html` contains `/little-words/` | PASS | Script and CSS hrefs prefixed with `/little-words/` |
| `npx tsc --noEmit` exits 0 | PASS | No TypeScript errors |
| `npx vitest run` exits 0 | PASS | "No test files found, exiting with code 0" |
| `components.json` has `"baseColor": "neutral"` and `"cssVariables": true` | PASS | Verified |
| `src/index.css` starts with `@import "tailwindcss"` | PASS | First non-empty line is the import |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Shadcn CLI cannot resolve @/* path alias**
- **Found during:** Task 1.2
- **Issue:** `npx shadcn@latest add button` created file at literal path `@/components/ui/button.tsx` (treating `@` as a directory name) instead of `src/components/ui/button.tsx`. Root cause: Shadcn's workspace loader reads `compilerOptions.paths` from the root `tsconfig.json`, but the create-vite template puts all compiler options in `tsconfig.app.json` with the root tsconfig only containing project references.
- **Fix:** Added `"compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }` to root `tsconfig.json`. Deleted the incorrectly-created `@/` directory.
- **Files modified:** `tsconfig.json`
- **Commit:** 9d4ff9a

**2. [Rule 3 - Blocking] .planning/ and .claude/ deleted by create-vite --overwrite**
- **Found during:** Task 1.1
- **Issue:** `npm create vite@7 . --overwrite` deleted `.planning/` and `.claude/` directories that were tracked in git. The `--overwrite` flag was necessary because the interactive prompt for "non-empty directory" cannot be answered via pipe in this environment.
- **Fix:** Immediately ran `git checkout HEAD -- .planning/ .claude/ LICENSE` to restore all three from git history before any new commit was made.
- **Files modified:** None (restore only)
- **Commit:** Restoration done before 37958a4

**3. [Rule 2 - Missing functionality] Vitest exits 1 with no test files**
- **Found during:** Task 1.3
- **Issue:** `npx vitest run` exits with code 1 when no test files exist. Plan specifies "vitest run exits 0" as a verification criterion.
- **Fix:** Added `passWithNoTests: true` to vitest.config.ts test block.
- **Files modified:** `vitest.config.ts`
- **Commit:** 1c904a5

**4. [Rule 3 - Blocking] Shadcn init fails Tailwind validation**
- **Found during:** Task 1.2
- **Issue:** `npx shadcn@latest init` reported "No Tailwind CSS configuration found" because `tailwindcss` was only a transitive dependency of `@tailwindcss/vite`, not listed directly in `devDependencies`.
- **Fix:** Ran `npm install -D tailwindcss` to make it an explicit devDependency. Shadcn then detected "Found v4".
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** 9d4ff9a

**5. [Rule 1 - Bug] Shadcn init workspace config error even after Tailwind detected**
- **Found during:** Task 1.2
- **Issue:** After Tailwind v4 was detected, `shadcn@latest init` still failed with "Could not load the workspace config". Investigation showed Shadcn writes `components.json` with `style: "radix-nova"` (nova preset) but then fails to re-load it due to an internal workspace resolution error. Tried multiple versions (4.12.0, 4.11.0) — same error.
- **Fix:** Manually created `components.json` with `style: "default"` (as specified in the plan) and correct alias configuration. Then used `npx shadcn@latest add button --yes` directly, which succeeded. This also matches the plan's requirement for "Style: Default".
- **Files modified:** `components.json` (manual write)
- **Commit:** 9d4ff9a

## Known Stubs

- `src/App.tsx` — renders a bare `<h1>Little Words</h1>` placeholder. The create-vite default App.tsx referenced deleted files (App.css, react.svg, vite.svg), so it was replaced with a minimal stub. It will be fully replaced in Plan 01-04 (App Shell + Router).

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced in this plan. This is a pure scaffold/toolchain plan with no runtime data processing.

## Self-Check: PASSED

All created files verified present on disk. All task commits verified in git log:
- 37958a4: feat(01-01): scaffold Vite + React + TS project with /little-words/ base
- 9d4ff9a: feat(01-01): configure Tailwind v4 + Shadcn/UI with OKLCH theme
- 1c904a5: feat(01-01): configure Vitest with jsdom environment
