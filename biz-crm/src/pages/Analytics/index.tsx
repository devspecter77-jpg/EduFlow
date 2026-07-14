import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, GraduationCap, UsersRound, Wallet,
  TrendingUp, AlertCircle, RefreshCw, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import {
  reportsApi,
  type OverviewStats,
  type MonthlyRevenue,
  type StudentGrowth,
  type AttendanceStats,
  type PaymentStats,
  type TopGroup,
} from '@/lib/api/reports';

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
const PIE_COLORS = {
  PAID: '#0d9488',
  PARTIAL: '#3b82f6',
  PENDING: '#f59e0b',
  OVERDUE: '#ef4444',
  CANCELLED: '#6b7280',
};

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M so'm`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K so'm`;
  return `${amount} so'm`;
}

function StatCard({
  title, value, icon: Icon, color, subtitle, loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-3" />
        <div className="h-8 bg-muted rounded w-16 mb-2" />
        <div className="h-3 bg-muted rounded w-32" />
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse bg-muted rounded-lg" style={{ height }} />
  );
}

export function Analytics() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [growth, setGrowth] = useState<StudentGrowth[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStats | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [topGroups, setTopGroups] = useState<TopGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, rev, gro, att, pay, top] = await Promise.all([
        reportsApi.getOverview(),
        reportsApi.getMonthlyRevenue(),
        reportsApi.getStudentGrowth(),
        reportsApi.getAttendanceStats(30),
        reportsApi.getPaymentStats(),
        reportsApi.getTopGroups(5),
      ]);
      setOverview(ov);
      setRevenue(rev);
      setGrowth(gro);
      setAttendance(att);
      setPaymentStats(pay);
      setTopGroups(top);
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const paymentPieData = paymentStats
    ? Object.entries(paymentStats.byStatus)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
          name: k === 'PAID' ? "To'langan" : k === 'PENDING' ? 'Kutilmoqda' : k === 'PARTIAL' ? 'Qisman' : k === 'OVERDUE' ? 'Qarzdor' : 'Bekor',
          value: v,
          key: k,
        }))
    : [];

  const attendancePieData = attendance
    ? [
        { name: 'Keldi', value: attendance.PRESENT, color: '#0d9488' },
        { name: 'Kelmadi', value: attendance.ABSENT, color: '#ef4444' },
        { name: 'Kechikdi', value: attendance.LATE, color: '#f59e0b' },
        { name: 'Sababli', value: attendance.EXCUSED, color: '#3b82f6' },
      ].filter(d => d.value > 0)
    : [];

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border bg-card">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg font-medium mb-2">Xatolik yuz berdi</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={loadAll}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Tahlil</h1>
          <p className="mt-1 text-muted-foreground">Real ma'lumotlar asosida statistika</p>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Jami talabalar"
          value={overview?.students.total || 0}
          icon={Users}
          color="bg-teal-600"
          subtitle={`${overview?.students.active || 0} ta faol`}
          loading={loading}
        />
        <StatCard
          title="O'qituvchilar"
          value={overview?.teachers.total || 0}
          icon={GraduationCap}
          color="bg-blue-600"
          subtitle={`${overview?.teachers.active || 0} ta faol`}
          loading={loading}
        />
        <StatCard
          title="Faol guruhlar"
          value={overview?.groups.active || 0}
          icon={UsersRound}
          color="bg-violet-600"
          subtitle={`Jami: ${overview?.groups.total || 0}`}
          loading={loading}
        />
        <StatCard
          title="Oylik tushum"
          value={formatCurrency(overview?.revenue.monthly || 0)}
          icon={Wallet}
          color="bg-orange-600"
          subtitle={`Yillik: ${formatCurrency(overview?.revenue.yearly || 0)}`}
          loading={loading}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Davomat foizi"
          value={`${overview?.attendance.presentRate || 0}%`}
          icon={CheckCircle2}
          color="bg-green-600"
          subtitle={`${overview?.attendance.total || 0} ta yozuv`}
          loading={loading}
        />
        <StatCard
          title="Qarzdorlar"
          value={overview?.payments.overdueStudents || 0}
          icon={AlertCircle}
          color="bg-red-600"
          subtitle="Muddati o'tgan to'lovlar"
          loading={loading}
        />
        <StatCard
          title="Jami tushum"
          value={formatCurrency(overview?.revenue.total || 0)}
          icon={TrendingUp}
          color="bg-emerald-600"
          subtitle="Barcha vaqt uchun"
          loading={loading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold mb-4">Oylik tushum (so'nggi 12 oy)</h2>
        {loading ? <ChartSkeleton /> : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} className="text-muted-foreground" />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Tushum']}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#revenueGrad)" name="Tushum" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Student Growth Chart */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold mb-4">Talabalar o'sishi (so'nggi 12 oy)</h2>
        {loading ? <ChartSkeleton /> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Jami talabalar" radius={[4, 4, 0, 0]} />
              <Bar dataKey="new" fill="#0d9488" name="Yangi talabalar" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Pie */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-semibold mb-4">Davomat holati (so'nggi 30 kun)</h2>
          {loading ? <ChartSkeleton height={250} /> : attendancePieData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Ma'lumot yo'q</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full max-w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendancePieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {attendancePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, 'ta']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {attendancePieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-sm">{d.name}</span>
                    </div>
                    <span className="text-sm font-medium">{d.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Davomat foizi</span>
                    <span className="text-sm font-bold text-green-600">{attendance?.presentRate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Pie */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-base font-semibold mb-4">To'lov holati</h2>
          {loading ? <ChartSkeleton height={250} /> : paymentPieData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <XCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Ma'lumot yo'q</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full max-w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {paymentPieData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.key as keyof typeof PIE_COLORS] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, 'ta']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {paymentPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[d.key as keyof typeof PIE_COLORS] || COLORS[i % COLORS.length] }} />
                      <span className="text-sm">{d.name}</span>
                    </div>
                    <span className="text-sm font-medium">{d.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jami tushum</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(paymentStats?.totalRevenue || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jami qarz</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(paymentStats?.totalDebt || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Groups */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold mb-4">Top 5 guruhlar (talabalar soni bo'yicha)</h2>
        {loading ? <ChartSkeleton height={200} /> : topGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UsersRound className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Guruhlar mavjud emas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topGroups.map((g, i) => {
              const pct = g._count.students > 0 ? Math.min(100, (g._count.students / (topGroups[0]._count.students || 1)) * 100) : 0;
              return (
                <div key={g.id} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{g.name}</span>
                      <span className="text-sm text-muted-foreground">{g._count.students} ta</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{g.subject}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
