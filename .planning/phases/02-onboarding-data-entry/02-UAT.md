---
status: complete
phase: 02-onboarding-data-entry
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md]
started: 2026-07-19T00:00:00Z
updated: 2026-07-20T00:00:00Z
---

## Current Test

none — all 11 tests complete

## Tests

### 1. Onboarding Wizard — fill and submit
expected: Open the app in a fresh private/incognito tab (no profile). Fill in child name, pick a birth date, select at least one language chip, then tap "Get started". Expected: welcome screen with animated checkmark appears, then auto-redirects to Dashboard after ~2 seconds.
result: pass (after fix)
reported: "I cannot click get started until i click medical context (even without add any). I should click get started without clicking medical context."
fixed: "Called field.onBlur() after each chip change in LanguageChips.tsx so that react-hook-form validates the languages field on chip selection (mode: 'onBlur' only validates on blur events; chips only fired onChange)"

### 2. Dashboard — child name greeting
expected: After completing onboarding, the Dashboard shows a greeting that includes the child's name you entered. (Not a generic "coming soon" stub — a real greeting with the name.)
result: pass
note: "line below name is partially visible or read it too slowly — likely the WelcomeScreen subtitle flashing past in 2 seconds before redirect"

### 3. Add Entry FAB — visible and opens sheet
expected: From the Dashboard (or any main tab), a floating action button (FAB) is visible at the bottom-right of the screen, above the bottom navigation bar. Tapping it opens a bottom sheet that slides up from the bottom, taking up roughly 90% of the screen height.
result: pass

### 4. Add Entry — word form input with existing-meanings preview
expected: In the Add Entry sheet, type a word in the "Word form" field (e.g. "mama"). After a brief pause (~0.5s), if that word was previously saved, a preview of its existing meanings should appear below the input. For a first entry there will be no preview — that is expected.
result: pass

### 5. Add Entry — meaning autocomplete dropdown
expected: After saving at least one entry (Test 4 above), open the Add Entry sheet again and start typing in the meaning text field. Type the first letter(s) of a meaning you previously saved. A dropdown of suggestions should appear below the field. Selecting a suggestion fills the meaning field.
result: issue
reported: "dropdown list have white color in dark mode so text isn't visible"
severity: major
fixed: "Replaced hardcoded bg-white/border-gray-200/hover:bg-gray-50 with bg-background/border-border/hover:bg-muted/text-foreground CSS variable utilities in MeaningAutocomplete.tsx"

### 6. Add Entry — category chips horizontal scroll
expected: In the Add Entry sheet, the category chips row (below the meaning text field) shows multiple category badges. If there are more chips than fit on screen, you can scroll horizontally to see all 14 categories. Tapping a chip selects/deselects it (badge appearance changes).
result: issue
reported: "all have only english values. switching to polish dont change them"
severity: minor
fixed: "Added category.* translation keys to en/common.json and pl/common.json; updated CategoryChips.tsx to use t(`category.${cat}`) instead of rendering raw schema constant"

### 7. Add Entry — save entry successfully
expected: Fill in the Add Entry sheet (word form + at least one meaning), then tap Save. The sheet closes. No error message appears. If you reopen the sheet and type the same word form, the existing-meanings preview should now show the meaning you just saved.
result: pass

### 8. Settings — page shows 4 sections
expected: Navigate to the Settings tab (the "More" tab in the bottom nav). The Settings page shows four distinct sections: Language, Profile, Data, and About. The Language section has PL/EN toggle buttons. The Profile section has an "Edit Profile" link. The Data section has disabled rows (Export JSON, Import JSON, Export CSV) marked as "Coming Soon". The About section shows the app name and a version number.
result: pass

### 9. Settings — language switcher (PL → EN)
expected: In the Settings page, tap the "EN" button in the Language section. The UI labels across the app should switch to English immediately — no page reload or save button needed. Tap "PL" to switch back.
result: pass

### 10. Settings — Profile Edit navigation
expected: In the Settings page, tap the "Edit Profile" link. The app navigates to the Profile Edit page (URL becomes /#/profile/edit). The form is pre-filled with the child's name, birth date, and language choices from onboarding. Editing and saving navigates back without an alert.
result: pass

### 11. Onboarding — Medical Context section collapses/expands
expected: On the Onboarding screen (visible in a fresh private/incognito tab), there is a "Medical context" section that is collapsed by default. Tapping it expands to reveal three checkboxes (premature birth, speech therapy, neurological care) and a notes textarea. Tapping again collapses it.
result: pass

## Summary

total: 11
passed: 10
issues: 3
pending: 0
skipped: 0
blocked: 0

## Gaps

<!-- Filled when issues are found -->
