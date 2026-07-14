import { useState, useCallback, useEffect } from 'react';
import { reportsApi, type GroupReport, type ReportFilters } from '@/lib/api/reports';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { ReportTable } from './ReportTable';
import { ExportButtons } from '@/components/ExportButtons';
import { exportToExcel, exportToPDF, printReport } from '@/utils/export';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol', INACTIVE: 'Faolsiz', COMPLETED: 'Tugallangan', CANCELLED: 'Bekor',
};

export function GroupsReport() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<GroupReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 20 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getGroupsReport({ ...filters, search: debouncedSearch || undefined });
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
    const headers = ['Guruh nomi', 'Fan', 'Daraja', "O'qituvchi", 'Talabalar', 'Kurs narxi', 'Holati', "Qo'shilgan sana"];
    const rows = data.map(g => [
      g.name,
      g.subject,
      g.level,
      g.teacher?.fullName || '—',
      `${g._count.students} / ${g.maxStudents}`,
      g.courseFee.toLocaleString('uz-UZ'),
      STATUS_LABELS[g.status] || g.status,
      new Date(g.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    exportToExcel({
      filename: 'Guruhlar_Hisoboti',
      sheetName: 'Guruhlar',
      headers,
      data: rows,
    });
    showToast('success', 'Excel fayl yuklab olindi');
  };

  const handleExportPDF = () => {
    const headers = ['Guruh', 'Fan', 'Daraja', "O'qituvchi", 'Talabalar', 'Kurs narxi', 'Holati', 'Sana'];
    const rows = data.map(g => [
      g.name,
      g.subject,
      g.level,
      g.teacher?.fullName || '—',
      `${g._count.students}/${g.maxStudents}`,
      `${g.courseFee.toLocaleString('uz-UZ')} som`,
      STATUS_LABELS[g.status] || g.status,
      new Date(g.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    exportToPDF({
      filename: 'Guruhlar_Hisoboti',
      title: 'Guruhlar hisoboti',
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: 'Jami guruhlar', value: `${data.length} ta` },
      ],
    });
    showToast('success', 'PDF fayl yuklab olindi');
  };

  const handlePrint = () => {
    const headers = ['Guruh', 'Fan', 'Daraja', "O'qituvchi", 'Talabalar', 'Kurs narxi', 'Holati', 'Sana'];
    const rows = data.map(g => [
      g.name,
      g.subject,
      g.level,
      g.teacher?.fullName || '—',
      `${g._count.students}/${g.maxStudents}`,
      `${g.courseFee.toLocaleString('uz-UZ')} so'm`,
      STATUS_LABELS[g.status] || g.status,
      new Date(g.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    printReport({
      title: 'Guruhlar hisoboti',
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: 'Jami guruhlar', value: `${data.length} ta` },
      ],
    });
  };

  const columns = [
    { key: 'name', label: 'Guruh nomi', render: (g: GroupReport) => <span className="font-medium">{g.name}</span> },
    { key: 'subject', label: 'Fan', render: (g: GroupReport) => <span className="text-muted-foreground">{g.subject}</span> },
    { key: 'level', label: 'Daraja', render: (g: GroupReport) => <span className="text-muted-foreground">{g.level}</span> },
    { key: 'teacher', label: "O'qituvchi", render: (g: GroupReport) => <span className="text-muted-foreground">{g.teacher?.fullName || '—'}</span> },
    {
      key: 'students', label: 'Talabalar',
      render: (g: GroupReport) => (
        <span className="font-medium">{g._count.students} / {g.maxStudents}</span>
      ),
    },
    {
      key: 'courseFee', label: 'Kurs narxi',
      render: (g: GroupReport) => (
        <span className="text-muted-foreground">{g.courseFee > 0 ? `${g.courseFee.toLocaleString('uz-UZ')} so'm` : '—'}</span>
      ),
    },
    {
      key: 'status', label: 'Holati',
      render: (g: GroupReport) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[g.status]}`}>
          {STATUS_LABELS[g.status] || g.status}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Sana',
      render: (g: GroupReport) => (
        <span className="text-muted-foreground">{new Date(g.createdAt).toLocaleDateString('uz-UZ')}</span>
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
        title="Guruhlar hisoboti"
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Guruh nomi yoki fan..."
        filters={
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(f => ({ ...f, page: 1, status: e.target.value || undefined }))}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faolsiz</option>
            <option value="COMPLETED">Tugallangan</option>
            <option value="CANCELLED">Bekor</option>
          </select>
        }
        onRefresh={load}
        emptyMessage="Guruhlar topilmadi"
      />
    </div>
  );
}
