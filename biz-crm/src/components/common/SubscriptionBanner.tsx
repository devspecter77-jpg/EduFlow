import { useEffect, useState } from 'react';
import { AlertTriangle, Zap, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { billingApi, type MySubscriptionResponse } from '@/lib/api/billing';
import { useAuth } from '@/contexts/AuthContext';

export function SubscriptionBanner() {
  const { user } = useAuth();
  const [data, setData] = useState<MySubscriptionResponse | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only for ADMIN/MANAGER roles, not SUPER_ADMIN
    if (!user || user.role === 'SUPER_ADMIN') return;

    billingApi.getMySubscription()
      .then(setData)
      .catch(() => {}); // silent fail
  }, [user]);

  if (!data || dismissed || user?.role === 'SUPER_ADMIN') return null;

  const { isExpired, isTrial, daysLeft } = data;

  // Expired → always show red banner
  if (isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <p className="text-sm font-semibold truncate">
            Obunangiz tugagan. Ma'lumotlar faqat o'qish rejimida. CRUD amallari bloklangan.
          </p>
        </div>
        <Link
          to="/dashboard/billing"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          Premium olish
        </Link>
      </div>
    );
  }

  // Trial — show warning when ≤ 5 days left
  if (isTrial && daysLeft <= 5) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold truncate">
            Sinov muddati tugashiga {daysLeft} kun qoldi! Premium obuna oling.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/dashboard/billing"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-amber-600 rounded-full text-xs font-bold hover:bg-amber-50 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Premium
          </Link>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Yopish"
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
