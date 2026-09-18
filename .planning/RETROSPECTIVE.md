# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-09-18
**Phases:** 9 | **Plans:** 37 | **Sessions:** multiple (2026-06-30 → 2026-09-18)

### What Was Built
- Full onboarding + add-entry vertical slice (child profile wizard, FAB → bottom sheet word entry with meaning autocomplete/dedup)
- Complete browse experience — Dashboard, Meanings, Word Forms, Categories, Timeline (Recharts), and a Pairs view added mid-milestone
- Doctor Report generation with one-tap clipboard copy, plus full JSON/CSV data portability (schema-versioned export/import)
- Full PWA hardening — offline service worker, installable manifest, update-prompt toast, CI/CD to GitHub Pages
- Dexie v3 schema upgrade with per-pair metadata (first/last observation dates, active status) and inline editing
- Post-milestone-audit hardening — closed a meaning-rollup dedup bug (06.1), migrated import/export to v3 schema (06.2), and fixed an import-validation footgun that could silently wipe data (06.3)

### What Worked
- Running `/gsd-audit-milestone` before close surfaced two real integration bugs (dedup-reuse rollup staleness, v2/v3 schema drift on import) that phase-level verification alone had missed — both got dedicated gap-closure phases (06.1, 06.2) and re-verified clean.
- TDD-first gap-closure plans (06.1, 06.2, 06.3) kept fixes tightly scoped to the audit's exact finding, with no scope creep.
- Delegating debug sessions to `/gsd-debug` caught a case where a tracked bug (`popup-no-close`) had *already* been fixed by an earlier commit — the debugger re-confirmed from scratch rather than trusting stale session state, then added a real regression-guard test instead of a no-op.

### What Was Inefficient
- 14 of 26 v1 requirements were missing `requirements-completed` frontmatter in their SUMMARY.md files despite being genuinely verified — a documentation-hygiene gap that accumulated silently across phases 1, 3, 4, 5, 6 and only surfaced at the milestone audit. Backfilling it (06.3-02) then triggered a *second* problem: the staleness check compares a phase's `*-VERIFICATION.md` commit time against its `*-SUMMARY.md` files' commit times, so touching 12 old SUMMARY.md files for a pure metadata backfill flipped phases 01, 03, and 04 to `stale` and blocked milestone close until they were re-verified (a real but avoidable cost — no application code had changed).
- `.planning/debug/knowledge-base.md` (a static reference doc the debug workflow writes resolved-pattern summaries into) has no `status:` frontmatter and was misclassified by `audit-open` as an unknown open debug session, requiring a manual acknowledge at every future milestone close until the scanner excludes it by name.

### Patterns Established
- Gap-closure phases get decimal numbers (06.1, 06.2, 06.3) inserted after the phase whose audit finding they close, each with their own TDD plan, VERIFICATION.md, and (for 06.3) SECURITY.md threat register — keeps the historical record honest about what shipped when.
- Radix `Collapsible` + `e.stopPropagation()` on navigation arrows is the shared pattern for per-pair expandable rows across MeaningDetailPage, WordFormDetailPage, and PairsPage (Phase 6).

### Key Lessons
1. When backfilling metadata-only frontmatter across many old SUMMARY.md files late in a milestone, expect it to trip the verification-staleness check on every phase it touches — budget for a quick re-verification pass (confirmed safe here: zero code changes, all three re-verifications passed clean) rather than being surprised by it at milestone-close time.
2. A confirmed root cause in a debug session file is not the same as "still true" — re-verify against current HEAD before trusting a stale debug session, since an unrelated later commit can (coincidentally or not) already have fixed, or re-broken, the same code path.
3. Accepted-risk items from a security threat register (e.g., deferred referential-integrity/CSV-injection import hardening from 06.3) should be logged in both the phase's SECURITY.md *and* PROJECT.md's Key Decisions table so they surface again at the next milestone's planning stage instead of silently aging out.

### Cost Observations
- Model mix: mostly sonnet (planning/execution/debug orchestration), haiku for verification/re-verification subagents.
- Sessions: multiple across ~80 days, including 3 gap-closure phases inserted after the initial milestone audit.
- Notable: re-verifying 3 stale-but-unchanged phases (01, 03, 04) in parallel cost 3 subagent spawns but zero code changes — a case where fast parallel dispatch kept a documentation-hygiene fix from stalling the milestone close.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | multiple | 9 | First milestone; established the audit → gap-closure-phase → re-verify → close pattern |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 191 (vitest, full suite at close) | not tracked | 0 |

### Top Lessons (Verified Across Milestones)

1. Metadata-only documentation backfills can trip mechanical staleness checks — treat this as expected overhead, not a red flag, once the diff is confirmed docs-only.
