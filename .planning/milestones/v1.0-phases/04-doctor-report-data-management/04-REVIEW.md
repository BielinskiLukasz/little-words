---
phase: 04-doctor-report-data-management
reviewed: 2026-08-26T00:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - src/App.tsx
  - src/components/ui/sonner.tsx
  - src/features/doctor-report/services/reportGenerator.test.ts
  - src/features/doctor-report/services/reportGenerator.ts
  - src/features/settings/components/DataSection.tsx
  - src/features/settings/services/dataManagement.test.ts
  - src/features/settings/services/dataManagement.ts
  - src/i18n/locales/en/common.json
  - src/i18n/locales/pl/common.json
  - src/pages/DoctorReportPage.tsx
  - src/pages/SettingsPage.tsx
  - src/test-setup.ts
  - .claude/hooks/lib/cursor-workspace.js
  - .claude/hooks/lib/injection-patterns.js
  - .claude/hooks/lib/isolation-deny-reason.js
  - .claude/hooks/lib/isolation-sentinel.js
  - .claude/hooks/managed-hooks-registry.cjs
  - .claude/hooks/package.json
  - .claude/scripts/changeset/lint.cjs
  - .claude/scripts/changeset/serialize.cjs
  - .claude/scripts/gen-capability-registry.cjs
  - .claude/scripts/gen-loop-host-contract.cjs
  - .claude/scripts/lib/alias-drift-families.cjs
  - .claude/scripts/lib/drift-scan.cjs
  - package.json
findings:
  critical: 3
  warning: 6
  info: 2
  total: 11
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-26T00:00:00Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

This phase delivered two features: a doctor report page (read-only text summary with clipboard copy) and a data management section (JSON export/import, CSV export). The application source files (`src/`) contain three blockers and six warnings. The `.claude/` infrastructure files (hooks, scripts) are tooling for the GSD workflow system; they are well-structured and contain no actionable defects within this project's scope.

The three blockers are: (1) the CSV exporter produces malformed output for values containing double-quotes or newlines; (2) report category names are never translated, so Polish-locale users always see English category names; and (3) the file input is not reset on import failure, making it impossible to retry importing the same file after an error.

---

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: CSV exporter produces malformed output and allows row injection

**File:** `src/features/settings/services/dataManagement.ts:44-46`

**Issue:** `escapeCSVCell` only wraps values that contain a comma. It does not escape embedded double-quote characters, and it does not wrap or escape values that contain newlines. Per RFC 4180, all three of these characters require the cell to be wrapped in double-quotes AND internal double-quotes must be doubled.

Concrete failures:

- A meaning text of `"hello", world` (contains a double-quote and a comma) is serialized as `""hello", world"`. The leading `""` is parsed as an empty field followed by a bare `hello`, world`, which is malformed.
- A meaning text of `"hello"` (double-quote only, no comma) is not wrapped at all, so the double-quotes land in the output naked. Any RFC 4180-compliant CSV parser will misinterpret the field boundaries.
- A meaning text of `first line\nsecond line` (newline, no comma) is not wrapped. The newline terminates the current CSV row, and `second line,...` appears to parsers as a new row — this is row injection via user-entered data.

**Fix:**

```typescript
function escapeCSVCell(value: string): string {
  // RFC 4180: wrap if the value contains commas, double-quotes, or newlines;
  // escape internal double-quotes by doubling them.
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}
```

---

### CR-02: Report category names are never translated

**File:** `src/features/doctor-report/services/reportGenerator.ts:43`

**Issue:** The top-categories lines are built using the raw category key (`entry.cat`), which is always the English string from the `CATEGORIES` constant (e.g., `'Nouns'`, `'Body Parts'`). The `t` function is available in `generateReport` but is never called for these labels. When the app is in Polish, the report header, field labels, and yes/no values are all translated, but the category lines remain in English (`Nouns: 3` instead of `Rzeczowniki: 3`). This is a localization bug on the only feature that is explicitly presented to a doctor.

**Fix:**

```typescript
// line 43 — replace entry.cat with its translation
const topCategoriesLines = categoryCounts.map(
  (entry) => `  ${t(`category.${entry.cat}`)}: ${entry.count}`
)
```

Both `en/common.json` and `pl/common.json` already declare all category translations under the `category.*` namespace, so no translation strings need to be added.

---

### CR-03: File input not reset on import error — same file cannot be retried

**File:** `src/features/settings/components/DataSection.tsx:50-63`

**Issue:** `fileInputRef.current.value = ''` is inside the `try` block and only executes on a successful import. When `importData(file)` throws, the `catch` block shows the error dialog but does not reset the file input. After the user dismisses the error dialog and tries again (clicks "Import JSON" → confirms → file picker → selects the same file), the browser's `change` event does not fire because the input's `value` has not changed. The user is stuck: they must first select a different file to reset state, or they must close and reopen the browser tab.

**Fix:** Move the reset into the `finally` block so it executes regardless of success or failure:

```typescript
} finally {
  setIsImporting(false)
  // Reset so the same file can be re-selected on the next attempt
  if (fileInputRef.current) {
    fileInputRef.current.value = ''
  }
}
```

Remove the reset call from the `try` block.

---

## Warnings

### WR-01: Clipboard copy has no error handler — failure is silent

**File:** `src/pages/DoctorReportPage.tsx:41-45`

**Issue:** `navigator.clipboard.writeText(reportText).then(...)` has no `.catch()`. The Clipboard API can fail when the browser denies clipboard permission, when the page is not focused, or in certain embedded/PWA contexts. If it fails, the user receives no feedback — the button appears to do nothing. Given that copying is the primary action on this page, silent failure is a significant UX problem.

**Fix:**

```typescript
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(reportText)
    toast(t('report.copied'))
  } catch {
    toast(t('errors.somethingWentWrong'))
  }
}
```

---

### WR-02: Export errors are silently discarded — user receives no feedback

**File:** `src/features/settings/components/DataSection.tsx:26-39`

**Issue:** Both `handleExportJson` and `handleExportCsv` catch errors and call `console.error` only. `exportData` and `exportMeaningsCSV` both interact with IndexedDB and the DOM (creating Blob URLs and anchor elements); either can throw. When they do, the user sees nothing — the button looks like it succeeded. A `toast` call in the catch blocks is the minimal fix.

**Fix:**

```typescript
const handleExportJson = async () => {
  try {
    await exportData()
  } catch (err) {
    console.error('Export JSON failed:', err)
    toast(t('errors.somethingWentWrong'))
  }
}

const handleExportCsv = async () => {
  try {
    await exportMeaningsCSV()
  } catch (err) {
    console.error('Export CSV failed:', err)
    toast(t('errors.somethingWentWrong'))
  }
}
```

---

### WR-03: `validateBackupData` does not validate array item shapes

**File:** `src/features/settings/services/dataManagement.ts:32-41`

**Issue:** The type guard confirms that `childProfile`, `wordForms`, `meanings`, and `wordFormMeanings` are arrays, but it does not inspect individual items. A backup file where, for example, `meanings` is `[null]` or `[{ id: "bad", text: 123 }]` passes validation and is handed directly to `db.meanings.bulkAdd()`. Dexie's `bulkAdd` does not validate item shape against the TypeScript interface; it inserts whatever is provided. This can silently corrupt the IndexedDB store.

**Fix:** Add minimum shape checks for each item type. At minimum, assert that required fields are present and have the correct primitive types:

```typescript
function isValidMeaning(item: unknown): boolean {
  if (typeof item !== 'object' || item === null) return false
  const m = item as Record<string, unknown>
  return (
    typeof m.text === 'string' &&
    Array.isArray(m.categories) &&
    typeof m.isActive === 'boolean' &&
    typeof m.firstUseDate === 'string' &&
    typeof m.lastUseDate === 'string'
  )
}
// Apply equivalent guards for childProfile, wordForms, and wordFormMeanings items
// before accepting them as valid BackupData.
```

---

### WR-04: Date string type mismatch in 3-month cutoff comparison

**File:** `src/features/doctor-report/services/reportGenerator.ts:28-29`

**Issue:** `cutoff` is computed as a full ISO timestamp string (`'2025-10-03T00:00:00.000Z'`) via `subDays(now, 90).toISOString()`. `firstUseDate` values in the schema are stored as date-only strings (`'2025-10-03'`). JavaScript string comparison is lexicographic. The comparison `'2025-10-03' >= '2025-10-03T00:00:00.000Z'` evaluates to `false` because the shorter string is always "less than" a longer string that shares the same prefix. A meaning added on exactly the cutoff day is therefore excluded from the `newInLast3Months` count even though it should be included (it was added within the 3-month window).

This causes a silent off-by-one-day error at the boundary. The tests happen to avoid this exact case: the boundary tests create `firstUseDate` from `new Date(...).toISOString()`, so both sides are full ISO timestamps. Real app data uses date-only strings.

**Fix:** Convert `cutoff` to a date-only string before comparison, or compare `firstUseDate` as a date:

```typescript
// date-only cutoff — safe for string comparison against date-only firstUseDate
const cutoff = subDays(now, 90).toISOString().split('T')[0]
const newInLast3Months = activeMeanings.filter((m) => m.firstUseDate >= cutoff).length
```

---

### WR-05: `useTheme` from next-themes used without a ThemeProvider

**File:** `src/components/ui/sonner.tsx:8,14`

**Issue:** `useTheme` is imported from `next-themes` and used to supply the `theme` prop to the Sonner toaster. `next-themes`' `useTheme` hook reads from a React context that is only populated when the app is wrapped in a `ThemeProvider`. `App.tsx` does not render a `ThemeProvider`. Without it, `useTheme()` returns context defaults — the destructuring fallback `theme = "system"` is always used. The Sonner component always receives `theme="system"` and respects `prefers-color-scheme`, which is functionally reasonable, but the theme can never be overridden programmatically from within the app. If a theme toggle is added later, it will have no effect on toasts.

**Fix:** Either wrap the app in `<ThemeProvider>` from `next-themes`, or simplify `Toaster` to not depend on the hook:

```typescript
// Option A — add ThemeProvider in App.tsx:
import { ThemeProvider } from 'next-themes'
// wrap: <ThemeProvider attribute="class" defaultTheme="system">...</ThemeProvider>

// Option B — remove the next-themes dependency from sonner.tsx if theme control is not needed:
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner theme="system" className="toaster group" ... {...props} />
)
```

---

### WR-06: Report date uses locale-dependent `toLocaleDateString()`

**File:** `src/features/doctor-report/services/reportGenerator.ts:51`

**Issue:** The first line of the report reads `Report date: <date>` where the date is produced by `now.toLocaleDateString()`. The output format is browser- and locale-dependent: it produces `8/26/2026` in US English, `26.08.2026` in Polish/German, and `2026/8/26` in Japanese locale settings. For a document intended to be handed to a medical specialist, an inconsistent date format between devices is unprofessional and potentially confusing.

**Fix:** Use a fixed ISO date format:

```typescript
const reportDate = now.toISOString().split('T')[0]  // "2026-08-26"
// replace the line in the report:
`${t('report.date')}: ${reportDate}`,
```

---

## Info

### IN-01: Duplicate trailing icon in DataSection buttons is decorative redundancy

**File:** `src/features/settings/components/DataSection.tsx:79-85, 92-99, 104-111`

**Issue:** Each action button renders the same icon twice — once as a leading `size={18}` icon and again as a trailing `size={16} className="text-muted-foreground"` icon. This pattern appears intentional but produces two visually identical icons with different sizes in the same row. The trailing icon conveys no additional information that the leading icon does not already convey. If the trailing icon is meant to signal an external-link or chevron affordance, a more specific icon (e.g., `ChevronRight`) would communicate that more clearly.

**Fix:** Either remove the trailing icon or replace it with a directional affordance icon (`ChevronRight`) to distinguish the two roles visually.

---

### IN-02: Test boundary cases for `newInLast3Months` use full ISO timestamps, masking the WR-04 bug

**File:** `src/features/doctor-report/services/reportGenerator.test.ts:194-212`

**Issue:** The boundary tests at lines 194-212 construct `firstUseDate` via `new Date(...).toISOString()`, producing full ISO timestamps like `'2025-10-03T00:00:00.000Z'`. The cutoff is also a full ISO timestamp, so the comparison works correctly in the tests. However, the default `activeMeaning` fixture and the normal tests (lines 70-82) use date-only strings like `'2025-10-01'`, which is how real app data is stored. As a result, the tests do not catch the off-by-one boundary described in WR-04.

**Fix:** Add a boundary test that uses date-only `firstUseDate` values (matching the production schema format) for the exactly-90-days case:

```typescript
it('meaning with date-only firstUseDate exactly at cutoff day → IS counted', () => {
  // now = 2026-01-01; cutoff day = 2025-10-03 (after WR-04 fix uses date-only cutoff)
  const meanings = [activeMeaning({ id: 1, firstUseDate: '2025-10-03' })]
  const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
  expect(result).toContain('report.newInLast3Months: 1')
})
```

---

_Reviewed: 2026-08-26T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
