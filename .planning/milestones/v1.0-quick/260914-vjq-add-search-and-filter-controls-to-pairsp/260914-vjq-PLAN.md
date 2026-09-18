---
phase: 260914-vjq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/PairsPage.tsx
  - src/i18n/locales/en/common.json
  - src/i18n/locales/pl/common.json
autonomous: true
requirements:
  - QUICK-FILTER-01

estimate:
  tokens: 45000
  raw_tokens: 30000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - Typing in the search input narrows the pairs table to rows where wordFormText or meaningText contains the query (case-insensitive)
    - Clicking Active / Inactive shows only pairs matching that isActive value; All shows everything
    - Clicking "Last 7 days" / "Last 30 days" shows only pairs whose firstObservationDate is within that window; "Learned after" + date picker filters to >= the chosen date
    - Pressing a preset date button clears the custom date input; entering a custom date deselects preset buttons
    - When all filters are cleared the full list is shown again
    - Filters compose (search + status + date all apply together)
    - When filtered results are empty but raw data is not, a "no pairs match filters" message is shown instead of the "no pairs yet" empty state
    - All labels and placeholder text are translated in both EN and PL
  artifacts:
    - src/pages/PairsPage.tsx (filter bar added, filter state and logic wired)
    - src/i18n/locales/en/common.json (new keys under pairs.*)
    - src/i18n/locales/pl/common.json (new keys under pairs.*)
  key_links:
    - Filter state in PairsPage feeds the filter logic applied to raw pairs before sorting
    - i18n keys referenced in JSX must exist in both locale files
---

<objective>
Add search and filter controls to PairsPage so parents can quickly find a specific pair without scrolling the full table.

Purpose: Parents accumulate dozens or hundreds of word-form/meaning pairs; without filtering the table becomes unwieldy. Filters are purely client-side (no service changes).

Output: PairsPage with an always-visible filter bar (text search, status toggle, date presets + custom picker) above the existing sort/download controls row, with full EN + PL translation coverage.
</objective>

<execution_context>
@C:/my-code/vibe-coding/little-words/.claude/gsd-core/workflows/execute-plan.md
@C:/my-code/vibe-coding/little-words/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@C:/my-code/vibe-coding/little-words/src/pages/PairsPage.tsx
@C:/my-code/vibe-coding/little-words/src/i18n/locales/en/common.json
@C:/my-code/vibe-coding/little-words/src/i18n/locales/pl/common.json
</context>

<tasks>

<task type="tracer">
  <name>End-to-end text search filter — state + logic + UI + i18n placeholder</name>
  <files>src/pages/PairsPage.tsx, src/i18n/locales/en/common.json, src/i18n/locales/pl/common.json</files>
  <action>
Wire text search end-to-end through every layer the feature touches — state, filter logic, UI render, and i18n — so the remaining task can expand filter types without any architectural change.

STATE: Add four state variables in PairsPage after the existing `sort` declaration:
  - `searchText: string` initialized to `''`
  - `statusFilter: 'all' | 'active' | 'inactive'` initialized to `'all'`
  - `datePreset: 'all' | 'last7' | 'last30' | 'custom'` initialized to `'all'`
  - `customAfterDate: string` initialized to `''`

FILTER LOGIC: Replace the current `sorted` derivation with a two-step pipeline. First compute `filtered` from raw `pairs`, then compute `sorted` from `filtered`. For this tracer task implement only the text search filter; status and date filters are added in Task 2 and their state variables should be declared now so Task 2 only adds the filter predicates.

`filtered` computation (Task 1: text search only, Task 2 adds status + date):
```
const lowerSearch = searchText.toLowerCase()
const filtered = pairs.filter(p => {
  if (searchText && !p.wordFormText.toLowerCase().includes(lowerSearch) && !p.meaningText.toLowerCase().includes(lowerSearch)) return false
  return true
})
```

Rename the current `sorted` variable to derive from `filtered` instead of `pairs`.

EMPTY STATE GUARD: The existing `sorted.length === 0` check shows `pairs.emptyHeading` / `pairs.emptyBody`. After introducing `filtered`, distinguish two cases:
  - `pairs.length === 0`: show the existing "no pairs yet" empty state (heading + body)
  - `pairs.length > 0 && filtered.length === 0` (after sorting `sorted` is empty): show a "no results match filters" message using the key `pairs.noResults` with a "Clear filters" inline link or button that resets all filter state to defaults

FILTER BAR UI: Insert a filter bar `<div>` between the existing header `<div>` (title + sort/download controls) and the table/empty-state block. The bar has two rows:

Row 1 — search input (full width):
```jsx
<input
  type="text"
  value={searchText}
  onChange={e => setSearchText(e.target.value)}
  placeholder={t('pairs.searchPlaceholder')}
  className="w-full rounded border border-border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground"
/>
```

Row 2 — status and date controls (added in Task 2, leave empty for now with a comment marker so Task 2 inserts into the right spot). The row 2 `<div>` should still be emitted as an empty container with `className="flex flex-wrap items-center gap-3"` so the layout is proven before Task 2 fills it in.

I18N — add these keys now (they cover the full feature, Task 2 will reference them too):

EN (`src/i18n/locales/en/common.json`) — inside the existing `"pairs"` object, add after `"downloadCsv"`:
  `"searchPlaceholder": "Search word forms or meanings..."`,
  `"filterAll": "All"`,
  `"filterActive": "Active"`,
  `"filterInactive": "Inactive"`,
  `"last7Days": "Last 7 days"`,
  `"last30Days": "Last 30 days"`,
  `"learnedAfter": "Learned after"`,
  `"clearFilters": "Clear filters"`,
  `"noResults": "No pairs match your filters."`

PL (`src/i18n/locales/pl/common.json`) — inside the existing `"pairs"` object, add after `"downloadCsv"`:
  `"searchPlaceholder": "Szukaj form lub znaczeń..."`,
  `"filterAll": "Wszystkie"`,
  `"filterActive": "Aktywne"`,
  `"filterInactive": "Nieaktywne"`,
  `"last7Days": "Ostatnie 7 dni"`,
  `"last30Days": "Ostatnie 30 dni"`,
  `"learnedAfter": "Nauczone po"`,
  `"clearFilters": "Wyczyść filtry"`,
  `"noResults": "Brak par pasujących do filtrów."`

Do not add fenced code blocks to this file — all code patterns above are directive prose describing what to write; write idiomatic React/TypeScript in the actual file.
  </action>
  <verify>
    <automated>npm --prefix C:/my-code/vibe-coding/little-words run build 2>&1 | tail -5</automated>
  </verify>
  <done>
    TypeScript build passes. The PairsPage renders a search input above the table. Typing in the search box narrows visible rows by wordFormText or meaningText. The i18n keys for both locales compile without missing-key warnings.
  </done>
</task>

<task type="auto">
  <name>Add status toggle and date preset / custom date filters</name>
  <files>src/pages/PairsPage.tsx</files>
  <action>
Expand the filter bar using the state variables and i18n keys already wired in Task 1. Fill in the empty row 2 container with status and date controls.

STATUS TOGGLE — add three Button components inside row 2 (or a wrapper sub-div):
```
<div className="flex items-center gap-1">
  <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>
    {t('pairs.filterAll')}
  </Button>
  <Button size="sm" variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => setStatusFilter('active')}>
    {t('pairs.filterActive')}
  </Button>
  <Button size="sm" variant={statusFilter === 'inactive' ? 'default' : 'outline'} onClick={() => setStatusFilter('inactive')}>
    {t('pairs.filterInactive')}
  </Button>
</div>
```

DATE PRESETS — add a second sub-div to row 2, separated by a thin divider or just gap-3:
```
<div className="flex flex-wrap items-center gap-1">
  <Button size="sm" variant={datePreset === 'last7' ? 'default' : 'outline'} onClick={() => { setDatePreset('last7'); setCustomAfterDate('') }}>
    {t('pairs.last7Days')}
  </Button>
  <Button size="sm" variant={datePreset === 'last30' ? 'default' : 'outline'} onClick={() => { setDatePreset('last30'); setCustomAfterDate('') }}>
    {t('pairs.last30Days')}
  </Button>
  <span className="text-sm text-muted-foreground">{t('pairs.learnedAfter')}</span>
  <input
    type="date"
    value={customAfterDate}
    onChange={e => { setCustomAfterDate(e.target.value); setDatePreset(e.target.value ? 'custom' : 'all') }}
    className="rounded border border-border bg-background px-2 py-1 text-sm"
  />
</div>
```

Toggling a preset button (last7/last30) clears `customAfterDate` and sets `datePreset`. Entering a date in the picker sets `datePreset` to `'custom'`; clearing it resets `datePreset` to `'all'`.

CLEAR FILTERS: Add a "Clear filters" button that appears only when any filter is active (searchText !== '' || statusFilter !== 'all' || datePreset !== 'all'):
```
{(searchText || statusFilter !== 'all' || datePreset !== 'all') && (
  <button className="text-xs text-muted-foreground underline" onClick={() => { setSearchText(''); setStatusFilter('all'); setDatePreset('all'); setCustomAfterDate('') }}>
    {t('pairs.clearFilters')}
  </button>
)}
```
Place this at the end of row 2 or as a small row beneath both sub-divs.

FILTER LOGIC — extend the `filtered` computation in PairsPage to also apply status and date predicates (insert after the existing text search predicate):

Status predicate:
  if statusFilter === 'active' and pair.isActive is false → exclude
  if statusFilter === 'inactive' and pair.isActive is true → exclude

Date predicate (compute cutoff from current date without external dependencies):
  const now = new Date()
  const msPerDay = 86400000
  const cutoff =
    datePreset === 'last7' ? new Date(now.getTime() - 7 * msPerDay)
    : datePreset === 'last30' ? new Date(now.getTime() - 30 * msPerDay)
    : datePreset === 'custom' && customAfterDate ? new Date(customAfterDate)
    : null
  if cutoff is non-null, exclude pairs where new Date(pair.firstObservationDate) < cutoff

The three predicates compose with AND — a pair must pass all active filters to appear.

No service-layer changes are needed; all logic stays inside PairsPage.
  </action>
  <verify>
    <automated>npm --prefix C:/my-code/vibe-coding/little-words run build 2>&1 | tail -5</automated>
  </verify>
  <done>
    Build passes with no TypeScript errors. The filter bar shows: search input (row 1); status pills (All/Active/Inactive), date preset pills (Last 7 days / Last 30 days), learned-after label + date input, and a conditional "Clear filters" link (row 2). Active filters are visually distinguished (variant="default" vs "outline"). All filter combinations compose correctly. When filtered results are empty but raw data is not, "No pairs match your filters." is shown with a "Clear filters" link that resets all state.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user input → filter state | Free-text search input; applied only client-side to in-memory data |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-vjq-01 | Tampering | searchText state | low | accept | Input is applied only as a JS `.includes()` filter over already-loaded local data; no SQL, no server, no persistent effect |
| T-vjq-02 | Denial of Service | large pairs dataset + frequent re-filter | low | accept | Filtering runs synchronously in the render cycle; for the expected dataset size (hundreds of pairs) this is negligible; debounce can be added in a later phase if needed |
</threat_model>

<verification>
After both tasks complete:
1. `npm run build` passes (TypeScript + Vite bundle)
2. `npm run lint` passes (no ESLint errors)
3. `npm run test` passes (no regressions to existing tests)
4. Manual smoke check in dev server: search narrows rows, status pills filter, date presets and custom picker filter by firstObservationDate, all three filters compose, Clear filters resets everything
</verification>

<success_criteria>
- Build and lint pass with zero new errors
- Text search filters pairs table by wordFormText and meaningText (case-insensitive, substring match)
- Status toggle (All / Active / Inactive) filters by pair.isActive
- Last 7 days / Last 30 days presets filter by firstObservationDate relative to today
- Custom "Learned after" date picker filters by firstObservationDate >= selected date
- Selecting a date preset clears the custom date; entering a custom date deselects presets
- All filters compose; "Clear filters" resets all to defaults
- "No pairs match your filters." shown when filtered set is empty but data exists
- All new strings use t('pairs.*') keys; both EN and PL locale files contain all new keys
- No service-layer files modified
</success_criteria>

<output>
Create `.planning/quick/260914-vjq-add-search-and-filter-controls-to-pairsp/260914-vjq-SUMMARY.md` when done
</output>
