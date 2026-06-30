# Little Words

![Status](https://img.shields.io/badge/status-planning-lightgrey)
![Version](https://img.shields.io/badge/version-0.1.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline--capable-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

A privacy-first, offline-capable Progressive Web App for parents tracking their child's speech and communication development.  
No account. No backend. No tracking. All data stays on your device.

> **In planning** — roadmap defined, development not yet started.

---

## What it does

Parents log **word forms** (the sounds their child produces), the **meanings** each form expresses, and supporting context — building a structured, timestamped record they can share with speech therapists and neurologists.

**Core value:** walk into a specialist consultation with objective, structured observations instead of relying on memory.

---

## Features (planned v1)

- **Child profile** — name, birth date, home languages, and optional clinical flags (prematurity, speech therapy, neurological care)
- **Word form logging** — FAB → bottom sheet entry with meaning autocomplete; categories from a fixed clinical vocabulary
- **Dashboard** — Active Meanings count as the primary metric; secondary cards for Word Forms, New This Month, and "Review these?" (meanings unused 30+ days)
- **Browse views** — scrollable Meanings, Word Forms, Categories, and Timeline lists with detail pages
- **Doctor Report** — one-tap generation of a structured plain-text summary covering age, vocabulary counts, categories, clinical flags, and parent notes; copies to clipboard
- **Data portability** — JSON export/import for full backup and device migration; CSV export of meanings for spreadsheet analysis
- **PWA** — fully offline after first load; installable on Android (install prompt) and iOS (Add to Home Screen); new-version notification toast

---

## Privacy

- No analytics, no advertising, no telemetry
- No user accounts, no login
- No server — all data lives in the browser's IndexedDB on your device
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
| i18n | react-i18next 15 + i18next 23 (Polish + English) |
| UI state | Zustand 5 |
| Charts | Recharts 2 |

---

## Roadmap

| Phase | What ships | Status |
|-------|-----------|--------|
| 1 — Foundation | Vite scaffold, Dexie schema v1, i18n, hash router shell | Not started |
| 2 — Onboarding & Data Entry | Child profile wizard, FAB → bottom sheet word logging | Not started |
| 3 — Browse Views | Dashboard, Meanings, Word Forms, Categories, Timeline | Not started |
| 4 — Doctor Report & Data Management | Report generation, JSON/CSV export & import | Not started |
| 5 — PWA Polish | Full offline, installability, update prompt | Not started |

---

## Getting started (once development begins)

```bash
git clone https://github.com/BielinskiLukasz/little-words.git
cd little-words
npm install
npm run dev
```

The app will be served at `http://localhost:5173/little-words/`.

---

## Deployment

Hosted on GitHub Pages at `/little-words/`. All asset paths are prefixed with this base path at build time; hash-based routing (`/#/path`) handles navigation without server-side rewrites.

```bash
npm run build   # outputs to dist/
```

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
