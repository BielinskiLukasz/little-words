---
phase: "05-pwa-polish"
plan: "03"
subsystem: "ci-cd"
tags: ["github-actions", "deploy", "ci-cd", "github-pages", "nojekyll"]

dependency_graph:
  requires: []
  provides: ["automated-deploy-on-push-to-main", "jekyll-prevention"]
  affects: ["gh-pages-branch", "github-pages-serving"]

tech_stack:
  added:
    - "peaceiris/actions-gh-pages@v4 — gh-pages branch deployment action"
    - "actions/checkout@v4 — repository checkout"
    - "actions/setup-node@v4 — Node 22 with npm cache"
  patterns:
    - "lint → test gate before build; deploy blocked on failure"
    - "public/.nojekyll copied to dist/ by Vite at build time"

key_files:
  created:
    - ".github/workflows/deploy.yml"
  modified:
    - "(public/.nojekyll already existed and was already committed)"

decisions:
  - "D-08: trigger on push to main only; lint+test gate; peaceiris/actions-gh-pages@v4"
  - "D-09: keep_files: false prevents stale artifact accumulation in gh-pages branch"
  - "public/.nojekyll was already committed in a prior commit (2847ed9) — no new commit needed for Task 2"

metrics:
  duration: "8 min"
  completed: "2026-08-31"
  tasks_completed: 2
  tasks_total: 2
  commits: 1

status: complete

actuals:
  tokens: 3000
  tasks: 2
  commits: 1
---

# Phase 05 Plan 03: GitHub Actions CI/CD Deploy Summary

**One-liner:** GitHub Actions workflow with lint+test gate deploying to gh-pages via peaceiris/actions-gh-pages@v4 on push to main only.

## What Was Built

| Task | Status | Commit |
|------|--------|--------|
| Task 1: Create .github/workflows/deploy.yml | Done | 53b4d5a |
| Task 2: Add public/.nojekyll | Done | pre-existing (2847ed9) |

## Key Details

**deploy.yml pipeline:**
- Triggers on `push: branches: [main]` only — no `workflow_dispatch`, no `pull_request`
- `permissions: contents: write` — required for peaceiris to push to gh-pages branch
- Steps in order: `actions/checkout@v4` → `actions/setup-node@v4` (Node 22, npm cache) → `npm ci` → `npm run lint` → `npm run test` → `npm run build` → `peaceiris/actions-gh-pages@v4`
- No `continue-on-error` on lint or test steps — failure blocks deploy
- `keep_files: false` — stale artifacts not retained across deploys

**public/.nojekyll:**
- Already existed as an empty file (0 bytes), committed in prior build setup commit (2847ed9)
- `npm run build` confirmed: `dist/.nojekyll` present in output (Vite copies public/ files automatically)

## Deviations from Plan

### Pre-existing deploy.yml replacement

**Found during:** Task 1

The plan's `<action>` says "Create the directory .github/workflows/ if it does not exist, then create .github/workflows/deploy.yml". A deploy.yml already existed from a prior commit (2847ed9, `ci: Add GitHub Actions deploy workflow`) but did not match the plan's D-08/D-09 spec:
- Old file triggered on `develop` and added `workflow_dispatch`
- Old file used `actions/upload-pages-artifact@v5` + `actions/deploy-pages@v5` instead of `peaceiris/actions-gh-pages@v4`
- Old file had no lint or test gate
- Old file had Node 24 instead of Node 22

**Fix:** Replaced with the plan-compliant version per D-08 and D-09.

**Files modified:** `.github/workflows/deploy.yml`
**Commit:** 53b4d5a

### Pre-existing test failures (out of scope)

`npm run test` exits non-zero due to two pre-existing failures not caused by this plan:
1. `src/App.test.tsx` — cannot resolve `virtual:pwa-register/react` in Vitest environment (introduced by plan 05-01's `useRegisterSW` wiring; requires Vitest mock for the virtual PWA module)
2. `src/features/doctor-report/services/reportGenerator.test.ts` — edge case for "exactly 91 days" boundary (pre-existing logic bug in reportGenerator)

These failures exist on the `develop` branch independent of this plan's changes (`.github/workflows/deploy.yml` and `public/.nojekyll`). They are out of scope per the deviation scope boundary rule.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced beyond the planned CI/CD workflow.

## Self-Check: PASSED

- `.github/workflows/deploy.yml` — EXISTS
- `public/.nojekyll` — EXISTS (0 bytes)
- `dist/.nojekyll` — EXISTS after `npm run build`
- Commit 53b4d5a — EXISTS in git log
- All Task 1 acceptance criteria: PASS (grep checks all return expected counts)
