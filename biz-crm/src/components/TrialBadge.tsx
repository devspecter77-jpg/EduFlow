import { Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrial } from '@/hooks/useTrial';

export function TrialBadge() {
  const { trialActive, daysLeft, isTrialExpired } = useTrial();
  const navigate = useNavigate();

  // Faol obuna bo'lsa yoki super admin - ko'rsatma
  if (!trialActive && !isTrialExpired) return null;

  // Muddat tugagan
  if (isTrialExpired) {
    return (
      <button
        onClick={() => navigate('/dashboard/billing')}
        className="flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
      >
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        <span>Muddat tugadi!</span>
      </button>
    );
  }

  // Rang: 1-3 kun qolsa qizil, 4-6 sariq, 7+ yashil
  const colorClass =
    daysLeft !== null && daysLeft <= 3
      ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
      : daysLeft !== null && daysLeft <= 6
      ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
      : 'bg-teal-100 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400';

  return (
    <button
      onClick={() => navigate('/dashboard/billing')}
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors hover:opacity-80 ${colorClass}`}
    >
      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
      <span>
        {daysLeft === 0 ? 'Bugun tugaydi!' : `${daysLeft} kun`}
      </span>
    </button>
  );
}

// Sidebar uchun kengaytirilgan versiya
export function TrialBadgeSidebar() {
  const { trialActive, daysLeft, isTrialExpired } = useTrial();
  const navigate = useNavigate();

  if (!trialActive && !isTrialExpired) return null;

  const isUrgent = isTrialExpired || (daysLeft !== null && daysLeft <= 3);
  const isWarning = !isExpiredFn(isTrialExpired, daysLeft) && daysLeft !== null && daysLeft <= 6;

  function isExpiredFn(expired: boolean, days: number | null) {
    return expired || days === 0;
  }

  return (
    <div
      className={`mx-3 mb-3 rounded-xl border p-3 cursor-pointer transition-all ${
        isUrgent
          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
          : isWarning
          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          : 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800'
      }`}
      onClick={() => navigate('/dashboard/billing')}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${isTrialExpired ? 'text-red-500' : 'text-red-500'}`} />
        ) : (
          <Clock className={`h-4 w-4 flex-shrink-0 ${isWarning ? 'text-yellow-600' : 'text-teal-600'}`} />
        )}
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${
            isUrgent ? 'text-red-700 dark:text-red-400' :
            isWarning ? 'text-yellow-700 dark:text-yellow-400' :
            'text-teal-700 dark:text-teal-400'
          }`}>
            {isTrialExpired ? 'Sinov tugadi!' : daysLeft === 0 ? 'Bugun tugaydi!' : `${daysLeft} kun qoldi`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isTrialExpired ? 'Obuna xarid qiling' : '10 kunlik sinov davri'}
          </p>
        </div>
      </div>
    </div>
  );
}
