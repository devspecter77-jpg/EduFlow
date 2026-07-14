import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/photo_2026-06-12_11-17-02.jpg"
            alt="EduFlow CRM"
            className="h-20 w-20 rounded-2xl object-cover shadow-lg"
          />
        </div>

        {/* 404 */}
        <h1 className="text-9xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Sahifa topilmadi
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Home className="w-5 h-5" />
            <span>Bosh sahifa</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:border-teal-600 dark:hover:border-teal-400 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </button>
        </div>
      </div>
    </div>
  );
}
