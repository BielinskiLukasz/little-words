---
status: investigating
trigger: "popup is still visible after creation when no meaning provided; closes correctly when meaning is provided"
created: 2026-08-25T00:00:00Z
updated: 2026-08-25T00:00:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: CONFIRMED — addWordEntry() throws when all meanings are empty strings (line 52, wordEntry.service.ts); the throw is caught by handleSave()'s catch block, which sets error state but never calls setAddWordSheetOpen(false); the close call at line 58 is skipped
test: Traced full code path from handleSave() through addWordEntry()
expecting: N/A — confirmed
next_action: Return diagnosis

reasoning_checkpoint:
  hypothesis: "The G-03-11 fix added a throw at line 52 of wordEntry.service.ts (`At least one non-empty meaning is required`). When no meaning text is entered, the single empty row has text=''. The filter on line 49 produces validMeanings=[]. The throw fires. In useAddEntry.handleSave(), the catch block (line 60) runs — it sets error state — but setAddWordSheetOpen(false) at line 58 is inside the try block before the finally, so it is never reached. The sheet stays open."
  confirming_evidence:
    - "wordEntry.service.ts line 49-53: filter removes empty text meanings, then throws if validMeanings is empty"
    - "useAddEntry.ts line 56-59: addWordEntry is awaited; setAddWordSheetOpen(false) is AFTER the await, inside try — any throw bypasses it"
    - "useAddEntry.ts line 60-62: catch block only sets error state, never closes sheet"
  falsification_test: "If the service did NOT throw when meaning is empty, handleSave would reach line 58 and close the sheet — this is exactly what happens when a meaning IS provided (no throw, sheet closes)"
  fix_rationale: "The service treats no-meaning as an error, but the design intent (UAT truth) allows saving a word form with no meaning. Either remove the throw and allow empty meaning lists, or move setAddWordSheetOpen(false)/reset() to the finally block."
  blind_spots: "Have not verified whether the data model (schema) actually supports a word form with zero meanings — but that is a fix concern, not diagnosis."
  candidate_causes:
    - "code: addWordEntry throws for empty meanings, preventing close callback from being reached"
    - "code: handleSave places setAddWordSheetOpen(false) inside try rather than finally, making it throw-dependent"
  and_gate: "Both conditions contribute: (1) the service throws, AND (2) the close is not in finally. Either one alone could be the fix point. AND-gate fires — two contributing code conditions."

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

## Resolution

root_cause: wordEntry.service.ts line 52 throws "At least one non-empty meaning is required" when the user submits with no meaning text. This exception propagates to useAddEntry.handleSave() where the catch block (line 60) sets error state but does not close the sheet. The setAddWordSheetOpen(false) call at line 58 is inside the try block and is skipped entirely when the service throws.
fix:
verification:
files_changed: []
