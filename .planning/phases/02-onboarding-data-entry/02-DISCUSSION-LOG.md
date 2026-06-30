# Phase 2: Onboarding & Data Entry - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 2-Onboarding & Data Entry
**Areas discussed:** Onboarding wizard flow, Languages field design, Word entry bottom sheet, Settings screen scope in Phase 2

---

## Onboarding Wizard Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Single screen | Name + birth date + languages all on one scrollable page | ✓ |
| 2-step wizard | Step 1: name + birth date; Step 2: home languages | |
| 3-step wizard | One field per screen | |

**User's choice:** Single screen

---

| Option | Description | Selected |
|--------|-------------|----------|
| Go straight to Dashboard | AppGate auto-transitions when profileCount > 0 | |
| Show a brief welcome screen first | "Welcome, [name]!" + animated checkmark, auto-redirect ~2 seconds | ✓ |

**User's choice:** Welcome screen with child's name + message, then auto-redirect to Dashboard

---

| Option | Description | Selected |
|--------|-------------|----------|
| Child's name + brief message | "Welcome, [name]!" + short phrase + animated checkmark, auto-redirect | ✓ |
| App branding + confirmation | "Little Words" + "Your profile is ready" + continue button | |

**User's choice:** Child's name + brief message with animated checkmark, auto-redirect ~2 seconds

---

| Option | Description | Selected |
|--------|-------------|----------|
| Validate on submit only | Errors shown only after tapping "Get started" | |
| Validate inline as fields are left (onBlur) | Errors shown when focus leaves a field | |
| You decide | Claude picks the validation approach | ✓ |

**User's choice:** Claude's discretion

---

| Option | Description | Selected |
|--------|-------------|----------|
| No — wizard stays minimal | Only 3 mandatory fields; optional fields in Settings only | |
| Yes — collapsible 'Optional: Medical context' section | Collapsed accordion below mandatory fields | ✓ |
| Yes — 'Skip for now / Add more' button | Secondary button to expand optional section | |

**User's choice:** Collapsible "Optional: Medical context" section below mandatory fields

---

## Languages Field Design

| Option | Description | Selected |
|--------|-------------|----------|
| Predefined short list with toggles | 3–5 most common options as tap-to-toggle chips + "Other" | |
| Free-text chip/tag input | Type language name + Enter to add as chip | |
| Predefined list + free-text fallback | Toggle chips for top languages + text field always visible | ✓ |

**User's choice:** Predefined list + free-text fallback

---

| Option | Description | Selected |
|--------|-------------|----------|
| Polish + English only (2 chips) | App's two supported UI languages | ✓ |
| Polish, English, Ukrainian, German (4 chips) | Covers most multilingual families in Poland | |
| You decide | Claude picks based on PROJECT.md context | |

**User's choice:** Polish + English only (2 chips)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Single additional language only | One text input for one extra language | |
| Add multiple via text + add button | Text field + "Add" button; appends to languages array | ✓ |

**User's choice:** Add multiple via text + "Add" button

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — chips show × to deselect | Both predefined and custom chips removable | ✓ |
| Only custom (Other) ones removable | Polish/English toggle only; custom show × | |

**User's choice:** All chips show × to deselect/remove

---

## Word Entry Bottom Sheet

| Option | Description | Selected |
|--------|-------------|----------|
| Word form + meaning + categories — all-in-one | Single sheet with all fields | ✓ |
| Word form only — meaning added inline after | Two-phase sheet | |
| You decide | Claude picks based on typical use case | |

**User's choice:** All-in-one form

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — '+ Add another meaning' button | Multiple meanings in one sheet session | ✓ |
| No — one meaning per sheet open | Simpler; reopen sheet to add second meaning | |

**User's choice:** "+ Add another meaning" button

---

**Free-text clarification on data model:** User clarified that each (word form, meaning) pair is the atomic unit. Pairs can be grouped by word form (same word, multiple meanings) or by meaning (multiple words, same meaning) but that is display/counting only. The bottom entity is a simple pair.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-set to today — no date fields | firstUseDate = lastUseDate = today; no date UI | |
| Optional date picker in the sheet | firstUseDate pre-filled today, editable; lastUseDate = firstUseDate on creation | ✓ |

**User's choice:** Optional date picker in the sheet

---

| Option | Description | Selected |
|--------|-------------|----------|
| Plain text input — no autocomplete | Parent types exactly what they heard | ✓ |
| Autocomplete from existing word forms | Suggestions from DB while typing | |

**User's choice:** Plain text input for word form field

---

| Option | Description | Selected |
|--------|-------------|----------|
| Find-or-create silently | Reuse existing WordForm; no confirmation | |
| Show 'word already has N meaning(s)' notice | Info badge below input | |

**User's clarification:** Show existing meanings list (not just count) — debounced lookup while typing, show "pa — already linked to: goodbye, I want that" below the word form input.

**User's choice:** While typing (debounced) — show existing meanings list

---

| Option | Description | Selected |
|--------|-------------|----------|
| Wrapped chip row — scroll-free | All 14 chips in wrapping flex row | |
| Horizontal scrollable chip row | Single line, left/right scroll | ✓ |
| 2-column grid | Two-column layout | |

**User's choice:** Horizontal scrollable chip row (single line)

---

## Settings Screen Scope in Phase 2

| Option | Description | Selected |
|--------|-------------|----------|
| Language switcher + Edit Profile only | Two functional sections | |
| Language switcher only — Profile on separate route | Settings = language; profile at /#/profile | |
| Full Settings structure now (language + profile + placeholders) | All four sections visible | ✓ |

**User's choice:** Full Settings structure in Phase 2 — Language, Profile, Data (placeholder), About

---

| Option | Description | Selected |
|--------|-------------|----------|
| Two radio-style buttons: PL | EN | Side-by-side toggle buttons, instant effect | ✓ |
| Dropdown / select | Standard select input | |

**User's choice:** Two radio-style buttons PL | EN

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inline editable fields on Settings page | Fields editable directly on Settings | |
| Navigate to separate /#/profile/edit page | Settings row with chevron → dedicated edit page | ✓ |

**User's choice:** Navigate to /#/profile/edit page

---

| Option | Description | Selected |
|--------|-------------|----------|
| Just 'Data (coming soon)' placeholder row | Single disabled row | |
| Full section structure: Language, Profile, Data, About | Four sections, two functional, two placeholder | ✓ |

**User's choice:** Full section structure with Language + Profile functional, Data + About as sections

---

## Claude's Discretion

- **Validation strategy:** onBlur validation chosen — catches mistakes as parent completes each field without interrupting typing. Matches the warm, low-friction feel of the app. Errors shown as small red text beneath each field.

## Deferred Ideas

- Edit word form text after creation — Phase 3 detail pages
- Meaning `lastUseDate` update UI — Phase 3 scope
- Meaning Active/Inactive toggle — Phase 3 scope
- Data export/import in Settings — Phase 4 scope
- PWA manifest and service worker details — Phase 5 scope
- Gesture recording — v2 requirement
