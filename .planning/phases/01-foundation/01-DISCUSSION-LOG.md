# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 1-Foundation
**Areas discussed:** Bottom nav tabs, Default language, Schema future-proofing, Phase 1 visual depth, Onboarding gate UX, Project folder structure, Error boundaries

---

## Bottom Nav Tabs

| Option | Description | Selected |
|--------|-------------|----------|
| 4 tabs: Dashboard, Meanings, Word Forms + overflow | Core daily-use screens | ✓ |
| 4 tabs: Dashboard, Word Forms, Meanings, Timeline | Timeline as primary slot | |
| 3 tabs: Dashboard, Word Forms, Meanings | Minimal primary nav | |

**User's choice:** 4 tabs — Dashboard, Meanings, Word Forms, More (overflow)

---

### Overflow tab contents

| Option | Description | Selected |
|--------|-------------|----------|
| Overflow tab with Categories + Timeline inside | 5th tab labeled 'More' contains Categories, Timeline, Doctor Report, Settings | ✓ |
| Timeline in overflow, Categories inside Meanings | Categories as filter within Meanings | |
| You decide | Claude picks architecturally | |

**User's choice:** Overflow "More" tab containing Categories, Timeline, Doctor Report (stub), Settings

---

### Doctor Report and Settings placement

| Option | Description | Selected |
|--------|-------------|----------|
| Both in the overflow tab (More) | Clean primary nav | ✓ |
| Settings in overflow, Doctor Report as FAB/header action | Report as primary action | |
| You decide | | |

**User's choice:** Both in overflow (More)

---

### Overflow tab label

| Option | Description | Selected |
|--------|-------------|----------|
| More (ellipsis icon) | Standard mobile pattern | ✓ |
| Browse (grid icon) | Implies content exploration | |
| You decide | | |

**User's choice:** More (ellipsis icon)

---

## Default Language

| Option | Description | Selected |
|--------|-------------|----------|
| Polish (Recommended) | Primary users are Polish-speaking parents | ✓ |
| English | App brand is English | |
| Browser/OS language | navigator.language detection | |

**User's choice:** Polish as default

---

### Language preference storage

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage (Recommended) | Simple synchronous read before React mounts | ✓ |
| IndexedDB via Dexie | Consistent with privacy-first; async complication | |

**User's choice:** localStorage

---

### Language switcher scope

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 2 (Recommended) | Part of Settings screen | ✓ |
| Phase 1 | Easier dev testing | |

**User's choice:** Deferred to Phase 2

---

## Schema Future-Proofing

| Option | Description | Selected |
|--------|-------------|----------|
| Include Phase 2 fields in v1 now (Recommended) | No migration needed for Phase 2 | ✓ |
| Add in schema v2 with Phase 2 | Minimal Phase 1 schema | |

**User's choice:** Include optional ChildProfile fields in v1 (prematureBirth, speechTherapy, neurologicalCare, parentNotes)

---

### Categories field type

| Option | Description | Selected |
|--------|-------------|----------|
| string[] stored as JSON (Recommended) | Simple, no junction table | ✓ |
| Separate MeaningCategory junction table | Normalized relational | |

**User's choice:** `Category[]` as string array

---

### Category type safety

| Option | Description | Selected |
|--------|-------------|----------|
| const array + union type (Recommended) | Compile-time safety | ✓ |
| Just string[] | Simpler, risk of typos | |
| You decide | | |

**User's choice:** `const CATEGORIES = [...] as const` + `type Category = typeof CATEGORIES[number]`

---

### WordFormMeaning metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Just foreign keys + auto-id (Recommended) | Minimal schema | ✓ |
| Add firstLinkedAt timestamp | Timeline data potential | |
| You decide | | |

**User's choice:** Just `{ id++, wordFormId, meaningId }` — no extra metadata

---

## Phase 1 Visual Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Styled shell with real nav (Recommended) | Icons, labels, active state, theme configured | ✓ |
| Functional wireframe | Routes work, no visual polish | |
| Minimal stub | Routes only, no nav | |

**User's choice:** Styled shell — bottom nav with icons/labels, color theme, placeholder content per route

---

### Color theme

| Option | Description | Selected |
|--------|-------------|----------|
| Warm neutral (Recommended) | Soft whites, warm grays, teal accent | ✓ |
| Clean minimal | White + black/gray + blue | |
| You decide | | |

**User's choice:** Warm neutral — Shadcn neutral base + custom teal accent

---

### Dark mode

| Option | Description | Selected |
|--------|-------------|----------|
| No dark mode in Phase 1 | Add later | |
| System dark mode via prefers-color-scheme | Automatic, ~30min work | ✓ |
| You decide | | |

**User's choice:** System dark mode via `prefers-color-scheme` (Tailwind media-query)

---

## Onboarding Gate UX

| Option | Description | Selected |
|--------|-------------|----------|
| App name splash screen (Recommended) | "Little Words" centered | ✓ |
| Blank/white screen | Fast but looks broken | |
| Dashboard skeleton | Shimmer that redirects | |

**User's choice:** App name splash screen during Dexie startup check

---

### Gate implementation location

| Option | Description | Selected |
|--------|-------------|----------|
| React component in App.tsx (Recommended) | useLiveQuery — reactive | ✓ |
| Router loader function | Async loader + hash routing complexity | |

**User's choice:** React component in App.tsx using `useLiveQuery`

---

### Onboarding route Phase 1 content

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal placeholder "Onboarding coming soon" | Functional for testing | ✓ |
| Just route stub, no content | null/empty div | |
| You decide | | |

**User's choice:** Styled placeholder at `/#/onboarding`

---

## Project Folder Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Create full skeleton in Phase 1 (Recommended) | All dirs + index stubs | ✓ |
| Only create what Phase 1 strictly needs | Leaner, risk of drift | |

**User's choice:** Full skeleton created in Phase 1

---

### Zustand store location

| Option | Description | Selected |
|--------|-------------|----------|
| src/stores/ at root level (Recommended) | Cross-feature state | ✓ |
| src/shared/stores/ | One nesting level | |
| Co-located in features | Feature-scoped only | |

**User's choice:** `src/stores/` at root level

---

### Service file stubs

| Option | Description | Selected |
|--------|-------------|----------|
| Create stubs for all 4 entities (Recommended) | Pattern established | ✓ |
| Just db.ts and schema.ts | Minimal Phase 1 | |

**User's choice:** All 4 entity service stubs created with correct export pattern

---

## Error Boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — simple global boundary (Recommended) | Single ErrorBoundary at App root | ✓ |
| No — defer to Phase 2 | White screen on Dexie failure | |

**User's choice:** Global error boundary in Phase 1

---

### Error screen content

| Option | Description | Selected |
|--------|-------------|----------|
| App name + "Something went wrong" + reload button | Minimal friendly | |
| Technical error details in dev, friendly in prod | Best of both worlds | ✓ |
| You decide | | |

**User's choice:** Dev: app name + `error.message` code block + reload; Prod: app name + "Something went wrong" + reload

---

## Claude's Discretion

- Icon set for bottom nav tabs — Claude picks icons appropriate for each tab label
- Exact Shadcn components used in the nav shell — Claude picks per the Shadcn/UI library
- Teal shade for CSS variable — Claude picks an accessible, warm teal
- Exact placeholder text content per route — Claude writes reasonable placeholders

## Deferred Ideas

- Language switcher UI — deferred to Phase 2 (Settings scope)
- App manifest branding (icons, theme_color, PWA name) — deferred to Phase 5 (PWA Polish)
- Gesture entity in schema — v2 (GEST-01)
- Usage type field (Spontaneous/Imitated) — v2 (USAGE-01)
