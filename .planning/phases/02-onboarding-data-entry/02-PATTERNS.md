# Phase 2: Onboarding & Data Entry - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 27 new/modified files
**Analogs found:** 15 / 27

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/OnboardingPage.tsx` | page | request-response | (stub, self) | exact |
| `src/pages/SettingsPage.tsx` | page | request-response | (stub, self) | exact |
| `src/pages/DashboardPage.tsx` | page | request-response | (stub, self) | exact |
| `src/pages/ProfileEditPage.tsx` | page | request-response | `src/pages/MorePage.tsx` | role-match |
| `src/features/onboarding/components/OnboardingWizard.tsx` | component | request-response | `src/shared/components/BottomNav.tsx` | partial (form pattern) |
| `src/features/onboarding/components/MedicalContextSection.tsx` | component | request-response | (none) | none |
| `src/features/onboarding/components/LanguageChips.tsx` | component | request-response | (none) | none |
| `src/features/add-entry/components/AddEntrySheet.tsx` | component | request-response | `src/shared/components/RootLayout.tsx` | partial (layout/structure) |
| `src/features/add-entry/components/AddEntryFAB.tsx` | component | request-response | `src/shared/components/BottomNav.tsx` | partial (icon button) |
| `src/features/add-entry/components/WordFormInput.tsx` | component | request-response | `src/components/ui/button.tsx` | partial (input handling) |
| `src/features/add-entry/components/MeaningInput.tsx` | component | request-response | (none) | none |
| `src/features/add-entry/components/MeaningAutocomplete.tsx` | component | request-response | (none) | none |
| `src/features/add-entry/components/CategoryChips.tsx` | component | request-response | (none) | none |
| `src/features/welcome/components/WelcomeScreen.tsx` | component | request-response | `src/pages/DashboardPage.tsx` | partial (centered display) |
| `src/features/settings/components/LanguageSwitcher.tsx` | component | request-response | `src/shared/components/BottomNav.tsx` | partial (button styling) |
| `src/features/settings/components/ProfileEditLink.tsx` | component | request-response | `src/pages/MorePage.tsx` | partial (navigation link) |
| `src/features/settings/components/DataPlaceholder.tsx` | component | request-response | (none) | none |
| `src/features/settings/components/AboutSection.tsx` | component | request-response | (none) | none |
| `src/features/ios-install/components/iOSInstallPrompt.tsx` | component | request-response | (none) | none |
| `src/shared/components/ProfileEditForm.tsx` | component | request-response | (none) | none |
| `src/db/services/childProfile.service.ts` | service | CRUD | (stub, self) | exact |
| `src/db/services/wordForm.service.ts` | service | CRUD find-or-create | (stub, self) | exact |
| `src/db/services/meaning.service.ts` | service | CRUD search | (stub, self) | exact |
| `src/db/services/wordFormMeaning.service.ts` | service | CRUD link | (none) | none |
| `src/features/onboarding/hooks/useOnboarding.ts` | hook | CRUD + request-response | (none) | none |
| `src/features/add-entry/hooks/useAddEntry.ts` | hook | CRUD + request-response | (none) | none |
| `src/features/add-entry/hooks/useMeaningSearch.ts` | hook | streaming (reactive query) | (none) | none |
| `src/features/settings/hooks/useSettings.ts` | hook | request-response | (none) | none |
| `src/features/ios-install/hooks/useiOSInstallPrompt.ts` | hook | request-response | (none) | none |
| `src/stores/ui.store.ts` | store | request-response (state) | (self, existing) | exact |

---

## Pattern Assignments

### Pages: Structure & Layout Pattern

**Source:** `src/pages/MorePage.tsx`, `src/pages/CategoriesPage.tsx`, `src/shared/components/RootLayout.tsx`

**Imports pattern:**
```typescript
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
```

**Page structure pattern** (lines 1-5 of MorePage):
```typescript
import { Link } from 'react-router';

export function MorePage() {
  return (
    <div className="flex flex-col gap-4 p-6">
```

**Empty page pattern** (from DashboardPage, CategoriesPage):
```typescript
export function PageName() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-muted-foreground">Coming soon</p>
    </div>
  );
}
```

**Centered container pattern** (from ErrorBoundary, App.tsx):
```typescript
<div className="flex h-[100dvh] items-center justify-center bg-background">
  {/* Content */}
</div>
```

**Apply to:** All page files (OnboardingPage, SettingsPage, DashboardPage, ProfileEditPage)

---

### Forms & Hooks: React Hook Form + Zod Pattern

**Source:** RESEARCH.md §Pattern 1, Pattern 4 (verified against react-hook-form + zod official docs)

**Service layer type safety** (from childProfile.service.ts):
```typescript
export async function saveChildProfile(
  profile: Omit<ChildProfile, 'id'>
): Promise<number> {
  return db.childProfile.add(profile) as Promise<number>
}
```

**Error handling pattern** (from ErrorBoundary):
```typescript
try {
  await saveProfile(data);
} catch (err) {
  console.error('Failed to save profile:', err);
  // Error boundary or toast notification here
}
```

**useTranslation pattern** (established in App.tsx, BottomNav.tsx):
```typescript
const { t } = useTranslation('onboarding'); // namespace parameter
// or
const { t } = useTranslation(); // uses 'common' by default
```

**Form submission pattern** (from react-hook-form docs):
```typescript
const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Per D-04: validation on blur, not onChange
});

const onSubmit = async (data: FormData) => {
  await serviceFunction(data);
};

return <form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</form>;
```

**Validation error display** (from RESEARCH.md Pattern 1):
```typescript
{errors.fieldName && (
  <p className="text-red-600 text-xs mt-1">{errors.fieldName.message}</p>
)}
```

**Apply to:** All form components (OnboardingWizard, AddEntrySheet, ProfileEditForm, MeaningInput)

---

### Database Service Pattern

**Source:** `src/db/services/childProfile.service.ts` (lines 1-12), `src/db/services/wordForm.service.ts` (lines 1-15)

**Service import & db access pattern:**
```typescript
import { db } from '../db'
import type { ChildProfile } from '../types'

export async function saveChildProfile(
  profile: Omit<ChildProfile, 'id'>
): Promise<number> {
  return db.childProfile.add(profile) as Promise<number>
}
```

**Dexie transaction pattern** (from wordForm.service.ts, lines 11-14):
```typescript
await db.transaction('rw', [db.wordForms, db.wordFormMeanings], async () => {
  await db.wordForms.delete(id)
  await db.wordFormMeanings.where('wordFormId').equals(id).delete()
})
```

**Query pattern** (from childProfile.service.ts):
```typescript
export async function getChildProfile(): Promise<ChildProfile | undefined> {
  return db.childProfile.toCollection().first()
}
```

**Apply to:** All service files (childProfile, wordForm, meaning, wordFormMeaning services)

---

### Reactive Query Pattern

**Source:** `src/App.tsx` (lines 10-11), established Dexie + react-i18next pattern

**useLiveQuery for auto-updating data** (from App.tsx):
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/db'

const profileCount = useLiveQuery(() => db.childProfile.count())

if (profileCount === undefined) {
  return <LoadingScreen />
}

if (profileCount === 0) {
  return <OnboardingPage />
}
```

**Apply to:** Meaning autocomplete query (useMeaningSearch.ts)

---

### Zustand Store Pattern

**Source:** `src/stores/ui.store.ts` (lines 1-9)

**Store initialization pattern:**
```typescript
import { create } from 'zustand';

interface UIState {
  addWordSheetOpen: boolean;
  setAddWordSheetOpen: (open: boolean) => void;
  // additional state...
}

export const useUIStore = create<UIState>((set) => ({
  addWordSheetOpen: false,
  setAddWordSheetOpen: (open) => set({ addWordSheetOpen: open }),
}));
```

**Store usage in components:**
```typescript
const isOpen = useUIStore((s) => s.addWordSheetOpen);
const setOpen = useUIStore((s) => s.setAddWordSheetOpen);
```

**Apply to:** Zustand store modifications for Phase 2 state (addWordSheetOpen, etc.)

---

### Navigation & Routing Pattern

**Source:** `src/router/index.tsx` (lines 1-30), `src/pages/MorePage.tsx` (lines 1-5)

**Hash router setup** (from router/index.tsx):
```typescript
import { createHashRouter, Navigate } from 'react-router';

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // ... more routes
    ],
  },
  { path: '/onboarding', element: <OnboardingPage /> },
]);
```

**Navigation link pattern** (from MorePage.tsx):
```typescript
import { Link } from 'react-router';

<Link to="/categories" className="text-foreground hover:text-primary">
  Categories
</Link>
```

**NavLink with active state** (from BottomNav.tsx):
```typescript
<NavLink
  to={to}
  className={({ isActive }) =>
    isActive
      ? 'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-primary'
      : 'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground'
  }
>
```

**Apply to:** All navigation within pages and new route additions (profile/edit)

---

### i18n & Language Pattern

**Source:** `src/i18n/index.ts` (lines 1-26), established in Phase 1

**Language key storage** (from i18n/index.ts):
```typescript
const LANG_KEY = 'little-words-lang'
const storedLang = localStorage.getItem(LANG_KEY)
const lng = storedLang === 'pl' || storedLang === 'en' ? storedLang : 'pl'
```

**i18next initialization** (from i18n/index.ts):
```typescript
i18n.use(initReactI18next).init({
  resources: {
    pl: { common: plCommon, onboarding: plOnboarding },
    en: { common: enCommon, onboarding: enOnboarding },
  },
  lng,
  fallbackLng: 'pl',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})
```

**useTranslation hook** (from App.tsx, BottomNav.tsx):
```typescript
const { t } = useTranslation('common'); // or 'onboarding', etc.
const label = t('app.name'); // translates key 'common.app.name'
```

**Language switching** (per RESEARCH.md Pattern 6):
```typescript
const { i18n } = useTranslation();
i18n.changeLanguage('pl');
localStorage.setItem('little-words-lang', 'pl');
```

**Apply to:** All text-rendered components (use `t('key')` for UI strings)

---

### Button & Icon Component Pattern

**Source:** `src/components/ui/button.tsx` (lines 1-57), `src/shared/components/BottomNav.tsx` (lines 3, 17-26)

**Shadcn Button import & usage:**
```typescript
import { Button } from '@/shared/components/Button';

<Button
  type="submit"
  disabled={!isValid || isLoading}
  className="w-full"
  size="lg"
>
  {t('button.getStarted')}
</Button>
```

**Icon imports from lucide-react** (from BottomNav.tsx):
```typescript
import { LayoutDashboard, BookOpen, MessageSquare, MoreHorizontal } from 'lucide-react';

<Icon size={20} strokeWidth={1.5} />
```

**CVA variant pattern** (from button.tsx):
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { default: "...", lg: "..." },
    },
  }
);
```

**Apply to:** All buttons and icon components (AddEntryFAB, LanguageSwitcher)

---

### Container & Layout CSS Pattern

**Source:** `src/shared/components/RootLayout.tsx` (lines 5-13), `src/shared/components/ErrorBoundary.tsx` (lines 29-34)

**Full viewport layout:**
```typescript
<div className="flex flex-col h-[100dvh]">
  <main className="flex-1 overflow-y-auto">
    <Outlet />
  </main>
  <nav>{/* nav */}</nav>
</div>
```

**Centered content:**
```typescript
<div className="flex h-[100dvh] items-center justify-center bg-background">
```

**Padding & spacing:**
```typescript
<div className="p-6 space-y-6">
```

**Scrollable sections:**
```typescript
<div className="overflow-y-auto">
```

**Apply to:** All page and sheet layouts (OnboardingPage, AddEntrySheet, SettingsPage)

---

### Schema & Type Definitions Pattern

**Source:** `src/db/schema.ts` (lines 1-53), `src/db/db.ts` (lines 1-21)

**Constants & type exports:**
```typescript
export const CATEGORIES = [
  'Nouns',
  'Verbs',
  // ... 14 total
] as const

export type Category = typeof CATEGORIES[number]
```

**Interface definitions:**
```typescript
export interface ChildProfile {
  id?: number
  name: string
  birthDate: string
  languages: string[]
  createdAt: string
  // Optional fields
  prematureBirth?: boolean
  speechTherapy?: boolean
  neurologicalCare?: boolean
  parentNotes?: string
}
```

**Database schema registration** (from db.ts):
```typescript
this.version(1).stores({
  childProfile: '++id',
  wordForms: '++id, form, createdAt',
  meanings: '++id, isActive, firstUseDate, lastUseDate, *categories',
  wordFormMeanings: '++id, wordFormId, meaningId, [wordFormId+meaningId]',
})
```

**Apply to:** All new type definitions and schema updates

---

## Shared Patterns

### Translation Key Namespace Pattern

**Source:** `src/i18n/index.ts` (established in Phase 1)

**Apply to:** All new UI strings

- Use `useTranslation('onboarding')` for onboarding feature strings
- Use `useTranslation('common')` for shared strings (button labels, validation messages)
- Use `useTranslation()` (defaults to 'common') for general UI
- All translation keys must exist in `src/i18n/locales/{pl,en}/{namespace}.json`

---

### Error Boundary & Error Handling

**Source:** `src/shared/components/ErrorBoundary.tsx` (lines 1-50)

**Apply to:** All async operations in service layers and hooks

```typescript
try {
  const result = await serviceFunction(data);
  // success path
} catch (err) {
  console.error('Operation failed:', err);
  // User-facing error message via toast or inline error display
  // Do not expose raw error.message in production (per ErrorBoundary pattern)
}
```

**Dev vs. prod error display:**
```typescript
{import.meta.env.DEV && (
  <pre className="rounded bg-muted p-4 text-sm text-destructive">
    {error?.message}
  </pre>
)}
{!import.meta.env.DEV && (
  <p className="text-muted-foreground">Something went wrong</p>
)}
```

---

### Validation Schema Pattern

**Source:** RESEARCH.md §Pattern 1, react-hook-form + zod official docs

**Apply to:** All form validation (onboarding, word entry, profile edit)

```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, { message: 'Child name is required' }),
  birthDate: z.string().min(1, { message: 'Birth date is required' }),
  languages: z.array(z.string()).min(1, { message: 'Select at least one language' }),
});

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Per D-04
});
```

---

### Component Import Conventions

**Source:** Established across codebase (App.tsx, pages, BottomNav.tsx)

**Path alias convention:**
```typescript
import { Button } from '@/components/ui/button';
import { db } from '@/db/db';
import { useUIStore } from '@/stores/ui.store';
import type { ChildProfile } from '@/db/types';
```

**Import organization order:**
1. React imports
2. External library imports
3. Internal path-aliased imports
4. Type imports (using `type` keyword)

---

### Async Service Call Pattern

**Source:** `src/db/services/childProfile.service.ts`, App.tsx useEffect patterns

**Apply to:** All asynchronous operations in hooks and components

```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

const handleSubmit = async (data: FormData) => {
  setIsLoading(true);
  setError(null);
  try {
    await serviceFunction(data);
    // Success: reset form, navigate, or show confirmation
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Unknown error'));
  } finally {
    setIsLoading(false);
  }
};
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/features/onboarding/components/MedicalContextSection.tsx` | component | request-response | No existing collapsible section; RESEARCH.md Pattern 1 provides reference |
| `src/features/onboarding/components/LanguageChips.tsx` | component | request-response | No existing chip/badge multi-select; RESEARCH.md Pattern 5 provides reference |
| `src/features/add-entry/components/MeaningInput.tsx` | component | request-response | No existing form input with autocomplete; RESEARCH.md Pattern 3 provides reference |
| `src/features/add-entry/components/MeaningAutocomplete.tsx` | component | request-response | No existing autocomplete dropdown; RESEARCH.md Pattern 3 provides reference |
| `src/features/add-entry/components/CategoryChips.tsx` | component | request-response | No existing horizontal scrollable chips; RESEARCH.md Pattern 5 provides reference |
| `src/features/settings/components/DataPlaceholder.tsx` | component | request-response | Placeholder section with no functional analog |
| `src/features/settings/components/AboutSection.tsx` | component | request-response | Version display only; no existing pattern |
| `src/features/ios-install/components/iOSInstallPrompt.tsx` | component | request-response | iOS-specific event handling; RESEARCH.md Pitfall 3 & 12 provide context |
| `src/shared/components/ProfileEditForm.tsx` | component | request-response | Reusable form component; use OnboardingWizard as reference (same fields) |
| `src/db/services/wordFormMeaning.service.ts` | service | CRUD link | Junction table writes; RESEARCH.md Pattern 4 provides transaction pattern |
| `src/features/onboarding/hooks/useOnboarding.ts` | hook | CRUD + request-response | Custom hook combining form state + service calls; RESEARCH.md Pattern 1 provides reference |
| `src/features/add-entry/hooks/useAddEntry.ts` | hook | CRUD + request-response | Custom hook combining sheet state + service calls; RESEARCH.md Pattern 4 provides reference |
| `src/features/add-entry/hooks/useMeaningSearch.ts` | hook | streaming (reactive query) | Debounced useLiveQuery; RESEARCH.md Pattern 3 provides reference |
| `src/features/settings/hooks/useSettings.ts` | hook | request-response | Language switching via i18n + localStorage; RESEARCH.md Pattern 6 provides reference |
| `src/features/ios-install/hooks/useiOSInstallPrompt.ts` | hook | request-response | Event handling for BeforeInstallPromptEvent; RESEARCH.md Pitfall 3 provides reference |

---

## Metadata

**Analog search scope:** src/pages/, src/shared/components/, src/db/services/, src/stores/, src/components/ui/, src/i18n/

**Files scanned:** 34 source files (pages, components, services, hooks, stores, utilities)

**Pattern extraction date:** 2026-06-30

**Confidence breakdown:**
- Established patterns (App.tsx, service layer, Zustand, i18n, routing): HIGH
- Form & validation patterns (from RESEARCH.md + official docs): MEDIUM-HIGH
- New component patterns (onboarding, autocomplete, iOS prompt): MEDIUM (reference RESEARCH.md for details)

---

*Pattern mapping complete. Ready for planning phase.*
