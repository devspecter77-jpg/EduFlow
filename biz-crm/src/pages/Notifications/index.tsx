import { useState, useEffect, useCallback } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, RefreshCw, Filter,
  ChevronLeft, ChevronRight, BellRing,
} from 'lucide-react';
import { notificationsApi, type Notification, type NotificationType } from '@/lib/api/notifications';
import { useToast } from '@/contexts/ToastContext';
import { Loader3D } from '@/components/Loader3D';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

// ─── Constants ──────────────────────────────────────────────────────────────

const ICONS: Record<string, string> = {
  NEW_STUDENT:       '👤',
  NEW_GROUP:         '👥',
  PAYMENT_RECEIVED:  '💰',
  PAYMENT_OVERDUE:   '⚠️',
  CLASS_TODAY:       '📚',
  ATTENDANCE_MISSING:'📋',
  SYSTEM:            '🔔',
};

const TYPE_LABELS: Record<string, string> = {
  NEW_STUDENT:       "Yangi o'quvchi",
  NEW_GROUP:         'Yangi guruh',
  PAYMENT_RECEIVED:  "To'lov qilindi",
  PAYMENT_OVERDUE:   "To'lov eslatmasi",
  CLASS_TODAY:       'Bugungi dars',
  ATTENDANCE_MISSING:'Davomat',
  SYSTEM:            'Tizim',
};

const TYPE_COLORS: Record<string, string> = {
  NEW_STUDENT:       'border-teal-200 dark:border-teal-800',
  NEW_GROUP:         'border-violet-200 dark:border-violet-800',
  PAYMENT_RECEIVED:  'border-green-200 dark:border-green-800',
  PAYMENT_OVERDUE:   'border-red-200 dark:border-red-800',
  CLASS_TODAY:       'border-blue-200 dark:border-blue-800',
  ATTENDANCE_MISSING:'border-orange-200 dark:border-orange-800',
  SYSTEM:            'border-gray-200 dark:border-gray-700',
};

function isBirthdayNotification(n: Notification): boolean {
  return n.type === 'SYSTEM' && n.title.includes("Tug'ilgan kun");
}

function getIcon(n: Notification): string {
  if (isBirthdayNotification(n)) return '🎂';
  return ICONS[n.type] ?? '🔔';
}

// ─── Notification Card (shared for both sections) ──────────────────────────
interface CardProps {
  n: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotifRow({ n, onRead, onDelete }: CardProps) {
  const isBday = isBirthdayNotification(n);
  const borderColor = isBday ? 'border-pink-200 dark:border-pink-800' : (TYPE_COLORS[n.type] ?? '');

  return (
    <>
      {/* Desktop row */}
      <div
        className={`hidden sm:flex items-start gap-4 border-b px-5 py-4 last:border-0 transition-colors ${
          !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/10' : 'hover:bg-muted/20'
        } ${isBday ? 'bg-pink-50/40 dark:bg-pink-950/10' : ''}`}
      >
        <div className="text-2xl pt-0.5 flex-shrink-0">{getIcon(n)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-sm">{n.title}</p>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {isBday ? "Tug'ilgan kun" : (TYPE_LABELS[n.type] ?? n.type)}
            </span>
            {!n.isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(n.createdAt).toLocaleString('uz-UZ')}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!n.isRead && (
            <button
              onClick={() => onRead(n.id)}
              className="rounded-md p-1.5 hover:bg-accent transition-colors"
              title="O'qildi deb belgilash"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(n.id)}
            className="rounded-md p-1.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
            title="O'chirish"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div
        className={`sm:hidden rounded-xl border-2 p-4 transition-all ${borderColor} ${
          !n.isRead ? 'bg-blue-50/60 dark:bg-blue-950/10' : 'bg-card'
        } ${isBday ? 'bg-pink-50/60 dark:bg-pink-950/10 border-pink-300 dark:border-pink-700' : ''}`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-shrink-0">{getIcon(n)}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-semibold leading-tight">{n.title}</p>
                {!n.isRead && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </div>
              <span className="inline-block mt-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {isBday ? "Tug'ilgan kun" : (TYPE_LABELS[n.type] ?? n.type)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!n.isRead && (
              <button
                onClick={() => onRead(n.id)}
                className="rounded-md p-1.5 bg-white/60 dark:bg-black/20 hover:bg-white transition-colors"
                title="O'qildi"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(n.id)}
              className="rounded-md p-1.5 bg-white/60 dark:bg-black/20 hover:bg-red-100 hover:text-red-600 transition-colors"
              title="O'chirish"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          {new Date(n.createdAt).toLocaleString('uz-UZ', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function Notifications() {
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
        page,
        limit: 20,
        ...(filterRead === 'unread' && { isRead: false }),
        ...(filterRead === 'read'   && { isRead: true }),
        ...(filterType && { type: filterType }),
      });
      // getAll returns data differently — handle both shapes
      const items = (res as any).data?.notifications ?? (res as any).data ?? [];
      const pagination = (res as any).data?.pagination ?? (res as any).pagination ?? {};
      setNotifications(items);
      setTotalPages(pagination.totalPages ?? 1);
      setTotal(pagination.total ?? items.length);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [page, filterRead, filterType, showToast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterRead, filterType]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshBadge();
    } catch { showToast('error', 'Xatolik'); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('success', "Barcha xabarlar o'qildi");
      refreshBadge();
    } catch { showToast('error', 'Xatolik'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(t => t - 1);
      showToast('success', "Xabar o'chirildi");
      refreshBadge();
    } catch { showToast('error', 'Xatolik'); }
  };

  // Split notifications into unread and read
  const unread = notifications.filter(n => !n.isRead);
  const read   = notifications.filter(n =>  n.isRead);
  const showSplit = filterRead === 'all' && unread.length > 0;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Bildirishnomalar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Jami: {total} ta
            {unread.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                {unread.length} yangi
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Barchasini o'qildi</span>
              <span className="sm:hidden">Barchasi</span>
            </button>
          )}
          <button
            onClick={load}
            className="rounded-lg border bg-background p-2 hover:bg-accent transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="inline-flex rounded-lg border bg-background overflow-hidden">
          {(['all', 'unread', 'read'] as const).map(v => (
            <button
              key={v}
              onClick={() => setFilterRead(v)}
              className={`px-3 py-1.5 text-xs sm:text-sm transition-colors ${
                filterRead === v ? 'bg-teal-600 text-white' : 'hover:bg-accent'
              }`}
            >
              {v === 'all' ? 'Barchasi' : v === 'unread' ? "O'qilmagan" : "O'qilgan"}
            </button>
          ))}
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as NotificationType | '')}
          className="rounded-lg border bg-background px-2 sm:px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 max-w-[180px]"
        >
          <option value="">Barcha turlar</option>
          {(Object.keys(TYPE_LABELS) as NotificationType[]).map(t => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="rounded-xl border bg-card py-16 flex flex-col items-center">
          <Loader3D size="lg" />
          <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border bg-card flex flex-col items-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-30" />
          <p>Bildirishnomalar yo'q</p>
        </div>
      ) : showSplit ? (
        <>
          {/* ── UNREAD section — "Navbatdagi bildirishnomalar" ── */}
          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-blue-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Navbatdagi bildirishnomalar ({unread.length})
              </h2>
            </div>

            {/* Desktop list */}
            <div className="hidden sm:block rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-card overflow-hidden">
              {unread.map(n => (
                <NotifRow key={n.id} n={n} onRead={handleMarkAsRead} onDelete={handleDelete} />
              ))}
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 sm:hidden">
              {unread.map(n => (
                <NotifRow key={n.id} n={n} onRead={handleMarkAsRead} onDelete={handleDelete} />
              ))}
            </div>
          </section>

          {/* ── READ section ── */}
          {read.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                O'qilgan ({read.length})
              </h2>

              {/* Desktop list */}
              <div className="hidden sm:block rounded-xl border bg-card overflow-hidden">
                {read.map(n => (
                  <NotifRow key={n.id} n={n} onRead={handleMarkAsRead} onDelete={handleDelete} />
                ))}
              </div>

              {/* Mobile cards */}
              <div className="grid gap-3 sm:hidden">
                {read.map(n => (
                  <NotifRow key={n.id} n={n} onRead={handleMarkAsRead} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        /* ── Single list (when filtering by read/unread or no unread) ── */
        <>
          {/* Desktop list */}
          <div className="hidden sm:block rounded-xl border bg-card overflow-hidden">
            {notifications.map(n => (
              <NotifRow key={n.id} n={n} onRead={handleMarkAsRead} onDelete={handleDelete} />
            ))}
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {notifications.map(n => (
              <NotifRow key={n.id} n={n} onRead={handleMarkAsRead} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {page} / {totalPages} sahifa
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border px-2 sm:px-3 py-1.5 text-xs sm:text-sm hover:bg-accent disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Oldingi</span>
            </button>
            <span className="text-sm font-medium">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border px-2 sm:px-3 py-1.5 text-xs sm:text-sm hover:bg-accent disabled:opacity-40 transition-colors"
            >
              <span className="hidden sm:inline">Keyingi</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
