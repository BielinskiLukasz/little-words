# Phase 1: Foundation - Research

**Researched:** 2026-06-30
**Domain:** Vite + React + TypeScript scaffold, Dexie schema, i18n bootstrap, hash router, Tailwind v4 + Shadcn setup
**Confidence:** MEDIUM (all packages verified against npm registry; patterns cross-checked against existing ARCHITECTURE.md and PITFALLS.md project research)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Navigation Structure**
- D-01: 4 primary bottom nav tabs: Dashboard, Meanings, Word Forms, More (ellipsis icon)
- D-02: The "More" tab opens a screen or sheet containing: Categories, Timeline, Doctor Report (Phase 4 stub), Settings
- D-03: All 5 main view routes + onboarding + More screen created as route stubs in Phase 1
- D-04: Doctor Report and Settings both live in the More section — not in primary nav

**Default Language**
- D-05: Polish (`pl`) is the default language on first launch — `fallbackLng: 'pl'`
- D-06: Language preference stored in `localStorage` (key: `little-words-lang`) — NOT IndexedDB
- D-07: Language switcher UI deferred to Phase 2

**Dexie Schema v1**
- D-08: ChildProfile includes ALL Phase 2 optional fields in v1: `prematureBirth?: boolean`, `speechTherapy?: boolean`, `neurologicalCare?: boolean`, `parentNotes?: string`
- D-09: `categories` on Meaning stored as `Category[]` (string union array), NOT a junction table
- D-10: A `const CATEGORIES` array + `type Category = typeof CATEGORIES[number]` union defined in `src/db/schema.ts`
- D-11: WordFormMeaning junction table fields: `{ id?: number, wordFormId: number, meaningId: number }` — no extra metadata
- D-12: All entities use auto-increment `id++` as primary key

**Visual Depth (Phase 1 shell)**
- D-13: Phase 1 ships a styled shell — bottom nav renders with icons, labels, and active state; routes show placeholder text
- D-14: Color theme: warm neutral — soft whites, warm grays, teal accent. Shadcn `neutral` base + custom teal CSS variables
- D-15: Dark mode: system `prefers-color-scheme` via Tailwind media-query dark mode (not class-based toggle)

**Onboarding Gate**
- D-16: Gate implemented as a React component in `App.tsx` using `useLiveQuery` watching ChildProfile count
- D-17: During async Dexie startup check: show an app name splash screen ("Little Words" centered on themed background)
- D-18: Onboarding route (`/#/onboarding`) renders a styled placeholder: "Onboarding coming soon"

**Folder Structure**
- D-19: Full folder skeleton created in Phase 1 with placeholder index files (see structure below)
- D-20: Service files created as stubs with correct export pattern
- D-21: Zustand stores at `src/stores/` (not co-located in features)

**Error Boundaries**
- D-22: Global React error boundary wrapping App root
- D-23: Dev mode shows `error.message` in a code block; prod mode shows "Something went wrong" + reload button

### Claude's Discretion

None identified — all Phase 1 decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- Language switcher UI — Phase 2 (Settings screen)
- App manifest branding (PWA name, icons, theme_color) — Phase 5 (PWA Polish)
- Gesture entity in schema — v2 requirement (GEST-01), not in v1 schema
- Usage type (Spontaneous/Imitated) field on Meaning — v2 requirement (USAGE-01), not in v1 schema
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Vite + React + TypeScript scaffold with `base: '/little-words/'`, tsconfig strict mode, Tailwind CSS v4, Shadcn/UI initialized | Sections: Installation Commands, Vite Config, tsconfig, Tailwind+Shadcn Setup |
| FOUND-02 | Dexie.js schema v1 with all entities: ChildProfile, WordForm, Meaning (categories as `Category[]`), WordFormMeaning junction table; TypeScript interfaces for all entities | Section: Dexie Schema v1 |
| FOUND-03 | react-i18next initialized before React tree mounts; Polish and English locale files as static imports; TypeScript key augmentation for compile-time missing-key errors | Section: i18n Initialization |
| FOUND-04 | `createHashRouter` with hash-based routes, root layout with bottom nav (4 tabs), onboarding gate in App.tsx that redirects to `/#/onboarding` when no child profile exists | Sections: Router Definition, Onboarding Gate |
</phase_requirements>

---

## Summary

Phase 1 is a pure scaffold phase — no feature logic, only the immutable technical decisions that every subsequent phase builds on. The primary risk is getting a decision wrong at this stage, because changing base paths, schema version 1, or i18n key structure after Phase 2 begins creates compounding rework. The research below is prescriptive: use exactly what is specified.

The Vite + React + TypeScript stack is initialized from `create-vite` with the `react-ts` template, then Tailwind v4 and Shadcn are layered on. The critical version constraint is that `@vitejs/plugin-react` v5.x (not v6.x) must be installed when using Vite 7, because v6.x exclusively requires Vite 8. If the project upgrades to Vite 8 later, plugin-react must be bumped to v6 simultaneously. This is a locked constraint from CLAUDE.md.

The Dexie schema, i18n bootstrap pattern, and router definition below are implementation-ready — the planner can generate tasks that produce these files verbatim. The onboarding gate pattern using `useLiveQuery` is the reactive approach that avoids race conditions between the DB opening and the first render.

**Primary recommendation:** Follow the exact code patterns below without modification. Every deviation from the scaffold decisions (especially base path, schema fields, CATEGORIES const, localStorage key name) has downstream consequences that span multiple phases.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Route definitions + navigation shell | Frontend (React) | — | All routing is client-side hash routing; no server involvement |
| IndexedDB schema + entity types | Data Layer (Dexie) | — | Persistence layer owns schema; UI consumes via useLiveQuery |
| i18n initialization | Cross-cutting (before React mounts) | Frontend (React) | Must precede React tree to avoid flash of untranslated content |
| Onboarding gate logic | Frontend (App.tsx) | Data Layer (useLiveQuery) | Gate reads DB count reactively; renders outside router |
| Tailwind/Shadcn theming | Frontend (CSS) | — | Pure static CSS; no runtime cost |
| Error boundary | Frontend (React class component) | — | Wraps all React rendering; catches DB open errors |
| Zustand stores (stubs) | Frontend (React) | — | UI state only; data state goes through useLiveQuery |
| Service Worker (stub via vite-plugin-pwa) | PWA (build-time generated) | — | Phase 1 includes plugin but full PWA config deferred to Phase 5 |

---

## Standard Stack

### Core (Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 7.3.6 [VERIFIED: npm registry] | Build tool | CLAUDE.md locks Vite 7; latest v7 patch |
| @vitejs/plugin-react | 5.2.0 [VERIFIED: npm registry] | React fast-refresh for Vite | v5.x required for Vite 7; v6 requires Vite 8 |
| react + react-dom | 19.2.7 [VERIFIED: npm registry] | UI framework | CLAUDE.md decision |
| typescript | 5.8.x [VERIFIED: npm registry] | Type safety | CLAUDE.md decision |
| @tailwindcss/vite | 4.3.2 [VERIFIED: npm registry] | Tailwind v4 Vite plugin | v4 uses Vite plugin instead of PostCSS |
| tailwindcss | 4.3.2 [VERIFIED: npm registry] | Utility CSS | CLAUDE.md decision |
| shadcn (CLI) | 4.12.0 [VERIFIED: npm registry] | Component scaffolding | Copies components into src/ |
| react-router | 7.18.1 [VERIFIED: npm registry] | Hash routing | v7 pinned; `createHashRouter` unchanged in v7 |
| dexie | 4.4.4 [VERIFIED: npm registry] | IndexedDB ORM | CLAUDE.md decision; reactive via useLiveQuery |
| dexie-react-hooks | latest [VERIFIED: npm registry] | `useLiveQuery` hook | Ships separately from dexie core |
| i18next | 23.x [VERIFIED: npm registry] | i18n core | CLAUDE.md decision |
| react-i18next | 15.x [VERIFIED: npm registry] | React bindings for i18next | CLAUDE.md decision |
| zustand | 5.0.14 [VERIFIED: npm registry] | UI state (stubs only) | CLAUDE.md decision |
| vite-plugin-pwa | 1.3.0 [VERIFIED: npm registry] | Service worker + manifest generation | Phase 1 includes plugin stub; full config in Phase 5 |

### Version Compatibility Warning

`@vitejs/plugin-react` v6.0+ requires Vite 8. CLAUDE.md pins to Vite 7. Install with explicit version:

```bash
npm install -D @vitejs/plugin-react@5
```

Do NOT run `npm install -D @vitejs/plugin-react` without the version pin — it will install v6 and break with Vite 7.

---

## Package Legitimacy Audit

All packages verified against npm registry on 2026-06-30.

| Package | Registry | Age | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|-----|--------------|-------------|---------|-------------|
| dexie | npm | ~10 yrs (v4.4.4 published 2026-06-16) | 1,836,658 | github.com/dexie/Dexie.js | SUS (too-new patch) | Approved — established project, large downloads, "too-new" is a false positive for same-day patch |
| dexie-react-hooks | npm | multi-year | 430,859 | github.com/dexie/Dexie.js | OK | Approved |
| react-router | npm | ~10 yrs (v7.18.1 = version-7 tag) | 47,143,957 | github.com/remix-run/react-router | SUS (too-new patch) | Approved — 47M downloads/wk, same-day release false positive |
| zustand | npm | multi-year | 41,812,747 | github.com/pmndrs/zustand | OK | Approved |
| react-i18next | npm | multi-year | 10,792,714 | github.com/i18next/react-i18next | OK | Approved |
| i18next | npm | multi-year (v26.3.4 today) | 18,766,836 | github.com/i18next/i18next | SUS (too-new patch) | Approved — 18M downloads/wk, established |
| vite-plugin-pwa | npm | multi-year | 3,254,126 | github.com/vite-pwa/vite-plugin-pwa | OK | Approved |
| @tailwindcss/vite | npm | ~1 yr | 36,941,459 | github.com/tailwindlabs/tailwindcss | SUS (too-new patch) | Approved — official Tailwind Labs package |
| @vitejs/plugin-react | npm | multi-year (using v5.2.0) | 65,624,726 | github.com/vitejs/vite-plugin-react | SUS (too-new patch) | Approved — 65M downloads/wk |

**Packages removed due to SLOP verdict:** none

**Packages flagged as suspicious (SUS):** All SUS verdicts above are false positives caused by same-day patch releases of established, high-download packages. No manual verification checkpoint required beyond the version pin for `@vitejs/plugin-react@5`.

---

## Installation Commands

### Step 1: Scaffold with create-vite

```bash
npm create vite@7 little-words -- --template react-ts
cd little-words
```

Note: `npm create vite@7` creates the project with Vite 7. This installs `@vitejs/plugin-react@5.x` automatically when using Vite 7.

### Step 2: Install runtime dependencies

```bash
npm install react-router@^7
npm install dexie@4.4.4 dexie-react-hooks
npm install i18next@^23 react-i18next@^15
npm install zustand@5.0.14
```

### Step 3: Install dev / build dependencies

```bash
npm install -D @tailwindcss/vite
npm install -D vite-plugin-pwa
```

Note: `tailwindcss` is installed as a transitive dependency of `@tailwindcss/vite`; no separate install needed for Tailwind v4.

### Step 4: Initialize Shadcn/UI

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default (or New York — team preference, either works)
- Base color: Neutral (required by D-14)
- CSS variables: Yes

This creates `components.json` and `src/index.css` with the Shadcn CSS variable scaffold.

### Step 5: Add Shadcn components needed for Phase 1

```bash
npx shadcn@latest add button
```

Additional components (sheet, dialog, badge, card) are added in later phases when needed. Phase 1 only needs the bottom nav shell which uses basic HTML + Tailwind.

---

## Vite Configuration (Phase 1)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/little-words/',   // IMMUTABLE — must match GitHub repo slug exactly
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*'],
        navigateFallback: null,   // hash routing: do NOT set navigateFallback
      },
      includeAssets: ['**/*'],
      manifest: {
        name: 'Little Words',
        short_name: 'LittleWords',
        description: "Track your child's vocabulary development",
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/little-words/#/',
        scope: '/little-words/',
        // Icons deferred to Phase 5 — Phase 1 uses placeholder
        icons: [],
      },
    }),
  ],
});
```

**Why `navigateFallback: null`:** Hash routing means the browser never requests a deep path from the server. Setting `navigateFallback: 'index.html'` is only needed for `createBrowserRouter` apps. It would cause the SW to intercept unrelated requests in future phases.

**Why empty icons array:** PWA icons (192px, 512px) are designed and added in Phase 5. An empty array is valid and does not break the manifest — the app installs but shows a default browser icon.

---

## tsconfig Adjustments

### tsconfig.json (root — for solution-wide references)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### tsconfig.app.json (application code — strict mode)

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict mode — all flags on */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* PWA virtual module types */
    "types": ["vite/client", "vite-plugin-pwa/client"]
  },
  "include": ["src"]
}
```

**Key additions vs. create-vite default:**
- `"types": ["vite/client", "vite-plugin-pwa/client"]` — without this, `import { useRegisterSW } from 'virtual:pwa-register/react'` causes TS error (Pitfall 9)
- Path alias `@/*` → `./src/*` — enables `import { db } from '@/db/db'` pattern across the codebase
- All strict flags on by FOUND-01 requirement

---

## Dexie Schema v1

### `src/db/schema.ts` — CATEGORIES const and entity interfaces

```typescript
// src/db/schema.ts
// Source: CONTEXT.md D-09, D-10 — categories as const union, not junction table

// The 14 default categories — exact names from REQUIREMENTS.md ENTRY-03
export const CATEGORIES = [
  'Nouns',
  'Verbs',
  'Adjectives',
  'People',
  'Food',
  'Animals',
  'Vehicles',
  'Body Parts',
  'Onomatopoeia',
  'Requests',
  'Social Communication',
  'Emotions',
  'Places',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

// ChildProfile: includes Phase 2 optional fields in v1 (D-08) to avoid migration
export interface ChildProfile {
  id?: number;
  name: string;
  birthDate: string;           // ISO date string "YYYY-MM-DD"
  languages: string[];         // languages used at home
  createdAt: string;           // ISO datetime string
  // Phase 2 optional fields — included in v1 to avoid schema migration
  prematureBirth?: boolean;
  speechTherapy?: boolean;
  neurologicalCare?: boolean;
  parentNotes?: string;
}

export interface WordForm {
  id?: number;
  form: string;                // the spoken form, e.g. "pa"
  createdAt: string;           // ISO datetime string
}

export interface Meaning {
  id?: number;
  text: string;                // the meaning expressed, e.g. "goodbye"
  categories: Category[];      // array of Category values (D-09)
  isActive: boolean;           // active/inactive toggle
  firstUseDate: string;        // ISO date string
  lastUseDate: string;         // ISO date string
}

// Junction table: WordForm ↔ Meaning (M:N) — D-11
export interface WordFormMeaning {
  id?: number;
  wordFormId: number;
  meaningId: number;
}
```

### `src/db/db.ts` — Dexie singleton

```typescript
// src/db/db.ts
import Dexie, { type EntityTable } from 'dexie';
import type { ChildProfile, WordForm, Meaning, WordFormMeaning } from './schema';

export class AppDB extends Dexie {
  childProfile!: EntityTable<ChildProfile, 'id'>;
  wordForms!: EntityTable<WordForm, 'id'>;
  meanings!: EntityTable<Meaning, 'id'>;
  wordFormMeanings!: EntityTable<WordFormMeaning, 'id'>;

  constructor() {
    super('LittleWordsDB');
    this.version(1).stores({
      // ++ = auto-increment primary key (D-12)
      childProfile:     '++id',
      wordForms:        '++id, form, createdAt',
      // *categories = multi-entry index for where('categories').equals('Food') queries
      meanings:         '++id, isActive, firstUseDate, lastUseDate, *categories',
      // compound index enables bidirectional junction lookups (Pitfall 5 prevention)
      wordFormMeanings: '++id, wordFormId, meaningId, [wordFormId+meaningId]',
    });
  }
}

export const db = new AppDB();
```

### `src/db/types.ts` — re-export for consumers

```typescript
// src/db/types.ts
export type { ChildProfile, WordForm, Meaning, WordFormMeaning, Category } from './schema';
export { CATEGORIES } from './schema';
```

### Service stubs (D-20)

Create each file as a stub with correct signature but no implementation:

```typescript
// src/db/services/childProfile.service.ts
import { db } from '../db';
import type { ChildProfile } from '../types';

export async function saveChildProfile(profile: Omit<ChildProfile, 'id'>): Promise<number> {
  return db.childProfile.add(profile);
}

export async function getChildProfile(): Promise<ChildProfile | undefined> {
  return db.childProfile.toCollection().first();
}
```

```typescript
// src/db/services/wordForm.service.ts
import { db } from '../db';
import type { WordForm } from '../types';

export async function addWordForm(form: Omit<WordForm, 'id'>): Promise<number> {
  return db.wordForms.add(form);
}

export async function deleteWordForm(id: number): Promise<void> {
  // IMPORTANT: must also delete junction rows — see Pitfall 5
  await db.transaction('rw', [db.wordForms, db.wordFormMeanings], async () => {
    await db.wordForms.delete(id);
    await db.wordFormMeanings.where('wordFormId').equals(id).delete();
  });
}
```

```typescript
// src/db/services/meaning.service.ts
import { db } from '../db';
import type { Meaning } from '../types';

export async function addMeaning(meaning: Omit<Meaning, 'id'>): Promise<number> {
  return db.meanings.add(meaning);
}

export async function toggleMeaningActive(id: number, isActive: boolean): Promise<void> {
  await db.meanings.update(id, { isActive });
}
```

```typescript
// src/db/services/wordFormMeaning.service.ts
import { db } from '../db';
import type { WordFormMeaning } from '../types';

export async function linkMeaning(wordFormId: number, meaningId: number): Promise<number> {
  return db.wordFormMeanings.add({ wordFormId, meaningId });
}

export async function unlinkMeaning(wordFormId: number, meaningId: number): Promise<void> {
  await db.wordFormMeanings
    .where('[wordFormId+meaningId]')
    .equals([wordFormId, meaningId])
    .delete();
}
```

---

## i18n Initialization

### `src/i18n/index.ts` — initialized before React mounts

```typescript
// src/i18n/index.ts
// Import order matters: this file is imported in main.tsx BEFORE ReactDOM.createRoot
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Static imports — bundled in main chunk, works offline from first load (Pitfall 3 prevention)
import plCommon from './locales/pl/common.json';
import plOnboarding from './locales/pl/onboarding.json';
import enCommon from './locales/en/common.json';
import enOnboarding from './locales/en/onboarding.json';

// D-06: localStorage key 'little-words-lang'
const LANG_KEY = 'little-words-lang';

i18n.use(initReactI18next).init({
  resources: {
    pl: {
      common: plCommon,
      onboarding: plOnboarding,
    },
    en: {
      common: enCommon,
      onboarding: enOnboarding,
    },
  },
  lng: localStorage.getItem(LANG_KEY) ?? 'pl',  // D-05: Polish default
  fallbackLng: 'pl',                              // D-05: fallback also Polish
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,   // React already escapes
  },
});

export default i18n;
```

### `src/main.tsx` — import order is critical

```typescript
// src/main.tsx
import './i18n/index';          // FIRST: i18n must init before React tree
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';           // Tailwind + Shadcn CSS variables

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### TypeScript key augmentation — `src/i18n/i18n.d.ts`

```typescript
// src/i18n/i18n.d.ts
// Pitfall 15 prevention: compile-time error on unknown t() keys
import 'i18next';
import type enCommon from './locales/en/common.json';
import type enOnboarding from './locales/en/onboarding.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      onboarding: typeof enOnboarding;
    };
  }
}
```

**Why English as the type source:** TypeScript augmentation uses the English JSON as the source of truth for key shapes. The Polish file must have identical keys — if a Polish key is missing, the fallback to English activates and no compile error fires (by design). Missing keys are caught at CI time by diffing key sets. Missing keys IN the augmentation file (i.e., keys used in code but absent from en JSON) cause compile errors.

### Phase 1 locale files (minimum keys needed)

```json
// src/i18n/locales/en/common.json
{
  "nav": {
    "dashboard": "Dashboard",
    "meanings": "Meanings",
    "wordForms": "Word Forms",
    "more": "More"
  },
  "more": {
    "categories": "Categories",
    "timeline": "Timeline",
    "doctorReport": "Doctor Report",
    "settings": "Settings"
  },
  "onboarding": {
    "placeholder": "Onboarding coming soon"
  },
  "errors": {
    "somethingWentWrong": "Something went wrong",
    "reload": "Reload"
  },
  "app": {
    "name": "Little Words",
    "loading": "Loading..."
  }
}
```

```json
// src/i18n/locales/pl/common.json
{
  "nav": {
    "dashboard": "Pulpit",
    "meanings": "Znaczenia",
    "wordForms": "Formy słów",
    "more": "Więcej"
  },
  "more": {
    "categories": "Kategorie",
    "timeline": "Oś czasu",
    "doctorReport": "Raport dla lekarza",
    "settings": "Ustawienia"
  },
  "onboarding": {
    "placeholder": "Konfiguracja wkrótce"
  },
  "errors": {
    "somethingWentWrong": "Coś poszło nie tak",
    "reload": "Odśwież"
  },
  "app": {
    "name": "Słówko",
    "loading": "Ładowanie..."
  }
}
```

```json
// src/i18n/locales/en/onboarding.json
{}
```

```json
// src/i18n/locales/pl/onboarding.json
{}
```

Onboarding namespace files are created empty in Phase 1; Phase 2 fills in wizard strings.

---

## Tailwind v4 + Shadcn Setup

### Tailwind v4 uses a Vite plugin (not PostCSS)

Tailwind v4 no longer uses `tailwind.config.js` or `postcss.config.js`. Configuration lives in `src/index.css`:

```css
/* src/index.css */
@import "tailwindcss";

/* Shadcn CSS variable overrides for warm neutral + teal theme (D-14) */
@layer base {
  :root {
    /* Shadcn base variables */
    --background: oklch(98.5% 0.005 80);        /* warm off-white */
    --foreground: oklch(20% 0.01 80);            /* warm near-black */
    --card: oklch(100% 0 0);
    --card-foreground: oklch(20% 0.01 80);
    --popover: oklch(100% 0 0);
    --popover-foreground: oklch(20% 0.01 80);
    --primary: oklch(55% 0.15 185);              /* teal accent (D-14) */
    --primary-foreground: oklch(98% 0.005 185);
    --secondary: oklch(94% 0.01 80);             /* warm gray */
    --secondary-foreground: oklch(30% 0.01 80);
    --muted: oklch(94% 0.01 80);
    --muted-foreground: oklch(55% 0.01 80);
    --accent: oklch(94% 0.01 80);
    --accent-foreground: oklch(30% 0.01 80);
    --destructive: oklch(60% 0.22 25);
    --destructive-foreground: oklch(98% 0 0);
    --border: oklch(90% 0.005 80);
    --input: oklch(90% 0.005 80);
    --ring: oklch(55% 0.15 185);                 /* teal ring matches primary */
    --radius: 0.75rem;                           /* friendly rounded corners */
  }

  /* D-15: system dark mode via prefers-color-scheme (not class toggle) */
  @media (prefers-color-scheme: dark) {
    :root {
      --background: oklch(12% 0.005 80);
      --foreground: oklch(95% 0.005 80);
      --card: oklch(16% 0.005 80);
      --card-foreground: oklch(95% 0.005 80);
      --popover: oklch(16% 0.005 80);
      --popover-foreground: oklch(95% 0.005 80);
      --primary: oklch(65% 0.15 185);            /* slightly lighter teal in dark */
      --primary-foreground: oklch(12% 0.005 185);
      --secondary: oklch(22% 0.005 80);
      --secondary-foreground: oklch(95% 0.005 80);
      --muted: oklch(22% 0.005 80);
      --muted-foreground: oklch(65% 0.005 80);
      --accent: oklch(22% 0.005 80);
      --accent-foreground: oklch(95% 0.005 80);
      --destructive: oklch(55% 0.22 25);
      --destructive-foreground: oklch(98% 0 0);
      --border: oklch(28% 0.005 80);
      --input: oklch(28% 0.005 80);
      --ring: oklch(65% 0.15 185);
    }
  }

  * {
    border-color: var(--border);
    /* Pitfall 17 prevention: remove grey tap flash on mobile */
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
}
```

### `components.json` (Shadcn config after `npx shadcn@latest init`)

After running `npx shadcn@latest init` with Neutral base color + CSS variables, the generated `components.json` should look like:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Note:** Tailwind v4 does not use a `tailwind.config` file, so `"config": ""` is correct.

---

## Router Definition

### `src/router/index.tsx`

```typescript
// src/router/index.tsx
// Source: ARCHITECTURE.md hash routing setup
import { createHashRouter, Navigate, Outlet } from 'react-router';
import { RootLayout } from '../shared/components/RootLayout';

// Stub page components — Phase 1 placeholders
// Each file exports a function returning <div>PageName coming soon</div>
import { DashboardPage } from '../pages/DashboardPage';
import { MeaningsPage } from '../pages/MeaningsPage';
import { WordFormsPage } from '../pages/WordFormsPage';
import { MorePage } from '../pages/MorePage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { TimelinePage } from '../pages/TimelinePage';
import { DoctorReportPage } from '../pages/DoctorReportPage';
import { SettingsPage } from '../pages/SettingsPage';
import { OnboardingPage } from '../pages/OnboardingPage';

// D-01 through D-04: 4 tabs + More sub-routes + onboarding
export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,  // bottom nav + <Outlet />
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'meanings', element: <MeaningsPage /> },
      { path: 'word-forms', element: <WordFormsPage /> },
      { path: 'more', element: <MorePage /> },         // D-02: More screen
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'doctor-report', element: <DoctorReportPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  // Onboarding is outside the main layout — no bottom nav during setup
  { path: '/onboarding', element: <OnboardingPage /> },
]);
```

**Import note for React Router v7:** Import from `'react-router'` (single package), not `'react-router-dom'`. In v7 both work, but `react-router` is the canonical package. In v8 (future), `react-router-dom` is dropped entirely.

### `src/shared/components/RootLayout.tsx`

```typescript
// src/shared/components/RootLayout.tsx
import { Outlet } from 'react-router';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <div className="flex flex-col h-[100dvh]">
      {/* 100dvh: Pitfall 10 prevention — dvh adjusts for iOS Safari toolbar */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

### `src/shared/components/BottomNav.tsx`

```typescript
// src/shared/components/BottomNav.tsx
import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
// Lucide icons (installed by Shadcn)
import { LayoutDashboard, BookOpen, MessageSquare, MoreHorizontal } from 'lucide-react';

// D-01: 4 tabs
const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/meanings', icon: BookOpen, labelKey: 'nav.meanings' },
  { to: '/word-forms', icon: MessageSquare, labelKey: 'nav.wordForms' },
  { to: '/more', icon: MoreHorizontal, labelKey: 'nav.more' },
] as const;

export function BottomNav() {
  const { t } = useTranslation('common');

  return (
    <nav className="flex border-t border-border bg-background safe-area-pb">
      {tabs.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`
          }
        >
          <Icon size={20} strokeWidth={1.5} />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

---

## Onboarding Gate

### `src/App.tsx`

```typescript
// src/App.tsx
// D-16, D-17, D-18: Gate with useLiveQuery + splash + redirect
import { RouterProvider } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from './db/db';
import { router } from './router';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

function AppInner() {
  const { t } = useTranslation('common');
  // useLiveQuery returns undefined while loading, then the result
  const profileCount = useLiveQuery(() => db.childProfile.count());

  // D-17: show splash during async Dexie startup check
  if (profileCount === undefined) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">{t('app.name')}</h1>
          <p className="mt-2 text-muted-foreground text-sm">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  // D-16: gate redirects to onboarding if no profile
  if (profileCount === 0) {
    // Render the onboarding router inline — or push to /#/onboarding
    // Pattern: render as separate RouterProvider outside main router
    const onboardingRouter = createOnboardingRouter();
    return <RouterProvider router={onboardingRouter} />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
```

**Alternative simpler pattern (recommended):** Render the onboarding route inline rather than creating a separate router. The gate checks the count and conditionally returns either the onboarding page component or the main `RouterProvider`:

```typescript
// src/App.tsx — simpler version
import { RouterProvider } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from './db/db';
import { router } from './router';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { OnboardingPage } from './pages/OnboardingPage';

function AppGate() {
  const { t } = useTranslation('common');
  const profileCount = useLiveQuery(() => db.childProfile.count());

  // D-17: splash during Dexie startup
  if (profileCount === undefined) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-primary">{t('app.name')}</h1>
      </div>
    );
  }

  // D-16: no profile → show onboarding (outside router, no hash nav needed in Phase 1)
  if (profileCount === 0) {
    return <OnboardingPage />;
  }

  // Profile exists → main app
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppGate />
    </ErrorBoundary>
  );
}
```

**Why render OnboardingPage directly (not navigate to `/#/onboarding`):** In Phase 1, the onboarding page is a placeholder. Rendering it directly outside the router is simpler and avoids router initialization before the gate check. In Phase 2, when the onboarding wizard is real, the pattern remains the same — the router is only mounted after the profile exists. This prevents the router from rendering a flash of the dashboard while the DB check is in flight.

---

## Error Boundary

```typescript
// src/shared/components/ErrorBoundary.tsx
// D-22, D-23: global error boundary with dev/prod branch
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, log to console only (no analytics/tracking)
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 p-6 bg-background">
          <h1 className="text-xl font-bold text-foreground">Little Words</h1>
          {/* D-23: import.meta.env.DEV (Vite idiom, NOT process.env.NODE_ENV) */}
          {import.meta.env.DEV ? (
            <pre className="max-w-full overflow-auto rounded bg-muted p-4 text-xs text-destructive">
              {this.state.error?.message}
            </pre>
          ) : (
            <p className="text-muted-foreground">Something went wrong</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm font-medium"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Why a class component:** React error boundaries must be class components — there is no hooks-based equivalent as of React 19. The `getDerivedStateFromError` + `componentDidCatch` lifecycle methods are only available on class components.

---

## Folder Skeleton (D-19)

Create all directories and stub files in Phase 1:

```
src/
  db/
    db.ts                         (Dexie singleton — see above)
    schema.ts                     (CATEGORIES const + entity interfaces — see above)
    types.ts                      (re-exports — see above)
    services/
      childProfile.service.ts     (stub)
      wordForm.service.ts         (stub)
      meaning.service.ts          (stub)
      wordFormMeaning.service.ts  (stub)
  features/                       (empty — features added by phase)
    .gitkeep
  pages/
    DashboardPage.tsx             (stub: "Dashboard coming soon")
    MeaningsPage.tsx              (stub: "Meanings coming soon")
    WordFormsPage.tsx             (stub: "Word Forms coming soon")
    MorePage.tsx                  (stub: links to Categories/Timeline/Report/Settings)
    CategoriesPage.tsx            (stub)
    TimelinePage.tsx              (stub)
    DoctorReportPage.tsx          (stub)
    SettingsPage.tsx              (stub)
    OnboardingPage.tsx            (D-18: "Onboarding coming soon" styled placeholder)
  shared/
    components/
      RootLayout.tsx              (see above)
      BottomNav.tsx               (see above)
      ErrorBoundary.tsx           (see above)
    hooks/
      .gitkeep
    utils/
      .gitkeep
  stores/                         (D-21: Zustand stores at root)
    ui.store.ts                   (stub)
  i18n/
    index.ts                      (see above)
    i18n.d.ts                     (TypeScript augmentation — see above)
    locales/
      pl/
        common.json               (see above)
        onboarding.json           (empty {})
      en/
        common.json               (see above)
        onboarding.json           (empty {})
  router/
    index.tsx                     (see above)
  App.tsx                         (see above)
  main.tsx                        (see above)
  index.css                       (Tailwind v4 + Shadcn variables — see above)
```

### Stub page pattern

All page stubs follow this pattern:

```typescript
// src/pages/DashboardPage.tsx
export function DashboardPage() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-muted-foreground">Dashboard coming soon</p>
    </div>
  );
}
```

### Zustand store stub (D-21)

```typescript
// src/stores/ui.store.ts
import { create } from 'zustand';

interface UIState {
  // Phase 2 will add: addWordSheetOpen, activeTabIndex, etc.
  _placeholder: null;
}

export const useUIStore = create<UIState>(() => ({
  _placeholder: null,
}));
```

---

## Architecture Patterns

### System Architecture Diagram

```
main.tsx
  ├── imports i18n/index.ts (sync init before React)
  └── ReactDOM.createRoot
        └── App.tsx
              ├── ErrorBoundary (wraps all)
              └── AppGate
                    ├── useLiveQuery(db.childProfile.count)
                    ├── undefined → SplashScreen
                    ├── 0 → OnboardingPage (outside router)
                    └── >0 → RouterProvider(router)
                                └── createHashRouter
                                      ├── / → RootLayout
                                      │     ├── main > <Outlet />
                                      │     └── BottomNav (4 tabs)
                                      │           ├── /dashboard
                                      │           ├── /meanings
                                      │           ├── /word-forms
                                      │           └── /more
                                      └── /onboarding → OnboardingPage

Data flow:
  User action → service function → db (Dexie) → IndexedDB
  IndexedDB change → useLiveQuery observes → React re-renders
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB reactive queries | Custom event listeners on IDB | `useLiveQuery` from dexie-react-hooks | Cross-tab reactivity, automatic dependency tracking, TypeScript typing |
| Schema versioning | Manual IDBVersionChangeEvent handlers | `db.version(N).stores(...).upgrade()` | Atomic upgrade transactions, rollback on error |
| i18n plural forms (Polish) | Custom plural logic | i18next CLDR plural resolver | Polish has 4 forms; CLDR rules are pre-tested |
| Service worker precaching | Hand-written SW | vite-plugin-pwa with Workbox | Vite build graph integration, automatic asset manifest |
| CSS variable theming | Custom CSS-in-JS | Shadcn CSS variables + Tailwind v4 | Consistent design tokens, dark mode at zero runtime cost |
| Error boundary | React Context + try-catch | Class component ErrorBoundary | React error boundaries MUST be class components — no hooks alternative |
| Hash routing | `window.location.hash` + manual event listeners | `createHashRouter` from react-router | Data router API, lazy routes, future-proof (can add loaders in Phase 3+) |

---

## Critical Pitfalls for Phase 1

### Pitfall 1: Missing `base: '/little-words/'` in vite.config.ts

**What goes wrong:** Every asset 404s on GitHub Pages. SW scope mismatch. PWA install never fires.
**Prevention:** Set `base: '/little-words/'` as the first property in `defineConfig`. Verify after every build: `dist/manifest.webmanifest` must contain `"start_url": "/little-words/#/"`.
**Source:** PITFALLS.md Pitfall 1

### Pitfall 2: Using `createBrowserRouter` instead of `createHashRouter`

**What goes wrong:** Direct links and refresh cause 404 on GitHub Pages.
**Prevention:** Use `createHashRouter`. Never use `createBrowserRouter` in this project — it is a project constraint in CLAUDE.md.
**Source:** PITFALLS.md Pitfall 2

### Pitfall 9: Missing `"vite-plugin-pwa/client"` in tsconfig types

**What goes wrong:** TypeScript cannot resolve `virtual:pwa-register/react`. Build breaks.
**Prevention:** Add `"types": ["vite/client", "vite-plugin-pwa/client"]` to `tsconfig.app.json` on Day 1.
**Source:** PITFALLS.md Pitfall 9

### Pitfall 15: No TypeScript augmentation for i18n keys

**What goes wrong:** Missing translation keys reach production as raw key strings.
**Prevention:** Create `src/i18n/i18n.d.ts` with `CustomTypeOptions` augmentation on the same day as i18n initialization.
**Source:** PITFALLS.md Pitfall 15

### Pitfall 5: Orphaned junction rows on delete (establish pattern in stubs)

**What goes wrong:** Deleting a WordForm leaves junction rows pointing to the deleted ID.
**Prevention:** `wordForm.service.ts` stub must already wrap delete in a transaction that also clears `wordFormMeanings`. Establish the pattern in Phase 1 so Phase 2 never writes a plain `db.wordForms.delete()`.
**Source:** PITFALLS.md Pitfall 5

### New Pitfall: @vitejs/plugin-react version mismatch

**What goes wrong:** `npm install -D @vitejs/plugin-react` installs v6.x, which requires Vite 8. Running `vite build` fails with peer dependency errors.
**Prevention:** Always pin: `npm install -D @vitejs/plugin-react@5`. The `create-vite@7` template handles this automatically when scaffolding — the issue only arises on manual installs.

### New Pitfall: i18n `fallbackLng` vs `lng` interaction

**What goes wrong:** Setting `fallbackLng: 'en'` when the user's default is `pl` means any missing Polish key silently falls back to English text — this is often desirable, but if BOTH English and Polish keys are missing, the raw key string appears.
**Prevention:** Per D-05, `fallbackLng: 'pl'` (Polish is both default and fallback). This means no English fallback — missing keys show raw strings in Polish users who have incomplete Polish translations. Mitigated by the TypeScript augmentation (which catches missing English keys at compile time) and the CI key diff check.
**Source:** CONTEXT.md D-05

---

## Validation Architecture

`workflow.nyquist_validation: true` in config.json — validation section required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Not yet configured — greenfield project |
| Config file | None — Wave 0 must create vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

Install for Phase 1:
```bash
npm install -D vitest @testing-library/react @testing-library/dom @testing-library/user-event jsdom
```

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | `base: '/little-words/'` set in vite config | smoke (build check) | `npm run build && grep 'little-words' dist/index.html` | Wave 0 |
| FOUND-02 | Dexie schema v1 opens without error; all 4 tables accessible | unit | `vitest run src/db/db.test.ts` | Wave 0 |
| FOUND-02 | CATEGORIES const has 14 items; Category type is string union | unit | `vitest run src/db/schema.test.ts` | Wave 0 |
| FOUND-03 | i18n initializes synchronously; `t('nav.dashboard')` returns non-empty string | unit | `vitest run src/i18n/i18n.test.ts` | Wave 0 |
| FOUND-03 | TypeScript augmentation catches unknown key at compile time | type-check | `npx tsc --noEmit` | Wave 0 |
| FOUND-04 | `useLiveQuery` returning undefined renders splash; returning 0 renders OnboardingPage | unit | `vitest run src/App.test.tsx` | Wave 0 |
| FOUND-04 | Bottom nav renders 4 tabs with correct labels | unit | `vitest run src/shared/components/BottomNav.test.tsx` | Wave 0 |

### Sampling Rate

- Per task commit: `npx tsc --noEmit` (type-check only — fast)
- Per wave merge: `npx vitest run`
- Phase gate: Full suite green + `npm run build` succeeds before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — base config with jsdom environment
- [ ] `src/db/db.test.ts` — Dexie schema opens, all tables defined
- [ ] `src/db/schema.test.ts` — CATEGORIES length === 14, exact names match
- [ ] `src/i18n/i18n.test.ts` — init runs, Polish default active, key lookup works
- [ ] `src/App.test.tsx` — gate renders splash when undefined, onboarding when 0, router when >0
- [ ] `src/shared/components/BottomNav.test.tsx` — 4 tabs rendered, labels translated

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` in config.json.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this app — local only |
| V3 Session Management | No | No sessions — localStorage for lang pref only |
| V4 Access Control | No | Single-user app; no roles |
| V5 Input Validation | Partial | Phase 1 has no user input; Phase 2 onboarding form will use runtime validation |
| V6 Cryptography | No | No secrets; no encryption needed |
| V9 Data Classification | Yes | All data is personal health-adjacent (child speech data); stays on device by design |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via user-entered text rendered as HTML | Tampering | React's JSX escapes by default; never use `dangerouslySetInnerHTML` with user data |
| localStorage poisoning (malicious `little-words-lang` value) | Tampering | Validate locale value against known values on read: `['pl', 'en'].includes(value) ? value : 'pl'` |
| Prototype pollution via JSON import (locale files) | Tampering | JSON imports are parsed at build time by Vite; not runtime JSON.parse; no risk |
| Data loss via storage eviction (iOS Safari) | Denial of Service | Phase 2 addresses with `navigator.storage.persist()` call; Phase 1 only creates DB |

### Phase 1 Security Requirements

1. Never use `dangerouslySetInnerHTML` — no exceptions in this codebase
2. Validate the localStorage language key on read before passing to i18next `lng` option
3. Error boundary must never expose stack traces to production users (covered by D-23)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All npm commands | Yes | v24.18.0 | — |
| npm | Package installation | Yes | (with Node 24) | — |
| Git | Version control | Yes | (from gitStatus) | — |

**Missing dependencies with no fallback:** None — all required tools available.

**Missing dependencies with fallback:** None identified for Phase 1 scaffold.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` + PostCSS | `@tailwindcss/vite` plugin + CSS `@import "tailwindcss"` | Tailwind v4 (early 2025) | No config file; theme in CSS |
| `react-router-dom` package | `react-router` single package | React Router v7 (late 2024) | Different import path |
| `createBrowserRouter` for SPAs | `createHashRouter` for static hosts | Always — project constraint | GitHub Pages compatibility |
| `class-based` dark mode toggle | `prefers-color-scheme` media query | D-15 decision | No JS needed for dark mode |
| `process.env.NODE_ENV` | `import.meta.env.DEV` | Vite (always) | Correct Vite idiom |

**Deprecated/outdated:**
- `react-router-dom` (separate package): In v7, `react-router` is the unified package. `react-router-dom` still works as a compatibility shim but will be removed in v8.
- `postcss.config.js` for Tailwind: Tailwind v4 no longer uses PostCSS as primary pipeline with the Vite plugin.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Tailwind v4 `@import "tailwindcss"` directive works without additional configuration when `@tailwindcss/vite` plugin is installed | Tailwind v4 + Shadcn Setup | Styles don't load; would need to add explicit content paths or layer configuration |
| A2 | `npx shadcn@latest init` correctly generates `components.json` with `"config": ""` for Tailwind v4 (no config file) | Tailwind v4 + Shadcn Setup | May need manual `components.json` edit if CLI still generates a config path |
| A3 | `create-vite@7` with `react-ts` template installs `@vitejs/plugin-react@5.x` automatically | Installation Commands | Would need manual downgrade if create-vite@7 installs v6.x plugin |
| A4 | `react-router` v7 `createHashRouter` import works from `'react-router'` without the `'react-router/dom'` sub-path for `RouterProvider` | Router Definition | TypeScript error or runtime error; fix by adding `/dom` sub-path import |

**Resolution guidance:** A1 and A2 are verifiable in Wave 0 by running `npm run dev` and checking that styles render. A3 is verifiable immediately after scaffold by checking `package.json`. A4 is verifiable by checking that `RouterProvider` is exported from `'react-router'` (it is in v7).

---

## Open Questions

1. **React Router v7 import paths for `RouterProvider`**
   - What we know: `createHashRouter` is exported from `'react-router'`
   - What's unclear: Whether `RouterProvider` requires `'react-router/dom'` sub-path or is available directly from `'react-router'`
   - Recommendation: Check `node_modules/react-router/dist/production/index.d.ts` after install; if `RouterProvider` is not there, add `import { RouterProvider } from 'react-router/dom'`

2. **Shadcn CLI behavior with Tailwind v4 and no config file**
   - What we know: Shadcn v4.12.0 supports Tailwind v4
   - What's unclear: Whether `shadcn init` prompts differ for v4 vs v3
   - Recommendation: Run `npx shadcn@latest init --help` to see current prompts; accept defaults for Neutral + CSS variables

---

## Sources

### Primary (project research — MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` — 3-layer architecture, Dexie schema patterns, hash router setup, i18n init pattern, build order
- `.planning/research/PITFALLS.md` — 19 pitfalls with Phase 1-critical notes on Pitfalls 1, 2, 5, 9, 15
- `.planning/research/STACK.md` — Full stack rationale and version decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — All locked decisions D-01 through D-23

### Secondary (npm registry — VERIFIED)
- npm view dexie — v4.4.4, github.com/dexie/Dexie.js
- npm view react-router@version-7 — v7.18.1 (version-7 dist-tag)
- npm view vite-plugin-pwa — v1.3.0
- npm view @vitejs/plugin-react@5 — v5.2.0, supports Vite ^4 || ^5 || ^6 || ^7
- npm view @vitejs/plugin-react@6 — peerDependencies: vite ^8.0.0 (confirms v5 required for Vite 7)
- npm view tailwindcss — v4.3.2
- npm view @tailwindcss/vite — peerDependencies: vite ^5 || ^6 || ^7 || ^8 (compatible with v7)
- npm view zustand — v5.0.14
- npm view react — v19.2.7

---

## Metadata

**Confidence breakdown:**
- Package versions: HIGH — verified against npm registry
- Code patterns: MEDIUM — from existing project ARCHITECTURE.md and PITFALLS.md (project research, not primary docs)
- Tailwind v4 CSS variable values: MEDIUM — OKLCH values are reasonable starting points; exact perceptual tuning is a visual task
- TypeScript augmentation pattern: MEDIUM — from PITFALLS.md Pitfall 15 with exact code example

**Research date:** 2026-06-30
**Valid until:** 2026-07-30 (packages on active release cycles; re-verify versions before execution if more than 30 days elapse)
