/**
 * Warms the browser's module cache for every dashboard page in the
 * background once the user is already inside the dashboard, so the
 * Suspense fallback most users actually hit while clicking around the
 * sidebar disappears — the chunk is already downloaded and parsed by
 * the time they navigate to it.
 */
export function prefetchDashboardRoutes(): void {
  const importers = [
    () => import('@/pages/Dashboard'),
    () => import('@/pages/Students'),
    () => import('@/pages/Teachers'),
    () => import('@/pages/Groups'),
    () => import('@/pages/Attendance'),
    () => import('@/pages/PaymentsNew'),
    () => import('@/pages/Analytics'),
    () => import('@/pages/Reports'),
    () => import('@/pages/SmartNotifications'),
    () => import('@/pages/Settings'),
    () => import('@/pages/Billing'),
  ];

  for (const importer of importers) {
    importer().catch(() => {
      // A failed prefetch just means the real navigation will fetch it
      // normally later — nothing to handle here.
    });
  }
}

/** Schedules the prefetch for idle time so it never competes with the current page's own load. */
export function schedulePrefetch(): void {
  const run = () => prefetchDashboardRoutes();
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(run);
  } else {
    setTimeout(run, 2000);
  }
}
