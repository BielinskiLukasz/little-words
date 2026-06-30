import { RouterProvider } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from './db/db'
import { router } from './router'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { OnboardingPage } from './pages/OnboardingPage'

function AppGate() {
  const { t } = useTranslation('common')
  const profileCount = useLiveQuery(() => db.childProfile.count())

  if (profileCount === undefined) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-primary">{t('app.name')}</h1>
      </div>
    )
  }

  if (profileCount === 0) return <OnboardingPage />

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppGate />
    </ErrorBoundary>
  )
}
