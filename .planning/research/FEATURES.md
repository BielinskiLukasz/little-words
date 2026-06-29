# Feature Landscape

**Domain:** Offline-first child vocabulary / speech-development tracking PWA
**Researched:** 2026-06-30
**Overall confidence:** HIGH (cross-checked across clinical literature, UX research, and PWA platform docs)

---

## Table Stakes

Features users expect in ANY tracking app. Missing = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Create a child profile on first launch | Tracking is meaningless without a named subject; parents bail if they can log before contextualising | Low | Onboarding wizard with name + birthdate at minimum; languages at home adds clinical value |
| Add a word / entry in under 5 seconds | Parents log in the moment — during a meal, at a playground. Any friction at the "add" step kills daily adoption | Low | FAB → bottom sheet is the established mobile pattern; keeps primary UI uncluttered |
| See the current vocabulary count at a glance | Primary reason parents open the app; the number is the reward | Low | Dashboard as the default view; active meanings count must be above the fold |
| Edit and delete any entry | Mistakes happen; no tracking app survives without this | Low | Tapping an entry opens its detail page — established pattern; keep delete behind a confirmation |
| Data persists across app closes and device restarts | Basic expectation; violation destroys trust permanently | Medium | IndexedDB is the correct mechanism; must call `navigator.storage.persist()` at first meaningful save to prevent browser eviction |
| Export data in a portable format | Parents fear lock-in, especially for a medical record | Low | JSON (complete backup) + CSV (spreadsheet-friendly) covers the two real use cases |
| Import / restore from backup | Complements export; required for device migration | Low | File picker → parse → merge or replace; critical for an app with no cloud |
| Works offline, always | Installed PWA users expect native-app data reliability; a spinner while offline = broken | Medium | Service worker with cache-first strategy for app shell; IndexedDB for all data; network is never required |
| Installable on mobile home screen | Parents returning daily need home-screen access; a browser tab gets lost | Medium | PWA manifest + service worker registration; prompt only after a meaningful interaction |
| Basic timeline / history view | Parents want to see growth over time, not just the current count | Medium | Monthly aggregation is sufficient for MVP; chart + data table both matter (chart for emotional impact, table for specialists) |

---

## Features Specific to Speech / Vocabulary Tracking

What speech therapists and parents of children with delayed speech actually need — beyond generic tracking patterns.

| Feature | Clinical / User Value | Complexity | Notes |
|---------|----------------------|------------|-------|
| Spontaneous vs. Prompted distinction per entry | Core clinical data: spontaneous speech is far more significant than imitation. SLPs explicitly code for this (unintelligible / imitative / verbally prompted / non-verbally prompted / spontaneous). Missing this collapses the record to a simple word list. | Low | A binary toggle at entry creation; defaults to Spontaneous to reduce friction |
| First-use date and last-use date (not full history) | SLPs assess rate of acquisition and recency of active use. Full occurrence logging is too burdensome and creates data parent never reviews. Two dates are the clinical minimum. | Low | Correct choice already in PROJECT.md — resist scope creep toward full occurrence logs |
| Active / Inactive status per meaning | Vocabulary regression is clinically significant (words that disappear). Active/Inactive is a lightweight proxy for this. | Low | Toggle from detail page only (prevents accidental change) — correct decision in PROJECT.md |
| Gesture tracking (separate from words) | Gestures are prelinguistic communication; SLPs and neurologists want them documented alongside vocabulary. They are NOT counted as words. | Low | Description + first/last observed date; separate section from word forms |
| Semantic categories (Nouns, Verbs, Food, Animals, etc.) | SLPs assess vocabulary breadth across categories, not just count. A child with 30 food words but 0 verbs is a different clinical picture than 15/15. | Low | Fixed default categories for MVP is correct; custom categories can come later |
| One word form → multiple meanings mapping | "pa" means "goodbye", "look at that", and "I want it" — these are three different communicative functions. Conflating them gives an inflated, meaningless word count. | Medium | Many-to-many Word Form ↔ Meaning model is the right call; meanings are independent entities |
| "Review these?" — meanings not seen recently | Parents forget to mark things inactive; a prompt for words not used in 30+ days surfaces regression candidates without requiring manual audit | Low | Dashboard card is correct scope; no push notification needed |
| Doctor Report — structured text summary | The core value proposition. Parents walk into specialist appointments with no data; SLPs get anecdotal "maybe 30 words?" instead of a structured record. | Medium | Must include: active/inactive counts, category breakdown, top categories, gestures, spontaneous vs. prompted split, profile medical context, parent notes; copy-to-clipboard is sufficient for v1 |
| Parent notes field persisting across reports | SLPs want the parent's qualitative observations alongside the quantitative data. Notes that must be re-entered every time get skipped. | Low | Persistent field on the child profile — correct decision in PROJECT.md |
| Category view with meaning counts | SLPs mentally compare expected category distribution for the child's age. Displaying counts by category lets them spot vocabulary profile gaps immediately. | Low | Simple list view; no chart required at MVP |
| New meanings this month metric | Rate of acquisition matters as much as total count; a child who added 5 meanings last month after 2 the month before is a different picture from static vocabulary | Low | Simple count derived from first-use date; dashboard card |

---

## UX Patterns for Quick-Entry Mobile Apps

How to achieve minimal friction for daily logging on a phone, often one-handed, often with a child in the other arm.

| Pattern | Why It Matters | Implementation Notes |
|---------|----------------|----------------------|
| FAB (Floating Action Button) in bottom-right | Thumb-reachable on all phone sizes; signals "primary action is always one tap away"; 25–30% higher engagement than modal triggers elsewhere | Bottom-right is the dominant pattern; Material Design 3 specifies this placement |
| Bottom sheet for entry form | Less intrusive than a full-screen modal; maintains context (parent can still see what they were looking at); dismissible by swipe | Must not obscure bottom navigation — either use a taller sheet or temporarily hide nav |
| Autocomplete for meanings | Parent types "b" and sees "ball, banana, bye" — reduces re-entry for the same meaning expressed by multiple word forms | Existing meanings list as autocomplete source; inline creation for new meanings must be frictionless |
| Minimum required fields | Every required field that isn't pre-filled is a dropout point. Word form is the only true hard requirement; meaning, category, and dates should all have smart defaults | Date defaults to today; type defaults to Spontaneous; no field should be blank-required at MVP beyond the word form itself |
| Defaults that are almost always right | The parent defaults to "today" for first use, "Spontaneous" for type — these are correct most of the time and should be pre-selected | Reduce cognitive load; parent overrides when the memory is of a past event |
| List views that are fast to scroll | For MVP vocabulary sizes (50–300 entries), search is not needed — a fast-scrolling flat list beats a search box that requires typing | Virtualize if list exceeds 200 items; alphabetical sort is sufficient |
| Confirmation-only delete | Accidental deletes of clinical records are high-stakes; one-tap delete with an undo toast is the minimum; consider a two-tap confirm for meanings (they're the primary entity) | Never auto-delete; show what will be affected |
| Distinct visual weight for Active vs. Inactive | Parents scan the list; inactive entries should be visually de-emphasised (dimmed, muted colour) rather than hidden by default | Hiding inactive by default is an anti-pattern — parents need to see regression candidates |

---

## Anti-Features

Features to deliberately NOT build. Some are scoped out in PROJECT.md already — they are included here as confirmation with clinical reasoning.

| Anti-Feature | Why Avoid | What to Do Instead | In Project Plan? |
|--------------|-----------|-------------------|-----------------|
| Daily streaks and streak counters | Streaks create anxiety and avoidance in high-stress parenting contexts; a broken streak after a hospital visit is demoralising; they are a gamification pattern optimised for retention, not clinical accuracy | Let the Timeline view show natural usage patterns; no streak mechanic | Correctly excluded |
| Push notifications for logging reminders | Requires a backend; becomes noise after day 3; parents of children with medical complexity already carry cognitive overload | The "Review these?" dashboard card surfaces the same intent without intrusion | Correctly excluded |
| Developmental norms and milestone comparison | Creates diagnostic anxiety; parents begin reading a 5-word vocabulary as a deficit score; the app is a record-keeping tool, not an assessment instrument. Clinical tools (CDI, MCDI) exist for this and are administered by specialists. | Present data without interpretation; omit age-norms entirely | Correctly excluded |
| Full occurrence logging (every time a word is used) | Turns the app into a tally sheet; too burdensome for sustained daily use; the clinical minimum is first + last date; SLPs do not need a raw count of every utterance from a parent | First-use and last-use dates with Active/Inactive status covers 90% of clinical need | Correctly excluded |
| Search and filter in MVP list views | At MVP vocabulary sizes (under 300 entries), search adds UI complexity and keyboard overhead for a gain that alphabetical scrolling already provides | Ship without search; add when lists demonstrably exceed scrollable size in user feedback | Correctly excluded |
| Custom user-defined categories | Category creation UI adds significant complexity; the clinical category set (Nouns, Verbs, Food, Animals, etc.) covers the vast majority of toddler vocabulary | Fixed defaults; defer custom categories post-validation | Correctly excluded |
| PDF export | PDF generation in a pure frontend (no server) requires a heavy library (jsPDF, pdfmake); copy-to-clipboard text is accepted by every specialist communication channel (WhatsApp, email, EMR copy-paste) | Clipboard copy of structured text; defer PDF to v2 | Correctly excluded |
| Cloud backup / sync | Requires a backend, authentication, and data sovereignty decisions — fundamentally changes the privacy model | JSON export is the explicit manual migration path | Correctly excluded |
| Multi-device sync | Same as cloud backup; no backend | JSON export as device migration | Correctly excluded |
| Two-word combination tracking | Morphosyntax tracking is clinically meaningful but structurally complex (requires phrase entity + constituent word tracking); adds schema and UI complexity that distracts from core vocabulary use case | Track after core word/meaning model is validated | Correctly excluded |
| Photo / audio / video attachments | Dramatically increases storage requirements; IndexedDB is not designed for binary blobs of media; breaks offline-first storage budget | Text descriptions only for MVP | Correctly excluded |
| Multiple child profiles | Current design target is one child; adding multi-profile adds profile switching UI, per-profile data isolation, and export complexity | Single profile; defer multi-child to v2 | Correctly excluded |
| Onboarding tutorial / coach marks | First-time tutorials are skipped by 80%+ of users; the app is simple enough that a well-labelled empty state communicates the actions | Empty state text that says "Tap + to add your child's first word" is sufficient | Not in plan — confirm excluded |
| Account / login requirement | The core user base is parents in medically stressful situations; an email + password barrier before seeing data is an adoption killer | No account; data is local; JSON export is the portability layer | Correctly excluded |

---

## The Doctor Report Pattern

What formats parents actually use to share data with specialists, and what the report must contain.

### Clinical Context

Speech therapists work from parent reports because they see the child 30–60 minutes per week; the parent is the primary observer. SLPs document using the SOAP framework (Subjective / Objective / Assessment / Plan) and specifically want the Subjective section populated with structured parent observations. Neurologists want a comparable record.

The MacArthur-Bates CDI (Communicative Development Inventories) is the standard parent-report instrument for vocabulary. It uses a checklist format: "words child understands" and "words child says." Little Words' active meanings count is directly comparable to the CDI's "words produced" metric.

### What the Report Must Contain

1. **Child profile header** — name, date of birth (computed age at report date), languages at home
2. **Active vocabulary count** — active meanings count (the CDI-comparable number; call it "words" in the UI for parent clarity, "meanings" in documentation)
3. **Inactive meanings count** — words that have dropped out of use
4. **New this month** — rate of acquisition (clinically meaningful delta)
5. **Spontaneous vs. Prompted split** — percentage or count of each; this is the single most valuable clinical data point beyond raw count
6. **Category breakdown** — count per category (Nouns: 12, Verbs: 4, Food: 8, etc.)
7. **Gestures observed** — list with first/last observed date
8. **Word forms list** — the surface forms (the "sounds") mapped to their meanings, marked A/I for active/inactive
9. **Parent notes** — free-text qualitative observations persistent from the child profile
10. **Report date and period** — when the report was generated

### Format Decisions

- **Copy to clipboard** is the correct v1 delivery mechanism. Parents share via WhatsApp, SMS, or email to their specialist's admin; none of these require a file attachment. Clipboard text pastes cleanly into all of them.
- **Structured plain text** (not Markdown) is the safest clipboard format — renders readable in every messaging app without markup symbols appearing raw.
- **One-tap generation** — the report appears on screen and copies to clipboard in the same action; no "download" step.
- PDF is a v2 concern once the text format is validated with actual specialist users.

---

## PWA Install Prompt Patterns

When and how to prompt without annoying users.

### The Technical Constraint

The browser fires `beforeinstallprompt` after the user has interacted with the domain for at least 30 seconds and the PWA criteria are met (HTTPS, service worker, manifest). The event can only be re-triggered on the next page navigation if the user dismisses.

### Recommended Pattern for Little Words

1. **Do not prompt on load.** Prompting before the user has done anything is an anti-pattern; Chrome gates the event anyway.
2. **Show a persistent but subtle "Install app" button** in Settings or in a header/footer info bar after the user has added their first word. At this point the user has a data stake — they want persistence guarantees.
3. **Trigger the native prompt only on explicit user gesture** (tap on "Install app" button). The native browser dialog then handles the rest.
4. **After install**, remove the install button and instead show a "Installed — your data is protected from browser clearing" confirmation message once. This communicates the data-safety benefit of installation.
5. **On iOS Safari**, the `beforeinstallprompt` event is not fired. Show a manual instruction: "To install: tap the Share button, then 'Add to Home Screen'." Detect iOS by user agent and show this alternative flow.

### Why Installation Matters for Data Safety

Browsers can evict unprotected IndexedDB data under storage pressure. When the app is installed as a PWA, the browser is more likely to grant `navigator.storage.persist()` automatically. The app should call `navigator.storage.persist()` immediately after the first meaningful data write (e.g., first word added) and silently confirm persistence. Users do not need to see this — it is a background operation. The result should be logged to the console in development only.

---

## Offline Data Resilience — What Users Expect

| Scenario | User Expectation | Implementation |
|----------|-----------------|----------------|
| Opened as installed PWA with no connectivity | App opens instantly; all data visible; all entry flows work; no network indicator shown | Cache-first service worker for app shell; IndexedDB for data; never show "offline" banner for an app that is intentionally offline-first |
| Opened as browser tab (not installed) with no connectivity | App loads from service worker cache; works like the installed version | Same service worker strategy; make no distinction between tab and installed in the offline experience |
| Device storage pressure (low disk) | Data must not be silently evicted | Call `navigator.storage.persist()` after first write; if denied, show a one-time advisory "For data safety, install the app" |
| App update available | User sees a "New version available — tap to update" prompt; update happens on user confirmation | vite-plugin-pwa's `registerSW` with `prompt` strategy is the correct pattern; auto-update without prompt risks wiping form state |
| User clears browser data | All data is lost; this is expected and cannot be prevented | JSON export is the backup path; surface it in onboarding and in Settings |
| Import from JSON backup | Restores complete state | File picker → parse → validate schema → write to IndexedDB |

---

## MVP Recommendation

### Must Ship in v1

1. Child profile onboarding (name, DOB, languages)
2. FAB → bottom sheet word entry (word form + meaning + spontaneous/prompted + category + date)
3. Meaning autocomplete with inline creation
4. Dashboard: active meanings count, active word forms, new this month, recently added, top categories, review card
5. Meanings list view (flat, alphabetical, Active/Inactive visual distinction)
6. Word Forms list view
7. Categories view with meaning counts
8. Timeline view (monthly chart + table)
9. Gesture tracking (description + first/last date)
10. Detail page for edit + Active/Inactive toggle
11. Doctor Report: structured text → clipboard
12. Parent notes on child profile
13. JSON export + import
14. CSV export
15. PWA install (service worker + manifest + install prompt after first word)
16. Polish + English i18n
17. `navigator.storage.persist()` on first data write

### Defer to v2

- Search and filter
- Custom categories
- PDF report
- Photo / audio attachments
- Two-word combinations
- Multiple child profiles
- Cloud backup
- Multi-device sync

---

## Feature Dependencies

```
Child profile → all data entry (no orphan data)
Word Form → Meaning link (many-to-many; meanings survive form deletion)
Meaning → Category (meaning can have multiple)
Meaning → Spontaneous/Prompted flag
Meaning → Active/Inactive status
Meaning → first-use date, last-use date
Dashboard → all data (aggregation)
Doctor Report → child profile + all meanings + gestures + parent notes
Timeline → meanings with first-use dates
PWA install prompt → service worker registered + manifest valid + first word added
navigator.storage.persist() → first write to IndexedDB
```

---

## Sources

- [The 8 Best Speech Therapy Apps for Toddlers and Kids, Recommended by SLPs](https://www.expressable.com/learning-center/tips-and-resources/the-8-best-speech-therapy-apps-for-toddlers-and-kids-recommended-by-slps)
- [Speech and Language Reports Explained](https://www.speechsf.com/post/speech-and-language-reports-explained)
- [How To Write A Speech Therapy Progress Report](https://theadultspeechtherapyworkbook.com/speech-therapy-progress-report/)
- [MacArthur-Bates Communicative Development Inventories](https://mb-cdi.stanford.edu/)
- [CDI Updates from the CDI Advisory Board — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10264806/)
- [How to define your install strategy — web.dev](https://web.dev/articles/define-install-strategy)
- [Persistent storage — web.dev](https://web.dev/articles/persistent-storage)
- [StorageManager: persist() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [Storage quotas and eviction criteria — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [Offline storage for PWAs — LogRocket Blog](https://blog.logrocket.com/offline-storage-for-pwas/)
- [vite-plugin-pwa — GitHub](https://github.com/vite-pwa/vite-plugin-pwa)
- [Bottom Sheets: Definition and UX Guidelines — NN/g](https://www.nngroup.com/articles/bottom-sheet/)
- [Floating Action Button — Mobbin](https://mobbin.com/glossary/floating-action-button)
- [Breaking The Chain: Why Streak Features Fail ADHD Users — Klarity Health](https://www.helloklarity.com/post/breaking-the-chain-why-streak-features-fail-adhd-users-and-how-to-design-better-alternatives/)
- [Mobile Apps for Children's Health and Wellbeing — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10785842/)
- [When to screen for developmental language disorder — Frontiers in Pediatrics](https://www.frontiersin.org/journals/pediatrics/articles/10.3389/fped.2025.1646686/full)
- [Commercially Available Mobile Apps With Family Behavioral Goal Setting — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10612003/)
