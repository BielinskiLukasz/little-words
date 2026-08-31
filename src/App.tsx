import { RouterProvider } from 'react-router'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { router } from './router'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  const { t } = useTranslation('common')
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      toast(t('pwa.updateAvailable'), {
        action: {
          label: t('pwa.refresh'),
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
      })
    },
  })

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" />
    </ErrorBoundary>
  )
}
