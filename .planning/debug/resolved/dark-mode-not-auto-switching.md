---
status: resolved
trigger: "App does not automatically switch to dark color scheme when OS/browser dark mode is active"
created: 2026-07-19T00:00:00Z
updated: 2026-07-19T00:00:00Z
---

## Current Focus

hypothesis: Dark mode CSS media query or class-based theme toggle is not wired to `prefers-color-scheme`
test: Check tailwind config, index.css, root component for theme setup
expecting: Will find either missing `color-scheme` property, missing `@media (prefers-color-scheme: dark)`, or class-based Shadcn setup without automatic class application
next_action: Read tailwind.config.ts to check darkMode configuration

## Symptoms

expected: When OS or browser is set to dark mode, app automatically displays dark color scheme
actual: App stays in light mode regardless of OS/browser dark mode setting
errors: None (no error messages, just visual behavior)
reproduction: Open app in browser/OS with dark mode enabled; observe light theme still displayed
started: Unknown (presumably from project start or recent theme implementation)

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-07-19 (investigation)
  checked: src/index.css (lines 29-93)
  found: CSS defines dark mode colors in `@media (prefers-color-scheme: dark)` block (lines 70-93) with `color-scheme: dark;` on line 91
  implication: Dark mode CSS variables are defined, but root declaration blocks them

- timestamp: 2026-07-19
  checked: :root selector in src/index.css (line 67)
  found: `color-scheme: light;` hardcoded in :root
  implication: Browser is told "this site only supports light mode"; media query cannot override this

- timestamp: 2026-07-19
  checked: main.tsx, App.tsx, index.html, vite.config.ts
  found: No JavaScript theme provider, no class-based theme toggle, no localStorage theme logic
  implication: No JS is interfering; issue is purely CSS

- timestamp: 2026-07-19
  checked: src/* for theme-related code
  found: No theme/dark mode logic in codebase
  implication: CSS media query should work if `color-scheme` property is fixed

## Resolution

root_cause: Line 67 in `src/index.css` declares `color-scheme: light;` unconditionally. This explicitly tells the browser "this site only supports light mode", preventing the `@media (prefers-color-scheme: dark)` media query from activating even though dark mode colors are defined in that block (lines 70-93).

fix: Change line 67 in `src/index.css` from `color-scheme: light;` to `color-scheme: light dark;` to signal that the site supports both light and dark color schemes. This allows the media query on line 70 to activate when the browser/OS detects dark mode preference.

verification: (pending — needs manual test in OS/browser dark mode)
files_changed: ["src/index.css"]
