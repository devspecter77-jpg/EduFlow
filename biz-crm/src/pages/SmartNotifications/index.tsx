import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Send, History, CheckCircle2,
  XCircle, Clock, RefreshCw, Bot, Users, Loader2,
  Bell, Check, CheckCheck, Trash2, BellRing, Filter, ChevronLeft, ChevronRight,
  MessageSquare, Info,
} from 'lucide-react';
import { smartNotificationsApi, type NotificationLog, type NotificationSettings, type NotificationStats } from '@/lib/api/smart-notifications';
import { notificationsApi, type Notification, type NotificationType } from '@/lib/api/notifications';
import { studentsApi, type Student } from '@/lib/api/students';
import { useToast } from '@/contexts/ToastContext';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useAuth } from '@/contexts/AuthContext';

// ── SMS helpers ────────────────────────────────────────────────────────────────
function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// iOS only reliably prefills the message body when the separator is `&`;
// Android (and everything else) expects the standard `?` query separator.
function buildSmsLink(phone: string, message: string): string {
  const sep = isIOS() ? '&' : '?';
  return `sms:${phone}${sep}body=${encodeURIComponent(message)}`;
}

function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function buildPaymentSmsMessage(student: Student, centerName: string): string {
  const amount = student.remainingAmount || student.paymentAmount || 0;
  const period = student.paymentType === 'YEARLY' ? 'yillik' : 'oylik';
  return (
    `${centerName}\n\n` +
    `Farzandingiz ${student.fullName} ${period} to'lovni amalga oshirishlaringizni so'raymiz. ` +
    `To'lovni o'z vaqtida bajaring!\n\n` +
    `To'lov summasi: ${amount.toLocaleString('uz-UZ')} so'm`
  );
}

type Tab = 'notifications' | 'send' | 'history';

// ── Notification icons & labels ───────────────────────────────────────────────
const NOTIF_ICONS: Record<string, string> = {
  NEW_STUDENT: '👤', NEW_GROUP: '👥', PAYMENT_RECEIVED: '💰',
  PAYMENT_OVERDUE: '⚠️', CLASS_TODAY: '📚', ATTENDANCE_MISSING: '📋', SYSTEM: '🔔',
};
const NOTIF_LABELS: Record<string, string> = {
  NEW_STUDENT: "Yangi o'quvchi", NEW_GROUP: 'Yangi guruh',
  PAYMENT_RECEIVED: "To'lov qilindi", PAYMENT_OVERDUE: "To'lov eslatmasi",
  CLASS_TODAY: 'Bugungi dars', ATTENDANCE_MISSING: 'Davomat', SYSTEM: 'Tizim',
};
function notifIcon(n: Notification) {
  if (n.type === 'SYSTEM' && n.title.includes("Tug'ilgan")) return '🎂';
  return NOTIF_ICONS[n.type] ?? '🔔';
}
function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'Hozirgina';
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const { showToast } = useToast();
  const { refresh: refreshBadge } = useUnreadNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [filterType, setFilterType] = useState<NotificationType | ''>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll({
        page, limit: 20,
        ...(filterRead === 'unread' && { isRead: false }),
        ...(filterRead === 'read'   && { isRead: true }),
        ...(filterType && { type: filterType }),
      });
      const items = (res as any).data?.notifications ?? (res as any).data ?? [];
      const pag   = (res as any).data?.pagination   ?? (res as any).pagination ?? {};
      setNotifications(items);
      setTotalPages(pag.totalPages ?? 1);
      setTotal(pag.total ?? items.length);
    } catch { showToast('error', 'Xatolik yuz berdi'); }
    finally  { setLoading(false); }
  }, [page, filterRead, filterType, showToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterRead, filterType]);

  const markRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshBadge();
    } catch { /* silent */ }
  };
  const markAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      showToast('success', "Barchasi o'qildi");
      refreshBadge();
    } catch { /* silent */ }
  };
  const del = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(p => p.filter(n => n.id !== id));
      setTotal(t => t - 1);
      refreshBadge();
    } catch { /* silent */ }
  };

  const unread = notifications.filter(n => !n.isRead);
  const read   = notifications.filter(n =>  n.isRead);
  const showSplit = filterRead === 'all' && unread.length > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="inline-flex rounded-lg border bg-background overflow-hidden">
          {(['all','unread','read'] as const).map(v => (
            <button key={v} onClick={() => setFilterRead(v)}
              className={`px-3 py-1.5 text-xs sm:text-sm transition-colors ${filterRead === v ? 'bg-teal-600 text-white' : 'hover:bg-accent'}`}>
              {v === 'all' ? 'Barchasi' : v === 'unread' ? "O'qilmagan" : "O'qilgan"}
            </button>
          ))}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value as NotificationType | '')}
          className="rounded-lg border bg-background px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-[170px]">
          <option value="">Barcha turlar</option>
          {(Object.keys(NOTIF_LABELS) as NotificationType[]).map(t => (
            <option key={t} value={t}>{NOTIF_LABELS[t]}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={markAll}
              className="flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs sm:text-sm hover:bg-accent transition-colors">
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Barchasini o'qildi</span>
            </button>
          )}
          <button onClick={load}
            className="rounded-lg border bg-background p-1.5 hover:bg-accent transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-30" />
          <p>Bildirishnomalar yo'q</p>
        </div>
      ) : showSplit ? (
        <div className="space-y-4">
          {/* Unread */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Navbatdagi ({unread.length})
              </span>
            </div>
            <div className="hidden sm:block rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-card overflow-hidden">
              {unread.map(n => <NotifRow key={n.id} n={n} onRead={markRead} onDelete={del} />)}
            </div>
            <div className="grid gap-2 sm:hidden">
              {unread.map(n => <NotifCard key={n.id} n={n} onRead={markRead} onDelete={del} />)}
            </div>
          </div>
          {/* Read */}
          {read.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">O'qilgan ({read.length})</span>
              <div className="hidden sm:block rounded-xl border bg-card overflow-hidden">
                {read.map(n => <NotifRow key={n.id} n={n} onRead={markRead} onDelete={del} />)}
              </div>
              <div className="grid gap-2 sm:hidden">
                {read.map(n => <NotifCard key={n.id} n={n} onRead={markRead} onDelete={del} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="hidden sm:block rounded-xl border bg-card overflow-hidden">
            {notifications.map(n => <NotifRow key={n.id} n={n} onRead={markRead} onDelete={del} />)}
          </div>
          <div className="grid gap-2 sm:hidden">
            {notifications.map(n => <NotifCard key={n.id} n={n} onRead={markRead} onDelete={del} />)}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">{page} / {totalPages} sahifa · {total} ta</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p-1)} disabled={page<=1}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-40">
              <ChevronLeft className="h-3.5 w-3.5" /><span className="hidden sm:inline">Oldingi</span>
            </button>
            <button onClick={() => setPage(p => p+1)} disabled={page>=totalPages}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-40">
              <span className="hidden sm:inline">Keyingi</span><ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotifRow({ n, onRead, onDelete }: { n: Notification; onRead:(id:string)=>void; onDelete:(id:string)=>void }) {
  return (
    <div className={`flex items-start gap-4 border-b px-5 py-4 last:border-0 transition-colors ${!n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/10' : 'hover:bg-muted/20'}`}>
      <div className="text-2xl pt-0.5 flex-shrink-0">{notifIcon(n)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">{n.title}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{NOTIF_LABELS[n.type] ?? n.type}</span>
          {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {!n.isRead && (
          <button onClick={() => onRead(n.id)} className="rounded-md p-1.5 hover:bg-accent transition-colors" title="O'qildi">
            <Check className="h-4 w-4" />
          </button>
        )}
        <button onClick={() => onDelete(n.id)} className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors" title="O'chirish">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NotifCard({ n, onRead, onDelete }: { n: Notification; onRead:(id:string)=>void; onDelete:(id:string)=>void }) {
  return (
    <div className={`rounded-xl border-2 p-4 transition-all ${!n.isRead ? 'border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/10' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{notifIcon(n)}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-sm font-semibold leading-tight">{n.title}</p>
              {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
            </div>
            <span className="inline-block mt-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {NOTIF_LABELS[n.type] ?? n.type}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!n.isRead && (
            <button onClick={() => onRead(n.id)} className="rounded-md p-1.5 bg-white/60 dark:bg-black/20 hover:bg-white transition-colors">
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => onDelete(n.id)} className="rounded-md p-1.5 bg-white/60 dark:bg-black/20 hover:bg-red-100 hover:text-red-600 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
      <p className="mt-2 text-xs text-muted-foreground/60">{timeAgo(n.createdAt)}</p>
    </div>
  );
}

// ── Stats Cards ───────────────────────────────────────────────────────────────
const STATUS_ICONS = {
  SENT:    <CheckCircle2 className="h-4 w-4 text-green-600" />,
  FAILED:  <XCircle     className="h-4 w-4 text-red-600" />,
  PENDING: <Clock       className="h-4 w-4 text-yellow-600" />,
};
const STATUS_LABELS = { SENT: 'Yuborildi', FAILED: 'Xatolik', PENDING: 'Kutilmoqda' };
const STATUS_COLORS: Record<string, string> = {
  SENT:    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  FAILED:  'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
};

// ── Stats Cards ───────────────────────────────────────────────────────────────
function StatsCards({ stats, loading }: { stats: NotificationStats | null; loading: boolean }) {
  const cards = [
    { label: 'Jami yuborilgan', value: stats?.sent ?? 0, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
    { label: 'Xatoliklar', value: stats?.failed ?? 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
    { label: "Telegram ID'li o'quvchilar", value: stats?.studentsWithTelegram ?? 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { label: "Jami so'rovlar", value: stats?.total ?? 0, color: 'text-foreground', bg: 'bg-muted/40' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(c => (
        <div key={c.label} className={`rounded-xl p-4 ${c.bg} border`}>
          <p className={`text-2xl font-bold ${c.color}`}>
            {loading ? '—' : c.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── SMS Student Card ────────────────────────────────────────────────────────────
function StudentSmsCard({ student, centerName }: { student: Student; centerName: string }) {
  const hasPhone = !!student.parentPhone;
  const amount = student.remainingAmount || student.paymentAmount || 0;

  const handleSend = () => {
    if (!student.parentPhone) return;
    window.location.href = buildSmsLink(student.parentPhone, buildPaymentSmsMessage(student, centerName));
  };

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{student.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {student.parentFullName || 'Ota-ona'}{student.parentPhone ? ` · ${student.parentPhone}` : ''}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {student.paymentType === 'YEARLY' ? 'Yillik' : 'Oylik'}
        </span>
      </div>

      <p className="text-base font-bold text-teal-600 dark:text-teal-400">
        {amount.toLocaleString('uz-UZ')} so'm
      </p>

      {student.nextPaymentDate && (
        <p className="text-xs text-muted-foreground">
          To'lov sanasi: {new Date(student.nextPaymentDate).toLocaleDateString('uz-UZ')}
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={!hasPhone}
        title={hasPhone ? undefined : "Ota-onaning telefon raqami kiritilmagan"}
        className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Xabar yuborish
      </button>
    </div>
  );
}

// ── SMS Send Section (rectangular student cards + native SMS composer) ────────
function SmsSendSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentsApi.getAll({ limit: 500, status: 'ACTIVE' });
      setStudents(res.data);
    } catch {
      showToast('error', "O'quvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const visibleStudents = useMemo(
    () => filter === 'today' ? students.filter(s => isDueToday(s.nextPaymentDate)) : students,
    [students, filter]
  );

  const centerName = user?.centerName || 'EduFlow CRM';

  const handleSendAll = () => {
    const targets = visibleStudents.filter(s => s.parentPhone);
    if (targets.length === 0) {
      showToast('error', "Ota-ona raqami kiritilgan o'quvchi topilmadi");
      return;
    }
    targets.forEach((s) => {
      window.open(buildSmsLink(s.parentPhone!, buildPaymentSmsMessage(s, centerName)), '_blank');
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> SMS orqali yuborish
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'today')}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">Hamma o'quvchilar</option>
            <option value="today">Bugun</option>
          </select>
          <button onClick={load} className="rounded-lg border bg-background p-1.5 hover:bg-accent transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {filter === 'today' && !loading && visibleStudents.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold">
              Bugun to'lov muddati bo'lgan {visibleStudents.length} ta o'quvchi
            </p>
            <button
              onClick={handleSendAll}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
            >
              <Send className="h-4 w-4" /> Hammasiga SMS
            </button>
          </div>
          <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Agar telefoningiz <b>Android</b> bo'lsa, hamma SMS'larni bir martada yuborishingiz mumkin. Agar{' '}
            <b>iOS (iPhone)</b> bo'lsa, iOS'ning ma'lum bir cheklovlari tufayli SMS'larni bittalab yuborishingizga
            to'g'ri keladi.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      ) : visibleStudents.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">
            {filter === 'today' ? "Bugun to'lov muddati bo'lgan o'quvchi yo'q" : "O'quvchilar topilmadi"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleStudents.map((s) => (
            <StudentSmsCard key={s.id} student={s} centerName={centerName} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Send Tab ─────────────────────────────────────────────────────────────────
function SendTab() {
  return (
    <div className="space-y-8">
      <SmsSendSection />
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await smartNotificationsApi.getHistory({ page, limit: 20, status: filterStatus || undefined });
      setLogs(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch { showToast('error', 'Xatolik'); }
    finally { setLoading(false); }
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Barcha statuslar</option>
          <option value="SENT">Yuborildi</option>
          <option value="FAILED">Xatolik</option>
          <option value="PENDING">Kutilmoqda</option>
        </select>
        <button onClick={load} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <span className="text-sm text-muted-foreground ml-auto">Jami: {total} ta</span>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Qabul qiluvchi</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sarlavha</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kanal</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Yuklanmoqda...
                </td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Tarix topilmadi</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{log.recipientName}</p>
                      {log.recipientId && <p className="text-xs text-muted-foreground">ID: {log.recipientId}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{log.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-48">{log.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs font-medium">
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[log.status]}`}>
                        {STATUS_ICONS[log.status]}
                        {STATUS_LABELS[log.status]}
                      </div>
                      {log.errorMessage && <p className="text-xs text-red-500 mt-0.5">{log.errorMessage}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleString('uz-UZ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40 transition-colors">← Oldingi</button>
            <span className="text-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40 transition-colors">Keyingi →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function SmartNotifications() {
  const [tab, setTab] = useState<Tab>('notifications');
  const { unreadCount } = useUnreadNotifications();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try { setStats(await smartNotificationsApi.getStats()); }
    catch { /* silent */ }
    finally { setStatsLoading(false); }
  }, []);

  const loadSettings = useCallback(async () => {
    try { setSettings(await smartNotificationsApi.getSettings()); }
    catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadStats();
    loadSettings();
  }, [loadStats, loadSettings]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'notifications', label: 'Xabarlar',   icon: <Bell className="h-4 w-4" /> },
    { id: 'send',          label: 'Yuborish',   icon: <Send className="h-4 w-4" /> },
    { id: 'history',       label: 'Tarix',      icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Bildirishnomalar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Xabarlar, to'lov eslatmalari va tug'ilgan kunlar
          </p>
        </div>
        <div className="flex items-center gap-2">
          {settings?.enabled && settings?.token && (
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 dark:bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400">
              <Bot className="h-3.5 w-3.5" /> Telegram ulangan
            </span>
          )}
          <button onClick={loadStats} className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors">
            <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t.icon}
              {t.label}
              {t.id === 'notifications' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'send'          && <SendTab />}
      {tab === 'history'       && <HistoryTab />}
    </div>
  );
}
