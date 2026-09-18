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
