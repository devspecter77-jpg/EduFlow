import { useState, useRef, useContext } from 'react';
import { Moon, Sun, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { AuthContext } from '@/contexts/AuthContext';

export function Navbar() {
  const { resolvedTheme, setTheme } = useApp();
  const toggleTheme = () => setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  const authCtx = useContext(AuthContext);
  const isAuthenticated = authCtx?.isAuthenticated ?? false;
  const login = authCtx?.login;
  const navigate = useNavigate();
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretLoading, setSecretLoading] = useState(false);
  const [secretError, setSecretError] = useState('');
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current === 2) {
      setShowSecretModal(true);
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    } else {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 500);
    }
  };

  const handleSecretLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    if (!login) {
      setSecretError('Auth tizimi yuklanmagan. Sahifani yangilang.');
      return;
    }
    setSecretLoading(true);
    setSecretError('');
    try {
      await login({ phone, password });
      setShowSecretModal(false);
      navigate('/super-admin');
    } catch {
      setSecretError("Telefon yoki parol noto'g'ri");
    } finally {
      setSecretLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer select-none"
            onClick={handleLogoClick}
            title="Double click for admin access"
          >
            <img
              src="/photo_2026-06-12_11-17-02.jpg"
              alt="EduFlow CRM"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="text-lg font-bold text-gray-900 dark:text-white">EduFlow CRM</span>
          </div>

          {/* Right side — hidden on phones, where MobileBottomNav already
              provides the theme toggle + login/register/dashboard controls */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Mavzuni o'zgartirish"
            >
              {resolvedTheme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-300" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="border border-gray-300 dark:border-gray-600 hover:border-teal-600 dark:hover:border-teal-400 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-400"
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Secret Admin Login Modal */}
      {showSecretModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[85vh] overflow-y-auto translate-y-6 sm:translate-y-10">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Super Admin Access
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Administrator hisobingiz bilan kiring
              </p>
            </div>

            {secretError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{secretError}</p>
              </div>
            )}

            <form onSubmit={handleSecretLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefon raqam
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+998901234567"
                  defaultValue="+998900000000"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parol
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Parolni kiriting"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowSecretModal(false); setSecretError(''); }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={secretLoading}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  disabled={secretLoading}
                >
                  {secretLoading ? 'Kirmoqda...' : 'Kirish'}
                </button>
              </div>
            </form>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💡 Super Admin yo'q bo'lsa:{' '}
                <code className="text-teal-600 dark:text-teal-400">node create-superadmin.js</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
