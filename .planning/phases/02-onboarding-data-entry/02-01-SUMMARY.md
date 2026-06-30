---
phase: 02-onboarding-data-entry
plan: 01
subsystem: ui
tags: [react-hook-form, zod, date-fns, shadcn, zustand, i18n, react-i18next]

requires:
  - phase: 01-foundation
    provides: Shadcn Button, Zustand store skeleton, i18n index with namespace registration, Tailwind v4 setup

provides:
  - react-hook-form, @hookform/resolvers, zod, date-fns installed as project dependencies
  - Shadcn Sheet, Collapsible, Badge, Calendar, Popover components in src/components/ui/
  - Zustand UIState with addWordSheetOpen and iosInstallPromptSeen state and typed setters
  - Fully-populated i18n locale files (pl + en) for onboarding, addEntry, and settings namespaces

affects:
  - 02-03-onboarding-wizard (OnboardingWizard uses Collapsible, Badge, onboarding namespace)
  - 02-04-add-entry-sheet (AddEntrySheet uses Sheet, Calendar, Popover, addWordSheetOpen store state)
  - 02-05-settings (SettingsPage uses settings namespace from common.json)

tech-stack:
  added:
    - react-hook-form ^7.80.0 — form state management for onboarding and add-entry forms
    - "@hookform/resolvers" ^5.4.0 — Zod resolver for react-hook-form
    - zod ^4.4.3 — schema validation for form data
    - date-fns ^4.4.0 — date formatting for firstUseDate field
    - "@radix-ui/react-dialog" — installed by Shadcn Sheet
    - "@radix-ui/react-collapsible" — installed by Shadcn Collapsible
    - react-day-picker — installed by Shadcn Calendar
    - "@radix-ui/react-popover" — installed by Shadcn Popover
  patterns:
    - Shadcn component generation via `npx shadcn@latest add <component>` — generates local source files, no runtime package dependency
    - Zustand store with typed interface — addWordSheetOpen (boolean) + iosInstallPromptSeen (boolean) with (open: boolean) => void setters
    - i18n nested JSON structure — dot-notation keys become nested objects (field.name -> { field: { name: "..." } })

key-files:
  created:
    - src/components/ui/sheet.tsx — Shadcn Sheet (SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose)
    - src/components/ui/collapsible.tsx — Shadcn Collapsible (Collapsible, CollapsibleContent, CollapsibleTrigger)
    - src/components/ui/badge.tsx — Shadcn Badge (Badge, badgeVariants)
    - src/components/ui/calendar.tsx — Shadcn Calendar (Calendar, CalendarDayButton)
    - src/components/ui/popover.tsx — Shadcn Popover (Popover, PopoverContent, PopoverTrigger)
    - src/i18n/locales/pl/onboarding.json — Polish strings for onboarding wizard
    - src/i18n/locales/en/onboarding.json — English strings for onboarding wizard
  modified:
    - src/stores/ui.store.ts — replaced placeholder with addWordSheetOpen + iosInstallPromptSeen state
    - src/i18n/locales/pl/common.json — added addWord.*, settings.*, profile.edit.* namespaces
    - src/i18n/locales/en/common.json — added addWord.*, settings.*, profile.edit.* namespaces
    - package.json — added react-hook-form, @hookform/resolvers, zod, date-fns

key-decisions:
  - "Used `npx shadcn@latest add <component>` without --overwrite to preserve existing button.tsx (shadcn skipped it correctly)"
  - "UIState is ephemeral (no persist middleware) — sheet open/closed state resets on page reload by design"
  - "onboarding.json uses nested structure for field.*, button.*, error.*, welcome.* keys for readability"

patterns-established:
  - "Shadcn component generation: always use `npx shadcn@latest add <name> --yes` — generates local TSX with correct Radix UI + Tailwind v4 wiring"
  - "Zustand UIState: interface first, then create<UIState>((set) => ({ ... })) — no persist middleware for ephemeral sheet state"
  - "i18n key naming: dot-notation in plan maps to nested JSON objects; useTranslation('namespace') + t('section.key') at component level"

requirements-completed:
  - ENTRY-01
  - ENTRY-03
  - ONBD-01

coverage:
  - id: D1
    description: "react-hook-form, @hookform/resolvers, zod, date-fns installed as dependencies"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "node -e: require('./node_modules/react-hook-form/...') — deps ok"
        status: pass
    human_judgment: false
  - id: D2
    description: "Shadcn Sheet component in src/components/ui/sheet.tsx with SheetContent, SheetHeader, SheetTitle exports"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "ls src/components/ui/ shows sheet.tsx; grep exports: SheetContent, SheetHeader, SheetTitle present"
        status: pass
    human_judgment: false
  - id: D3
    description: "Shadcn Collapsible, Badge, Calendar, Popover components in src/components/ui/"
    requirement: ONBD-01
    verification:
      - kind: unit
        ref: "ls src/components/ui/ — badge.tsx, calendar.tsx, collapsible.tsx, popover.tsx all present with correct exports"
        status: pass
    human_judgment: false
  - id: D4
    description: "Zustand UIState with addWordSheetOpen and iosInstallPromptSeen boolean state and typed setters"
    requirement: ENTRY-01
    verification:
      - kind: unit
        ref: "npx tsc --noEmit exits 0; grep addWordSheetOpen src/stores/ui.store.ts finds field"
        status: pass
    human_judgment: false
  - id: D5
    description: "pl/onboarding.json and en/onboarding.json populated with title, subtitle, field.*, button.*, welcome.*, error.* keys"
    requirement: ONBD-01
    verification:
      - kind: unit
        ref: "node -e: JSON.parse locale files — all keys present (title, welcome.title, error.nameRequired verified)"
        status: pass
    human_judgment: false
  - id: D6
    description: "pl/common.json and en/common.json extended with addWord.*, settings.*, profile.edit.* namespaces"
    requirement: ENTRY-03
    verification:
      - kind: unit
        ref: "node -e: JSON.parse common files — addWord.title, settings.title, profile.edit.title all verified"
        status: pass
    human_judgment: false
  - id: D7
    description: "All 28 existing tests pass; TypeScript compiles clean; production build succeeds"
    verification:
      - kind: unit
        ref: "npm test — 5 test files, 28 tests passed"
        status: pass
      - kind: unit
        ref: "npx tsc --noEmit — exit 0 (no output)"
        status: pass
      - kind: unit
        ref: "npm run build — vite build succeeded, 1836 modules transformed"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-06-30
status: complete
---

# Phase 02 Plan 01: Foundation Setup Summary

**react-hook-form + zod + date-fns installed; 5 Shadcn components scaffolded; Zustand UIState extended; i18n locale files fully populated for onboarding, add-entry, and settings (pl + en)**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-30T21:01:41Z
- **Completed:** 2026-06-30T21:11:30Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Installed react-hook-form ^7.80.0, @hookform/resolvers ^5.4.0, zod ^4.4.3, date-fns ^4.4.0 via npm
- Added 5 Shadcn UI components: Sheet, Collapsible, Badge, Calendar, Popover (auto-generated with Radix UI + Tailwind v4 wiring)
- Extended Zustand UIState: replaced `_placeholder` with `addWordSheetOpen` and `iosInstallPromptSeen` boolean state + typed setters
- Populated pl/onboarding.json and en/onboarding.json with full wizard string sets (title, field.*, button.*, chips.*, welcome.*, error.*)
- Extended pl/common.json and en/common.json with addWord.*, settings.*, and profile.edit.* namespaces (all existing keys retained)
- All 28 tests pass; TypeScript compiles clean; production build succeeds (449 kB JS bundle, 6.87s build time)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install form dependencies and add Shadcn UI components** - `a3f39e7` (feat)
2. **Task 2: Extend Zustand UIState with add-entry sheet state** - `3816242` (feat)
3. **Task 3: Populate i18n locale files for Phase 2 features** - `c8e72b4` (feat)

## Files Created/Modified

- `src/components/ui/sheet.tsx` - Shadcn Sheet: SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose
- `src/components/ui/collapsible.tsx` - Shadcn Collapsible: Collapsible, CollapsibleContent, CollapsibleTrigger
- `src/components/ui/badge.tsx` - Shadcn Badge: Badge, badgeVariants
- `src/components/ui/calendar.tsx` - Shadcn Calendar: Calendar, CalendarDayButton
- `src/components/ui/popover.tsx` - Shadcn Popover: Popover, PopoverContent, PopoverTrigger
- `src/stores/ui.store.ts` - UIState with addWordSheetOpen, iosInstallPromptSeen, setAddWordSheetOpen, setIosInstallPromptSeen
- `src/i18n/locales/pl/onboarding.json` - Full Polish onboarding strings (23 keys in 6 nested sections)
- `src/i18n/locales/en/onboarding.json` - Full English onboarding strings (23 keys in 6 nested sections)
- `src/i18n/locales/pl/common.json` - Extended with addWord (10 keys), settings (11 keys), profile.edit (2 keys)
- `src/i18n/locales/en/common.json` - Extended with addWord (10 keys), settings (11 keys), profile.edit (2 keys)
- `package.json` - Added react-hook-form, @hookform/resolvers, zod, date-fns

## Decisions Made

- Used `npx shadcn@latest add <component> --yes` for all 5 components — generates local TSX with correct Radix UI + Tailwind v4 wiring; no manual component authoring required
- Calendar add skipped overwriting button.tsx (files are identical — expected behavior, not an error)
- UIState is ephemeral (no Zustand persist middleware) — addWordSheetOpen resets on page reload by design (sheet closed state is the correct default)
- onboarding.json uses nested structure (field.name, button.getStarted, welcome.title) for grouping readability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — all npm installs and Shadcn commands completed cleanly. The `shadcn add calendar` command correctly skipped overwriting the existing button.tsx.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 02-02 (service layer), 02-03 (onboarding wizard), 02-04 (add-entry sheet), 02-05 (settings) can all proceed
- Sheet component ready for AddEntrySheet (Plan 04)
- Collapsible ready for MedicalContextSection (Plan 03)
- Badge ready for CategoryChips (Plan 04) and LanguageChips (Plan 03)
- addWordSheetOpen state ready for AddEntryFAB (Plan 04)
- onboarding namespace ready for OnboardingWizard (Plan 03)
- No blockers

## Self-Check: PASSED

- `src/components/ui/sheet.tsx` — FOUND
- `src/components/ui/collapsible.tsx` — FOUND
- `src/components/ui/badge.tsx` — FOUND
- `src/components/ui/calendar.tsx` — FOUND
- `src/components/ui/popover.tsx` — FOUND
- `src/stores/ui.store.ts` addWordSheetOpen — FOUND
- `src/i18n/locales/pl/onboarding.json` title — FOUND
- `src/i18n/locales/en/onboarding.json` title — FOUND
- Commits a3f39e7, 3816242, c8e72b4 — FOUND in git log

---
*Phase: 02-onboarding-data-entry*
*Completed: 2026-06-30*
