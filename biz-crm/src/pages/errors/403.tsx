/**
 * 403 Forbidden Page
 * Step 14: Global Error Handling
 */

import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
            <ShieldX className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          403
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Kirishga ruxsat yo'q
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bu sahifaga kirish uchun sizda ruxsat mavjud emas. Agar bu xato deb
          hisoblasangiz, administrator bilan bog'laning.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Orqaga
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            Bosh sahifa
          </button>
        </div>
      </div>
    </div>
  );
}
