import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { getWordFormsWithActiveMeaningCount } from '@/db/services/wordForm.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function WordFormsPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [sortOrder, setSortOrder] = useState<'newest' | 'alpha'>('newest')

  // Load word forms from database with active meaning count
  const wordForms = useLiveQuery(async () => {
    return getWordFormsWithActiveMeaningCount()
  })

  // Sort word forms in-memory based on sortOrder
  const sorted = wordForms
    ? [...wordForms].sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        } else {
          return a.form.localeCompare(b.form)
        }
      })
    : []

  if (wordForms === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Title and Sort Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          {t('nav.wordForms')}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSortOrder(sortOrder === 'newest' ? 'alpha' : 'newest')
          }
        >
          {sortOrder === 'newest'
            ? t('wordForms.sortNewest')
            : t('wordForms.sortAlpha')}
        </Button>
      </div>

      {/* Word Forms List or Empty State */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
          <p className="text-center text-sm text-muted-foreground">
            {t('wordForms.empty')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(wordForm => (
            <button
              key={wordForm.id}
              onClick={() => navigate(`/word-forms/${wordForm.id}`)}
              className={`flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
                wordForm.activeMeaningCount === 0 ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{wordForm.form}</p>
                {wordForm.activeMeaningCount === 0 && (
                  <Badge variant="outline" className="text-gray-400 bg-gray-100">
                    Inactive
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
