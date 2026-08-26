---
phase: 04-doctor-report-data-management
plan: "02"
subsystem: settings/data-management
tags:
  - data-portability
  - tdd
  - indexeddb
  - csv
  - json
dependency_graph:
  requires:
    - 04-01 (DataSection shell, DataPlaceholder replaced, sonner installed)
  provides:
    - dataManagement service (fully tested and implemented)
    - importData with Dexie transaction and error differentiation
    - buildMeaningsCSV pure CSV builder
    - exportMeaningsCSV anchor download
    - DataSection with full import/export flows wired
  affects:
    - src/features/settings/components/DataSection.tsx
    - src/features/settings/services/dataManagement.ts
tech_stack:
  added: []
  patterns:
    - TDD RED/GREEN/REFACTOR for pure service functions
    - Dexie transaction for atomic backup restore (clear + bulkAdd)
    - Hidden file input + useRef for iOS-compatible file picking
    - vi.mock getter pattern for fake-indexeddb DB isolation in tests
key_files:
  created:
    - src/features/settings/services/dataManagement.ts
    - src/features/settings/services/dataManagement.test.ts
    - src/features/settings/components/DataSection.tsx
  modified:
    - src/pages/SettingsPage.tsx
    - src/i18n/locales/pl/common.json
    - src/i18n/locales/en/common.json
decisions:
  - importData throws 'wrong-schema-version' (numeric schemaVersion != 2) vs 'corrupt' (non-parseable or missing arrays); DataSection inspects error message to select the right error dialog text
  - buildMeaningsCSV uses semicolons as intra-cell separator for categories and word forms (avoids conflict with CSV comma delimiter); simple comma-quoting (wrap in double-quotes if value contains comma)
  - importData does NOT show toast or dialog — calling component (DataSection) owns all UI; keeps service layer purely async
  - Dexie transaction wraps all clear + bulkAdd for all four tables atomically; if bulkAdd throws, Dexie rolls back and existing data is preserved (T-04-07 mitigation)
metrics:
  duration: "~30 minutes (Tasks 1-3 across two session waves)"
  completed: "2026-08-26"
  tasks_completed: 3
  commits: 3
status: complete
actuals:
  tokens: 18000
  tasks: 3
  commits: 3
---

# Phase 04 Plan 02: Settings Data Management — Summary

**One-liner:** Full data portability — JSON backup/restore with Dexie transaction safety, CSV meanings export, and import error differentiation (corrupt vs wrong-schema-version) using TDD-verified pure service functions.

## What Was Built

Settings → Data section now has three fully wired interactive rows:

1. **Export JSON** — downloads `little-words-backup-YYYY-MM-DD.json` with schemaVersion=2 and all four entity arrays (childProfile, wordForms, meanings, wordFormMeanings).
2. **Import JSON** — shows an AlertDialog warning before opening the file picker; validates the JSON file against schemaVersion=2 before clearing the DB; runs the full restore inside a Dexie transaction; shows a success toast (sonner) on success; shows an appropriate error dialog for corrupt vs wrong-version files.
3. **Export CSV** — downloads `little-words-meanings.csv` with header `label,categories,firstUseDate,lastUseDate,active,wordForms`, categories and word forms joined by semicolons, comma-containing values quoted.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | JSON export tracer — DataSection replaces DataPlaceholder | 42179eb | dataManagement.ts (stubs), DataSection.tsx, SettingsPage.tsx, i18n |
| 2 | TDD data services — validateBackupData, buildMeaningsCSV, importData, exportMeaningsCSV | 9626a75 | dataManagement.ts, dataManagement.test.ts |
| 3 | Wire Import + CSV Export in DataSection | be2357c | DataSection.tsx |

## TDD Gate Compliance

- RED: 13 tests failing (validateBackupData stub returning false; buildMeaningsCSV + importData stubs throwing 'not implemented')
- GREEN: all 26 tests passing after implementing the four functions
- Full suite: 127 tests passing, no regressions

## Decisions Made

1. **Error message routing** — `importData` throws with string message `'wrong-schema-version'` or `'corrupt'`; `DataSection.handleFileSelected` inspects the message to pick the correct i18n key for the error dialog. This keeps the service layer free of i18n concerns.
2. **CSV separator** — semicolons used inside cells (categories, word forms) to avoid conflict with the outer comma delimiter; comma-containing cell values are wrapped in double-quotes (simplified, not full RFC 4180).
3. **Transaction safety** — all four `clear()` + `bulkAdd()` calls run inside a single Dexie `'rw'` transaction. If any `bulkAdd` throws, the transaction rolls back and the original data is preserved (threat T-04-07 mitigated).
4. **File input pattern** — hidden `<input type="file" ref={fileInputRef}>` with `fileInputRef.current?.click()` after confirm; this is the iOS-safe approach (D-15) that avoids browser popup blockers.

## Deviations from Plan

None — plan executed exactly as written. All stubs from Task 1 were replaced by full implementations in Tasks 2 and 3.

## Threat Mitigations Applied

| Threat | Status |
|--------|--------|
| T-04-04: importData — JSON file overwrites all IndexedDB data | Mitigated — validateBackupData runs before any clear/bulkAdd |
| T-04-07: importData — data loss if bulkAdd fails mid-transaction | Mitigated — Dexie 'rw' transaction wraps all clear+bulkAdd; auto-rollback on throw |
| T-04-SC: new package installs | N/A — no new packages (sonner was installed in 04-01) |

## Known Stubs

None — all three data actions are fully wired.

## Self-Check: PASSED

- [x] `src/features/settings/services/dataManagement.ts` exists
- [x] `src/features/settings/services/dataManagement.test.ts` exists (26 tests)
- [x] `src/features/settings/components/DataSection.tsx` updated
- [x] Commits 42179eb, 9626a75, be2357c all present in git log
- [x] `npm run test` exits 0 (127 tests passing)
- [x] `npm run build` exits 0
