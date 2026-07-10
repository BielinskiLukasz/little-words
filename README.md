# Little Words

[![Deploy to GitHub Pages](https://github.com/BielinskiLukasz/little-words/actions/workflows/deploy.yml/badge.svg)](https://github.com/BielinskiLukasz/little-words/actions/workflows/deploy.yml)
![Status](https://img.shields.io/badge/status-early_development-orange)
![Version](https://img.shields.io/badge/version-0.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline--capable-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

A privacy-first, offline-capable Progressive Web App for parents tracking their child's speech and communication development.

**No account. No backend. No tracking. All data stays on your device.**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Privacy](#privacy)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Out of Scope (v1)](#out-of-scope-v1)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

Little Words gives parents a structured way to log the word forms their child produces, the meanings each form expresses, and supporting context — building a timestamped record they can share with speech therapists and neurologists.

**Core value:** walk into a specialist consultation with objective, structured observations instead of relying on memory.

The primary metric is **active meanings**, not word count — one spoken form can express multiple meanings, so the app models the `WordForm ↔ Meaning` relationship as many-to-many.

---

## Features

### Built

- **Child profile** — name, birth date, home languages, optional clinical flags (prematurity, speech therapy, neurological care)
- **Onboarding wizard** — guided first-run setup
- **Dashboard** — Active Meanings count as the primary metric; secondary cards for Word Forms, New This Month, and "Review these?" (meanings unused 30+ days); personalised greeting
- **Settings** — language switcher (English / Polish), profile edit link, data management placeholder, about section
- **iOS install prompt** — Add to Home Screen guidance for Safari users
- **Hash routing** — full navigation shell: Dashboard, Meanings, Word Forms, Categories, Timeline, Doctor Report, Settings

### Planned (v1)

- **Word form logging** — FAB → bottom sheet entry with meaning autocomplete; 14 clinical categories
- **Browse views** — scrollable Meanings, Word Forms, Categories, and Timeline lists with detail pages
- **Doctor Report** — one-tap generation of a structured plain-text summary; copies to clipboard
- **Data portability** — JSON export/import for backup and device migration; CSV export for spreadsheet analysis
- **Full PWA** — offline after first load; new-version notification toast

---

## Privacy

| Guarantee | Detail |
|-----------|--------|
| No analytics | No tracking scripts, no telemetry, no advertising |
| No accounts | No login, no email, no passwords |
| No server | All data lives in IndexedDB on the parent's device |
| Device migration | JSON export is the explicit, documented migration path |

Little Words is intentionally not a diagnostic tool and does not compare a child's development against norms or milestones.

---

## Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Build / PWA | Vite + vite-plugin-pwa | Vite 7, plugin 1.3 |
| UI | React + TypeScript | React 19, TS 5 |
| Routing | React Router (hash mode) | v7 |
| Database | Dexie.js (IndexedDB) | 4.4 |
| Styling | Tailwind CSS + Shadcn/UI + Radix UI | Tailwind 4 |
| Forms | react-hook-form + Zod | RHF 7, Zod 4 |
| i18n | react-i18next + i18next | react-i18next 15, i18next 23 |
| UI state | Zustand | 5 |
| Charts | Recharts | 2 |

Hash-based routing (`/#/path`) is required because the app is hosted on GitHub Pages, which cannot rewrite arbitrary paths to `index.html`.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 24 (matches CI) |
| npm | Bundled with Node 24 |
| Browser | Any modern browser; Safari on iOS requires "Add to Home Screen" for full PWA features |

---

## Getting Started

```bash
git clone https://github.com/BielinskiLukasz/little-words.git
cd little-words
npm install
npm run dev
```

The development server starts at **`http://localhost:5173/little-words/`**.

---

## Development

### Available commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Type-check, then produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally for manual testing |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run tests in interactive watch mode |
| `npm run lint` | Run ESLint across the source tree |

### Testing

Tests run in a jsdom environment via Vitest. IndexedDB is provided by `fake-indexeddb`, so tests are fully self-contained — no browser required.

```bash
npm test                  # single run (used in CI)
npm run test:watch        # watch mode during development
```

Test files live alongside the code they test (`*.test.ts` / `*.test.tsx`).

### Environment

No `.env` file is required for local development. All configuration is derived from `vite.config.ts`.

---

## Project Structure

```
little-words/
├── src/
│   ├── components/ui/        # Shadcn/UI primitives
│   ├── db/                   # Dexie schema, types, and service layer
│   │   └── services/         # Per-entity CRUD (childProfile, meaning, wordForm, …)
│   ├── features/             # Self-contained feature slices
│   │   ├── add-entry/        # FAB + bottom sheet word logging
│   │   ├── ios-install/      # Safari install prompt
│   │   ├── onboarding/       # First-run wizard
│   │   └── settings/         # App settings panel
│   ├── i18n/                 # i18next config + locale files (en/, pl/)
│   ├── pages/                # Route-level page components
│   ├── router/               # Hash router definition
│   ├── shared/               # Cross-cutting components, hooks, utils
│   └── stores/               # Zustand UI state store
├── public/                   # Static assets (icons, manifest)
├── .github/workflows/        # GitHub Actions CI/CD
├── .planning/                # GSD planning artifacts (not shipped)
├── vite.config.ts
├── vitest.config.ts
└── components.json           # Shadcn/UI configuration
```

---

## Data Model

Stored in IndexedDB (Dexie schema v2):

| Table | Key fields |
|-------|------------|
| `childProfile` | name, birthDate, languages, clinical flags, parentNotes |
| `wordForms` | form text, createdAt |
| `meanings` | text, categories[], isActive, firstUseDate, lastUseDate |
| `wordFormMeanings` | join table — links word forms to meanings (many-to-many) |

**14 predefined categories:** Nouns, Verbs, Adjectives, People, Food, Animals, Vehicles, Body Parts, Onomatopoeia, Requests, Social Communication, Emotions, Places, Other.

A meaning survives the deletion of any word form that expressed it, preserving the semantic record.

---

## Deployment

The app is hosted on **GitHub Pages** at `https://BielinskiLukasz.github.io/little-words/`.

GitHub Actions deploys automatically on every push to `main` or `develop`:

1. Checks out the repository on Node 24
2. Runs `npm ci && npm run build`
3. Publishes `dist/` to the `gh-pages` branch via `actions/deploy-pages`

All built asset paths are prefixed with `/little-words/` at build time (`base` in `vite.config.ts`). Client-side navigation uses hash-based routing (`/#/path`) and requires no server-side URL rewriting.

To trigger a manual deploy, use **Actions → Deploy to GitHub Pages → Run workflow** in the GitHub UI.

---

## Roadmap

| Phase | What ships | Status |
|-------|------------|--------|
| 1 — Foundation | Vite scaffold, Dexie schema v2, i18n, hash router shell | Done |
| 2 — Onboarding & Data Entry | Child profile wizard, FAB → bottom sheet word logging | In progress |
| 3 — Browse Views | Meanings, Word Forms, Categories, Timeline detail pages | Not started |
| 4 — Doctor Report & Data Management | Report generation, JSON/CSV export & import | Not started |
| 5 — PWA Polish | Full offline support, update prompt, installability testing | Not started |

---

## Out of Scope (v1)

| Feature | Reason |
|---------|--------|
| Developmental norms / milestone comparison | Not a diagnostic tool; the app never compares children against standards |
| Multi-device sync | No backend; JSON export is the migration path |
| User accounts | Privacy-first; the parent owns all data locally |
| Per-occurrence logging | Only first + last use date tracked; reduces daily entry burden |

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch from `develop`.
2. Run `npm install` and confirm `npm test` passes before making changes.
3. Keep commits small and focused; write a clear commit message.
4. Open a pull request against `develop` (not `main`).
5. Ensure `npm run build` and `npm test` both pass in CI before requesting a review.

If you are reporting a bug, please include the browser and OS version, steps to reproduce, and the expected vs. actual behaviour.

---

## Troubleshooting

**The app does not load at `localhost:5173`.**
Make sure you are navigating to `http://localhost:5173/little-words/` — the `/little-words/` base path is required even in development.

**Data is not persisting between sessions.**
Little Words stores data in IndexedDB. Make sure your browser is not set to clear site data on exit, and that you are not using Private/Incognito mode (some browsers restrict IndexedDB in private sessions).

**The iOS "Add to Home Screen" prompt does not appear.**
The prompt is shown only in Safari on iOS. Chrome and Firefox on iOS use the same rendering engine but do not support PWA installation via the browser banner.

**Build fails with a TypeScript error.**
Run `npm run build` locally to see the full error. The project enforces `strict`, `noUnusedLocals`, and `noUnusedParameters` — all unused imports and variables must be removed before the build succeeds.

**The service worker is serving stale content after a deploy.**
The PWA is configured with `registerType: 'autoUpdate'`. Hard-refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) or clear the browser cache if the update prompt does not appear within a few seconds of loading the updated app.

---

## License

Released under the [MIT License](LICENSE). Copyright © 2026 Łukasz Bieliński.
