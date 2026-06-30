import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAddEntry } from './useAddEntry'

// Mock the word entry service
vi.mock('@/db/services/wordEntry.service', () => ({
  addWordEntry: vi.fn(),
}))

// Mock useUIStore — supports both selector and full-store call patterns
const mockSetAddWordSheetOpen = vi.fn()

vi.mock('@/stores/ui.store', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useUIStore: vi.fn((selector?: (s: any) => any) => {
    const state = {
      addWordSheetOpen: false,
      setAddWordSheetOpen: mockSetAddWordSheetOpen,
      iosInstallPromptSeen: false,
      setIosInstallPromptSeen: vi.fn(),
    }
    return selector ? selector(state) : state
  }),
}))

import { addWordEntry } from '@/db/services/wordEntry.service'
import { useUIStore } from '@/stores/ui.store'

describe('useAddEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useUIStore).mockImplementation(((selector?: (s: any) => any) => {
      const state = {
        addWordSheetOpen: false,
        setAddWordSheetOpen: mockSetAddWordSheetOpen,
        iosInstallPromptSeen: false,
        setIosInstallPromptSeen: vi.fn(),
      }
      return selector ? selector(state) : state
    }) as any)
  })

  it('initializes with empty wordForm and one empty meaning row', () => {
    const { result } = renderHook(() => useAddEntry())
    expect(result.current.wordForm).toBe('')
    expect(result.current.meaningRows).toHaveLength(1)
    expect(result.current.meaningRows[0].text).toBe('')
    expect(result.current.meaningRows[0].categories).toEqual([])
    expect(result.current.meaningRows[0].firstUseDate).toBeTruthy()
  })

  it('setWordForm updates wordForm state', () => {
    const { result } = renderHook(() => useAddEntry())
    act(() => {
      result.current.setWordForm('mama')
    })
    expect(result.current.wordForm).toBe('mama')
  })

  it('addMeaningRow appends a new empty meaning row', () => {
    const { result } = renderHook(() => useAddEntry())
    act(() => {
      result.current.addMeaningRow()
    })
    expect(result.current.meaningRows).toHaveLength(2)
    expect(result.current.meaningRows[1].text).toBe('')
    expect(result.current.meaningRows[1].categories).toEqual([])
  })

  it('updateMeaningRow updates a row by id', () => {
    const { result } = renderHook(() => useAddEntry())
    const rowId = result.current.meaningRows[0].id
    act(() => {
      result.current.updateMeaningRow(rowId, { text: 'mom', categories: ['People'] })
    })
    expect(result.current.meaningRows[0].text).toBe('mom')
    expect(result.current.meaningRows[0].categories).toEqual(['People'])
  })

  it('handleSave calls addWordEntry and closes sheet on success', async () => {
    vi.mocked(addWordEntry).mockResolvedValue({ wordFormId: 1, meaningIds: [1] })
    const { result } = renderHook(() => useAddEntry())

    act(() => {
      result.current.setWordForm('mama')
      result.current.updateMeaningRow(result.current.meaningRows[0].id, { text: 'mom' })
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(addWordEntry).toHaveBeenCalledWith({
      wordForm: 'mama',
      meanings: expect.arrayContaining([
        expect.objectContaining({ text: 'mom' }),
      ]),
    })
    expect(mockSetAddWordSheetOpen).toHaveBeenCalledWith(false)
  })

  it('sets error state when addWordEntry throws', async () => {
    vi.mocked(addWordEntry).mockRejectedValue(new Error('DB error'))
    const { result } = renderHook(() => useAddEntry())

    act(() => {
      result.current.setWordForm('mama')
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(result.current.error).toBe('DB error')
  })

  it('initializes isLoading as false', () => {
    const { result } = renderHook(() => useAddEntry())
    expect(result.current.isLoading).toBe(false)
  })
})
