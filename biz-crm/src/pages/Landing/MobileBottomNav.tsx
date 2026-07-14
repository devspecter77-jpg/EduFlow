import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * Fixed bottom action bar shown only on phones (hidden from sm: up, where
 * the Navbar's own login/register/theme controls are already visible).
 */
export function MobileBottomNav() {
  const { theme, toggleTheme } = useTheme();
  const authCtx = useContext(AuthContext);
  const isAuthenticated = authCtx?.isAuthenticated ?? false;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={toggleTheme}
          className="flex-shrink-0 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Mavzuni o'zgartirish"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-300" />
          )}
        </button>

        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="flex-1 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold text-sm transition-colors hover:border-teal-600 dark:hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400"
            >
              Kirish
            </Link>
            <Link
              to="/register"
              className="flex-1 text-center bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              Ro'yxatdan o'tish
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
