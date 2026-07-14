import { AlertTriangle, X } from 'lucide-react';

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const btnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : variant === 'warning'
      ? 'bg-orange-600 hover:bg-orange-700 text-white'
      : 'bg-teal-600 hover:bg-teal-700 text-white';

  const iconClass =
    variant === 'danger'
      ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
      : variant === 'warning'
      ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      : 'text-teal-600 bg-teal-100 dark:bg-teal-900/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-card border shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onCancel} aria-label="Yopish" className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-3 flex-shrink-0 ${iconClass}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 border-t px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${btnClass}`}
          >
            {loading ? 'Yuklanmoqda...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
