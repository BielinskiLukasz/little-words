# Release Notes

For the full phase-by-phase build history, see [.planning/RETROSPECTIVE.md](.planning/RETROSPECTIVE.md) and [.planning/MILESTONES.md](.planning/MILESTONES.md).

## v1.0 — MVP (2026-09-18)

Little Words v1.0 is the first shippable release — a privacy-first, offline-capable PWA that lets a parent log their child's spoken word forms and the meanings each one expresses, then generate a structured report for a speech therapist or neurologist. Delivered across 9 phases, 37 plans, and 54 tasks.

### What's new

- **Child profile and onboarding wizard** — guided first-run setup capturing name, birth date, home languages, and optional clinical flags (prematurity, speech therapy, neurological care), guarded so the main screen stays locked until the profile is complete
- **FAB-driven word logging** — floating action button opens a bottom sheet with meaning autocomplete, dedup against existing meanings, and 14 clinical categories, atomically linking word forms to meanings
- **Dashboard** — Active Meanings as the headline metric, with secondary cards and a "Review these?" prompt for meanings unused 30+ days
- **Browse views** — Meanings, Word Forms, Categories, and Timeline (monthly vocabulary growth chart), plus a Pairs view added mid-milestone listing every word-form ↔ meaning pair with dual-chip navigation
- **Inline editing** — edit word form/meaning text and categories directly on detail pages, plus per-pair first/last observation dates and active status
- **Doctor Report** — one-tap generation of a structured plain-text summary with clipboard copy
- **Data portability** — schema-versioned JSON export/import for backup and device migration, plus CSV export for spreadsheet analysis
- **Full PWA support** — offline-capable service worker, installable manifest, update-prompt toast on new deploys, and an iOS Add-to-Home-Screen prompt for Safari users
- **Complete English/Polish bilingual support** — Polish is the default language

### Under the hood

- Dexie (IndexedDB) schema v3 upgrade adding per-pair metadata (first/last observation dates, active status), with the Meaning aggregate recomputed on every pair write
- GitHub Actions CI/CD pipeline — lint + test gate, then deploy to GitHub Pages via `gh-pages` on push to `main`
- All data stays on-device — no accounts, no analytics, no backend

### Post-launch hardening

A milestone audit surfaced three integration issues, each closed in a dedicated gap-closure phase before the release was finalized:

- Fixed a meaning-rollup dedup bug where deduplicating a word form to an existing meaning did not recompute that meaning's aggregate dates/status
- Migrated JSON export/import to the v3 schema, so v2 backups are handled correctly rather than silently misread
- Fixed an import-validation footgun where a malformed `childProfile` array could silently wipe existing data instead of being rejected with a clear error

### Known limitations (by design, v1)

- No developmental norms or milestone comparison — this is not a diagnostic tool
- No multi-device sync — JSON export is the documented migration path
- No user accounts — everything stays local to the device
- Only first and last use dates are tracked per pair, not every occurrence — keeps daily logging effort low

---

See [.planning/RETROSPECTIVE.md](.planning/RETROSPECTIVE.md) for full technical history, decisions, and lessons, and [.planning/MILESTONES.md](.planning/MILESTONES.md) for the phase-by-phase accomplishment log.
