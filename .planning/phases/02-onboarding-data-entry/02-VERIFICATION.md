---
phase: 02-onboarding-data-entry
verified: 2026-09-14T14:00:00Z
status: gaps_found
score: 2/4
behavior_unverified: 0
overrides_applied: 0
gaps:
  - truth: "Choosing an autocomplete suggestion links the word form to the existing meaning without creating a duplicate"
    status: failed
    reason: "MeaningInput.tsx drops the isNew flag at line 33 — onSelect receives (text, isNew) but only passes text to onChange. MeaningRowState has no existingMeaningId field. wordEntry.service.ts always calls addMeaning() for every meaning row, so selecting an existing suggestion creates a brand-new duplicate Meaning row every time."
    artifacts:
      - path: "src/features/add-entry/components/MeaningInput.tsx"
        issue: "Line 33: onSelect={(text) => onChange({ text })} drops the isNew argument"
      - path: "src/features/add-entry/hooks/useAddEntry.ts"
        issue: "MeaningRowState interface has no existingMeaningId field — no way to carry the chosen meaning's id through the state"
      - path: "src/db/services/wordEntry.service.ts"
        issue: "Lines 53-63: always calls addMeaning() in a loop with no branch for linking an existing meaning by id"
    missing:
      - "Add existingMeaningId?: number to MeaningRowState"
      - "Pass isNew through MeaningInput to onChange: onSelect={(text, isNew) => onChange({ text, existingMeaningId: isNew ? undefined : <id from suggestion> })}"
      - "Branch in wordEntry.service.ts: link existing meaning by id when existingMeaningId is present instead of calling addMeaning()"
  - truth: "Save errors are surfaced to the user so they can correct input rather than silently losing it"
    status: failed
    reason: "useAddEntry.handleSave runs reset() and setAddWordSheetOpen(false) in the finally block unconditionally. On error the sheet closes and form is cleared before React can render the error state. AddEntrySheet.tsx does not destructure the error field from useAddEntry at all, so there is no UI element to display it even if timing were fixed."
    artifacts:
      - path: "src/features/add-entry/hooks/useAddEntry.ts"
        issue: "Lines 58-64: finally block always calls setAddWordSheetOpen(false) and reset() — on error this discards user input and clears the error state before it can render"
      - path: "src/features/add-entry/components/AddEntrySheet.tsx"
        issue: "Lines 19-27: error is not destructured from useAddEntry(); no <p role=alert> element exists to display it"
    missing:
      - "Move setAddWordSheetOpen(false) and reset() to the try block (success path only)"
      - "Destructure error from useAddEntry() in AddEntrySheet and render it as <p role='alert'>"
  - truth: "Word entry writes are atomic — a failure mid-save cannot leave orphaned Meaning rows"
    status: failed
    reason: "addWordEntry in wordEntry.service.ts performs three distinct write phases (findOrCreateWordForm, addMeaning loop, linkMeaningToWordForm loop) with no wrapping Dexie transaction. A JS exception or IndexedDB error between phases 2 and 3 leaves Meaning rows created but unlinked."
    artifacts:
      - path: "src/db/services/wordEntry.service.ts"
        issue: "Lines 46-88: three sequential write phases with no db.transaction() wrapper — partial failures create orphaned Meaning rows with no WordFormMeaning links"
    missing:
      - "Wrap the entire addWordEntry body in db.transaction('rw', [db.wordForms, db.meanings, db.wordFormMeanings], async () => { ... })"
---

# Phase 02: Onboarding & Data Entry — Verification Report

**Phase Goal:** A parent can open the app for the first time, create a child profile, and log their first word form with meanings — the app is no longer a blank shell.
**Verified:** 2026-09-14T14:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A new visitor is blocked from all main screens until onboarding is complete (name, birth date, at least one language) | PASS | `router/index.tsx` AuthGuard checks `db.childProfile.count()`; redirects to `/onboarding` when 0. `OnboardingWizard.tsx` Zod schema enforces `name: min(1)`, `birthDate: min(1)`, `languages: array.min(1)`. Submit button `disabled={!isValid}`. |
| 2 | Parent can tap FAB, fill word form + meaning + categories, save — entry persists across reloads | PARTIAL | Happy path works: FAB opens sheet (wired in `RootLayout`), `AddEntrySheet` renders `WordFormInput` + `MeaningInput` + `CategoryChips`, `handleSave` calls `addWordEntry` which writes to Dexie/IndexedDB. **BLOCKED by CR-04** (error path silently swallows errors and discards user input) and **CR-02** (non-atomic write can orphan data). |
| 3 | Choosing an autocomplete suggestion links to the existing meaning without creating a duplicate | FAIL | `MeaningInput.tsx` line 33 drops `isNew` flag. `MeaningRowState` has no `existingMeaningId` field. `wordEntry.service.ts` always calls `addMeaning()` — selecting any suggestion always creates a duplicate Meaning row. CR-01. |
| 4 | On iOS, after first word saved, parent sees Home Screen install instruction framed as data protection | PASS | `useAddEntry.handleSave` calls `setIosInstallPromptSeen(true)` on success. `useIOSInstallPrompt` computes `shouldShow = isIOS && !alreadyDismissed && iosInstallPromptSeen`. `IOSInstallPrompt` is mounted in `RootLayout`. Title is `"Protect your data"` (data-protection framing confirmed in `en/common.json`). WR-05 warning: iPadOS 13+ detection fails. |

**Score: 2/4 success criteria verified** (SC-3 FAIL, SC-2 PARTIAL due to two code-review BLOCKERs)

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `src/router/index.tsx` (AuthGuard) | VERIFIED | Checks `childProfile.count()`; redirects to `/onboarding` when 0; blocks main layout |
| `src/features/onboarding/components/OnboardingWizard.tsx` | VERIFIED | Zod schema enforces all three required fields; submit disabled until valid |
| `src/features/add-entry/components/AddEntryFAB.tsx` | VERIFIED | Renders fixed-position button; calls `setAddWordSheetOpen(true)` on click |
| `src/features/add-entry/components/AddEntrySheet.tsx` | STUB (partial) | Sheet exists and renders form; `error` is NOT destructured from `useAddEntry()` — error display missing |
| `src/features/add-entry/hooks/useAddEntry.ts` | STUB (partial) | Orchestrates save; error is stored but cannot reach the user; finally block always resets regardless of success/failure |
| `src/db/services/wordEntry.service.ts` | STUB (partial) | Creates word form + meanings + links but not within a transaction; always creates new meanings, never links existing |
| `src/features/add-entry/components/MeaningAutocomplete.tsx` | VERIFIED | Calls `onSelect(text, false)` for existing suggestions correctly; the bug is in the caller, not here |
| `src/features/add-entry/components/MeaningInput.tsx` | STUB (broken) | Line 33 drops `isNew` arg; no `existingMeaningId` field passed through |
| `src/features/ios-install/components/iOSInstallPrompt.tsx` | VERIFIED | Sheet renders with data-protection framing; wired to `shouldShow` |
| `src/features/ios-install/hooks/useiOSInstallPrompt.ts` | VERIFIED (with warning) | Correctly wired to `iosInstallPromptSeen`; iPadOS 13+ detection gap (WR-05) |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `AuthGuard` | `/onboarding` | `<Navigate replace />` when `profileCount === 0` | WIRED | Verified in `router/index.tsx` line 34 |
| `OnboardingWizard` submit | `childProfile` DB table | `useOnboarding.saveProfile` | WIRED | Via Zod validation + react-hook-form + `useOnboarding` hook |
| `AddEntryFAB` | `AddEntrySheet` | Zustand `addWordSheetOpen` state | WIRED | FAB sets `true`; Sheet reads `isOpen` from same store |
| `AddEntrySheet` | `addWordEntry` service | `useAddEntry.handleSave` | WIRED | Sheet → hook → service confirmed |
| `MeaningInput` `onSelect` | existing `Meaning` id | should carry `existingMeaningId` | NOT WIRED | CR-01: `isNew` dropped; no id flows to the service |
| `addWordEntry` | existing meaning link | should call `linkMeaningToWordForm(existingId, ...)` | NOT WIRED | Service always calls `addMeaning()` regardless |
| `handleSave` success | `iosInstallPromptSeen = true` | `setIosInstallPromptSeen(true)` in try block | WIRED | Verified in `useAddEntry.ts` line 57 |
| `iosInstallPromptSeen` | `IOSInstallPrompt` sheet | `shouldShow` in `useIOSInstallPrompt` | WIRED | Verified in `useiOSInstallPrompt.ts` line 15 |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `DashboardPage` `newMeaningsThisMonth` | `monthStart` | `new Date(...).toISOString()` (full ISO) | No — datetime string vs date-only string mismatch | STATIC (CR-03: excludes all 1st-of-month entries) |
| `DashboardPage` `activeWordFormsCount` | `wordForms.toCollection().count()` | All rows, no filter | Counts all, not just "active" | HOLLOW_PROP (WR-07: label says "active" but counts all) |
| `MeaningInput` → `wordEntry.service` | `existingMeaningId` | Not populated | No — always undefined | DISCONNECTED (CR-01) |

---

## Behavioral Spot-Checks

Step 7b: SKIPPED for server/external-service-dependent behaviors. Key behaviors verified by code inspection above. The UAT ran 11 human tests; all passed. However, UAT test 5 ("meaning autocomplete dropdown — selecting a suggestion fills the field") tested the UI appearance only — it did not verify whether a new duplicate Meaning row was created vs. linked. The deduplication bug (CR-01) is invisible at the UI level.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/features/add-entry/hooks/useAddEntry.ts` | 58-64 | `finally` block calls `reset()` + `setAddWordSheetOpen(false)` unconditionally — error path discards user input | BLOCKER | User loses form input on any error with no feedback (CR-04) |
| `src/features/add-entry/components/AddEntrySheet.tsx` | 19-27 | `error` field not destructured from `useAddEntry()` — no UI element for error display | BLOCKER | Confirms CR-04: even if timing were fixed, there is nowhere to render the error (WR-04) |
| `src/features/add-entry/components/MeaningInput.tsx` | 33 | `onSelect={(text) => onChange({ text })}` — drops `isNew` second argument | BLOCKER | Defeats the entire deduplication purpose of autocomplete (CR-01) |
| `src/db/services/wordEntry.service.ts` | 46-88 | Three write phases with no `db.transaction()` wrapper | BLOCKER | Partial failures leave orphaned Meaning rows (CR-02) |
| `src/pages/DashboardPage.tsx` | 30 | `new Date(...).toISOString()` used against date-only indexed strings | WARNING | All entries on 1st of month missed in "new this month" count (CR-03) |
| `src/features/ios-install/hooks/useiOSInstallPrompt.ts` | 11-12 | `includes('iPad')` fails for iPadOS 13+ which reports macOS UA | WARNING | iPadOS 13+ users never see the install prompt (WR-05) |
| `src/pages/DashboardPage.tsx` | 23-25 | `wordForms.toCollection().count()` labeled "Active Word Forms" | WARNING | Counts all word forms; label is misleading (WR-07) |

---

## Gaps Summary

Three blockers prevent the phase goal from being fully achieved:

**Gap 1 — Autocomplete deduplication is completely broken (CR-01):** Success Criterion 3 requires that selecting an existing meaning suggestion links to it without creating a duplicate. The bug is structural: `MeaningInput.tsx` discards the `isNew` flag at the call site, `MeaningRowState` has no `existingMeaningId` field to carry the choice forward, and `wordEntry.service.ts` always creates new meaning rows. The fix requires changes across all three layers.

**Gap 2 — Save errors silently swallowed, user loses input (CR-04 + WR-04):** `handleSave`'s `finally` block closes the sheet and calls `reset()` regardless of success or failure. On error the user sees the sheet vanish and all typed input is gone, with no feedback. Separately, `AddEntrySheet.tsx` does not even render the `error` field returned by `useAddEntry()`. This makes the feature unreliable — any DB error, validation error, or network hiccup causes silent data loss.

**Gap 3 — Non-atomic write path (CR-02):** `addWordEntry` writes word forms, meanings, and junction rows in separate sequential operations with no wrapping Dexie transaction. A failure between the meaning-creation loop and the link-creation loop leaves orphaned `Meaning` rows in the database. In a local-only offline app with no server-side reconciliation, orphaned rows accumulate silently and corrupt the data model that reporting functions depend on.

**Secondary issues (not blocking the SC verdicts but warrant tracking):**
- CR-03: Dashboard "new this month" count uses full ISO datetime vs. date-only indexed field — all entries from the 1st of the month are excluded
- WR-05: iOS install prompt fails to detect iPadOS 13+ (desktop UA) and has no standalone-mode check
- WR-07: "Active Word Forms" label counts all word forms (no `isActive` field on the schema)

---

_Verified: 2026-09-14T14:00:00Z_
_Verifier: Claude (gsd-verifier)_
