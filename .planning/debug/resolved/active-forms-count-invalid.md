---
status: resolved
trigger: "In main screen where we have active meanings and active forms the meanings are calculated ok, but active forms is invalid"
created: 2026-09-22
updated: 2026-09-22
---

# Debug Session: active-forms-count-invalid

## Symptoms

- **Expected behavior:** The dashboard's "active forms" stat should show an accurate count of currently active word forms, mirroring the correctness of the "active meanings" stat next to it.
- **Actual behavior:** "Active forms" count is too high (over-counting) compared to what should be active.
- **Error messages:** None reported — this is a silent data/logic bug, not a crash.
- **Timeline:** Not sure when it started; no confirmed working state recalled by user.
- **Reproduction:** Open the app's main dashboard screen and compare the "active meanings" and "active forms" stat tiles; active forms appears inflated.

## Current Focus

reasoning_checkpoint:
  hypothesis: "DashboardPage's activeWordFormsCount query counts ALL word forms via `db.wordForms.toCollection().count()`, with no isActive-equivalent filter, because WordForm has no isActive field of its own (unlike Meaning) — 'active' for a word form is a derived property computed elsewhere in the app (via linked active meanings), and the dashboard code never derives it, so it always renders the total word-form count instead of the active-only count, inflating the stat whenever any word form has no currently-active linked meaning."
  confirming_evidence:
    - "src/pages/DashboardPage.tsx lines 22-25: activeWordFormsCount query is literally `db.wordForms.toCollection().count()` — no filter predicate at all, unlike the sibling activeMeaningsCount query 8 lines above which does `.filter(m => m.isActive)`."
    - "src/db/schema.ts WordForm interface (lines 33-37) has only id, form, createdAt — no isActive field exists on WordForm, confirming there is nothing to filter on directly in that table."
    - "src/pages/WordFormsPage.tsx (the browse/list view) already implements the correct, shipped convention: it calls getWordFormsWithActiveMeaningCount() and treats a word form as inactive (opacity-50 + 'inactive' badge) when activeMeaningCount === 0 — proving the app already has an established definition of 'active word form' that Dashboard simply never applied."
  falsification_test: "Add a word form whose only linked meaning(s) are all isActive=false (or which has zero linked meanings), reload the dashboard: if the 'active forms' count still excludes it, hypothesis is wrong. Observed instead: it counts every row in wordForms regardless of linked-meaning activity, so such a form is wrongly included — confirming the hypothesis."
  fix_rationale: "Fix must derive 'active word form' the same way the already-shipped WordFormsPage does (via getWordFormsWithActiveMeaningCount, activeMeaningCount > 0) rather than inventing a new definition or adding a redundant isActive column to WordForm (which would require new dual-write/sync logic mirroring aggregateMeaningFromPairs — unnecessary duplication of an already-solved problem). Extract a getActiveWordFormsCount() service function reusing that existing query, and swap DashboardPage's raw Dexie count() for it — also fixes the pre-existing violation of the project convention 'Database access: always go through the service layer' (Dashboard queries db.wordForms directly)."
  blind_spots: "Have not confirmed whether a word form with zero linked meanings at all (never paired) should count as inactive — treating it as inactive (no active meaning = not active), consistent with WordFormsPage's existing badge logic which also treats activeMeaningCount === 0 as inactive regardless of whether that's because of 0 links or all-inactive links. No other screen showed the same raw-count bug (grep confirmed DashboardPage is the only offender)."
  candidate_causes:
    - "code: DashboardPage.tsx's activeWordFormsCount query never applies an isActive-equivalent filter — a plain logic omission local to the dashboard component"
    - "data/schema: WordForm has no isActive column, so 'active' must be derived from the meanings/junction relationship — an implicit modeling convention the dashboard's author did not follow, unlike WordFormDetailPage/WordFormsPage which do"
  and_gate: "no — single missing-filter bug in one query; reproduces deterministically whenever any word form lacks an active linked meaning. No second independent condition required."

next_action: "Write failing test for new getActiveWordFormsCount() service function (TDD red phase), then implement fix in wordForm.service.ts and wire into DashboardPage.tsx"

## Evidence

- timestamp: 2026-09-22T00:00:00Z
  checked: src/pages/DashboardPage.tsx (activeWordFormsCount query, lines 22-25) vs activeMeaningsCount query (lines 13-20)
  found: activeWordFormsCount = `db.wordForms.toCollection().count()` with no filter, while the sibling activeMeaningsCount correctly filters `.filter(m => m.isActive)` before counting.
  implication: The "active forms" stat counts every row in the wordForms table, not just active ones — direct source of the over-count.

- timestamp: 2026-09-22T00:00:01Z
  checked: src/db/schema.ts WordForm and Meaning interfaces
  found: Meaning has an `isActive: boolean` field; WordForm has no such field (only id, form, createdAt).
  implication: There is no column to filter on directly for word forms — "active" must be derived from linked WordFormMeaning/Meaning data, which the dashboard query never does.

- timestamp: 2026-09-22T00:00:02Z
  checked: src/db/services/wordForm.service.ts getWordFormsWithActiveMeaningCount(); src/pages/WordFormsPage.tsx
  found: The app already has an established, shipped convention — a word form is treated as active when it has at least one linked meaning with isActive === true (activeMeaningCount > 0). WordFormsPage uses this to grey out / badge inactive forms.
  implication: The dashboard should reuse this exact convention for consistency rather than invent a new one; the fix is to extract a count based on this existing function.

- timestamp: 2026-09-22T00:00:03Z
  checked: grep for other raw `db.wordForms.toCollection()/.count()/.toArray()` usages across src/pages and src/features
  found: DoctorReportPage, dataManagement.ts, and WordFormsPage all read wordForms.toArray() but either derive activity correctly (WordFormsPage) or don't display an "active" count at all (DoctorReportPage, dataManagement export). DashboardPage is the only place displaying an "active word forms" stat, and the only one with the raw unfiltered count.
  implication: This is a single, localized bug — no other screen needs the same fix.

## Eliminated

(none — first and only hypothesis formed was confirmed directly by evidence; no false starts)

## Resolution

- root_cause: DashboardPage.tsx's "active word forms" stat query (`db.wordForms.toCollection().count()`) counts every row in the wordForms table unconditionally. WordForm has no isActive field of its own — "active" is a derived concept (a word form is active when it has ≥1 linked meaning that is itself active), already correctly implemented elsewhere (getWordFormsWithActiveMeaningCount / WordFormsPage) but never applied on the dashboard.
- fix: Added `getActiveWordFormsCount()` to `src/db/services/wordForm.service.ts`, which reuses the existing `getWordFormsWithActiveMeaningCount()` helper and counts word forms where `activeMeaningCount > 0` (same convention already used by WordFormsPage's active/inactive badge). Replaced `DashboardPage.tsx`'s raw `db.wordForms.toCollection().count()` query with a call to this new service function, also fixing a pre-existing violation of the "database access goes through the service layer" convention.
- oracle_type: derived (regression test encodes the app's existing "active = has ≥1 active-linked meaning" model, established by getWordFormsWithActiveMeaningCount/WordFormsPage, not merely the one reported value)
- verification:
    target_test: { result: pass }
    mutation_check: { result: skipped, reason: "Stryker not configured in this project (no stryker.conf.* found, no devDependency)" }
    no_op_deletion: { result: pass }
    adjacent_tests: { result: pass, suites_run: [all 15 test files / 196 tests, including wordEntry.service.test.ts and wordFormMeaning.service.test.ts which share the wordForm.service import graph] }
    revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }
    guardrail_verdict: accepted
  full_suite: 196/196 tests pass; lint clean; `tsc -b && vite build` succeeds
- files_changed:
    - src/db/services/wordForm.service.ts (added getActiveWordFormsCount)
    - src/pages/DashboardPage.tsx (wired new service function into activeWordFormsCount query)
    - src/db/services/wordForm.service.test.ts (5 new regression tests: empty DB, unlinked form, inactive-only-linked form, active-linked form, and a mixed-set regression case asserting the naive row count (3) would have been wrong vs. the correct active count (1))
- human_verification: User explicitly opted to skip the manual dev-server check ("Skip manual check, proceed"), trusting the automated guardrail (196/196 tests, lint clean, build clean, revert-and-reconfirm) as sufficient confirmation. Session closed on that basis.
