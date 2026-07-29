import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { db } from '@/db/db'
import { getMeaningsUnused30Days } from '@/db/services/meaning.service'

export function DashboardPage() {
  const { t } = useTranslation('common')

  // Load profile for verification
  const profile = useLiveQuery(() => db.childProfile.toCollection().first())

  // Active meanings count
  const activeMeaningsCount = useLiveQuery(async () => {
    const results = await db.meanings
      .toCollection()
      .filter(m => m.isActive)
      .count()
    return results
  })

  // Active word forms count
  const activeWordFormsCount = useLiveQuery(() =>
    db.wordForms.toCollection().count()
  )

  // New meanings this month
  const newMeaningsThisMonth = useLiveQuery(async () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const results = await db.meanings
      .where('firstUseDate')
      .aboveOrEqual(monthStart)
      .toArray()
    return results.length
  })

  // Meanings unused for 30+ days
  const unusedMeanings = useLiveQuery(() => getMeaningsUnused30Days())

  if (profile === undefined || activeMeaningsCount === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero Card: Active Meanings */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">
          {t('dashboard.activeMeanings')}
        </p>
        <p className="text-2xl font-semibold leading-[1.1]">
          {activeMeaningsCount ?? 0}
        </p>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Word Forms */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t('dashboard.activeWordForms')}
          </p>
          <p className="text-xl font-semibold">
            {activeWordFormsCount ?? 0}
          </p>
        </div>

        {/* New Meanings This Month */}
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">
            {t('dashboard.newThisMonth')}
          </p>
          <p className="text-xl font-semibold">
            {newMeaningsThisMonth ?? 0}
          </p>
        </div>
      </div>

      {/* Review These? Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {t('dashboard.reviewSection')}
        </h2>

        {unusedMeanings === undefined ? (
          <p className="text-muted-foreground">{t('app.loading')}</p>
        ) : unusedMeanings.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            {t('dashboard.reviewEmpty')}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {unusedMeanings.map(meaning => (
              <Link
                key={meaning.id}
                to={`/meanings/${meaning.id}`}
                className="rounded-lg border border-border bg-card p-3 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {meaning.text}
              </Link>
            ))}
            {unusedMeanings.length >= 3 && (
              <Link
                to="/meanings"
                className="text-sm text-primary hover:underline"
              >
                {t('dashboard.seeAllReview')}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
