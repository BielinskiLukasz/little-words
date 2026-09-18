---
status: resolved
trigger: "popup is still visible after creation when no meaning provided; closes correctly when meaning is provided"
created: 2026-08-25T00:00:00Z
updated: 2026-09-18T14:30:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: REVISED AND CONFIRMED-HISTORICAL — the throw-based mechanism recorded below (addWordEntry throwing at wordEntry.service.ts:52) was accurate at the time it was written, but the codebase has since moved on: commit b2794f0 ("fix(03-07): sheet always closes after save; allow word form with no meanings (G-03-popup)", 2026-08-25 20:01:56, same day as this file's original evidence) removed the `validMeanings.length === 0` throw guard and moved the close/reset calls into `finally`. That commit fixed exactly this bug, but this debug session file was never archived, so it sat with stale evidence. A later, unrelated commit (4bf04f5, "surface save errors in sheet with role=alert", 2026-09-14) moved the close/reset calls back from `finally` into the `try` block for a different reason (keep the sheet open on genuine save errors so the error banner is visible) — but it did NOT reintroduce the original bug, because the throw guard it was originally paired with is still gone.
test: (1) Re-read current wordEntry.service.ts and useAddEntry.ts against the file+line evidence below — confirmed the throw guard no longer exists. (2) Wrote and ran an integration test using the REAL (unmocked) addWordEntry + real fake-indexeddb + real useUIStore, reproducing the exact reported steps: word form filled, meaning left blank, handleSave() called.
expecting: If the old hypothesis still held, addWordEntry would throw and useUIStore.getState().addWordSheetOpen would remain true after handleSave(). If the bug is already fixed, addWordSheetOpen would be false and no error would be set.
next_action: (none — resolved) User manually verified in the running app on 2026-09-18 that the add-entry sheet closes correctly both when no meaning is provided and when a meaning is provided. Regression test committed (262450d). Session archived.

reasoning_checkpoint (ORIGINAL — superseded, kept for audit trail):
  hypothesis: "The G-03-11 fix added a throw at line 52 of wordEntry.service.ts (`At least one non-empty meaning is required`). When no meaning text is entered, the single empty row has text=''. The filter on line 49 produces validMeanings=[]. The throw fires. In useAddEntry.handleSave(), the catch block (line 60) runs — it sets error state — but setAddWordSheetOpen(false) at line 58 is inside the try block before the finally, so it is never reached. The sheet stays open."
  confirming_evidence:
    - "wordEntry.service.ts line 49-53: filter removes empty text meanings, then throws if validMeanings is empty"
    - "useAddEntry.ts line 56-59: addWordEntry is awaited; setAddWordSheetOpen(false) is AFTER the await, inside try — any throw bypasses it"
    - "useAddEntry.ts line 60-62: catch block only sets error state, never closes sheet"
  falsification_test: "If the service did NOT throw when meaning is empty, handleSave would reach line 58 and close the sheet — this is exactly what happens when a meaning IS provided (no throw, sheet closes)"
  fix_rationale: "The service treats no-meaning as an error, but the design intent (UAT truth) allows saving a word form with no meaning. Either remove the throw and allow empty meaning lists, or move setAddWordSheetOpen(false)/reset() to the finally block."
  blind_spots: "Have not verified whether the data model (schema) actually supports a word form with zero meanings — but that is a fix concern, not diagnosis. [RETROSPECTIVE: the real blind spot was not checking git history/current file contents before treating a same-session hypothesis as still valid on resume.]"
  candidate_causes:
    - "code: addWordEntry throws for empty meanings, preventing close callback from being reached"
    - "code: handleSave places setAddWordSheetOpen(false) inside try rather than finally, making it throw-dependent"
  and_gate: "Both conditions contribute: (1) the service throws, AND (2) the close is not in finally. Either one alone could be the fix point. AND-gate fires — two contributing code conditions."

reasoning_checkpoint (REVISED — operative, 2026-09-18):
  hypothesis: "The bug described in Symptoms was real and was correctly diagnosed by the ORIGINAL checkpoint above, but it was fixed on 2026-08-25 by commit b2794f0 — the exact fix the original checkpoint prescribed (remove the throw guard; move close/reset out of throw-dependent try-only code). This debug session file was left un-archived, so on resume its stale evidence looked like an open, unfixed bug. The bug is not currently present."
  confirming_evidence:
    - "git show b2794f0 diff removes the identical `if (validMeanings.length === 0) throw` line the original checkpoint identified as candidate_cause #1, and moves setAddWordSheetOpen(false)/reset() into finally — candidate_cause #2 — i.e. it fixes BOTH AND-gated conditions at once"
    - "Direct call to the real addWordEntry with meanings=[{text:''}] resolves without throwing (empirically executed, not inferred)"
    - "Full integration test (real hook + real service + real fake-indexeddb + real zustand store) reproducing the exact reported steps: sheet closes, no error set, 1 wordForm + 0 meanings persisted — 3/3 passing including a whitespace-only boundary case and a with-meaning differential control"
  falsification_test: "If the bug were still present, the integration test's assertion `useUIStore.getState().addWordSheetOpen === false` would fail after handleSave() with a blank meaning. It did not fail — it passed on the first run, with no code change."
  fix_rationale: "No production fix is being applied now because one already shipped. The action taken is closing a test-coverage gap: useAddEntry.test.ts fully mocks addWordEntry, so it cannot detect whether the real service throws for a given input — exactly the mechanism this bug and its fix both hinge on. The new integration test uses the real service so this class of regression is caught automatically in the future."
  blind_spots: "Have not re-run the full manual UAT step-by-step in a real browser session (only automated hook/service/store-level reproduction) — flagged in the human-verify checkpoint below rather than assumed."
  candidate_causes:
    - "code: (historical) throw guard in wordEntry.service.ts — already removed"
    - "process: debug session file not archived after its own diagnosis was fixed directly, leaving stale evidence to be picked up on resume — this is the actual cause of today's confusion, distinct from the original app bug"
  and_gate: "N/A for today's action — no new fix is being applied, so there is nothing to AND-gate. The historical bug's AND-gate finding (both conditions contributed) stands unchanged and is preserved above."

## Symptoms

expected: Sheet closes after successful save regardless of whether a meaning was entered
actual: Sheet stays open when no meaning is provided; closes correctly when meaning is provided
errors: None reported
reproduction: Open add-entry sheet, fill word form, leave meaning blank, tap save — sheet stays open
started: Discovered during re-verification of test 11 (phase 03-browse-views UAT)

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-08-25T00:00:00Z
  checked: src/features/add-entry/hooks/useAddEntry.ts handleSave()
  found: setAddWordSheetOpen(false) is at line 58 inside the try block, AFTER await addWordEntry(). If addWordEntry throws, execution jumps to the catch block (line 60) which only calls setError(). The close call is never reached.
  implication: Any throw from addWordEntry prevents the sheet from closing.

- timestamp: 2026-08-25T00:00:01Z
  checked: src/db/services/wordEntry.service.ts lines 49-53
  found: The G-03-11 fix added filter on line 49 (remove empty text) then throws "At least one non-empty meaning is required" at line 52 when validMeanings is empty. The initial form state always has one meaning row with text=''. Submitting with no meaning text → validMeanings=[] → throw.
  implication: Submitting with no meaning text always throws, which always hits the catch block, which never closes the sheet.

- timestamp: 2026-08-25T00:00:02Z
  checked: Code path diff between with-meaning and without-meaning
  found: With meaning: text='foo' → validMeanings=[{text:'foo',...}] → no throw → lines 57-83 execute → returns result → handleSave line 57-59 execute → sheet closes. Without meaning: text='' → validMeanings=[] → throws at line 52 → catch in handleSave sets error → sheet stays open.
  implication: The divergence point is exactly the throw at wordEntry.service.ts:52.

- timestamp: 2026-09-18T12:44:00Z
  checked: git log --oneline -- src/db/services/wordEntry.service.ts src/features/add-entry/hooks/useAddEntry.ts
  found: Commit b2794f0 (2026-08-25T20:01:56, same day as this file's evidence) is titled "fix(03-07): sheet always closes after save; allow word form with no meanings (G-03-popup)". Its diff removes exactly the `if (validMeanings.length === 0) throw ...` guard from wordEntry.service.ts and moves `setAddWordSheetOpen(false)`/`reset()` from the try block into the finally block of useAddEntry.ts — precisely the fix this debug session's Resolution.root_cause called for. This session was never archived, so the debug file was left with pre-fix evidence.
  implication: The originally diagnosed bug was already fixed, on the same day this session's evidence was gathered. The debug file is stale, not the code.

- timestamp: 2026-09-18T12:46:00Z
  checked: git log --oneline -- src/features/add-entry/hooks/useAddEntry.ts (commits after b2794f0); git show 4bf04f5
  found: A later, unrelated commit 4bf04f5 (2026-09-14, "fix(02-06): surface save errors in sheet with role=alert") moved `setAddWordSheetOpen(false)`/`reset()` back from `finally` into the `try` block, explicitly so the sheet stays open when addWordEntry throws a genuine error (so the new role=alert banner is visible). This is a deliberate, documented design change for a different bug (DB-error visibility), not a reversion of G-03-popup — because the `validMeanings.length === 0` throw guard that G-03-popup removed was NOT reintroduced.
  implication: Current useAddEntry.ts has close/reset back inside `try`, which would reproduce the ORIGINAL bug only if addWordEntry still throws on empty meanings — it no longer does, so the current code should not exhibit the reported symptom.

- timestamp: 2026-09-18T12:47:00Z
  checked: Direct call to the real (unmocked) addWordEntry({ wordForm: 'mama', meanings: [{ text: '', categories: [], firstUseDate: '2025-01-01' }] }) against a fake-indexeddb-backed AppDB
  found: Resolves successfully (does not throw); creates 1 wordForm row and 0 meaning rows.
  implication: The mechanism the original hypothesis relied on (a throw on empty meanings) does not exist in current code. The bug cannot occur via that mechanism anymore.

- timestamp: 2026-09-18T12:50:00Z
  checked: Full integration test — real useAddEntry hook + real addWordEntry + real fake-indexeddb + real useUIStore (no mocks on the code path that determines close behavior), reproducing exact reported steps (word form filled, meaning left blank, handleSave() called)
  found: useUIStore.getState().addWordSheetOpen becomes false after handleSave() resolves; result.current.error stays null; 1 wordForm + 0 meanings persisted. Also verified: whitespace-only meaning text (boundary neighbor) and real-meaning-provided (differential control) both close the sheet correctly.
  implication: The exact reported symptom (sheet stays open when no meaning is provided) does not reproduce in current HEAD. It was already fixed by commit b2794f0 on 2026-08-25, before this debug session's investigation continued today. No code fix is needed now; the gap is missing regression-test coverage (the existing useAddEntry.test.ts fully mocks addWordEntry, which hides exactly this class of regression since it can't observe whether the real service throws for a given input).

## Resolution

root_cause: (historical, already fixed) wordEntry.service.ts previously threw "At least one non-empty meaning is required" when the user submitted with no meaning text; the exception propagated to useAddEntry.handleSave()'s catch block, which set error state but never reached the setAddWordSheetOpen(false) call. This was fixed by commit b2794f0 (2026-08-25) — same day as this session's original evidence — which removed the throw guard and relocated the close/reset calls to `finally`. This debug session file was never archived after that fix, leaving stale pre-fix evidence in place. A later, unrelated commit (4bf04f5, 2026-09-14) moved close/reset back into `try` for a different feature (error-banner visibility on genuine DB errors), but did not reintroduce the throw guard, so it did not reintroduce this bug. Verified via direct re-investigation today: the exact reported reproduction steps no longer produce the symptom.
fix: No new production code change required — the underlying fix already shipped in commit b2794f0. Added permanent regression-test coverage (src/features/add-entry/hooks/useAddEntry.integration.test.ts) that exercises the REAL addWordEntry service against fake-indexeddb (not mocked, unlike the existing useAddEntry.test.ts), asserting the sheet closes and no error is set when: (a) meaning is left blank, (b) meaning is whitespace-only, and (c) a real meaning is provided (differential control). This closes the coverage gap that let this exact regression class go undetected by the test suite.
verification: `npx vitest run src/features/add-entry/hooks/useAddEntry.integration.test.ts` — 3/3 passed. Full suite `npx vitest run` — 191/191 passed (15 files), no regressions. `npx tsc --noEmit` — clean. `npx eslint` on the new file — clean. Human verification (2026-09-18): user manually confirmed in the running app that the add-entry sheet closes correctly both when no meaning is provided and when a meaning is provided — "confirmed fixed".
files_changed:
  - src/features/add-entry/hooks/useAddEntry.integration.test.ts (new — regression test only; no production code changed; committed as 262450d)
