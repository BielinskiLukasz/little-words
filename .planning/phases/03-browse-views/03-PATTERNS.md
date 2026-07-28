# Phase 3: Browse Views - Pattern Map

**Mapped:** 2026-07-28  
**Files analyzed:** 11 (7 page components, 2 service files, 2 router config, 3 Shadcn components)  
**Analogs found:** 10 / 11  

## File Classification

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `src/pages/DashboardPage.tsx` | page | CRUD (read) | `src/pages/DashboardPage.tsx` (current) | self-reference |
| `src/pages/MeaningsPage.tsx` | page | CRUD (read + filter) | `src/pages/DashboardPage.tsx` | role-match |
| `src/pages/WordFormsPage.tsx` | page | CRUD (read) | `src/pages/DashboardPage.tsx` | role-match |
| `src/pages/CategoriesPage.tsx` | page | CRUD (read) | `src/pages/DashboardPage.tsx` | role-match |
| `src/pages/TimelinePage.tsx` | page | CRUD (read) + charting | `src/pages/DashboardPage.tsx` | role-match |
| `src/pages/MeaningDetailPage.tsx` | page | CRUD (read + update toggle) | `src/pages/ProfileEditPage.tsx` | role-match + pattern |
| `src/pages/WordFormDetailPage.tsx` | page | CRUD (read + delete) | `src/pages/ProfileEditPage.tsx` | role-match |
| `src/router/index.tsx` | routing config | request-response | `src/router/index.tsx` (current) | self-reference |
| `src/db/services/meaning.service.ts` | service | CRUD (queries) | `src/db/services/meaning.service.ts` (current) | self-reference |
| `src/db/services/wordForm.service.ts` | service | CRUD (queries) | `src/db/services/wordForm.service.ts` (current) | self-reference |
| `switch`, `chart`, `alert-dialog` | ui component | request-response | `src/components/ui/badge.tsx`, `button.tsx` | pattern-match |

---

## Pattern Assignments

### `src/pages/DashboardPage.tsx` (page, CRUD read)

**Analog:** `src/pages/DashboardPage.tsx` (current stub — expand in place)

**Imports pattern** (lines 1-3):
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
```

**Page layout pattern — loading state** (lines 5-15):
```typescript
export function DashboardPage() {
  const { t } = useTranslation()
  const profile = useLiveQuery(() => db.childProfile.toCollection().first())

  if (profile === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }
  // ... render content
}
```

**Dashboard card layout** (reference for hero card + grid):
- Hero card: `<div className="flex flex-col gap-4 p-6">` with large metric display
- Secondary metrics grid: `<div className="grid grid-cols-2 gap-4">` (D-02, D-03 decision)
- Badge import for filter chip: `import { Badge } from '@/components/ui/badge'` (D-14)

---

### `src/pages/MeaningsPage.tsx` (page, CRUD read + filter)

**Analog:** `src/pages/DashboardPage.tsx` for useLiveQuery pattern

**Imports pattern** (recommended):
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { db } from '@/db/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
```

**Hook pattern for query param filtering** (useSearchParams):
```typescript
const [searchParams, setSearchParams] = useSearchParams()
const categoryFilter = searchParams.get('category')

// Apply filter to query:
const meanings = useLiveQuery(() => {
  let query = db.meanings.where('isActive').equals(true)
  if (categoryFilter) {
    query = query.and(m => m.categories.includes(categoryFilter))
  }
  return query.toArray()
})
```

**Sort state pattern** (local component state):
```typescript
const [sortOrder, setSortOrder] = useState<'newest' | 'alpha'>('newest')
// Default: Newest first (by firstUseDate, descending)
// Toggle: A–Z (alphabetical by text)
```

**Filter chip pattern** (D-14):
```typescript
{categoryFilter && (
  <Badge variant="outline" className="inline-flex items-center gap-2">
    {t(`category.${categoryFilter}`)}
    <button
      onClick={() => setSearchParams({})}
      className="ml-1 text-sm font-bold"
    >
      ×
    </button>
  </Badge>
)}
```

---

### `src/pages/WordFormsPage.tsx` (page, CRUD read)

**Analog:** `src/pages/DashboardPage.tsx` for useLiveQuery pattern

**Imports pattern** (same as MeaningsPage):
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { db } from '@/db/db'
import { Button } from '@/components/ui/button'
```

**Sort state pattern** (same as MeaningsPage):
```typescript
const [sortOrder, setSortOrder] = useState<'newest' | 'alpha'>('newest')
// Default: Newest first (by createdAt, descending)
```

---

### `src/pages/CategoriesPage.tsx` (page, CRUD read aggregates)

**Analog:** `src/pages/DashboardPage.tsx` for page structure + `src/db/schema.ts` for CATEGORIES

**Imports pattern**:
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { CATEGORIES } from '@/db/schema'
import { db } from '@/db/db'
```

**Category data structure** (from `src/db/schema.ts` lines 1-16):
```typescript
export const CATEGORIES = [
  'Nouns',
  'Verbs',
  'Adjectives',
  'People',
  'Food',
  'Animals',
  'Vehicles',
  'Body Parts',
  'Onomatopoeia',
  'Requests',
  'Social Communication',
  'Emotions',
  'Places',
  'Other',
] as const

export type Category = typeof CATEGORIES[number]
```

**Navigation pattern** (tap category → filter to /meanings?category=Nouns):
```typescript
const navigate = useNavigate()

CATEGORIES.map(cat => (
  <button
    key={cat}
    onClick={() => navigate(`/meanings?category=${cat}`)}
  >
    {cat}: {meaningCount} ({inactiveCount} inactive)
  </button>
))
```

---

### `src/pages/TimelinePage.tsx` (page, CRUD read + charting)

**Analog:** `src/pages/DashboardPage.tsx` for useLiveQuery + page layout pattern

**Imports pattern** (with Recharts via Shadcn chart):
```typescript
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { db } from '@/db/db'
import { Button } from '@/components/ui/button'
// Recharts components added via `npx shadcn add chart`
```

**Tab toggle pattern** (D-09 — two views):
```typescript
const [activeTab, setActiveTab] = useState<'growth' | 'total'>('growth')
// Buttons or Badge-based tabs to switch views
```

**Date range dropdown pattern** (D-10):
```typescript
const [dateRange, setDateRange] = useState<'6m' | '12m' | 'all'>('all')
// Default: All time
```

**Query pattern for chart data** (referenced, not queried directly yet):
- Service functions needed: 
  - `getMeaningsByMonth()` — aggregates new meanings per month
  - `getCumulativeMeaningsByMonth()` — cumulative totals
- These functions will be added to `meaning.service.ts`

---

### `src/pages/MeaningDetailPage.tsx` (page, CRUD read + update)

**Analog:** `src/pages/ProfileEditPage.tsx` (edit page pattern)

**Imports pattern** (lines 1-8):
```typescript
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
import { toggleMeaningActive, updateLastUseDate } from '@/db/services/meaning.service'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
```

**Detail page loading pattern** (adapt from ProfileEditPage lines 10-23):
```typescript
export function MeaningDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const meaning = useLiveQuery(() => {
    if (!id) return undefined
    return db.meanings.get(Number(id))
  })

  if (meaning === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  // ... render detail
}
```

**Active/Inactive toggle pattern** (D-06, D-07):
```typescript
// Switch component (install via `npx shadcn add switch`)
import { Switch } from '@/components/ui/switch'

const handleToggleActive = async (newState: boolean) => {
  setIsSaving(true)
  try {
    await toggleMeaningActive(meaning.id!, newState)
  } catch (err) {
    console.error('Failed to toggle active:', err)
  } finally {
    setIsSaving(false)
  }
}

<div className="flex items-center gap-2">
  <label htmlFor="active-toggle" className="text-sm font-medium">
    {t('meaning.isActive')}
  </label>
  <Switch
    id="active-toggle"
    checked={meaning.isActive}
    onCheckedChange={handleToggleActive}
    disabled={isSaving}
  />
</div>
```

**Date picker for lastUseDate** (D-06 — editable field):
```typescript
// Calendar + Popover pattern (calendar.tsx already exists)
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const handleUpdateDate = async (newDate: Date) => {
  setIsSaving(true)
  try {
    await updateLastUseDate(meaning.id!, newDate.toISOString())
  } catch (err) {
    console.error('Failed to update date:', err)
  } finally {
    setIsSaving(false)
  }
}

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">{meaning.lastUseDate}</Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar
      mode="single"
      selected={new Date(meaning.lastUseDate)}
      onSelect={(date) => date && handleUpdateDate(date)}
    />
  </PopoverContent>
</Popover>
```

**Read-only fields pattern** (D-06 — all other fields read-only in Phase 3):
```typescript
<div className="space-y-4 p-6">
  <div>
    <label className="text-sm font-medium text-muted-foreground">
      {t('meaning.text')}
    </label>
    <p className="text-foreground">{meaning.text}</p>
  </div>
  <div>
    <label className="text-sm font-medium text-muted-foreground">
      {t('meaning.categories')}
    </label>
    <div className="flex gap-1 flex-wrap">
      {meaning.categories.map(cat => (
        <Badge key={cat} variant="outline">{t(`category.${cat}`)}</Badge>
      ))}
    </div>
  </div>
</div>
```

---

### `src/pages/WordFormDetailPage.tsx` (page, CRUD read + delete)

**Analog:** `src/pages/ProfileEditPage.tsx` for structure + detail page pattern

**Imports pattern**:
```typescript
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
import { deleteWordForm } from '@/db/services/wordForm.service'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
```

**Delete button with confirmation dialog pattern** (D-08, Claude's discretion):
```typescript
const [isDeleting, setIsDeleting] = useState(false)

const handleDelete = async () => {
  setIsDeleting(true)
  try {
    await deleteWordForm(wordForm.id!)
    navigate('/word-forms')
  } catch (err) {
    console.error('Failed to delete word form:', err)
  } finally {
    setIsDeleting(false)
  }
}

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">
      {t('wordForm.delete')}
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        {t('wordForm.deleteConfirm.title')}
      </AlertDialogTitle>
      <AlertDialogDescription>
        {t('wordForm.deleteConfirm.description')}
        {/* D-08: "Only the word form record is removed — linked meanings survive." */}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogCancel>
      {t('common.cancel')}
    </AlertDialogCancel>
    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
      {t('common.delete')}
    </AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

---

### `src/router/index.tsx` (routing config, request-response)

**Analog:** `src/router/index.tsx` (current — add routes in place)

**Import additions** (lines 1-15, add detail page imports):
```typescript
// Add to existing imports:
import { MeaningDetailPage } from '../pages/MeaningDetailPage'
import { WordFormDetailPage } from '../pages/WordFormDetailPage'
```

**Route additions pattern** (add as children of root layout, lines 40-52):
```typescript
{
  path: '/',
  element: <AuthGuard />,
  children: [
    { index: true, element: <Navigate to="/dashboard" replace /> },
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'meanings', element: <MeaningsPage /> },
    { path: 'meanings/:id', element: <MeaningDetailPage /> },  // NEW
    { path: 'word-forms', element: <WordFormsPage /> },
    { path: 'word-forms/:id', element: <WordFormDetailPage /> },  // NEW
    { path: 'more', element: <MorePage /> },
    // ... rest unchanged
  ],
}
```

**Route nesting** (D-05 — detail routes as children of root layout):
- Bottom nav remains visible on detail pages (kept via RootLayout `<Outlet />`)
- Back navigation: `navigate(-1)` returns to list page

---

### `src/db/services/meaning.service.ts` (service, CRUD queries)

**Analog:** `src/db/services/meaning.service.ts` (current — extend with new functions)

**Existing functions** (lines 1-31):
```typescript
export async function addMeaning(meaning: Omit<Meaning, 'id'>): Promise<number>
export async function toggleMeaningActive(id: number, isActive: boolean): Promise<void>
export async function searchMeanings(prefix: string): Promise<Meaning[]>
```

**New functions to add** (reference CONTEXT.md code context section):

1. **getMeaningById** (for detail page, D-06):
```typescript
export async function getMeaningById(id: number): Promise<Meaning | undefined> {
  return db.meanings.get(id)
}
```

2. **updateLastUseDate** (for detail page, D-06):
```typescript
export async function updateLastUseDate(id: number, date: string): Promise<void> {
  await db.meanings.update(id, { lastUseDate: date })
}
```

3. **getMeaningsUnused30Days** (for Dashboard, D-04 "Review these?" section):
```typescript
export async function getMeaningsUnused30Days(): Promise<Meaning[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  return db.meanings
    .where('lastUseDate')
    .below(thirtyDaysAgo)
    .and(m => m.isActive)
    .limit(3)
    .toArray()
}
```

4. **getMeaningsByCategory** (for filtered list, D-13):
```typescript
export async function getMeaningsByCategory(category: string): Promise<Meaning[]> {
  return db.meanings
    .where('categories')
    .equals(category)
    .toArray()
}
```

5. **getMeaningsByMonth** (for Timeline chart, D-09):
```typescript
// Aggregation function — returns array of { month, count }
// Query logic: group meanings by YYYY-MM of firstUseDate where isActive=true
export async function getMeaningsByMonth(
  startDate?: string,
  endDate?: string
): Promise<Array<{ month: string; count: number }>> {
  // Implementation will aggregate isActive meanings grouped by month
}
```

6. **getCumulativeMeaningsByMonth** (for Timeline cumulative line, D-09):
```typescript
// Returns cumulative count per month
export async function getCumulativeMeaningsByMonth(
  startDate?: string,
  endDate?: string
): Promise<Array<{ month: string; total: number }>> {
  // Implementation will compute running total per month
}
```

**Pattern for transaction-safe updates** (reference wordForm.service.ts lines 10-15):
```typescript
export async function updateWithTransaction(
  id: number,
  updates: Partial<Meaning>
): Promise<void> {
  await db.transaction('rw', db.meanings, async () => {
    await db.meanings.update(id, updates)
  })
}
```

---

### `src/db/services/wordForm.service.ts` (service, CRUD queries)

**Analog:** `src/db/services/wordForm.service.ts` (current — extend with new functions)

**Existing functions** (lines 1-46):
```typescript
export async function addWordForm(form: Omit<WordForm, 'id'>): Promise<number>
export async function deleteWordForm(id: number): Promise<void>
export async function findOrCreateWordForm(formText: string): Promise<number>
```

**New functions to add**:

1. **getWordFormById** (for detail page, D-08):
```typescript
export async function getWordFormById(id: number): Promise<WordForm | undefined> {
  return db.wordForms.get(id)
}
```

2. **getWordFormWithMeaningCount** (for list with metadata, optional enhancement):
```typescript
// Query: word form + count of linked meanings
export async function getWordFormWithMeaningCount(
  id: number
): Promise<WordForm & { meaningCount: number }> {
  const form = await db.wordForms.get(id)
  if (!form || !form.id) return form as any

  const meaningCount = await db.wordFormMeanings
    .where('wordFormId')
    .equals(form.id)
    .count()

  return { ...form, meaningCount }
}
```

**Pattern for junction queries** (reference wordFormMeaning.service.ts lines 10-24):
```typescript
// Checking for existing relationship before linking
const existing = await db.wordFormMeanings
  .where('[wordFormId+meaningId]')
  .equals([wordFormId, meaningId])
  .first()

if (existing) {
  return
}
```

---

## Shared Patterns

### useLiveQuery Data Loading (all pages)

**Source:** `src/pages/DashboardPage.tsx` (lines 1-15)  
**Apply to:** All page components (DashboardPage, MeaningsPage, WordFormsPage, CategoriesPage, TimelinePage, MeaningDetailPage, WordFormDetailPage)

```typescript
import { useLiveQuery } from 'dexie-react-hooks'

// Loading state pattern
const data = useLiveQuery(() => db.table.toCollection().first())

if (data === undefined) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-muted-foreground">{t('app.loading')}</p>
    </div>
  )
}

// data is now Meaning | null (not undefined)
```

### Translation Hook (all pages and components)

**Source:** `src/pages/DashboardPage.tsx` (line 6)  
**Apply to:** All pages, forms, and components

```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation('common')
// or specific namespace: useTranslation('meanings')

// Usage:
<h1>{t('dashboard.title')}</h1>
<p>{t('category.Nouns')}</p>
```

### Navigation and State Management (pages with edits/transitions)

**Source:** `src/pages/ProfileEditPage.tsx` (lines 4, 12, 25-39)  
**Apply to:** Detail pages (MeaningDetailPage, WordFormDetailPage), any page needing nav back

```typescript
import { useNavigate, useParams } from 'react-router'

const navigate = useNavigate()
const { id } = useParams()

// Save and navigate back:
await updateFunction(id, newData)
navigate(-1)  // Returns to previous page (list)
```

### Async Action with Loading State (edits, deletes)

**Source:** `src/pages/ProfileEditPage.tsx` (lines 13, 25-39)  
**Apply to:** Any async action (toggle, date update, delete)

```typescript
const [isSaving, setIsSaving] = useState(false)

const handleAction = async () => {
  setIsSaving(true)
  try {
    await serviceFunction(id, newValue)
    // Optional: navigate after success
    navigate(-1)
  } catch (err) {
    console.error('Failed to perform action:', err)
    // Optional: show user-facing error message
  } finally {
    setIsSaving(false)
  }
}

<Button onClick={handleAction} disabled={isSaving}>
  {isSaving ? t('common.saving') : t('common.save')}
</Button>
```

### Badge Component for Tags and Filters

**Source:** `src/features/add-entry/components/CategoryChips.tsx` (lines 1-43)  
**Apply to:** All category displays, filter chips, meaning detail

```typescript
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/db/schema'

// Basic tag display:
{meaning.categories.map(cat => (
  <Badge key={cat} variant="outline">
    {t(`category.${cat}`)}
  </Badge>
))}

// Clickable filter chip:
<Badge
  variant={value.includes(cat) ? 'default' : 'outline'}
  className="cursor-pointer"
  onClick={() => toggleCategory(cat)}
>
  {t(`category.${cat}`)}
</Badge>

// Dismissible filter chip (D-14):
<Badge variant="outline">
  {t(`category.${categoryFilter}`)}
  <button onClick={() => clearFilter()}>×</button>
</Badge>
```

### Button Variants for Actions

**Source:** `src/components/ui/button.tsx` (lines 11-20)  
**Apply to:** All buttons across browse views

```typescript
import { Button } from '@/components/ui/button'

// Primary action:
<Button variant="default" onClick={handleSave}>
  {t('common.save')}
</Button>

// Destructive action (delete):
<Button variant="destructive" onClick={handleDelete}>
  {t('common.delete')}
</Button>

// Secondary/outline:
<Button variant="outline" onClick={handleCancel}>
  {t('common.cancel')}
</Button>

// Link-like:
<Button variant="ghost" asChild>
  <Link to="/meanings">{t('common.seeAll')}</Link>
</Button>
```

### Query Params for Filtering

**Source:** React Router hook `useSearchParams` (not in existing codebase but standard React Router v7)  
**Apply to:** MeaningsPage for category filtering (D-13, D-14)

```typescript
import { useSearchParams } from 'react-router'

const [searchParams, setSearchParams] = useSearchParams()
const categoryFilter = searchParams.get('category')

// Clear filter:
setSearchParams({})

// Set filter:
setSearchParams({ category: 'Nouns' })

// In URL: /meanings?category=Nouns
```

---

## Shadcn Components Needed

The following Shadcn components must be added to the project via `npx shadcn@latest add <component>`:

| Component | Used in | Decision | Reason |
|-----------|---------|----------|--------|
| `switch` | MeaningDetailPage | D-07 (explicit decision) | Active/Inactive toggle UI |
| `chart` | TimelinePage | D-12 (explicit decision) | Recharts wrapper + bar/line charts |
| `alert-dialog` or `dialog` | WordFormDetailPage | Claude's discretion | Delete confirmation dialog (recommend AlertDialog for destructive action) |
| `table` (optional) | TimelinePage | Not required; simple `<table>` with Tailwind suffices | Data table below chart (D-11) |

**Install commands** (after pattern analysis):
```bash
npx shadcn@latest add switch
npx shadcn@latest add chart
npx shadcn@latest add alert-dialog
```

---

## No Analog Found

All files have close analogs in the existing codebase. Service extensions (meaning.service.ts, wordForm.service.ts) are self-referential and expand existing functions.

---

## Summary of Key Patterns Identified

1. **Page structure:** All pages follow the `useLiveQuery` → loading state → render pattern from DashboardPage
2. **Detail pages:** MeaningDetailPage and WordFormDetailPage follow ProfileEditPage pattern (load by ID, async actions with loading state, navigate back)
3. **Lists with filtering:** MeaningsPage uses `useSearchParams` for query param filtering (D-13)
4. **Lists with sorting:** MeaningsPage and WordFormsPage use local `useState` for sort order (D-16)
5. **UI components:** All use Shadcn components (Badge, Button, Switch, Calendar, Popover, AlertDialog) with Tailwind utilities
6. **Services:** All database operations use Dexie transaction patterns for atomicity
7. **Internationalization:** All text via `useTranslation('common')` or namespace-specific hooks
8. **Navigation:** Pages use `useNavigate()` and `useParams()` from React Router v7; detail pages navigate back with `navigate(-1)`

---

**Metadata**

- **Analog search scope:** `src/pages/`, `src/db/services/`, `src/components/ui/`, `src/features/`
- **Files scanned:** 35+ files
- **Pattern extraction date:** 2026-07-28
- **Ready for planning:** Yes — all new files have concrete pattern references with file paths and line numbers
