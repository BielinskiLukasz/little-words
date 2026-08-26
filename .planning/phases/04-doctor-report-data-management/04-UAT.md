---
status: complete
phase: 04-doctor-report-data-management
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-08-26T00:00:00Z
updated: 2026-08-26T00:01:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Doctor Report Page Loads with Auto-Generated Report
expected: Navigate to /#/doctor-report. The page displays a formatted plain-text report that includes: today's date, child's name, child's age (in months if under 2 years, years if 2+), counts for active/inactive/new-in-last-3-months meanings, active word form count, top 3 categories by active meaning count, home languages, and all 3 medical flags (always shown as explicit yes/no).
result: pass

### 2. Copy Report to Clipboard
expected: On the Doctor Report page, click the "Copy" button. The report text is copied to the clipboard. A Sonner toast appears at the bottom-center of the screen confirming the copy (e.g., "Report copied!" or equivalent Polish text).
result: pass

### 3. Parent Notes Auto-Save
expected: On the Doctor Report page, type something in the parent notes textarea, then click elsewhere (blur the field). Refresh the page — the notes you typed are still there. The save happens silently on blur with no explicit save button needed.
result: pass

### 4. Export JSON Backup
expected: Go to Settings → Data section. Click "Export JSON". The browser downloads a file named little-words-backup-YYYY-MM-DD.json (with today's date). The file contains all your data in a structured JSON format.
result: pass

### 5. Import JSON Backup — Success Flow
expected: In Settings → Data section, click "Import JSON". An AlertDialog warning appears explaining the import will replace all existing data. After confirming, a file picker opens. Select a previously exported backup file. The import completes, a success toast (Sonner) appears at the bottom, and data is restored.
result: pass

### 6. Import JSON — Invalid File Handling
expected: In Settings → Data section, click "Import JSON", confirm the warning, then select a file that is NOT a valid backup (e.g., a random JSON file or a text file). An error dialog appears with an appropriate message distinguishing between a corrupt file vs a file from the wrong schema version. No data is lost from the existing database.
result: pass

### 7. Export CSV Meanings
expected: In Settings → Data section, click "Export CSV". The browser downloads a file named little-words-meanings.csv. Opening it shows a header row (label, categories, firstUseDate, lastUseDate, active, wordForms) followed by one row per meaning. Multiple categories or word forms for a single meaning are separated by semicolons within the cell.
result: [pending]

## Summary

total: 7
passed: 6
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-04-7
  truth: "CSV export column order has wordForms as 1st or 2nd column for readability"
  status: failed
  reason: "User reported: correct but move wordForms on the beggining (1st or 2nd column)"
  severity: minor
  test: 7
  artifacts: []
  missing: []

## Deferred Follow-Ups

- test: 1
  idea: "show used words and meanings in report so doctor can see what kind of words child uses"
  deferred_at: 2026-08-26
