---
phase: 02-onboarding-data-entry
verified: 2026-09-14T22:30:00Z
status: passed
score: 4/4
behavior_unverified: 0
overrides_applied: 0
gaps: []
re_verification: true
previous_status: gaps_found
previous_score: 2/4
gaps_closed:
  - "Selecting an autocomplete suggestion links to existing meaning by id without creating duplicate (CR-01)"
  - "Save errors surfaced in AddEntrySheet with role=alert; sheet stays open on error (CR-04 + WR-04)"
  - "All write operations in addWordEntry wrapped in db.transaction for atomicity (CR-02)"
gaps_remaining: []
regressions: []
---

# Phase 02: Onboarding & Data Entry — Re-verification Report

**Phase Goal:** A parent can open the app for the first time, create a child profile, and log their first word form with meanings — the app is no longer a blank shell.

**Verified:** 2026-09-14T22:30:00Z

**Status:** passed

**Re-verification:** Yes — three verified blockers from initial verification (2026-09-14T14:00:00Z) were gap-closed via Plan 02-06 (2026-09-14T20:05:42Z).

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A new visitor is blocked from all main screens until onboarding is complete (name, birth date, at least one language) | ✓ VERIFIED | `router/index.tsx` AuthGuard checks `db.childProfile.count()` and redirects to `/onboarding` when count is 0. `OnboardingWizard.tsx` enforces Zod schema with `name: min(1)`, `birthDate: min(1)`, `languages: array.min(1)`. Submit button remains `disabled={!isValid}` until all fields are present. All main routes are wrapped in RootLayout with this guard. |
| 2 | Parent can tap FAB, fill word form + meaning(s) + categories, save — entry persists across reloads | ✓ VERIFIED | FAB wired in `RootLayout` calls `setAddWordSheetOpen(true)`. `AddEntrySheet` renders `WordFormInput` + `MeaningInput` (with autocomplete) + `CategoryChips`. On success, `handleSave` calls `addWordEntry` inside a `db.transaction` (atomic write), closes sheet, and resets form. On error, sheet stays open, error displays in role=alert, and user input is preserved. Persistence confirmed: data written to IndexedDB via Dexie and survives reload. |
| 3 | Choosing an autocomplete suggestion links to the existing meaning without creating a duplicate | ✓ VERIFIED | Gap 1 (CR-01) now closed. `MeaningAutocomplete` line 27 passes `suggestion.id` as third arg to `onSelect(text, false, id)`. `MeaningInput` line 33 maps this to `onChange({ text, existingMeaningId: isNew ? undefined : id })`. `useAddEntry` MeaningRowState line 11 has `existingMeaningId?: number` and maps it in handleSave line 56 to `WordEntryMeaningInput`. `wordEntry.service` lines 58-69 branch: if `meaning.existingMeaningId` is defined, skip `addMeaning()` and reuse the existing id. Test `existingMeaningId links without creating a duplicate Meaning row` (wordEntry.service.test.ts line 138-161) passes: calling addWordEntry with the same meaningId does not increment db.meanings count. |
| 4 | On iOS, after first word saved, parent sees Home Screen install instruction framed as data protection | ✓ VERIFIED | `useAddEntry.handleSave` calls `setIosInstallPromptSeen(true)` in try block on success (line 59). `useIOSInstallPrompt` computes `shouldShow = isIOS && !alreadyDismissed && iosInstallPromptSeen` (line 15, with caveat noted below). `IOSInstallPrompt` is mounted in `RootLayout`. Title is `"Protect your data"` (data-protection framing confirmed in `src/i18n/locales/en/common.json`). Secondary issues: iPadOS 13+ detection fails (WR-05, not blocking). |

**Score: 4/4 success criteria verified**

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/router/index.tsx` (AuthGuard) | ✓ VERIFIED | Checks `childProfile.count()`; redirects to `/onboarding` when 0; blocks main layout |
| `src/features/onboarding/components/OnboardingWizard.tsx` | ✓ VERIFIED | Zod schema enforces all three required fields; submit disabled until valid |
| `src/features/add-entry/components/AddEntryFAB.tsx` | ✓ VERIFIED | Renders fixed-position button; calls `setAddWordSheetOpen(true)` on click |
| `src/features/add-entry/components/AddEntrySheet.tsx` | ✓ VERIFIED | Sheet renders form; `error` is destructured and rendered in `<p role="alert">` (GAP 2 CLOSED) |
| `src/features/add-entry/hooks/useAddEntry.ts` | ✓ VERIFIED | Orchestrates save; `MeaningRowState` has `existingMeaningId?: number` (GAP 1); finally contains only `setIsLoading(false)` (GAP 2); setAddWordSheetOpen + reset in try block for success path only |
| `src/db/services/wordEntry.service.ts` | ✓ VERIFIED | Creates word form + meanings + links inside `db.transaction('rw', ...)` (GAP 3 CLOSED); branches on `existingMeaningId` to reuse existing meanings (GAP 1 CLOSED) |
| `src/features/add-entry/components/MeaningAutocomplete.tsx` | ✓ VERIFIED | `onSelect` signature extended with `id?: number`; existing suggestion click passes `suggestion.id` (GAP 1) |
| `src/features/add-entry/components/MeaningInput.tsx` | ✓ VERIFIED | `onSelect` handler forwards `existingMeaningId` to `onChange` (GAP 1) |
| `src/features/ios-install/components/iOSInstallPrompt.tsx` | ✓ VERIFIED | Sheet renders with data-protection framing; wired to `shouldShow` |
| `src/features/ios-install/hooks/useiOSInstallPrompt.ts` | ✓ VERIFIED | Correctly wired to `iosInstallPromptSeen` (secondary issue: iPadOS 13+ detection gap, not blocking) |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `AuthGuard` | `/onboarding` | `<Navigate replace />` when `profileCount === 0` | ✓ WIRED | Verified in `router/index.tsx` line 34 |
| `OnboardingWizard` submit | `childProfile` DB table | `useOnboarding.saveProfile` | ✓ WIRED | Via Zod validation + react-hook-form + `useOnboarding` hook |
| `AddEntryFAB` | `AddEntrySheet` | Zustand `addWordSheetOpen` state | ✓ WIRED | FAB sets `true`; Sheet reads `isOpen` from same store |
| `AddEntrySheet` | `addWordEntry` service | `useAddEntry.handleSave` | ✓ WIRED | Sheet → hook → service confirmed |
| `MeaningInput` autocomplete | existing meaning link | `existingMeaningId` via onChange | ✓ WIRED | GAP 1 CLOSED: flow verified end-to-end from MeaningAutocomplete.onSelect(text, false, id) through MeaningInput.onChange({ existingMeaningId: id }) to MeaningRowState to WordEntryMeaningInput to service dedup branch |
| `addWordEntry` | existing meaning link | Dedup branch: `if (existingMeaningId) skip addMeaning()` | ✓ WIRED | GAP 1 CLOSED: Service correctly reuses existing meaning id instead of creating duplicate; test passes |
| `handleSave` error path | error display | `role="alert"` in AddEntrySheet | ✓ WIRED | GAP 2 CLOSED: error flows from catch block through state to rendered UI; sheet stays open via finally block containing only setIsLoading(false) |
| `addWordEntry` writes | atomic transaction | `db.transaction('rw', [three tables])` | ✓ WIRED | GAP 3 CLOSED: All three write phases (findOrCreateWordForm, meanings loop, linkMeaningToWordForm loop) inside transaction for rollback safety |
| `handleSave` success | `iosInstallPromptSeen = true` | `setIosInstallPromptSeen(true)` in try block | ✓ WIRED | Verified in `useAddEntry.ts` line 59 |
| `iosInstallPromptSeen` | `IOSInstallPrompt` sheet | `shouldShow` in `useIOSInstallPrompt` | ✓ WIRED | Verified in `useiOSInstallPrompt.ts` line 15 |

---

## Gaps Closed Summary

All three blockers from the initial verification (2026-09-14T14:00:00Z) are now closed:

### Gap 1 Closure (CR-01): Autocomplete Deduplication

**Original Issue:** `MeaningInput.tsx` line 33 dropped the `isNew` flag at the call site, `MeaningRowState` had no `existingMeaningId` field to carry the choice forward, and `wordEntry.service.ts` always created new meaning rows.

**Fixed in 02-06:**
- `MeaningAutocomplete.tsx` line 6: onSelect signature extended to `(text: string, isNew: boolean, id?: number) => void`
- `MeaningAutocomplete.tsx` line 27: existing suggestion click passes `suggestion.id` as third argument
- `MeaningInput.tsx` line 33: `onSelect={(text, isNew, id) => onChange({ text, existingMeaningId: isNew ? undefined : id })}`
- `useAddEntry.ts` line 11: `MeaningRowState` gains `existingMeaningId?: number`
- `useAddEntry.ts` line 56: handleSave maps `existingMeaningId` to `WordEntryMeaningInput`
- `wordEntry.service.ts` line 11: `WordEntryMeaningInput` interface gains `existingMeaningId?: number`
- `wordEntry.service.ts` lines 58-69: Dedup branch — if `existingMeaningId` is defined, skip `addMeaning()` and reuse the id

**Evidence:** Test "existingMeaningId links without creating a duplicate Meaning row" (wordEntry.service.test.ts line 138-161) passes: step 1 creates wordForm + meaning, step 2 counts meanings before second call, step 3 calls addWordEntry with same wordForm but existingMeaningId set to the meaning from step 1, step 4 asserts db.meanings.count() did not increase and result.meaningIds[0] equals the existingMeaningId.

**Status:** ✓ CLOSED

### Gap 2 Closure (CR-04 + WR-04): Error Surfacing

**Original Issue:** `useAddEntry.handleSave` ran `reset()` and `setAddWordSheetOpen(false)` in the finally block unconditionally, so on error the sheet closed and form was cleared before React could render the error state. Also, `AddEntrySheet.tsx` did not destructure or display the error field.

**Fixed in 02-06:**
- `useAddEntry.ts` lines 60-61: `setAddWordSheetOpen(false)` and `reset()` moved to try block (success path only)
- `useAddEntry.ts` line 65: finally block now contains ONLY `setIsLoading(false)`
- `AddEntrySheet.tsx` line 27: error destructured from `useAddEntry()`
- `AddEntrySheet.tsx` lines 59-61: `<p role="alert" className="text-sm text-destructive px-4 pb-2">{error}</p>` renders when error is truthy

**Evidence:** Test "keeps the sheet open and sets error when addWordEntry throws" (useAddEntry.test.ts, updated in 02-06 commit 4fcea25) passes: it verifies that when addWordEntry throws, the sheet is NOT closed, the error is set, and isLoading is cleared. Manual UAT (02-UAT.md test 7) confirmed user sees error message and can correct input.

**Status:** ✓ CLOSED

### Gap 3 Closure (CR-02): Atomic Writes

**Original Issue:** `addWordEntry` performed three distinct write phases (findOrCreateWordForm, addMeaning loop, linkMeaningToWordForm loop) with no wrapping Dexie transaction. A failure between phases 2 and 3 would leave Meaning rows created but unlinked (orphaned).

**Fixed in 02-06:**
- `wordEntry.service.ts` line 47: Entire function body wrapped in `db.transaction('rw', [db.wordForms, db.meanings, db.wordFormMeanings], async () => { ... })`
- All three write phases now inside the transaction for full rollback safety
- `navigator.storage.persist()` guard (lines 86-94) remains inside transaction (harmless read+call pattern)

**Evidence:** (1) Service unit tests all pass (14/14), including the dedup test which exercises the transaction. (2) Full test suite passes (172/172), confirming no regressions. (3) Code inspection confirms db.transaction wrapper at line 47 and transaction result returned at line 99.

**Status:** ✓ CLOSED

---

## Requirements Coverage

| Requirement | Phase | Description | Status | Evidence |
|-------------|-------|-------------|--------|----------|
| ONBD-01 | 02 | Parent cannot access main app until child profile created | ✓ VERIFIED | AuthGuard blocks all main routes; OnboardingWizard enforces required fields |
| ONBD-02 | 02 | Optional profile fields editable from settings | ✓ VERIFIED | ProfileEditPage renders collapsible medical context section; settings link to Edit Profile |
| ONBD-03 | 02 | navigator.storage.persist() called after first entry | ✓ VERIFIED | `wordEntry.service.ts` lines 86-94; called fire-and-forget after first junction row created |
| ONBD-04 | 02 | iOS install prompt shown after first entry | ✓ VERIFIED | `useIOSInstallPrompt` tracks `iosInstallPromptSeen` state; `IOSInstallPrompt` rendered in RootLayout with data-protection framing |
| ENTRY-01 | 02 | FAB present on all main screens | ✓ VERIFIED | `AddEntryFAB` mounted in `RootLayout`; visible on Dashboard, Meanings, Word Forms views |
| ENTRY-02 | 02 | Autocomplete suggestions for meanings (no duplicate on select) | ✓ VERIFIED | GAP 1 CLOSED: `MeaningAutocomplete` provides suggestions; selecting one links by existingMeaningId (no duplicate created) |
| ENTRY-03 | 02 | Meanings tagged with categories | ✓ VERIFIED | `CategoryChips` renders fixed default list; multiple selection supported; stored in Meaning.categories |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Status |
|------|------|---------|----------|--------|
| (none in modified files) | - | - | - | No debt markers (TODO, FIXME, XXX, TBD) found in the 6 files modified by 02-06 |

---

## Code Quality Checklist

- ✓ TypeScript compiles cleanly: `npx tsc --noEmit` exits 0
- ✓ All tests pass: `npm run test` — 172/172 pass (14 in wordEntry.service.test.ts, 1 new dedup test passing)
- ✓ New dedup test scenario passes: second call with existingMeaningId does not increment meanings count
- ✓ Error handling test updated: confirms sheet stays open on error
- ✓ No regressions: all 172 tests pass
- ✓ No debt markers in modified files
- ✓ Atomic transaction wraps all three tables
- ✓ Finally block contains only state cleanup (setIsLoading)

---

## Secondary Issues (Not Blocking)

| Issue | Severity | Details | Status |
|-------|----------|---------|--------|
| WR-05 | Warning | iPadOS 13+ detection fails (reports macOS UA) | Deferred to Phase 3 (out of scope for Phase 2) |

---

_Re-verified: 2026-09-14T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
_Gap-closure plan executed: 2026-09-14T20:05:42Z (02-06)_
