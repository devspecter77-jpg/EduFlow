import { useState, useEffect, useCallback } from 'react';
import { Loader3D } from '@/components/Loader3D';
import { superAdminApi } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Search,
  Users as UsersIcon,
  Shield,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  Building2,
  Phone,
  Calendar,
  LogIn,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  fullName: string;
  phone: string;
  centerName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  center?: {
    id: string;
    name: string;
    status: string;
  };
}

export function SuperAdminUsers() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminApi.listUsers({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
        search: debouncedSearch || undefined,
      });
      setData(res.data as unknown as User[]);
      setPagination(res.pagination);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, statusFilter, debouncedSearch, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [debouncedSearch, roleFilter, statusFilter]);

  const handleBlock = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Haqiqatan ham ushbu foydalanuvchini ${currentStatus ? 'bloklaysizmi' : 'faollashtirasizmi'}?`)) return;
    try {
      if (currentStatus) {
        await superAdminApi.blockUser(id);
        showToast('success', 'Foydalanuvchi bloklandi');
      } else {
        await superAdminApi.unblockUser(id);
        showToast('success', 'Foydalanuvchi faollashtirildi');
      }
      load();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const handleImpersonate = async (userId: string, centerName: string) => {
    try {
      const { token, user } = await superAdminApi.impersonateUser(userId);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      showToast('success', `${centerName} ga kirdingiz`);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      MANAGER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      TEACHER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return styles[role] || 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      MANAGER: 'Menejer',
      TEACHER: "O'qituvchi",
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-muted-foreground">Barcha ro'yxatdan o'tgan foydalanuvchilar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ism, telefon yoki markaz nomi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Barcha rollar</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Menejer</option>
          <option value="TEACHER">O'qituvchi</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
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
            <UsersIcon className="mb-4 h-16 w-16 opacity-20" />
            <p>Foydalanuvchilar topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-accent/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Foydalanuvchi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Markaz</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Telefon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Holati</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Oxirgi kirish</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                          {user.role === 'SUPER_ADMIN' ? (
                            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <UsersIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.centerName ? (
                              <>
                                <Building2 className="inline h-3 w-3 mr-1" />
                                {user.centerName}
                              </>
                            ) : (
                              <>
                                <Calendar className="inline h-3 w-3 mr-1" />
                                {new Date(user.createdAt).toLocaleDateString('uz-UZ')}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.center ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{user.centerName}</p>
                            <span
                              className={`inline-flex text-xs rounded-full px-2 py-0.5 ${
                                user.center.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}
                            >
                              {user.center.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {user.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString('uz-UZ', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Hech qachon'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {user.center && (
                          <button
                            onClick={() => navigate(`/super-admin/centers/${user.center!.id}`)}
                            className="rounded-lg p-2 hover:bg-accent"
                            title="Markazni ko'rish"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {user.role !== 'SUPER_ADMIN' && (
                          <>
                            {user.isActive ? (
                              <button
                                onClick={() => handleBlock(user.id, true)}
                                className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Bloklash"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlock(user.id, false)}
                                className="rounded-lg p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                title="Faollashtirish"
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            )}
                            {user.role === 'ADMIN' && user.isActive && (
                              <button
                                onClick={() => handleImpersonate(user.id, user.centerName)}
                                className="rounded-lg bg-violet-100 dark:bg-violet-900/30 px-3 py-2 text-xs font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50"
                                title="Kirish"
                              >
                                <LogIn className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
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
