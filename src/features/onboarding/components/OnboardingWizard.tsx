import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '../hooks/useOnboarding'
import { LanguageChips } from './LanguageChips'
import { MedicalContextSection } from './MedicalContextSection'
import { WelcomeScreen } from '@/features/welcome/components/WelcomeScreen'

const onboardingSchema = z.object({
  name: z.string().min(1, { message: '__nameRequired__' }),
  birthDate: z.string().min(1, { message: '__birthDateRequired__' }),
  languages: z.array(z.string()).min(1, { message: '__languageRequired__' }),
  prematureBirth: z.boolean().optional(),
  speechTherapy: z.boolean().optional(),
  neurologicalCare: z.boolean().optional(),
  parentNotes: z.string().optional(),
})

export type OnboardingSchema = z.infer<typeof onboardingSchema>

export function OnboardingWizard() {
  const { t } = useTranslation('onboarding')
  const { saveProfile, isLoading, showWelcome } = useOnboarding()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
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

  const childName = watch('name')

  const onSubmit = async (data: OnboardingSchema) => {
    await saveProfile(data)
  }

  if (showWelcome) {
    return <WelcomeScreen childName={childName} />
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-white to-amber-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-6 max-w-md mx-auto w-full">
        <header className="text-center pt-8 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('title', { name: childName || '…' })}
          </h1>
          <p className="text-sm text-gray-600 mt-2">{t('subtitle')}</p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
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
          <MedicalContextSection register={register} />
        </form>
      </div>

      {/* Sticky submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-6 px-4">
        <div className="max-w-md mx-auto">
          <Button
            type="submit"
            disabled={!isValid || isLoading || isSubmitting}
            className="w-full"
            size="lg"
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading || isSubmitting ? t('button.saving') : t('button.getStarted')}
          </Button>
        </div>
      </div>
    </div>
  )
}
