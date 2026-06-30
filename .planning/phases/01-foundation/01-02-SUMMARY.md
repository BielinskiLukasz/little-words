---
plan: 01-02
status: complete
completed: 2026-06-30
commits:
  - 8019c7e  # test(01-02): add failing tests for Dexie schema v1
  - fcd3a41  # feat(01-02): implement Dexie schema v1 with entities and service stubs
---

# 01-02 Summary: Dexie Schema v1

## What was done

Executed TDD RED → GREEN → REFACTOR for the Dexie schema v1 feature.

### RED phase
Wrote two failing test files before any implementation:
- `src/db/schema.test.ts` — CATEGORIES array length, exact values/order, readonly type check
- `src/db/db.test.ts` — AppDB opens, all 4 tables defined, form index, *categories multi-entry index, compound [wordFormId+meaningId] index

Tests confirmed failing (import resolution errors — source files didn't exist).

### GREEN phase
Created all implementation files:
- `src/db/schema.ts` — CATEGORIES const (14 values), Category type, 4 entity interfaces (ChildProfile with Phase 2 optional fields, WordForm, Meaning, WordFormMeaning)
- `src/db/db.ts` — AppDB class extending Dexie with all 4 tables and correct Dexie index syntax; db singleton exported
- `src/db/types.ts` — re-exports everything from schema.ts
- `src/db/services/childProfile.service.ts` — saveChildProfile, getChildProfile stubs
- `src/db/services/wordForm.service.ts` — addWordForm, deleteWordForm (with Dexie transaction wrapping cascade delete, canonical Pitfall 5 prevention)
- `src/db/services/meaning.service.ts` — addMeaning, toggleMeaningActive stubs
- `src/db/services/wordFormMeaning.service.ts` — linkMeaning, unlinkMeaning stubs

**Deviation from plan:** Plan stated "fake-indexeddb shim that Dexie bundles — no extra setup needed." This was incorrect for Dexie 4.x + vitest jsdom. Installed `fake-indexeddb` as a dev dependency and imported `fake-indexeddb/auto` at the top of `db.test.ts` to patch globalThis.IndexedDB.

**Deviation from plan:** Dexie index schema uses `multi` property (not `multiEntry`). Corrected test assertion to use `categoriesIndex?.multi`.

### REFACTOR phase
No changes required. Exports were consistent from GREEN. Module singleton pattern for db is correct (JS module cache ensures no re-creation on import).

## Test results

```
Tests  11 passed (11)
Test Files  2 passed (2)
```

`npx tsc --noEmit` exits 0.

## Artifacts created

- `src/db/schema.ts`
- `src/db/db.ts`
- `src/db/types.ts`
- `src/db/services/childProfile.service.ts`
- `src/db/services/wordForm.service.ts`
- `src/db/services/meaning.service.ts`
- `src/db/services/wordFormMeaning.service.ts`
- `src/db/db.test.ts`
- `src/db/schema.test.ts`

## Must-haves verification

- [x] Dexie database opens without error in jsdom test environment
- [x] All 4 tables accessible on db singleton
- [x] CATEGORIES has exactly 14 members with exact values
- [x] Category type is TypeScript union derived from CATEGORIES
- [x] WordFormMeaning has compound index [wordFormId+meaningId]
- [x] meanings has multi-entry *categories index
- [x] deleteWordForm wraps both deletes in Dexie transaction
- [x] ChildProfile includes all 4 Phase 2 optional fields in v1 schema
