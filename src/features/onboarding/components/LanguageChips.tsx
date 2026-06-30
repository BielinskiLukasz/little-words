import { useState, KeyboardEvent } from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface LanguageChipsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
}

const PREDEFINED_LANGUAGES = ['polish', 'english'] as const

export function LanguageChips<TFieldValues extends FieldValues>({
  control,
  name,
}: LanguageChipsProps<TFieldValues>) {
  const { t } = useTranslation('onboarding')
  const [customInput, setCustomInput] = useState('')

  const predefinedLabels: Record<string, string> = {
    polish: t('chips.polish'),
    english: t('chips.english'),
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value: string[] = Array.isArray(field.value) ? (field.value as string[]) : []

        const togglePredefined = (langKey: string) => {
          const label = predefinedLabels[langKey]
          if (value.includes(label)) {
            field.onChange(value.filter((l) => l !== label))
          } else {
            field.onChange([...value, label])
          }
        }

        const removeChip = (lang: string) => {
          field.onChange(value.filter((l) => l !== lang))
        }

        const addCustom = () => {
          const trimmed = customInput.trim()
          if (trimmed && !value.includes(trimmed)) {
            field.onChange([...value, trimmed])
          }
          setCustomInput('')
        }

        const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addCustom()
          }
        }

        return (
          <div className="space-y-3">
            {/* Predefined chips */}
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_LANGUAGES.map((langKey) => {
                const label = predefinedLabels[langKey]
                const isSelected = value.includes(label)
                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => togglePredefined(langKey)}
                    className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-full"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                    >
                      {label}
                      {isSelected && (
                        <X
                          size={12}
                          className="ml-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeChip(label)
                          }}
                        />
                      )}
                    </Badge>
                  </button>
                )
              })}
            </div>

            {/* Custom chips added by user */}
            {value
              .filter((l) => !Object.values(predefinedLabels).includes(l))
              .map((lang) => (
                <Badge
                  key={lang}
                  variant="default"
                  className="cursor-pointer select-none mr-2"
                  onClick={() => removeChip(lang)}
                >
                  {lang}
                  <X size={12} className="ml-1" />
                </Badge>
              ))}

            {/* Custom language input */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder.otherLanguage')}
                className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustom}
                disabled={!customInput.trim()}
              >
                {t('button.addLanguage')}
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
