import { useEffect, useState, useCallback } from 'react';
import {
  CreditCard, Clock, CheckCircle, AlertTriangle,
  Zap, Shield, Users, BookOpen, TrendingUp,
  Send, Copy, Check, Phone,
  ChevronRight, X, ReceiptText,
} from 'lucide-react';
import { billingApi, type MySubscriptionResponse, type PaymentRequest } from '@/lib/api/billing';
import { useToast } from '@/contexts/ToastContext';
import { Loader3D } from '@/components/Loader3D';

// ─── Card numbers to display ──────────────────────────────────────────────
const PAYMENT_CARDS = [
  {
    type: 'Humo',
    number: '9860 0826 3646 1673',
    owner: 'RAJABOVA SHAXNOZA',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    type: 'Visa',
    number: '4195 2500 4054 6168',
    owner: 'SHAHINA BONU FOZILOVA',
    color: 'from-blue-500 to-indigo-600',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function daysProgress(start: string, end: string) {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (now >= e) return 100;
  if (now <= s) return 0;
  return Math.round(((now - s) / (e - s)) * 100);
}

function statusLabel(status: string) {
  if (status === 'TRIAL') return { label: 'Sinov', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-400' };
  if (status === 'ACTIVE') return { label: 'Faol', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-400' };
  return { label: 'Tugagan', color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400', dot: 'bg-red-400' };
}

// ─── Copy button ──────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors" aria-label="Nusxalash">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────
function PaymentModal({ onClose }: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Premium Obuna</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Yopish">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="text-center p-5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl border border-teal-200 dark:border-teal-800">
            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1">30 kunlik Premium</p>
            <p className="text-4xl font-black text-teal-700 dark:text-teal-300">
              200 000 <span className="text-xl font-semibold">so'm</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">To'lovdan so'ng 30 kun muddatga faollashtiriladi</p>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quyidagi kartalardan biriga o'tkazing:</p>
            {PAYMENT_CARDS.map((card) => (
              <div key={card.type} className={`bg-gradient-to-r ${card.color} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm tracking-widest">{card.type}</span>
                  <CreditCard className="h-5 w-5 opacity-90" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-base sm:text-lg tracking-wide sm:tracking-widest break-all">{card.number}</span>
                  <CopyBtn text={card.number} />
                </div>
                <p className="text-xs mt-2 opacity-80">{card.owner}</p>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">📋 Ko'rsatma:</p>
            <ol className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-decimal list-inside">
              <li>Yuqoridagi kartaga 200,000 so'm o'tkazing</li>
              <li>To'lov chekini (screenshot) oling</li>
              <li>Quyidagi tugma orqali adminga yuboring</li>
              <li>Administrator 1-24 soat ichida tasdiqlaydi</li>
            </ol>
          </div>

          {/* Contact admin buttons */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chekni adminga yuboring:</p>
            <a
              href="https://t.me/RootDev07"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Telegram
            </a>
            <a
              href="tel:+998914058481"
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
              +998 91 405 84 81
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Billing Page ────────────────────────────────────────────────────
export function BillingPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<MySubscriptionResponse | null>(null);
  const [history, setHistory] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sub, hist] = await Promise.all([
        billingApi.getMySubscription(),
        billingApi.getMyPaymentRequests(),
      ]);
      setData(sub);
      setHistory(hist);
    } catch {
      showToast('error', 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader3D size="lg" />
      </div>
    );
  }

  const sub = data?.subscription;
  const daysLeft = data?.daysLeft ?? 0;
  const progress = sub ? daysProgress(sub.startDate, sub.endDate) : 100;
  const statusInfo = sub ? statusLabel(sub.status) : statusLabel('EXPIRED');

  const features = sub?.plan?.features
    ? (() => { try { return JSON.parse(sub.plan.features); } catch { return []; } })()
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Obuna</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Obuna holatini boshqarish va to'lov qilish</p>
      </div>

      {/* Expired banner */}
      {data?.isExpired && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Obunangiz tugagan!</h3>
              <p className="text-red-100 text-sm mb-4">
                Ma'lumotlar READ-ONLY rejimida. Yangi student, teacher, group qo'sha olmaysiz.
                To'lov qilib obunani faollashtiring.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Premium faollashtirish
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-teal-100 text-sm">Joriy tarif</p>
                <h2 className="text-2xl font-black">
                  {sub?.status === 'TRIAL' ? 'Sinov davri' : 'Premium'}
                </h2>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          {/* Days left */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-teal-100 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {data?.isExpired ? 'Tugagan' : `${daysLeft} kun qoldi`}
              </span>
              <span className="text-white text-sm font-semibold">
                {sub ? new Date(sub.endDate).toLocaleDateString('uz-UZ') : '—'}
              </span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, 100 - progress)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Plan limits */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Tarif imkoniyatlari</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            {[
              { icon: Users, label: "O'quvchilar", value: sub?.plan?.maxStudents ?? 50 },
              { icon: BookOpen, label: 'Guruhlar', value: sub?.plan?.maxGroups ?? 5 },
              { icon: TrendingUp, label: "O'qituvchilar", value: sub?.plan?.maxTeachers ?? 5 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500 mx-auto mb-1 sm:mb-2" />
                <p className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white">{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {features.length > 0 && (
            <div className="space-y-2">
              {features.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium CTA */}
      {!data?.isExpired && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-teal-400" />
                <span className="text-teal-400 text-sm font-semibold">Premium</span>
              </div>
              <h3 className="text-xl font-black mb-1">Obunani yangilang</h3>
              <p className="text-slate-400 text-sm">30 kun uzluksiz foydalanish uchun</p>
              <p className="text-3xl font-black text-white mt-3 whitespace-nowrap">
                200 000 <span className="text-lg text-slate-300">so'm/oy</span>
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-sm shadow-lg transition-all whitespace-nowrap w-full sm:w-auto"
            >
              <Zap className="w-4 h-4" />
              Premium olish
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b dark:border-gray-800 flex items-center gap-3">
          <ReceiptText className="w-5 h-5 text-teal-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">To'lov tarixi</h3>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
            Hali hech qanday to'lov so'rovi yo'q
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-800">
            {history.map((req) => (
              <div key={req.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {req.amount.toLocaleString('uz-UZ')} so'm
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(req.createdAt).toLocaleDateString('uz-UZ', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </p>
                  {req.rejectionNote && (
                    <p className="text-xs text-red-500 mt-1">❌ {req.rejectionNote}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  req.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  req.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {req.status === 'APPROVED' ? '✅ Tasdiqlandi' :
                   req.status === 'REJECTED' ? '❌ Rad etildi' : '⏳ Kutilmoqda'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
