# Phase 5: PWA Polish - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 hardens the app into a production-ready PWA: full offline capability after first load, installability on Android and iOS with a correct manifest and icons, and a user-facing update notification flow. Phase 5 also includes GitHub Actions CI/CD deployment to GitHub Pages (DEPLOY-01 pulled forward from v2). Phase 5 maps to requirements PWA-01, PWA-02, PWA-03, and DEPLOY-01.

**Out of scope for this phase:** Gesture recording, spontaneous/imitated tracking, meaning editing, custom categories, PDF report — all explicitly v2.

</domain>

<decisions>
## Implementation Decisions

### App Icons

- **D-01:** Generate placeholder icons for v1 — no existing artwork. Placeholder design: initials "LW" centered on a teal background (`oklch(55% 0.15 185)`, hex ~`#0D9488`), white text. Sized at 192×192, 512×512, and 180×180 (iOS apple-touch-icon). Icons live in `public/icons/`.
- **D-02:** Include a maskable variant (512×512 recommended) with the "LW" motif centered in the inner 80% safe zone — for Android adaptive icon launchers (circles, squircles, etc.). Add `"purpose": "maskable"` entry to manifest icons array alongside the standard `"any"` entries.
- **D-03:** Icons are generated as PNG files from an SVG source (created inline during this phase). No external design tool required.

### Update Notification UX

- **D-04:** Switch `registerType` from `'autoUpdate'` to `'prompt'` in `vite.config.ts`. This gives the app control over when to apply updates. — **Reversibility:** reversible
- **D-05:** Wire `useRegisterSW` hook from `virtual:pwa-register/react` in `App.tsx` (or `RootLayout`). On `onNeedRefresh`, fire a persistent Sonner toast. Single mount point — no per-page logic.
- **D-06:** Update toast text (via i18n keys): Polish: "Nowa wersja dostępna" / English: "New version available". Toast includes a single "Refresh" button that calls `updateServiceWorker(true)`. No "Dismiss" button — the user either acts or navigates away.
- **D-07:** Toast is persistent (`duration: Infinity` in Sonner) until the user taps Refresh. i18n keys for toast message and button go in `pl/common.json` and `en/common.json`.

### GitHub Actions CI/CD (DEPLOY-01 pulled into Phase 5)

- **D-08:** Add `.github/workflows/deploy.yml` that triggers on push to `main` only. Steps: checkout → Node 22 setup (with npm cache) → `npm ci` → `npm run lint` → `npm run test` → `npm run build` → deploy `dist/` to `gh-pages` branch. If lint or tests fail, deploy is blocked. — **Reversibility:** reversible
- **D-09:** Use `actions/deploy-pages` or `peaceiris/actions-gh-pages` (whichever the planner determines is current best practice). The deploy action pushes `dist/` to `gh-pages` branch, which GitHub Pages serves from `/little-words/`. A `.nojekyll` file is included in dist to prevent Jekyll processing.

### Manifest Branding

- **D-10:** Update `theme_color` and `background_color` to the app's primary teal (~`#0D9488`, the hex approximation of `oklch(55% 0.15 185)`). This affects the Android address bar color and splash screen.
- **D-11:** Change `short_name` from `'LittleWords'` (no space) to `'Little Words'` (with space) to match the full brand name.
- **D-12:** Update `description` to: "Privacy-first app for parents to track their child's speech and communication development."

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §PWA — PWA-01, PWA-02, PWA-03: offline capability, manifest, update prompt
- `.planning/REQUIREMENTS.md` §Deployment — DEPLOY-01: GitHub Actions to gh-pages (pulled from v2 into Phase 5)
- `.planning/ROADMAP.md` §Phase 5 — Phase goal, 3 success criteria, dependency on Phase 4

### Architecture & Constraints
- `.planning/PROJECT.md` §Constraints — GitHub Pages hosting, hash routing, `base: '/little-words/'`, no backend
- `.claude/CLAUDE.md` §Section 1 (Vite PWA Plugin) — `navigateFallback: null` rationale, `generateSW` strategy, `registerType: 'prompt'` pattern
- `.claude/CLAUDE.md` §Section 7 (PWA Manifest for GitHub Pages) — `start_url`, `scope`, deployment checklist
- `vite.config.ts` — current VitePWA config (icons: [], registerType: 'autoUpdate' — both to be updated)

### Prior Phase Context
- `.planning/phases/04-doctor-report-data-management/04-CONTEXT.md` — established toast pattern (Sonner), import/export patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/sonner.tsx` — Sonner Toaster already installed and styled; use `toast()` with `action` prop for the update toast (Refresh button)
- `src/shared/components/RootLayout.tsx` — mount `useRegisterSW` hook here or directly in `App.tsx`; already renders `<Toaster />` (confirm placement)
- `vite.config.ts` — VitePWA already configured with correct `navigateFallback: null`, `globPatterns`, and manifest skeleton; update `registerType`, `icons`, `theme_color`, `short_name`, `description`
- `src/i18n/locales/pl/common.json` and `en/common.json` — add toast i18n keys here (e.g., `pwa.updateAvailable`, `pwa.refresh`)

### Established Patterns
- Sonner toast with action: `toast('message', { action: { label: 'Refresh', onClick: () => updateServiceWorker(true) }, duration: Infinity })`
- `useTranslation('common')` — all UI strings via i18n keys
- `npx shadcn@latest add <component>` for any new Shadcn components (none expected for this phase)
- Tailwind utility-first styling, no CSS modules

### Integration Points
- `App.tsx` — wire `useRegisterSW` from `virtual:pwa-register/react` here
- `public/icons/` — new directory for generated PNG icon files
- `vite.config.ts` manifest — update `icons` array, `theme_color`, `short_name`, `description`
- `.github/workflows/deploy.yml` — new file for CI/CD pipeline
- `public/` — ensure `.nojekyll` is present (or add it to the Workbox `includeAssets` glob)

### Critical Gap
- `manifest.icons: []` is empty — app is not currently installable. This is the highest priority fix in Phase 5.
- No `useRegisterSW` usage exists in the codebase — must be added to complete PWA-03.

</code_context>

<specifics>
## Specific Ideas

- Icon generation approach: write a Node.js script (`scripts/generate-icons.js`) or use an SVG file in `public/icons/lw-icon.svg` as source, then produce PNGs via `sharp` or `@resvg/resvg-js` during the build/setup. Alternatively, generate PNGs manually using a simple canvas/SVG in the browser and commit them.
- Maskable icon: same "LW" design but the teal background fills the full 512×512 canvas (bleed edge), so any clip shape from Android launchers still shows solid color.
- Toast placement: `toast('Nowa wersja dostępna', { action: { label: t('pwa.refresh'), onClick: () => updateServiceWorker(true) }, duration: Infinity })` — called inside `onNeedRefresh` callback of `useRegisterSW`.
- GitHub Actions: use `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages` (the official Pages deployment pattern) or `peaceiris/actions-gh-pages@v4` (simpler, pushes to gh-pages branch). Planner to pick based on current GitHub Pages API support.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope. All 4 areas discussed were within Phase 5 requirements.

</deferred>

---

*Phase: 5-PWA Polish*
*Context gathered: 2026-08-31*
