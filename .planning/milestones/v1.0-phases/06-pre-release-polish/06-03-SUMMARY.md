---
phase: 06-pre-release-polish
plan: "03"
subsystem: MeaningDetailPage
tags: [ui, editing, i18n, accessibility, pairs]
status: complete

dependency_graph:
  requires:
    - "06-01 (updateMeaning, updatePairFields, aggregateMeaningFromPairs services)"
    - "06-02 (i18n keys: common.edit, common.saveChanges, common.discardChanges, pair.* group)"
  provides:
    - MeaningDetailPage fully rewritten with inline edit + per-pair rows
    - Category i18n fix (D-16)
    - Navigation from Meaning detail to WordForm detail (D-06)
    - Inline edit for text and categories (D-05)
    - Per-pair expandable rows with date inputs and isActive Switch (D-06, D-08)
    - Read-only isActive Badge derived from pairs (D-02)
  affects:
    - src/pages/MeaningDetailPage.tsx

tech_stack:
  added: []
  patterns:
    - Radix Collapsible for per-pair expandable rows
    - Uncontrolled input[type=date] with onBlur save (blur-triggered save)
    - CategoryChips reused in inline edit mode
    - useLiveQuery for reactive pairs data alongside linked word forms
    - e.stopPropagation() on navigation arrow to prevent Collapsible toggle

key_files:
  created: []
  modified:
    - src/pages/MeaningDetailPage.tsx

decisions:
  - "Both tasks (tracer + auto) implemented in one commit since they modify the same file"
  - "Used t('errors.somethingWentWrong') instead of t('error.generic') — the latter key does not exist; the former is the correct existing error key"
  - "Used t('pair.active') / t('wordForm.inactive') for the Meaning isActive Badge — these are the closest existing keys matching the intent of t('active')/t('inactive') from the plan spec"
  - "Kept meaning.firstUseDate as read-only display (aggregated from pairs via D-02); preserves contextual info for the user"
  - "Used defaultValue (uncontrolled) for date inputs — avoids controlled/uncontrolled mixing; user can type freely, save fires on blur"

metrics:
  duration_min: 10
  completed_date: "2026-09-03"
  tasks_completed: 2
  commits: 1

estimate:
  tokens: 80000

actuals:
  tokens: 18000
  tasks: 2
  commits: 1
---

# Phase 06 Plan 03: MeaningDetailPage Rewrite Summary

**One-liner:** MeaningDetailPage fully rewritten with inline edit for text/categories, per-pair Collapsible rows with input[type=date] and isActive Switch, category i18n fix, and read-only derived isActive Badge.

## What Was Built

### Task 1 (Tracer): Inline edit mode + category i18n fix

Rewrote the header/edit area of `MeaningDetailPage.tsx`:

- **Inline edit state**: `isEditing`, `editText`, `editCategories`
- **enterEditMode**: populates edit state from meaning, shows textarea + CategoryChips
- **handleSave**: calls `updateMeaning(id, { text, categories })`, exits edit mode on success, fires Sonner toast on error
- **handleDiscard**: exits edit mode without DB write
- **Category i18n fix (D-16)**: category badges now use `t('category.' + cat)` instead of raw `cat`
- **isActive Badge**: replaced the Switch with `<Badge variant="default|secondary">` showing t('pair.active') or t('wordForm.inactive') — isActive is now read-only at Meaning level, derived from pairs (D-02)
- **Removed**: Calendar, Popover, CalendarIcon imports; `handleToggleActive`, `handleUpdateDate`, `popoverOpen` state

### Task 2 (Auto): Per-pair expandable Collapsible rows

Extended the linked word forms section:

- **pairs query**: `useLiveQuery(() => db.wordFormMeanings.where('meaningId').equals(meaning.id).toArray(), [meaning?.id])`
- **Collapsible per pair**: collapsed state shows word form text + navigation arrow → Button
- **Navigation arrow**: `e.stopPropagation()` + `navigate('/word-forms/' + pair.wordFormId)` — arrow does NOT toggle collapsible (D-06)
- **Touch target**: `min-h-[44px]` on the collapsed trigger div (UI-SPEC 44px minimum)
- **CollapsibleContent**: two-column grid with `input[type=date]` for firstObservationDate + lastUsedDate, Switch for isActive
- **handlePairDateBlur**: guards empty string, calls `updatePairFields(pairId, { [field]: value })`
- **handlePairActiveChange**: calls `updatePairFields(pairId, { isActive: checked })`
- **Date inputs**: uncontrolled with `defaultValue` + `onBlur` save (D-08 — no Calendar/Popover)

## Commits

| Hash | Message |
|------|---------|
| 9b9b8c6 | feat(06-03): rewrite MeaningDetailPage with inline edit and per-pair rows |

## Verification Results

- `npm run build` exits 0
- `grep -c "updateMeaning" MeaningDetailPage.tsx` → 2
- `grep -c "updatePairFields" MeaningDetailPage.tsx` → 3
- `grep -c "CollapsibleContent" MeaningDetailPage.tsx` → 3
- `grep -c 'type="date"' MeaningDetailPage.tsx` → 2
- No Calendar or Popover imports remain

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used t('errors.somethingWentWrong') instead of t('error.generic')**
- **Found during:** Task 1 implementation
- **Issue:** The plan spec references `t('error.generic')` but that key does not exist in either locale file; `errors.somethingWentWrong` = "Something went wrong" is the correct existing key
- **Fix:** Used `t('errors.somethingWentWrong')` in all toast.error calls
- **Files modified:** src/pages/MeaningDetailPage.tsx

**2. [Rule 1 - Bug] Used t('pair.active')/t('wordForm.inactive') for Meaning isActive Badge**
- **Found during:** Task 1 implementation
- **Issue:** The plan spec references `t('active')` and `t('inactive')` as top-level keys; no such keys exist in common.json (06-02 did not add them)
- **Fix:** Used `t('pair.active')` = "Active" and `t('wordForm.inactive')` = "Inactive" — the closest semantically-correct existing keys
- **Files modified:** src/pages/MeaningDetailPage.tsx

**3. [Rule 1 - Bug] Removed mixed controlled/uncontrolled date input pattern**
- **Found during:** Task 2 implementation
- **Issue:** The plan spec shows `value={...}` and `defaultValue={...}` on the same input — this is invalid React (controlled and uncontrolled simultaneously, causes warnings)
- **Fix:** Used `defaultValue` only (uncontrolled pattern, consistent with blur-triggered save)
- **Files modified:** src/pages/MeaningDetailPage.tsx

**4. [Rule 2 - Missing critical functionality] Save button disabled when editText is empty**
- **Found during:** Task 1 (T-06-03-01 threat mitigation)
- **Issue:** The threat model T-06-03-01 requires the Save button to be disabled when editText.trim() is empty (as well as the service-level validation in updateMeaning)
- **Fix:** Added `disabled={isSaving || editText.trim().length === 0}` to the Save button
- **Files modified:** src/pages/MeaningDetailPage.tsx

## Known Stubs

None.

## Threat Flags

None — all data inputs are validated (empty-string guard on date blur, non-empty text guard on Save button), all navigation targets use DB-sourced numeric IDs.

## Self-Check: PASSED

- src/pages/MeaningDetailPage.tsx: modified and verified present
- Commit 9b9b8c6 exists in git log
- npm run build exits 0
- All 5 verification grep checks pass
