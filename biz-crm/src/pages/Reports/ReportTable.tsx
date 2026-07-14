import type { ReactNode } from 'react';
import { RefreshCw, Search, X, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { Loader3D } from '@/components/Loader3D';

interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReportTableProps<T> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  onRefresh: () => void;
  onExport?: () => void;
  summary?: ReactNode;
  emptyMessage?: string;
}

export function ReportTable<T extends { id: string }>({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  search,
  onSearch,
  searchPlaceholder = 'Qidirish...',
  filters,
  onRefresh,
  onExport,
  summary,
  emptyMessage = "Ma'lumot topilmadi",
}: ReportTableProps<T>) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full sm:w-48 rounded-lg border bg-background pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {search && (
              <button onClick={() => onSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Filters */}
          {filters && (
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              {filters}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {summary}
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Eksport</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-xl border bg-card py-16 flex flex-col items-center">
          <Loader3D size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Hisobot tayyorlanmoqda...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Desktop: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Card Grid */}
          <div className="grid gap-3 p-3 grid-cols-1 xs:grid-cols-2 sm:hidden">
            {data.map((row, idx) => (
              <div key={row.id} className="rounded-xl border bg-background p-3 hover:shadow-sm transition-shadow">
                {/* Row number */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    #{(pagination.page - 1) * pagination.limit + idx + 1}
                  </span>
                </div>
                {/* Columns as key-value pairs */}
                <div className="space-y-1.5">
                  {columns.map((col) => (
                    <div key={col.key} className="flex items-start justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground flex-shrink-0 min-w-[60px]">
                        {col.label}
                      </span>
                      <div className="text-xs font-medium text-right flex-1 min-w-0">
                        {col.render(row)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t px-3 sm:px-4 py-3 gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Jami: <span className="font-medium">{pagination.total}</span> ta
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom count */}
      {!loading && data.length > 0 && pagination.totalPages <= 1 && (
        <p className="text-xs sm:text-sm text-muted-foreground text-right">
          Jami: {pagination.total} ta natija
        </p>
      )}
    </div>
  );
}

export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
