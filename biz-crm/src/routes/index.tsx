/**
 * Application Router — Step 13
 * Lazy loading with React.lazy + Suspense for code splitting.
 * Every page is loaded on-demand to reduce initial bundle size.
 */

import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { DashboardLayout } from '@/layouts';
import { ROUTES } from '@/constants';

// ─── Lazy-loaded Pages ─────────────────────────────────────────────────────
const LandingPage = lazy(() =>
  import('@/pages/Landing').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('@/pages/Auth/Login').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/Auth/Register').then((m) => ({ default: m.RegisterPage }))
);

// Dashboard pages
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const Students = lazy(() =>
  import('@/pages/Students').then((m) => ({ default: m.Students }))
);
const Teachers = lazy(() =>
  import('@/pages/Teachers').then((m) => ({ default: m.Teachers }))
);
const Groups = lazy(() =>
  import('@/pages/Groups').then((m) => ({ default: m.Groups }))
);
const Attendance = lazy(() =>
  import('@/pages/Attendance').then((m) => ({ default: m.Attendance }))
);
const PaymentsNew = lazy(() =>
  import('@/pages/PaymentsNew').then((m) => ({ default: m.PaymentsNew }))
);
const Analytics = lazy(() =>
  import('@/pages/Analytics').then((m) => ({ default: m.Analytics }))
);
const Reports = lazy(() =>
  import('@/pages/Reports').then((m) => ({ default: m.Reports }))
);
const Settings = lazy(() =>
  import('@/pages/Settings').then((m) => ({ default: m.Settings }))
);
const SmartNotifications = lazy(() =>
  import('@/pages/SmartNotifications').then((m) => ({ default: m.SmartNotifications }))
);
const NotFound = lazy(() =>
  import('@/pages/NotFound').then((m) => ({ default: m.NotFound }))
);

// Error pages
const Error403 = lazy(() =>
  import('@/pages/errors/403').then((m) => ({ default: m.Forbidden }))
);
const Error404 = lazy(() =>
  import('@/pages/errors/404').then((m) => ({ default: m.NotFound }))
);
const Error500 = lazy(() =>
  import('@/pages/errors/500').then((m) => ({ default: m.default }))
);

// Super Admin pages (heaviest — load separately)
const SuperAdminDashboard = lazy(() =>
  import('@/pages/SuperAdmin').then((m) => ({ default: m.SuperAdminDashboard }))
);
const SuperAdminCenters = lazy(() =>
  import('@/pages/SuperAdmin').then((m) => ({ default: m.SuperAdminCenters }))
);
const SuperAdminPlans = lazy(() =>
  import('@/pages/SuperAdmin').then((m) => ({ default: m.SuperAdminPlans }))
);
const CenterDetail = lazy(() =>
  import('@/pages/SuperAdmin').then((m) => ({ default: m.CenterDetail }))
);
const SuperAdminUsers = lazy(() =>
  import('@/pages/SuperAdmin').then((m) => ({ default: m.SuperAdminUsers }))
);
const SuperAdminSubscriptions = lazy(() =>
  import('@/pages/SuperAdmin').then((m) => ({ default: m.SuperAdminSubscriptions }))
);

// Billing
const BillingPage = lazy(() =>
  import('@/pages/Billing').then((m) => ({ default: m.BillingPage }))
);

// Trial Expired
const TrialExpired = lazy(() =>
  import('@/pages/TrialExpired').then((m) => ({ default: m.TrialExpired }))
);

// ─── Suspense Wrapper ─────────────────────────────────────────────────────
function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: ROUTES.LANDING,
    element: <Lazy><LandingPage /></Lazy>,
  },
  {
    path: ROUTES.LOGIN,
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    path: ROUTES.REGISTER,
    element: <Lazy><RegisterPage /></Lazy>,
  },
  {
    path: ROUTES.TRIAL_EXPIRED,
    element: <Lazy><TrialExpired /></Lazy>,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Lazy><Dashboard /></Lazy> },
      { path: 'students', element: <Lazy><Students /></Lazy> },
      { path: 'teachers', element: <Lazy><Teachers /></Lazy> },
      { path: 'groups', element: <Lazy><Groups /></Lazy> },
      { path: 'attendance', element: <Lazy><Attendance /></Lazy> },
      { path: 'payments', element: <Lazy><PaymentsNew /></Lazy> },
      { path: 'analytics', element: <Lazy><Analytics /></Lazy> },
      { path: 'reports', element: <Lazy><Reports /></Lazy> },
      { path: 'notifications', element: <Lazy><SmartNotifications /></Lazy> },
      { path: 'settings', element: <Lazy><Settings /></Lazy> },
      { path: 'billing', element: <Lazy><BillingPage /></Lazy> },
    ],
  },
  {
    path: '/super-admin',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Lazy><SuperAdminDashboard /></Lazy> },
      { path: 'users', element: <Lazy><SuperAdminUsers /></Lazy> },
      { path: 'centers', element: <Lazy><SuperAdminCenters /></Lazy> },
      { path: 'centers/:id', element: <Lazy><CenterDetail /></Lazy> },
      { path: 'plans', element: <Lazy><SuperAdminPlans /></Lazy> },
      { path: 'subscriptions', element: <Lazy><SuperAdminSubscriptions /></Lazy> },
    ],
  },
  {
    path: '/403',
    element: <Lazy><Error403 /></Lazy>,
  },
  {
    path: '/404',
    element: <Lazy><Error404 /></Lazy>,
  },
  {
    path: '/500',
    element: <Lazy><Error500 /></Lazy>,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <Lazy><NotFound /></Lazy>,
  },
]);
