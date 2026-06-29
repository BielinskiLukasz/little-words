# Research Summary — Little Words

**Synthesized:** 2026-06-30
**Overall Confidence:** MEDIUM

---

## Executive Summary

Little Words is a privacy-first, offline-only PWA for tracking a child's speech and communication development. The core technical challenge is building a robust offline experience with relational local data on a static GitHub Pages host — no backend, no sync, no server-side routing. Research confirms this combination is well-supported: Vite + vite-plugin-pwa generates a fully offline-capable service worker; Dexie.js handles the relational many-to-many data model (WordForm to Meaning) with reactive `useLiveQuery` hooks that eliminate a separate state management layer; and hash-based routing sidesteps all GitHub Pages path limitations cleanly.

The feature set is clinically grounded. FEATURES.md research into speech-language pathology workflows establishes that the most important clinical data points are (1) the spontaneous vs. prompted distinction per meaning, (2) first-use and last-use dates for rate-of-acquisition tracking, and (3) active/inactive status to surface vocabulary regression. The Doctor Report is the primary value delivery moment. These three data attributes and the report must be implemented correctly from the start; they cannot be bolted on later without schema migration risk.

The most critical production risk is the immutability of Vite's `base` path and Dexie's schema version contract. Both must be set correctly before the first production deploy.

---

## Key Findings

### From STACK.md

- **Dexie.js 4.4.4** with `useLiveQuery` replaces TanStack Query for all database-derived state.
- **React Router v7.x with `createHashRouter`** required by GitHub Pages. Pin to v7 — v8 shipped June 17, 2026 and is ecosystem-immature.
- **react-i18next 15.x + i18next 23.x** handles Polish's four plural forms via CLDR rules. Bundle both locale files as static imports — no HTTP backend.
- **Tailwind CSS v4 + Shadcn/UI** (Radix primitives, accessible, no runtime dep). Do not start on Tailwind v3.
- **Zustand 5.x** for UI-only ephemeral state. All DB-derived state goes through `useLiveQuery`.
- **Recharts 2.x** integrates with Shadcn's chart primitive for the Timeline view.

### From FEATURES.md

Must ship in v1: child profile onboarding, FAB → bottom sheet word entry with meaning autocomplete and inline creation, spontaneous/prompted distinction, first-use and last-use dates (not occurrence log), active/inactive toggle from detail only, dashboard with active meanings count and "Review these?" card, Doctor Report (structured plain text → clipboard, 10 required fields), gesture tracking, JSON export/import, CSV export, PWA install + `navigator.storage.persist()`, Polish + English i18n.

Correctly deferred to v2: search/filter, custom categories, PDF report, attachments, multi-child, cloud backup, two-word combinations.

**Label correction:** The plan uses "Repeated" for entry type — clinical SLP terminology is **"Imitated"** (or "Prompted"). Update both the UI label and the Doctor Report to use "Spontaneous / Imitated" for legibility to specialists without explanation.

### From ARCHITECTURE.md

Three-layer architecture with one-way dependencies: UI calls Services; Services use DB singleton. Components never import `db` directly. Feature-based folder structure (`src/features/<name>/{components,hooks}`). Categories stored as `string[]` on Meaning with multi-entry index (`*categories`) — not a separate DB table. Onboarding rendered outside the main router. i18n namespaced into three files (`common`, `onboarding`, `report`). Build order is strictly dependency-ordered: DB schema → services → i18n → router → features in sequence.

### From PITFALLS.md

Nineteen pitfalls documented. Root causes: `base` path set too late, Dexie schema version misunderstood, iOS platform edge cases, i18n type safety not configured day one.

---

## Recommended Stack

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| Vite | 7.x | Build tool | MEDIUM |
| vite-plugin-pwa | 1.3.0 | SW + manifest via Workbox | MEDIUM |
| React | 19.x | UI framework | MEDIUM |
| TypeScript | 5.x | Type safety | MEDIUM |
| React Router | 7.x (pin) | Hash-based routing | MEDIUM |
| Dexie.js | 4.4.4 | IndexedDB with migrations | MEDIUM |
| dexie-react-hooks | 4.x | `useLiveQuery` reactive reads | MEDIUM |
| Tailwind CSS | 4.x | Mobile-first styling | MEDIUM |
| Shadcn/UI | latest | Accessible components (copied into src) | MEDIUM |
| Radix UI | latest (via Shadcn) | Accessible primitives | MEDIUM |
| Zustand | 5.x | Ephemeral UI state only | MEDIUM |
| react-i18next | 15.x | React i18n bindings | MEDIUM |
| i18next | 23.x | CLDR Polish plural rules | MEDIUM |
| Recharts | 2.x | Timeline charts (via Shadcn chart) | MEDIUM |
| @tailwindcss/vite | 4.x | Tailwind v4 Vite plugin | MEDIUM |

---

## Implications for Roadmap

**Phase 1 — Foundation (DB schema, services, i18n, router shell):** Must happen first. Dexie schema version and Vite `base` path are immutable after first production deploy. Deliver: `vite.config.ts` with `base: '/little-words/'`, Dexie schema v1 with all entities, TypeScript interfaces, service functions, i18n with TypeScript key augmentation, `createHashRouter` stubs, root layout with bottom nav, onboarding gate in `App.tsx`.

**Phase 2 — Onboarding + Core Data Entry:** Dashboard requires child profile to exist. Deliver: onboarding wizard, FAB → bottom sheet add-entry flow, meaning autocomplete with inline creation, spontaneous/imitated toggle, category multi-select, `navigator.storage.persist()` after first word, iOS install nudge after first word.

**Phase 3 — Browse Views:** Read-only aggregations validating the data model. Deliver: meanings list and detail with active/inactive toggle, word forms list and detail, categories view, timeline chart (Recharts), gestures list.

**Phase 4 — Doctor Report + Export/Import:** Report aggregates across all entities. Deliver: 10-field structured plain text report → clipboard, JSON export with `schemaVersion`, JSON import with version validation, CSV export.

**Phase 5 — PWA Polish + Deployment Verification:** Only verifiable end-to-end once app shell is stable. Deliver: manifest verification, SW update prompt (`onNeedRefresh` toast), iOS install instructions, storage persistence banner, GitHub Actions to `gh-pages`, Lighthouse audit passing, touch CSS polish.

---

## Watch Out For

1. **Wrong Vite `base` breaks the entire deployment (CRITICAL)** — Set `base: '/little-words/'` on day one. Verify `dist/manifest.webmanifest` after every build.

2. **Dexie schema version can never be decremented (CRITICAL)** — Every version bump is a one-way door. Maintain `SCHEMA_HISTORY.md`. Roll forward with N+1 if N had bugs.

3. **`createBrowserRouter` breaks all navigation on GitHub Pages (CRITICAL)** — Use `createHashRouter`. Never switch without a host supporting server-side rewrites.

4. **Orphaned junction rows corrupt data integrity (HIGH)** — Every WordForm delete must atomically delete its `WordFormMeaning` rows in a single `db.transaction('rw', ...)`. Add assertion in tests.

5. **iOS Safari evicts IndexedDB data after 7 days for non-installed apps (HIGH)** — Call `navigator.storage.persist()` after first data write. Frame iOS install instructions as a data-safety feature during onboarding.

6. **Polish pluralization breaks in production builds (MODERATE)** — Test `t('meaning', { count: 2 })` returns `_few` form in `npm run build && npm run preview`. Add as a smoke test.

7. **Bottom sheet content obscured by iOS Safari toolbar (MODERATE)** — Use `height: 100dvh` with `--vh` fallback. Add `padding-bottom: env(safe-area-inset-bottom)` to all fixed-bottom elements.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Cross-checked against releases; v7/v8 Router split is recent |
| Features | HIGH | Grounded in SLP clinical literature and MacArthur-Bates CDI |
| Architecture | MEDIUM | Official docs for Dexie/vite-plugin-pwa; folder structure from community sources |
| Pitfalls | MEDIUM | Specific Dexie issues confirmed against GitHub issues; iOS edge cases need device testing |

**Key gaps:** Doctor Report format not validated with actual SLPs. React Router v8 pin should be revisited in 3–6 months. Multi-entry index (`*categories`) query shape should be tested in Phase 1 before building category queries throughout.

---

## Sources

| File | Summary |
|------|---------|
| `STACK.md` | Library selection with version pins, rationale, and explicit rejections for every alternative. |
| `FEATURES.md` | Clinical research into SLP workflows; table stakes, domain features, anti-features, Doctor Report requirements. |
| `ARCHITECTURE.md` | Three-layer architecture, Dexie schema, feature folder structure, build order with dependency graph. |
| `PITFALLS.md` | 19 pitfalls (critical/moderate/minor) covering base path, schema versioning, iOS, routing, junction rows, i18n. |
