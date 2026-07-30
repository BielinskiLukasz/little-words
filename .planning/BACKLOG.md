# Backlog

Ideas and scope items captured outside the active roadmap. Anything here is *not* in v1 — it has either been deferred by explicit decision, surfaced during UAT, or earmarked for a later milestone. Items graduate to a `ROADMAP.md` phase when picked up (`/gsd-review-backlog` to promote, `/gsd-phase add` to materialize).

Last updated: 2026-07-30 (UAT phase 03)
Last assigned ID: **B-002** — next new item must be **B-003**

---

## How to use this file

- **Adding an item:** increment the "Last assigned ID" counter at the top, then drop a new `### B-NNN` block with Status / Earliest sensible slot / What / Why / Open questions / Implementation notes. IDs are monotonic and never reused — even if the previous entry was promoted or removed.
- **Promoting an item:** `/gsd-review-backlog` (interactive) — moves a chosen item into the active milestone roadmap. Or manually run `/gsd-phase add` and reference the backlog ID in the phase description.
- **Removing an item:** delete the block or move it under a `## Rejected` heading with a one-line rationale (decisions cost; keep the rationale).
- **Memory ↔ backlog:** memory captures "this idea exists and here's the context"; this file is the project-level decision queue. Memory is the source for cross-session continuity; this file is the source for milestone planning. Update both when an item lands.

## Related

- `ROADMAP.md` — active milestone phases
- `milestones/v1.0-REQUIREMENTS.md` — v1.0 archived requirements (all 51 complete)
- `PROJECT.md` — core constraints (single subject v1, no build step, no frameworks)
- `CLAUDE.md` — v1/v2 split rules

---

### B-002 · Use full genitive month name in Polish date formatting

**Status:** backlog
**Earliest sensible slot:** v1.1 — no prerequisites

**What:** Polish dates currently render as "29 lip 2026" (abbreviated month). The preferred form is "29 lipca 2026" (full genitive). Requires passing `{ month: 'long' }` to `toLocaleDateString` (or equivalent Intl.DateTimeFormat option) in the shared date formatter used by Meaning and Word Form detail pages.

**Why:** Surfaced during Phase 03 UAT. The abbreviated form is readable but feels informal for a medical-adjacent tracking app. Polish grammar expects the genitive case for months in date expressions.

**Implementation notes:**

- The formatter lives in `MeaningDetailPage.tsx` and `WordFormDetailPage.tsx` (or a shared `formatDate` utility if one is extracted). Change `month: 'short'` → `month: 'long'` (or add the option if not currently set).
- Verify that English dates still render correctly with the same change.

---

### B-001 · Improve button hover states <-- THIS IS AN EXAMPLE OF BACKLOG ITEM, from other project, use them as template when you are adding first backlog item (rewrite this one)

**Status:** promoted → v1.1
**Earliest sensible slot:** v1.1 — no prerequisites

**What:** Add and refine CSS hover interactions for all actionable controls — preset buttons, start/stop, reset, theme toggle, sound/vibe toggles. Transitions should be short (100–150 ms) and consistent across the UI.

**Why:** Several controls currently have no hover state or only a browser-default outline. Visual hover feedback confirms interactivity, reduces mis-taps on touch-adjacent pointer devices (styluses, trackpads), and makes the app feel less prototype-grade.

**Implementation notes:**

- All styles live in `index.html` `<style>`. Add `:hover` rules with background or opacity transitions to each control family.
- Wrap hover rules in `@media (hover: hover)` so they do not apply on pure touch screens and leave no sticky-hover residue.

---
