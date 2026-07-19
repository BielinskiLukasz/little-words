---
status: complete
phase: 01-foundation
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md]
started: 2026-07-15T00:00:00Z
updated: 2026-07-19T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. From the project root, run `npm run dev` from scratch. Server boots without errors. Open http://localhost:5173/little-words/ in the browser — the app loads (no blank screen, no console errors on initial load).
result: pass (after fix)
reported: "I have no errors, but text in text fields and buttons on hello setup screen is barely visible. We need to fix that"
fixed: "Added @theme inline block to src/index.css; added text-gray-900 bg-white to raw inputs in onboarding components"
severity: major

### 2. App Loads at /little-words/ Base Path
expected: Navigating to http://localhost:5173/little-words/ (or http://localhost:5173/little-words/#/) shows the app — either the Onboarding screen or the Dashboard. No 404, no blank screen, no "Cannot GET" error.
result: pass

### 3. Polish Default Language
expected: On a fresh visit (no prior language setting), all visible labels render in Polish — e.g. bottom nav shows "Pulpit", "Znaczenia", "Formy słów", "Więcej" without any language change by the user.
result: pass

### 4. Bottom Navigation — 4 Tabs Visible
expected: A 4-tab bottom navigation bar is visible at the bottom of the screen with tabs in Polish: Pulpit (Dashboard), Znaczenia (Meanings), Formy słów (Word Forms), and Więcej (More). Each tab has an icon.
result: pass

### 5. Hash Routing — Tab Navigation
expected: Tapping each bottom nav tab changes the URL to its hash route (/#/dashboard, /#/meanings, /#/word-forms, /#/more) and shows the corresponding stub page. Browser back/forward navigation works between tabs.
result: pass

### 6. Onboarding Gate (No Profile)
expected: On a fresh browser session with no previously saved profile (e.g. in a clean private/incognito tab), the app shows the Onboarding page rather than the main dashboard. The bottom nav is NOT visible on the onboarding screen.
result: pass

### 7. Dark Mode Theme
expected: When the OS or browser is set to dark mode, the app automatically switches to a dark color scheme. No manual toggle is required — it follows system preference.
result: issue
reported: "nope"
severity: major

## Summary

total: 7
passed: 6
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Text in input fields and buttons on the onboarding screen is clearly readable"
  status: failed
  reason: "User reported: text in text fields and buttons on hello setup screen is barely visible"
  severity: major
  test: 1
  root_cause: "Two causes: (1) src/index.css was missing the @theme inline block required by Tailwind v4 — without it, CSS variable-based utility classes like bg-primary, text-primary-foreground, border-input, ring-ring silently do nothing; (2) raw <input> and <textarea> elements had no explicit text color and inherited near-white body foreground in dark mode against white browser-default backgrounds."
  fix: "Added @theme inline block to src/index.css mapping all --color-* tokens. Added color-scheme: light/dark to :root. Added text-gray-900 bg-white to raw inputs in OnboardingWizard.tsx, LanguageChips.tsx, and MedicalContextSection.tsx. Removed global disabled:opacity-50 from button base and added explicit disabled:bg-gray-200 disabled:text-gray-500 to default variant in button.tsx — disabled state near-white text was invisible on white footer background."
  artifacts: ["src/index.css", "src/features/onboarding/components/OnboardingWizard.tsx", "src/features/onboarding/components/LanguageChips.tsx", "src/features/onboarding/components/MedicalContextSection.tsx", "src/components/ui/button.tsx"]
  missing: []

- truth: "App automatically switches to dark color scheme when OS/browser dark mode is active"
  status: failed
  reason: "User reported: nope"
  severity: major
  test: 7
  root_cause: "src/index.css line 67 had `color-scheme: light` (not `light dark`) — this told the browser only light mode is supported, preventing the @media (prefers-color-scheme: dark) block (lines 70–93) from ever activating even though all dark variables were defined."
  fix: "Changed `color-scheme: light` to `color-scheme: light dark` in src/index.css:67"
  artifacts:
    - path: "src/index.css"
      issue: "color-scheme: light — missing 'dark' keyword blocked the prefers-color-scheme media query"
  missing: []
  debug_session: ".planning/debug/resolved/dark-mode-not-auto-switching.md"
