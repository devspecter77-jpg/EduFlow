import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppProvider } from '@/contexts/AppContext';
import { PageLoader, ErrorBoundary } from '@/components/common';

function AppShell() {
  const { isLoading } = useAuth();
  return (
    <>
      <PageLoader loading={isLoading} />
      <RouterProvider router={router} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
