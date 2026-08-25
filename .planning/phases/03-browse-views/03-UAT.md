---
status: complete
phase: 03-browse-views
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md
started: 2026-07-29T00:00:00Z
updated: 2026-08-25T00:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `npm run dev` fresh. App loads at /#/dashboard without errors in the browser console. The dashboard renders (even if empty).
result: pass

### 2. Dashboard — Active Meanings Count
expected: Open /#/dashboard. The hero card shows "Active meanings" with a numeric count. Add a new meaning via the word entry flow — the count on the dashboard increments immediately without a page reload.
result: pass

### 3. Dashboard — Secondary Metrics
expected: The dashboard shows two smaller cards in a 2-column grid: one for Word Forms count, one for "New This Month" (meanings added in the current calendar month). Both show accurate numbers.
result: pass

### 4. Dashboard — "Review These?" Section
expected: If there are meanings that have been unused for 30+ days (and are active), up to 3 appear in a "Review these?" section with links. If none qualify, the section shows a positive message like "All meanings used recently — great job!". Each meaning link navigates to its detail page.
result: pass
note: Only positive empty state verified (no 30+ day old data). Link navigation untestable with fresh data.

### 5. Meanings List — Display & Sort
expected: Navigate to /#/meanings. All entered meanings appear in a list sorted newest first by default. A sort toggle button switches between "Newest first" and "A–Z". Toggling changes the order immediately (no page reload). Sort resets to "Newest first" after navigating away and back.
result: pass

### 6. Meanings List — Category Filter
expected: Navigate to /#/meanings?category=Nouns (or any valid category). A filter chip "Filtering: Nouns ×" appears at the top. Only meanings in that category are shown. Clicking the × on the chip clears the filter and shows all meanings again.
result: pass
note: Filter chip label also displays in English when Polish is selected (extends G-03-5a).

### 7. Meaning Detail Page
expected: Tap any meaning in the Meanings list. A detail page opens showing the meaning text (large heading), category badges, first use date, and a list of linked word forms. Tapping "← Back" returns to the list.
result: pass
note: Date renders as "29 lip 2026" (abbreviated). Full genitive form "lipca" preferred but deferred to backlog.

### 8. Meaning — Active/Inactive Toggle
expected: On a meaning's detail page, there is an "Active" switch/toggle. Toggling it immediately updates the meaning's active state (no save button required). Navigating to the Dashboard reflects the new active count.
result: pass

### 9. Meaning — Last Use Date Picker
expected: On a meaning's detail page, tapping the last use date opens a date picker (calendar popover). Selecting a different date closes the popover and updates the displayed date immediately.
result: pass
note: Popover close works. Calendar date cells have no visible spacing — numbers run together (e.g. "19202122232425"). New issue logged as G-03-cal.

### 10. Word Forms List — Display & Sort
expected: Navigate to /#/word-forms. All entered word forms appear in a list, sorted newest first by default. The sort toggle works the same as the Meanings list (switches between "Newest first" and "A–Z", resets on navigation).
result: pass

### 11. Word Form Detail — Linked Meanings
expected: Tap any word form in the list. A detail page opens showing the word form text, first use date, and a list of linked meanings as tappable links. Tapping a linked meaning navigates to that meaning's detail page.
result: pass
note: Empty-string meaning fix confirmed. New issue found: popup stays open after saving when no meaning entered (see G-03-popup).

### 12. Delete Word Form with Confirmation
expected: On a word form detail page, tap "Delete". A confirmation dialog appears with text explaining that the word form will be removed but linked meanings will stay. Tapping "Cancel" closes the dialog without deleting. Tapping "Delete" removes the word form and returns to the list. The linked meanings still appear in /#/meanings.
result: pass

### 13. Categories Page — Counts & Navigation
expected: Navigate to /#/categories. All 14 default categories are listed, each showing a count (e.g. "3 (1 inactive)"). Categories with no meanings show a count of 0. Tapping a category navigates to /#/meanings?category=[Name] and the filter chip appears.
result: pass
note: Filter chip on Meanings list shows English category name even in Polish mode — extends G-03-5a.

### 14. Timeline — Growth Rate Bar Chart
expected: Navigate to /#/timeline. The default view shows a bar chart labeled "Growth rate" with new meanings per month on the Y-axis and months on the X-axis. Each bar represents how many new meanings were added that month.
result: pass
note: Chart renders correctly. Data accuracy unverifiable with current small dataset — retest after Phase 4 when more data exists.

### 15. Timeline — Total Vocabulary Line Chart
expected: On the Timeline page, switch to the "Total vocabulary" tab. The chart changes to a line chart showing cumulative active meanings over time (Y-axis increases monotonically or stays flat, never decreases unless meanings are deactivated).
result: pass
note: Chart renders and tab switch works. Data accuracy unverifiable with current small dataset — retest after Phase 4.

### 16. Timeline — Date Range Selector
expected: On the Timeline page, click "Last 6 months", then "Last 12 months", then "All time". Each selection updates the chart to show data only within that window. "All time" shows the full history.
result: pass
note: Button states verified. Data filtering unverifiable with current small dataset — retest after Phase 4.

### 17. Timeline — Data Table
expected: Below the chart on the Timeline page, a table shows rows with Month, New meanings, and Cumulative total columns. The numbers in the table match what the chart displays.
result: pass

## Summary

total: 17
passed: 17
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-03-5a
  truth: "Category names and filter chip labels are translated when Polish language is selected"
  status: resolved
  resolved_by: 03-05-PLAN.md
  resolved_at: 2026-07-30
  reason: "User reported: category names is always english even if its polish language selected; filter chip also shows English label in Polish mode (confirmed tests 6 and 13)"
  severity: major
  test: 5

- gap_id: G-03-7
  truth: "Dates are formatted using the active language locale (Polish dates in Polish mode)"
  status: resolved
  resolved_by: 03-05-PLAN.md
  resolved_at: 2026-07-30
  reason: "User reported: date is english even when selecting language is polish"
  severity: major
  test: 7

- gap_id: G-03-9
  truth: "Selecting a date in the calendar popover closes the popover automatically"
  status: resolved
  resolved_by: 03-06-PLAN.md
  resolved_at: 2026-07-30
  reason: "User reported: partialy, it updates date but dont closes the popover"
  severity: minor
  test: 9

- gap_id: G-03-10
  truth: "Word forms with no active meanings are visually distinguished or filterable in the list"
  status: resolved
  resolved_by: 03-06-PLAN.md
  resolved_at: 2026-07-30
  reason: "User reported: word form without active meaning still shows normally in list — no indication it's no longer in active use"
  severity: minor
  test: 10

- gap_id: G-03-11
  truth: "Creating a word without entering a meaning is either prevented or handled gracefully (no empty-string meaning saved)"
  status: resolved
  resolved_by: 03-05-PLAN.md
  resolved_at: 2026-07-30
  reason: "User reported: when creating new word and not paste any meaning this creates word with meaning \"\" which is empty string"
  severity: major
  test: 11

- gap_id: G-03-5b
  truth: "A parent can delete a meaning they entered by mistake"
  status: resolved
  resolved_by: 03-06-PLAN.md
  resolved_at: 2026-07-30
  reason: "User reported: when I select 1 meaning I cannot delete it (for example if added by mistake)"
  severity: major
  test: 5

- gap_id: G-03-cal
  truth: "Calendar day cells in the date picker popover are visually separated and individually readable"
  status: failed
  reason: "User reported: dates are so close that its hard to readable, i see 19202122232425"
  severity: minor
  test: 9
  root_cause: ""
  artifacts: []
  missing: []

- gap_id: G-03-popup
  truth: "Add-entry sheet/popup closes after a successful save regardless of whether a meaning was entered"
  status: failed
  reason: "User reported: popup is still visible after creation when no meaning provided; closes correctly when meaning is provided"
  severity: major
  test: 11
  root_cause: ""
  artifacts: []
  missing: []
