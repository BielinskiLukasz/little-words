---
phase: 03-browse-views
reviewed: 2026-07-29T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/pages/DashboardPage.tsx
  - src/pages/MeaningsPage.tsx
  - src/pages/MeaningDetailPage.tsx
  - src/pages/WordFormsPage.tsx
  - src/pages/WordFormDetailPage.tsx
  - src/pages/CategoriesPage.tsx
  - src/pages/TimelinePage.tsx
  - src/db/services/meaning.service.ts
  - src/db/services/wordForm.service.ts
  - src/router/index.tsx
  - src/components/ui/alert-dialog.tsx
  - src/components/ui/card.tsx
  - src/components/ui/chart.tsx
  - src/components/ui/switch.tsx
  - src/components/ui/table.tsx
  - src/i18n/locales/en/common.json
  - src/i18n/locales/pl/common.json
  - package.json
findings:
  critical: 0
  warning: 5
  info: 2
  total: 7
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-07-29
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

The phase 3 browse-views implementation provides well-structured page components with clear separation of concerns. Pages correctly use `useLiveQuery` for reactive data binding, and routing is properly configured for GitHub Pages hash-based navigation. However, the review identified **5 warnings and 2 info items** requiring attention:

- **Hardcoded English locale** in date formatting (breaking i18n for Polish users)
- **Type safety violation** in wordForm service return type logic
- **Missing error feedback** when operations fail (saves/deletes)
- **Performance issue** in timeline table rendering (O(n²) search)
- **Misleading comment** about "active" word forms when no such filter exists

No critical security or data-loss issues were found.

## Critical Issues

None found.

## Warnings

### WR-01: Hardcoded English locale in date formatting breaks i18n

**File:** `src/pages/MeaningDetailPage.tsx:79` and `src/pages/WordFormDetailPage.tsx:57`

**Issue:** Both files hardcode `'en-US'` locale in `toLocaleDateString()` calls. The app supports Polish (see `src/i18n/locales/pl/common.json`), but Polish users will see English-formatted dates. This violates the i18n contract.

**Fix:**
```typescript
// MeaningDetailPage.tsx, line 79
// BEFORE:
return date.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

// AFTER:
const { i18n } = useTranslation('common')
return date.toLocaleDateString(i18n.language, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})
```

Apply the same fix to `src/pages/WordFormDetailPage.tsx:57`.

---

### WR-02: Type safety violation in wordForm.service.ts

**File:** `src/db/services/wordForm.service.ts:62`

**Issue:** `getWordFormWithMeaningCount()` function returns `form as undefined` when `!form.id`, but the declared return type is `(WordForm & { meaningCount: number }) | undefined`. This breaks the type contract:

- If `form` exists but has no `id`, the function returns `form` (a `WordForm` object) but casts it as `undefined`
- The return type promises either a WordForm with meaningCount OR undefined, not a bare WordForm

**Fix:**
```typescript
// BEFORE (line 61-62):
if (!form || !form.id) return form as undefined

// AFTER:
if (!form || !form.id) return undefined

// THEN add meaningCount and return properly:
return { ...form, meaningCount }
```

---

### WR-03: Missing error feedback when save/delete operations fail

**File:** `src/pages/MeaningDetailPage.tsx:60, 71` and `src/pages/WordFormDetailPage.tsx:49`

**Issue:** Error handlers only log to console with `console.error()`. If a toggle, date update, or delete fails, the UI provides no feedback. The `isSaving` state is set but errors are silent.

**Current code (MeaningDetailPage.tsx, line 59-62):**
```typescript
try {
  await toggleMeaningActive(meaning.id!, newState)
} catch (err) {
  console.error('Failed to toggle active:', err)  // Silent error
}
```

**Fix:** Add error state and display error UI:
```typescript
const [error, setError] = useState<string | null>(null)

const handleToggleActive = async (newState: boolean) => {
  setIsSaving(true)
  setError(null)
  try {
    await toggleMeaningActive(meaning.id!, newState)
  } catch (err) {
    setError(t('errors.saveFailed') || 'Failed to save')
    console.error('Failed to toggle active:', err)
  } finally {
    setIsSaving(false)
  }
}

// In JSX, render error:
{error && (
  <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
    {error}
  </div>
)}
```

Apply to both MeaningDetailPage (lines 59, 71) and WordFormDetailPage (line 49).

---

### WR-04: O(n²) performance in TimelinePage table rendering

**File:** `src/pages/TimelinePage.tsx:225`

**Issue:** Inside the table body loop, `growthData.find(d => d.month === row.month)` performs a linear search for every cumulative data row. This is O(n²) complexity. While dataset is currently small, this degrades performance as data grows.

**Fix:**
```typescript
// Convert growthData to a Map for O(1) lookup
const growthDataMap = new Map(growthData.map(d => [d.month, d.count]))

// Then in the table loop:
{cumulativeData.map((row, idx) => {
  const newCount = growthDataMap.get(row.month) || 0  // O(1) instead of O(n)
  return (
    <tr key={row.month} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
      <td className="px-4 py-2">{row.month}</td>
      <td className="px-4 py-2 text-right">{newCount}</td>
      <td className="px-4 py-2 text-right font-semibold">{row.total}</td>
    </tr>
  )
})}
```

---

### WR-05: Misleading comment about "active" word forms

**File:** `src/pages/DashboardPage.tsx:23-24`

**Issue:** Comment says "Active word forms count" but the query counts ALL word forms:
```typescript
// Line 22-24
const activeWordFormsCount = useLiveQuery(() =>
  db.wordForms.toCollection().count()  // Counts ALL word forms, not filtered
)
```

The `WordForm` schema (in `src/db/schema.ts`) has no `isActive` field. Either:
1. The comment is wrong and should say "Word forms count", or
2. There's a missing filter to exclude archived/inactive forms

**Fix:**
- If all word forms should be counted, change comment to:
  ```typescript
  // Active word forms count
  const wordFormsCount = useLiveQuery(() =>
    db.wordForms.toCollection().count()
  )
  ```
- OR rename variable to match actual behavior:
  ```typescript
  const wordFormsCount = useLiveQuery(() =>
    db.wordForms.toCollection().count()
  )
  ```

---

## Info

### IN-01: Hardcoded chart colors should use theme CSS variables

**File:** `src/pages/TimelinePage.tsx:198, 207`

**Issue:** Bar and Line chart components use hardcoded hex color `#0891b2`:
```typescript
<Bar dataKey="count" name={t('timeline.newMeanings')} fill="#0891b2" />
<Line dataKey="total" name={t('timeline.cumulativeTotal')} stroke="#0891b2" />
```

Should use CSS variables or Tailwind color names for consistency with design system (e.g., cyan-500, primary).

**Fix:**
```typescript
<Bar dataKey="count" name={t('timeline.newMeanings')} fill="var(--color-primary)" />
<Line dataKey="total" name={t('timeline.cumulativeTotal')} stroke="var(--color-primary)" />
```

---

### IN-02: Type assertions could be more defensive

**File:** `src/pages/MeaningDetailPage.tsx:58, 69` and `src/pages/WordFormDetailPage.tsx:46`

**Issue:** Non-null assertions (`!`) assume data structure is correct:
```typescript
await toggleMeaningActive(meaning.id!, newState)
await updateLastUseDate(meaning.id!, newDate.toISOString())
await deleteWordForm(wordForm!.id!)
```

While safe (the code checks `if (!meaning)` and `if (!wordForm)` first), consider whether assertions are necessary or if explicit null checks would be clearer. Low priority.

---

## Structural Analysis

### Strengths

1. **Correct use of `useLiveQuery`**: All pages properly use dexie-react-hooks for reactive queries
2. **Proper error boundaries**: Detail pages check for `undefined` loading state and empty `null` state
3. **Hash routing**: Correctly uses `createHashRouter` for GitHub Pages
4. **i18n structure**: Translation files complete for both EN and PL
5. **Type safety**: Mostly strong TypeScript usage (except WR-02)

### Observations

- Pages are concise and focused on data presentation
- Service functions abstract database logic well
- UI components (shadcn/ui) are used correctly with minimal customization
- No database transaction issues detected
- No SQL injection risks (IndexedDB auto-escapes)

---

_Reviewed: 2026-07-29_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
