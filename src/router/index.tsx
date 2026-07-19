import { createHashRouter, Navigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import { RootLayout } from '../shared/components/RootLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { MeaningsPage } from '../pages/MeaningsPage';
import { WordFormsPage } from '../pages/WordFormsPage';
import { MorePage } from '../pages/MorePage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { TimelinePage } from '../pages/TimelinePage';
import { DoctorReportPage } from '../pages/DoctorReportPage';
import { SettingsPage } from '../pages/SettingsPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { ProfileEditPage } from '../pages/ProfileEditPage';

function AuthGuard() {
  const { t } = useTranslation('common')
  const profileCount = useLiveQuery(() => db.childProfile.count())

  if (profileCount === undefined) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-primary">{t('app.name')}</h1>
      </div>
    )
  }

  if (profileCount === 0) {
    return <Navigate to="/onboarding" replace />
  }

  return <RootLayout />
}

export const router = createHashRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'meanings', element: <MeaningsPage /> },
      { path: 'word-forms', element: <WordFormsPage /> },
      { path: 'more', element: <MorePage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'doctor-report', element: <DoctorReportPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile/edit', element: <ProfileEditPage /> },
    ],
  },
  { path: '/onboarding', element: <OnboardingPage /> },
]);
