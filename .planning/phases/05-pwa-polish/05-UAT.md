---
status: testing
phase: 05-pwa-polish
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md]
started: 2026-08-31T21:00:00Z
updated: 2026-08-31T21:00:00Z
---

## Current Test

number: 4
name: SW update toast — new version deployed
expected: |
  Deploy the current build. Open app and confirm SW installs. Push a trivial
  change to main and wait for GitHub Actions deploy. Return to the tab.
  "Nowa wersja dostępna" / "New version available" persistent toast appears
  with "Odśwież" / "Refresh" button. Tapping Refresh reloads to the new bundle.
awaiting: user response

## Tests

### 1. Visual icon quality
expected: Open the four PNG files in public/icons/: icon-192.png, icon-512.png, apple-touch-icon.png, icon-512-maskable.png. All icons show a teal (#0D9488) background filling the entire canvas. White "LW" text is centered and clearly legible at all sizes. The maskable icon has no padding — teal bleeds to all edges.
result: pass

### 2. Offline capability after first load
expected: Open the deployed app. Wait 10–15 seconds for the service worker to install. Enable Airplane Mode. Navigate to all main screens (Dashboard, Meanings, Word Forms, Timeline, Settings). Try adding a new word entry. All screens render without errors; IndexedDB entries persist; no "network error" messages.
result: pass

### 3. PWA installability on Android Chrome and iOS Safari
expected: Android — open app in Chrome, install prompt or install icon appears in address bar; app launches in standalone mode (no browser chrome). iOS — Safari Share → Add to Home Screen → Add; app launches from home screen icon in standalone mode with teal splash screen.
result: pass

### 4. SW update toast — new version deployed
expected: Deploy the current build. Open app and confirm SW installs. Push a trivial change to main and wait for GitHub Actions deploy. Return to the tab. "Nowa wersja dostępna" / "New version available" persistent toast appears with "Odśwież" / "Refresh" button. Tapping Refresh reloads to the new bundle.
result: [pending]

### 5. CI/CD: automated deploy fires on push to main
expected: Push a commit to the main branch. GitHub Actions runs the deploy workflow automatically: checkout → Node 22 → npm ci → lint → test → build → deploys dist/ to gh-pages. Deployment completes successfully and the updated app is live at the GitHub Pages URL.
result: [pending]

### 6. registerType 'prompt' in vite.config.ts
expected: SW update waits for user consent (registerType: 'prompt')
result: pass
source: automated
coverage_id: D1

### 7. Manifest branding: theme_color '#0D9488', background_color '#0D9488', short_name 'Little Words', privacy-first description
expected: Manifest branding fields correctly set
result: pass
source: automated
coverage_id: D2

### 8. pwa.updateAvailable and pwa.refresh i18n keys present in both pl/en locale files
expected: i18n keys present in both locales
result: pass
source: automated
coverage_id: D3

### 9. useRegisterSW wired in App.tsx; onNeedRefresh fires persistent Sonner toast with Refresh action
expected: SW update hook fully wired end-to-end
result: pass
source: automated
coverage_id: D4

### 10. npm run build passes with sw.js and manifest.webmanifest in dist/
expected: Build succeeds; SW and manifest generated
result: pass
source: automated
coverage_id: D5

### 11. public/icons/ contains 4 PNG files with correct dimensions
expected: icon-192.png 2295B, icon-512.png 6918B, apple-touch-icon.png 2160B, icon-512-maskable.png 6918B
result: pass
source: automated
coverage_id: D1-02

### 12. manifest.icons array has 4 entries with correct sizes, purposes (separate any/maskable), and /little-words/ prefixed src paths
expected: 4 icons in manifest with correct purpose split
result: pass
source: automated
coverage_id: D3-02

### 13. npm run build and npm run test both pass after all changes (128 tests)
expected: 128 tests passing; build exits 0
result: pass
source: automated
coverage_id: D4-02

## Summary

total: 13
passed: 11
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps

[none yet]
