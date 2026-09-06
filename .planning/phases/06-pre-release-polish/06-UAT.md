---
status: testing
phase: 06-pre-release-polish
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md, 06-06-SUMMARY.md
started: 2026-09-03T11:00:00Z
updated: 2026-09-03T11:00:00Z
---

## Current Test

number: 1
name: Dashboard stat card navigation
expected: |
  Open the Dashboard. The three stat cards (Active Meanings, Active Word Forms, New This Month) should all be tappable. Tapping "Active Meanings" navigates to the Meanings list, tapping "Active Word Forms" navigates to the Word Forms list, tapping "New This Month" navigates to the Meanings list. Each card shows a keyboard focus ring when navigated with Tab.
awaiting: user response

## Tests

### 1. Dashboard stat card navigation
expected: Open the Dashboard. The three stat cards (Active Meanings, Active Word Forms, New This Month) should all be tappable. Tapping "Active Meanings" navigates to the Meanings list, tapping "Active Word Forms" navigates to the Word Forms list, tapping "New This Month" navigates to the Meanings list. Each card shows a keyboard focus ring when navigated with Tab.
result: [pending]

### 2. Meaning inline edit — enter and save
expected: Open a Meaning detail page. An "Edit" button is visible. Tapping Edit shows a textarea pre-filled with the meaning text and category chips for editing. Typing a new value and tapping "Save Changes" updates the meaning text and exits edit mode. Tapping "Discard Changes" cancels without saving. The Save button is disabled when the textarea is empty.
result: [pending]

### 3. Category i18n on Meaning detail
expected: On a Meaning detail page that has at least one category assigned, the category badges show translated Polish or English labels (e.g. "Zwierzęta" or "Animals"), not raw keys like "animals".
result: [pending]

### 4. Meaning isActive read-only badge
expected: On a Meaning detail page, the active/inactive status is displayed as a read-only Badge ("Active" or "Inactive"), not as an interactive Switch. The badge state reflects whether any linked word-form pairs are active.
result: [pending]

### 5. Per-pair Collapsible rows on Meaning detail
expected: On a Meaning detail page with at least one linked word form, each pair row is collapsed by default. Tapping a row expands it to reveal two date inputs (First Observed, Last Used) and an isActive Switch. Changing a date (then clicking away) or toggling the Switch saves the change without navigation.
result: [pending]

### 6. Navigate from Meaning pair row to Word Form
expected: On a Meaning detail page, the collapsed pair row has an arrow/navigate button on the right. Tapping that button navigates to the corresponding Word Form detail page without expanding/collapsing the Collapsible row.
result: [pending]

### 7. Word Form inline edit — enter and save
expected: Open a Word Form detail page. An "Edit" button is visible. Tapping Edit shows a text input pre-filled with the word form text. Typing a new value and tapping "Save Changes" updates the word form (stored as lowercase) and exits edit mode. Tapping "Discard Changes" cancels. The Save button is disabled when the input is empty.
result: [pending]

### 8. Per-pair Collapsible rows on Word Form detail
expected: On a Word Form detail page with at least one linked meaning, each pair row is collapsed by default. Tapping a row expands it to reveal two date inputs (First Observed, Last Used) and an isActive Switch. Changing a date (then clicking away) or toggling the Switch saves the change without navigation.
result: [pending]

### 9. Navigate from Word Form pair row to Meaning
expected: On a Word Form detail page, the collapsed pair row has an arrow/navigate button. Tapping that button navigates to the corresponding Meaning detail page without toggling the Collapsible row.
result: [pending]

### 10. BottomNav shows 5 tabs including Pairs
expected: The bottom navigation bar shows exactly 5 tabs: Dashboard, Meanings, Word Forms, Pairs (with a branch/link icon), and More. The Pairs tab is visible and tappable on all main screens.
result: [pending]

### 11. Pairs page loads all pairs
expected: Tapping the Pairs tab opens a screen titled "Pairs" (or "Pary" in Polish). All word-form/meaning pairs in the database are listed. Each row shows the word form and meaning text as two chips. If no pairs exist, an empty state message is shown.
result: [pending]

### 12. Pairs page sort selector
expected: On the Pairs page, a sort control is visible. Selecting "A-Z Word Form" sorts pairs alphabetically by word form text. Selecting "A-Z Meaning" sorts by meaning text. Selecting "Newest First" (default) shows most-recently-observed pairs at the top.
result: [pending]

### 13. Pairs page chip navigation
expected: On the Pairs page, tapping the word form chip on any pair row navigates to that word form's detail page. Tapping the meaning chip navigates to that meaning's detail page. Tapping the chips does not expand or collapse the row.
result: [pending]

### 14. Doctor report age format
expected: Open the Doctor Report. If the child is 12 months or older, age is displayed in "X years Y months" format (e.g. "1y 3m" or equivalent localized text). If the child is under 12 months, only the month count is shown (e.g. "8 months").
result: [pending]

### 15. Doctor report per-category meaning list
expected: The Doctor Report includes a section listing meanings grouped by category. Each category heading is followed by an alphabetical list of its active meanings. Each meaning shows the number of linked word forms in parentheses (e.g. "ball (2)").
result: [pending]

### 16. Doctor report recent additions section
expected: The Doctor Report includes a "Recent Additions" section showing up to 5 recently added active meanings (by first observation date, newest first).
result: [pending]

### 17. Doctor report recently forgotten section
expected: The Doctor Report includes a section for recently inactive/forgotten meanings — up to 5 inactive meanings by most-recent last-used date.
result: [pending]

### 18. D1 — WordFormMeaning schema fields
expected: WordFormMeaning interface has firstObservationDate, lastUsedDate, isActive as required fields
result: pass
source: automated
coverage_id: D1

### 19. D2 — Dexie AppDB version 3
expected: Dexie AppDB opens at version 3 with upgrade block
result: pass
source: automated
coverage_id: D2

### 20. D3 — aggregateMeaningFromPairs
expected: aggregateMeaningFromPairs sets isActive/firstUseDate/lastUseDate from linked pairs
result: pass
source: automated
coverage_id: D3

### 21. D4 — updateMeaning validates text
expected: updateMeaning validates non-empty text then updates DB row
result: pass
source: automated
coverage_id: D4

### 22. D5 — updateWordForm lowercases
expected: updateWordForm normalizes to lowercase and updates DB row
result: pass
source: automated
coverage_id: D5

### 23. D6 — updatePairFields atomic
expected: updatePairFields updates pair and triggers Meaning aggregation atomically
result: pass
source: automated
coverage_id: D6

### 24. D7 — getPairsWithDetails enriched join
expected: getPairsWithDetails returns pairs enriched with wordFormText and meaningText
result: pass
source: automated
coverage_id: D7

### 25. D8 — addWordEntry stores user date
expected: addWordEntry stores pair.firstObservationDate from user-supplied firstUseDate (D-04)
result: pass
source: automated
coverage_id: D8

## Summary

total: 25
passed: 8
issues: 0
pending: 17
skipped: 0
blocked: 0

## Gaps

[none yet]
