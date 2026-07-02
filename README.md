# Little Words

![Status](https://img.shields.io/badge/status-early_development-orange)
![Version](https://img.shields.io/badge/version-0.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline--capable-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

A privacy-first, offline-capable Progressive Web App for parents tracking their child's speech and communication development.  
No account. No backend. No tracking. All data stays on your device.

---

## What it does

Parents log **word forms** (the sounds their child produces), the **meanings** each form expresses, and supporting context — building a structured, timestamped record they can share with speech therapists and neurologists.

**Core value:** walk into a specialist consultation with objective, structured observations instead of relying on memory.

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

- No analytics, no advertising, no telemetry
- No user accounts, no login
- No server — all data lives in IndexedDB on your device
- JSON export is the explicit migration path between devices

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Build | Vite 7 + vite-plugin-pwa 1.3 |
| UI | React 19 + TypeScript 5 |
| Routing | React Router v7 (hash mode — required for GitHub Pages) |
| Database | Dexie.js 4.4 (IndexedDB) |
| Styling | Tailwind CSS v4 + Shadcn/UI + Radix UI |
| Forms | react-hook-form 7 + Zod 4 |
| i18n | react-i18next 15 + i18next 23 (Polish + English) |
| UI state | Zustand 5 |
| Charts | Recharts 2 |

---

## Getting started

```bash
git clone https://github.com/BielinskiLukasz/little-words.git
cd little-words
npm install
npm run dev
```

The app is served at `http://localhost:5173/little-words/`.

```bash
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build locally
npm test           # run tests once (Vitest)
npm run test:watch # run tests in watch mode
npm run lint       # ESLint
```

---

## Deployment

Hosted on GitHub Pages at `/little-words/`. GitHub Actions deploys automatically on push to `main` or `develop` — builds with Node 24, runs `npm ci && npm run build`, and publishes `dist/` to the `gh-pages` branch.

All asset paths are prefixed with `/little-words/` at build time; hash-based routing (`/#/path`) handles client-side navigation without server rewrites.

---

## Data model

Stored in IndexedDB (Dexie schema v2):

| Table | Key fields |
|-------|-----------|
| `childProfile` | name, birthDate, languages, clinical flags, parentNotes |
| `wordForms` | form text, createdAt |
| `meanings` | text, categories[], isActive, firstUseDate, lastUseDate |
| `wordFormMeanings` | join table linking word forms to meanings |

14 predefined categories: Nouns, Verbs, Adjectives, People, Food, Animals, Vehicles, Body Parts, Onomatopoeia, Requests, Social Communication, Emotions, Places, Other.

---

## Roadmap

| Phase | What ships | Status |
|-------|-----------|--------|
| 1 — Foundation | Vite scaffold, Dexie schema v2, i18n, hash router shell | Done |
| 2 — Onboarding & Data Entry | Child profile wizard, FAB → bottom sheet word logging | In progress |
| 3 — Browse Views | Meanings, Word Forms, Categories, Timeline detail pages | Not started |
| 4 — Doctor Report & Data Management | Report generation, JSON/CSV export & import | Not started |
| 5 — PWA Polish | Full offline, update prompt, installability testing | Not started |

---

## Out of scope (v1)

| Feature | Reason |
|---------|--------|
| Developmental norms / milestone comparison | Not a diagnostic tool; never compares children against standards |
| Multi-device sync | No backend; JSON export is the migration path |
| User accounts | Privacy-first; parent owns all data locally |
| Occurrence logging (every use) | Only first + last date tracked; reduces entry burden |

---

## License

Released under the [MIT License](LICENSE).
