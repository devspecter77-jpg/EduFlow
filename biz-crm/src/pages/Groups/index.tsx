import { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, Search, Eye, Pencil, Trash2,
  ChevronLeft, ChevronRight, Filter, X, RefreshCw,
  CheckSquare, Square, Trash, Edit3, ChevronDown, ChevronUp,
  Users,
} from 'lucide-react';
import { groupsApi, type Group, type GroupFilters } from '@/lib/api/groups';
import { GroupModal } from './GroupModal';
import { GroupViewModal } from './GroupViewModal';
import { GroupCard } from './GroupCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Loader3D } from '@/components/Loader3D';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Faolsiz',
  COMPLETED: 'Tugallangan',
  CANCELLED: 'Bekor qilingan',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

type SortField = 'name' | 'subject' | 'teacherName' | 'studentsCount' | 'status';
type SortOrder = 'asc' | 'desc';

function SortIcon({ field, sortField, sortOrder }: { field: SortField; sortField: SortField | null; sortOrder: SortOrder }) {
  if (sortField !== field) return null;
  return sortOrder === 'asc' ?
    <ChevronUp className="h-3 w-3" /> :
    <ChevronDown className="h-3 w-3" />;
}

export function Groups() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GroupFilters>({ page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionOpen, setBulkActionOpen] = useState(false);

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [viewGroup, setViewGroup] = useState<Group | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
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
      const res = await groupsApi.getAll(filters);
      let data = res.data;

      // Client-side sorting
      if (sortField) {
        data = [...data].sort((a, b) => {
          let aVal: string | number;
          let bVal: string | number;

          if (sortField === 'teacherName') {
            aVal = a.teacher.fullName.toLowerCase();
            bVal = b.teacher.fullName.toLowerCase();
          } else if (sortField === 'studentsCount') {
            aVal = a._count.students;
            bVal = b._count.students;
          } else {
            const aRaw = a[sortField as keyof typeof a];
            const bRaw = b[sortField as keyof typeof b];
            aVal = typeof aRaw === 'string' ? aRaw.toLowerCase() : (aRaw as number);
            bVal = typeof bRaw === 'string' ? bRaw.toLowerCase() : (bRaw as number);
          }

          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      setGroups(data);
      setTotal(res.pagination?.total || 0);
      setTotalPages(res.pagination?.totalPages || 1);
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
    setFilters((f) => ({ ...f, page: 1, status: (status as GroupFilters['status']) || undefined }));
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
    if (selectedIds.size === groups.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(groups.map(g => g.id)));
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
    if (!deleteGroup) return;
    setDeleteLoading(true);
    try {
      await groupsApi.delete(deleteGroup.id);
      setDeleteGroup(null);
      showToast('success', 'Guruh muvaffaqiyatli o\'chirildi');
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
        Array.from(selectedIds).map(id => groupsApi.delete(id))
      );
      setBulkDeleteOpen(false);
      setSelectedIds(new Set());
      showToast('success', `${selectedIds.size} ta guruh o'chirildi`);
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
          groupsApi.update(id, { status: bulkStatus as Group['status'] })
        )
      );
      setBulkStatusOpen(false);
      setBulkStatus('');
      setSelectedIds(new Set());
      showToast('success', `${selectedIds.size} ta guruh holati o'zgartirildi`);
      load();
    } catch {
      showToast('error', 'Holatni o\'zgartirishda xatolik yuz berdi');
    } finally {
      setBulkStatusLoading(false);
    }
  };

  const hasSelected = selectedIds.size > 0;
  const allSelected = groups.length > 0 && selectedIds.size === groups.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Guruhlar</h1>
          <p className="mt-1 text-muted-foreground">
            Jami: <span className="font-medium text-foreground">{total}</span> ta guruh
            {hasSelected && <span className="ml-2 text-teal-600">({selectedIds.size} ta tanlangan)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasSelected && (
            <div className="relative">
              <button
                onClick={() => setBulkActionOpen(!bulkActionOpen)}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Ommaviy amallar
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
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Yangi guruh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Live Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Guruh nomi, fan..."
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
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Faolsiz</option>
            <option value="COMPLETED">Tugallangan</option>
            <option value="CANCELLED">Bekor qilingan</option>
          </select>
          <button onClick={load} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors" title="Yangilash">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Groups Grid/Cards */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center">
            <Loader3D size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Guruhlar topilmadi
          </div>
        ) : (
          <>
            {/* Desktop: Table */}
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
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Guruh nomi <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('subject')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Fan <SortIcon field="subject" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('studentsCount')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Talabalar <SortIcon field="studentsCount" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                        Holati <SortIcon field="status" sortField={sortField} sortOrder={sortOrder} />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, idx) => {
                    const rowNum = ((filters.page ?? 1) - 1) * (filters.limit ?? 10) + idx + 1;
                    const isSelected = selectedIds.has(g.id);
                    return (
                      <tr key={g.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(g.id)}>
                            {isSelected ? <CheckSquare className="h-4 w-4 text-teal-600" /> : <Square className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{rowNum}</td>
                        <td className="px-4 py-3 font-medium">{g.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{g.subject}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {g._count.students}/{g.maxStudents}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[g.status]}`}>
                            {STATUS_LABELS[g.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewGroup(g)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Ko'rish">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => setEditGroup(g)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors" title="Tahrirlash">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteGroup(g)} className="rounded-md p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" title="O'chirish">
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
              {groups.map((g) => (
                <GroupCard
                  key={g.id}
                  group={g}
                  isSelected={selectedIds.has(g.id)}
                  onSelect={() => toggleSelect(g.id)}
                  onView={() => setViewGroup(g)}
                  onEdit={() => setEditGroup(g)}
                  onDelete={() => setDeleteGroup(g)}
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
        <GroupModal
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { 
            setCreateOpen(false); 
            load(); 
            showToast('success', 'Guruh muvaffaqiyatli qo\'shildi'); 
          }}
        />
      )}
      {editGroup && (
        <GroupModal
          group={editGroup}
          onClose={() => setEditGroup(null)}
          onSuccess={() => { 
            setEditGroup(null); 
            load(); 
            showToast('success', 'Guruh muvaffaqiyatli yangilandi'); 
          }}
        />
      )}
      {viewGroup && (
        <GroupViewModal
          group={viewGroup}
          onClose={() => setViewGroup(null)}
          onEdit={() => { setEditGroup(viewGroup); setViewGroup(null); }}
        />
      )}
      {deleteGroup && (
        <ConfirmModal
          title="Guruhni o'chirish"
          message={`"${deleteGroup.name}" ni o'chirishni tasdiqlaysizmi? Bu amal bekor qilinmaydi.`}
          confirmText="O'chirish"
          cancelText="Bekor qilish"
          variant="danger"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteGroup(null)}
        />
      )}
      {bulkDeleteOpen && (
        <ConfirmModal
          title="Ommaviy o'chirish"
          message={`${selectedIds.size} ta guruhni o'chirishni tasdiqlaysizmi? Bu amal bekor qilinmaydi.`}
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
              {selectedIds.size} ta guruhning holatini o'zgartirish
            </p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Holat tanlang</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Faolsiz</option>
              <option value="COMPLETED">Tugallangan</option>
              <option value="CANCELLED">Bekor qilingan</option>
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
    </div>
  );
}
