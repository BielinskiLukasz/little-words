---
audit_acknowledged:
  milestone: v1.0
  at: 2026-09-18
  status: unknown
---

# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## popup-no-close — add-entry sheet stayed open when saved with no meaning

- **Date:** 2026-09-18
- **Error patterns:** sheet stays open, no meaning provided, add-entry save, addWordEntry throw, popup does not close, empty meaning text
- **Root cause(s):** wordEntry.service.ts threw "At least one non-empty meaning is required" when the user submitted with no meaning text; the exception propagated to useAddEntry.handleSave()'s catch block, which set error state but never reached the setAddWordSheetOpen(false) call (already fixed by commit b2794f0, 2026-08-25 — this session confirmed the fix was still effective after a later, unrelated commit touched the same try/finally structure for a different reason)
- **Fix:** No new production change needed — the fix had already shipped. Added permanent regression-test coverage (useAddEntry.integration.test.ts) exercising the real addWordEntry service against fake-indexeddb (not mocked), asserting the sheet closes with no error for: blank meaning, whitespace-only meaning, and a real meaning (differential control).
- **Files changed:** src/features/add-entry/hooks/useAddEntry.integration.test.ts
- **Why not caught:** Existing unit test (useAddEntry.test.ts) fully mocks addWordEntry, so it cannot observe whether the real service throws for a given input — exactly the mechanism this bug's fix hinges on. The mock hid the coupling between service behavior and sheet-close behavior.
- **Recurrence guard:** src/features/add-entry/hooks/useAddEntry.integration.test.ts — 3 cases (blank meaning, whitespace-only boundary, real-meaning differential control) using the real service + real store + fake-indexeddb, no mocking of the code path that determines close behavior.

---

## active-forms-count-invalid — dashboard "active forms" stat over-counted

- **Date:** 2026-09-22
- **Error patterns:** active forms count too high, over-counting, dashboard stat wrong, active meanings correct but active forms not, wordForms.toCollection().count(), isActive filter missing, derived active state not applied
- **Root cause(s):** DashboardPage.tsx's "active forms" stat used `db.wordForms.toCollection().count()` — an unconditional row count with no filter — while WordForm has no `isActive` field of its own; "active" is a derived property (word form is active when it has ≥1 linked meaning that is itself active), a convention already correctly implemented by `getWordFormsWithActiveMeaningCount()`/WordFormsPage but never applied on the dashboard.
- **Fix:** Added `getActiveWordFormsCount()` to `src/db/services/wordForm.service.ts`, reusing the existing `getWordFormsWithActiveMeaningCount()` helper and counting forms where `activeMeaningCount > 0`. Replaced DashboardPage's raw Dexie count with a call to the new service function (also fixing a service-layer-access convention violation).
- **Files changed:** src/db/services/wordForm.service.ts, src/pages/DashboardPage.tsx, src/db/services/wordForm.service.test.ts
- **Why not caught:** No test existed asserting DashboardPage's active-forms stat matched the app's established "active = has an active-linked meaning" model — the only regression coverage for that model lived in WordFormsPage's badge logic, not in any dashboard-facing test. No lint/type rule enforces the "DB access goes through the service layer" convention (CLAUDE.md documents it but nothing checks it), which is how a raw `db.wordForms.toCollection().count()` call landed directly in a page component undetected.
- **Recurrence guard:** src/db/services/wordForm.service.test.ts `describe('wordForm.service - getActiveWordFormsCount')` — 5 tests including `'mixed set: counts only the active-linked word forms, not the total row count (regression for the over-count bug)'` (line 192), which explicitly asserts the naive row count (3) would have been wrong versus the correct active count (1).

---
