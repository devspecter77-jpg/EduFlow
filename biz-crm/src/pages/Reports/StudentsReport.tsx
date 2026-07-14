import { useState, useCallback, useEffect } from 'react';
import { reportsApi, type StudentReport, type ReportFilters } from '@/lib/api/reports';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { ReportTable } from './ReportTable';
import { ExportButtons } from '@/components/ExportButtons';
import { exportToExcel, exportToPDF, printReport } from '@/utils/export';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol', INACTIVE: 'Faolsiz', GRADUATED: 'Bitirgan', EXPELLED: 'Chiqarilgan',
};
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  GRADUATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EXPELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const PAYMENT_COLORS: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARTIAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const PAYMENT_LABELS: Record<string, string> = {
  PAID: "To'langan", PARTIAL: 'Qisman', PENDING: 'Kutilmoqda', OVERDUE: 'Qarzdor',
};

export function StudentsReport() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 20 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getStudentsReport({ ...filters, search: debouncedSearch || undefined });
      setData(res.data);
      setPagination(res.pagination);
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
    const headers = ['Ism Familya', 'Telefon', 'Holati', "To'lov holati", 'Oylik tolov', "To'langan", 'Qarz', "Qo'shilgan sana"];
    const rows = data.map(s => [
      s.fullName,
      s.phone,
      STATUS_LABELS[s.status] || s.status,
      PAYMENT_LABELS[s.paymentStatus] || s.paymentStatus,
      s.paymentAmount?.toLocaleString('uz-UZ') || '0',
      s.paidAmount.toLocaleString('uz-UZ'),
      s.remainingAmount.toLocaleString('uz-UZ'),
      new Date(s.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    exportToExcel({
      filename: 'Oquvchilar_Hisoboti',
      sheetName: 'Oquvchilar',
      headers,
      data: rows,
    });
    showToast('success', 'Excel fayl yuklab olindi');
  };

  const handleExportPDF = () => {
    const headers = ['Ism Familya', 'Telefon', 'Holati', "To'lov", 'Oylik', "To'langan", 'Qarz', 'Sana'];
    const rows = data.map(s => [
      s.fullName,
      s.phone,
      STATUS_LABELS[s.status] || s.status,
      PAYMENT_LABELS[s.paymentStatus] || s.paymentStatus,
      `${s.paymentAmount?.toLocaleString('uz-UZ') || '0'} som`,
      `${s.paidAmount.toLocaleString('uz-UZ')} som`,
      `${s.remainingAmount.toLocaleString('uz-UZ')} som`,
      new Date(s.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    const totalDebt = data.reduce((sum, s) => sum + s.remainingAmount, 0);
    const totalPaid = data.reduce((sum, s) => sum + s.paidAmount, 0);

    exportToPDF({
      filename: 'Oquvchilar_Hisoboti',
      title: "O'quvchilar hisoboti",
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: "Jami o'quvchilar", value: `${data.length} ta` },
        { label: "Jami to'langan", value: `${totalPaid.toLocaleString('uz-UZ')} so'm` },
        { label: 'Jami qarz', value: `${totalDebt.toLocaleString('uz-UZ')} so'm` },
      ],
    });
    showToast('success', 'PDF fayl yuklab olindi');
  };

  const handlePrint = () => {
    const headers = ['Ism Familya', 'Telefon', 'Holati', "To'lov holati", 'Oylik tolov', "To'langan", 'Qarz', 'Sana'];
    const rows = data.map(s => [
      s.fullName,
      s.phone,
      STATUS_LABELS[s.status] || s.status,
      PAYMENT_LABELS[s.paymentStatus] || s.paymentStatus,
      `${s.paymentAmount?.toLocaleString('uz-UZ') || '0'} so'm`,
      `${s.paidAmount.toLocaleString('uz-UZ')} so'm`,
      `${s.remainingAmount.toLocaleString('uz-UZ')} so'm`,
      new Date(s.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    const totalDebt = data.reduce((sum, s) => sum + s.remainingAmount, 0);
    const totalPaid = data.reduce((sum, s) => sum + s.paidAmount, 0);

    printReport({
      title: "O'quvchilar hisoboti",
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: "Jami o'quvchilar", value: `${data.length} ta` },
        { label: "Jami to'langan", value: `${totalPaid.toLocaleString('uz-UZ')} so'm` },
        { label: 'Jami qarz', value: `${totalDebt.toLocaleString('uz-UZ')} so'm` },
      ],
    });
  };

  const columns = [
    {
      key: 'fullName', label: 'Ism Familya',
      render: (s: StudentReport) => <span className="font-medium">{s.fullName}</span>,
    },
    { key: 'phone', label: 'Telefon', render: (s: StudentReport) => <span className="text-muted-foreground">{s.phone}</span> },
    {
      key: 'status', label: 'Holati',
      render: (s: StudentReport) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status]}`}>
          {STATUS_LABELS[s.status] || s.status}
        </span>
      ),
    },
    {
      key: 'paymentStatus', label: 'To\'lov',
      render: (s: StudentReport) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_COLORS[s.paymentStatus]}`}>
          {PAYMENT_LABELS[s.paymentStatus] || s.paymentStatus}
        </span>
      ),
    },
    {
      key: 'paidAmount', label: 'To\'langan',
      render: (s: StudentReport) => (
        <span className="text-green-600 dark:text-green-400">{s.paidAmount.toLocaleString('uz-UZ')} so'm</span>
      ),
    },
    {
      key: 'remainingAmount', label: 'Qarz',
      render: (s: StudentReport) => (
        <span className={s.remainingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600'}>
          {s.remainingAmount.toLocaleString('uz-UZ')} so'm
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Sana',
      render: (s: StudentReport) => (
        <span className="text-muted-foreground">{new Date(s.createdAt).toLocaleDateString('uz-UZ')}</span>
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
        title="O'quvchilar hisoboti"
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Ism yoki telefon..."
        filters={
          <>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(f => ({ ...f, page: 1, status: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Barcha holatlar</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Faolsiz</option>
              <option value="GRADUATED">Bitirgan</option>
              <option value="EXPELLED">Chiqarilgan</option>
            </select>
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => setFilters(f => ({ ...f, page: 1, paymentStatus: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Barcha to'lovlar</option>
              <option value="PAID">To'langan</option>
              <option value="PARTIAL">Qisman</option>
              <option value="PENDING">Kutilmoqda</option>
              <option value="OVERDUE">Qarzdor</option>
            </select>
            <input type="date" value={filters.dateFrom || ''} onChange={(e) => setFilters(f => ({ ...f, page: 1, dateFrom: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input type="date" value={filters.dateTo || ''} onChange={(e) => setFilters(f => ({ ...f, page: 1, dateTo: e.target.value || undefined }))}
              className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </>
        }
        onRefresh={load}
        emptyMessage="O'quvchilar topilmadi"
      />
    </div>
  );
}
