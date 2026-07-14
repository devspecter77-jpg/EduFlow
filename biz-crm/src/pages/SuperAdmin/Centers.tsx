import { useState, useEffect, useCallback } from 'react';
import { Loader3D } from '@/components/Loader3D';
import { superAdminApi, type Center } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Search,
  Building2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SuperAdminCenters() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.listCenters({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setData(res.data);
      setPagination(res.pagination);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, debouncedSearch, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [debouncedSearch, statusFilter]);

  const handleBlock = async (id: string) => {
    if (!confirm('Haqiqatan ham ushbu markazni bloklaysizmi?')) return;
    try {
      await superAdminApi.blockCenter(id);
      showToast('success', 'Markaz bloklandi');
      load();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await superAdminApi.unblockCenter(id);
      showToast('success', 'Markaz faollashtirildi');
      load();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu markazni o'chirasizmi? Bu amal qaytarilmaydi!")) return;
    try {
      await superAdminApi.deleteCenter(id);
      showToast('success', "Markaz o'chirildi");
      load();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Markazlar</h1>
        <p className="text-muted-foreground">Barcha ta'lim markazlarini boshqarish</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Markaz nomi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol</option>
          <option value="BLOCKED">Bloklangan</option>
        </select>
        <button
          onClick={load}
          className="rounded-lg border bg-background px-4 py-2 hover:bg-accent"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader3D size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center text-muted-foreground">
            <Building2 className="mb-4 h-16 w-16 opacity-20" />
            <p>Markazlar topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-accent/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Markaz</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Telefon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Obuna</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Holati</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Yaratilgan</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((center) => (
                  <tr key={center.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                          <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{center.name}</p>
                          <p className="text-sm text-muted-foreground">{center.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {center.phone || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {center.subscriptions?.[0] ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            center.subscriptions[0].status === 'TRIAL'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : center.subscriptions[0].status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {center.subscriptions[0].status}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          center.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {center.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(center.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/super-admin/centers/${center.id}`)}
                          className="rounded-lg p-2 hover:bg-accent"
                          title="Ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {center.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleBlock(center.id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Bloklash"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblock(center.id)}
                            className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Faollashtirish"
                          >
                            <Unlock className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(center.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Jami: {pagination.total} ta
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="rounded-lg border px-4 py-2 hover:bg-accent disabled:opacity-50"
              >
                Oldingi
              </button>
              <span className="flex items-center px-4">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-lg border px-4 py-2 hover:bg-accent disabled:opacity-50"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
