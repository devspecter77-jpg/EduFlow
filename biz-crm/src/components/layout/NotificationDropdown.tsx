import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, Check, CheckCheck, ExternalLink, Trash2, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi, type Notification } from '@/lib/api/notifications';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

// ─── Icons & labels ────────────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  NEW_STUDENT:        '👤',
  NEW_GROUP:          '👥',
  PAYMENT_RECEIVED:   '💰',
  PAYMENT_OVERDUE:    '⚠️',
  CLASS_TODAY:        '📚',
  ATTENDANCE_MISSING: '📋',
  SYSTEM:             '🔔',
};

function getIcon(n: Notification) {
  if (n.type === 'SYSTEM' && n.title.includes("Tug'ilgan")) return '🎂';
  return ICONS[n.type] ?? '🔔';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Hozirgina';
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  return `${d} kun oldin`;
}

// ─── Component ────────────────────────────────────────────────────────────

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { unreadCount, refresh } = useUnreadNotifications();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Load notifications when opened.
  //
  // Unread items are fetched in their own dedicated request (isRead: false)
  // rather than derived from "latest 10 overall" — otherwise, once a tenant
  // has more than ~10 notifications, older unread ones get pushed out of the
  // window by newer already-read ones and silently never appear in the
  // "Yangi" section at all. Recent read items are fetched separately just
  // for context underneath.
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [unreadRes, recentRes] = await Promise.all([
        notificationsApi.getAll({ isRead: false, page: 1, limit: 20 }),
        notificationsApi.getAll({ page: 1, limit: 10 }),
      ]);

      const unreadIds = new Set(unreadRes.data.map((n) => n.id));
      const recentRead = recentRes.data.filter((n) => !unreadIds.has(n.id));

      setNotifications([...unreadRes.data, ...recentRead]);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refresh();
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refresh();
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      refresh();
    } catch { /* silent */ }
  };

  const goToAll = () => {
    setOpen(false);
    navigate('/dashboard/notifications');
  };

  const unreadList = notifications.filter(n => !n.isRead);

  return (
    <div className="relative" ref={ref}>
      {/* ── Bell Button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative rounded-full p-2 hover:bg-accent transition-colors"
      >
        <Bell className={`h-5 w-5 ${open ? 'text-primary' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Bildirishnomalar</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadList.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Barchasini o'qildi"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Barchasi</span>
                </button>
              )}
              <button
                onClick={goToAll}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Hammasi</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-muted-foreground">Yuklanmoqda...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <BellOff className="h-10 w-10 opacity-30" />
                <p className="text-sm">Bildirishnomalar yo'q</p>
              </div>
            ) : (
              <>
                {/* Unread section */}
                {unreadList.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide bg-blue-50/50 dark:bg-blue-950/20">
                      Yangi ({unreadList.length})
                    </div>
                    {unreadList.map(n => (
                      <NotifItem
                        key={n.id}
                        n={n}
                        onRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}

                {/* Read section */}
                {notifications.filter(n => n.isRead).length > 0 && (
                  <div>
                    {unreadList.length > 0 && (
                      <div className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted/20">
                        O'qilgan
                      </div>
                    )}
                    {notifications.filter(n => n.isRead).map(n => (
                      <NotifItem
                        key={n.id}
                        n={n}
                        onRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2.5">
              <button
                onClick={goToAll}
                className="w-full rounded-lg py-2 text-sm text-center text-primary hover:bg-primary/10 transition-colors font-medium"
              >
                Barcha bildirishnomalarni ko'rish →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Single item ───────────────────────────────────────────────────────────

interface ItemProps {
  n: Notification;
  onRead: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

function NotifItem({ n, onRead, onDelete }: ItemProps) {
  return (
    <div
      className={`group flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors cursor-default ${
        !n.isRead
          ? 'bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50/80 dark:hover:bg-blue-950/20'
          : 'hover:bg-muted/30'
      }`}
    >
      {/* Icon */}
      <div className="text-xl flex-shrink-0 mt-0.5">{getIcon(n)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm leading-tight truncate ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>
            {n.title}
          </p>
          {!n.isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {n.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {timeAgo(n.createdAt)}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {!n.isRead && (
          <button
            onClick={(e) => onRead(n.id, e)}
            className="rounded p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600"
            title="O'qildi"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={(e) => onDelete(n.id, e)}
          className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
          title="O'chirish"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
