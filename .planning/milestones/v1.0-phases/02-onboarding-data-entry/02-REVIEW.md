---
phase: 02-onboarding-data-entry
reviewed: 2026-09-14T12:00:00Z
depth: standard
files_reviewed: 49
files_reviewed_list:
  - src/App.test.tsx
  - src/components/ui/badge.tsx
  - src/components/ui/calendar.tsx
  - src/components/ui/collapsible.tsx
  - src/components/ui/popover.tsx
  - src/components/ui/sheet.tsx
  - src/db/db.ts
  - src/db/services/meaning.service.test.ts
  - src/db/services/meaning.service.ts
  - src/db/services/wordEntry.service.test.ts
  - src/db/services/wordEntry.service.ts
  - src/db/services/wordForm.service.test.ts
  - src/db/services/wordForm.service.ts
  - src/db/services/wordFormMeaning.service.ts
  - src/features/add-entry/components/AddEntryFAB.tsx
  - src/features/add-entry/components/AddEntrySheet.tsx
  - src/features/add-entry/components/CategoryChips.tsx
  - src/features/add-entry/components/MeaningAutocomplete.tsx
  - src/features/add-entry/components/MeaningInput.tsx
  - src/features/add-entry/components/WordFormInput.tsx
  - src/features/add-entry/hooks/useAddEntry.test.ts
  - src/features/add-entry/hooks/useAddEntry.ts
  - src/features/add-entry/hooks/useMeaningSearch.test.ts
  - src/features/add-entry/hooks/useMeaningSearch.ts
  - src/features/ios-install/components/iOSInstallPrompt.tsx
  - src/features/ios-install/hooks/useiOSInstallPrompt.ts
  - src/features/onboarding/components/LanguageChips.tsx
  - src/features/onboarding/components/MedicalContextSection.tsx
  - src/features/onboarding/components/OnboardingWizard.tsx
  - src/features/onboarding/hooks/useOnboarding.test.ts
  - src/features/onboarding/hooks/useOnboarding.ts
  - src/features/settings/components/AboutSection.tsx
  - src/features/settings/components/DataPlaceholder.tsx
  - src/features/settings/components/LanguageSwitcher.tsx
  - src/features/settings/components/ProfileEditLink.tsx
  - src/features/settings/hooks/useSettings.ts
  - src/features/welcome/components/WelcomeScreen.tsx
  - src/i18n/locales/en/common.json
  - src/i18n/locales/en/onboarding.json
  - src/i18n/locales/pl/common.json
  - src/i18n/locales/pl/onboarding.json
  - src/pages/DashboardPage.tsx
  - src/pages/OnboardingPage.tsx
  - src/pages/ProfileEditPage.tsx
  - src/pages/SettingsPage.tsx
  - src/router/index.tsx
  - src/shared/components/ProfileEditForm.tsx
  - src/shared/components/RootLayout.tsx
  - src/stores/ui.store.ts
findings:
  critical: 4
  warning: 8
  info: 0
  total: 12
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-14T12:00:00Z
**Depth:** standard
**Files Reviewed:** 49
**Status:** issues_found

## Summary

Phase 2 delivers onboarding, the core add-entry flow, and the dashboard. The data model and schema migrations are solid. The service-layer unit tests cover the happy paths well. However, four critical defects were found that affect correctness and data integrity of the app's central user workflow.

The most severe issue is that the meaning autocomplete is architecturally broken: it shows the user existing meanings to prevent duplicates, but clicking a suggestion creates a *new* duplicate meaning rather than linking to the existing one. Combined with a non-atomic `addWordEntry` service, a completely silenced error path, and a date-format mismatch that skews dashboard counts, there are four blockers that must be resolved before release.

---

## Critical Issues

### CR-01: Autocomplete selection silently creates duplicate meanings instead of reusing existing ones

**Files:**
- `src/features/add-entry/components/MeaningAutocomplete.tsx:27`
- `src/features/add-entry/components/MeaningInput.tsx:33`
- `src/features/add-entry/hooks/useAddEntry.ts:51-62`

**Issue:** `MeaningAutocomplete` exposes `onSelect: (text: string, isNew: boolean) => void`. The `isNew` flag was clearly designed to distinguish "link to existing meaning" (`false`) from "create new meaning" (`true`). However, `MeaningInput` discards the second argument entirely:

```tsx
// MeaningInput.tsx line 33
<MeaningAutocomplete
  meaningText={row.text}
  onSelect={(text) => onChange({ text })}  // isNew silently dropped
/>
```

`useAddEntry.handleSave` always calls `addWordEntry` which always calls `addMeaning(...)` creating a brand-new `Meaning` row. So when a user:
1. Types "goodbye" in the meaning field
2. Sees the autocomplete showing the existing "goodbye" meaning (id=1)
3. Clicks "goodbye" to select it
4. Saves the entry

…the result is a second `Meaning` row with `text = "goodbye"` (id=5, say), linked to the new word form, while the original meaning (id=1) remains separate and unlinked. The autocomplete's entire purpose — preventing duplicate meanings — is completely defeated.

**Fix:** Pass `isNew` through and branch in `MeaningInput` (or in the hook). When `isNew=false`, store the existing meaning's `id` on the row; when saving, link to the existing ID instead of creating a new meaning.

```tsx
// MeaningInput.tsx — pass isNew through
<MeaningAutocomplete
  meaningText={row.text}
  onSelect={(text, isNew) => onChange({ text, existingMeaningId: isNew ? undefined : /* look up id */ })}
/>
```

```ts
// useAddEntry.ts MeaningRowState — add existingMeaningId
export interface MeaningRowState {
  id: string
  text: string
  categories: Category[]
  firstUseDate: string
  existingMeaningId?: number   // set when autocomplete selection is an existing meaning
}
```

```ts
// wordEntry.service.ts — branch: link existing vs. create new
for (const meaning of validMeanings) {
  if (meaning.existingMeaningId !== undefined) {
    meaningIds.push(meaning.existingMeaningId)
  } else {
    const meaningId = await addMeaning({ ... })
    meaningIds.push(meaningId)
  }
}
```

---

### CR-02: `addWordEntry` is not atomic — partial failures create orphaned data

**File:** `src/db/services/wordEntry.service.ts:46-86`

**Issue:** The function performs three distinct write phases outside any wrapping transaction:
1. `findOrCreateWordForm(...)` — creates/finds a word form (has its own transaction)
2. Loop: `addMeaning(...)` for each meaning — no transaction
3. Loop: `linkMeaningToWordForm(...)` for each link — no transaction

If an IndexedDB error, constraint violation, or any JavaScript exception occurs between phase 2 and phase 3 (e.g., after two of three meanings are created), the database will have orphaned `Meaning` rows with no `WordFormMeaning` links. Since this is a local-only offline app with no server-side reconciliation or cleanup, orphaned records silently accumulate and corrupt the data model that `aggregateMeaningFromPairs` and reporting functions depend on.

The same issue applies between meaning creation iterations: if creating the third meaning fails, meanings 1 and 2 exist unlinked.

**Fix:** Wrap the entire operation in a single Dexie transaction covering all four tables:

```ts
export async function addWordEntry(data: WordEntryInput): Promise<WordEntryResult> {
  if (data.wordForm.trim().length === 0) throw new Error('Word form cannot be empty')
  if (data.meanings.length === 0) throw new Error('At least one meaning is required')

  const validMeanings = data.meanings.filter(m => m.text.trim().length > 0)
  if (validMeanings.length === 0) throw new Error('At least one non-empty meaning is required')

  return db.transaction('rw', [db.wordForms, db.meanings, db.wordFormMeanings], async () => {
    const wordFormId = await findOrCreateWordForm(data.wordForm)
    const meaningIds: number[] = []

    for (const meaning of validMeanings) {
      const isoDate = meaning.firstUseDate ?? new Date().toISOString().slice(0, 10)
      const meaningId = await addMeaning({
        text: meaning.text,
        categories: meaning.categories,
        isActive: true,
        firstUseDate: isoDate,
        lastUseDate: isoDate,
      })
      meaningIds.push(meaningId)
      await linkMeaningToWordForm(wordFormId, meaningId, {
        firstObservationDate: isoDate.slice(0, 10),
        lastUsedDate: isoDate.slice(0, 10),
        isActive: true,
      })
    }

    // persist guard runs after transaction completes
    const totalLinks = await db.wordFormMeanings.count()
    if (totalLinks === validMeanings.length) {
      void navigator.storage?.persist?.()
    }

    return { wordFormId, meaningIds }
  })
}
```

---

### CR-03: Dashboard "New this month" count excludes all entries added on the 1st of the month

**File:** `src/pages/DashboardPage.tsx:30-36`

**Issue:** `monthStart` is constructed as a full ISO datetime string:

```ts
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
// e.g. "2026-09-01T00:00:00.000Z"
```

But `Meaning.firstUseDate` is stored as a date-only string `"YYYY-MM-DD"` (e.g., `"2026-09-01"`). Dexie uses JavaScript string ordering for this index. Lexicographically, `"2026-09-01"` < `"2026-09-01T00:00:00.000Z"` because the shorter string is a prefix of the longer one and compares as less. The `aboveOrEqual` filter therefore excludes every entry whose `firstUseDate` is the first day of the month.

In practice, any entry logged on September 1st will not be counted in "new this month" on any day in September. The count is always understated.

**Fix:**

```ts
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  .toISOString()
  .slice(0, 10)  // "2026-09-01" — matches stored format
```

The same date-format mismatch exists in `meaning.service.ts::getMeaningsUnused30Days` (see WR-01) and should be fixed there as well.

---

### CR-04: Save errors are silently swallowed — user loses form input with no feedback

**File:** `src/features/add-entry/hooks/useAddEntry.ts:47-65`

**Issue:** When `addWordEntry` throws, the `catch` block sets the `error` state, but the `finally` block immediately calls `reset()` which clears it again. The sheet is also closed unconditionally before the error can be rendered. The net React state update batch is:

```
setError("Word form cannot be empty")  ← catch
setAddWordSheetOpen(false)             ← finally
reset() → setError(null)              ← finally (clears the error)
```

The user sees the sheet close with no explanation. All typed form data is discarded. `AddEntrySheet.tsx` does not destructure `error` from `useAddEntry()` at all (line 19–27), so even if the timing were fixed, there is no UI element to display it.

This is confirmed by the test comment at line 117–118 in `useAddEntry.test.ts`:
```
// The sheet closing is the primary guarantee; the error is cleared by reset().
// The sheet closing is the primary guarantee; the error is cleared by reset().
expect(result.current.error).toBeNull()
```
The test documents the broken behavior as expected, masking the bug.

**Fix:** On error, keep the sheet open so the user can correct their input:

```ts
async function handleSave() {
  setIsLoading(true)
  setError(null)
  try {
    await addWordEntry({ wordForm, meanings })
    setIosInstallPromptSeen(true)
    reset()
    setAddWordSheetOpen(false)  // close only on success
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
    // sheet stays open; do NOT call reset()
  } finally {
    setIsLoading(false)
  }
}
```

And in `AddEntrySheet.tsx`, render the error:

```tsx
const { wordForm, setWordForm, meaningRows, addMeaningRow,
        updateMeaningRow, handleSave, isLoading, error } = useAddEntry()

// Inside the scrollable content area:
{error && (
  <p role="alert" className="text-sm text-destructive px-1">{error}</p>
)}
```

---

## Warnings

### WR-01: `getMeaningsUnused30Days` uses full ISO timestamp — boundary-day meanings incorrectly included

**File:** `src/db/services/meaning.service.ts:93`

**Issue:** `thirtyDaysAgo` is produced as a full ISO datetime string (`"2026-08-15T10:30:00.000Z"`). The `lastUseDate` field is stored as `"YYYY-MM-DD"`. Because `"2026-08-15" < "2026-08-15T..."` lexicographically, a meaning with `lastUseDate = "2026-08-15"` (used exactly 30 days ago) passes the `below(thirtyDaysAgo)` check and appears in the "Review these?" section even though it was used 30 days ago — not more than 30 days ago.

**Fix:**
```ts
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10)  // "2026-08-15"
```

---

### WR-02: `validMeanings` can be empty after filtering — word form created with no linked meanings

**File:** `src/db/services/wordEntry.service.ts:42-49`

**Issue:** The guard checks `data.meanings.length === 0` but the subsequent filter can reduce the list to zero:

```ts
if (data.meanings.length === 0) {
  throw new Error('At least one meaning is required')  // passes when meanings = [{ text: '' }]
}
const validMeanings = data.meanings.filter(m => m.text.trim().length > 0)
// validMeanings may now be []
```

When `validMeanings` is empty, the word form is found or created, but neither `addMeaning` nor `linkMeaningToWordForm` runs. The function returns `{ wordFormId, meaningIds: [] }`. A word form entry exists in the DB with zero links.

**Fix:** Move the empty-check after the filter:

```ts
const validMeanings = data.meanings.filter(m => m.text.trim().length > 0)
if (validMeanings.length === 0) {
  throw new Error('At least one non-empty meaning is required')
}
```

---

### WR-03: Profile save error silently discarded — no user feedback

**File:** `src/pages/ProfileEditPage.tsx:33-38`

**Issue:** When `updateChildProfile` throws, the error is only logged to `console.error`. The `isSaving` flag resets to `false` and the form remains open, but the user sees no toast, no error message, and no visual indication that their edit was not saved.

```ts
} catch (err) {
  console.error('Failed to save profile:', err)  // user sees nothing
}
```

`console.error` is also a debug artifact that should not remain in production code.

**Fix:** Maintain an error state and render it near the submit button:

```ts
const [saveError, setSaveError] = useState<string | null>(null)
// in catch:
setSaveError(t('common.saveFailed'))
console.error(...)  // can be removed in production
```

---

### WR-04: `error` from `useAddEntry` is never rendered in `AddEntrySheet`

**File:** `src/features/add-entry/components/AddEntrySheet.tsx:19-27`

**Issue:** `error` is returned by `useAddEntry()` but is not destructured in `AddEntrySheet`:

```ts
const {
  wordForm, setWordForm, meaningRows, addMeaningRow,
  updateMeaningRow, handleSave, isLoading,
  // error is missing here
} = useAddEntry()
```

Even after CR-04 is fixed and the sheet stays open on error, the error string will never be displayed until this component destructures and renders it.

**Fix:** Destructure `error` and add a `<p role="alert">` element inside the scrollable region (see CR-04 fix).

---

### WR-05: iOS install prompt misses iPadOS 13+ devices and already-installed PWAs

**File:** `src/features/ios-install/hooks/useiOSInstallPrompt.ts:10-15`

**Issue:** Two gaps in the detection logic:

1. `navigator.userAgent.includes('iPad')` fails on iPadOS 13+, which uses a desktop Safari user-agent string indistinguishable from macOS. iPads running iOS 13+ would never see the install prompt.

2. There is no check for `window.matchMedia('(display-mode: standalone)').matches`. If the user has already installed the PWA and opens it from the home screen, `shouldShow` can still evaluate `true` (if `iosInstallPromptSeen` is `true` from a previous entry save), causing the install instructions to appear inside the already-installed app.

**Fix:**

```ts
const isIOS =
  /iPhone|iPod/.test(navigator.userAgent) ||
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)  // iPadOS 13+

const isStandalone = window.matchMedia('(display-mode: standalone)').matches

const shouldShow = isIOS && !isStandalone && !alreadyDismissed && iosInstallPromptSeen
```

---

### WR-06: `MedicalContextSection` and `ProfileEditForm` use `any` to bypass type checking

**Files:**
- `src/features/onboarding/components/MedicalContextSection.tsx:13`
- `src/shared/components/ProfileEditForm.tsx:139`

**Issue:** `MedicalContextSection` accepts `register: UseFormRegister<FieldValues & any>` — the `& any` effectively erases type safety on the register prop. The call site in `ProfileEditForm` uses `register as any` to satisfy this intentionally broken type. Both `eslint-disable` comments acknowledge the suppression.

**Fix:** Make `MedicalContextSection` generic, matching the pattern already used by `LanguageChips`:

```ts
interface MedicalContextSectionProps<TFieldValues extends FieldValues> {
  register: UseFormRegister<TFieldValues>
}

export function MedicalContextSection<TFieldValues extends FieldValues>({
  register,
}: MedicalContextSectionProps<TFieldValues>) { ... }
```

Then in `ProfileEditForm`:
```tsx
<MedicalContextSection register={register} />  // no cast needed
```

---

### WR-07: Dashboard "Active Word Forms" label counts all word forms

**File:** `src/pages/DashboardPage.tsx:23-25`

**Issue:** The metric labelled `t('dashboard.activeWordForms')` ("Active Word Forms" / "Aktywne formy słów") is computed as:

```ts
const activeWordFormsCount = useLiveQuery(() =>
  db.wordForms.toCollection().count()
)
```

This counts every row in `wordForms` unconditionally. The `WordForm` schema has no `isActive` field, so there is no way to filter for "active" forms. The label is therefore a lie: the number reflects total word forms, not active ones. Either the label should read "Word Forms" (total), or `WordForm` needs an `isActive` field added in a schema migration.

---

### WR-08: `Collapsible` in `MedicalContextSection` sets `defaultOpen` while controlled

**File:** `src/features/onboarding/components/MedicalContextSection.tsx:21`

**Issue:**

```tsx
<Collapsible open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
```

When `open` is provided, Radix UI switches to controlled mode and ignores `defaultOpen`. The `defaultOpen={false}` prop is dead and misleading — it implies uncontrolled semantics but has no effect. Remove it to avoid confusion.

**Fix:**

```tsx
<Collapsible open={isOpen} onOpenChange={setIsOpen}>
```

---

_Reviewed: 2026-09-14T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
