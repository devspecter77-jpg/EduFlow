import { useState, useCallback, useEffect } from 'react';
import { reportsApi, type TeacherReport, type ReportFilters } from '@/lib/api/reports';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { ReportTable } from './ReportTable';
import { ExportButtons } from '@/components/ExportButtons';
import { exportToExcel, exportToPDF, printReport } from '@/utils/export';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol', INACTIVE: 'Faolsiz', ON_LEAVE: "Ta'tilda",
};

export function TeachersReport() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<TeacherReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 20 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getTeachersReport({ ...filters, search: debouncedSearch || undefined });
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
    const headers = ['Ism Familya', 'Telefon', 'Tajriba', "Ta'lim", 'Maosh', 'Guruhlar soni', 'Holati', "Qo'shilgan sana"];
    const rows = data.map(t => [
      t.fullName,
      t.phone,
      `${t.experience} yil`,
      t.education || '—',
      t.salary ? t.salary.toLocaleString('uz-UZ') : '0',
      String(t.groups.length),
      STATUS_LABELS[t.status] || t.status,
      new Date(t.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    exportToExcel({
      filename: 'Oqituvchilar_Hisoboti',
      sheetName: 'Oqituvchilar',
      headers,
      data: rows,
    });
    showToast('success', 'Excel fayl yuklab olindi');
  };

  const handleExportPDF = () => {
    const headers = ['Ism Familya', 'Telefon', 'Tajriba', "Ta'lim", 'Maosh', 'Guruhlar', 'Holati', 'Sana'];
    const rows = data.map(t => [
      t.fullName,
      t.phone,
      `${t.experience} yil`,
      t.education || '—',
      t.salary ? `${t.salary.toLocaleString('uz-UZ')} som` : '—',
      String(t.groups.length),
      STATUS_LABELS[t.status] || t.status,
      new Date(t.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    exportToPDF({
      filename: 'Oqituvchilar_Hisoboti',
      title: "O'qituvchilar hisoboti",
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: "Jami o'qituvchilar", value: `${data.length} ta` },
      ],
    });
    showToast('success', 'PDF fayl yuklab olindi');
  };

  const handlePrint = () => {
    const headers = ['Ism Familya', 'Telefon', 'Tajriba', "Ta'lim", 'Maosh', 'Guruhlar', 'Holati', 'Sana'];
    const rows = data.map(t => [
      t.fullName,
      t.phone,
      `${t.experience} yil`,
      t.education || '—',
      t.salary ? `${t.salary.toLocaleString('uz-UZ')} so'm` : '—',
      String(t.groups.length),
      STATUS_LABELS[t.status] || t.status,
      new Date(t.createdAt).toLocaleDateString('uz-UZ'),
    ]);

    printReport({
      title: "O'qituvchilar hisoboti",
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: "Jami o'qituvchilar", value: `${data.length} ta` },
      ],
    });
  };

  const columns = [
    { key: 'fullName', label: 'Ism Familya', render: (t: TeacherReport) => <span className="font-medium">{t.fullName}</span> },
    { key: 'phone', label: 'Telefon', render: (t: TeacherReport) => <span className="text-muted-foreground">{t.phone}</span> },
    {
      key: 'experience', label: 'Tajriba',
      render: (t: TeacherReport) => <span className="text-muted-foreground">{t.experience} yil</span>,
    },
    {
      key: 'groups', label: 'Guruhlar',
      render: (t: TeacherReport) => (
        <div className="flex flex-wrap gap-1">
          {t.groups.length === 0 ? <span className="text-muted-foreground">—</span> : t.groups.slice(0, 2).map(g => (
            <span key={g.id} className="inline-flex rounded-md bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
              {g.name}
            </span>
          ))}
          {t.groups.length > 2 && <span className="text-xs text-muted-foreground">+{t.groups.length - 2}</span>}
        </div>
      ),
    },
    {
      key: 'salary', label: 'Maosh',
      render: (t: TeacherReport) => (
        <span className="text-muted-foreground">{t.salary ? `${t.salary.toLocaleString('uz-UZ')} so'm` : '—'}</span>
      ),
    },
    {
      key: 'status', label: 'Holati',
      render: (t: TeacherReport) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status]}`}>
          {STATUS_LABELS[t.status] || t.status}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Sana',
      render: (t: TeacherReport) => (
        <span className="text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('uz-UZ')}</span>
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
        title="O'qituvchilar hisoboti"
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Ism yoki telefon..."
        filters={
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(f => ({ ...f, page: 1, status: e.target.value || undefined }))}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faolsiz</option>
            <option value="ON_LEAVE">Ta'tilda</option>
          </select>
        }
        onRefresh={load}
        emptyMessage="O'qituvchilar topilmadi"
      />
    </div>
  );
}
