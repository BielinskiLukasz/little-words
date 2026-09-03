---
phase: 06-pre-release-polish
plan: "04"
subsystem: WordFormDetailPage
tags: [ui, editing, i18n, accessibility, pairs]
status: complete

dependency_graph:
  requires:
    - "06-01 (updateWordForm, updatePairFields services)"
    - "06-02 (i18n keys: common.edit, common.saveChanges, common.discardChanges, pair.* group)"
  provides:
    - WordFormDetailPage extended with inline edit for word form text
    - Per-pair expandable Collapsible rows with date inputs and isActive Switch
    - Navigation arrow from pair row to /meanings/:id
  affects:
    - src/pages/WordFormDetailPage.tsx

tech_stack:
  added: []
  patterns:
    - Radix Collapsible for per-pair expandable rows (same as MeaningDetailPage)
    - Uncontrolled input[type=date] with onBlur save (blur-triggered save, D-08)
    - e.stopPropagation() on navigation arrow to prevent Collapsible toggle
    - pairs useLiveQuery + linkedMeanings useLiveQuery (parallel reactive queries)

key_files:
  created: []
  modified:
    - src/pages/WordFormDetailPage.tsx

decisions:
  - "Used existing wordForm.noLinkedMeanings key instead of adding near-duplicate wordForm.noMeaningsLinked — semantically equivalent, avoids key sprawl"
  - "Used t('errors.somethingWentWrong') for error toasts — consistent with Plan 03 (t('error.generic') key does not exist)"
  - "Used defaultValue (uncontrolled) for date inputs — avoids controlled/uncontrolled mixing; blur-triggered save (D-08)"

metrics:
  duration_min: 8
  completed_date: "2026-09-03"
  tasks_completed: 2
  commits: 2

estimate:
  tokens: 70000

actuals:
  tokens: 14000
  tasks: 2
  commits: 2
---

# Phase 06 Plan 04: WordFormDetailPage Extension Summary

**One-liner:** WordFormDetailPage extended with inline edit for word form text and per-pair Collapsible rows with input[type=date] and isActive Switch navigating to /meanings/:id, mirroring the MeaningDetailPage pattern from Plan 03.

## What Was Built

### Task 1 (Tracer): Inline edit mode for word form text

Extended `WordFormDetailPage.tsx` header area:

- **Inline edit state**: `isEditing`, `editForm`, `isSaving`
- **enterEditMode**: populates `editForm` from `wordForm.form`, sets `isEditing = true`
- **handleSave**: calls `updateWordForm(wordForm.id!, editForm)`, exits edit mode on success, fires Sonner toast on error; disabled when `editForm.trim().length === 0` (T-06-04-01 mitigation)
- **handleDiscard**: sets `isEditing = false` without DB write
- **Edit mode UI**: `input[type=text]` with `text-2xl font-bold` matching heading style; Save Changes + Discard Changes buttons with spinner/disabled pattern
- **Read mode UI**: `<h1>` heading + Edit `<Button variant="outline">` in header row
- **Imports added**: `updateWordForm` from `@/db/services/wordForm.service`, `toast` from `sonner`

### Task 2 (Auto): Per-pair expandable Collapsible rows

Extended the linked meanings section:

- **pairs query**: `useLiveQuery(() => db.wordFormMeanings.where('wordFormId').equals(wordForm.id).toArray(), [wordForm?.id])`
- **linkedMeanings query**: unchanged — used to resolve meaning text from `pair.meaningId`
- **Collapsible per pair**: collapsed state shows meaning text + navigation arrow Button
- **Navigation arrow**: `e.stopPropagation()` + `navigate('/meanings/' + pair.meaningId)` with `aria-label={t('pair.goToMeaning')}`
- **Touch target**: `min-h-[44px]` on the collapsed trigger div (UI-SPEC 44px minimum)
- **CollapsibleContent**: two-column grid with `input[type=date]` for firstObservationDate + lastUsedDate, Switch for isActive
- **handlePairDateBlur**: guards empty string, calls `updatePairFields(pairId, { [field]: value })`
- **handlePairActiveChange**: calls `updatePairFields(pairId, { isActive: checked })`
- **Date inputs**: uncontrolled with `defaultValue` + `onBlur` save (D-08 — no Calendar/Popover)
- **Empty state**: uses existing `t('wordForm.noLinkedMeanings')` key

## Commits

| Hash | Message |
|------|---------|
| 847c7de | feat(06-04): add inline edit mode for word form text |
| 24b1d99 | feat(06-04): add per-pair collapsible rows with dates and isActive Switch |

## Verification Results

- `npm run build` exits 0 (both after Task 1 and Task 2)
- `grep -c "updateWordForm" WordFormDetailPage.tsx` → 2
- `grep -c "updatePairFields" WordFormDetailPage.tsx` → 3
- `grep -c "CollapsibleContent" WordFormDetailPage.tsx` → 3
- `grep -c 'type="date"' WordFormDetailPage.tsx` → 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used existing wordForm.noLinkedMeanings instead of adding near-duplicate key**
- **Found during:** Task 2 implementation
- **Issue:** Plan specifies `t('wordForm.noMeaningsLinked')` with instruction "add if it doesn't already exist." The key `wordForm.noLinkedMeanings` already exists with semantically equivalent text ("No meanings linked yet." / "Żadne znaczenia nie są jeszcze powiązane."). Adding a second key for the same concept creates i18n key sprawl.
- **Fix:** Used `t('wordForm.noLinkedMeanings')` — the existing key
- **Files modified:** src/pages/WordFormDetailPage.tsx (no locale files changed)

**2. [Rule 1 - Bug] Used t('errors.somethingWentWrong') for toast errors**
- **Found during:** Task 1 implementation
- **Issue:** Plan spec references `t('error.generic')` but that key does not exist; same issue discovered and fixed in Plan 03
- **Fix:** Used `t('errors.somethingWentWrong')` — consistent with Plan 03 pattern
- **Files modified:** src/pages/WordFormDetailPage.tsx

## Known Stubs

None.

## Threat Flags

None — empty-string guard on date blur (T-06-04-02), Save disabled when empty (T-06-04-01), navigation uses DB-sourced numeric ID (T-06-04-03 accepted).

## Self-Check: PASSED

- src/pages/WordFormDetailPage.tsx: modified and present
- Commit 847c7de exists in git log
- Commit 24b1d99 exists in git log
- npm run build exits 0
- All 4 verification grep checks pass
