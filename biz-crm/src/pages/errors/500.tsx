import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error500() {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            500
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Serverda xatolik
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Kechirasiz, serverda kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring yoki keyinroq tashrif buyuring.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            Qayta yuklash
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200"
          >
            <Home className="w-5 h-5" />
            Bosh sahifa
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Agar muammo davom etsa, iltimos, texnik yordam bilan bog'laning.
          </p>
        </div>
      </div>
    </div>
  );
}
