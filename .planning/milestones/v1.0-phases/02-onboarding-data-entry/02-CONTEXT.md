# Phase 2: Onboarding & Data Entry - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 makes the app usable: a parent can open the app for the first time, create a child profile through a single-screen onboarding form, and log their first (word form + meaning) pair through a FAB → bottom sheet flow. The AppGate already redirects to OnboardingPage when no child profile exists — Phase 2 replaces that stub with real functionality. Phase 2 also builds the full Settings screen structure (Language switcher + Edit Profile navigation + Data and About placeholders).

</domain>

<decisions>
## Implementation Decisions

### Onboarding Wizard

- **D-01:** Single-screen wizard — child name, birth date, and languages on one scrollable page; single "Get started" CTA at the bottom. No multi-step navigation.
- **D-02:** A collapsible "Optional: Medical context" section appears below the mandatory fields. Parent can expand to fill `prematureBirth`, `speechTherapy`, `neurologicalCare`, and `parentNotes`. Collapsed by default; primary CTA works without expanding it.
- **D-03:** After successful submit: show a welcome screen — "Welcome, [child name]!" centered, with a short supporting phrase (e.g. "Let's track [name]'s words together") and an animated checkmark. Auto-redirect to Dashboard after ~2 seconds. No manual continue button.
- **D-04:** Validation: onBlur — inline error messages appear when focus leaves a field. All three mandatory fields must pass before "Get started" is enabled. (Claude's discretion — see below.)

### Languages Field (in Onboarding)

- **D-05:** Input type: predefined chip list + free-text fallback. "Polish" and "English" appear as toggle chips. Below them, an "Other language" text field with an "Add" button appends additional custom language strings to the `languages` array.
- **D-06:** Predefined chips: Polish + English only (2 chips).
- **D-07:** Custom languages: text field + "Add" button; supports multiple entries; each added language appears as a chip in the selection area.
- **D-08:** All chips (Polish, English, and custom) show × to deselect/remove. At least one chip must be selected (or at least one custom language added) before form submission.

### Word Entry Bottom Sheet

- **D-09:** All-in-one form — one bottom sheet contains: word form text input, meaning text input with autocomplete, optional date picker for `firstUseDate`, and category chips. Parent fills everything in one go.
- **D-10:** "+ Add another meaning" button appears below each meaning row. Allows linking multiple meanings to one word form within a single sheet session. Each additional meaning row has its own meaning input, date picker, and category chips.
- **D-11:** `firstUseDate`: optional date picker pre-filled with today; editable (parent can backdate). `lastUseDate` = `firstUseDate` on creation; updated separately (from meaning detail page, Phase 3).
- **D-12:** Word form field: plain text input, no autocomplete. The parent types exactly what they heard the child say.
- **D-13:** Existing word form preview: debounced lookup (~500ms) while the parent types. If the typed word form matches an existing `WordForm` (case-insensitive), an info preview appears below the input listing all existing meanings linked to that form (e.g. "pa — already linked to: goodbye, I want that"). Not just a count — shows the actual meaning texts.
- **D-14:** Find-or-create silently — if the word form already exists, the new meaning links to the existing `WordForm` row. No duplicate `WordForm` rows for the same text (case-insensitive match).
- **D-15:** Category chips: horizontal scrollable chip row (single line). All 14 `CATEGORIES` const values available; multiple selection supported. Chips scroll left/right if they don't fit.

### Settings Screen

- **D-16:** Full Settings structure in Phase 2 — four visible sections: Language (functional), Profile (functional — navigates to edit), Data (placeholder), About (shows app version string).
- **D-17:** Language switcher: two radio-style buttons — "PL" and "EN" — side by side. Tapping one switches the UI language immediately via `i18next.changeLanguage()` and persists the selection to `localStorage` key `little-words-lang` (established in Phase 1, D-06). No save button needed.
- **D-18:** Edit Profile: Settings shows an "Edit Profile" row with a chevron. Tapping it navigates to a new route `/#/profile/edit` (new route added to the router). The edit form allows changing all ChildProfile fields: name, birth date, languages (same chip + free-text pattern as onboarding), and the optional medical context fields.
- **D-19:** Data section: shows disabled/muted placeholder rows ("Export JSON", "Import JSON", "Export CSV") with a "Coming soon" label. No functionality in Phase 2 (Phase 4 scope).
- **D-20:** About section: shows app name "Little Words" and the build version (from `import.meta.env.VITE_APP_VERSION` or `package.json` version injected at build time).

### Claude's Discretion

- **Validation strategy (D-04):** onBlur validation chosen — it catches mistakes as the parent completes each field without interrupting typing. Matches the warm, low-friction feel of the app. Errors shown as small red text beneath each field.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Onboarding — ONBD-01 through ONBD-04 define the onboarding gate, wizard fields, storage persistence, and iOS install prompt
- `.planning/REQUIREMENTS.md` §Data Entry — ENTRY-01 through ENTRY-03 define FAB, bottom sheet, meaning autocomplete, and category multi-select
- `.planning/ROADMAP.md` §Phase 2 — Phase goal, success criteria, and dependency declaration
- `.planning/PROJECT.md` §Constraints — Immutable constraints (GitHub Pages, hash routing, IndexedDB-only, privacy)

### Phase 1 Context (prior decisions that constrain Phase 2)
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-01 through D-23; critical: D-06 (localStorage language key), D-08 (optional fields already in schema), D-09 (categories as string array), D-16 (AppGate pattern), D-19 (folder skeleton)

### Architecture Research
- `.planning/research/ARCHITECTURE.md` — 3-layer architecture (UI → Service → Data), component boundary rules
- `.planning/research/STACK.md` — Tech stack rationale
- `.planning/research/PITFALLS.md` — Known pitfalls to avoid

### Tech Stack
- `.claude/CLAUDE.md` §Technology Stack — Full recommended stack with versions and "What NOT to use" sections for every layer

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — Shadcn Button already exists; use for all CTAs (Get started, Add, + Add another meaning)
- `src/db/services/childProfile.service.ts` — `saveChildProfile()` and `getChildProfile()` stubs ready for implementation
- `src/db/services/meaning.service.ts` — `addMeaning()` stub ready for implementation; needs `searchMeanings()` added for autocomplete
- `src/db/services/wordForm.service.ts` — stub ready; needs `findOrCreateWordForm()` for the find-or-create pattern (D-14)
- `src/db/services/wordFormMeaning.service.ts` — stub ready; needs `linkMeaningToWordForm()` for junction table writes
- `src/stores/ui.store.ts` — placeholder with `_placeholder: null`; Phase 2 adds `addWordSheetOpen: boolean` and related state
- `src/db/schema.ts` — `CATEGORIES` const array (14 values) and `Category` union type ready to use for chip rendering

### Established Patterns
- `useLiveQuery` (Dexie reactive hooks) — used in AppGate for ChildProfile count; same pattern for meaning autocomplete lookup
- Zustand store at `src/stores/ui.store.ts` — cross-feature ephemeral state (sheet open/closed)
- `import.meta.env.DEV` — Vite idiom for dev/prod branch (established in ErrorBoundary)
- `useTranslation('common')` from react-i18next — established in AppGate; all UI strings must use translation keys
- Teal accent theme + warm neutral base already configured; no custom CSS variables needed

### Integration Points
- `src/App.tsx` (AppGate) — already renders `<OnboardingPage />` when `profileCount === 0`. Phase 2 fills in that component. When profile is created and saved, `useLiveQuery` re-fires and the gate automatically transitions to the RouterProvider.
- `src/router/index.tsx` — add `{ path: 'profile/edit', element: <ProfileEditPage /> }` as a child of the root layout. The onboarding route (`/onboarding`) already exists outside the root layout.
- `src/pages/SettingsPage.tsx` — replace stub content with the four-section structure (D-16 through D-20)
- `src/pages/OnboardingPage.tsx` — replace stub with the single-screen form (D-01 through D-08)

</code_context>

<specifics>
## Specific Ideas

- Welcome screen animation: animated checkmark using CSS animation or a small Framer Motion / Tailwind `animate-bounce` or `animate-ping` — keep it lightweight; no heavy animation library needed
- Word form existing-meanings preview: render as a small muted paragraph below the input, e.g. `pa — already linked to: goodbye, I want that` — not a dropdown, just informational text
- Horizontal category chip row: use `overflow-x-auto` with `flex flex-nowrap` and `gap-2` — no additional library needed; Tailwind handles it
- Collapsible "Medical context" section in wizard: use Shadcn `Collapsible` component (built on Radix UI) — already available after Phase 1 Shadcn init
- The iOS "Add to Home Screen" prompt (ONBD-04): should appear after the first word form is successfully saved; detect iOS via `navigator.userAgent` check; render as a dismissible bottom sheet or toast (design decision: bottom sheet with step-by-step instruction text)

</specifics>

<deferred>
## Deferred Ideas

- Edit word form text after creation — not in Phase 2 scope; Phase 3 detail pages handle editing
- Meaning `lastUseDate` update UI — Phase 3 scope (from meaning detail page)
- Meaning Active/Inactive toggle — Phase 3 scope (from meaning detail page)
- Data export/import in Settings — Phase 4 scope (DATA-01, DATA-02, DATA-03)
- PWA manifest and service worker (About section version display uses build version only; no SW details) — Phase 5 scope
- Gesture recording — v2 requirement (GEST-01); not in this phase

</deferred>

---

*Phase: 2-Onboarding & Data Entry*
*Context gathered: 2026-06-30*
