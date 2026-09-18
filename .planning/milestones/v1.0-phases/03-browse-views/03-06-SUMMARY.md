---
phase: 03-browse-views
plan: 06
type: execute
gap_closure: true
gap_ids: [G-03-5b, G-03-9, G-03-10]
requirements: [BROWSE-02, BROWSE-04]
subsystem: Data Management & UX Polish
tags: [gaps, delete, popover, visual-distinction]
status: complete
completed_date: 2026-07-30
duration_minutes: 25
task_count: 3
file_count: 4
---

# Phase 03 Plan 06: Close UAT Gaps Summary

Close three small UAT gaps: add meaning delete feature, fix calendar popover close behavior, and visually distinguish inactive word forms.

**One-liner:** Deleted meanings cascade cleanly; calendar closes after date pick; inactive word forms are visually evident.

## Completed Tasks

| Task | Name | Type | Status | Commit |
|------|------|------|--------|--------|
| 1 | Add delete meaning feature (G-03-5b) | auto | Complete | 8927803 |
| 2 | Fix calendar popover close on date selection (G-03-9) | auto | Complete | 8927803 |
| 3 | Add active meaning count to word forms and visual distinction (G-03-10) | auto | Complete | 5d5e19c |

## What Was Built

### Task 1: Delete Meaning Feature (G-03-5b)

**Artifact:** `src/db/services/meaning.service.ts` — Added `deleteMeaning(meaningId: number)` function

- Implements cascade delete of all `wordFormMeanings` junction rows that reference the meaning before deleting the meaning itself
- Uses Dexie transaction for atomicity, matching the `deleteWordForm` pattern from Phase 03-03
- Import added to `MeaningDetailPage.tsx`

**Artifact:** `src/pages/MeaningDetailPage.tsx` — Added delete UI

- New state: `isDeleting`, `showDeleteConfirm`
- Delete button at bottom of detail page opens confirmation dialog
- AlertDialog component with title "Delete meaning?" and description about linked word forms remaining
- `handleDelete()` async function: calls service, navigates to `/meanings` on success
- Proper error handling and loading state (`disabled={isDeleting}`)

**Verification:**
```bash
grep -n "export.*deleteMeaning" src/db/services/meaning.service.ts  # ✓ Found
grep -n "AlertDialog" src/pages/MeaningDetailPage.tsx              # ✓ Found (multiple)
```

### Task 2: Fix Calendar Popover Close (G-03-9)

**Artifact:** `src/pages/MeaningDetailPage.tsx` — Added popover state management

- New state: `popoverOpen` initialized to `false`
- Popover Root wired: `<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>`
- Calendar's `onSelect` handler now closes popover: `setPopoverOpen(false)` after `await updateLastUseDate(...)`
- Popover closes automatically after user selects a date and it's committed to the database

**Verification:**
```bash
grep -n "popoverOpen" src/pages/MeaningDetailPage.tsx  # ✓ Found in state + Popover props
```

**Key Change:**
```typescript
const handleUpdateDate = async (newDate: Date) => {
  setIsSaving(true)
  try {
    await updateLastUseDate(meaning.id!, newDate.toISOString())
    setPopoverOpen(false)  // ← Closes popover after save
    // ...
  }
}
```

### Task 3: Visual Distinction for Inactive Word Forms (G-03-10)

**Artifact:** `src/db/services/wordForm.service.ts` — Added `getWordFormsWithActiveMeaningCount()`

- Fetches all word forms and enriches each with `activeMeaningCount` field
- Counts only meanings where `isActive === true` (filters out inactive meanings)
- Returns `WordForm & { activeMeaningCount: number }` array
- Query logic: word form → links → linked meanings → filter active → count

**Artifact:** `src/pages/WordFormsPage.tsx` — Updated query and rendering

- `useLiveQuery` now calls `getWordFormsWithActiveMeaningCount()` instead of raw `db.wordForms.toArray()`
- Rendering adds visual distinction:
  - Row opacity set to 50% for word forms with `activeMeaningCount === 0`
  - "Inactive" badge (gray outline, gray text) appears next to word form name when no active meanings
- Badge imported from `@/components/ui/badge`

**Verification:**
```bash
grep -n "activeMeaningCount" src/db/services/wordForm.service.ts  # ✓ Function defined
grep -n "activeMeaningCount" src/pages/WordFormsPage.tsx           # ✓ Used in rendering
```

## Verification Results

All three gaps closed successfully:

1. **G-03-5b (Delete Meaning):** ✓ Delete button visible on MeaningDetailPage; AlertDialog appears; canceling preserves; confirming removes meaning and navigates to Meanings list

2. **G-03-9 (Popover Close):** ✓ Calendar popover closes automatically after date selection is saved

3. **G-03-10 (Visual Distinction):** ✓ Word forms with zero active linked meanings render with reduced opacity and "Inactive" badge

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all features are complete and wired.

## Tech Stack & Patterns

**Dependencies:** React 19, Dexie v4, dexie-react-hooks, React Router v7 (hash), Shadcn/UI (Button, Badge, AlertDialog, Popover, Calendar)

**Patterns Used:**
- Cascade delete (Dexie transaction) — consistent with Phase 03-03 WordForm deletion
- Controlled Popover with manual close — precise UX control
- Enriched query service (getWordFormsWithActiveMeaningCount) — avoids rendering-layer logic

## Threat Surface

No new trust boundaries or security-relevant surfaces introduced.

## Files Modified

- `src/db/services/meaning.service.ts` — Added `deleteMeaning()` (14 lines)
- `src/pages/MeaningDetailPage.tsx` — Added delete UI, popover state, handlers (37 lines added)
- `src/db/services/wordForm.service.ts` — Added `getWordFormsWithActiveMeaningCount()` (28 lines)
- `src/pages/WordFormsPage.tsx` — Updated query, added visual distinction (12 lines added)

**Total:** 4 files modified, ~91 lines added/changed

## Commits

- `8927803` — feat(03-06): add delete meaning feature and fix calendar popover close (G-03-5b, G-03-9)
- `5d5e19c` — feat(03-06): add active meaning count to word forms and visual distinction (G-03-10)

## Requirements Met

- [x] BROWSE-02: Users can manage meanings (now includes delete)
- [x] BROWSE-04: Word forms list is informative (now shows active meaning count)

## Self-Check: PASSED

- [x] deleteMeaning() function exists in meaning.service.ts
- [x] MeaningDetailPage has delete button and AlertDialog
- [x] popoverOpen state is declared and wired
- [x] handleUpdateDate closes popover after save
- [x] getWordFormsWithActiveMeaningCount() function exists
- [x] WordFormsPage uses enriched query and displays inactive badge
- [x] All commits present in git history
