/**
 * 404 Not Found Page
 * Step 14: Global Error Handling
 */

import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function NotFound() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to students page with search
      navigate(`/dashboard/students?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-6">
            <FileQuestion className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Sahifa topilmadi
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan. Quyidagi
          havolalardan foydalanib, kerakli ma'lumotni topishingiz mumkin.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Talaba yoki guruh qidirish..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Qidirish
            </button>
          </div>
        </form>

        {/* Navigation Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Orqaga
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            Bosh sahifa
          </button>
        </div>

        {/* Quick Links */}
        <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Tez havolalar:
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate('/dashboard/students')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → Talabalar ro'yxati
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/dashboard/groups')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → Guruhlar
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/dashboard/payments')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → To'lovlar
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/dashboard/reports')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                → Hisobotlar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
