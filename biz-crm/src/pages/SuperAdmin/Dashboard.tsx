import { useState, useEffect } from 'react';
import { Loader3D } from '@/components/Loader3D';
import { superAdminApi, type SuperAdminStats } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';
import {
  Building2,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SuperAdminDashboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.getStats();
      setStats(data);
    } catch {
      showToast('error', 'Statistikani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader3D size="lg" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Jami foydalanuvchilar',
      value: stats.totalCenters,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      title: 'Faol foydalanuvchilar',
      value: stats.activeCenters,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Bloklangan',
      value: stats.blockedCenters,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Trial',
      value: stats.subscriptions.trial,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      title: 'Faol obunalar',
      value: stats.subscriptions.active,
      icon: Building2,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-100 dark:bg-teal-900/30',
    },
    {
      title: 'Muddati tugagan',
      value: stats.subscriptions.expired,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      title: 'Oylik daromad',
      value: `${stats.monthlyRevenue.toLocaleString('uz-UZ')} so'm`,
      icon: DollarSign,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      span: 'md:col-span-2',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Barcha foydalanuvchilar va obunalar statistikasi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`rounded-xl border bg-card p-6 shadow-sm ${stat.span || ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`rounded-lg ${stat.bg} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Centers */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Oxirgi ro'yxatdan o'tganlar</h2>
        </div>
        <div className="p-6">
          {stats.recentCenters.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Foydalanuvchilar topilmadi
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentCenters.map((center) => (
                <div
                  key={center.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/super-admin/centers/${center.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                      <Building2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{center.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(center.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {center.subscriptions?.[0] && (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          center.subscriptions[0].status === 'TRIAL'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : center.subscriptions[0].status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {center.subscriptions[0].status}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        center.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {center.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
