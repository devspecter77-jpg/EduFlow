import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { notificationsApi, type Notification } from '@/lib/api/notifications';
import { useToast } from '@/contexts/ToastContext';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

const NOTIFICATION_ICONS: Record<string, string> = {
  NEW_STUDENT: '👤',
  NEW_GROUP: '👥',
  PAYMENT_RECEIVED: '💰',
  PAYMENT_OVERDUE: '⚠️',
  CLASS_TODAY: '📚',
  ATTENDANCE_MISSING: '📋',
  SYSTEM: '🔔',
};

export function NotificationBell() {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silent — server not ready or user not logged in
    }
  };

  // Load notifications
  const loadNotifications = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await notificationsApi.getAll({
        page: pageNum,
        limit: 10,
      });
      
      if (pageNum === 1) {
        setNotifications(response.data);
      } else {
        setNotifications((prev) => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.page < response.pagination.totalPages);
      setPage(pageNum);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('success', 'Barcha xabarlar o\'qildi');
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('success', 'Xabar o\'chirildi');
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  // Load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Load unread count on mount — no polling to avoid noise if server not ready
  useEffect(() => {
    loadUnreadCount();
  }, []);

  // Load notifications when opened
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-accent transition-colors"
        aria-label="Bildirishnomalar"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 rounded-xl border bg-card shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">Bildirishnomalar</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="rounded-md p-1 hover:bg-accent transition-colors"
                  title="Barchasini o'qilgan deb belgilash"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Bildirishnomalarni yopish"
                className="rounded-md p-1 hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && page === 1 ? (
              <div className="p-8 text-center text-muted-foreground">
                Yuklanmoqda...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Bildirishnomalar yo'q
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b px-4 py-3 hover:bg-accent/50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-2xl">
                        {NOTIFICATION_ICONS[notification.type] || '🔔'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: uz,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="rounded-md p-1 hover:bg-accent transition-colors"
                            title="O'qilgan deb belgilash"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          aria-label="Bildirishnomani o'chirish"
                          className="rounded-md p-1 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="w-full py-3 text-sm text-primary hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Yuklanmoqda...' : 'Ko\'proq yuklash'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
