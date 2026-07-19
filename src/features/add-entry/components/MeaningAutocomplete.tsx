import { useTranslation } from 'react-i18next'
import { useMeaningSearch } from '../hooks/useMeaningSearch'

interface MeaningAutocompleteProps {
  meaningText: string
  onSelect: (text: string, isNew: boolean) => void
}

export function MeaningAutocomplete({ meaningText, onSelect }: MeaningAutocompleteProps) {
  const { t } = useTranslation('common')
  const suggestions = useMeaningSearch(meaningText)

  if (!meaningText || !suggestions || suggestions.length === 0) {
    return null
  }

  const hasExactMatch = suggestions.some(
    (s) => s.text.toLowerCase() === meaningText.toLowerCase()
  )

  return (
    <ul className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
      {suggestions.map((suggestion) => (
        <li
          key={suggestion.id}
          className="px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer"
          onClick={() => onSelect(suggestion.text, false)}
        >
          {suggestion.text}
        </li>
      ))}
      {!hasExactMatch && meaningText.length > 0 && (
        <li
          className="px-3 py-2 text-sm text-primary hover:bg-muted cursor-pointer border-t border-border"
          onClick={() => onSelect(meaningText, true)}
        >
          {t('addWord.createNew', { text: meaningText })}
        </li>
      )}
    </ul>
  )
}
