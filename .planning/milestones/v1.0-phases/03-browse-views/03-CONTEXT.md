# Phase 3: Browse Views - Context

**Gathered:** 2026-07-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 makes all entered data visible and navigable. A parent can see the Dashboard with key metrics, scroll through Meanings and Word Forms lists, tap any item to open a detail page, review vocabulary by category, and view a monthly growth chart. This phase also adds the first edit capability: Active/Inactive toggle and lastUseDate update from the meaning detail page. Phase 3 validates the data model through read-only aggregations and a minimal edit surface — the full edit experience is Phase 4+.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout

- **D-01:** Active Meanings is the hero card — full-width, large number (~64px), sits at the top of the page. No greeting header; go straight to metrics.
- **D-02:** Secondary metrics (Active Word Forms, New This Month): 2-column grid directly below the hero card.
- **D-03:** Hero card label: **"Active meanings"** (matches DASH-01 requirement label).
- **D-04:** "Review these?" section (meanings unused for 30+ days): always shown. When no meanings qualify, display a positive empty state message (e.g., "All meanings used recently — great job!"). Shows up to 3 meanings when populated; a "See all X" link navigates to the Meanings list.

### Detail Page Routing

- **D-05:** Two new hash routes: `/meanings/:id` and `/word-forms/:id`. Added as child routes inside the existing RootLayout — bottom nav remains visible on detail pages.
- **D-06:** Meaning detail page editable fields: Active/Inactive toggle + `lastUseDate` date picker only. All other fields (text, categories, linked word forms) are read-only in Phase 3.
- **D-07:** Active/Inactive toggle UI: **Shadcn Switch component** with a visible label. Requires `npx shadcn add switch`. — **Reversibility:** reversible
- **D-08:** Word form detail page: includes a **delete button** with a confirmation dialog. Warning text clarifies that only the word form record is removed — linked meanings survive. `deleteWordForm()` service function already exists.

### Timeline Chart Design

- **D-09:** The Timeline page shows **two views** via a tab toggle above the chart:
  - **"Growth rate"** — new meanings added per month; rendered as a bar chart
  - **"Total vocabulary"** — cumulative active meanings over time; rendered as a line chart
- **D-10:** Date range is **configurable** via a dropdown (6 months / 12 months / All time). Default on page load: **All time**.
- **D-11:** A data table below the chart shows: Month, New meanings, Cumulative total.
- **D-12:** Recharts is used via the Shadcn `chart` component. Requires `npx shadcn add chart`.

### Category Filter & List Ordering

- **D-13:** Tapping a category in the Categories view navigates to `/meanings?category=Nouns` (query param on the existing Meanings page). The Meanings page handles both filtered and unfiltered state.
- **D-14:** When a category filter is active, a filter chip appears near the top of the Meanings page (e.g., "Filtering: Nouns ×"). Tapping × clears the filter and shows all meanings. Uses the existing Badge component.
- **D-15:** Categories page shows all 14 default categories at all times — including those with 0 meanings. Count format: total (active + inactive) with breakdown, e.g., "Nouns: 12 (3 inactive)".
- **D-16:** Both Meanings and Word Forms list pages have a **sort toggle**: "Newest first" (by firstUseDate / createdAt, descending) and "A–Z" (alphabetical). Default: Newest first. Sort preference is local component state — resets to default on each navigation.

### Claude's Discretion

- Confirmation dialog for word form deletion: Claude picks the appropriate Shadcn component (`AlertDialog` or `Dialog`) — both follow the established Shadcn install pattern.
- Data table styling: Claude picks between a Shadcn `table` component or simple Tailwind-styled `<table>` — whichever is already available or easiest to add.
- "See all X" link from the Review These? dashboard section: links to `/meanings` (unfiltered Meanings list). Simple `<Link>` component.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Dashboard — DASH-01 through DASH-03: dashboard metrics, card layout, Review These? section
- `.planning/REQUIREMENTS.md` §Browse Views — BROWSE-01 through BROWSE-04: list views, detail pages, category filter, timeline chart
- `.planning/ROADMAP.md` §Phase 3 — Phase goal, success criteria, dependency on Phase 2

### Prior Phase Context (decisions that constrain Phase 3)
- `.planning/phases/02-onboarding-data-entry/02-CONTEXT.md` — D-11 (lastUseDate = firstUseDate on creation, updated from detail page), D-16 through D-20 (Settings structure), D-04 (Active/Inactive from detail page only — confirmed in this discussion)
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-01 through D-04 (4-tab nav; Categories/Timeline under More), D-14/D-15 (warm teal theme, system dark mode)

### Architecture & Constraints
- `.planning/PROJECT.md` §Constraints — Immutable constraints (hash routing, IndexedDB-only, GitHub Pages)
- `.planning/research/ARCHITECTURE.md` — 3-layer architecture, component boundary rules
- `.planning/research/STACK.md` — Tech stack rationale and version decisions
- `.planning/research/PITFALLS.md` — Known pitfalls to avoid

### Tech Stack
- `.claude/CLAUDE.md` §Technology Stack — Full recommended stack; §Section 8 (Recharts/Shadcn chart) is directly relevant for BROWSE-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/services/meaning.service.ts` — `toggleMeaningActive(id, isActive)` already exists; `searchMeanings(prefix)` exists. Need to add: `getMeaningById(id)`, `updateLastUseDate(id, date)`, query for meanings unused 30+ days (Dashboard), query by category (filtered list)
- `src/db/services/wordForm.service.ts` — `deleteWordForm(id)` already exists (transaction-safe, removes junction rows). Need to add: `getWordFormById(id)`, `getWordFormsWithMeaningCounts()`
- `src/db/services/wordFormMeaning.service.ts` — junction table available for resolving meaning ↔ word form relationships on detail pages
- `src/db/schema.ts` — `CATEGORIES` const (14 values) and `Category` union type ready for Categories page rendering
- `src/components/ui/badge.tsx` — use for the category filter chip (D-14) and category tags on detail pages
- `src/components/ui/button.tsx` — use for sort toggle, "See all" link styling, delete button
- `src/pages/DashboardPage.tsx` — existing stub with `useLiveQuery` for profile; replace body content entirely
- `src/pages/MeaningsPage.tsx`, `WordFormsPage.tsx`, `CategoriesPage.tsx`, `TimelinePage.tsx` — all stubs, replace with full implementations

### Established Patterns
- `useLiveQuery` (Dexie reactive hooks) — established in AppGate and DashboardPage; all DB reads in this phase use this pattern
- `useTranslation('common')` from react-i18next — all UI strings via translation keys
- Tailwind utility-first styling — flex/grid layout, no CSS modules
- Shadcn component install: `npx shadcn@latest add <component>` — copies TSX into `src/components/ui/`

### Integration Points
- `src/router/index.tsx` — add `{ path: 'meanings/:id', element: <MeaningDetailPage /> }` and `{ path: 'word-forms/:id', element: <WordFormDetailPage /> }` as children of the root layout
- New Shadcn components needed: `switch` (D-07), `chart` (D-12), `alert-dialog` or `dialog` (D-08 confirmation), optionally `table`
- `src/pages/MeaningsPage.tsx` — reads `?category` query param from URL search params (`useSearchParams` from react-router) to apply category filter

</code_context>

<specifics>
## Specific Ideas

- "Review these?" empty state message: "All meanings used recently — great job!" (warm, positive tone consistent with the app's parenting context)
- Category count format on Categories page: "12 meanings (3 inactive)" — compact, informative
- Timeline tab toggle labels: "Growth rate" / "Total vocabulary"
- Timeline date range dropdown values: "Last 6 months" / "Last 12 months" / "All time"
- Sort toggle on list pages: a small Button or Badge component at the top right of the list header — "Newest ↓" / "A–Z" — switches local `sortOrder` state

</specifics>

<deferred>
## Deferred Ideas

- **Edit meaning text/categories from detail page** — significant complexity; Phase 4+ scope
- **Edit word form text** — would affect existing links; Phase 4+ with careful UX
- **Linking additional word forms to an existing meaning from the detail page** — Phase 4+
- **Stacked/grouped category bar chart on Timeline** — future enhancement; not in v1 scope
- **Sort preference persistence across sessions** — local state is sufficient for MVP; Zustand persistence deferred to v2

</deferred>

---

*Phase: 3-Browse Views*
*Context gathered: 2026-07-28*
