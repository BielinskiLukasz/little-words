# Phase 4: Doctor Report & Data Management - Context

**Gathered:** 2026-08-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers the primary value moment: a parent can generate a structured Doctor Report and copy it to clipboard in one tap, and can export or import all app data from Settings → Data. Phase 4 maps to requirements REPORT-01, REPORT-02, DATA-01, DATA-02, DATA-03.

**Out of scope for this phase:** Gesture recording (GEST-01/02/03 are v2), spontaneous/imitated tracking (USAGE-01/02 are v2), and meaning field editing from detail pages — none of these have a Phase 4 requirement ID.

</domain>

<decisions>
## Implementation Decisions

### Doctor Report — Page & Display

- **D-01:** The report auto-generates on page load — no "Generate Report" button tap required. The parent opens the Doctor Report page and the report text is immediately visible.
- **D-02:** Report is displayed in a scrollable pre-formatted text block (monospace or body font). A "Copy to clipboard" button is positioned below the block. No structured card layout.
- **D-03:** Parent notes are edited via an editable textarea directly embedded on the Doctor Report page. Saves to `childProfile.parentNotes` in real time (or on blur). Parent does not need to navigate to Settings → Profile to update notes before a consultation.
- **D-04:** The copy success is confirmed with a toast notification — consistent with the established toast pattern in the app.

### Doctor Report — Content Format

- **D-05:** Medical flags (premature birth, speech therapy, neurological care) are always listed with explicit yes/no values regardless of their state. All three appear in every report.
- **D-06:** "New meanings in the last 3 months" is shown as a count only (e.g., "New in last 3 months: 12"). The individual meaning names are not listed.
- **D-07:** Top 3 categories are derived from the meaning categories with the highest active meaning counts.

### Doctor Report — Language & i18n

- **D-08:** The report output language follows the app's current language setting (Polish or English, as set by the parent in Settings). The app already persists language choice via `little-words-lang` in localStorage.
- **D-09:** Report section labels (e.g., "Active meanings", "Top categories", "Medical context", "Parent notes") are translated via i18n keys added to `pl/common.json` and `en/common.json`. No hardcoded strings in the report generator function.

### Settings → Data — Layout

- **D-10:** The three data actions (Export JSON, Import JSON, Export CSV) are presented as tappable list rows: icon + label on the left with a short description below (e.g., "Export JSON — Back up all your data"). Consistent with the `ProfileEditLink` row pattern already in `SettingsPage.tsx`. The existing `DataPlaceholder.tsx` component is replaced with a live `DataSection` component.

### Export — File Mechanics

- **D-11:** JSON and CSV exports use anchor-tag download (`<a download=...>` with a programmatically created Blob URL). Works on all browsers including iOS/Safari. No File System Access API — the primary mobile target (iOS) does not support it.
- **D-12:** JSON export filename: `little-words-backup-YYYY-MM-DD.json` (date-stamped at time of export).
- **D-13:** JSON export shape: `{ schemaVersion: 2, exportedAt: "<ISO string>", childProfile: [...], wordForms: [...], meanings: [...], wordFormMeanings: [...] }`. `schemaVersion` mirrors the current Dexie schema version (v2).
- **D-14:** CSV export covers all meanings with columns: meaning label, categories (semicolon-separated), first use date, last use date, active status, linked word forms (semicolon-separated). — **Reversibility:** reversible

### Import — File Mechanics

- **D-15:** JSON import is triggered by a hidden `<input type="file" accept=".json">` that is programmatically clicked by the Import button. Works universally including iOS/Safari.

### Import — Confirmation & Error UX

- **D-16:** Before executing the import, show a Shadcn `AlertDialog` warning that existing data will be replaced. Requires an explicit "Yes, replace my data" confirm button. Single dialog, no typed confirmation required. — **Reversibility:** reversible
- **D-17:** Validation runs BEFORE any data is deleted. If the JSON file has a mismatched `schemaVersion` or is corrupt/malformed, show an `AlertDialog` explaining the error (not just a toast). Existing data is left untouched.
- **D-18:** After a successful import, show a success toast ("Data imported successfully") and stay on the Settings page. No redirect to Dashboard.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Doctor Report — REPORT-01, REPORT-02: report content fields, copy-to-clipboard
- `.planning/REQUIREMENTS.md` §Data Management — DATA-01, DATA-02, DATA-03: JSON export/import, CSV export
- `.planning/ROADMAP.md` §Phase 4 — Phase goal, 5 success criteria, dependency on Phase 3

### Prior Phase Context
- `.planning/phases/03-browse-views/03-CONTEXT.md` — D-06 (meaning detail editable fields deferred), D-08 (alert-dialog installed), D-07 (Shadcn Switch installed)
- `.planning/phases/02-onboarding-data-entry/02-CONTEXT.md` — D-08 (ChildProfile schema includes parentNotes, prematureBirth, speechTherapy, neurologicalCare — added in Phase 2 schema to avoid future migration)
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-01 through D-04 (routing, nav structure)

### Architecture & Constraints
- `.planning/PROJECT.md` §Constraints — Immutable constraints (hash routing, IndexedDB-only, GitHub Pages, no backend)
- `.planning/PROJECT.md` §Out of Scope — PDF report, gesture tracking, spontaneous tracking all explicitly deferred
- `.claude/CLAUDE.md` §Architecture — Service layer pattern, Dexie access rules, i18n conventions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/schema.ts` — `ChildProfile` interface already has `parentNotes`, `prematureBirth`, `speechTherapy`, `neurologicalCare` fields; no schema migration needed for Doctor Report
- `src/db/services/childProfile.service.ts` — `getChildProfile()` and `updateChildProfile()` already exist; use `updateChildProfile` to persist parent notes edits
- `src/db/services/meaning.service.ts` — `getMeaningsByMonth()`, `getMeaningsGroupedByCategory()` already built from Phase 3; reuse for report counts
- `src/components/ui/alert-dialog.tsx` — Shadcn AlertDialog installed (Phase 3); use for import confirmation and import error dialogs
- `src/features/settings/components/DataPlaceholder.tsx` — replace with live `DataSection` component; labels and translation keys already exist in locale files
- `src/features/settings/components/ProfileEditLink.tsx` — reference this row pattern for the three data action rows in `DataSection`
- `src/pages/DoctorReportPage.tsx` — stub at `/#/doctor-report`; replace body content entirely

### Established Patterns
- `useLiveQuery` (Dexie reactive hooks) — use for loading childProfile and meaning counts on DoctorReportPage
- `useTranslation('common')` — all UI strings and report labels via i18n keys
- Toast notifications — established pattern in the app; use same mechanism for copy success and import success
- Tailwind utility-first styling — no CSS modules
- Shadcn component install: `npx shadcn@latest add <component>` if additional components needed

### Integration Points
- `src/pages/SettingsPage.tsx` — Data section currently renders `<DataPlaceholder />`; swap for `<DataSection />` from `src/features/settings/components/DataSection.tsx`
- `src/i18n/locales/pl/common.json` and `en/common.json` — add report label keys (e.g., `report.activeMeanings`, `report.medicalContext`, `report.parentNotes`)
- Dexie `db.ts` — read all four tables (`childProfile`, `wordForms`, `meanings`, `wordFormMeanings`) for JSON export; no schema migration needed for Phase 4

</code_context>

<specifics>
## Specific Ideas

- Doctor Report page layout: textarea for parent notes above the pre-formatted report text block; "Copy Report" button below the text block
- Medical flags format in report: "Premature birth: Tak / Nie" (PL) or "Premature birth: Yes / No" (EN) — always three lines
- Settings → Data rows should follow the `ProfileEditLink` visual row pattern (label + description + chevron or action icon)
- JSON export: use `Blob` + `URL.createObjectURL` + a hidden `<a>` element pattern; revoke the object URL after triggering click
- Import error dialog: explain in plain language what went wrong ("This file doesn't appear to be a Little Words backup" or "This backup is from a newer version of the app")

</specifics>

<deferred>
## Deferred Ideas

- **Gesture recording** — GEST-01/02/03 are explicitly v2 requirements; not in Phase 4 scope
- **Spontaneous/Imitated tracking** — USAGE-01/02 are v2; no schema change for `Meaning` in Phase 4
- **Meaning field editing from detail page** — deferred in Phase 3 (03-CONTEXT D-06), no Phase 4 requirement ID
- **PDF doctor report** — explicitly out of scope in PROJECT.md (copy-to-clipboard sufficient for v1)
- **Export success toast** — browser's native download indicator was deemed sufficient; no toast added for export

</deferred>

---

*Phase: 4-Doctor Report & Data Management*
*Context gathered: 2026-08-25*
