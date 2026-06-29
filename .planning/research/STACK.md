# Technology Stack

**Project:** Little Words — offline-first PWA vocabulary tracker
**Researched:** 2026-06-30
**Confidence:** MEDIUM (all findings from web sources; cross-checked against npm/GitHub releases)

---

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

---

## Section 1 — Vite PWA Plugin

**Recommendation:** `vite-plugin-pwa` v1.3.0

**Confidence:** MEDIUM

### What it does

Wraps Google Workbox inside Vite's plugin API. On build it generates a service worker (`sw.js`) and a web manifest (`manifest.webmanifest`), both placed at the configured `base` path. At runtime the SW pre-caches all built assets on first install, enabling full offline use.

### Current version

v1.3.0 (released May 5, 2026). Requires Vite 7+ and Node 16+. Uses Workbox v7 internally.

### Key configuration for this project

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/little-words/',          // GitHub Pages repo slug
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*'],     // cache everything for full offline
        navigateFallback: null,     // hash routing — no SPA fallback needed
      },
      includeAssets: ['**/*'],
      manifest: {
        name: 'Little Words',
        short_name: 'LittleWords',
        description: 'Track your child\'s vocabulary development',
        theme_color: '#f59e0b',     // warm amber
        background_color: '#fffbf5',
        display: 'standalone',
        start_url: '/little-words/#/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
```

### Base path handling

The plugin automatically defaults its internal `base` to whatever Vite's `base` is set to. Setting `base: '/little-words/'` in `vite.config.ts` is sufficient — no additional PWA-specific base override is needed.

### Hash routing and `navigateFallback`

Because this project uses hash-based routing (`/#/dashboard`), the browser never requests deep paths from the server — all routing happens client-side after `index.html` loads. Set `navigateFallback: null` to prevent the SW from intercepting all navigation requests unnecessarily. This simplifies offline behavior.

### SW update flow

The `registerType: 'autoUpdate'` setting silently updates the SW in the background. For this app (data stays local, no server to sync with) silent auto-update is safe. If you want a user-visible "reload for update" prompt, switch to `'prompt'` and implement the `onNeedRefresh` callback.

### Install in TypeScript

Add to `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "types": ["vite-plugin-pwa/client"]
  }
}
```

### What NOT to use

- **Manual service worker** — writing a custom SW from scratch is 2-3x more code for the same result; Workbox's `generateSW` strategy covers all pre-caching needs without boilerplate.
- **Workbox CLI standalone** — vite-plugin-pwa integrates Workbox into the Vite build graph; using Workbox CLI separately breaks incremental builds.

---

## Section 2 — IndexedDB Abstraction

**Recommendation:** `dexie` v4.4.4 + `dexie-react-hooks`

**Confidence:** MEDIUM

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

The ~30 kB premium over `idb` is justified entirely by `useLiveQuery`: it replaces an entire state management layer for data reads, making Zustand unnecessary for database-derived state.

### Schema pattern for this project

```ts
// src/db/schema.ts
import Dexie, { EntityTable } from 'dexie'

export interface WordForm {
  id: number
  form: string          // e.g. "pa"
  firstSeen: Date
  lastSeen: Date
  childId: number
}

export interface Meaning {
  id: number
  label: string         // e.g. "goodbye"
  categoryId: number
  spontaneous: boolean
  firstUsed: Date
  lastUsed: Date
  active: boolean
  childId: number
}

// Junction table for the many-to-many WordForm ↔ Meaning
export interface WordFormMeaning {
  id: number
  wordFormId: number
  meaningId: number
}

export class LittleWordsDB extends Dexie {
  wordForms!: EntityTable<WordForm, 'id'>
  meanings!: EntityTable<Meaning, 'id'>
  wordFormMeanings!: EntityTable<WordFormMeaning, 'id'>

  constructor() {
    super('LittleWordsDB')
    this.version(1).stores({
      wordForms: '++id, childId, firstSeen',
      meanings: '++id, childId, categoryId, active, lastUsed',
      wordFormMeanings: '++id, wordFormId, meaningId, [wordFormId+meaningId]',
    })
  }
}

export const db = new LittleWordsDB()
```

### Reactive query pattern

```ts
import { useLiveQuery } from 'dexie-react-hooks'

function ActiveMeaningsCount() {
  const count = useLiveQuery(
    () => db.meanings.where('active').equals(1).count()
  )
  return <span>{count ?? '...'}</span>
}
```

`useLiveQuery` automatically re-renders whenever `meanings` data changes anywhere (including from a service worker background write). No manual cache invalidation needed.

### What NOT to use

- **`idb`** — no reactive layer, no compound index query API; you end up reimplementing Dexie manually.
- **`localforage`** — key-value only, no indexing, no queries; wrong abstraction level for relational data.
- **`RxDB`** — overengineered for a single-user offline app; brings in RxJS and sync infrastructure you don't need.
- **`PouchDB`** — designed for CouchDB sync; sync is explicitly out of scope for v1.

---

## Section 3 — Routing

**Recommendation:** React Router v7.x with `createHashRouter`

**Confidence:** MEDIUM

### Why React Router v7 (not v8)

React Router v8.0.0 was released June 17, 2026. It is a breaking change release that:
- Drops `react-router-dom` package (you now import from `react-router/dom`)
- Requires Node 22.22.0+, React 19.2.7+, Vite 7+
- Removes several future flags as permanent behavior

v8 still supports hash routing — the `createHashRouter` API is unchanged. However, v8 has just shipped and the ecosystem (tutorials, Stack Overflow, IDE completions) has not caught up. Pin to v7.x for this project and plan an upgrade after the ecosystem stabilizes. v7 is actively maintained in parallel.

### Configuration

```ts
// src/router.tsx
import { createHashRouter, RouterProvider } from 'react-router-dom'
// or in v8: import { createHashRouter } from 'react-router/dom'

const router = createHashRouter([
  { path: '/', element: <Root /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/words', element: <WordFormsList /> },
  { path: '/words/:id', element: <WordFormDetail /> },
  { path: '/meanings', element: <MeaningsList /> },
  { path: '/meanings/:id', element: <MeaningDetail /> },
  { path: '/categories', element: <Categories /> },
  { path: '/timeline', element: <Timeline /> },
  { path: '/gestures', element: <Gestures /> },
  { path: '/settings', element: <Settings /> },
])
```

Hash routing produces URLs like `https://user.github.io/little-words/#/dashboard`. No server configuration needed — GitHub Pages serves the static `index.html` and the hash fragment handles in-app navigation.

### What NOT to use

- **`createBrowserRouter`** — requires server-side URL rewriting (a 404.html redirect hack for GitHub Pages). Fragile and unnecessary when hash routing is perfectly adequate.
- **`createMemoryRouter`** — no addressable URLs, no browser back/forward, breaks bookmarking.

---

## Section 4 — Internationalization (i18n)

**Recommendation:** `react-i18next` v15.x + `i18next` v23.x

**Confidence:** MEDIUM

### Bundle comparison

| Library | Gzipped bundle | Polish plurals | Offline (bundle translations) | Toolchain overhead |
|---------|---------------|----------------|-------------------------------|-------------------|
| react-i18next + i18next | ~22 kB | Yes (CLDR rules) | Yes | Low |
| react-intl (FormatJS) | ~13–18 kB | Yes (ICU) | Yes | Low |
| LinguiJS | ~3 kB | Yes (Intl.PluralRules) | Yes | High (macro compiler) |

### Why react-i18next wins

1. **Polish pluralization is correct out of the box.** Polish has four plural forms (1 item, 2-4 items, 5+ items, special cases). react-i18next maps these via i18next's Unicode CLDR plural keys: `_one`, `_few`, `_many`, `_other`. No extra configuration required.
2. **No lazy loading required.** For a 2-language app, bundle both locale files (`en.json`, `pl.json`) at build time — no dynamic imports, no network fetches, works offline from first load.
3. **Largest ecosystem.** Most React i18n tutorials and examples use react-i18next; tooling (e.g. i18next-scanner for key extraction) is mature.
4. **Simple API.** The `useTranslation` hook and `t()` function cover all cases in this app.

LinguiJS is the right call if bundle size is critical and you want to invest in the compile-time toolchain. For an MVP with 2 languages and no dynamic locale loading, the toolchain overhead (Babel/SWC macros, `lingui compile` step, `.po` file workflow) adds complexity without commensurate benefit.

### Setup pattern

```ts
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import pl from './locales/pl.json'

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, pl: { translation: pl } },
  lng: localStorage.getItem('language') ?? 'pl',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
```

### What NOT to use

- **`react-intl`** — ICU syntax is more verbose for simple keys; overkill for a 2-language app with no complex message formatting.
- **`LinguiJS`** — better bundle, but requires a Babel/SWC macro step and `lingui compile` in CI; adds toolchain surface area for an MVP.
- **Manual `useState` + context** — breaks translation management at scale; no plural support; no fallback.

---

## Section 5 — Styling and Component Library

**Recommendation:** Tailwind CSS v4 + Shadcn/UI + Radix UI primitives

**Confidence:** MEDIUM

### Why this combination

Shadcn/UI is not a traditional component library — it copies component source into `src/components/ui/`. This means:
- Zero runtime dependency on an external component package
- Full ownership of every component's styles and behavior
- Tree-shaking is automatic — unused components are never in the bundle
- Components are built on Radix UI primitives (fully accessible, keyboard-navigable)
- All components were updated for Tailwind v4 and React 19 (confirmed as of 2025)

Tailwind v4 brings OKLCH color space (better perceptual uniformity), a new `@tailwindcss/vite` plugin replacing `tailwind.config.js`, and improved CSS variable theming. For a "warm and friendly" mobile-first app, customize the theme directly in `src/index.css`:

```css
@layer base {
  :root {
    --color-primary: oklch(75% 0.18 60);      /* warm amber */
    --color-primary-foreground: oklch(15% 0.05 60);
    --color-background: oklch(98% 0.01 80);   /* warm off-white */
    --color-card: oklch(100% 0 0);
    --radius: 1rem;                            /* rounded for "friendly" feel */
  }
}
```

### Mobile-first

Tailwind is mobile-first by default (`sm:` = 640px, `md:` = 768px). For a PWA that lives on a phone, write styles without breakpoint prefix first and use `sm:`/`md:` only for tablet/desktop enhancements.

### Vite setup

```bash
npm create vite@latest little-words -- --template react-ts
npm install -D @tailwindcss/vite
npx shadcn@latest init
```

`vite.config.ts` plugin array: `[react(), tailwindcss(), VitePWA(...)]`.

### What NOT to use

- **Chakra UI** — opinionated design system with its own CSS-in-JS runtime; heavier bundle, conflicts with Tailwind's utility-first model.
- **Material UI (MUI)** — Google Material Design aesthetic does not suit a "warm and friendly" medical-adjacent app; large bundle (~150 kB+ gzipped).
- **Tailwind v3** — v4 is the current release; starting a greenfield project on v3 is technical debt from day one.
- **CSS Modules alone** — no design system, no accessible primitives; reinventing the wheel.

---

## Section 6 — State Management

**Recommendation:** `dexie-react-hooks` (`useLiveQuery`) for data state + `zustand` v5 for UI state

**Confidence:** MEDIUM

### The division of responsibility

This app has two distinct state concerns:

| State type | Examples | Solution |
|------------|----------|----------|
| **Data state** (persisted, derived from IndexedDB) | Active meanings count, word form list, category counts | `useLiveQuery` from dexie-react-hooks |
| **UI state** (ephemeral, session-only) | Bottom sheet open, active tab, language setting in memory, form dirty flag | Zustand store |

### Why NOT TanStack Query

TanStack Query is designed for HTTP server state — its core value proposition is cache invalidation against a remote source. IndexedDB is the source of truth, not a cache. Using TanStack Query with IndexedDB creates a second copy of data in memory with stale-while-revalidate semantics that don't make sense for local storage. `useLiveQuery` is the native reactive layer for Dexie and handles the same use cases with less code.

### Why NOT React Context for data

React Context re-renders the entire subtree on every state change. For a data layer with potentially hundreds of records, this causes cascading re-renders. `useLiveQuery` is fine-grained — it only re-renders the components that queried the affected data.

### Zustand store pattern

```ts
// src/store/ui.ts
import { create } from 'zustand'

interface UIState {
  addWordSheetOpen: boolean
  setAddWordSheetOpen: (open: boolean) => void
  activeLanguage: 'en' | 'pl'
  setActiveLanguage: (lang: 'en' | 'pl') => void
}

export const useUIStore = create<UIState>((set) => ({
  addWordSheetOpen: false,
  setAddWordSheetOpen: (open) => set({ addWordSheetOpen: open }),
  activeLanguage: (localStorage.getItem('language') as 'en' | 'pl') ?? 'pl',
  setActiveLanguage: (lang) => {
    localStorage.setItem('language', lang)
    set({ activeLanguage: lang })
  },
}))
```

### What NOT to use

- **Redux / Redux Toolkit** — massive overkill; dropped by most teams in 2025 in favor of this Zustand + query combination.
- **TanStack Query** — wrong tool for local-only IndexedDB; adds a redundant cache layer.
- **Jotai / Recoil** — Zustand is simpler and has a larger ecosystem for this use case.

---

## Section 7 — PWA Manifest and Service Worker for GitHub Pages

**Confidence:** MEDIUM

### Critical: base path

Everything hinges on a single Vite config line:

```ts
// vite.config.ts
export default defineConfig({
  base: '/little-words/',
  // ...
})
```

This propagates to:
- All built asset URLs (hashed filenames in `dist/`)
- The Vite-injected script/link tags in `index.html`
- The vite-plugin-pwa generated service worker scope and manifest path

The plugin reads Vite's `base` option and applies it automatically. No separate `buildBase` or manifest `scope` override is needed for a single-app deployment.

### Manifest `start_url`

```json
{
  "start_url": "/little-words/#/",
  "scope": "/little-words/"
}
```

The `start_url` must include the hash fragment to land correctly inside the app's router on install. The `scope` must be the base path, not the hash, because browsers compute scope from the URL origin.

### Service worker scope

The SW is registered at `/little-words/sw.js` and has a scope of `/little-words/`. All requests within that scope are interceptable. Hash routes (`#/dashboard`) never leave the scope — the browser resolves them as fragment identifiers within `/little-words/index.html`.

### `navigateFallback` — do not set it

For hash-routing apps, do NOT configure `navigateFallback: 'index.html'`. The browser never makes a navigation request to `/little-words/dashboard` — it only ever requests `/little-words/index.html` and then the JS handles the rest. Setting `navigateFallback` would cause the SW to intercept all requests and return `index.html`, which can break API calls and other resource fetches in future versions.

### Deployment checklist

- `base: '/little-words/'` in `vite.config.ts`
- `start_url` and `scope` in manifest config include `/little-words/` prefix
- `dist/` directory contains `sw.js`, `manifest.webmanifest`, and `registerSW.js` at root of dist (which maps to `/little-words/` on GitHub Pages)
- GitHub Actions deploys `dist/` directory to `gh-pages` branch
- No `_config.yml` or `.nojekyll` bypasses needed beyond the standard `.nojekyll` file to prevent Jekyll processing

---

## Section 8 — Chart Library

**Recommendation:** `recharts` v2.x

**Confidence:** MEDIUM

### Bundle comparison

| Library | Gzipped size | React integration | Rendering |
|---------|-------------|-------------------|-----------|
| Recharts | ~136 kB (full) | Native React components | SVG |
| Chart.js + react-chartjs-2 | ~92 kB core + ~14 kB wrapper; tree-shakeable to ~25–35 kB | Wrapper (ref-based) | Canvas |
| Victory | ~180 kB | Native React components | SVG |

### Why Recharts wins despite larger bundle

1. **Native React component API.** `<BarChart data={data}><Bar dataKey="count" /><XAxis /><YAxis /></BarChart>` — no refs, no `chartRef.current.update()`, no imperative lifecycle. Fits perfectly in a React functional component.
2. **Works with Shadcn/UI chart primitives.** Shadcn ships `components/ui/chart.tsx` built on top of Recharts — you get pre-styled, accessible chart wrappers for free if using Shadcn.
3. **Offline-safe.** SVG rendering means no canvas fingerprinting, no platform-specific canvas API differences, and the output is fully inspectable/accessible.
4. **Timeline view is simple.** This app needs one bar chart (monthly new meanings) and potentially one line chart (cumulative). Recharts handles both with 10 lines of JSX.

Chart.js's ~25–35 kB tree-shaken size advantage is real but requires registering components manually (`Chart.register(BarController, LinearScale, ...)`), fighting TypeScript types through the wrapper, and managing the canvas imperatively. The DX cost exceeds the bundle saving for a project of this size.

### Shadcn chart component

If using Shadcn, add the chart primitive:
```bash
npx shadcn@latest add chart
```
This installs a pre-configured `ChartContainer` and `ChartTooltip` that wraps Recharts with consistent theming.

### What NOT to use

- **Victory** — larger bundle than Recharts, lower adoption (fewer Stack Overflow answers), no Shadcn integration.
- **D3.js directly** — low-level; correct for complex custom visualizations, wrong for simple bar/line charts.
- **`react-chartjs-2` + Chart.js** — canvas-based; worse DX in React; tree-shaking helps but requires manual component registration.

---

## Installation Reference

```bash
# Core
npm install react react-dom
npm install react-router-dom@^7   # pin to v7
npm install dexie dexie-react-hooks
npm install i18next react-i18next
npm install zustand
npm install recharts

# Shadcn / UI (copies components into src/)
npx shadcn@latest init
npx shadcn@latest add button sheet dialog select badge card

# Dev dependencies
npm install -D vite @vitejs/plugin-react typescript
npm install -D vite-plugin-pwa
npm install -D @tailwindcss/vite
```

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

---

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
