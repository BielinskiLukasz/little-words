---
plan: 01-03
phase: 01-foundation
status: complete
completed: 2026-06-30
commits:
  red: e951fd8
  green: d11092f
  refactor: (no diff — implementation already clean from GREEN)
---

# Summary: 01-03 react-i18next Initialization

## What was done

Executed the full RED → GREEN → REFACTOR TDD cycle for the i18n initialization feature.

### RED phase
- Created `src/i18n/i18n.test.ts` with 9 behavior assertions covering:
  - Default Polish language on first launch (no localStorage)
  - Polish nav/app/error key translation lookup
  - All 3 Polish plural forms (_one, _few, _many) — SUCCESS CRITERION 3
  - localStorage English preference via `i18n.changeLanguage('en')`
- Tests failed as expected (module did not exist)
- Commit: `e951fd8 test(01-03): add failing tests for i18n initialization`

### GREEN phase
- Created directory structure: `src/i18n/locales/pl/` and `src/i18n/locales/en/`
- Wrote 4 locale files:
  - `en/common.json` — English labels; `meaning_one` / `meaning_other` keys
  - `pl/common.json` — Polish labels; all 4 plural keys (`meaning_one`, `meaning_few`, `meaning_many`, `meaning_other`)
  - `en/onboarding.json` — empty object (Phase 2 fills)
  - `pl/onboarding.json` — empty object (Phase 2 fills)
- Wrote `src/i18n/index.ts`:
  - Static imports of all 4 locale files (offline-safe, no network fetch)
  - `LANG_KEY = 'little-words-lang'` named constant
  - localStorage validation: accepts only `'pl'` or `'en'`, falls back to `'pl'`
  - `i18n.use(initReactI18next).init(...)` with `fallbackLng: 'pl'` (D-05)
  - Exports both `LANG_KEY` and `i18n` (default)
- Wrote `src/i18n/i18n.d.ts`: TypeScript `CustomTypeOptions` augmentation using English JSON as type source
- All 9 tests passed on first run
- Commit: `d11092f feat(01-03): implement react-i18next with Polish default and locale files`

### REFACTOR phase
- No changes needed — implementation was already clean from GREEN:
  - `LANG_KEY` defined once as named constant
  - localStorage validation is a single clean guard expression
  - No string literals repeated

## Test results

```
Tests  9 passed (9)
  ✓ default language → i18n.language === 'pl'
  ✓ nav.dashboard → 'Pulpit'
  ✓ nav.dashboard is non-empty string
  ✓ app.name → 'Słówko'
  ✓ errors.somethingWentWrong is non-empty string
  ✓ meaning count=1 → 'znaczenie'   (Polish _one)
  ✓ meaning count=2 → 'znaczenia'   (Polish _few) — SUCCESS CRITERION 3
  ✓ meaning count=5 → 'znaczeń'     (Polish _many)
  ✓ localStorage 'en' → i18n.language === 'en', nav.dashboard === 'Dashboard'
```

Full suite: **20 passed (20)** — db tests unaffected.
`npx tsc --noEmit` — exit 0, no errors.

## Key decisions implemented

- **D-05**: Polish is BOTH default AND fallback — `fallbackLng: 'pl'`
- **D-06**: Language stored in `localStorage` key `'little-words-lang'`
- **T-03-01 mitigation**: localStorage value validated before use — only `'pl'` or `'en'` accepted
- **T-03-02 accepted**: Locale JSON files are static imports (bundled at build time — no runtime JSON.parse risk)
- **T-03-03 mitigation**: TypeScript augmentation in `i18n.d.ts` catches unknown keys at compile time

## Files created

- `src/i18n/index.ts` — i18next init module
- `src/i18n/i18n.d.ts` — TypeScript key augmentation
- `src/i18n/i18n.test.ts` — test suite (9 tests)
- `src/i18n/locales/en/common.json` — English translations
- `src/i18n/locales/en/onboarding.json` — empty placeholder
- `src/i18n/locales/pl/common.json` — Polish translations (4 plural keys)
- `src/i18n/locales/pl/onboarding.json` — empty placeholder

## Next steps (Wave 4, Plan 01-04)

`src/main.tsx` must import `src/i18n/index.ts` before React mounts — this is noted in the plan's `must_haves.key_links` and will be enforced in Plan 01-04 (router + App shell).
