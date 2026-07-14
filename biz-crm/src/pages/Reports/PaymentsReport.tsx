import { useState, useCallback, useEffect } from 'react';
import { reportsApi, type PaymentReport, type ReportFilters } from '@/lib/api/reports';
import { groupsApi, type Group } from '@/lib/api/groups';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { ReportTable } from './ReportTable';
import { ExportButtons } from '@/components/ExportButtons';
import { exportToExcel, exportToPDF, printReport } from '@/utils/export';

const STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const STATUS_LABELS: Record<string, string> = {
  PAID: "To'langan", PARTIAL: 'Qisman', PENDING: 'Kutilmoqda', OVERDUE: 'Muddati o\'tgan', CANCELLED: 'Bekor',
};
const METHOD_LABELS: Record<string, string> = {
  CASH: 'Naqd', CARD: 'Karta', TRANSFER: "O'tkazma", OTHER: 'Boshqa',
};

export function PaymentsReport() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({ totalAmount: 0, totalPaid: 0 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 20 });
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    groupsApi.getAll({ limit: 200 }).then(r => setGroups(r.data)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getPaymentsReport({ ...filters, search: debouncedSearch || undefined });
      setData(res.data);
      setPagination(res.pagination);
      setSummary(res.summary);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, showToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setFilters(f => ({ ...f, page: 1 })); }, [debouncedSearch]);

  // Export handlers
  const handleExportExcel = () => {
    const headers = ['Talaba', 'Guruh', 'Summa', "To'langan", 'Holati', 'Usul', 'Sana'];
    const rows = data.map(p => [
      p.student.fullName,
      p.group?.name || '—',
      p.amount.toLocaleString('uz-UZ'),
      p.paidAmount.toLocaleString('uz-UZ'),
      STATUS_LABELS[p.status] || p.status,
      METHOD_LABELS[p.method] || p.method,
      p.paidDate ? new Date(p.paidDate).toLocaleDateString('uz-UZ') : '—',
    ]);

    exportToExcel({
      filename: 'Tolovlar_Hisoboti',
      sheetName: 'Tolovlar',
      headers,
      data: rows,
    });
    showToast('success', 'Excel fayl yuklab olindi');
  };

  const handleExportPDF = () => {
    const headers = ['Talaba', 'Guruh', 'Summa', "To'langan", 'Holati', 'Usul', 'Sana'];
    const rows = data.map(p => [
      p.student.fullName,
      p.group?.name || '—',
      `${p.amount.toLocaleString('uz-UZ')} som`,
      `${p.paidAmount.toLocaleString('uz-UZ')} som`,
      STATUS_LABELS[p.status] || p.status,
      METHOD_LABELS[p.method] || p.method,
      p.paidDate ? new Date(p.paidDate).toLocaleDateString('uz-UZ') : '—',
    ]);

    exportToPDF({
      filename: 'Tolovlar_Hisoboti',
      title: "To'lovlar hisoboti",
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: "Jami to'lovlar", value: `${data.length} ta` },
        { label: "Jami summa", value: `${summary.totalPaid.toLocaleString('uz-UZ')} so'm` },
      ],
    });
    showToast('success', 'PDF fayl yuklab olindi');
  };

  const handlePrint = () => {
    const headers = ['Talaba', 'Guruh', 'Summa', "To'langan", 'Holati', 'Usul', 'Sana'];
    const rows = data.map(p => [
      p.student.fullName,
      p.group?.name || '—',
      `${p.amount.toLocaleString('uz-UZ')} so'm`,
      `${p.paidAmount.toLocaleString('uz-UZ')} so'm`,
      STATUS_LABELS[p.status] || p.status,
      METHOD_LABELS[p.method] || p.method,
      p.paidDate ? new Date(p.paidDate).toLocaleDateString('uz-UZ') : '—',
    ]);

    printReport({
      title: "To'lovlar hisoboti",
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: "Jami to'lovlar", value: `${data.length} ta` },
        { label: "Jami summa", value: `${summary.totalPaid.toLocaleString('uz-UZ')} so'm` },
      ],
    });
  };

  const columns = [
    { key: 'student', label: 'Talaba', render: (p: PaymentReport) => <span className="font-medium">{p.student.fullName}</span> },
    { key: 'group', label: 'Guruh', render: (p: PaymentReport) => <span className="text-muted-foreground">{p.group?.name || '—'}</span> },
    {
      key: 'paidAmount', label: "To'langan",
      render: (p: PaymentReport) => (
        <span className="text-green-600 dark:text-green-400">{p.paidAmount.toLocaleString('uz-UZ')} so'm</span>
      ),
    },
    {
      key: 'status', label: 'Holati',
      render: (p: PaymentReport) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}>
          {STATUS_LABELS[p.status] || p.status}
        </span>
      ),
    },
    { key: 'method', label: 'Usul', render: (p: PaymentReport) => <span className="text-muted-foreground">{METHOD_LABELS[p.method] || p.method}</span> },
    {
      key: 'paidDate', label: 'Sana',
      render: (p: PaymentReport) => (
        <span className="text-muted-foreground">{p.paidDate ? new Date(p.paidDate).toLocaleDateString('uz-UZ') : '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Export Buttons */}
      <div className="flex justify-end">
        <ExportButtons
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
          disabled={loading || data.length === 0}
        />
      </div>

      <ReportTable
        title="To'lovlar hisoboti"
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Talaba ismi..."
        filters={
          <>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(f => ({ ...f, page: 1, status: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Barcha holatlar</option>
              <option value="PAID">To'langan</option>
              <option value="PARTIAL">Qisman</option>
              <option value="PENDING">Kutilmoqda</option>
              <option value="OVERDUE">Muddati o'tgan</option>
            </select>
            <select
              value={filters.method || ''}
              onChange={(e) => setFilters(f => ({ ...f, page: 1, method: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Barcha usullar</option>
              <option value="CASH">Naqd</option>
              <option value="CARD">Karta</option>
              <option value="TRANSFER">O'tkazma</option>
            </select>
            <select
              value={filters.groupId || ''}
              onChange={(e) => setFilters(f => ({ ...f, page: 1, groupId: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Barcha guruhlar</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <input type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters(f => ({ ...f, page: 1, dateFrom: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input type="date" value={filters.dateTo || ''} onChange={(e) => setFilters(f => ({ ...f, page: 1, dateTo: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </>
        }
        onRefresh={load}
        summary={
          !loading ? (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Jami: <span className="font-semibold text-foreground">{summary.totalPaid.toLocaleString('uz-UZ')} so'm</span></span>
            </div>
          ) : undefined
        }
        emptyMessage="To'lovlar topilmadi"
      />
    </div>
  );
}
