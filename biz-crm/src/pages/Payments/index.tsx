import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, X, RefreshCw, ChevronLeft, ChevronRight,
  DollarSign, AlertCircle, CheckCircle2, Clock, PlusCircle,
  Pencil, Trash2,
} from 'lucide-react';
import { paymentsApi, type Payment, type PaymentFilters, type PaymentStatus, type PaymentMethod } from '@/lib/api/payments';
import { useToast } from '@/contexts/ToastContext';
import { PaymentModal } from './PaymentModal';
import { PaymentCard } from './PaymentCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Loader3D } from '@/components/Loader3D';

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Kutilmoqda',
  PAID: 'To\'landi',
  PARTIAL: 'Qisman',
  OVERDUE: 'Muddati o\'tgan',
  CANCELLED: 'Bekor qilingan',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  OVERDUE: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  TRANSFER: 'O\'tkazma',
  OTHER: 'Boshqa',
};

export function Payments() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({ page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [deletePayment, setDeletePayment] = useState<Payment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Summary stats
  const [summary, setSummary] = useState({ totalAmount: 0, paidAmount: 0, pending: 0, overdue: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.getAll(filters);
      setPayments(res.data);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);

      const s = { totalAmount: 0, paidAmount: 0, pending: 0, overdue: 0 };
      res.data.forEach(p => {
        s.totalAmount += p.amount;
        s.paidAmount += p.paidAmount;
        if (p.status === 'PENDING') s.pending++;
        if (p.status === 'OVERDUE') s.overdue++;
      });
      setSummary(s);
    } catch {
      showToast('error', 'To\'lovlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deletePayment) return;
    setDeleteLoading(true);
    try {
      await paymentsApi.delete(deletePayment.id);
      setDeletePayment(null);
      showToast('success', 'To\'lov o\'chirildi');
      load();
    } catch {
      showToast('error', 'O\'chirishda xatolik');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('uz-UZ').format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('uz-UZ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">To'lovlar</h1>
          <p className="mt-1 text-muted-foreground">
            Jami: <span className="font-medium text-foreground">{total}</span> ta to'lov
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Yangi to'lov
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Jami summa', value: formatCurrency(summary.totalAmount) + ' so\'m', icon: DollarSign, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20' },
          { label: 'To\'langan', value: formatCurrency(summary.paidAmount) + ' so\'m', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Kutilmoqda', value: summary.pending.toString(), icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Muddati o\'tgan', value: summary.overdue.toString(), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className={`text-sm font-bold ${color} break-all`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Talaba nomi..."
            className="w-full rounded-lg border bg-background pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filters.status || ''}
            onChange={e => setFilters(f => ({ ...f, page: 1, status: e.target.value as PaymentStatus || undefined }))}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="PAID">To'landi</option>
            <option value="PARTIAL">Qisman</option>
            <option value="OVERDUE">Muddati o'tgan</option>
            <option value="CANCELLED">Bekor qilingan</option>
          </select>
          <select
            value={filters.method || ''}
            onChange={e => setFilters(f => ({ ...f, page: 1, method: (e.target.value as PaymentMethod) || undefined }))}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Barcha usullar</option>
            <option value="CASH">Naqd</option>
            <option value="CARD">Karta</option>
            <option value="TRANSFER">O'tkazma</option>
          </select>
          {(filters.status || filters.method) && (
            <button onClick={() => setFilters({ page: 1, limit: 10 })} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={load} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Payments Grid/Cards */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center">
            <Loader3D size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="h-10 w-10 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-muted-foreground">To'lovlar topilmadi</p>
          </div>
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Talaba</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Guruh</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Summa</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">To'landi</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Muddati</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usul</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Holati</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => {
                    const rowNum = ((filters.page ?? 1) - 1) * (filters.limit ?? 10) + idx + 1;
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{rowNum}</td>
                        <td className="px-4 py-3 font-medium">{p.student.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.group.name}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{formatCurrency(p.paidAmount)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(p.dueDate)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{METHOD_LABELS[p.method]}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditPayment(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Tahrirlash">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeletePayment(p)} className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" title="O'chirish">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card Grid */}
            <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
              {payments.map((p) => (
                <PaymentCard
                  key={p.id}
                  payment={{ ...p, studentName: p.student.fullName, groupName: p.group.name }}
                  onView={() => setEditPayment(p)}
                  onEdit={() => setEditPayment(p)}
                  onDelete={() => setDeletePayment(p)}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t px-3 sm:px-4 py-3 gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1}–
              {Math.min((filters.page ?? 1) * (filters.limit ?? 10), total)} / {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={(filters.page ?? 1) <= 1}
                className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">{filters.page ?? 1} / {totalPages}</span>
              <button
                onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
                disabled={(filters.page ?? 1) >= totalPages}
                className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {createOpen && (
        <PaymentModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); load(); showToast('success', 'To\'lov qo\'shildi'); }}
        />
      )}
      {editPayment && (
        <PaymentModal
          payment={editPayment}
          onClose={() => setEditPayment(null)}
          onSuccess={() => { setEditPayment(null); load(); showToast('success', 'To\'lov yangilandi'); }}
        />
      )}
      {deletePayment && (
        <ConfirmModal
          title="To'lovni o'chirish"
          message={`"${deletePayment.student.fullName}" to'lovini o'chirishni tasdiqlaysizmi?`}
          confirmText="O'chirish"
          cancelText="Bekor qilish"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletePayment(null)}
        />
      )}
    </div>
  );
}
