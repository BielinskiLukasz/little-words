import { createHashRouter, Navigate } from 'react-router';
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

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
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
    ],
  },
  { path: '/onboarding', element: <OnboardingPage /> },
]);
