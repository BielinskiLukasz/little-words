import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
import { updateChildProfile } from '@/db/services/childProfile.service'
import { ProfileEditForm } from '@/shared/components/ProfileEditForm'
import type { OnboardingFormData } from '@/features/onboarding/hooks/useOnboarding'

export function ProfileEditPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)

  const profile = useLiveQuery(() => db.childProfile.toCollection().first())

  if (profile === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  const handleSave = async (data: OnboardingFormData) => {
    if (!profile?.id) return
    setIsSaving(true)
    try {
      await updateChildProfile(profile.id, {
        ...data,
        createdAt: profile.createdAt,
      })
      navigate(-1)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">
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
