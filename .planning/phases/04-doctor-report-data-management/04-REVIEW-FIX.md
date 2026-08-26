---
phase: 04-doctor-report-data-management
fixed_at: 2026-08-26T09:45:36Z
review_path: .planning/phases/04-doctor-report-data-management/04-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 04: Code Review Fix Report

**Fixed at:** 2026-08-26T09:45:36Z
**Source review:** .planning/phases/04-doctor-report-data-management/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11
- Fixed: 11
- Skipped: 0

**Verification context:** All edits and commits were applied directly in the main checkout
(`workflow.use_worktrees = false`). Tier 1 verification (re-read modified sections) was performed
for every fix. No Tier 2 syntax checks are available for `.tsx`/`.ts` files without running the
full TypeScript compiler; TypeScript errors (if any) will surface in the `npm run build` gate during
phase verification.

## Fixed Issues

### CR-01: CSV exporter produces malformed output and allows row injection

**Files modified:** `src/features/settings/services/dataManagement.ts`
**Commit:** 8912c1d
**Applied fix:** Replaced `escapeCSVCell` with RFC 4180-compliant implementation that wraps values
containing commas, double-quotes, newlines, or carriage returns in double-quotes, and doubles any
embedded double-quote characters.

---

### CR-02: Report category names are never translated

**Files modified:** `src/features/doctor-report/services/reportGenerator.ts`
**Commit:** 59c6aa7
**Applied fix:** Changed `topCategoriesLines` mapping from `entry.cat` to
`t('category.${entry.cat}')` so category names are passed through the translation function.
Both locale files already declare all `category.*` keys.

---

### CR-03: File input not reset on import error — same file cannot be retried

**Files modified:** `src/features/settings/components/DataSection.tsx`
**Commit:** dd30883
**Applied fix:** Moved `fileInputRef.current.value = ''` reset from the `try` block into the
`finally` block so it always executes regardless of import success or failure.

---

### WR-01: Clipboard copy has no error handler — failure is silent

**Files modified:** `src/pages/DoctorReportPage.tsx`
**Commit:** 6c801b3
**Applied fix:** Converted `handleCopy` from a `.then()` promise chain to `async/await` with
`try/catch`. On failure, calls `toast(t('errors.somethingWentWrong'))`.

---

### WR-02: Export errors are silently discarded — user receives no feedback

**Files modified:** `src/features/settings/components/DataSection.tsx`
**Commit:** 6e5dd63
**Applied fix:** Added `toast(t('errors.somethingWentWrong'))` inside the `catch` blocks of both
`handleExportJson` and `handleExportCsv`, alongside the existing `console.error` calls.

---

### WR-03: `validateBackupData` does not validate array item shapes

**Files modified:** `src/features/settings/services/dataManagement.ts`
**Commit:** ba90f62
**Applied fix:** Added four private validator functions (`isValidChildProfile`, `isValidWordForm`,
`isValidMeaning`, `isValidWordFormMeaning`) that check required field presence and primitive types.
`validateBackupData` now calls `.every()` with each validator before returning `true`.

---

### WR-04: Date string type mismatch in 3-month cutoff comparison

**Files modified:** `src/features/doctor-report/services/reportGenerator.ts`
**Commit:** 6df89db
**Applied fix:** Changed `subDays(now, 90).toISOString()` to
`subDays(now, 90).toISOString().split('T')[0]` so the cutoff is a date-only string (`'2025-10-03'`),
matching the format of `firstUseDate` values stored in the database.
**Status:** fixed: requires human verification (logic boundary — the `>=` comparison now correctly
includes the exact cutoff day; IN-02 test was added to validate this)

---

### WR-05: `useTheme` from next-themes used without a ThemeProvider

**Files modified:** `src/components/ui/sonner.tsx`
**Commit:** ab7bc47
**Applied fix:** Removed the `useTheme` import and hook call. The `Toaster` component now renders
`<Sonner theme="system" ...>` directly, which respects `prefers-color-scheme` without requiring a
`ThemeProvider` in the app tree.

---

### WR-06: Report date uses locale-dependent `toLocaleDateString()`

**Files modified:** `src/features/doctor-report/services/reportGenerator.ts`
**Commit:** 4f2a85f
**Applied fix:** Replaced `now.toLocaleDateString()` with `now.toISOString().split('T')[0]`
(producing `"2026-08-26"`) so the report date is always consistent regardless of browser locale.

---

### IN-01: Duplicate trailing icon in DataSection buttons is decorative redundancy

**Files modified:** `src/features/settings/components/DataSection.tsx`
**Commit:** f93ebbc
**Applied fix:** Removed the trailing `size={16} className="text-muted-foreground"` icon from all
three action buttons (Export JSON, Import JSON, Export CSV). The leading icon already conveys the
action; the trailing icon was identical and added no information.

---

### IN-02: Test boundary cases for `newInLast3Months` use full ISO timestamps, masking the WR-04 bug

**Files modified:** `src/features/doctor-report/services/reportGenerator.test.ts`
**Commit:** 899409e
**Applied fix:** Added a new test case `'meaning with date-only firstUseDate exactly at cutoff day
(90 days) → IS counted'` that uses a plain date string (`'2025-10-03'`) for `firstUseDate`,
matching the production data format. This test exercises the boundary corrected by WR-04 and will
fail if the date-only cutoff fix is reverted.

---

_Fixed: 2026-08-26T09:45:36Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
