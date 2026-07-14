import { WifiOff, RefreshCw } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Internet aloqasi yo'q
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Internet aloqangizni tekshiring va qaytadan urinib ko'ring.
        </p>

        {/* Retry Button */}
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Qayta urinish</span>
        </button>
      </div>
    </div>
  );
}
