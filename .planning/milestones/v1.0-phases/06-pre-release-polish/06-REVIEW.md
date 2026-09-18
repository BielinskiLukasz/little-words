---
phase: 06-pre-release-polish
reviewed: 2026-09-05T17:04:58Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - src/db/db.ts
  - src/db/schema.ts
  - src/db/services/meaning.service.test.ts
  - src/db/services/meaning.service.ts
  - src/db/services/wordEntry.service.test.ts
  - src/db/services/wordEntry.service.ts
  - src/db/services/wordForm.service.test.ts
  - src/db/services/wordForm.service.ts
  - src/db/services/wordFormMeaning.service.test.ts
  - src/db/services/wordFormMeaning.service.ts
  - src/features/doctor-report/services/reportGenerator.test.ts
  - src/features/doctor-report/services/reportGenerator.ts
  - src/features/settings/services/dataManagement.test.ts
  - src/i18n/locales/en/common.json
  - src/i18n/locales/pl/common.json
  - src/pages/DashboardPage.tsx
  - src/pages/DoctorReportPage.tsx
  - src/pages/MeaningDetailPage.tsx
  - src/pages/PairsPage.tsx
  - src/pages/WordFormDetailPage.tsx
  - src/router/index.tsx
  - src/shared/components/BottomNav.test.tsx
  - src/shared/components/BottomNav.tsx
findings:
  critical: 2
  warning: 7
  info: 3
  total: 12
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-09-05T17:04:58Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

Reviewed the full service layer (Dexie services, report generator, data-management), five pages (Dashboard, DoctorReport, MeaningDetail, WordFormDetail, Pairs), the router, BottomNav component + test, and i18n locale files added or modified during the pre-release polish phase.

The DB schema evolution (v3 upgrade) and the new D-09 through D-12 report enhancements are structurally sound. The core service logic is generally correct. Two blockers exist: a ghost-word-form data corruption path in `addWordEntry` and a missing outer transaction around the same orchestrator that leaves partially-written records on mid-operation failure. Beyond those, the most recurring issue is a date-format mismatch throughout: Dexie IndexedDB queries compare full ISO timestamps against date-only `YYYY-MM-DD` strings, producing incorrect inclusion/exclusion results at boundary dates. Several error handlers swallow failures silently (no toast), and the BottomNav test suite is incomplete for the new Pairs tab.

---

## Structural Findings (fallow)

No structural pre-pass provided.

---

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Ghost word form created when all meanings have whitespace-only text

**File:** `src/db/services/wordEntry.service.ts:38-76`
**Issue:** The guard at line 42 only rejects an *empty* `meanings` array. If the caller passes one or more entries whose `text` fields are all whitespace, the guard passes, `findOrCreateWordForm` runs and commits the word form to the DB, but `validMeanings` (line 49) is empty, so no meanings or junction rows are written. The function returns `{ wordFormId: N, meaningIds: [] }`. The word form now exists in the DB permanently with zero linked meanings — an orphan entry that will appear in the word-forms list with an active-meanings count of zero and can never be cleaned up automatically.

**Reproduction:** `addWordEntry({ wordForm: 'pa', meanings: [{ text: '   ', categories: [], firstUseDate: '2025-01-01' }] })` creates a word form row and returns.

**Fix:**
```typescript
// After filtering, validate that at least one meaningful entry survived
const validMeanings = data.meanings.filter(m => m.text.trim().length > 0)
if (validMeanings.length === 0) {
  throw new Error('At least one non-empty meaning is required')
}
```
Add this check immediately after `validMeanings` is assigned (line 49), before `findOrCreateWordForm` is called.

---

### CR-02: `addWordEntry` is not transactional — partial writes on failure leave orphaned records

**File:** `src/db/services/wordEntry.service.ts:46-76`
**Issue:** The function creates a word form, then creates meanings in a loop, then creates junction rows in a second loop, all as independent `await` calls with no wrapping `db.transaction`. If the process throws after `findOrCreateWordForm` returns but before all `linkMeaningToWordForm` calls complete (e.g., a DB error writing a later meaning, or a browser crash during multi-meaning entry), the DB is left with a committed word form and/or meanings that have no links, or links missing for some but not all meanings. IndexedDB transactions are the correct mechanism to guarantee atomicity.

**Fix:**
```typescript
export async function addWordEntry(data: WordEntryInput): Promise<WordEntryResult> {
  if (data.wordForm.trim().length === 0) {
    throw new Error('Word form cannot be empty')
  }
  if (data.meanings.length === 0) {
    throw new Error('At least one meaning is required')
  }
  const validMeanings = data.meanings.filter(m => m.text.trim().length > 0)
  if (validMeanings.length === 0) {
    throw new Error('At least one non-empty meaning is required')
  }

  const result = await db.transaction(
    'rw',
    [db.wordForms, db.meanings, db.wordFormMeanings],
    async () => {
      const wordFormId = await findOrCreateWordForm(data.wordForm)
      const meaningIds: number[] = []
      for (const meaning of validMeanings) {
        const isoDate = meaning.firstUseDate ?? new Date().toISOString()
        const dateStr = isoDate.slice(0, 10)
        const meaningId = await addMeaning({
          text: meaning.text,
          categories: meaning.categories,
          isActive: true,
          firstUseDate: isoDate,
          lastUseDate: isoDate,
        })
        meaningIds.push(meaningId)
        await linkMeaningToWordForm(wordFormId, meaningId, {
          firstObservationDate: dateStr,
          lastUsedDate: dateStr,
          isActive: true,
        })
      }
      return { wordFormId, meaningIds }
    }
  )

  // Storage persist guard — outside transaction (fire-and-forget)
  const totalLinks = await db.wordFormMeanings.count()
  if (totalLinks === 1) {
    void navigator.storage?.persist?.()
  }

  return result
}
```

---

## Warnings

### WR-01: `getMeaningsUnused30Days` compares date-only field against full ISO timestamp

**File:** `src/db/services/meaning.service.ts:93`
**Issue:** `lastUseDate` is stored as `YYYY-MM-DD` (date-only) per the pair-write pattern (`isoDate.slice(0, 10)`). The cutoff is computed as `new Date(...).toISOString()` — a full ISO timestamp like `'2025-08-06T14:30:00.000Z'`. When Dexie executes the `below(thirtyDaysAgo)` IndexedDB range query, string comparison is used. `'2025-08-06' < '2025-08-06T14:30:00.000Z'` evaluates to `true` because the date-only string is a prefix of and therefore lexicographically less than the ISO string. This means a meaning last used exactly 30 days ago (today's date minus 30 days as a date-only value) is incorrectly included in the "unused" list.

**Fix:**
```typescript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10) // match the date-only format stored in lastUseDate
```

---

### WR-02: `newMeaningsThisMonth` query uses full ISO timestamp against date-only stored values

**File:** `src/pages/DashboardPage.tsx:30`
**Issue:** `monthStart` is built with `new Date(year, month, 1).toISOString()` — a full ISO timestamp such as `'2025-09-01T00:00:00.000Z'`. If a meaning's `firstUseDate` was persisted as date-only `'2025-09-01'` (from the user-supplied date input flowing through `addWordEntry`), the Dexie `aboveOrEqual(monthStart)` query compares `'2025-09-01'` against `'2025-09-01T00:00:00.000Z'`. Because the date-only string is lexicographically less than the ISO string, the meaning is excluded even though it was added on the first day of the month. Users see a count of 0 when meanings were added on month-day-1.

**Fix:**
```typescript
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  .toISOString()
  .slice(0, 10) // '2025-09-01' — matches stored date-only format
```
Also add an active filter for consistency with the report:
```typescript
.filter(m => m.isActive)
```

---

### WR-03: Two independent `new Date().toISOString()` calls per meaning create timestamp divergence

**File:** `src/db/services/wordEntry.service.ts:54,68`
**Issue:** When `meaning.firstUseDate` is not supplied, `new Date().toISOString()` is evaluated independently in two separate `for` loops — once to set `Meaning.firstUseDate`/`lastUseDate` and again to set `WordFormMeaning.firstObservationDate`/`lastUsedDate`. Both calls execute milliseconds apart, so the timestamps written to the `meanings` table and the `wordFormMeanings` table differ. `aggregateMeaningFromPairs` then re-derives `Meaning.firstUseDate` from the pair's date, overwriting the value that was just stored with a slightly different one.

**Fix:** Compute the date once per meaning and reuse it across both loops:
```typescript
// Merge the two loops into one
for (const meaning of validMeanings) {
  const isoDate = meaning.firstUseDate ?? new Date().toISOString()
  const dateStr = isoDate.slice(0, 10)
  const meaningId = await addMeaning({
    text: meaning.text,
    categories: meaning.categories,
    isActive: true,
    firstUseDate: isoDate,
    lastUseDate: isoDate,
  })
  meaningIds.push(meaningId)
  await linkMeaningToWordForm(wordFormId, meaningId, {
    firstObservationDate: dateStr,
    lastUsedDate: dateStr,
    isActive: true,
  })
}
```

---

### WR-04: `handleDelete` in `WordFormDetailPage` silently swallows DB errors — no user feedback

**File:** `src/pages/WordFormDetailPage.tsx:99-107`
**Issue:** The `handleDelete` handler catches exceptions from `deleteWordForm` but only logs to `console.error`. The user sees no toast or UI indication that the delete failed. Every other error handler in this file (`handleSave`, `handlePairDateBlur`, `handlePairActiveChange`) calls `toast.error(t('errors.somethingWentWrong'))`. This inconsistency means a delete failure is invisible to the user, who may navigate away believing the delete succeeded.

**Fix:**
```typescript
} catch (err) {
  console.error('Failed to delete word form:', err)
  toast.error(t('errors.somethingWentWrong'))  // add this line
```

---

### WR-05: `handleDelete` in `MeaningDetailPage` silently swallows DB errors — no user feedback

**File:** `src/pages/MeaningDetailPage.tsx:103-111`
**Issue:** Same pattern as WR-04. `handleDelete` catches the error from `deleteMeaning` but never calls `toast.error`. All other handlers in the file surface errors via toast.

**Fix:**
```typescript
} catch (error) {
  console.error('Failed to delete meaning:', error)
  toast.error(t('errors.somethingWentWrong'))  // add this line
```

---

### WR-06: `aggregateMeaningFromPairs` throws unhandled `RangeError` on invalid date string

**File:** `src/db/services/meaning.service.ts:23-25`
**Issue:** If any `WordFormMeaning` row contains an invalid or empty `firstObservationDate` or `lastUsedDate` value, `new Date(invalidValue).getTime()` returns `NaN`. `Math.min(NaN, ...)` and `Math.max(NaN, ...)` both return `NaN`. `new Date(NaN).toISOString()` then throws `RangeError: Invalid time value`. This crashes the aggregation and, because `updatePairFields` calls `aggregateMeaningFromPairs` inside a transaction, the entire transaction is aborted. A corrupt backup import (which `importData` currently validates only at schema level, not field level) could trigger this path.

**Fix:**
```typescript
const firstUseDateMs = Math.min(
  ...pairs.map(p => new Date(p.firstObservationDate).getTime()).filter(n => !isNaN(n))
)
const lastUseDateMs = Math.max(
  ...pairs.map(p => new Date(p.lastUsedDate).getTime()).filter(n => !isNaN(n))
)
if (isNaN(firstUseDateMs) || isNaN(lastUseDateMs)) return // guard against all-invalid dates
```

---

### WR-07: D-10 categories sorted by English key, not by translated label

**File:** `src/features/doctor-report/services/reportGenerator.ts:55`
**Issue:** The per-category section sorts categories with `.sort()` applied to the English `CATEGORIES` constant values (e.g., `'Animals'`, `'Body Parts'`, `'Social Communication'`). The report is then rendered with translated labels via `t('category.${cat}')`. For Polish users, the category order in the printed report is alphabetical by English name, not Polish name. For example, "Zwierzęta" (Animals) appears before "Emocje" (Emotions) in the report, but in Polish alphabetical order Emocje comes first. The doctor reading the Polish report receives categories in a non-intuitive sequence.

**Fix:** Sort using the translated label instead:
```typescript
for (const cat of CATEGORIES
  .filter((c) => activeMeanings.some((m) => m.categories.includes(c)))
  .sort((a, b) => t(`category.${a}`).localeCompare(t(`category.${b}`)))
) {
```

---

## Info

### IN-01: BottomNav test missing assertions for the new Pairs tab

**File:** `src/shared/components/BottomNav.test.tsx:22-43`
**Issue:** The Pairs tab was added to `BottomNav.tsx` (5 tabs total, confirmed by the `toHaveLength(5)` test). However, the Polish label test (lines 22–28) asserts `'Pulpit'`, `'Znaczenia'`, `'Formy słów'`, and `'Więcej'` but not `'Pary'`. The href assertion (lines 30–37) uses `arrayContaining` but does not include `'/pairs'`. A future regression that removes or renames the Pairs tab label would not be caught by these tests.

**Fix:** Add the missing assertions:
```typescript
expect(screen.getByText('Pary')).toBeInTheDocument()
// and in href test:
expect(hrefs).toEqual(
  expect.arrayContaining(['/dashboard', '/meanings', '/word-forms', '/pairs', '/more']),
)
```

---

### IN-02: Inconsistent import sources across service files (`'../types'` vs `'../schema'`)

**File:** `src/db/services/meaning.service.ts:2-3`
**Issue:** `meaning.service.ts` imports `Meaning` from `'../types'` (the barrel) but imports `CATEGORIES` and `Category` from `'../schema'` (the source). Other services (`wordEntry.service.ts`, `wordForm.service.ts`, `wordFormMeaning.service.ts`) all import from `'../types'`. Because `types.ts` is a pure re-export of `schema.ts`, there is no runtime bug, but the inconsistency makes it harder to trace the canonical location of types and requires a reader to verify the barrel's contents to confirm equivalence.

**Fix:** Pick one source and use it consistently. Prefer `'../schema'` as the canonical source (eliminating the barrel intermediary), or use `'../types'` everywhere if the barrel serves a deliberate abstraction purpose.

---

### IN-03: Deprecated `linkMeaning` function still exported

**File:** `src/db/services/wordFormMeaning.service.ts:41-54`
**Issue:** `linkMeaning` is marked `@deprecated` (superseded by `linkMeaningToWordForm`) and is not called by any reviewed file. It remains a public export and a live Dexie insert path that bypasses the idempotency check, making it easy to accidentally introduce duplicate junction rows if called by a future contributor who does not notice the deprecation comment.

**Fix:** Remove `linkMeaning` if no external callers exist, or if backward compatibility is needed for a brief transition, add an explicit `console.warn` inside to make the deprecation visible at runtime, and schedule removal in the next minor version.

---

_Reviewed: 2026-09-05T17:04:58Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
