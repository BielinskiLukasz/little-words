---
phase: 04-doctor-report-data-management
reviewed: 2026-08-26T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/App.tsx
  - src/components/ui/sonner.tsx
  - src/features/doctor-report/services/reportGenerator.ts
  - src/features/doctor-report/services/reportGenerator.test.ts
  - src/features/settings/components/DataSection.tsx
  - src/features/settings/services/dataManagement.ts
  - src/features/settings/services/dataManagement.test.ts
  - src/i18n/locales/en/common.json
  - src/i18n/locales/pl/common.json
  - src/pages/DoctorReportPage.tsx
  - src/pages/SettingsPage.tsx
  - src/test-setup.ts
  - package.json
findings:
  critical: 1
  warning: 6
  info: 2
  total: 9
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-08-26
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

This phase delivers two features: a doctor-report generator and a JSON/CSV data-management panel (export, import, CSV export). The architecture is sound — pure functions are correctly separated from DB-access functions, the Dexie transaction in `importData` is properly scoped, and the test coverage is broad. However, one blocker-level correctness defect (malformed CSV output), one silent boundary logic error in the report generator, and several unhandled failure paths are present that must be addressed before shipping.

---

## Critical Issues

### CR-01: `escapeCSVCell` produces malformed CSV for cells containing double-quote characters

**File:** `src/features/settings/services/dataManagement.ts:44-46`

**Issue:** The CSV escape helper only wraps the cell in double-quotes when a comma is present. It does not escape embedded double-quote characters (`"`) by doubling them (RFC 4180 requirement), and it does not handle embedded newlines (`\n`/`\r`). A meaning text such as `I said "mama"` produces the output `"I said "mama""`, which is invalid CSV — the second `"` terminates the field prematurely. Any spreadsheet parser (Excel, Google Sheets, LibreOffice) will misparse all subsequent columns in that row. Meanings containing a newline will silently inject an extra row into the CSV.

**Fix:**
```ts
function escapeCSVCell(value: string): string {
  // Wrap in quotes whenever the value contains a comma, double-quote, or newline.
  // Per RFC 4180, any embedded double-quote must be doubled.
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
```

---

## Warnings

### WR-01: Date format mismatch makes `newInLast3Months` boundary comparison incorrect

**File:** `src/features/doctor-report/services/reportGenerator.ts:28-29`

**Issue:** `cutoff` is constructed as a full ISO-8601 timestamp (`"2025-10-03T00:00:00.000Z"`) via `subDays(now, 90).toISOString()`. But `meaning.firstUseDate` is stored as a `YYYY-MM-DD` date string (confirmed by the schema type, the default test fixture `'2025-10-01'`, and the fact that the UI uses a date picker). JavaScript string comparison of `"2025-10-03" >= "2025-10-03T00:00:00.000Z"` evaluates to `false` (the shorter string sorts below the longer one when all shared characters match). As a result, any meaning whose `firstUseDate` falls on the exact cutoff date is incorrectly excluded from the count.

The edge-case tests in `reportGenerator.test.ts` (lines 195 and 202) avoid exposing this by constructing `firstUseDate` via `.toISOString()` rather than the `YYYY-MM-DD` format that production data actually uses. The tests therefore pass while the bug is present.

**Fix:**
```ts
// Use a date-only cutoff to match the YYYY-MM-DD format stored in the DB.
const cutoff = subDays(now, 90).toISOString().split('T')[0]
const newInLast3Months = activeMeanings.filter((m) => m.firstUseDate >= cutoff).length
```

The companion edge-case tests should also be updated to use `YYYY-MM-DD` format for `firstUseDate` so they reflect production data format:
```ts
const firstUseDate = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000)
  .toISOString().split('T')[0]
```

### WR-02: Category names in the doctor report are never translated

**File:** `src/features/doctor-report/services/reportGenerator.ts:43`

**Issue:** The top-categories section writes raw `CATEGORIES` constant values (`'Nouns'`, `'Body Parts'`, etc.) directly into the report output. The `t` function is available and both locale files already contain `category.*` translations (e.g., `"Nouns": "Rzeczowniki"` in Polish). A Polish user sharing the report with a Polish doctor will see English category names embedded in an otherwise fully-translated report.

**Fix:**
```ts
const topCategoriesLines = categoryCounts.map(
  (entry) => `  ${t(`category.${entry.cat}`)}: ${entry.count}`
)
```

### WR-03: Unhandled rejection when clipboard write fails in `handleCopy`

**File:** `src/pages/DoctorReportPage.tsx:41-45`

**Issue:** `navigator.clipboard.writeText` returns a Promise. The code chains `.then()` but has no `.catch()`. If the clipboard API is unavailable (non-HTTPS context in development, browser permission denied, or Safari quirks), the promise rejects and the rejection is unhandled. The user receives no feedback that the copy failed.

**Fix:**
```ts
const handleCopy = () => {
  navigator.clipboard.writeText(reportText).then(() => {
    toast(t('report.copied'))
  }).catch(() => {
    toast.error(t('errors.somethingWentWrong'))
  })
}
```

### WR-04: `updateChildProfile` promise is discarded in `handleNotesBlur`

**File:** `src/pages/DoctorReportPage.tsx:47-51`

**Issue:** `handleNotesBlur` calls `updateChildProfile(...)` — an async function returning a Promise — but neither awaits it nor attaches an error handler. If the IndexedDB write fails (storage quota exceeded, DB version conflict), the failure is silently dropped and the user's notes appear saved when they are not. This is a floating promise / fire-and-forget bug.

**Fix:** Convert `handleNotesBlur` to async and add error handling:
```ts
const handleNotesBlur = async () => {
  if (profile.id !== undefined) {
    const { id: _id, ...rest } = profile
    try {
      await updateChildProfile(profile.id, { ...rest, parentNotes: notesValue })
    } catch {
      toast.error(t('errors.somethingWentWrong'))
    }
  }
}
```

### WR-05: Export failures are silently swallowed — no user feedback

**File:** `src/features/settings/components/DataSection.tsx:26-39`

**Issue:** Both `handleExportJson` and `handleExportCsv` catch errors with `console.error` only. The `toast` function is already imported and used elsewhere in the same file for import success/failure. A user who triggers export while IndexedDB is unavailable (e.g., private browsing on Firefox, which blocks IndexedDB in some configurations) will receive no indication that their backup was not created.

**Fix:**
```ts
const handleExportJson = async () => {
  try {
    await exportData()
  } catch (err) {
    console.error('Export JSON failed:', err)
    toast.error(t('errors.somethingWentWrong'))
  }
}

const handleExportCsv = async () => {
  try {
    await exportMeaningsCSV()
  } catch (err) {
    console.error('Export CSV failed:', err)
    toast.error(t('errors.somethingWentWrong'))
  }
}
```

### WR-06: `importData` does not validate the shape of individual records before `bulkAdd`

**File:** `src/features/settings/services/dataManagement.ts:142-157`

**Issue:** `validateBackupData` confirms that the four top-level arrays exist but does not validate the shape of individual array elements. A maliciously crafted (or hand-edited) backup file can inject records with missing required fields (e.g., a `Meaning` missing `isActive` or `categories`), unknown extra fields that corrupt downstream filtering, or type mismatches (e.g., `isActive: "yes"` instead of `boolean`). These records get written directly to IndexedDB via `bulkAdd` and will produce unpredictable behavior in every component that reads them.

This is not a remote-attacker security issue (the app is entirely local), but it IS a data-integrity failure path that can leave the database in a permanently broken state.

**Fix:** At minimum, add per-record guards for the fields that drive application logic:
```ts
function isMeaning(x: unknown): x is Meaning {
  if (typeof x !== 'object' || x === null) return false
  const m = x as Record<string, unknown>
  return (
    typeof m.text === 'string' &&
    Array.isArray(m.categories) &&
    typeof m.isActive === 'boolean' &&
    typeof m.firstUseDate === 'string' &&
    typeof m.lastUseDate === 'string'
  )
}
// ... similar guards for ChildProfile, WordForm, WordFormMeaning

export function validateBackupData(data: unknown): data is BackupData {
  // ... existing array checks ...
  const d = data as Record<string, unknown>
  if (!(d.meanings as unknown[]).every(isMeaning)) return false
  // etc.
  return true
}
```

---

## Info

### IN-01: `useEffect` dependency array omits `profile?.parentNotes`

**File:** `src/pages/DoctorReportPage.tsx:19-23`

**Issue:** The effect reads `profile?.parentNotes` to initialise `notesValue` but lists only `profile?.id` as a dependency. The intent is to set `notesValue` once when the profile first loads and not overwrite in-progress user edits on subsequent renders — that intent is reasonable. However, it technically violates the `react-hooks/exhaustive-deps` rule and would cause the ESLint check to fail. If a future change makes multiple profiles possible, the stale closure would also not reset notes when parentNotes changes on the same profile id.

**Fix:** If the intent is truly "only reset on profile load", document it explicitly and suppress with a comment; or restructure using an initialisation ref:
```ts
// Intentionally only re-sync notes when the profile identity changes, not on every DB update,
// to avoid overwriting in-progress user edits.
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [profile?.id])
```

### IN-02: `next-themes` `ThemeProvider` is not mounted — `useTheme` always returns the default

**File:** `src/components/ui/sonner.tsx:8,14` / `src/App.tsx`

**Issue:** `sonner.tsx` imports and calls `useTheme` from `next-themes`, which requires a `ThemeProvider` ancestor. No `ThemeProvider` is rendered in `App.tsx` or anywhere in the tree. `useTheme` outside a provider returns a context with `theme` as `undefined`, which the code safely defaults to `"system"`. The Sonner toaster therefore always uses the OS-level dark/light preference — which is probably acceptable — but the `next-themes` dependency is loaded for no functional benefit. If theme switching is ever added, the provider wiring will be missing and the feature will appear to work locally (OS matches) but fail to respond to app-level theme toggles.

**Fix:** Either add `ThemeProvider` from `next-themes` to `App.tsx` if a dark-mode toggle is planned, or replace the `useTheme` call with a hardcoded `"system"` string and remove the `next-themes` import to eliminate the unused dependency.

---

_Reviewed: 2026-08-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
