import { useState } from 'react'
import { saveChildProfile } from '@/db/services/childProfile.service'

export interface OnboardingFormData {
  name: string
  birthDate: string
  languages: string[]
  prematureBirth?: boolean
  speechTherapy?: boolean
  neurologicalCare?: boolean
  parentNotes?: string
}

interface UseOnboardingReturn {
  saveProfile: (data: OnboardingFormData) => Promise<void>
  isLoading: boolean
  error: Error | null
  showWelcome: boolean
}

export function useOnboarding(): UseOnboardingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  const saveProfile = async (data: OnboardingFormData): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await saveChildProfile({
        ...data,
        createdAt: new Date().toISOString(),
      })
      setShowWelcome(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save profile'))
    } finally {
      setIsLoading(false)
    }
  }

  return { saveProfile, isLoading, error, showWelcome }
}
