<!-- GSD:project-start source:PROJECT.md -->

## Project

**Little Words**

Little Words is a privacy-first, offline-capable Progressive Web App that helps parents track their child's speech and communication development. Parents log spoken word forms, the meanings each form expresses, and supporting gestures — building a structured record they can share with speech therapists and neurologists. All data lives on the parent's device; no account or server is required.

**Core Value:** A parent can walk into a specialist consultation and present objective, structured observations instead of relying on memory.

### Constraints

- **Hosting**: GitHub Pages — static files only; no server-side rendering
- **Routing**: Hash-based routing required (`/#/dashboard`) — GitHub Pages does not support history API rewriting
- **Build**: Vite `base` must match the repository slug (`/little-words/`)
- **Storage**: IndexedDB only — no backend, no account, no third-party database
- **Privacy**: No analytics, no tracking, no advertising; all data stays on device
- **Tech stack**: React + Vite + TypeScript; PWA with Service Worker for offline support
- **Single device**: No sync mechanism; JSON export is the explicit migration path between devices

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack at a Glance

| Layer | Library | Version |
|-------|---------|---------|
| Build / PWA | Vite + vite-plugin-pwa | Vite 7, vite-plugin-pwa 1.3.0 |
| UI Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Routing | React Router (hash mode) | 7.x (pin to v7, avoid v8 until stable) |
| IndexedDB | Dexie.js + dexie-react-hooks | 4.4.4 |
| Styling | Tailwind CSS v4 + Shadcn/UI + Radix UI | Tailwind 4.x |
| i18n | react-i18next + i18next | react-i18next 15.x, i18next 23.x |
| UI state | Zustand | 5.0.14 |
| Charts | Recharts | 2.x |

## Section 1 — Vite PWA Plugin

### What it does

### Current version

### Key configuration for this project

### Base path handling

### Hash routing and `navigateFallback`

### SW update flow

### Install in TypeScript

### What NOT to use

- **Manual service worker** — writing a custom SW from scratch is 2-3x more code for the same result; Workbox's `generateSW` strategy covers all pre-caching needs without boilerplate.
- **Workbox CLI standalone** — vite-plugin-pwa integrates Workbox into the Vite build graph; using Workbox CLI separately breaks incremental builds.

## Section 2 — IndexedDB Abstraction

### Why Dexie beats the alternatives

| Criterion | Dexie.js | idb | Raw IndexedDB |
|-----------|----------|-----|---------------|
| Many-to-many support | Compound indexes + join queries | Manual cursor iteration | Manual cursor iteration |
| TypeScript typing | Excellent — `EntityTable<T, K>` | Good — promise wrappers | Verbose |
| Schema versioning | `db.version(n).stores(...).upgrade()` | Manual | Manual |
| Reactive React | `useLiveQuery` (built-in) | None | None |
| Transaction safety | Automatic rollback | Manual | Manual |
| Bundle size (gzipped) | ~34 kB | ~4 kB | 0 kB |
| Cross-tab reactivity | Yes (Dexie v3.1+) | No | No |

### Schema pattern for this project

### Reactive query pattern

### What NOT to use

- **`idb`** — no reactive layer, no compound index query API; you end up reimplementing Dexie manually.
- **`localforage`** — key-value only, no indexing, no queries; wrong abstraction level for relational data.
- **`RxDB`** — overengineered for a single-user offline app; brings in RxJS and sync infrastructure you don't need.
- **`PouchDB`** — designed for CouchDB sync; sync is explicitly out of scope for v1.

## Section 3 — Routing

### Why React Router v7 (not v8)

- Drops `react-router-dom` package (you now import from `react-router/dom`)
- Requires Node 22.22.0+, React 19.2.7+, Vite 7+
- Removes several future flags as permanent behavior

### Configuration

### What NOT to use

- **`createBrowserRouter`** — requires server-side URL rewriting (a 404.html redirect hack for GitHub Pages). Fragile and unnecessary when hash routing is perfectly adequate.
- **`createMemoryRouter`** — no addressable URLs, no browser back/forward, breaks bookmarking.

## Section 4 — Internationalization (i18n)

### Bundle comparison

| Library | Gzipped bundle | Polish plurals | Offline (bundle translations) | Toolchain overhead |
|---------|---------------|----------------|-------------------------------|-------------------|
| react-i18next + i18next | ~22 kB | Yes (CLDR rules) | Yes | Low |
| react-intl (FormatJS) | ~13–18 kB | Yes (ICU) | Yes | Low |
| LinguiJS | ~3 kB | Yes (Intl.PluralRules) | Yes | High (macro compiler) |

### Why react-i18next wins

### Setup pattern

### What NOT to use

- **`react-intl`** — ICU syntax is more verbose for simple keys; overkill for a 2-language app with no complex message formatting.
- **`LinguiJS`** — better bundle, but requires a Babel/SWC macro step and `lingui compile` in CI; adds toolchain surface area for an MVP.
- **Manual `useState` + context** — breaks translation management at scale; no plural support; no fallback.

## Section 5 — Styling and Component Library

### Why this combination

- Zero runtime dependency on an external component package
- Full ownership of every component's styles and behavior
- Tree-shaking is automatic — unused components are never in the bundle
- Components are built on Radix UI primitives (fully accessible, keyboard-navigable)
- All components were updated for Tailwind v4 and React 19 (confirmed as of 2025)

### Mobile-first

### Vite setup

### What NOT to use

- **Chakra UI** — opinionated design system with its own CSS-in-JS runtime; heavier bundle, conflicts with Tailwind's utility-first model.
- **Material UI (MUI)** — Google Material Design aesthetic does not suit a "warm and friendly" medical-adjacent app; large bundle (~150 kB+ gzipped).
- **Tailwind v3** — v4 is the current release; starting a greenfield project on v3 is technical debt from day one.
- **CSS Modules alone** — no design system, no accessible primitives; reinventing the wheel.

## Section 6 — State Management

### The division of responsibility

| State type | Examples | Solution |
|------------|----------|----------|
| **Data state** (persisted, derived from IndexedDB) | Active meanings count, word form list, category counts | `useLiveQuery` from dexie-react-hooks |
| **UI state** (ephemeral, session-only) | Bottom sheet open, active tab, language setting in memory, form dirty flag | Zustand store |

### Why NOT TanStack Query

### Why NOT React Context for data

### Zustand store pattern

### What NOT to use

- **Redux / Redux Toolkit** — massive overkill; dropped by most teams in 2025 in favor of this Zustand + query combination.
- **TanStack Query** — wrong tool for local-only IndexedDB; adds a redundant cache layer.
- **Jotai / Recoil** — Zustand is simpler and has a larger ecosystem for this use case.

## Section 7 — PWA Manifest and Service Worker for GitHub Pages

### Critical: base path

- All built asset URLs (hashed filenames in `dist/`)
- The Vite-injected script/link tags in `index.html`
- The vite-plugin-pwa generated service worker scope and manifest path

### Manifest `start_url`

### Service worker scope

### `navigateFallback` — do not set it

### Deployment checklist

- `base: '/little-words/'` in `vite.config.ts`
- `start_url` and `scope` in manifest config include `/little-words/` prefix
- `dist/` directory contains `sw.js`, `manifest.webmanifest`, and `registerSW.js` at root of dist (which maps to `/little-words/` on GitHub Pages)
- GitHub Actions deploys `dist/` directory to `gh-pages` branch
- No `_config.yml` or `.nojekyll` bypasses needed beyond the standard `.nojekyll` file to prevent Jekyll processing

## Section 8 — Chart Library

### Bundle comparison

| Library | Gzipped size | React integration | Rendering |
|---------|-------------|-------------------|-----------|
| Recharts | ~136 kB (full) | Native React components | SVG |
| Chart.js + react-chartjs-2 | ~92 kB core + ~14 kB wrapper; tree-shakeable to ~25–35 kB | Wrapper (ref-based) | Canvas |
| Victory | ~180 kB | Native React components | SVG |

### Why Recharts wins despite larger bundle

### Shadcn chart component

### What NOT to use

- **Victory** — larger bundle than Recharts, lower adoption (fewer Stack Overflow answers), no Shadcn integration.
- **D3.js directly** — low-level; correct for complex custom visualizations, wrong for simple bar/line charts.
- **`react-chartjs-2` + Chart.js** — canvas-based; worse DX in React; tree-shaking helps but requires manual component registration.

## Installation Reference

# Core

# Shadcn / UI (copies components into src/)

# Dev dependencies

## Alternatives Considered

| Category | Recommended | Considered | Why Not |
|----------|-------------|------------|---------|
| IndexedDB | Dexie.js 4.x | idb | No reactive layer; manual cursor for relational joins |
| IndexedDB | Dexie.js 4.x | RxDB | Overengineered; brings RxJS + sync infrastructure |
| Routing | React Router v7 | React Router v8 | Too new; ecosystem catch-up still in progress |
| i18n | react-i18next | LinguiJS | Toolchain complexity (macro compiler) not worth bundle saving for 2-language MVP |
| i18n | react-i18next | react-intl | ICU syntax verbose; no compelling advantage over i18next for this scope |
| Styling | Tailwind + Shadcn | Chakra UI | CSS-in-JS runtime; heavier bundle; conflicts with Tailwind |
| Styling | Tailwind + Shadcn | MUI | Material Design aesthetic wrong for warm/friendly; large bundle |
| State | Zustand + useLiveQuery | TanStack Query | Wrong abstraction for local IndexedDB; no server to invalidate against |
| State | Zustand + useLiveQuery | Redux | Overkill for a single-user offline app |
| Charts | Recharts | Chart.js | Canvas-based; imperative; worse React DX |
| Charts | Recharts | Victory | Larger bundle; lower adoption |

## Sources

- [vite-plugin-pwa GitHub releases](https://github.com/vite-pwa/vite-plugin-pwa/releases) — v1.3.0 confirmed, May 2026
- [vite-plugin-pwa source types](https://github.com/vite-pwa/vite-plugin-pwa/blob/main/src/types.ts) — base config inheritance confirmed
- [vite-pwa-org workbox docs](https://vite-pwa-org.netlify.app/workbox/) — generateSW strategy, runtimeCaching
- [Dexie.js GitHub releases](https://github.com/dexie/Dexie.js/releases) — v4.4.4 confirmed, June 2026
- [Dexie React tutorial](https://dexie.org/docs/Tutorial/React) — useLiveQuery API
- [pkgpulse.com Dexie vs idb comparison 2026](https://www.pkgpulse.com/guides/dexie-vs-localforage-vs-idb-indexeddb-browser-storage-2026)
- [React Router v8 release blog](https://remix.run/blog/react-router-v8) — hash router unchanged, breaking changes listed
- [auto18n.com react i18n 2026](https://www.auto18n.com/en/blog/react-i18n-2026) — bundle size comparison
- [LinguiJS pluralization guide](https://lingui.dev/guides/plurals) — Intl.PluralRules + ICU
- [Shadcn/UI Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — v4 support confirmed
- [pkgpulse.com Chart.js vs Recharts 2026](https://www.pkgpulse.com/compare/chart.js-vs-recharts)
- [LogRocket best React chart libraries 2026](https://blog.logrocket.com/best-react-chart-libraries-2026/)
- [Zustand v5 release notes](https://pmnd.rs/blog/announcing-zustand-v5/) — v5.0.14 current

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
