---
phase: 05-pwa-polish
plan: 02
subsystem: pwa
tags: [pwa, icons, resvg, svg, png, manifest, vite-plugin-pwa]

requires:
  - phase: 05-01
    provides: vite.config.ts with VitePWA configured, registerType prompt, manifest branding

provides:
  - 4 PWA icon PNG files in public/icons/ (192, 512, 180, 512-maskable)
  - SVG source (lw-icon.svg) for reproducible icon generation
  - scripts/generate-icons.js for re-generating icons from SVG
  - vite.config.ts manifest.icons array with 4 correct entries

affects:
  - 05-03 (deploy: service worker will pre-cache the PNG icons via Workbox glob)
  - future branding updates (replace lw-icon.svg, re-run generate-icons.js)

actuals:
  tokens: 9200
  tasks: 2
  commits: 2

tech-stack:
  added:
    - "@resvg/resvg-js@2.6.2 (devDependency) — WASM SVG rasterizer, no native compilation"
  patterns:
    - "SVG source + generation script pattern: maintain one SVG, generate all PNG variants programmatically"
    - "Separate manifest icon entries per purpose: never combine any+maskable on one entry"
    - "Icon src paths include /little-words/ base prefix — required because manifest is served from /little-words/"

key-files:
  created:
    - public/icons/lw-icon.svg
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/apple-touch-icon.png
    - public/icons/icon-512-maskable.png
    - scripts/generate-icons.js
  modified:
    - vite.config.ts (manifest.icons populated)
    - package.json (@resvg/resvg-js added)

key-decisions:
  - "Used ESM import syntax in generate-icons.js instead of require() — package.json is type:module, CJS require() would throw; ESM import works correctly"
  - "SVG teal rect fills full 512x512 canvas — same SVG satisfies both standard and maskable icon requirements without a separate maskable-specific SVG"
  - "Separate manifest.icons entries for purpose:any and purpose:maskable on 512x512 — W3C spec disallows combining purposes on one entry"
  - "Icon src paths prefixed with /little-words/ — manifest is served at /little-words/manifest.webmanifest; browser resolves icon paths relative to page origin not manifest location"

patterns-established:
  - "Icon generation pattern: SVG source → @resvg/resvg-js script → PNG files committed to public/icons/"
  - "Maskable icon safe zone: teal rect fills 100% of canvas, no padding, satisfies Android adaptive launcher clip shapes"

requirements-completed:
  - PWA-02

coverage:
  - id: D1
    description: "public/icons/ contains 4 PNG files (icon-192.png 192x192, icon-512.png 512x512, apple-touch-icon.png 180x180, icon-512-maskable.png 512x512)"
    requirement: PWA-02
    verification:
      - kind: other
        ref: "node -e size check — all 4 files >1000 bytes: 2295, 6918, 2160, 6918 bytes"
        status: pass
    human_judgment: false
  - id: D2
    description: "All PNG icons show teal (#0D9488) background with white LW initials — visual quality check"
    requirement: PWA-02
    verification: []
    human_judgment: true
    rationale: "Visual design correctness (font rendering, centering, color accuracy) cannot be verified by file size checks alone — requires human visual inspection"
  - id: D3
    description: "vite.config.ts manifest.icons array has 4 entries with correct sizes, purposes (separate any/maskable), and /little-words/ prefixed src paths"
    requirement: PWA-02
    verification:
      - kind: other
        ref: "node dist/manifest.webmanifest check — 4 icons in manifest; grep verified 1x 192x192, 1x maskable"
        status: pass
      - kind: other
        ref: "npm run build — exit code 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "npm run build and npm run test both pass after all changes"
    requirement: PWA-02
    verification:
      - kind: unit
        ref: "vitest run — 13 test files, 128 tests passed"
        status: pass
      - kind: other
        ref: "tsc -b && vite build — exit code 0"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-08-31
status: complete
---

# Phase 05 Plan 02: PWA Icons Summary

**Four PWA icon PNGs generated from SVG source using @resvg/resvg-js WASM rasterizer; manifest.icons array populated with correct size/purpose entries including separate maskable entry**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-31T19:20:00Z
- **Completed:** 2026-08-31T19:45:00Z
- **Tasks:** 2 (Task 1 was human checkpoint, approved before this execution)
- **Files modified:** 7

## Accomplishments

- SVG source `public/icons/lw-icon.svg` — 512x512 teal (#0D9488) background with white "LW" text, full canvas fill satisfies maskable safe-zone bleed
- 4 PNG icons committed to `public/icons/`: icon-192.png (2295 B), icon-512.png (6918 B), apple-touch-icon.png (2160 B), icon-512-maskable.png (6918 B)
- `scripts/generate-icons.js` — ESM script using @resvg/resvg-js to rasterize SVG to any PNG size; re-run after SVG changes
- `vite.config.ts` manifest.icons array populated with 4 separate entries (3x purpose:any, 1x purpose:maskable); src paths include /little-words/ base prefix
- `npm run build` passes — dist/manifest.webmanifest lists 4 icons correctly
- `npm run test` passes — 128 tests, 13 files, exit code 0

## Task Commits

1. **Task 2: SVG source, install @resvg/resvg-js, generate-icons.js** — `d9fe67a` (feat)
2. **Task 3: Run icon generation, update vite.config.ts icons array** — `af9d19a` (feat)

## Files Created/Modified

- `public/icons/lw-icon.svg` — SVG source; 512x512, teal fill, white LW text
- `public/icons/icon-192.png` — 192x192 standard icon (purpose: any)
- `public/icons/icon-512.png` — 512x512 standard icon (purpose: any)
- `public/icons/apple-touch-icon.png` — 180x180 iOS Add to Home Screen icon (purpose: any)
- `public/icons/icon-512-maskable.png` — 512x512 maskable icon for Android adaptive launchers (purpose: maskable)
- `scripts/generate-icons.js` — Node.js ESM icon generation script using @resvg/resvg-js
- `vite.config.ts` — manifest.icons array populated (4 entries)
- `package.json` — @resvg/resvg-js added to devDependencies

## Decisions Made

- **ESM over CommonJS in generate-icons.js**: Plan specified `require()` (CommonJS) but `package.json` has `"type": "module"`, making CJS require() invalid for .js files. Used `import { Resvg } from '@resvg/resvg-js'` instead — correct for this project's module type. (Rule 3 auto-fix — blocking issue)
- **Same SVG for standard and maskable icons**: The teal rect fills 100% of the 512x512 canvas with no padding, so the same SVG satisfies both standard (any) and maskable safe-zone requirements. No separate maskable-specific SVG needed.
- **Separate manifest entries for any vs maskable**: One entry with `purpose: 'any'` and one with `purpose: 'maskable'` for the 512x512 size. W3C spec disallows combining purposes as 'any maskable' on a single entry.
- **Icon src paths include /little-words/ prefix**: The manifest is served from `/little-words/manifest.webmanifest`. Browser resolves icon paths relative to the page origin (not the manifest), so the base prefix is required.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used ESM import syntax instead of CommonJS require()**
- **Found during:** Task 2 (writing generate-icons.js)
- **Issue:** Plan specified `require()` (CommonJS) in generate-icons.js, but `package.json` has `"type": "module"` which makes all .js files ESM. Using `require()` in an ESM context throws `ReferenceError: require is not defined`.
- **Fix:** Used `import { Resvg } from '@resvg/resvg-js'` and `import { readFileSync, writeFileSync } from 'fs'` with ESM syntax. Also added `__dirname` reconstruction via `fileURLToPath(import.meta.url)` since it is not available in ESM.
- **Files modified:** `scripts/generate-icons.js`
- **Verification:** `node scripts/generate-icons.js` exits with code 0 and all 4 PNGs generated successfully.
- **Committed in:** d9fe67a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — module syntax mismatch)
**Impact on plan:** Required for the script to run at all. No scope change.

## Issues Encountered

- Pre-existing `npm audit` vulnerabilities (brace-expansion, fast-uri, js-yaml) reported during install — these are unrelated to @resvg/resvg-js and exist in the project's devDependencies. Out of scope for this plan.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- PWA-02 complete: manifest now has valid branding (from 05-01) AND four icon sizes with correct purposes
- Chrome's "Add to Home Screen" prompt can find manifest entries >= 192x192 (icon-192.png and icon-512.png satisfy this)
- Android adaptive launchers can use icon-512-maskable.png in any clip shape
- Workbox `includeAssets: ['**/*.{ico,png,svg}']` glob in 05-01 will auto-precache all icons at build time — no further config needed
- Phase 05 complete: all three plans (05-01 SW update flow, 05-02 icons, 05-03 deploy workflow) delivered

---
*Phase: 05-pwa-polish*
*Completed: 2026-08-31*
