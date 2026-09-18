# Phase 3: Browse Views - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-28
**Phase:** 3-Browse Views
**Areas discussed:** Dashboard layout, Detail page routing, Timeline chart design, Category filter flow

---

## Dashboard Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Hero card — full width, large number | ~160px tall, number at ~64px. No Shadcn Card component yet — new install or custom div | ✓ |
| Standard card, visually distinguished by color | Same size as others but teal background or bold border | |
| You decide | Claude picks | |

**User's choice:** Hero card — full width, large number

---

| Option | Description | Selected |
|--------|-------------|----------|
| 2-column grid below the hero card | Side-by-side on mobile, space-efficient | ✓ |
| Stacked vertically (one per row) | More scrolling | |

**User's choice:** 2-column grid below the hero card

---

| Option | Description | Selected |
|--------|-------------|----------|
| Hide the section entirely when empty | Only shows when there's actionable content | |
| Show with a positive empty state message | "All meanings used recently — great job!" | ✓ |

**User's choice:** Show with a positive empty state message

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep greeting above the cards | Warm entry point — child's name then data | |
| Remove greeting — go straight to metrics | Data-first, saves vertical space | ✓ |
| You decide | Claude picks | |

**User's choice:** Remove greeting — go straight to metrics

---

| Option | Description | Selected |
|--------|-------------|----------|
| "Active meanings" | Direct, matches requirement label | ✓ |
| "Words [child name] knows" | More narrative, warmer | |
| "Active words" | Shorter, risks conflating word forms vs meanings | |

**User's choice:** "Active meanings"

---

| Option | Description | Selected |
|--------|-------------|----------|
| Show up to 3, link to full list | Compact dashboard, "See all X" link | ✓ |
| Show all matching meanings | Potentially very long | |
| Show up to 5, link to full list | More context at a glance | |

**User's choice:** Show up to 3, link to full list

---

## Detail Page Routing

| Option | Description | Selected |
|--------|-------------|----------|
| New hash routes (/meanings/:id, /word-forms/:id) | Full page navigations, browser back works | ✓ |
| Bottom sheet slide-over | No new routes, conflicts with Phase 2 sheets-for-entry pattern | |

**User's choice:** New hash routes

---

| Option | Description | Selected |
|--------|-------------|----------|
| Child route inside RootLayout (bottom nav visible) | Consistent with Settings/ProfileEdit | ✓ |
| Top-level route (bottom nav hidden) | Full-screen focus | |

**User's choice:** Child route inside RootLayout

---

| Option | Description | Selected |
|--------|-------------|----------|
| Active/Inactive toggle only — everything else read-only | Minimal Phase 3 scope | |
| Active/Inactive toggle + lastUseDate update | Low complexity, schema already supports it | ✓ |
| Full editing (categories, dates, word form links, active toggle) | High complexity | |

**User's choice:** Active/Inactive toggle + lastUseDate update

---

| Option | Description | Selected |
|--------|-------------|----------|
| Delete button on word form detail page, with confirmation dialog | Explicit intent, warning about meanings surviving | ✓ |
| Long-press or swipe-to-delete on the list | Faster but risks accidental deletion, scope creep | |

**User's choice:** Delete button with confirmation dialog

---

| Option | Description | Selected |
|--------|-------------|----------|
| Shadcn Switch component with label | Standard toggle, needs `npx shadcn add switch` | ✓ |
| Two-button toggle (Active / Inactive) | Segmented style, uses existing Button | |
| You decide | Claude picks | |

**User's choice:** Shadcn Switch component

---

## Timeline Chart Design

| Option | Description | Selected |
|--------|-------------|----------|
| New meanings added per month | Growth velocity, actionable for specialists | Other |
| Cumulative active meanings over time | Total vocabulary at month end | Other |

**User's choice (free text):** "Both 1 & 2 (2 charts or 2 lines on one chart)"

---

| Option | Description | Selected |
|--------|-------------|----------|
| Two lines on one chart | Both visible, risk: scale mismatch | |
| Toggle tabs above the chart | One chart, two views — no scale conflict | ✓ |
| Two separate charts stacked | Most readable, most vertical space | |

**User's choice:** Toggle tabs above the chart

---

| Option | Description | Selected |
|--------|-------------|----------|
| Bar chart for new-per-month, line chart for cumulative | Semantically appropriate chart types per view | ✓ |
| Bar chart for both views | Consistent, simpler | |
| Line chart for both views | Consistent, slightly unconventional for discrete counts | |

**User's choice:** Bar chart for new-per-month, line chart for cumulative

---

| Option | Description | Selected |
|--------|-------------|----------|
| All time (all months with data) | Full picture for specialist consultations | |
| Last 12 months only | Predictable width, loses early data | |
| Configurable (dropdown: 6mo / 12mo / All) | Flexible, adds UI complexity | ✓ |

**User's choice:** Configurable dropdown

---

| Option | Description | Selected |
|--------|-------------|----------|
| Month, New meanings, Cumulative total | Three most useful columns for specialists | ✓ |
| Month, New meanings only | Simpler | |
| You decide | Claude picks | |

**User's choice:** Month, New meanings, Cumulative total

---

| Option | Description | Selected |
|--------|-------------|----------|
| All time (default) | Full journey immediately visible | ✓ |
| Last 12 months (default) | Hides early data for users with longer history | |

**User's choice:** All time as default

---

## Category Filter Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Navigate to /meanings?category=Nouns | Reuses Meanings page with filter, URL shareable | ✓ |
| Navigate to /categories/:name route | Separate page, new route | |
| Inline expand on Categories page | No navigation, page could be very long | |

**User's choice:** /meanings?category=Nouns query param

---

| Option | Description | Selected |
|--------|-------------|----------|
| Filter chip near top with × to clear | Visible, dismissable, uses Badge component | ✓ |
| Page title changes to category name | Simple, not dismissable without back button | |
| No indicator | Minimal, potentially confusing | |

**User's choice:** Filter chip with × to clear

---

| Option | Description | Selected |
|--------|-------------|----------|
| Active meanings only | Consistent with app's primary metric | |
| Total (active + inactive) with breakdown | Complete picture — specialists may want full counts | ✓ |
| Total only | Simplest, inconsistent with active-first framing | |

**User's choice:** Total with active/inactive breakdown

---

| Option | Description | Selected |
|--------|-------------|----------|
| All 14 categories always | Full vocabulary framework visible, consistent | ✓ |
| Only categories with at least 1 meaning | Cleaner for new users | |

**User's choice:** All 14 always

---

| Option | Description | Selected |
|--------|-------------|----------|
| Most recently added first (default) | Parent's latest entries at top | Other |
| Alphabetical | Easier for long lists | Other |
| You decide | Claude picks | |

**User's choice (free text):** "User can switch between 1 & 2 ordering"

---

| Option | Description | Selected |
|--------|-------------|----------|
| Reset on every visit (local component state) | Default always newest first, simpler | ✓ |
| Persist in Zustand UI store | Remembered in session, adds store state | |

**User's choice:** Reset on every visit (local component state)

---

## Claude's Discretion

- **Confirmation dialog component:** Claude picks between `AlertDialog` or `Dialog` Shadcn component for word form delete confirmation
- **Data table styling:** Claude picks between Shadcn `table` component or Tailwind-styled native `<table>`
- **"See all X" link styling:** Simple `<Link>` component — Claude picks appropriate Tailwind styling

## Deferred Ideas

- Edit meaning text/categories from detail page — Phase 4+
- Edit word form text — Phase 4+
- Link additional word forms to existing meaning from detail page — Phase 4+
- Stacked/grouped category bar chart on Timeline — future enhancement
- Sort preference persistence across sessions — v2
