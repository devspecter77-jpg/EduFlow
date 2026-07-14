import { Component, type ReactNode } from 'react';
import { RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-8">
              <img
                src="/photo_2026-06-12_11-17-02.jpg"
                alt="EduFlow CRM"
                className="h-20 w-20 rounded-2xl object-cover shadow-lg"
              />
            </div>

            <h1 className="text-9xl font-bold text-gray-900 dark:text-white mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Xatolik yuz berdi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Kechirasiz, tizimda kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <summary className="text-sm font-medium text-red-700 dark:text-red-300 cursor-pointer">
                  Xato tafsilotlari (dev only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Yangilash</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>Bosh sahifa</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
