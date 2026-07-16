import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, GraduationCap, UsersRound,
  Wallet, UserPlus, TrendingUp, ArrowRight,
  RefreshCw, Clock, AlertCircle, CheckCircle, DollarSign, AlertTriangle,
} from 'lucide-react';
import {
  dashboardApi,
  type DashboardStats,
  type RecentStudent,
  type RecentTeacher,
  type RecentGroup,
  type RecentPayment,
} from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { getPageCache, setPageCache } from '@/lib/pageDataCache';

interface DashboardCache {
  stats: DashboardStats;
  recentStudents: RecentStudent[];
  recentTeachers: RecentTeacher[];
  recentGroups: RecentGroup[];
  recentPayments: RecentPayment[];
}
const CACHE_KEY = 'dashboard';

function StatCard({
  title, value, icon: Icon, color, suffix, loading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  suffix?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 flex items-start justify-between animate-pulse">
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-24 mb-3"></div>
          <div className="h-8 bg-muted rounded w-16"></div>
        </div>
        <div className={`rounded-lg p-3 ${color} opacity-50`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">
          {value}{suffix}
        </p>
      </div>
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

function RecentStudentCard({ student }: { student: RecentStudent }) {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    GRADUATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    EXPELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-base font-bold text-teal-600 dark:text-teal-400 flex-shrink-0">
        {student.fullName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{student.fullName}</p>
        <p className="text-xs text-muted-foreground">{student.phone}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[student.status as keyof typeof statusColors]}`}>
          {student.status === 'ACTIVE' ? 'Faol' : student.status}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(student.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  );
}

function RecentTeacherCard({ teacher }: { teacher: RecentTeacher }) {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    INACTIVE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    ON_LEAVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-base font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
        {teacher.fullName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{teacher.fullName}</p>
        <p className="text-xs text-muted-foreground">{teacher.phone}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[teacher.status as keyof typeof statusColors]}`}>
          {teacher.status === 'ACTIVE' ? 'Faol' : teacher.status === 'ON_LEAVE' ? "Ta'tilda" : 'Faolsiz'}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(teacher.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  );
}

function RecentGroupCard({ group }: { group: RecentGroup }) {
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30 text-base font-bold text-violet-600 dark:text-violet-400 flex-shrink-0">
        {group.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{group.name}</p>
        <p className="text-xs text-muted-foreground">{group.subject} • {group.level}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[group.status as keyof typeof statusColors]}`}>
          {group.status === 'ACTIVE' ? 'Faol' : group.status === 'COMPLETED' ? 'Tugagan' : 'Bekor qilingan'}
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          {group.studentCount} ta o'quvchi
        </p>
      </div>
    </div>
  );
}

function RecentPaymentCard({ payment }: { payment: RecentPayment }) {
  const statusColors = {
    PAID: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const methodLabels: Record<string, string> = {
    CASH: 'Naqd',
    CARD: 'Karta',
    TRANSFER: "O'tkazma",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
        <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{payment.studentName}</p>
        <p className="text-xs text-muted-foreground">
          {payment.groupName || 'Guruhsiz'} • {methodLabels[payment.method]}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-foreground">
          {payment.paidAmount.toLocaleString('uz')} so'm
        </p>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[payment.status as keyof typeof statusColors]}`}>
          {payment.status === 'PAID' ? 'To\'langan' : payment.status === 'PENDING' ? 'Kutilmoqda' : 'Muddati o\'tgan'}
        </span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { t } = useApp();
  const cached = getPageCache<DashboardCache>(CACHE_KEY);
  const [stats, setStats] = useState<DashboardStats>(cached?.stats ?? {
    totalStudents: 0,
    totalTeachers: 0,
    activeGroups: 0,
    attendanceToday: 0,
    monthlyRevenue: 0,
    todayPayments: 0,
    overdueCount: 0,
  });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>(cached?.recentStudents ?? []);
  const [recentTeachers, setRecentTeachers] = useState<RecentTeacher[]>(cached?.recentTeachers ?? []);
  const [recentGroups, setRecentGroups] = useState<RecentGroup[]>(cached?.recentGroups ?? []);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>(cached?.recentPayments ?? []);
  // Only block on a spinner the first time this page has no cached data yet —
  // repeat visits show the last-known numbers instantly while refreshing quietly.
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!getPageCache<DashboardCache>(CACHE_KEY)) setLoading(true);
    setError(null);
    try {
      const [statsData, studentsData, teachersData, groupsData, paymentsData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentStudents(),
        dashboardApi.getRecentTeachers(),
        dashboardApi.getRecentGroups(),
        dashboardApi.getRecentPayments(),
      ]);
      setStats(statsData);
      setRecentStudents(studentsData);
      setRecentTeachers(teachersData);
      setRecentGroups(groupsData);
      setRecentPayments(paymentsData);
      setPageCache<DashboardCache>(CACHE_KEY, {
        stats: statsData, recentStudents: studentsData, recentTeachers: teachersData,
        recentGroups: groupsData, recentPayments: paymentsData,
      });
    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const quickActions = [
    { label: t.students.addStudent, href: '/dashboard/students', icon: UserPlus, color: 'bg-teal-600' },
    { label: t.teachers.addTeacher, href: '/dashboard/teachers', icon: GraduationCap, color: 'bg-blue-600' },
    { label: t.groups.addGroup, href: '/dashboard/groups', icon: UsersRound, color: 'bg-violet-600' },
    { label: t.payments.addPayment, href: '/dashboard/payments', icon: DollarSign, color: 'bg-orange-600' },
    { label: t.attendance.title, href: '/dashboard/attendance', icon: CheckCircle, color: 'bg-green-600' },
  ];

  // Error State
  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t.dashboard.title}</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">{t.settings.error}</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            {t.common.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t.dashboard.title}</h1>
          <p className="mt-1 text-muted-foreground">
            Xush kelibsiz, <span className="font-medium text-foreground">{user?.fullName}</span>
          </p>
        </div>
        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
          title={t.settings.audit.refresh}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t.settings.audit.refresh}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.dashboard.totalStudents}
          value={stats.totalStudents}
          icon={Users}
          color="bg-teal-600"
          loading={loading}
        />
        <StatCard
          title={t.dashboard.totalTeachers}
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="bg-blue-600"
          loading={loading}
        />
        <StatCard
          title={t.dashboard.activeGroups}
          value={stats.activeGroups}
          icon={UsersRound}
          color="bg-violet-600"
          loading={loading}
        />
        <StatCard
          title={t.dashboard.monthlyRevenue}
          value={stats.monthlyRevenue.toLocaleString('uz')}
          icon={Wallet}
          color="bg-orange-600"
          suffix={" so'm"}
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Bugungi davomat"
          value={stats.attendanceToday}
          icon={CheckCircle}
          color="bg-green-600"
          loading={loading}
        />
        <StatCard
          title="Bugungi to'lovlar"
          value={stats.todayPayments.toLocaleString('uz')}
          icon={DollarSign}
          color="bg-emerald-600"
          suffix={" so'm"}
          loading={loading}
        />
        <StatCard
          title="Qarzdorlar"
          value={stats.overdueCount}
          icon={AlertTriangle}
          color="bg-red-600"
          loading={loading}
        />
      </div>

      {/* Quick Actions + Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-semibold">Tezkor amallar</h2>
          </div>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md p-2 ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-semibold">Markaz haqida</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Markaz nomi</p>
              <p className="text-sm font-medium">{user?.centerName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mas'ul shaxs</p>
              <p className="text-sm font-medium">{user?.fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Telefon</p>
              <p className="text-sm font-medium">{user?.phone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="text-sm font-medium">
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MANAGER' ? 'Menejer' : 'O\'qituvchi'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Students & Teachers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-semibold">Oxirgi o'quvchilar</h2>
            </div>
            <Link
              to="/dashboard/students"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Barchasi
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full"></div>
                </div>
              ))}
            </div>
          ) : recentStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">O'quvchilar mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentStudents.map((student) => (
                <RecentStudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Teachers */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold">Oxirgi o'qituvchilar</h2>
            </div>
            <Link
              to="/dashboard/teachers"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Barchasi
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full"></div>
                </div>
              ))}
            </div>
          ) : recentTeachers.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">O'qituvchilar mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTeachers.map((teacher) => (
                <RecentTeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Groups & Payments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Groups */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-violet-600" />
              <h2 className="text-base font-semibold">Oxirgi guruhlar</h2>
            </div>
            <Link
              to="/dashboard/groups"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Barchasi
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full"></div>
                </div>
              ))}
            </div>
          ) : recentGroups.length === 0 ? (
            <div className="text-center py-8">
              <UsersRound className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Guruhlar mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentGroups.map((group) => (
                <RecentGroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600" />
              <h2 className="text-base font-semibold">Oxirgi to'lovlar</h2>
            </div>
            <Link
              to="/dashboard/payments"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Barchasi
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full"></div>
                </div>
              ))}
            </div>
          ) : recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">To'lovlar mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentPayments.map((payment) => (
                <RecentPaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-teal-600" />
          <h2 className="text-base font-semibold">Oxirgi faoliyat</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
                <div className="h-8 w-8 rounded-md bg-muted flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-48 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Recent Students */}
            {recentStudents.slice(0, 2).map((student) => (
              <div key={`activity-student-${student.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-100 dark:bg-teal-900/30 flex-shrink-0">
                  <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    <span className="text-foreground">{student.fullName}</span> o'quvchi qo'shildi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(student.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent Groups */}
            {recentGroups.slice(0, 2).map((group) => (
              <div key={`activity-group-${group.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30 flex-shrink-0">
                  <UsersRound className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    <span className="text-foreground">{group.name}</span> guruhi yaratildi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {group.subject} • {group.level} • {new Date(group.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Recent Payments */}
            {recentPayments.slice(0, 2).map((payment) => (
              <div key={`activity-payment-${payment.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    <span className="text-foreground">{payment.studentName}</span> to'lov qildi
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.paidAmount.toLocaleString('uz')} so'm • {new Date(payment.createdAt).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {recentStudents.length === 0 && recentGroups.length === 0 && recentPayments.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Hozircha faoliyat yo'q</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
