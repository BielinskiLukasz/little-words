import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageChips } from '@/features/onboarding/components/LanguageChips'
import { MedicalContextSection } from '@/features/onboarding/components/MedicalContextSection'
import type { ChildProfile } from '@/db/types'
import type { OnboardingFormData } from '@/features/onboarding/hooks/useOnboarding'

const profileEditSchema = z.object({
  name: z.string().min(1, { message: '__nameRequired__' }),
  birthDate: z.string().min(1, { message: '__birthDateRequired__' }),
  languages: z.array(z.string()).min(1, { message: '__languageRequired__' }),
  prematureBirth: z.boolean().optional(),
  speechTherapy: z.boolean().optional(),
  neurologicalCare: z.boolean().optional(),
  parentNotes: z.string().optional(),
})

export type ProfileEditFormData = z.infer<typeof profileEditSchema>

interface ProfileEditFormProps {
  defaultValues?: Partial<ChildProfile>
  onSave: (data: OnboardingFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function ProfileEditForm({
  defaultValues,
  onSave,
  isLoading = false,
  submitLabel,
}: ProfileEditFormProps) {
  const { t } = useTranslation('onboarding')
  const { t: tCommon } = useTranslation('common')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      birthDate: '',
      languages: [],
      prematureBirth: false,
      speechTherapy: false,
      neurologicalCare: false,
      parentNotes: '',
    },
  })

  // Pre-fill form when defaultValues change (e.g. data loaded via useLiveQuery)
  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? '',
        birthDate: defaultValues.birthDate ?? '',
        languages: defaultValues.languages ?? [],
        prematureBirth: defaultValues.prematureBirth ?? false,
        speechTherapy: defaultValues.speechTherapy ?? false,
        neurologicalCare: defaultValues.neurologicalCare ?? false,
        parentNotes: defaultValues.parentNotes ?? '',
      })
    }
  }, [defaultValues, reset])

  const onSubmit = async (data: ProfileEditFormData) => {
    await onSave(data)
  }

  const buttonLabel =
    submitLabel ?? tCommon('profile.edit.save', { defaultValue: 'Save' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Child Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('field.name')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          {...register('name')}
          type="text"
          placeholder={t('placeholder.name')}
          className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && (
          <p className="text-red-600 text-xs mt-1">{t('error.nameRequired')}</p>
        )}
      </div>

      {/* Birth Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('field.birthDate')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <input
          {...register('birthDate')}
          type="date"
          className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
            errors.birthDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.birthDate && (
          <p className="text-red-600 text-xs mt-1">{t('error.birthDateRequired')}</p>
        )}
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('field.languages')}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <LanguageChips control={control} name="languages" />
        {errors.languages && (
          <p className="text-red-600 text-xs mt-1">{t('error.languageRequired')}</p>
        )}
      </div>

      {/* Medical Context (Collapsible) */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <MedicalContextSection register={register as any} />

      {/* Submit */}
      <Button
        type="submit"
        disabled={!isValid || isLoading || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isLoading || isSubmitting ? t('button.saving') : buttonLabel}
      </Button>
    </form>
  )
}
