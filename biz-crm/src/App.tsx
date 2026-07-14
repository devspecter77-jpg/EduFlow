import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppProvider } from '@/contexts/AppContext';
import { PageLoader, ErrorBoundary } from '@/components/common';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ThemeProvider>
          <ToastProvider>
            <PageLoader duration={2200} />
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
