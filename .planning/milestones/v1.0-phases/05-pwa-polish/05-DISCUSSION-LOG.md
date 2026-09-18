# Phase 5: PWA Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-31
**Phase:** 5-PWA Polish
**Areas discussed:** App icons, Update notification UX, GitHub Actions deploy, Manifest branding

---

## App Icons

| Option | Description | Selected |
|--------|-------------|----------|
| I have artwork ready | Existing logo or hi-res PNG to resize/optimize | |
| Generate placeholder for v1 | Simple placeholder icon — can swap with real icons before promotion | ✓ |
| Create a simple SVG logo as part of this phase | Design minimal SVG icon directly in this phase | |

**User's choice:** Generate placeholder for v1

---

| Option | Description | Selected |
|--------|-------------|----------|
| Initials 'LW' on app primary color | Simple, readable, matches brand | ✓ |
| Speech bubble or word bubble symbol | Communicates app purpose visually | |
| Plain colored square | Minimal effort, clearly placeholder | |

**User's choice:** Initials 'LW' on app primary teal

---

| Option | Description | Selected |
|--------|-------------|----------|
| Standard PWA set: 192×192 + 512×512 + 180×180 | Mandatory baseline for installability | ✓ |
| Full icon suite (9 sizes) | Maximum compatibility | |

**User's choice:** Standard PWA set

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — maskable icon with safe-zone padding | Required for Android adaptive icon launchers | ✓ |
| No — standard icons only | Simpler but may look cropped on Android | |

**User's choice:** Yes — include maskable variant

---

## Update Notification UX

| Option | Description | Selected |
|--------|-------------|----------|
| Toast with 'Refresh' button — persists until tapped | Requires registerType: 'prompt' + useRegisterSW | ✓ |
| Toast that auto-dismisses — no action needed | Keep registerType: 'autoUpdate' | |

**User's choice:** Persistent toast with Refresh button

---

| Option | Description | Selected |
|--------|-------------|----------|
| Short: 'Nowa wersja dostępna' + Refresh button | Minimal, clear | ✓ |
| Descriptive longer message | More context, longer toast | |
| You decide | Claude picks the copy | |

**User's choice:** Short message with Refresh button

---

| Option | Description | Selected |
|--------|-------------|----------|
| In App.tsx / RootLayout — single mount point | useRegisterSW hook once at root | ✓ |
| Dedicated UpdatePrompt component in RootLayout | More modular, easier to unit test | |

**User's choice:** App.tsx / RootLayout

---

| Option | Description | Selected |
|--------|-------------|----------|
| Refresh only — no dismiss | Forces user to act; simpler | ✓ |
| Refresh + Dismiss button | More control for user | |

**User's choice:** Refresh only — no dismiss button

---

## GitHub Actions Deploy

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — include in Phase 5 | Pulls DEPLOY-01 forward; ships v1 properly deployed | ✓ |
| No — keep as v2, deploy manually | Phase 5 code-only | |

**User's choice:** Yes — include GitHub Actions in Phase 5

---

| Option | Description | Selected |
|--------|-------------|----------|
| On push to main only | Standard pattern, no preview deploys | ✓ |
| On push to main + PR preview on develop | More complex, overkill for solo project | |

**User's choice:** Push to main only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — lint + test + build + deploy | Quality gate blocks bad deploys | ✓ |
| Build + deploy only | Faster, no gate | |

**User's choice:** Full pipeline: lint → test → build → deploy

---

| Option | Description | Selected |
|--------|-------------|----------|
| Node 22 (current LTS) | Matches Vite 7 requirement | ✓ |
| Node 20 (previous LTS) | Older but stable | |

**User's choice:** Node 22

---

## Manifest Branding

| Option | Description | Selected |
|--------|-------------|----------|
| Update to app's primary teal (~#0D9488) | Branded, intentional address bar color | ✓ |
| Keep white (#ffffff) | Neutral, safe | |

**User's choice:** Update theme_color to app primary teal

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep 'LittleWords' (no space) | Compact for launchers | |
| Change to 'Little Words' (with space) | Matches brand name | ✓ |
| Shorten to 'LW' or 'L.Words' | Maximally safe for small icons | |

**User's choice:** 'Little Words' (with space)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Update to meaningful description | "Privacy-first app for parents to track their child's speech and communication development." | ✓ |
| Keep current description | "Track your child's vocabulary development" | |

**User's choice:** Update to more descriptive text

---

## Claude's Discretion

None — user made explicit choices on all questions.

## Deferred Ideas

None — discussion stayed within Phase 5 scope.
