import { vi } from 'vitest'

export const useRegisterSW = vi.fn(() => ({
  needRefresh: [false, vi.fn()] as [boolean, () => void],
  offlineReady: [false, vi.fn()] as [boolean, () => void],
  updateServiceWorker: vi.fn(),
}))
