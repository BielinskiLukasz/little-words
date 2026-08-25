import { RouterProvider } from 'react-router'
import { router } from './router'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" />
    </ErrorBoundary>
  )
}
