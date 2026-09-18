# Phase 4: Doctor Report & Data Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-25
**Phase:** 4-Doctor Report & Data Management
**Areas discussed:** Report content & preview, Report language, Export/Import file mechanics, Import warning & error UX

---

## Report content & preview

### Report trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate on page load | Report appears immediately when the page opens — no extra tap needed | ✓ |
| Tap 'Generate Report' button first | Page shows a button; report only appears after tapping it | |

**User's choice:** Auto-generate on page load

---

### Report display

| Option | Description | Selected |
|--------|-------------|----------|
| Scrollable text area / pre-formatted block | Full plain-text report in a readable block; one 'Copy to clipboard' button below | ✓ |
| Structured card layout with sections | Each report section as a separate card; copy still produces plain text | |
| Minimal: just a copy button | No preview — parent taps 'Copy' and text goes to clipboard | |

**User's choice:** Scrollable pre-formatted text block

---

### Parent notes location

| Option | Description | Selected |
|--------|-------------|----------|
| Editable textarea on Doctor Report page | Notes field embedded in report page; persists to childProfile.parentNotes | ✓ |
| Edit notes in Settings → Profile only | Notes live in profile edit only; parent must navigate away before generating report | |

**User's choice:** Editable textarea directly on Doctor Report page

---

### Medical flags format

| Option | Description | Selected |
|--------|-------------|----------|
| Only show flags that are TRUE | Omit false flags; concise report | |
| Always list all three flags with yes/no | Explicit yes/no for all three regardless of value | ✓ |

**User's choice:** Always list all three flags with yes/no

---

### New meanings in last 3 months

| Option | Description | Selected |
|--------|-------------|----------|
| Count only | 'New in last 3 months: 12' — concise | ✓ |
| Count + list of meaning text labels | Shows count and each meaning name | |

**User's choice:** Count only

---

## Report language

### Report output language

| Option | Description | Selected |
|--------|-------------|----------|
| Always Polish | Fixed Polish output regardless of app language setting | |
| Follow the app's current language setting | Report language matches the UI language set by parent | ✓ |
| Let the parent choose per report | Language toggle on the Doctor Report page | |

**User's choice:** Follow the app's current language setting

---

### Report label translation

| Option | Description | Selected |
|--------|-------------|----------|
| Translated via i18n keys | Add report keys to pl/common.json and en/common.json | ✓ |
| Hardcoded Polish strings in generator | Single function with hardcoded strings | |

**User's choice:** Translated via i18n keys

---

## Export/Import file mechanics

### Export mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Anchor-tag download (<a download=...>) | Works on all browsers including iOS/Safari; file goes to Downloads | ✓ |
| File System Access API (showSaveFilePicker) | Native OS save dialog; Chrome/Edge only; not supported on iOS | |

**User's choice:** Anchor-tag download

---

### Import mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden <input type=file> | Standard file input triggered by Import button; universal browser support | ✓ |
| File System Access API (showOpenFilePicker) | Native OS file picker; Chrome/Edge only; not supported on iOS | |

**User's choice:** Hidden <input type=file>

---

### Export filename convention

| Option | Description | Selected |
|--------|-------------|----------|
| little-words-backup-YYYY-MM-DD.json | Date-stamped; easy to identify multiple backups | ✓ |
| little-words-backup.json (static name) | Simple but overwrites previous backups in Downloads | |

**User's choice:** little-words-backup-YYYY-MM-DD.json

---

### JSON export shape

| Option | Description | Selected |
|--------|-------------|----------|
| { schemaVersion: 2, exportedAt, childProfile, wordForms, meanings, wordFormMeanings } | Mirrors Dexie schema v2; all four entities as arrays | ✓ |
| { schemaVersion: 1, ... } | Would mismatch actual schema version | |

**User's choice:** schemaVersion: 2 with all four entity arrays

---

## Import warning & error UX

### Import confirmation level

| Option | Description | Selected |
|--------|-------------|----------|
| AlertDialog with warn + confirm button | Standard destructive-action pattern; explicit 'Yes, replace my data' button | ✓ |
| AlertDialog + typed confirmation (type REPLACE) | Higher friction; typically used for account deletion | |

**User's choice:** AlertDialog with confirm button

---

### Schema mismatch / corrupt file handling

| Option | Description | Selected |
|--------|-------------|----------|
| Error toast + abort (no data changed) | Validation before deletion; toast shows error; existing data untouched | |
| AlertDialog explaining the error | More visible; explains why import failed in plain language | ✓ |

**User's choice:** AlertDialog explaining the error

---

### Post-import navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Success toast + stay on Settings page | Consistent with clipboard toast pattern; no redirect | ✓ |
| Success toast + redirect to Dashboard | More intentional; shows restored data immediately | |

**User's choice:** Success toast + stay on Settings page

---

### Settings → Data layout

| Option | Description | Selected |
|--------|-------------|----------|
| List rows with label + description | Tappable rows with icon + label + sub-label; consistent with ProfileEditLink pattern | ✓ |
| Full-width buttons stacked vertically | Simpler but less descriptive | |
| Grouped into 'Export' and 'Import' subsections | Clearer taxonomy but adds heading complexity | |

**User's choice:** List rows with label + description (consistent with ProfileEditLink)

---

## Claude's Discretion

- CSV filename convention — not discussed; Claude to follow the same date-stamp pattern as JSON: `little-words-meanings-YYYY-MM-DD.csv`
- Blob + URL.createObjectURL implementation detail for anchor download
- Exact toast message wording for copy success and import success
- Order of rows in Settings → Data section

## Deferred Ideas

- Gesture recording (GEST-01/02/03) — explicitly v2; discussed only to confirm out of scope
- Spontaneous/Imitated tracking (USAGE-01/02) — v2; no schema change for Meaning in Phase 4
- Export success toast — browser's native download indicator sufficient; no toast added for export actions
- PDF doctor report — out of scope in PROJECT.md
