import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORIES } from '@/db/schema'
import type { Category } from '@/db/types'

export function MeaningsPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortOrder, setSortOrder] = useState<'newest' | 'alpha'>('newest')

  // Get category filter from query param
  const categoryParam = searchParams.get('category')
  const categoryFilter = (categoryParam && CATEGORIES.includes(categoryParam as Category) ? categoryParam : null) as Category | null

  // Load meanings with optional category filter
  const meanings = useLiveQuery(async () => {
    let query = db.meanings.toCollection()
    if (categoryFilter) {
      query = query.and((m) => m.categories.includes(categoryFilter))
    }
    return query.toArray()
  }, [categoryFilter])

  // Sort meanings in-memory based on sortOrder
  const sorted = meanings
    ? [...meanings].sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.firstUseDate).getTime() - new Date(a.firstUseDate).getTime()
        } else {
          return a.text.localeCompare(b.text)
        }
      })
    : []

  if (meanings === undefined) {
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
          {t('nav.meanings')}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSortOrder(sortOrder === 'newest' ? 'alpha' : 'newest')
          }
        >
          {sortOrder === 'newest'
            ? t('meanings.sortNewest')
            : t('meanings.sortAlpha')}
        </Button>
      </div>

      {/* Filter Chip */}
      {categoryFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="inline-flex items-center gap-2">
            {t('meanings.filtering')} {categoryFilter}
            <button
              onClick={() => setSearchParams({})}
              className="ml-1 text-sm font-bold"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* Meanings List or Empty State */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
          <p className="text-center text-sm text-muted-foreground">
            {t('meanings.empty')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(meaning => (
            <button
              key={meaning.id}
              onClick={() => navigate(`/meanings/${meaning.id}`)}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <p className="font-medium text-foreground">{meaning.text}</p>
              {meaning.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {meaning.categories.map(cat => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
