// Application routes
export const ROUTES = {
  // Public routes
  HOME: '/dashboard',
  LANDING: '/',
  
  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Trial and subscription
  TRIAL_EXPIRED: '/trial-expired',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  STUDENTS: '/dashboard/students',
  TEACHERS: '/dashboard/teachers',
  GROUPS: '/dashboard/groups',
  ATTENDANCE: '/dashboard/attendance',
  PAYMENTS: '/dashboard/payments',
  ANALYTICS: '/dashboard/analytics',
  REPORTS: '/dashboard/reports',
  SETTINGS: '/dashboard/settings',
  
  // Other routes
  NOT_FOUND: '*',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = typeof ROUTES[RouteKey];
