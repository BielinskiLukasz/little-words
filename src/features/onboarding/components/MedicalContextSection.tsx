import { useState } from 'react'
import { UseFormRegister } from 'react-hook-form'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { OnboardingFormData } from '../hooks/useOnboarding'

interface MedicalContextSectionProps {
  register: UseFormRegister<OnboardingFormData>
}

export function MedicalContextSection({ register }: MedicalContextSectionProps) {
  const { t } = useTranslation('onboarding')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} defaultOpen={false}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <span>{t('section.medical')}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 rounded-b-lg border border-t-0 border-border bg-amber-50/50 px-4 py-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('prematureBirth')}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{t('field.prematureBirth')}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('speechTherapy')}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{t('field.speechTherapy')}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('neurologicalCare')}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">{t('field.neurologicalCare')}</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('field.parentNotes')}
            </label>
            <textarea
              {...register('parentNotes')}
              className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
              placeholder=""
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
