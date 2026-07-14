import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Search, Filter, Calendar, TrendingUp, Clock, X, CalendarPlus } from 'lucide-react';
import { Loader3D } from '@/components/Loader3D';
import { adminBillingApi, type SubscriptionItem } from '@/lib/api/billing';
import { superAdminApi, type Plan } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';

const STATUS_OPTS = [
  { value: '', label: 'Barchasi' },
  { value: 'TRIAL', label: 'Sinov' },
  { value: 'ACTIVE', label: 'Faol' },
  { value: 'EXPIRED', label: 'Tugagan' },
  { value: 'SUSPENDED', label: 'To\'xtatilgan' },
];

const MONTH_OPTS = [1, 2, 3, 6, 12];

function statusBadge(status: string) {
  if (status === 'TRIAL') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (status === 'ACTIVE') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (status === 'EXPIRED') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
}

function statusLabel(s: string) {
  if (s === 'TRIAL') return 'Sinov';
  if (s === 'ACTIVE') return 'Faol';
  if (s === 'EXPIRED') return 'Tugagan';
  if (s === 'SUSPENDED') return "To'xtatilgan";
  return s;
}

// ─── Extend-subscription modal ─────────────────────────────────────────────
function ExtendModal({
  sub, onClose, onConfirm, loading,
}: {
  sub: SubscriptionItem;
  onClose: () => void;
  onConfirm: (months: number) => void;
  loading: boolean;
}) {
  const [months, setMonths] = useState(1);
  const startFrom = new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
  const previewEnd = new Date(startFrom);
  previewEnd.setMonth(previewEnd.getMonth() + months);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Obunani uzaytirish</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {sub.center?.name ?? 'Markaz'} uchun necha oylik obuna qo'shmoqchisiz?
        </p>

        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Muddat</label>
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {MONTH_OPTS.map((m) => (
            <option key={m} value={m}>{m} oy {m === 12 ? '(1 yil)' : ''}</option>
          ))}
        </select>

        <div className="mt-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 p-3 text-sm text-teal-700 dark:text-teal-400">
          Yangi tugash sanasi: <b>{previewEnd.toLocaleDateString('uz-UZ')}</b>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => onConfirm(months)}
            disabled={loading}
            className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Saqlanmoqda...' : 'Tasdiqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminSubscriptions() {
  const { showToast } = useToast();
  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [extendTarget, setExtendTarget] = useState<SubscriptionItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, plansRes] = await Promise.all([
        adminBillingApi.listSubscriptions({ status: statusFilter || undefined, limit: 100 }),
        superAdminApi.listPlans(),
      ]);
      setItems(res.data);
      setTotal(res.pagination.total);
      setPlans(plansRes);
    } catch {
      showToast('error', 'Yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleExtend = async (sub: SubscriptionItem, months: number) => {
    const premiumPlan = plans.find((p) => p.type === 'PREMIUM');
    if (!premiumPlan) return showToast('error', 'Premium tarif topilmadi');

    setActionLoading(sub.id);
    try {
      await superAdminApi.extendSubscription({
        centerId: sub.centerId,
        planId: premiumPlan.id,
        months,
        price: premiumPlan.price * months,
      });
      showToast('success', `Obuna ${months} oyga uzaytirildi!`);
      setExtendTarget(null);
      load();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (centerId: string) => {
    try {
      await superAdminApi.blockCenter(centerId);
      showToast('success', 'Markaz bloklandi');
      load();
    } catch { showToast('error', 'Xatolik'); }
  };

  const handleUnblock = async (centerId: string) => {
    try {
      await superAdminApi.unblockCenter(centerId);
      showToast('success', 'Markaz faollashtirildi');
      load();
    } catch { showToast('error', 'Xatolik'); }
  };

  const filtered = search
    ? items.filter((i) =>
        i.center?.name.toLowerCase().includes(search.toLowerCase()) ||
        i.center?.users?.[0]?.phone.includes(search)
      )
    : items;

  // Stats
  const trialCount = items.filter((i) => i.status === 'TRIAL').length;
  const activeCount = items.filter((i) => i.status === 'ACTIVE').length;
  const expiredCount = items.filter((i) => i.status === 'EXPIRED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Obunalar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Jami: {total} ta obuna</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sinov', count: trialCount, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Faol', count: activeCount, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { label: 'Tugagan', count: expiredCount, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-2xl p-4 text-center ${color}`}>
            <p className="text-2xl font-black">{count}</p>
            <p className="text-sm font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Markaz nomi yoki telefon..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader3D size="md" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <TrendingUp className="w-10 h-10 mb-2 opacity-50" />
          <p className="text-sm">Obunalar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sub) => {
            const admin = sub.center?.users?.[0];
            const endDate = new Date(sub.endDate);
            const isExpired = endDate < new Date();
            const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
            const isTrial = sub.status === 'TRIAL';

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {sub.center?.name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {admin?.fullName ?? '—'} · {admin?.phone ?? ''}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(sub.status)}`}>
                    {statusLabel(sub.status)}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tarif: <span className="font-medium text-gray-700 dark:text-gray-300">{sub.plan?.name ?? '—'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className={isExpired ? 'text-red-500 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
                    {endDate.toLocaleDateString('uz-UZ')}
                  </span>
                </div>

                {/* Days remaining — labeled by whether this is still the trial or a paid period */}
                <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                  isExpired
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : isTrial
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      : 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                }`}>
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {isExpired
                    ? 'Muddati tugagan'
                    : isTrial
                      ? `Sinov muddati: ${daysLeft} kun qoldi`
                      : `Obuna: ${daysLeft} kun qoldi`}
                </div>

                <div className="mt-auto pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setExtendTarget(sub)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-400 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Obunani uzaytirish
                  </button>
                  {sub.center && (
                    <button
                      onClick={() => sub.center?.id
                        ? (sub.status === 'ACTIVE' ? handleBlock(sub.center.id) : handleUnblock(sub.center.id))
                        : null
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                        sub.status === 'ACTIVE'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                    >
                      {sub.status === 'ACTIVE' ? 'Blok' : 'Faollashtirish'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {extendTarget && (
        <ExtendModal
          sub={extendTarget}
          onClose={() => setExtendTarget(null)}
          onConfirm={(months) => handleExtend(extendTarget, months)}
          loading={actionLoading === extendTarget.id}
        />
      )}
    </div>
  );
}
