---
phase: 03-browse-views
reviewed: 2026-07-30T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/db/services/meaning.service.ts
  - src/db/services/wordEntry.service.ts
  - src/db/services/wordForm.service.ts
  - src/i18n/locales/en/common.json
  - src/i18n/locales/pl/common.json
  - src/pages/MeaningDetailPage.tsx
  - src/pages/MeaningsPage.tsx
  - src/pages/WordFormDetailPage.tsx
  - src/pages/WordFormsPage.tsx
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-07-30
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Focused review of the browse views service layer, pages, and locale files identified one critical data consistency bug and five warnings affecting localization and UI consistency. The critical issue involves inconsistent date formatting that could cause incorrect filtering and comparisons. Multiple UI strings are hard-coded in English, breaking Polish localization support. One service function has a type safety violation. Design tokens are not consistently applied.

## Critical Issues

### CR-01: Inconsistent date format in firstUseDate storage

**File:** `src/db/services/wordEntry.service.ts:58`

**Issue:** When a meaning's `firstUseDate` is not provided by the caller, the code stores it in YYYY-MM-DD format (first 10 characters of ISO string) instead of the full ISO 8601 format used throughout the rest of the application. This creates a data consistency issue where stored dates in the database are in mixed formats.

**Impact:** The `getMeaningsByMonth()` (line 128-129) and `getMeaningsUnused30Days()` (line 59-62) functions in `meaning.service.ts` use `.between()` and `.below()` with full ISO strings. String comparisons between "2026-07-30" (10 chars) and "2026-07-30T00:00:00.000Z" (24 chars) may produce unexpected sort order or range filtering failures due to different string lengths in lexicographic ordering.

**Current code:**
```typescript
const isoDate = meaning.firstUseDate ?? new Date().toISOString().slice(0, 10)
```

**Fix:**
```typescript
const isoDate = meaning.firstUseDate ?? new Date().toISOString()
```

Remove the `.slice(0, 10)` to keep the full ISO format consistent with the rest of the application.

---

## Warnings

### WR-01: Type safety violation in wordForm.service.ts return type

**File:** `src/db/services/wordForm.service.ts:62`

**Issue:** The `getWordFormWithMeaningCount()` function declares return type `Promise<(WordForm & { meaningCount: number }) | undefined>`, but when `!form.id`, it returns `form as undefined` — a bare WordForm without the promised `meaningCount` field, masked by a type assertion. This violates the return type contract and could cause runtime errors if calling code assumes `meaningCount` exists on the returned value.

**Current code:**
```typescript
export async function getWordFormWithMeaningCount(
  id: number
): Promise<(WordForm & { meaningCount: number }) | undefined> {
  const form = await db.wordForms.get(id)
  if (!form || !form.id) return form as undefined  // ← Wrong: returns bare WordForm, asserts as undefined

  const meaningCount = await db.wordFormMeanings
    .where('wordFormId')
    .equals(form.id)
    .count()

  return { ...form, meaningCount }
}
```

**Fix:**
```typescript
if (!form || !form.id) return undefined
```

Simply return `undefined` without the type assertion. The check already ensures that if we get past this line, `form` and `form.id` are truthy.

---

### WR-02: Hard-coded English text in delete confirmation dialog

**File:** `src/pages/MeaningDetailPage.tsx:241-245`

**Issue:** The delete confirmation dialog uses hard-coded English text instead of translation keys, breaking localization for Polish users. The translation keys exist in both locale files (`meaning.deleteConfirm.title` and `meaning.deleteConfirm.description`) but are not used here. By contrast, `WordFormDetailPage.tsx` (lines 154-157) correctly uses `t()` for the same dialog pattern.

**Current code:**
```tsx
<AlertDialogTitle>Delete meaning?</AlertDialogTitle>
<AlertDialogDescription>
  This will remove the meaning, but linked word forms will remain.
</AlertDialogDescription>
```

**Fix:**
```tsx
<AlertDialogTitle>
  {t('meaning.deleteConfirm.title')}
</AlertDialogTitle>
<AlertDialogDescription>
  {t('meaning.deleteConfirm.description')}
</AlertDialogDescription>
```

---

### WR-03: Hard-coded "Deleting..." string without translation

**File:** `src/pages/MeaningDetailPage.tsx:256`

**Issue:** The delete button loading state uses hard-coded English string `"Deleting..."` instead of the translation key `t('common.deleting')`, which exists in both locale files.

**Current code:**
```tsx
{isDeleting ? 'Deleting...' : t('common.delete')}
```

**Fix:**
```tsx
{isDeleting ? t('common.deleting') : t('common.delete')}
```

---

### WR-04: Hard-coded "Inactive" badge label in word forms list

**File:** `src/pages/WordFormsPage.tsx:79`

**Issue:** The "Inactive" badge on word forms with no active meanings is hard-coded in English. No translation key exists in the locale files, breaking localization consistency. Polish users see an English-language label mixed with Polish UI.

**Current code:**
```tsx
<Badge variant="outline" className="text-gray-400 bg-gray-100">
  Inactive
</Badge>
```

**Fix:** 
1. Add new locale keys to both files:
   - `en/common.json`: `"inactive": "Inactive"`
   - `pl/common.json`: `"inactive": "Nieaktywne"`

2. Update the component:
```tsx
<Badge variant="outline" className="text-muted-foreground">
  {t('wordForm.inactive')}
</Badge>
```

---

### WR-05: Hard-coded gray colors break semantic design tokens

**File:** `src/pages/WordFormsPage.tsx:78`

**Issue:** The "Inactive" badge uses hard-coded Tailwind color classes (`bg-gray-100`, `text-gray-400`) instead of semantic design system tokens. This breaks consistency with the design system and prevents proper theming (especially if dark mode is added). All other UI elements in the app use semantic colors like `bg-card`, `text-muted-foreground`.

**Current code:**
```tsx
<Badge variant="outline" className="text-gray-400 bg-gray-100">
```

**Fix:**
```tsx
<Badge variant="outline" className="text-muted-foreground">
```

The `Badge` component with `variant="outline"` already provides appropriate background styling through the design system. Only the foreground text color needs adjustment to indicate disabled/inactive state using the semantic token `text-muted-foreground`.

---

## Info

### IN-01: Error handling inconsistency between detail pages

**File:** `src/pages/MeaningDetailPage.tsx:90-99` vs `src/pages/WordFormDetailPage.tsx:43-53`

**Issue:** Two nearly identical detail pages handle deletion errors differently:

- **MeaningDetailPage.tsx (line 90-99):** Catches error but does not reset `isDeleting` state in the catch block, leaving the button in loading state after an error occurs.
- **WordFormDetailPage.tsx (line 43-53):** Properly resets `isDeleting` in the `finally` block, ensuring the button becomes clickable again even if deletion fails.

The WordFormDetailPage pattern is more robust because it always resets loading state.

**Suggestion:**
```typescript
const handleDelete = async () => {
  setIsDeleting(true)
  try {
    await deleteMeaning(meaning.id!)
    navigate('/meanings')
  } catch (error) {
    console.error('Failed to delete meaning:', error)
  } finally {
    setIsDeleting(false)  // ← Add finally block
  }
}
```

---

### IN-02: Mixed date format usage across modules

**File:** `src/db/services/wordEntry.service.ts:58` and `src/pages/MeaningDetailPage.tsx:78-87`

**Issue:** The `handleUpdateDate` function calls `updateLastUseDate()` with a full ISO string (line 81: `newDate.toISOString()`), but this mixed with the inconsistent date storage from CR-01 creates potential for confusion. While JavaScript's `Date` constructor is lenient and handles both YYYY-MM-DD and full ISO formats, consistent formatting across the codebase would improve maintainability.

**Note:** This is lower priority than CR-01, which must be fixed for correctness. Once CR-01 is fixed (store full ISO format), this inconsistency should be re-evaluated.

---

_Reviewed: 2026-07-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
