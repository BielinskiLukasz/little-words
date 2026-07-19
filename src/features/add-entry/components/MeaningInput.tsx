import { useTranslation } from 'react-i18next'
import type { MeaningRowState } from '../hooks/useAddEntry'
import { MeaningAutocomplete } from './MeaningAutocomplete'
import { CategoryChips } from './CategoryChips'

interface MeaningInputProps {
  row: MeaningRowState
  onChange: (partial: Partial<MeaningRowState>) => void
}

export function MeaningInput({ row, onChange }: MeaningInputProps) {
  const { t } = useTranslation('common')

  return (
    <div className="space-y-3 p-3 rounded-lg border border-border">
      {/* Meaning text input with autocomplete */}
      <div className="relative">
        <label htmlFor={`meaning-text-${row.id}`} className="block text-sm font-medium text-foreground mb-1">
          {t('addWord.meaningLabel')}
        </label>
        <input
          id={`meaning-text-${row.id}`}
          name={`meaningText-${row.id}`}
          type="text"
          autoComplete="off"
          value={row.text}
          onChange={(e) => onChange({ text: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder={t('addWord.meaningLabel')}
        />
        <MeaningAutocomplete
          meaningText={row.text}
          onSelect={(text) => onChange({ text })}
        />
      </div>

      {/* First use date */}
      <div>
        <label htmlFor={`meaning-date-${row.id}`} className="block text-sm font-medium text-foreground mb-1">
          {t('addWord.dateLabel')}
        </label>
        <input
          id={`meaning-date-${row.id}`}
          name={`meaningDate-${row.id}`}
          type="date"
          autoComplete="off"
          value={row.firstUseDate}
          onChange={(e) => onChange({ firstUseDate: e.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Category chips */}
      <CategoryChips
        value={row.categories}
        onChange={(categories) => onChange({ categories })}
      />
    </div>
  )
}
