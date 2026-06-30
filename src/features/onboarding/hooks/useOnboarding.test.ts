import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOnboarding } from './useOnboarding'

vi.mock('@/db/services/childProfile.service', () => ({
  saveChildProfile: vi.fn().mockResolvedValue(1),
}))

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports useOnboarding and OnboardingFormData', async () => {
    const module = await import('./useOnboarding')
    expect(typeof module.useOnboarding).toBe('function')
  })

  it('initial state: isLoading=false, error=null, showWelcome=false', () => {
    const { result } = renderHook(() => useOnboarding())
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.showWelcome).toBe(false)
  })

  it('saveProfile calls saveChildProfile with createdAt', async () => {
    const { saveChildProfile } = await import('@/db/services/childProfile.service')
    const { result } = renderHook(() => useOnboarding())

    await act(async () => {
      await result.current.saveProfile({
        name: 'Zosia',
        birthDate: '2023-01-15',
        languages: ['Polish'],
      })
    })

    expect(saveChildProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Zosia',
        birthDate: '2023-01-15',
        languages: ['Polish'],
        createdAt: expect.any(String),
      })
    )
  })

  it('saveProfile sets showWelcome to true on success', async () => {
    const { result } = renderHook(() => useOnboarding())

    await act(async () => {
      await result.current.saveProfile({
        name: 'Zosia',
        birthDate: '2023-01-15',
        languages: ['Polish'],
      })
    })

    expect(result.current.showWelcome).toBe(true)
  })

  it('saveProfile sets isLoading=true during save and false after', async () => {
    const { saveChildProfile } = await import('@/db/services/childProfile.service')
    let resolveSave!: () => void
    vi.mocked(saveChildProfile).mockReturnValueOnce(
      new Promise<number>((resolve) => {
        resolveSave = () => resolve(1)
      })
    )

    const { result } = renderHook(() => useOnboarding())
    let savePromise!: Promise<void>

    act(() => {
      savePromise = result.current.saveProfile({
        name: 'Zosia',
        birthDate: '2023-01-15',
        languages: ['Polish'],
      })
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveSave()
      await savePromise
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('saveProfile sets error on failure', async () => {
    const { saveChildProfile } = await import('@/db/services/childProfile.service')
    vi.mocked(saveChildProfile).mockRejectedValueOnce(new Error('DB error'))

    const { result } = renderHook(() => useOnboarding())

    await act(async () => {
      await result.current.saveProfile({
        name: 'Zosia',
        birthDate: '2023-01-15',
        languages: ['Polish'],
      })
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.showWelcome).toBe(false)
  })
})
