import { useState, useCallback, useEffect } from 'react';
import { reportsApi, type AttendanceReport as AttReportType, type ReportFilters } from '@/lib/api/reports';
import { groupsApi, type Group } from '@/lib/api/groups';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/contexts/AuthContext';
import { ReportTable } from './ReportTable';
import { ExportButtons } from '@/components/ExportButtons';
import { exportToExcel, exportToPDF, printReport } from '@/utils/export';

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Keldi', ABSENT: 'Kelmadi', LATE: 'Kechikdi', EXCUSED: 'Sababli',
};
const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ABSENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  EXCUSED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function AttendanceReport() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [data, setData] = useState<AttReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
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
      const res = await reportsApi.getAttendanceReport({ ...filters, search: debouncedSearch || undefined });
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
    const headers = ['Talaba', 'Telefon', 'Guruh', 'Sana', 'Holati', 'Izoh'];
    const rows = data.map(a => [
      a.student.fullName,
      a.student.phone,
      a.group.name,
      new Date(a.date).toLocaleDateString('uz-UZ'),
      STATUS_LABELS[a.status] || a.status,
      a.notes || '—',
    ]);

    exportToExcel({
      filename: 'Davomat_Hisoboti',
      sheetName: 'Davomat',
      headers,
      data: rows,
    });
    showToast('success', 'Excel fayl yuklab olindi');
  };

  const handleExportPDF = () => {
    const headers = ['Talaba', 'Telefon', 'Guruh', 'Sana', 'Holati', 'Izoh'];
    const rows = data.map(a => [
      a.student.fullName,
      a.student.phone,
      a.group.name,
      new Date(a.date).toLocaleDateString('uz-UZ'),
      STATUS_LABELS[a.status] || a.status,
      a.notes || '—',
    ]);

    const presentCount = data.filter(a => a.status === 'PRESENT').length;
    const absentCount = data.filter(a => a.status === 'ABSENT').length;

    exportToPDF({
      filename: 'Davomat_Hisoboti',
      title: 'Davomat hisoboti',
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: 'Jami yozuvlar', value: `${data.length} ta` },
        { label: 'Kelganlar', value: `${presentCount} ta` },
        { label: 'Kelmaganlar', value: `${absentCount} ta` },
      ],
    });
    showToast('success', 'PDF fayl yuklab olindi');
  };

  const handlePrint = () => {
    const headers = ['Talaba', 'Telefon', 'Guruh', 'Sana', 'Holati', 'Izoh'];
    const rows = data.map(a => [
      a.student.fullName,
      a.student.phone,
      a.group.name,
      new Date(a.date).toLocaleDateString('uz-UZ'),
      STATUS_LABELS[a.status] || a.status,
      a.notes || '—',
    ]);

    const presentCount = data.filter(a => a.status === 'PRESENT').length;
    const absentCount = data.filter(a => a.status === 'ABSENT').length;

    printReport({
      title: 'Davomat hisoboti',
      centerName: user?.centerName,
      headers,
      data: rows,
      summary: [
        { label: 'Jami yozuvlar', value: `${data.length} ta` },
        { label: 'Kelganlar', value: `${presentCount} ta` },
        { label: 'Kelmaganlar', value: `${absentCount} ta` },
      ],
    });
  };

  const columns = [
    {
      key: 'student', label: 'Talaba',
      render: (a: AttReportType) => <span className="font-medium">{a.student.fullName}</span>,
    },
    { key: 'group', label: 'Guruh', render: (a: AttReportType) => <span className="text-muted-foreground">{a.group.name}</span> },
    {
      key: 'date', label: 'Sana',
      render: (a: AttReportType) => (
        <span className="text-muted-foreground">{new Date(a.date).toLocaleDateString('uz-UZ')}</span>
      ),
    },
    {
      key: 'status', label: 'Holati',
      render: (a: AttReportType) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status]}`}>
          {STATUS_LABELS[a.status] || a.status}
        </span>
      ),
    },
    {
      key: 'notes', label: 'Izoh',
      render: (a: AttReportType) => <span className="text-muted-foreground text-xs">{a.notes || '—'}</span>,
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
        title="Davomat hisoboti"
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
              <option value="PRESENT">Keldi</option>
              <option value="ABSENT">Kelmadi</option>
              <option value="LATE">Kechikdi</option>
              <option value="EXCUSED">Sababli</option>
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
        emptyMessage="Davomat yozuvlari topilmadi"
      />
    </div>
  );
}
