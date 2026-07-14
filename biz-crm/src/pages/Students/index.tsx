import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Search, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, Filter, X, RefreshCw,
  CheckSquare, Square, Trash, Edit3, ChevronDown, ChevronUp,
  FileUp, FileDown, Cake,
} from 'lucide-react';
import { studentsApi, type Student, type StudentFilters } from '@/lib/api/students';
import { groupsApi } from '@/lib/api/groups';
import { StudentModal } from './StudentModal';
import { StudentViewModal } from './StudentViewModal';
import { StudentCard } from './StudentCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ImportModal } from '@/components/ImportModal';
import { importExportApi } from '@/lib/api/import-export';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Faolsiz',
  GRADUATED: 'Bitirgan',
  EXPELLED: "Chiqarib yuborilgan",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  GRADUATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EXPELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

type SortField = 'fullName' | 'phone' | 'createdAt' | 'status';
type SortOrder = 'asc' | 'desc';

// ─── Birthday countdown helper ─────────────────────────────────────────────
function getDaysUntilBirthday(birthDateStr: string | null): number | null {
  if (!birthDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bday = new Date(birthDateStr);
  let next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());
  return Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function BirthdayCell({ birthDate }: { birthDate: string | null }) {
  if (!birthDate) return <span className="text-muted-foreground/40">—</span>;
  const days = getDaysUntilBirthday(birthDate);
  if (days === null) return <span className="text-muted-foreground/40">—</span>;

  const date = new Date(birthDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });

  const badge =
    days === 0 ? <span className="ml-1 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">Bugun!</span> :
    days <= 3  ? <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{days} kun</span> :
    days <= 7  ? <span className="ml-1 rounded-full bg-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white">{days} kun</span> :
    days <= 30 ? <span className="ml-1 rounded-full bg-violet-400 px-1.5 py-0.5 text-[10px] font-medium text-white">{days} kun</span> :
                 <span className="ml-1 text-xs text-muted-foreground">({days} kun)</span>;

  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      <Cake className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
      <span className="text-muted-foreground">{date}</span>
      {badge}
    </div>
  );
}

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField | null; sortOrder: SortOrder }) {
  if (sortField !== field) return null;
  return sortOrder === 'asc' ?
    <ChevronUp className="h-3 w-3" /> :
    <ChevronDown className="h-3 w-3" />;
}

export function Students() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [groupMap, setGroupMap] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState<StudentFilters>({ page: 1, limit: 10 });

  // Load group names for display
  const loadGroupMap = useCallback(async () => {
    try {
      const res = await groupsApi.getAll({ limit: 200 });
      const map: Record<string, string> = {};
      res.data.forEach(g => { map[g.id] = g.name; });
      setGroupMap(map);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadGroupMap(); }, [loadGroupMap]);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Bulk delete
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Bulk status update
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsApi.getAll(filters);
      let data = res.data;

      // Client-side sorting
      if (sortField) {
        data = [...data].sort((a, b) => {
          let aVal: string | number = a[sortField] as string | number;
          let bVal: string | number = b[sortField] as string | number;

          if (sortField === 'createdAt') {
            aVal = new Date(aVal as string).getTime();
            bVal = new Date(bVal as string).getTime();
          } else if (typeof aVal === 'string' && typeof bVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
          }

          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setStudents(data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch {
      showToast('error', 'Ma\'lumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [filters, sortField, sortOrder, showToast]);

  useEffect(() => { load(); }, [load]);

  // Live search with debounce
  useEffect(() => {
    setFilters((f) => ({ ...f, page: 1, search: debouncedSearch || undefined }));
  }, [debouncedSearch]);

  const handleStatusFilter = (status: string) => {
    setFilters((f) => ({ ...f, page: 1, status: status || undefined }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Multi-select handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(students.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async () => {
    if (!deleteStudent) return;
    setDeleteLoading(true);
    try {
      await studentsApi.delete(deleteStudent.id);
      setDeleteStudent(null);
      showToast('success', 'O\'quvchi muvaffaqiyatli o\'chirildi');
      load();
    } catch {
      showToast('error', 'O\'chirishda xatolik yuz berdi');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => studentsApi.delete(id))
      );
      setBulkDeleteOpen(false);
      setSelectedIds(new Set());
      showToast('success', `${selectedIds.size} ta o'quvchi o'chirildi`);
      load();
    } catch {
      showToast('error', 'O\'chirishda xatolik yuz berdi');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) return;
    setBulkStatusLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          studentsApi.update(id, { status: bulkStatus as Student['status'] })
        )
      );
      setBulkStatusOpen(false);
      setBulkStatus('');
      setSelectedIds(new Set());
      showToast('success', `${selectedIds.size} ta o'quvchi holati o'zgartirildi`);
      load();
    } catch {
      showToast('error', 'Holatni o\'zgartirishda xatolik yuz berdi');
    } finally {
      setBulkStatusLoading(false);
    }
  };

  const hasSelected = selectedIds.size > 0;
  const allSelected = students.length > 0 && selectedIds.size === students.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">O'quvchilar</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Jami: <span className="font-medium text-foreground">{total}</span> ta o'quvchi
            {hasSelected && <span className="ml-2 text-teal-600">({selectedIds.size} ta tanlangan)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasSelected && (
            <div className="relative">
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 sm:px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                <span className="hidden sm:inline">Ommaviy amallar</span>
                <span className="sm:hidden">Amallar</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {bulkActionOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-card shadow-lg z-10">
                  <button
                    onClick={() => {
                      setBulkStatusOpen(true);
                      setBulkActionOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors rounded-t-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                    Holatni o'zgartirish
                  </button>
                  <button
                    onClick={() => {
                      setBulkDeleteOpen(true);
                      setBulkActionOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-b-lg"
                  >
                    <Trash className="h-4 w-4" />
                    O'chirish
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 sm:px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Yangi o'quvchi</span>
            <span className="sm:hidden">Yangi</span>
          </button>
          {/* Import/Export */}
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-2 sm:px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Excel dan import"
          >
            <FileUp className="h-4 w-4 text-green-600" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={() => importExportApi.exportStudents(selectedIds.size > 0 ? Array.from(selectedIds) : undefined)}
            className="inline-flex items-center gap-2 rounded-lg border bg-background px-2 sm:px-3 py-2 text-sm hover:bg-accent transition-colors"
            title="Excel ga export"
          >
            <FileDown className="h-4 w-4 text-blue-600" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
        {/* Live Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ism yoki telefon..."
              className="w-full rounded-lg border bg-background pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Status filter + Refresh */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-0 flex-shrink"
          >
            <option value="">Barchasi</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faolsiz</option>
            <option value="GRADUATED">Bitirgan</option>
            <option value="EXPELLED">Chiqarilgan</option>
          </select>
          <button onClick={load} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors flex-shrink-0" title="Yangilash">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Students Grid/Cards */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
            Yuklanmoqda...
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            O'quvchilar topilmadi
          </div>
        ) : (
          <>
            {/* Desktop: Table, Mobile: Cards */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left">
                      <button onClick={toggleSelectAll} className="flex items-center">
                        {allSelected ? <CheckSquare className="h-4 w-4 text-teal-600" /> : <Square className="h-4 w-4" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('fullName')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Ism
                        <SortIcon field="fullName" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('phone')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Telefon
                        <SortIcon field="phone" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Guruh</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Holat
                        <SortIcon field="status" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Cake className="h-3.5 w-3.5 text-pink-400" />
                        Tug'ilgan kun
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Sana
                        <SortIcon field="createdAt" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => {
                    const rowNum = ((filters.page ?? 1) - 1) * (filters.limit ?? 10) + idx + 1;
                    const isSelected = selectedIds.has(s.id);
                    return (
                      <tr key={s.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(s.id)}>
                            {isSelected ? <CheckSquare className="h-4 w-4 text-teal-600" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{rowNum}</td>
                        <td className="px-4 py-3 font-medium">{s.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {s.groupId ? (groupMap[s.groupId] || s.groupId) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                            {STATUS_LABELS[s.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <BirthdayCell birthDate={s.birthDate} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(s.createdAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewStudent(s)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title="Ko'rish"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditStudent(s)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title="Tahrirlash"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteStudent(s)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                              title="O'chirish"
                            >
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
              {students.map((s) => (
                <StudentCard
                  key={s.id}
                  student={s}
                  groupName={s.groupId ? (groupMap[s.groupId] || undefined) : undefined}
                  isSelected={selectedIds.has(s.id)}
                  onSelect={() => toggleSelect(s.id)}
                  onView={() => setViewStudent(s)}
                  onEdit={() => setEditStudent(s)}
                  onDelete={() => setDeleteStudent(s)}
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
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                disabled={(filters.page ?? 1) <= 1}
                className="rounded-md border p-1.5 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium">
                {filters.page ?? 1} / {totalPages}
              </span>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
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
        <StudentModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { 
            setCreateOpen(false); 
            load(); 
            showToast('success', 'O\'quvchi muvaffaqiyatli qo\'shildi'); 
          }}
        />
      )}
      {editStudent && (
        <StudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSuccess={() => { 
            setEditStudent(null); 
            load(); 
            showToast('success', 'O\'quvchi muvaffaqiyatli yangilandi'); 
          }}
        />
      )}
      {viewStudent && (
        <StudentViewModal
          student={viewStudent}
          groupMap={groupMap}
          onClose={() => setViewStudent(null)}
          onEdit={() => { setEditStudent(viewStudent); setViewStudent(null); }}
        />
      )}
      {deleteStudent && (
        <ConfirmModal
          title="O'quvchini o'chirish"
          message={`"${deleteStudent.fullName}" ni o'chirishni tasdiqlaysizmi? Bu amal bekor qilinmaydi.`}
          confirmText="O'chirish"
          cancelText="Bekor qilish"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteStudent(null)}
        />
      )}
      {bulkDeleteOpen && (
        <ConfirmModal
          title="Ommaviy o'chirish"
          message={`${selectedIds.size} ta o'quvchini o'chirishni tasdiqlaysizmi? Bu amal bekor qilinmaydi.`}
          confirmText="Barchasini o'chirish"
          cancelText="Bekor qilish"
          variant="danger"
          loading={bulkDeleteLoading}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteOpen(false)}
        />
      )}
      {bulkStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setBulkStatusOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-card border shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Holatni o'zgartirish</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedIds.size} ta o'quvchining holatini o'zgartirish
            </p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Holat tanlang</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Faolsiz</option>
              <option value="GRADUATED">Bitirgan</option>
              <option value="EXPELLED">Chiqarib yuborilgan</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkStatusOpen(false)}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || bulkStatusLoading}
                className="flex-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {bulkStatusLoading ? 'Saqlanmoqda...' : 'O\'zgartirish'}
              </button>
            </div>
          </div>
        </div>
      )}
      {importOpen && (
        <ImportModal
          module="students"
          onClose={() => setImportOpen(false)}
          onSuccess={() => { setImportOpen(false); load(); }}
        />
      )}
    </div>
  );
}
