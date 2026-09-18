---
phase: quick-260918-mid
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - RELEASES.md
autonomous: true
requirements:
  - QUICK-RELEASES-01

estimate:
  tokens: 17000
  raw_tokens: 12000
  tasks: 1
  confidence: low

must_haves:
  truths:
    - RELEASES.md exists at the project root
    - RELEASES.md contains a "v1.0 — MVP" section dated 2026-09-18 stating 9 phases, 37 plans, 54 tasks
    - Every feature bullet under "What's new" traces to RETROSPECTIVE.md "What Was Built" or MILESTONES.md "Key accomplishments" — no invented features
    - RELEASES.md documents the three post-launch hardening fixes (06.1 dedup rollup, 06.2 v2->v3 import migration, 06.3 import-validation footgun)
    - RELEASES.md lists v1 known limitations sourced from README.md's "Out of Scope (v1)" table
  artifacts:
    - RELEASES.md (new file, project root)
  key_links:
    - RELEASES.md v1.0 section content is traceable to .planning/RETROSPECTIVE.md "What Was Built" and .planning/MILESTONES.md "Key accomplishments" (cross-checked against README.md Features section)
---

<objective>
Create RELEASES.md at the project root containing human-facing release notes for the v1.0 MVP milestone (shipped 2026-09-18, 9 phases, 37 plans, 54 tasks).

Purpose: The project has no release notes file. RELEASES.md gives anyone landing on the repo (or a future release) a readable "what shipped and why it matters" summary, distinct from a raw commit log (CHANGELOG.md does not exist and is not being created here).
Output: RELEASES.md at the project root with a v1.0 section.
</objective>

<execution_context>
@C:/my-code/vibe-coding/little-words/.claude/gsd-core/workflows/execute-plan.md
@C:/my-code/vibe-coding/little-words/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@C:/my-code/vibe-coding/little-words/.planning/STATE.md
@C:/my-code/vibe-coding/little-words/.planning/RETROSPECTIVE.md
@C:/my-code/vibe-coding/little-words/.planning/MILESTONES.md
@C:/my-code/vibe-coding/little-words/README.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create RELEASES.md with v1.0 release notes</name>
  <files>RELEASES.md</files>
  <action>
Create a new file RELEASES.md at the project root (does not currently exist). Write it as human-facing release notes, not a commit log. Use exactly the structure and content below, adapting only markdown mechanics (heading levels, bullet punctuation) as needed — do not add features, stats, or claims beyond what is listed here, since every line must trace back to RETROSPECTIVE.md's "What Was Built" section or MILESTONES.md's "Key accomplishments" list (cross-checked against README.md's Features section).

Top of file: a level-1 heading "Release Notes" followed by one sentence pointing readers to .planning/RETROSPECTIVE.md and .planning/MILESTONES.md for the detailed phase-by-phase build history.

Then a level-2 section heading "v1.0 — MVP (2026-09-18)" followed by an intro paragraph: Little Words v1.0 is the first shippable release — a privacy-first, offline-capable PWA that lets a parent log their child's spoken word forms and the meanings each one expresses, then generate a structured report for a speech therapist or neurologist. Delivered across 9 phases, 37 plans, and 54 tasks.

Under a level-3 heading "What's new", a bullet list (bold lead-in phrase per bullet, matching the README Features section's granularity) covering: child profile and onboarding wizard with clinical flags and the onboarding guard; FAB-driven word logging with meaning autocomplete, dedup, and 14 clinical categories; Dashboard with Active Meanings as the headline metric plus the "Review these?" prompt for meanings unused 30+ days; the browse views (Meanings, Word Forms, Categories, Timeline, and the Pairs view added mid-milestone); inline editing of word form/meaning text, categories, and per-pair first/last observation dates and active status; Doctor Report one-tap plain-text generation with clipboard copy; data portability via schema-versioned JSON export/import plus CSV export; full PWA support (offline service worker, installable manifest, update-prompt toast) and the iOS Add-to-Home-Screen prompt; complete English/Polish bilingual support with Polish as the default.

Under a level-3 heading "Under the hood", a short bullet list covering: the Dexie (IndexedDB) schema v3 upgrade adding per-pair metadata (first/last observation dates, active status) with meaning-aggregate recomputation on every pair write; the GitHub Actions CI/CD pipeline (lint + test gate, then deploy to GitHub Pages via gh-pages on push to main); and that all data stays on-device with no accounts, analytics, or backend.

Under a level-3 heading "Post-launch hardening", one sentence noting a milestone audit surfaced three integration issues, each closed in a dedicated gap-closure phase before the release was finalized, then a bullet per fix: the meaning-rollup dedup bug (deduplicating a word form to an existing meaning did not recompute that meaning's aggregate dates/status); the JSON export/import migration to the v3 schema (so v2 backups are handled correctly rather than silently misread); and the import-validation footgun where a malformed childProfile array could silently wipe existing data instead of being rejected with a clear error.

Under a level-3 heading "Known limitations (by design, v1)", a bullet per row of README.md's "Out of Scope (v1)" table: no developmental norms or milestone comparison (not a diagnostic tool); no multi-device sync (JSON export is the documented migration path); no user accounts (everything stays local to the device); only first and last use dates are tracked per pair, not every occurrence (keeps daily logging effort low).

Close with a horizontal rule and one line pointing to .planning/RETROSPECTIVE.md for full technical history/decisions/lessons and .planning/MILESTONES.md for the phase-by-phase accomplishment log.

Do not create or modify CHANGELOG.md — RELEASES.md is a separate, narrative document.
  </action>
  <verify>
    <automated>test -f "C:/my-code/vibe-coding/little-words/RELEASES.md" && grep -q "v1.0" "C:/my-code/vibe-coding/little-words/RELEASES.md" && grep -q "37 plans" "C:/my-code/vibe-coding/little-words/RELEASES.md" && grep -q "54 tasks" "C:/my-code/vibe-coding/little-words/RELEASES.md" && grep -q "Post-launch hardening" "C:/my-code/vibe-coding/little-words/RELEASES.md" && echo PASS</automated>
  </verify>
  <done>RELEASES.md exists at the project root with a "v1.0 — MVP (2026-09-18)" section containing "What's new", "Under the hood", "Post-launch hardening", and "Known limitations" subsections; the 9 phases/37 plans/54 tasks stats are present; every claim traces to RETROSPECTIVE.md, MILESTONES.md, or README.md.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none | RELEASES.md is a static, hand-authored markdown file at the project root with no user input, no runtime code path, and no data flow — it is read-only prose shipped alongside the repo |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-quick260918mid-01 | Information Disclosure | RELEASES.md content | low | accept | Content is limited to already-public build facts already present in RETROSPECTIVE.md/MILESTONES.md/README.md; no credentials, internal URLs, or user data are included |
</threat_model>

<verification>
1. `test -f RELEASES.md` — file exists at project root
2. RELEASES.md contains the v1.0 section with 9 phases / 37 plans / 54 tasks stats
3. RELEASES.md contains "What's new", "Under the hood", "Post-launch hardening", and "Known limitations" subsections
4. Manually spot-check that no bullet introduces a feature absent from RETROSPECTIVE.md's "What Was Built" or MILESTONES.md's "Key accomplishments"
</verification>

<success_criteria>
- RELEASES.md exists at the project root and reads as narrative release notes (not a raw commit log)
- Content is fully traceable to RETROSPECTIVE.md, MILESTONES.md, and README.md — no invented features or stats
- CHANGELOG.md is untouched (not created, not modified)
</success_criteria>

<output>
Create .planning/quick/260918-mid-create-update-releases-md-with-release-n/260918-mid-SUMMARY.md when done
</output>