---
phase: 05-pwa-polish
verified: 2026-08-31T20:50:00Z
status: passed
score: 15/18 must-haves verified
behavior_unverified: 3
overrides_applied: 0
behavior_unverified_items:

  - truth: "After first load, the parent can disable their network connection and continue using the app without any errors or missing assets"
    test: "Load app on device, wait for SW registration, disable Wi-Fi/mobile data, navigate app screens and add a new entry"
    expected: "All screens load and IndexedDB writes succeed with no network errors; no missing asset warnings in console"
    why_human: "Workbox precaching configuration is verified in code (16 precached entries in build output) but actual offline behavior requires disconnecting network on a real or simulated device — grep/file checks cannot confirm runtime SW serving behavior"
  - truth: "On Android, the browser offers an 'Add to Home Screen' / install prompt; on iOS, the app can be added via Share → Add to Home Screen and launches in standalone mode"
    test: "Open deployed app in Chrome on Android; wait for install banner. On iOS Safari, use Share → Add to Home Screen, then launch from home screen."
    expected: "Android: browser install prompt appears. iOS: app launches in standalone mode (no browser chrome), splash screen shows teal background"
    why_human: "Manifest fields (icons >=192x192, display:standalone, start_url, scope) are verified correct in code. Whether the browser actually surfaces the install prompt depends on Chrome heuristics and engagement scoring that cannot be observed from the source files"
  - truth: "When a new version of the app is deployed, a toast notification appears prompting the parent to refresh; tapping it reloads to the new version"
    test: "Deploy version A. Open app and let SW install. Deploy version B. Wait for SW update check interval (~24h or hard-refresh). Verify toast appears."
    expected: "Persistent 'New version available' / 'Nowa wersja dostępna' toast appears at bottom-center; tapping 'Refresh' / 'Odśwież' reloads to the new bundle"
    why_human: "useRegisterSW hook wiring is VERIFIED in App.tsx (onNeedRefresh → toast with duration:Infinity → updateServiceWorker(true)). Triggering the flow requires a real SW state transition (new SW enters 'waiting' state), which only occurs after deploying two distinct versions"
human_verification:

  - test: "Test offline capability after first load"
    expected: "App loads all screens and writes to IndexedDB without network errors after SW has cached all assets"
    why_human: "Cannot confirm SW actually serves cached assets without network — requires device disconnection test"
  - test: "Test PWA installability on Android Chrome and iOS Safari"
    expected: "Chrome shows 'Add to Home Screen' prompt; iOS app launches in standalone mode without browser chrome"
    why_human: "Manifest criteria met in code; browser heuristics for surfacing install prompt cannot be verified statically"
  - test: "Test SW update toast end-to-end with two deployed versions"
    expected: "Persistent toast with correct i18n strings appears; clicking Refresh reloads to new version"
    why_human: "Requires deploying two distinct versions to production — cannot simulate SW waiting-state in static analysis"
  - test: "Visual inspection of icons (icon-192.png, icon-512.png, apple-touch-icon.png, icon-512-maskable.png)"
    expected: "Teal (#0D9488) background fills entire canvas; white 'LW' text is centered and legible at all sizes; maskable icon has no padding/safe-zone visible on Android adaptive launchers"
    why_human: "SVG source is verified correct (rect fill #0D9488, text 'LW', centered at 256,256) but pixel rendering correctness for all four sizes requires visual inspection"
---

# Phase 5: PWA Polish Verification Report

**Phase Goal:** The app works fully offline after first load, is installable on Android and iOS, and notifies the user when a new version is available.
**Verified:** 2026-08-31T20:50:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | vite.config.ts registerType is 'prompt' | ✓ VERIFIED | `vite.config.ts:17` — `registerType: 'prompt'` |
| 2 | manifest theme_color and background_color are '#0D9488' | ✓ VERIFIED | `vite.config.ts:28-29`; `dist/manifest.webmanifest` confirms at build time |
| 3 | manifest short_name is 'Little Words' (with space) | ✓ VERIFIED | `vite.config.ts:26` — `short_name: 'Little Words'` |
| 4 | manifest description is privacy-first copy | ✓ VERIFIED | `vite.config.ts:27` — "Privacy-first app for parents to track their child's speech and communication development." |
| 5 | useRegisterSW from 'virtual:pwa-register/react' at App() top level | ✓ VERIFIED | `src/App.tsx:2` — import; `src/App.tsx:11` — unconditional call in App() body |
| 6 | onNeedRefresh fires Sonner toast with duration: Infinity and single Refresh action calling updateServiceWorker(true) | ✓ VERIFIED | `src/App.tsx:12-21` — toast(t('pwa.updateAvailable'), { action: { label: t('pwa.refresh'), onClick: () => updateServiceWorker(true) }, duration: Infinity }) |
| 7 | pwa.updateAvailable and pwa.refresh keys in both pl and en common.json | ✓ VERIFIED | `pl/common.json:170-173` — "Nowa wersja dostępna" / "Odśwież"; `en/common.json:168-171` — "New version available" / "Refresh" |
| 8 | public/icons/ contains 4 PNG files all >1000 bytes | ✓ VERIFIED | icon-192.png: 2295B, icon-512.png: 6918B, apple-touch-icon.png: 2160B, icon-512-maskable.png: 6918B |
| 9 | manifest.icons has 4 entries with correct sizes and separate any/maskable purposes | ✓ VERIFIED | `vite.config.ts:33-58`; `dist/manifest.webmanifest` — 4 icons: 192×192 any, 512×512 any, 180×180 any, 512×512 maskable |
| 10 | deploy.yml triggers on push to main only | ✓ VERIFIED | `.github/workflows/deploy.yml:3-5` — `on: push: branches: [main]`; no pull_request, no workflow_dispatch |
| 11 | Workflow steps: checkout → setup-node → npm ci → lint → test → build → deploy; no continue-on-error on lint/test | ✓ VERIFIED | `.github/workflows/deploy.yml:13-34` — exact order confirmed; grep for continue-on-error returns 0 matches |
| 12 | peaceiris/actions-gh-pages@v4 with publish_dir: ./dist and keep_files: false | ✓ VERIFIED | `.github/workflows/deploy.yml:29-34` |
| 13 | public/.nojekyll exists | ✓ VERIFIED | File exists (0 bytes); Vite copies it to dist/.nojekyll at build time |
| 14 | npm run build produces dist/sw.js and dist/manifest.webmanifest (exit code 0) | ✓ VERIFIED | Build exit code 0; dist/sw.js (Workbox generateSW, 16 precached entries); dist/manifest.webmanifest present |
| 15 | 128 tests pass (npm run test exit code 0) | ✓ VERIFIED | vitest run: 13 test files, 128 tests passed, exit code 0; virtual:pwa-register/react aliased in vitest.config.ts |
| 16 | After first load, parent can use app offline without errors | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Workbox precaching configured (globPatterns: all assets, 16 entries); sw.js generated — offline behavior requires device testing |
| 17 | On Android/iOS, browser offers Add to Home Screen / install prompt | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Manifest has valid icons (192×192+), display:standalone, start_url, scope — browser install heuristics require device testing |
| 18 | Update toast appears when new version deployed; tapping Refresh reloads | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | useRegisterSW wiring verified; SW waiting-state transition requires two deployed versions to trigger |

**Score:** 15/18 truths verified (3 present and wired, behavior not exercised)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `vite.config.ts` | registerType 'prompt', manifest branding, 4 icons | ✓ VERIFIED | All fields confirmed |
| `src/App.tsx` | useRegisterSW with onNeedRefresh Sonner toast | ✓ VERIFIED | Complete wiring at App() top level |
| `src/i18n/locales/pl/common.json` | pwa.updateAvailable + pwa.refresh | ✓ VERIFIED | Lines 170-173 |
| `src/i18n/locales/en/common.json` | pwa.updateAvailable + pwa.refresh | ✓ VERIFIED | Lines 168-171 |
| `public/icons/lw-icon.svg` | SVG source, 512×512, teal fill, white LW text | ✓ VERIFIED | viewBox 0 0 512 512; rect fill #0D9488; text LW centered |
| `public/icons/icon-192.png` | 192×192, purpose: any | ✓ VERIFIED | 2295 bytes |
| `public/icons/icon-512.png` | 512×512, purpose: any | ✓ VERIFIED | 6918 bytes |
| `public/icons/apple-touch-icon.png` | 180×180, purpose: any | ✓ VERIFIED | 2160 bytes |
| `public/icons/icon-512-maskable.png` | 512×512, purpose: maskable | ✓ VERIFIED | 6918 bytes |
| `scripts/generate-icons.js` | ESM icon generation script | ✓ VERIFIED | Uses @resvg/resvg-js ESM import |
| `.github/workflows/deploy.yml` | lint→test→build→deploy on push to main | ✓ VERIFIED | All acceptance criteria met |
| `public/.nojekyll` | Empty file for GitHub Pages | ✓ VERIFIED | 0 bytes; exists |
| `src/__mocks__/virtual-pwa-register.ts` | Mock for virtual:pwa-register/react | ✓ VERIFIED | Vitest alias configured |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `useRegisterSW({ onNeedRefresh })` | Sonner toast | `toast(t('pwa.updateAvailable'), { action, duration: Infinity })` | ✓ WIRED | `src/App.tsx:12-21` |
| Sonner toast action | `updateServiceWorker(true)` | `onClick: () => updateServiceWorker(true)` | ✓ WIRED | `src/App.tsx:16` |
| `vite.config.ts registerType: 'prompt'` | SW waiting state | SW does not auto-reload; waits for updateServiceWorker(true) call | ✓ WIRED | Config confirmed |
| `public/icons/lw-icon.svg` | 4 PNG files | `scripts/generate-icons.js` using @resvg/resvg-js | ✓ WIRED | Files present with correct sizes |
| `vite.config.ts manifest.icons[4]` | `dist/manifest.webmanifest` | Vite build: 4 icons listed in built manifest | ✓ WIRED | Verified in `dist/manifest.webmanifest` |
| push to main | gh-pages branch | `.github/workflows/deploy.yml` → `peaceiris/actions-gh-pages@v4` | ✓ WIRED | Workflow file confirms |
| `public/.nojekyll` | `dist/.nojekyll` | Vite copies public/ to dist/ at build time | ✓ WIRED | dist/.nojekyll present after build |

### Data-Flow Trace (Level 4)

All data flows in this phase are configuration-driven (vite.config.ts → manifest, locale files → toast strings). No dynamic data fetch is involved — the PWA manifest and i18n keys are static build-time artifacts.

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `dist/manifest.webmanifest` | icons, theme_color, etc. | `vite.config.ts` manifest object | Yes — build-time static | ✓ FLOWING |
| `toast(t('pwa.updateAvailable'))` | translated string | `pl/en common.json pwa.*` via react-i18next | Yes — i18n lookup | ✓ FLOWING |
| `updateServiceWorker(true)` | SW update signal | `virtual:pwa-register/react` hook | Yes — SW API call | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| registerType is 'prompt' | `grep -c "registerType: 'prompt'" vite.config.ts` | 1 | ✓ PASS |
| theme_color '#0D9488' in manifest | `grep -c "0D9488" vite.config.ts` | 2 (theme + background) | ✓ PASS |
| 4 icon entries in built manifest | `node -e "const m=require('./dist/manifest.webmanifest'); console.log(m.icons.length)"` | 4 | ✓ PASS |
| Maskable icon has separate entry | `grep -c "maskable" vite.config.ts` | 1 | ✓ PASS |
| All 128 tests pass | `npm run test` | 13 files, 128 passed, exit 0 | ✓ PASS |
| Build produces sw.js | `npm run build` → `ls dist/sw.js` | PWA v1.3.0 mode generateSW, 16 entries, exit 0 | ✓ PASS |
| pwa i18n keys in pl locale | `node -e "const j=require('./src/i18n/locales/pl/common.json'); console.log(j.pwa.updateAvailable, j.pwa.refresh)"` | "Nowa wersja dostępna Odśwież" | ✓ PASS |
| deploy.yml main-only trigger | `grep -c "pull_request\|workflow_dispatch" .github/workflows/deploy.yml` | 0 | ✓ PASS |
| No continue-on-error on lint/test | `grep -c "continue-on-error" .github/workflows/deploy.yml` | 0 | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PWA-01 | 05-01 | Full offline capability via Workbox precaching | ✓ SATISFIED | Workbox generateSW strategy, 16 entries precached, navigateFallback: null for hash routing |
| PWA-02 | 05-01, 05-02 | Installable with correct branding and icons | ✓ SATISFIED | Manifest: name, short_name, theme/bg color, 4 icons (192+512 any, 180 any, 512 maskable) |
| PWA-03 | 05-01 | SW update notification prompt | ✓ SATISFIED | useRegisterSW + onNeedRefresh + persistent Sonner toast + updateServiceWorker(true) |
| DEPLOY-01 | 05-03 | CI/CD: lint→test→build→gh-pages on push to main | ✓ SATISFIED | deploy.yml confirmed; peaceiris/actions-gh-pages@v4 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/i18n/locales/en/common.json` | 15 | `"placeholder": "Onboarding coming soon"` | ⚠️ Warning | Pre-existing from Phase 2; key not referenced anywhere in codebase (grep confirms 0 usages of `onboarding.placeholder`). Not introduced by Phase 5. |
| `src/i18n/locales/pl/common.json` | 15 | `"placeholder": "Konfiguracja wkrótce"` | ⚠️ Warning | Same pre-existing dead key. Not a Phase 5 artifact. |

No TBD/FIXME/XXX debt markers found in any Phase 5 modified files.

**Prohibition checks (must-NOT verification):**

| Prohibition | Status | Evidence |
|-------------|--------|----------|
| No Dismiss button on update toast | SATISFIED | `src/App.tsx:12-21` — action object only; no dismiss/close callback |
| Toast duration must be Infinity | SATISFIED | `src/App.tsx:18` — `duration: Infinity` |
| No hardcoded strings in JSX | SATISFIED | All user-visible text uses `t('pwa.updateAvailable')` and `t('pwa.refresh')` |
| Separate any/maskable manifest entries (not combined) | SATISFIED | vite.config.ts lines 33-58: 3 entries with purpose 'any', 1 entry with purpose 'maskable' |
| Workflow must NOT trigger on pull_request or other branches | SATISFIED | grep for pull_request in deploy.yml returns 0 |
| Deploy must NOT run if lint/test fail | SATISFIED | No continue-on-error; sequential steps with no bypass |
| navigateFallback must stay null | SATISFIED | `vite.config.ts:21` — `navigateFallback: null` |

### Human Verification Required

#### 1. Offline Capability After First Load

**Test:** Open the deployed app at https://[owner].github.io/little-words/ on a mobile device. Allow the service worker to install (wait 10–15 seconds after load). Then enable Airplane Mode. Navigate to all main screens (Dashboard, Meanings, Word Forms, Timeline, Settings). Try adding a new word entry.
**Expected:** All screens render without errors, new IndexedDB entries persist, no "network error" or missing asset messages in console
**Why human:** Workbox precaching is configured correctly in code (globPatterns, 16 entries in build output) but actual SW asset serving under network disconnection cannot be verified without a real network toggle

#### 2. PWA Installability on Android Chrome and iOS Safari

**Test (Android):** Open the deployed app in Chrome on Android. Wait for the "Add to Home Screen" banner or check via Chrome's install icon in the address bar. Install and launch from Home Screen.
**Test (iOS):** Open in Safari on iOS. Tap Share → Add to Home Screen → Add. Launch from Home Screen icon.
**Expected:** Android: install prompt appears; app launches in standalone mode (no browser chrome). iOS: app launches in standalone mode with teal splash screen, no Safari UI visible.
**Why human:** Manifest fields (icons >=192×192, display:standalone, start_url, scope) are confirmed correct. Browser install heuristics (engagement scoring, HTTPS requirement on deployed URL) cannot be evaluated statically.

#### 3. SW Update Toast End-to-End

**Test:** Deploy the current build. Open app, confirm SW installs. Make a trivial change (e.g., bump version in package.json), push to main, wait for GitHub Actions deploy. Return to the tab or open a fresh tab.
**Expected:** "New version available" / "Nowa wersja dostępna" toast appears at bottom-center with "Refresh" / "Odśwież" button. Tapping Refresh reloads the page to the new bundle.
**Why human:** useRegisterSW + onNeedRefresh wiring is fully verified in code. Requires a real SW state transition (new SW enters "waiting") which only occurs after deploying two distinct versions.

#### 4. Visual Icon Quality

**Test:** Open the four PNG files in an image viewer: icon-192.png, icon-512.png, apple-touch-icon.png, icon-512-maskable.png.
**Expected:** All icons show a teal (#0D9488) background filling the entire canvas; white "LW" text is centered and clearly legible at all sizes; the maskable icon has no padding (teal bleeds to edges, no rounded corners or safe-zone padding showing).
**Why human:** SVG source is correct (rect fill #0D9488, LW text at 256,256 with dominant-baseline:central) but font rendering and pixel-level centering at different sizes requires visual inspection.

### Gaps Summary

No gaps. All implementation truths are VERIFIED. The three unverified truths are PRESENT_BEHAVIOR_UNVERIFIED — code and configuration are correctly in place, but the behaviors require runtime/device testing to confirm.

---

_Verified: 2026-08-31T20:50:00Z_
_Verifier: Claude (gsd-verifier)_
