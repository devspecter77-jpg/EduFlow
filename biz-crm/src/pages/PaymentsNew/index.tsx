import { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, X, RefreshCw,
  DollarSign, AlertCircle, CheckCircle2, Clock,
  CreditCard, User, Calendar, TrendingUp,
} from 'lucide-react';
import { paymentsNewApi, type StudentWithPaymentInfo, type PaymentStats } from '@/lib/api/payments-new';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { ProcessPaymentModal } from './ProcessPaymentModal';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Kutilmoqda',
  PARTIAL: 'Qisman to\'langan',
  PAID: 'To\'langan',
  OVERDUE: 'Qarzdor',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_ICONS = {
  PENDING: Clock,
  PARTIAL: TrendingUp,
  PAID: CheckCircle2,
  OVERDUE: AlertCircle,
};

export function PaymentsNew() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<StudentWithPaymentInfo[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const [filters, setFilters] = useState<{
    status?: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    groupId?: string;
    page: number;
    limit: number;
  }>({ page: 1, limit: 20 });

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [selectedStudent, setSelectedStudent] = useState<StudentWithPaymentInfo | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentsNewApi.getStudentsWithPaymentInfo({
        ...filters,
        search: debouncedSearch || undefined,
      });
      setStudents(response.data);
      setPagination(response.pagination);
    } catch (error) {
      showToast('error', 'Ma\'lumotlarni yuklashda xatolik');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, showToast]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await paymentsNewApi.getPaymentStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedStudent(null);
    loadStudents();
    loadStats();
    showToast('success', 'To\'lov muvaffaqiyatli amalga oshirildi');
  };

  const handleStatusFilter = (status: string) => {
    if (filters.status === status) {
      setFilters({ ...filters, status: undefined, page: 1 });
    } else {
      setFilters({ ...filters, status: status as typeof filters.status, page: 1 });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('uz-UZ') + ' so\'m';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">To'lovlar</h1>
          <p className="mt-1 text-muted-foreground">Talabalar to'lov ma'lumotlarini boshqarish</p>
        </div>
        <button
          onClick={() => { loadStudents(); loadStats(); }}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Jami kutilayotgan"
          value={formatCurrency(stats?.totalExpected || 0)}
          icon={DollarSign}
          color="bg-blue-600"
          loading={statsLoading}
        />
        <StatCard
          title="Bugun tushgan to'lov"
          value={formatCurrency(stats?.todayPayments || 0)}
          icon={TrendingUp}
          color="bg-green-600"
          loading={statsLoading}
        />
        <StatCard
          title="Qarzdorlar"
          value={stats?.overdueCount || 0}
          icon={AlertCircle}
          color="bg-red-600"
          loading={statsLoading}
        />
        <StatCard
          title="To'langanlar"
          value={stats?.paidCount || 0}
          icon={CheckCircle2}
          color="bg-emerald-600"
          loading={statsLoading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ism, telefon..."
            className="w-full rounded-lg border bg-background pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setFilters({ ...filters, status: undefined, page: 1 })}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !filters.status
                ? 'bg-teal-600 text-white'
                : 'bg-background border hover:bg-accent'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => handleStatusFilter('OVERDUE')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filters.status === 'OVERDUE'
                ? 'bg-red-600 text-white'
                : 'bg-background border hover:bg-accent'
            }`}
          >
            Qarzdor
          </button>
          <button
            onClick={() => handleStatusFilter('PENDING')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filters.status === 'PENDING'
                ? 'bg-yellow-600 text-white'
                : 'bg-background border hover:bg-accent'
            }`}
          >
            Kutilmoqda
          </button>
          <button
            onClick={() => handleStatusFilter('PARTIAL')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filters.status === 'PARTIAL'
                ? 'bg-blue-600 text-white'
                : 'bg-background border hover:bg-accent'
            }`}
          >
            Qisman
          </button>
          <button
            onClick={() => handleStatusFilter('PAID')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              filters.status === 'PAID'
                ? 'bg-green-600 text-white'
                : 'bg-background border hover:bg-accent'
            }`}
          >
            To'langan
          </button>
        </div>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">Talabalar topilmadi</p>
          <p className="text-sm text-muted-foreground">Filter sozlamalarini o'zgartiring</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentPaymentCard
                key={student.id}
                student={student}
                onPaymentClick={() => {
                  setSelectedStudent(student);
                  setPaymentModalOpen(true);
                }}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Jami: {pagination.total} ta talaba
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Oldingi
                </button>
                <span className="text-sm text-muted-foreground">
                  {filters.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page >= pagination.totalPages}
                  className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keyingi
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      {selectedStudent && (
        <ProcessPaymentModal
          open={paymentModalOpen}
          student={selectedStudent}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedStudent(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 flex items-start justify-between animate-pulse">
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-24 mb-3"></div>
          <div className="h-8 bg-muted rounded w-32"></div>
        </div>
        <div className={`rounded-lg p-3 ${color} opacity-50`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

function StudentPaymentCard({
  student,
  onPaymentClick,
  formatCurrency,
  formatDate,
}: {
  student: StudentWithPaymentInfo;
  onPaymentClick: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null | undefined) => string;
}) {
  const StatusIcon = STATUS_ICONS[student.paymentStatus];
  const groupName = student.groups[0]?.group?.name || 'Guruhsiz';

  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1">{student.fullName}</h3>
          <p className="text-sm text-muted-foreground">{student.phone}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[student.paymentStatus]}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {STATUS_LABELS[student.paymentStatus]}
        </span>
      </div>

      {/* Payment Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Guruh:</span>
          <span className="font-medium">{groupName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Keyingi to'lov:</span>
          <span className="font-medium">{formatDate(student.nextPaymentDate)}</span>
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To'lanishi kerak:</span>
            <span className="font-semibold">{formatCurrency(student.paymentAmount || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To'langan:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(student.paidAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Qarz:</span>
            <span className={`font-bold ${student.remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {formatCurrency(student.remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      {student.paymentStatus !== 'PAID' && (
        <button
          onClick={onPaymentClick}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          To'lov qilish
        </button>
      )}

      {/* Payment History Preview */}
      {student.payments.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">Oxirgi to'lovlar:</p>
          <div className="space-y-1.5">
            {student.payments.slice(0, 3).map((payment) => (
              <div key={payment.id} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                </span>
                <span className="font-medium">{formatCurrency(payment.paidAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
