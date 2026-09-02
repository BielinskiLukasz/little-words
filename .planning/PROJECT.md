# Little Words

## What This Is

Little Words is a privacy-first, offline-capable Progressive Web App that helps parents track their child's speech and communication development. Parents log spoken word forms, the meanings each form expresses, and supporting gestures — building a structured record they can share with speech therapists and neurologists. All data lives on the parent's device; no account or server is required.

## Core Value

A parent can walk into a specialist consultation and present objective, structured observations instead of relying on memory.

## Requirements

### Validated

- ✓ Parent can create a child profile (name, birth date, languages at home) during a required onboarding wizard — Phase 2
- ✓ Parent can add a word form with one or more meanings via a FAB → bottom sheet flow — Phase 2
- ✓ Meanings autocomplete from existing entries; new meanings can be created inline — Phase 2
- ✓ Each meaning can be tagged with one or more default categories (Nouns, Verbs, Food, Animals, etc.) — Phase 2
- ✓ Each meaning tracks first-use date and last-use date (not every occurrence) — Phase 2
- ✓ UI supports Polish and English with a language switcher in Settings — Phase 2
- ✓ Parent can mark a meaning as Active or Inactive from its detail page — Phase 3
- ✓ Dashboard shows Active Meanings as the primary metric, plus Active Word Forms, New Meanings This Month, and a "Review these?" card for meanings not used in 30+ days — Phase 3
- ✓ Meanings view and Word Forms view are browsable lists (no search in MVP) — Phase 3
- ✓ Categories view shows all default categories with their meaning counts — Phase 3
- ✓ Timeline view shows monthly vocabulary growth as both a chart and a data table — Phase 3
- ✓ Parent can tap a word form detail page to see linked meanings; deleting a word form removes the link — meanings survive as independent entities — Phase 3
- ✓ App works fully offline; installable as a PWA on Android Chrome and iOS Safari — Phase 5

### Active

- [ ] Each meaning records whether its first use was Spontaneous or Repeated
- [ ] Parent can record gestures (description, first/last observed date)
- [ ] Parent can edit meaning details (categories, dates) from the detail page
- [ ] Doctor Report generates a structured text summary (active/inactive counts, top categories, gestures, profile medical context, parent notes) and copies it to clipboard
- [ ] Parent notes for the doctor report are a persistent field on the child profile
- [ ] JSON export and import (backup and device migration) available in Settings → Data
- [ ] CSV export available in Settings → Data

### Out of Scope

- Search / filter in list views — list will be small enough to scroll for MVP; defer to v2
- Custom user-defined categories — ship with fixed defaults, add after core is validated
- PDF doctor report — copy-to-clipboard is sufficient for v1; PDF deferred to v2
- Photo, audio, and video attachments — v2
- Two-word combination and phrase tracking — v2
- Cloud backup (OneDrive, etc.) — v2
- Multiple child profiles — v2; current design assumes one child
- Developmental norms, milestone comparison, diagnostics — explicitly excluded; app never positions itself as a diagnostic tool
- Multi-device sync — no backend; JSON export is the manual migration path
- Push notifications — requires a backend; 30-day inactive suggestion surfaces as a dashboard card only

## Context

- Primary user: parent of a child with delayed, emerging, or closely monitored speech development (current design target: child ~2.5 years old)
- Specialists receiving the doctor report: speech therapists, neurologists
- The app tracks **meanings** as the primary metric — one spoken form ("pa") can express multiple meanings (goodbye, look, I want this), so meaning count matters more than word count
- Gestures are supporting observations only; they are not counted as words
- Usage history is intentionally minimal (first + last date only) to reduce logging burden and encourage sustained daily use
- The data model is relational: WordForm ↔ Meaning is many-to-many; Meaning is an independent entity that survives word form deletion

## Constraints

- **Hosting**: GitHub Pages — static files only; no server-side rendering
- **Routing**: Hash-based routing required (`/#/dashboard`) — GitHub Pages does not support history API rewriting
- **Build**: Vite `base` must match the repository slug (`/little-words/`)
- **Storage**: IndexedDB only — no backend, no account, no third-party database
- **Privacy**: No analytics, no tracking, no advertising; all data stays on device
- **Tech stack**: React + Vite + TypeScript; PWA with Service Worker for offline support
- **Single device**: No sync mechanism; JSON export is the explicit migration path between devices

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite + TypeScript | Best-documented PWA + IndexedDB ecosystem; TypeScript needed for complex relational data model | — Pending |
| Hash-based routing | Required by GitHub Pages static hosting — no config workarounds | — Pending |
| IndexedDB (no backend) | Privacy-first requirement; parent owns all data; no account friction | — Pending |
| Meanings are independent entities | Deleting a word form ("ba") should not destroy the meaning ("banana") that may be linked to other forms | — Pending |
| Fixed default categories for MVP | Reduces scope; most vocabulary fits the defaults; custom categories added after core is validated | — Pending |
| i18n (Polish + English) | App brand is English ("Little Words"); primary users are Polish-speaking; language switcher in Settings covers both | — Pending |
| Parent notes on profile (not per-report) | Persistent notes travel with the child profile and appear automatically in every report | — Pending |
| Single child profile | Current design target; multi-child support explicitly deferred to v2 | — Pending |
| Import/Export in Settings → Data | Infrequent action; does not belong in primary navigation | — Pending |
| Active/Inactive toggled from detail page only | Prevents accidental toggles from list views; explicit intent required | — Pending |
| flex-1 on calendar day cells (Tailwind v4) | `w-full` collapses flex children to minimum width in Tailwind v4; `flex-1` distributes evenly — applies to any DayPicker usage | — Phase 3 |
| Word form save without meanings is valid | Empty meanings array is handled gracefully by service; parents may log a sound before assigning meaning | — Phase 3 |
| Sheet cleanup in `finally` block | `close()` + `reset()` in `finally` ensures UI state resets regardless of save outcome; never leave sheet open after an error | — Phase 3 |
| Category names and dates must be i18n'd | UAT confirmed both were rendering in English in Polish mode; locale-aware display is a hard requirement for Polish users | — Phase 3 |
| SW registerType: 'prompt' | Service worker waits for explicit user action before applying updates — no silent mid-session page reloads | — Phase 5 |
| useRegisterSW at App() top level | Single hook mount point; no per-page SW logic; onNeedRefresh fires persistent Sonner toast (duration: Infinity) | — Phase 5 |
| PWA icons: SVG → @resvg/resvg-js → PNG | Maintain one SVG source, generate all PNG variants via script; ESM import required (package.json type:module) | — Phase 5 |
| Separate manifest.icons entries per purpose | W3C spec disallows combining any + maskable on one entry; 512x512 has two separate entries | — Phase 5 |
| Icon src paths include /little-words/ prefix | Manifest served from /little-words/; browser resolves icon paths relative to page origin, not manifest location | — Phase 5 |
| GitHub Actions: peaceiris + lint+test gate | Trigger on push to main only; lint and test must pass before build; keep_files: false prevents stale gh-pages artifacts | — Phase 5 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-02 — Phase 5 complete (PWA polish: offline, installability, SW update toast, PWA icons, CI/CD deploy pipeline; 13/13 UAT passed)*
