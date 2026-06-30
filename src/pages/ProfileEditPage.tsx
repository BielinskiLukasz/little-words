import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
import { saveChildProfile } from '@/db/services/childProfile.service'
import { ProfileEditForm } from '@/shared/components/ProfileEditForm'
import type { OnboardingFormData } from '@/features/onboarding/hooks/useOnboarding'

export function ProfileEditPage() {
  const { t } = useTranslation('common')
  const [isSaving, setIsSaving] = useState(false)

  const profile = useLiveQuery(() => db.childProfile.toCollection().first())

  // Show a loading state while the profile is being loaded
  if (profile === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading', { defaultValue: 'Loading…' })}</p>
      </div>
    )
  }

  const handleSave = async (data: OnboardingFormData) => {
    if (!profile) return
    setIsSaving(true)
    try {
      await saveChildProfile({
        ...data,
        createdAt: profile.createdAt,
      })
      window.alert(t('profile.edit.savedSuccess', { defaultValue: 'Profile saved!' }))
    } catch (err) {
      console.error('Failed to save profile:', err)
      window.alert(t('profile.edit.savedError', { defaultValue: 'Failed to save. Please try again.' }))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {t('profile.edit.title')}
      </h1>
      <ProfileEditForm
        defaultValues={profile ?? undefined}
        onSave={handleSave}
        isLoading={isSaving}
        submitLabel={t('profile.edit.save')}
      />
    </div>
  )
}
