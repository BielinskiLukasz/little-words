# Milestones

## v1.0 MVP (Shipped: 2026-09-18)

**Phases completed:** 9 phases, 37 plans, 54 tasks

**Key accomplishments:**

- react-hook-form + zod + date-fns installed; 5 Shadcn components scaffolded; Zustand UIState extended; i18n locale files fully populated for onboarding, add-entry, and settings (pl + en)
- Atomic Dexie service layer with case-insensitive find-or-create, prefix autocomplete, idempotent junction inserts, and addWordEntry orchestrator; 55 tests pass (up from 28)
- Full onboarding vertical slice: react-hook-form wizard with language chips, collapsible medical context, welcome screen with animated checkmark, and ProfileEditPage at /#/profile/edit — 61 tests pass, TypeScript clean, build succeeds
- FAB + bottom sheet word-entry form: floating action button in RootLayout opens a 90dvh Shadcn Sheet with word form input (debounced existing-meanings preview), meaning autocomplete (startsWithIgnoreCase, limit 10), horizontal category chips (14 CATEGORIES, multi-select), multi-meaning rows, and save via addWordEntry service
- Settings page with Language/Profile/Data/About sections, iOS Add-to-Home-Screen prompt triggered after first word save, and DashboardPage child name greeting — completing Phase 2
- existingMeaningId wired UI->service with dedup branch, save errors surfaced via role=alert, addWordEntry wrapped in db.transaction
- Calendar day cells use flex-1 for even spacing; add-entry sheet closes unconditionally via finally block with empty-meaning guard removed.
- Doctor Report page with auto-generated plain-text report, Sonner toast copy confirmation, and 28-test TDD suite covering all edge cases.
- Full data portability — JSON backup/restore with Dexie transaction safety, CSV meanings export, and import error differentiation (corrupt vs wrong-schema-version) using TDD-verified pure service functions.
- PWA update prompt wired end-to-end: registerType 'prompt' + useRegisterSW persistent Sonner toast + manifest teal branding (#0D9488)
- Four PWA icon PNGs generated from SVG source using @resvg/resvg-js WASM rasterizer; manifest.icons array populated with correct size/purpose entries including separate maskable entry
- GitHub Actions workflow with lint+test gate deploying to gh-pages via peaceiris/actions-gh-pages@v4 on push to main only.
- Dexie schema upgraded to v3 adding pair-level metadata (firstObservationDate/lastUsedDate/isActive to WordFormMeaning) with five new service functions and Meaning aggregation on every pair write
- Added all Phase 6 i18n keys to pl/en locale files and wrapped Dashboard stat cards in React Router Links for D-17 navigation.
- MeaningDetailPage fully rewritten with inline edit for text/categories, per-pair Collapsible rows with input[type=date] and isActive Switch, category i18n fix, and read-only derived isActive Badge.
- WordFormDetailPage extended with inline edit for word form text and per-pair Collapsible rows with input[type=date] and isActive Switch navigating to /meanings/:id, mirroring the MeaningDetailPage pattern from Plan 03.
- PairsPage created at /#/pairs with Collapsible dual-chip rows (word form + meaning navigation chips), sort selector, and empty state; BottomNav updated to 5 tabs with GitBranch icon; /pairs route wired in router.
- Four report enhancements via strict TDD — age uses `yearsMonths` format, per-category meaning list with word-form counts, recent additions section, and recently-forgotten inactive section.
- Reworded `settings.importErrorDescriptionVersion` in both locales from "this backup is from a newer version" (factually backwards for a rejected legacy v2 backup) to a version-direction-neutral "made with a different version of the app."
- validateBackupData now rejects any backup whose childProfile array isn't exactly length 1, and importData surfaces this as a distinct `invalid-child-profile-count` error (not the generic `corrupt`) with its own parent-facing message in both locales, checked before any table is cleared.
- Closed the cross-phase documentation gap from the v1.0 milestone audit: REQUIREMENTS.md now tracks all 31 v1+PREREL requirements, and 12 phase SUMMARY.md files gained their missing requirements-completed frontmatter.
- Fixed the self-contradictory `**Status:** human_needed` body line in 05-VERIFICATION.md and 06-VERIFICATION.md to read `passed`, matching their already-correct frontmatter.
- importData's specific-error pre-check now fires for missing/null/non-array childProfile, not only wrong-length arrays — closing code review finding WR-01, the last gap from 06.3-VERIFICATION.md

**Known verification overrides:** 1 newly acknowledged, 0 carried forward from a prior close (see STATE.md Deferred Items) — a scanner false positive (`.planning/debug/knowledge-base.md`, a static reference doc misclassified as an open debug session) was acknowledged at close. No functional gaps were overridden: phases 01, 03, and 04 were re-verified fresh after a documentation-only frontmatter backfill triggered a staleness flag, and all re-verifications passed cleanly with no code changes required.

---
