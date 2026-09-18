# Phase 6: Pre-release Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-02
**Phase:** 06-pre-release-polish
**Areas discussed:** Schema v3 migration, Edit UX pattern, Report enhancements, Pairs screen design

---

## Schema v3 Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Full move — strip Meaning | All three fields move to WordFormMeaning; Meaning keeps only text + categories | |
| Move + keep on Meaning (aggregated) | Fields move to junction but Meaning retains computed/aggregated versions | ✓ |
| Hybrid — only isActive moves | isActive moves to pair; dates stay on Meaning | |

**User's choice:** Move + keep on Meaning (aggregated)
**Notes:** Aggregation rules captured: isActive = ANY pair active; lastUsedDate = max; firstUseDate = min.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Copy from Meaning to all linked pairs | Existing Meaning values seeded into each linked pair row | ✓ |
| Set pair fields to now/defaults | New pair fields default to today/true; historical data not migrated | |
| You decide | Claude picks safest migration path | |

**User's choice:** Copy from Meaning to all linked pairs

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — date input in add-entry form | firstObservationDate input in AddEntrySheet sets the pair field; historical backdating supported | ✓ |
| No — defaults to today | pair.firstObservationDate always = today at creation | |
| You decide | Claude picks based on product intent | |

**User's choice:** Yes — date input in add-entry form

---

| Option | Description | Selected |
|--------|-------------|----------|
| isActive = true if ANY pair is active | Meaning active when at least one pairing is active | ✓ |
| isActive = true if ALL pairs are active | Meaning active only when every pairing is active | |
| isActive stays independent on Meaning | Active toggle on Meaning is a direct field, not derived | |

**User's choice:** isActive = true if ANY pair is active

---

## Edit UX Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Inline — tap to edit in place | Edit button enters edit mode on detail page; no separate screen/sheet | ✓ |
| Edit bottom sheet | Edit button opens a pre-filled bottom sheet | |
| Edit button at top of page | Navigates to a /meanings/:id/edit page | |

**User's choice:** Inline — tap to edit in place

---

Editable fields on Meaning detail (multi-select): **Meaning text, Categories, Dates per pair, isActive per pair** — all four selected.

Editable fields on Word Form detail (multi-select): **Word form text, Dates per pair, isActive per pair** — all three selected.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Navigates to Word Form detail | Row becomes a link to /word-forms/:id | |
| Expands inline to show pair details | Row expands to show pair fields without navigating | |
| Both — expand inline + nav button | Row expands to show pair fields; arrow button navigates to WF detail | ✓ |

**User's choice:** Both — expand inline + nav button

---

## Report Enhancements

| Option | Description | Selected |
|--------|-------------|----------|
| Always show years + months | e.g., "2 years 0 months", consistent format | ✓ |
| Show months only when remainder > 0 | e.g., "3 years" when exactly 3 years | |
| Under 2: months only; 2+: years + months | Same threshold as current, but combined format | |

**User's choice:** Always show years + months

---

Additional sections (multi-select): **Per-category meaning list, Word-form count per meaning, Most recent additions** — all three selected.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Count only (current) | Inactive shown as a number only | |
| List inactive meanings too | Full list of inactive meaning names | |
| (User free text) | "Maybe count and last 5 which was forgotten?" | ✓ |

**User's choice (free text):** Show inactive count + 5 most-recently-forgotten meanings (sorted by lastUsedDate descending, where isActive=false)

---

## Pairs Screen Design

**User free text:** "More menu but Pairs land in new bottom nav tab, and we move data and language selection to more menu"

| Option | Description | Selected |
|--------|-------------|----------|
| 5 tabs: Dashboard, Meanings, Word Forms, Pairs, More | Add Pairs as a 5th tab; More still holds all secondary items | ✓ |
| 4 tabs: Dashboard, Meanings, Word Forms, Pairs — More becomes Settings only | Repurpose More | |

**User's choice:** 5 tabs

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — dates + active status per row | Always visible below chips | |
| Chips only — no dates | Dates only on detail pages | |
| Dates on hover / tap-to-expand | Hidden by default; expand to reveal | ✓ |

**User's choice:** Tap-to-expand

---

| Option | Description | Selected |
|--------|-------------|----------|
| Newest first | By firstObservationDate descending | |
| Alphabetical by word form | A–Z by word form text | |
| Alphabetical by meaning | A–Z by meaning text | |
| (User free text) | "User select from: newest first / alphabetical by word form / alphabetical by meaning" | ✓ |

**User's choice (free text):** All three as a sort selector — user-selectable, default newest first (same pattern as Meanings/Word Forms lists)

---

## Claude's Discretion

None — user answered all questions directly.

## Deferred Ideas

None — discussion stayed within phase scope.
