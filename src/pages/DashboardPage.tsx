import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'

export function DashboardPage() {
  const { t } = useTranslation()
  const profile = useLiveQuery(() => db.childProfile.toCollection().first())

  if (profile === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">
        {profile ? `Hello, ${profile.name}!` : t('nav.dashboard')}
      </h1>
      <p className="text-muted-foreground">
        {profile
          ? `Tracking ${profile.name}'s words`
          : t('nav.dashboard')}
      </p>
    </div>
  )
}
