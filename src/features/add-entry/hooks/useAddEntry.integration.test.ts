import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import Dexie from 'dexie'
import { AppDB } from '@/db/db'
import { useUIStore } from '@/stores/ui.store'

// Regression coverage for popup-no-close (.planning/debug/popup-no-close.md).
//
// Reported symptom: the add-entry sheet stayed open when the user saved a
// word form with no meaning text entered, even though it closed correctly
// when a meaning was provided.
//
// This suite exercises the REAL addWordEntry service (fake-indexeddb) and
// the REAL ui.store together with useAddEntry — the existing unit test
// (useAddEntry.test.ts) mocks addWordEntry entirely, which hides exactly
// this class of regression: whether the service throws for a given input
// is precisely what determines whether the sheet closes.

let testDb: AppDB

vi.mock('@/db/db', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/db/db')>()
  return {
    ...original,
    get db() {
      return testDb
    },
  }
})

describe('useAddEntry + addWordEntry integration - sheet close behavior', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...globalThis.navigator,
        storage: {
          persist: vi.fn().mockResolvedValue(true),
          persisted: vi.fn().mockResolvedValue(true),
        },
      },
      configurable: true,
      writable: true,
    })

    // Simulate the sheet being open before save, as it would be in the app.
    useUIStore.setState({ addWordSheetOpen: true })
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('closes the sheet when word form is filled but the meaning field is left blank', async () => {
    const { useAddEntry } = await import('./useAddEntry')
    const { result } = renderHook(() => useAddEntry())

    act(() => {
      result.current.setWordForm('mama')
      // Meaning row is left at its default empty-string text — no updateMeaningRow call.
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(useUIStore.getState().addWordSheetOpen).toBe(false)
    expect(result.current.error).toBeNull()

    const wfCount = await testDb.wordForms.count()
    const mCount = await testDb.meanings.count()
    expect(wfCount).toBe(1)
    expect(mCount).toBe(0)
  })

  it('closes the sheet when the meaning field contains only whitespace (boundary neighbor)', async () => {
    const { useAddEntry } = await import('./useAddEntry')
    const { result } = renderHook(() => useAddEntry())

    act(() => {
      result.current.setWordForm('baba')
      result.current.updateMeaningRow(result.current.meaningRows[0].id, { text: '   ' })
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(useUIStore.getState().addWordSheetOpen).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('still closes the sheet when a real meaning is provided (differential control)', async () => {
    const { useAddEntry } = await import('./useAddEntry')
    const { result } = renderHook(() => useAddEntry())

    act(() => {
      result.current.setWordForm('mama')
      result.current.updateMeaningRow(result.current.meaningRows[0].id, { text: 'mom' })
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(useUIStore.getState().addWordSheetOpen).toBe(false)
    expect(result.current.error).toBeNull()

    const mCount = await testDb.meanings.count()
    expect(mCount).toBe(1)
  })
})
