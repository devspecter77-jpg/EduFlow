import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppProvider } from '@/contexts/AppContext';
import { PageLoader, ErrorBoundary } from '@/components/common';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <PageLoader duration={2200} />
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
