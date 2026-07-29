import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { db } from '@/db/db'
import { CATEGORIES } from '@/db/schema'
import { getMeaningsGroupedByCategory } from '@/db/services/meaning.service'

export function CategoriesPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  // Get meanings grouped by category with counts
  const categoryData = useLiveQuery(() => getMeaningsGroupedByCategory())

  // Total meaningful count to determine empty state
  const totalMeanings = useLiveQuery(async () => {
    const count = await db.meanings.toCollection().count()
    return count
  })

  if (categoryData === undefined || totalMeanings === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  // Empty state when no meanings exist
  if (totalMeanings === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold">{t('categories.title')}</h1>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">{t('categories.empty')}</p>
        </div>
      </div>
    )
  }

  // Render categories list
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">{t('categories.title')}</h1>

      <div className="flex flex-col gap-2">
        {CATEGORIES.map(category => {
          const data = categoryData[category]
          const total = data?.total || 0
          const inactive = data?.inactive || 0

          return (
            <button
              key={category}
              onClick={() => navigate(`/meanings?category=${category}`)}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-card/80 active:bg-card/60 transition-colors"
            >
              <span className="font-medium">{t(`category.${category}`)}</span>
              <span className="text-sm text-muted-foreground">
                {total} ({inactive} {t('categories.inactive')})
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
