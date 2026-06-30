import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'

interface WordFormInputProps {
  value: string
  onChange: (v: string) => void
}

/** Sub-component that looks up existing meanings for the given word form (debounced 500ms). */
function ExistingMeaningsPreview({ wordForm }: { wordForm: string }) {
  const { t } = useTranslation('common')
  const [debouncedValue, setDebouncedValue] = useState('')

  useEffect(() => {
    if (wordForm.length === 0) {
      setDebouncedValue('')
      return
    }
    const timer = setTimeout(() => {
      setDebouncedValue(wordForm.toLowerCase())
    }, 500)
    return () => clearTimeout(timer)
  }, [wordForm])

  const matchedMeanings = useLiveQuery(async () => {
    if (debouncedValue.length === 0) return []
    const matched = await db.wordForms
      .where('form')
      .equals(debouncedValue)
      .first()
    if (!matched) return []
    const links = await db.wordFormMeanings
      .where('wordFormId')
      .equals(matched.id!)
      .toArray()
    const meaningIds = links.map((l) => l.meaningId)
    const meanings = await db.meanings.bulkGet(meaningIds)
    return meanings.filter(Boolean).map((m) => m!.text)
  }, [debouncedValue])

  if (!matchedMeanings || matchedMeanings.length === 0) return null

  return (
    <p className="text-xs text-amber-700 mt-1">
      {t('addWord.existingLinked', {
        form: wordForm,
        meanings: matchedMeanings.join(', '),
      })}
    </p>
  )
}

export function WordFormInput({ value, onChange }: WordFormInputProps) {
  const { t } = useTranslation('common')

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {t('addWord.wordFormLabel')}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        placeholder={t('addWord.wordFormLabel')}
      />
      <ExistingMeaningsPreview wordForm={value} />
    </div>
  )
}
