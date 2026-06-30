# Phase 1: Foundation - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the immutable technical scaffold — every decision that cannot be changed after first deploy. Specifically: Vite + React + TypeScript project initialized with `base: '/little-words/'`, Dexie schema v1 with all entities and TypeScript interfaces, react-i18next initialized with Polish default before React mounts, and a hash router shell with bottom nav (4 tabs + More overflow) and onboarding gate. All routes created as stubs. No feature logic.

</domain>

<decisions>
## Implementation Decisions

### Navigation Structure
- **D-01:** 4 primary bottom nav tabs: **Dashboard**, **Meanings**, **Word Forms**, **More** (ellipsis icon)
- **D-02:** The "More" tab opens a screen or sheet containing: Categories, Timeline, Doctor Report (Phase 4 stub), Settings
- **D-03:** All 5 main view routes + onboarding + More screen created as route stubs in Phase 1
- **D-04:** Doctor Report and Settings both live in the More section — not in primary nav

### Default Language
- **D-05:** Polish (`pl`) is the default language on first launch — `fallbackLng: 'pl'`
- **D-06:** Language preference stored in `localStorage` (key: `little-words-lang`) — NOT IndexedDB; avoids async complication in i18n bootstrap
- **D-07:** Language switcher UI deferred to Phase 2 (Settings screen scope)

### Dexie Schema v1
- **D-08:** ChildProfile includes ALL Phase 2 optional fields in v1: `prematureBirth?: boolean`, `speechTherapy?: boolean`, `neurologicalCare?: boolean`, `parentNotes?: string` — avoids schema migration for Phase 2
- **D-09:** `categories` on Meaning stored as `Category[]` (string union array), NOT a junction table
- **D-10:** A `const CATEGORIES` array + `type Category = typeof CATEGORIES[number]` union defined in `src/db/schema.ts` — compile-time safety for all 14 default categories
- **D-11:** WordFormMeaning junction table fields: `{ id?: number, wordFormId: number, meaningId: number }` — no extra metadata
- **D-12:** All entities use auto-increment `id++` as primary key

### Visual Depth (Phase 1 shell)
- **D-13:** Phase 1 ships a **styled shell** — bottom nav renders with icons, labels, and active state; color theme and Shadcn/UI CSS variables configured; routes show placeholder text ("Dashboard coming soon" etc.)
- **D-14:** Color theme: warm neutral — soft whites, warm grays, teal accent. Shadcn `neutral` base + custom teal CSS variables
- **D-15:** Dark mode: system `prefers-color-scheme` via Tailwind media-query dark mode (not class-based toggle) — automatic, no toggle UI needed in Phase 1

### Onboarding Gate
- **D-16:** Gate implemented as a React component in `App.tsx` using `useLiveQuery` watching ChildProfile count — reactive, auto-redirects when profile is created
- **D-17:** During async Dexie startup check: show an **app name splash screen** ("Little Words" centered on themed background)
- **D-18:** Onboarding route (`/#/onboarding`) renders a styled placeholder: "Onboarding coming soon" — functional for gate testing in Phase 1

### Folder Structure
- **D-19:** Full folder skeleton created in Phase 1 with placeholder index files:
  ```
  src/
    db/
      db.ts               (Dexie singleton)
      schema.ts           (version def + CATEGORIES const + entity interfaces)
      types.ts            (re-exports for consumers)
      services/
        childProfile.service.ts
        wordForm.service.ts
        meaning.service.ts
        wordFormMeaning.service.ts
    features/             (empty, features added by phase)
    pages/                (route shell components)
    shared/
      components/         (shared UI)
    stores/               (Zustand stores at root — cross-feature UI state)
    i18n/
      index.ts            (react-i18next init)
      locales/
        pl.ts
        en.ts
    router/
      index.tsx           (createHashRouter definition)
  ```
- **D-20:** Service files created as stubs with correct export pattern — Phase 2 fills in queries
- **D-21:** Zustand stores at `src/stores/` (not co-located in features) — cross-feature UI state

### Error Boundaries
- **D-22:** Global React error boundary wrapping App root — catches Dexie failures and unhandled render errors
- **D-23:** Error screen behavior: **dev mode** shows app name + technical `error.message` in a code block + reload button; **prod mode** shows app name + "Something went wrong" + reload button (`window.location.reload()`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Requirements
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-04 are the v1 requirements for this phase; also defines all entity fields and category list
- `.planning/ROADMAP.md` §Phase 1 — Phase goal, success criteria, and dependency declaration
- `.planning/PROJECT.md` §Constraints — Immutable constraints (GitHub Pages, hash routing, Vite base path, IndexedDB-only)

### Architecture Research
- `.planning/research/ARCHITECTURE.md` — 3-layer architecture (UI → Service → Data), folder structure proposal, component boundary rules
- `.planning/research/STACK.md` — Tech stack rationale and version decisions
- `.planning/research/PITFALLS.md` — Known pitfalls to avoid during implementation

### Tech Stack Decisions (from CLAUDE.md)
- `.claude/CLAUDE.md` §Technology Stack — Full recommended stack with versions and "What NOT to use" sections for every layer

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project. No existing components, hooks, or utilities.

### Established Patterns
- None yet — Phase 1 establishes all patterns for subsequent phases.

### Integration Points
- Phase 1 creates the stubs that Phase 2 fills in: the router (adds onboarding wizard content), the Dexie service files (adds real queries), the stores (adds UI state), and the shell pages (adds feature content)

</code_context>

<specifics>
## Specific Ideas

- The 14 default categories from REQUIREMENTS.md: Nouns, Verbs, Adjectives, People, Food, Animals, Vehicles, Body Parts, Onomatopoeia, Requests, Social Communication, Emotions, Places, Other — these must be typed exactly as the const array in `schema.ts`
- Teal as the accent color — warm and friendly, appropriate for a medical-adjacent parenting app
- Error boundary: `import.meta.env.DEV` (Vite idiom) for dev/prod branch — not `process.env.NODE_ENV`

</specifics>

<deferred>
## Deferred Ideas

- Language switcher UI — Phase 2 (Settings screen)
- App manifest branding (PWA name, icons, theme_color) — Phase 5 (PWA Polish)
- Gesture entity in schema — v2 requirement (GEST-01), not in v1 schema
- Usage type (Spontaneous/Imitated) field on Meaning — v2 requirement (USAGE-01), not in v1 schema

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-06-30*
