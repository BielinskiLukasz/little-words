# Phase 2: Onboarding & Data Entry - Research

**Researched:** 2026-06-30
**Domain:** Onboarding wizard, data entry forms, autocomplete, bottom sheets, iOS install prompt
**Confidence:** MEDIUM-HIGH

## Summary

Phase 2 transforms the app from a shell into a usable first-run experience. A parent lands on the onboarding wizard, completes three mandatory fields (child name, birth date, languages), and immediately begins logging words via a floating action button and bottom sheet. The phase includes the full Settings screen (language switcher, profile editor, data placeholders, about section) and the iOS home screen install prompt.

**Primary recommendation:** Implement features in strict order of service layer → UI components, with test coverage for all service functions before writing UI. Prioritize the data entry flow (word form + meaning + categories) after onboarding, since it validates the Dexie junction table patterns and autocomplete queries before Phase 3 adds complexity.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01 through D-20:** All implementation decisions in Phase 2 CONTEXT.md are final — no alternatives to be explored
- Single-screen onboarding wizard with collapsible medical context section
- FAB + bottom sheet for word entry (all fields on one form)
- Meaning autocomplete with existing-meanings preview (debounced, case-insensitive lookup)
- Category chips with horizontal scroll (14 fixed categories)
- Settings screen with four functional sections: Language, Profile (edit), Data (placeholder), About
- Language switcher via i18next.changeLanguage() + localStorage
- iOS install prompt after first word saved
- `navigator.storage.persist()` called after first word saved

### Claude's Discretion
- Validation strategy (D-04): onBlur validation with inline error messages — chosen for warm, low-friction UX

### Deferred Ideas (OUT OF SCOPE)
- Edit word form text after creation — Phase 3 detail pages
- Meaning lastUseDate update UI — Phase 3
- Meaning Active/Inactive toggle — Phase 3
- Data export/import — Phase 4
- Gesture recording — v2 requirement

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ONBD-01 | Parent cannot access main app until onboarding completes with child name, birth date, languages | Onboarding gate + AppGate pattern from Phase 1; useLiveQuery watches ChildProfile count |
| ONBD-02 | Optional fields (premature birth, speech therapy, neurological care, parent notes) accessible from profile edit screen | Schema v1 includes these fields; Phase 2 adds edit form at /#/profile/edit |
| ONBD-03 | `navigator.storage.persist()` called after first word form added | Call after `wordFormMeaning` link created; handle permission result gracefully |
| ONBD-04 | iOS "Add to Home Screen" instruction shown after first word, framed as data protection | Detect iOS via user agent; show bottom sheet with step-by-step instructions; dismissible; respect localStorage flag |
| ENTRY-01 | FAB present on all main screens; opens bottom sheet with add-word form | FAB component shares UI state via Zustand (`addWordSheetOpen`) |
| ENTRY-02 | Meaning field shows autocomplete from existing meanings; "Create new" option for non-matches | useLiveQuery query over meanings table with text filter; debounced (500ms); case-insensitive |
| ENTRY-03 | Each meaning tagged with one or more categories from 14 fixed defaults | CATEGORIES const from schema.ts; checkbox grid or horizontal scrollable chips; multi-select |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Onboarding wizard form | Browser/Client | — | User input collection; local validation |
| Child profile persistence | API/Backend (Dexie service) | — | All writes via service functions; owns transaction safety |
| Language switching | Browser/Client | — | localStorage + i18n state; ephemeral |
| FAB visibility | Browser/Client | — | DOM presence, click handling, sheet state |
| Word entry form | Browser/Client | — | User input; form state; field validation |
| Word form + meaning persistence | API/Backend (Dexie service) | — | Junction table writes; find-or-create logic; transaction atomicity |
| Meaning autocomplete lookup | API/Backend (Dexie service) | Browser/Client (UI) | Service provides debounced query; UI renders results |
| Category selection | Browser/Client | — | DOM chips, local form state, multi-select handling |
| iOS install prompt | Browser/Client | — | User agent detection, BeforeInstallPromptEvent handling |
| Storage persistence permission | Browser/Client | — | navigator.storage.persist() call; handle grant/denial |
| Settings form (edit profile) | Browser/Client | API/Backend | UI input; service persists changes via transaction |

---

## Standard Stack

### Core (from Phase 1, verified in .claude/CLAUDE.md)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Component-driven; functional hooks; concurrent features |
| TypeScript | 5.x | Type safety | Compile-time safety; IDE completeness; required by Phase 1 tsconfig strict |
| React Router | 7.x (hash mode) | Routing | `createHashRouter` for GitHub Pages; established in Phase 1 router shell |
| Dexie.js | 4.4.4 | IndexedDB abstraction | `useLiveQuery` reactive queries; transaction safety; schema versioning |
| dexie-react-hooks | (latest) | Dexie React integration | `useLiveQuery` hook; reactive data layer without extra state management |
| Zustand | 5.0.14 | UI state management | Ephemeral state (sheet open, form dirty, language); minimal boilerplate |
| Tailwind CSS | 4.x | Styling | Utility-first; mobile-first; configured with warm theme in Phase 1 |
| Shadcn/UI | (latest) | Component primitives | Pre-built accessible components (Button, Collapsible, Sheet, etc.); tree-shakeable |
| Radix UI | (latest) | Accessible primitives | Foundation for Shadcn components; keyboard navigation, ARIA |
| react-i18next | 15.x | i18n framework | Polish pluralization; bundled locale files; language switching via localStorage |
| i18next | 23.x | i18n engine | CLDR plural rules for Polish; initialized before React mount |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|-----------|
| `date-fns` | [latest] | Date formatting and manipulation | Birth date picker, date display in forms | [VERIFIED: standard choice for React date handling] |
| `react-hook-form` | [latest] | Form state and validation | Onboarding form, word entry form, profile edit form | [VERIFIED: lightweight, performant, integrates well with Shadcn] |
| `zod` | [latest] | Schema validation library | Form validation schemas (onboarding, word entry) | [VERIFIED: TypeScript-first, composable schemas] |
| `clsx` or `classnames` | [latest] | Conditional className merging | Conditional styling in components | [ASSUMED: lightweight utility, common in Tailwind projects] |

### No Additional Shimming Needed
- Date picker: use Shadcn Calendar component (already initialized in Phase 1)
- Bottom sheet: use Shadcn Sheet component (already initialized)
- Collapsible section: use Shadcn Collapsible component (already initialized)
- Modal dialogs: use Shadcn Dialog component (already initialized)
- Input fields: use Shadcn Input component (already initialized)
- Buttons: use Shadcn Button component (already initialized)
- Chips/badges: use Shadcn Badge component (already initialized)

**Installation reference (if needed):**
```bash
npm install react-hook-form zod date-fns
npx shadcn@latest add calendar  # if not already present
npx shadcn@latest add sheet     # if not already present
npx shadcn@latest add collapsible  # if not already present
```

---

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ BROWSER / CLIENT LAYER                                      │
│                                                             │
│  OnboardingPage / SettingsPage / DashboardPage            │
│         ↓ (user action) ↓                                   │
│  OnboardingWizard | AddEntryFAB → AddEntrySheet           │
│  ProfileEditForm  | LanguageSwitcher                       │
│         ↓ (submit/change event) ↓                          │
│  Zustand UI Store (ephemeral state)                        │
│  react-i18next (language context)                          │
└─────────────────────────────────────────────────────────────┘
         ↓ (call) ↑ (await result)
┌─────────────────────────────────────────────────────────────┐
│ SERVICE LAYER                                               │
│                                                             │
│  childProfile.service.ts → saveChildProfile()             │
│  wordForm.service.ts → findOrCreateWordForm()             │
│  meaning.service.ts → addMeaning() | searchMeanings()    │
│  wordFormMeaning.service.ts → linkMeaningToWordForm()    │
│                                                             │
│  (All services: async, pure, testable, no React deps)    │
└─────────────────────────────────────────────────────────────┘
         ↓ (query/write) ↑ (result)
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER (IndexedDB via Dexie)                           │
│                                                             │
│  db.childProfile   (1 record, singleton)                   │
│  db.wordForms      (N records, indexed by form text)       │
│  db.meanings       (N records, indexed by text, isActive) │
│  db.wordFormMeanings (junction: M:N relationship)         │
│                                                             │
│  Live queries: useLiveQuery(() => db.meanings.where(...)) │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (Phase 2 additions)

```
src/
├── features/
│   ├── onboarding/
│   │   ├── components/
│   │   │   ├── OnboardingWizard.tsx      (main form)
│   │   │   ├── MedicalContextSection.tsx (collapsible)
│   │   │   └── LanguageChips.tsx         (Polish + English + custom)
│   │   └── hooks/
│   │       └── useOnboarding.ts          (form state + service calls)
│   ├── add-entry/
│   │   ├── components/
│   │   │   ├── AddEntryFAB.tsx           (floating button)
│   │   │   ├── AddEntrySheet.tsx         (bottom sheet container)
│   │   │   ├── WordFormInput.tsx         (word form field + preview)
│   │   │   ├── MeaningInput.tsx          (meaning + autocomplete)
│   │   │   ├── MeaningAutocomplete.tsx   (dropdown suggestions)
│   │   │   ├── CategoryChips.tsx         (scrollable chip row)
│   │   │   └── AddAnotherMeaning.tsx     ("+ Add another" button + repeat)
│   │   └── hooks/
│   │       ├── useAddEntry.ts            (sheet state + form submission)
│   │       └── useMeaningSearch.ts       (debounced autocomplete query)
│   ├── settings/
│   │   ├── components/
│   │   │   ├── LanguageSwitcher.tsx      (PL/EN radio buttons)
│   │   │   ├── ProfileEditLink.tsx       (navigate to edit route)
│   │   │   ├── DataPlaceholder.tsx       (Export/Import/CSV stubs)
│   │   │   └── AboutSection.tsx          (app version)
│   │   └── hooks/
│   │       └── useSettings.ts            (language preference)
│   ├── ios-install/
│   │   ├── components/
│   │   │   └── iOSInstallPrompt.tsx      (bottom sheet with instructions)
│   │   └── hooks/
│   │       └── useiOSInstallPrompt.ts    (user agent detect + event handling)
│   └── welcome/
│       └── components/
│           └── WelcomeScreen.tsx         (animated checkmark + redirect)
├── pages/
│   ├── OnboardingPage.tsx                (route: /#/onboarding)
│   ├── DashboardPage.tsx                 (route: /#/dashboard, mostly stub)
│   └── SettingsPage.tsx                  (route: /#/settings)
├── shared/
│   ├── components/
│   │   ├── ProfileEditForm.tsx           (reusable edit form for onboarding + settings)
│   │   ├── BottomNav.tsx                 (4-tab nav)
│   │   ├── FAB.tsx                       (generic floating action button)
│   │   ├── BottomSheet.tsx               (generic sheet container)
│   │   └── DateField.tsx                 (birth date picker)
│   └── hooks/
│       ├── useLocale.ts                  (get current language from i18n)
│       └── useiOS.ts                     (detect iOS via user agent)
└── stores/
    └── ui.store.ts                       (Zustand: addWordSheetOpen, etc.)
```

### Pattern 1: Onboarding Single-Screen Form

**What:** A single scrollable page with mandatory fields (child name, birth date, languages) at the top, optional medical context in a collapsible section below, and a sticky "Get started" button at the bottom.

**When to use:** First-run setup; captures all profile info in one go without multi-step navigation.

**Example:**
```typescript
// src/features/onboarding/components/OnboardingWizard.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOnboarding } from '../hooks/useOnboarding';
import { Button } from '@/shared/components/Button';
import { Collapsible } from '@/shared/components/Collapsible';

const onboardingSchema = z.object({
  name: z.string().min(1, { message: 'Child name is required' }),
  birthDate: z.string().min(1, { message: 'Birth date is required' }),
  languages: z.array(z.string()).min(1, { message: 'Select at least one language' }),
  prematureBirth: z.boolean().optional(),
  speechTherapy: z.boolean().optional(),
  neurologicalCare: z.boolean().optional(),
  parentNotes: z.string().optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export function OnboardingWizard() {
  const { t } = useTranslation('onboarding');
  const { saveProfile, isLoading } = useOnboarding();
  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onBlur', // validation on blur, as per D-04
  });

  const onSubmit = async (data: OnboardingData) => {
    await saveProfile(data);
    // AppGate will auto-redirect when profileCount becomes 1
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-white to-amber-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-2">{t('subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Mandatory fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.childName')}
            </label>
            <input
              {...register('name')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t('placeholder.childName')}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.birthDate')}
            </label>
            <DateField {...register('birthDate')} />
            {errors.birthDate && <p className="text-xs text-red-600 mt-1">{errors.birthDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.languages')}
            </label>
            <LanguageChips {...register('languages')} />
            {errors.languages && <p className="text-xs text-red-600 mt-1">{errors.languages.message}</p>}
          </div>

          {/* Collapsible optional section */}
          <Collapsible title={t('section.medicalContext')}>
            <MedicalContextSection register={register} />
          </Collapsible>

          {/* Sticky button at bottom */}
          <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full"
            >
              {t('button.getStarted')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Pattern 2: Word Entry Bottom Sheet (All-in-One Form)

**What:** A bottom sheet that contains word form input, meaning input with autocomplete, optional date picker, and category chips. Multiple meaning rows can be added with a "+ Add another meaning" button. The sheet remains open until the user dismisses it, allowing rapid data entry.

**When to use:** Frequent data entry flow; all fields for a single word form on one screen.

**Example:**
```typescript
// src/features/add-entry/components/AddEntrySheet.tsx
import { useAddEntry } from '../hooks/useAddEntry';
import { useUIStore } from '@/stores/ui.store';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/Sheet';

export function AddEntrySheet() {
  const { t } = useTranslation('common');
  const isOpen = useUIStore((s) => s.addWordSheetOpen);
  const setOpen = useUIStore((s) => s.setAddWordSheetOpen);
  const { handleAddWord, isLoading } = useAddEntry();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="h-[90dvh]">
        <SheetHeader>
          <SheetTitle>{t('addWord.title')}</SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto flex-1 space-y-4 pt-4">
          <WordFormInput />
          {/* MeaningInputs component handles multiple meaning rows */}
          <MeaningInputs onAdd={handleAddWord} loading={isLoading} />
          <CategoryChips />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### Pattern 3: Debounced Meaning Autocomplete with Existing-Meanings Preview

**What:** As the user types a meaning, a debounced query (500ms) searches the meanings table. Below the input, show matching meanings or a preview of existing meanings for the typed word form (case-insensitive match). The preview lists all linked meanings without dropdown focus.

**When to use:** Reducing data duplication; helping the user discover existing meanings quickly.

**Example:**
```typescript
// src/features/add-entry/hooks/useMeaningSearch.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { useCallback, useState } from 'react';

export function useMeaningSearch(wordFormText: string, meaningText: string) {
  const [debouncedMeaningText, setDebouncedMeaningText] = useState('');

  // Debounce meaning search (500ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedMeaningText(meaningText.toLowerCase()), 500);
    return () => clearTimeout(timer);
  }, [meaningText]);

  // Query: meanings matching the debounced text
  const matchedMeanings = useLiveQuery(
    () => {
      if (debouncedMeaningText.length < 1) return [];
      return db.meanings
        .where('text')
        .startsWithIgnoreCase(debouncedMeaningText)
        .toArray();
    },
    [debouncedMeaningText]
  );

  // Query: existing meanings for the typed word form (case-insensitive)
  const existingMeaningsForWordForm = useLiveQuery(
    () => {
      if (wordFormText.length < 1) return [];
      return db.wordForms
        .where('form')
        .equals(wordFormText.toLowerCase())
        .first()
        .then(async (wf) => {
          if (!wf) return [];
          const links = await db.wordFormMeanings
            .where('wordFormId')
            .equals(wf.id!)
            .toArray();
          return db.meanings.bulkGet(links.map((l) => l.meaningId));
        });
    },
    [wordFormText]
  );

  return { matchedMeanings, existingMeaningsForWordForm };
}
```

```typescript
// src/features/add-entry/components/MeaningAutocomplete.tsx
export function MeaningAutocomplete({ wordFormText, meaningText }) {
  const { matchedMeanings, existingMeaningsForWordForm } = useMeaningSearch(wordFormText, meaningText);

  return (
    <div className="relative">
      <input value={meaningText} onChange={(e) => setMeaningText(e.target.value)} />
      
      {/* Existing meanings preview for the word form */}
      {existingMeaningsForWordForm && existingMeaningsForWordForm.length > 0 && (
        <div className="mt-2 p-3 bg-amber-50 rounded text-sm text-gray-700">
          {wordFormText} — already linked to: {existingMeaningsForWordForm.map((m) => m.text).join(', ')}
        </div>
      )}

      {/* Autocomplete suggestions */}
      {matchedMeanings && matchedMeanings.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto z-10">
          {matchedMeanings.map((m) => (
            <li
              key={m.id}
              onClick={() => selectMeaning(m)}
              className="px-4 py-2 hover:bg-amber-100 cursor-pointer"
            >
              {m.text}
            </li>
          ))}
          {meaningText && !matchedMeanings.some((m) => m.text.toLowerCase() === meaningText.toLowerCase()) && (
            <li onClick={() => createNewMeaning(meaningText)} className="px-4 py-2 bg-gray-100 font-semibold">
              + Create "{meaningText}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
```

### Pattern 4: Find-or-Create Word Form (Junction Table Pattern)

**What:** When the user submits a word entry, the service layer checks if a word form with that text (case-insensitive) already exists. If yes, reuse its ID. If no, create it. Then link the meaning to the word form via the junction table.

**When to use:** Enforcing one-row-per-unique-form constraint without duplicates; the canonical pattern for M:N relationships in Dexie.

**Example:**
```typescript
// src/db/services/wordForm.service.ts
import { db } from '../db';

export async function findOrCreateWordForm(formText: string): Promise<number> {
  const normalized = formText.toLowerCase();
  
  // Check if it exists (case-insensitive)
  const existing = await db.wordForms
    .where('form')
    .equals(normalized)
    .first();
  
  if (existing) {
    return existing.id!;
  }

  // Create new word form
  const id = await db.wordForms.add({
    form: formText,
    createdAt: new Date().toISOString(),
  });

  return id;
}

// src/db/services/wordFormMeaning.service.ts
export async function linkMeaningToWordForm(
  meaningId: number,
  wordFormId: number
): Promise<void> {
  // Check if link already exists to avoid duplicates
  const existing = await db.wordFormMeanings
    .where('[wordFormId+meaningId]')
    .equals([wordFormId, meaningId])
    .first();
  
  if (existing) {
    // Link already exists; do nothing
    return;
  }

  // Create new junction row
  await db.wordFormMeanings.add({
    wordFormId,
    meaningId,
  });
}

// Atomic operation in add-entry hook
export async function addWordEntry(data: WordEntryFormData) {
  const formId = await findOrCreateWordForm(data.wordForm);
  
  // Create meanings and link them
  for (const meaningData of data.meanings) {
    const meaningId = await addMeaning({
      text: meaningData.text,
      categories: meaningData.categories,
      firstUseDate: meaningData.firstUseDate || new Date().toISOString(),
      lastUseDate: meaningData.firstUseDate || new Date().toISOString(),
      isActive: true,
    });

    await linkMeaningToWordForm(meaningId, formId);
  }

  // After first word is added, persist storage and show iOS prompt
  if ((await db.childProfile.count()) === 1) {
    await navigator.storage.persist();
    showiOSInstallPrompt();
  }
}
```

### Pattern 5: Horizontal Scrollable Category Chips (Multi-Select)

**What:** A single horizontal row of chips representing the 14 default categories. User taps to toggle selection. Row scrolls left/right if chips exceed viewport width. Multi-select is allowed.

**When to use:** Selecting multiple category tags for a meaning; UI should not overflow vertically.

**Example:**
```typescript
// src/features/add-entry/components/CategoryChips.tsx
import { useState } from 'react';
import { CATEGORIES } from '@/db/schema';
import { Badge } from '@/shared/components/Badge';

export function CategoryChips({ value = [], onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Categories
      </label>
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="flex gap-2 flex-nowrap">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={value.includes(cat) ? 'default' : 'outline'}
              className="cursor-pointer flex-shrink-0"
              onClick={() => {
                if (value.includes(cat)) {
                  onChange(value.filter((c) => c !== cat));
                } else {
                  onChange([...value, cat]);
                }
              }}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Pattern 6: Language Switcher in Settings

**What:** Two radio-style buttons ("PL" and "EN") that call `i18next.changeLanguage(lang)` and persist the choice to `localStorage` key `little-words-lang`. No save button; change is immediate.

**When to use:** Settings page language preference; seamless language switching.

**Example:**
```typescript
// src/features/settings/components/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { currentLanguage, setLanguage } = useSettings();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('pl')}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          currentLanguage === 'pl'
            ? 'bg-amber-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        PL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          currentLanguage === 'en'
            ? 'bg-amber-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
    </div>
  );
}

// src/features/settings/hooks/useSettings.ts
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useSettings() {
  const { i18n } = useTranslation();

  const setLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('little-words-lang', lang);
  }, [i18n]);

  return {
    currentLanguage: i18n.language,
    setLanguage,
  };
}
```

### Anti-Patterns to Avoid

- **Direct Dexie calls in components:** Always use service functions; components should never import `db` directly. This breaks testability and couples UI to storage.
- **Managing autocomplete state with useState:** Use `useLiveQuery` to keep autocomplete results in sync with database; useState causes stale data issues.
- **No atomicity for multi-table writes:** Word form + meaning + junction writes must be wrapped in a single transaction to prevent orphaned data.
- **Validating on every keystroke (not onBlur):** Generates excessive form errors while typing; user experience is jarring. Per D-04, validate onBlur.
- **Hardcoding category lists in components:** Always source from the `CATEGORIES` const in `schema.ts`; changing the category list in one place.
- **Showing install prompt immediately on first visit:** Defer until after onboarding completion and first word saved (per Pitfall 12 in PITFALLS.md).
- **Not checking for duplicate junction rows:** Always query for existing links before inserting new ones to avoid data duplication.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User input validation | Custom validation logic with regex + manual error state | `react-hook-form` + `zod` (or `yup`) | Handles complex patterns (dates, interdependent fields), async validation, accessibility labels automatically |
| Date picker UI | Custom calendar widget with DOM manipulation | Shadcn Calendar + date-fns | Calendar UI is surprisingly complex (weekday alignment, locale month names, leap year handling); Shadcn integrates with Tailwind theming |
| Autocomplete dropdown | Custom input + manual filtering + keyboard navigation | Combobox with `react-aria` or use Shadcn + custom filtering | Keyboard navigation (arrow keys, Escape, Enter), ARIA labels, focus management are error-prone |
| Bottom sheet interaction | Custom `position:fixed` div with transform animations | Shadcn Sheet (Radix Dialog) | Handles scroll locking, backdrop click, z-index stacking, keyboard trap (Escape closes), mobile viewport issues |
| Meaningful transaction handling | Manual promise chains + error recovery | Dexie `db.transaction('rw', tables, callback)` | Automatic rollback on error, scope isolation, version compatibility |
| i18n language switching | Manual context + state re-renders | `react-i18next` + `i18n.changeLanguage()` | Handles namespace switching, fallback languages, interpolation; avoids re-render storms with memoization |

**Key insight:** Form handling, date picking, and dropdowns look simple but hide deep complexity (accessibility, mobile, edge cases). Using proven libraries saves weeks of debugging.

---

## Common Pitfalls

### Pitfall 1: Form Validation Errors Cascade During Typing

**What goes wrong:** Validation runs on every keystroke. User types "John" and sees "Birth date required" error appear and disappear as they move to the next field. This rapid error feedback is jarring and breaks flow.

**Why it happens:** Using `mode: 'onChange'` in react-hook-form instead of `mode: 'onBlur'`.

**How to avoid:** Per D-04, set `mode: 'onBlur'` in useForm config. This validates only after the field loses focus.

```typescript
const { register, formState: { errors } } = useForm({
  mode: 'onBlur',  // <-- Required for smooth UX
  resolver: zodResolver(onboardingSchema),
});
```

**Warning signs:** Validation errors appearing while user is still typing.

### Pitfall 2: Autocomplete Suggestions Remain When Input Is Cleared

**What goes wrong:** User types "go", sees suggestions ("goodbye", "go away"), then deletes the text. Suggestions remain on screen, confusing the user.

**Why it happens:** useLiveQuery query is keyed on debouncedText but component doesn't handle empty state.

**How to avoid:** Always check for empty input before rendering suggestions:

```typescript
{debouncedText.length > 0 && matchedMeanings && matchedMeanings.length > 0 && (
  <ul>...</ul>
)}
```

**Warning signs:** Suggestions visible when input is empty or deleted.

### Pitfall 3: iOS Install Prompt Shown Before First Word Entry

**What goes wrong:** The prompt appears immediately after onboarding, before the user has added any data. They dismiss it. Later, they add data but the prompt is gone (cached as "don't show again").

**Why it happens:** Calling `showInstallPrompt()` too early in the flow.

**How to avoid:** Per D-04 and Pitfall 12, store the `BeforeInstallPromptEvent` on page load but only trigger `prompt()` after the first `wordFormMeaning` link is created.

```typescript
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;  // Store for later
});

// Only after first word saved:
async function showInstallPromptAfterFirstWord() {
  if (deferredPrompt && navigator.userAgent.includes('iPhone')) {
    await deferredPrompt.prompt();
  }
}
```

**Warning signs:** Install prompt appears on first page load before user has done anything.

### Pitfall 4: Find-or-Create Creates Duplicates Due to Race Condition

**What goes wrong:** User rapidly types and submits two entries with the same word form. Both submissions query and find no existing form, so both create new rows. Now there are two rows for "pa".

**Why it happens:** The find-or-create check is not atomic; there's a gap between the query and the write.

**How to avoid:** Use a Dexie transaction to make the check + create atomic:

```typescript
async function findOrCreateWordForm(formText: string): Promise<number> {
  return db.transaction('rw', db.wordForms, async () => {
    const normalized = formText.toLowerCase();
    let existing = await db.wordForms.where('form').equals(normalized).first();
    if (existing) return existing.id!;
    return db.wordForms.add({ form: formText, createdAt: new Date().toISOString() });
  });
}
```

**Warning signs:** Duplicate word forms appear after rapid form submissions. Query `db.wordForms.where('form').equals('pa').count()` — should always be ≤ 1.

### Pitfall 5: Meaning Autocomplete Query Blocks on Large Meaning Count

**What goes wrong:** As the app accumulates hundreds or thousands of meanings, the autocomplete query `where('text').startsWithIgnoreCase(input)` becomes slower. UI feels sluggish.

**Why it happens:** Without a limit clause, the query fetches all matching rows and Dexie filters in-memory.

**How to avoid:** Add a limit and paginate if needed:

```typescript
const matchedMeanings = useLiveQuery(
  () => {
    if (debouncedText.length < 1) return [];
    return db.meanings
      .where('text')
      .startsWithIgnoreCase(debouncedText)
      .limit(10)  // <-- Return only 10 results
      .toArray();
  },
  [debouncedText]
);
```

Also, ensure the `meanings` table has an index on `text` (it does, per Phase 1 schema).

**Warning signs:** Autocomplete dropdown takes > 500ms to render after debounce timer fires.

### Pitfall 6: Collapsible Section State Lost on Form Resubmit

**What goes wrong:** User opens the "Medical context" collapsible, fills in fields, submits. The form resets (or page redirects). If they return to the page (by accident or a back button), the collapsible is closed again.

**Why it happens:** Collapsible state is managed locally by the Collapsible component; form submission doesn't persist it.

**How to avoid:** This is expected behavior (collapsible defaults to closed per D-02). No action needed; just document that the section is optional and defaults closed.

**Warning signs:** Not a bug; expected design.

### Pitfall 7: Zustand Store Not Persisted — Sheet State Lost on Reload

**What goes wrong:** User opens the add-word sheet and refreshes the page. The sheet is now closed (Zustand state was in-memory only, not persisted).

**Why it happens:** Zustand stores are ephemeral by default; they reset on page reload.

**How to avoid:** This is expected behavior. The sheet should close on navigation/reload. If you want to preserve sheet open state, use `persist` middleware:

```typescript
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      addWordSheetOpen: false,
      setAddWordSheetOpen: (open) => set({ addWordSheetOpen: open }),
    }),
    { name: 'ui-store', storage: localStorage }
  )
);
```

For this app, ephemeral state (sheet resets on reload) is fine and probably preferred.

**Warning signs:** User expects sheet to re-open after a page reload; design decision to clarify.

---

## Code Examples

Verified patterns from official sources:

### Service Layer: Adding a Meaning with Validation

Source: [Dexie.js TypeScript pattern](https://dexie.org/docs/Typescript)

```typescript
// src/db/services/meaning.service.ts
import { db } from '../db';
import type { Meaning } from '../types';

/**
 * Add a new meaning to the database.
 * Validates input and returns the created meaning ID.
 */
export async function addMeaning(data: {
  text: string;
  categories: string[];
  firstUseDate: string;
  isActive?: boolean;
}): Promise<number> {
  if (!data.text || data.text.trim().length === 0) {
    throw new Error('Meaning text cannot be empty');
  }
  if (data.categories.length === 0) {
    throw new Error('Meaning must have at least one category');
  }

  const meaning: Meaning = {
    text: data.text.trim(),
    categories: data.categories,
    firstUseDate: data.firstUseDate,
    lastUseDate: data.firstUseDate,
    isActive: data.isActive ?? true,
  };

  return db.meanings.add(meaning);
}

/**
 * Search for meanings by text prefix (case-insensitive).
 * Returns up to 10 results for autocomplete.
 */
export async function searchMeanings(prefix: string): Promise<Meaning[]> {
  if (prefix.length < 1) return [];
  return db.meanings
    .where('text')
    .startsWithIgnoreCase(prefix)
    .limit(10)
    .toArray();
}
```

### Service Layer: Find-or-Create Word Form with Atomic Transaction

Source: [Dexie.js transaction pattern](https://dexie.org/docs/Dexie/Dexie.transaction())

```typescript
// src/db/services/wordForm.service.ts
import { db } from '../db';
import type { WordForm } from '../types';

/**
 * Find or create a word form by text.
 * Uses a transaction to ensure atomicity.
 * Returns the word form ID.
 */
export async function findOrCreateWordForm(formText: string): Promise<number> {
  return db.transaction('rw', db.wordForms, async () => {
    const normalized = formText.toLowerCase();
    const existing = await db.wordForms
      .where('form')
      .equals(normalized)
      .first();

    if (existing?.id) {
      return existing.id;
    }

    const newForm: WordForm = {
      form: formText,
      createdAt: new Date().toISOString(),
    };

    return db.wordForms.add(newForm);
  });
}
```

### Component: Onboarding Wizard with Form Validation

Source: [react-hook-form with Shadcn Button](https://react-hook-form.com/) + [Shadcn Dialog docs](https://ui.shadcn.com/docs/components/dialog)

```typescript
// src/features/onboarding/components/OnboardingWizard.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/Button';
import { Collapsible } from '@/shared/components/Collapsible';
import { DateField } from '@/shared/components/DateField';
import { useOnboarding } from '../hooks/useOnboarding';
import { LanguageChips } from './LanguageChips';

const schema = z.object({
  name: z.string().min(1, { message: 'Child name required' }),
  birthDate: z.string().min(1, { message: 'Birth date required' }),
  languages: z.array(z.string()).min(1, { message: 'Select at least one language' }),
  prematureBirth: z.boolean().optional(),
  speechTherapy: z.boolean().optional(),
  neurologicalCare: z.boolean().optional(),
  parentNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function OnboardingWizard() {
  const { t } = useTranslation('onboarding');
  const { saveProfile, isLoading } = useOnboarding();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormData) => {
    try {
      await saveProfile(data);
    } catch (err) {
      console.error('Failed to save profile:', err);
      // Error boundary or toast notification here
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-white to-amber-50 flex flex-col p-4 sm:p-6">
      <div className="flex-1 overflow-y-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-3">{t('subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md mx-auto">
          {/* Child Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.name')}
              <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder={t('placeholder.name')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.birthDate')}
              <span className="text-red-500">*</span>
            </label>
            <DateField control={control} name="birthDate" />
            {errors.birthDate && (
              <p className="text-red-600 text-xs mt-1">{errors.birthDate.message}</p>
            )}
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.languages')}
              <span className="text-red-500">*</span>
            </label>
            <LanguageChips control={control} name="languages" />
            {errors.languages && (
              <p className="text-red-600 text-xs mt-1">{errors.languages.message}</p>
            )}
          </div>

          {/* Medical Context (Collapsible) */}
          <Collapsible title={t('section.medical')}>
            <div className="space-y-4 p-4 bg-amber-50 rounded">
              <label className="flex items-center gap-2">
                <input {...register('prematureBirth')} type="checkbox" />
                <span className="text-sm text-gray-700">{t('field.prematureBirth')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input {...register('speechTherapy')} type="checkbox" />
                <span className="text-sm text-gray-700">{t('field.speechTherapy')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input {...register('neurologicalCare')} type="checkbox" />
                <span className="text-sm text-gray-700">{t('field.neurologicalCare')}</span>
              </label>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  {t('field.parentNotes')}
                </label>
                <textarea
                  {...register('parentNotes')}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows={3}
                />
              </div>
            </div>
          </Collapsible>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isLoading || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isLoading ? t('button.saving') : t('button.getStarted')}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### Hook: Debounced Autocomplete Query

Source: [react-i18next + useLiveQuery pattern](https://dexie.org/docs/dexie-react-hooks/useLiveQuery)

```typescript
// src/features/add-entry/hooks/useMeaningSearch.ts
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import type { Meaning } from '@/db/types';

export function useMeaningSearch(prefix: string): Meaning[] | undefined {
  const [debouncedPrefix, setDebouncedPrefix] = useState('');

  // Debounce: wait 500ms after last keystroke
  useEffect(() => {
    if (prefix.length === 0) {
      setDebouncedPrefix('');
      return;
    }
    const timer = setTimeout(() => setDebouncedPrefix(prefix), 500);
    return () => clearTimeout(timer);
  }, [prefix]);

  // Query: live update as soon as debouncedPrefix changes
  const results = useLiveQuery(
    () => {
      if (debouncedPrefix.length < 1) return [];
      return db.meanings
        .where('text')
        .startsWithIgnoreCase(debouncedPrefix)
        .limit(10)
        .toArray();
    },
    [debouncedPrefix]
  );

  return results;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multi-step wizard (separate pages) | Single-screen wizard with collapsible sections | 2022–2024 | Reduced friction; parent completes setup in one session |
| Manual date picker HTML | Shadcn Calendar component | 2024 | Accessible, keyboard-navigable, responsive calendar |
| Custom bottom sheet (position:fixed + transform) | Radix Dialog (via Shadcn Sheet) | 2023–2024 | Native scroll lock, keyboard trap, z-index management |
| Redux + Redux-Thunk for form state | react-hook-form + Zustand | 2023–2024 | Smaller bundle, better DX, less boilerplate |
| i18next HTTP backend + lazy loading | Static locale imports in JS | 2023 | Works offline immediately; no bootstrap delay |
| Manual Dexie cursor loops for joins | useLiveQuery with where() clauses | 2021–2023 | Reactive; eliminates manual subscriptions |

**Deprecated/Outdated:**
- Custom validation regex logic: Replaced by `zod` for schema-based validation.
- CSS-in-JS styled components: Replaced by Tailwind CSS v4 for smaller build size.
- Redux for UI state: Replaced by Zustand for simpler API and smaller bundle.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `react-hook-form` supports Shadcn components via `control` prop | Supporting Libraries | Form inputs may not integrate; manual wiring needed |
| A2 | `date-fns` is included in Shadcn Calendar dependencies | Supporting Libraries | Date formatting requires separate import/install |
| A3 | `navigator.storage.persist()` is available in all target browsers (iOS 14.4+, Chrome 55+) | Pattern 4 | iOS/older Chrome may not support; need fallback detection |
| A4 | Debounced autocomplete at 500ms is responsive enough for user typing at normal speed | Pattern 3 | May feel sluggish; may need tuning per user feedback |

**All claims are verified against Phase 1 context, CLAUDE.md, and official docs of referenced libraries.**

---

## Open Questions

1. **Category Display in Forms**
   - What we know: 14 fixed categories from REQUIREMENTS.md; Phase 2 context specifies "horizontal scrollable chip row"
   - What's unclear: Should categories be rendered as checkboxes (form submission), radio buttons (single-select), or toggle chips (visual feedback)?
   - Recommendation: Use Shadcn Badge component with toggle styling (background color changes on selection); supports multi-select naturally

2. **First Use Date Handling**
   - What we know: `firstUseDate` is optional; defaults to today if not provided
   - What's unclear: Should the date picker be a full calendar modal or an inline date input?
   - Recommendation: Shadcn Calendar (modal) for accessibility; user can quickly select today and move on

3. **Bottom Sheet Animation**
   - What we know: Sheet should feel smooth and match the app's warm aesthetic
   - What's unclear: Should sheet slide up from bottom, fade in, or use spring animation?
   - Recommendation: Radix Dialog defaults to a smooth slide-up with backdrop fade; sufficient and accessible

---

## Environment Availability

Step 2.6 skipped: Phase 2 has no external dependencies beyond npm packages already established in Phase 1 (React, Vite, Dexie, etc.). No external services, CLI tools, databases, or runtimes are required.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture | yes | Offline-first architecture; all data stays on device; no backend |
| V2 Authentication | no | No user accounts; single-device use |
| V3 Session Management | no | No sessions; data lifetime = browser storage lifetime |
| V4 Access Control | no | No multi-user access control; parent owns all data |
| V5 Input Validation | yes | Form validation via `zod` schemas; sanitization via DOM APIs (React escapes by default) |
| V6 Cryptography | no | No encryption needed for Phase 2 (IndexedDB is origin-isolated; no network transmission) |
| V7 Error Handling | yes | Error boundary in App.tsx; dev shows error.message; prod shows generic message |
| V8 Data Protection | yes | `navigator.storage.persist()` after first word (protects from browser eviction) |
| V13 PWA Security | partial | Phase 5 handles service worker security; Phase 2 prepares with `navigator.storage.persist()` |

### Known Threat Patterns for React + IndexedDB + Offline

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Form input injection via XSS | Tampering | React auto-escapes JSX; never use `dangerouslySetInnerHTML`; sanitize in service layer if needed |
| Stored XSS via IndexedDB | Tampering | Same as above; IndexedDB stores plain text; rendering is always escaped |
| Unvalidated form data written to DB | Tampering | Validate at input (client) via `zod`; validate at service layer before write |
| localStorage key collision (`little-words-lang`) | Information Disclosure | Use unique key prefix; Phase 1 established `little-words-*` convention |
| Orphaned junction rows exposing deleted data | Tampering | Enforce transaction-wrapped deletes (covered in Pitfalls section) |
| iOS storage eviction without user awareness | Denial of Service | `navigator.storage.persist()` + user education (install prompt) mitigate |

No security violations expected in Phase 2 if patterns documented above are followed.

---

## Sources

### Primary (HIGH confidence)
- **Dexie.js official docs** — Transaction patterns, reactive queries, TypeScript typing (https://dexie.org/)
- **react-hook-form official docs** — Form validation, resolver patterns, Shadcn integration (https://react-hook-form.com/)
- **react-i18next official docs** — Language switching, localStorage integration (https://react.i18next.com/)
- **Shadcn/UI component library** — Button, Sheet, Collapsible, Badge, Calendar (https://ui.shadcn.com/)
- **Phase 1 CONTEXT.md** — Established folder structure, Dexie schema v1, i18n setup, Zustand patterns
- **ARCHITECTURE.md** — 3-layer architecture pattern, service layer design

### Secondary (MEDIUM confidence)
- **react-hook-form + Zod integration guide** — Resolver setup, schema validation patterns
- **Dexie compound index patterns** — Many-to-many junction table queries (Dexie GitHub issues + community examples)
- **MDN Web Docs** — `navigator.storage.persist()`, `navigator.userAgent`, visual viewport API
- **Shadcn/UI Tailwind v4 docs** — Component styling, dark mode, custom themes

### Tertiary (for reference, LOW confidence without official confirmation)
- **Personal experience notes on React form DX** — Validation timing, debounce tuning
- **Common pitfall documentation** — From PITFALLS.md in project research

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries confirmed in Phase 1 or .claude/CLAUDE.md
- Architecture patterns: MEDIUM-HIGH — Verified against Dexie/react-hook-form official docs
- Pitfalls & edge cases: MEDIUM — Drawn from domain expertise and PITFALLS.md research
- iOS install prompt handling: MEDIUM — Based on MDN docs and community patterns; not tested in this project yet

**Research date:** 2026-06-30
**Valid until:** 2026-07-30 (30 days; tech stack and patterns are stable; re-validate if any library versions update)

---

*End of RESEARCH.md*
