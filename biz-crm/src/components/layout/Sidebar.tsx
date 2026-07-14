import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Home, LogOut, Shield, Users, Award, CreditCard, Building2 } from 'lucide-react';
import { TrialBadgeSidebar } from '@/components/TrialBadge';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadNotifications();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Map nav href → translation key
  const navLabel = (href: string): string => {
    if (href === '/dashboard')               return t.nav.dashboard;
    if (href === '/dashboard/students')      return t.nav.students;
    if (href === '/dashboard/teachers')      return t.nav.teachers;
    if (href === '/dashboard/groups')        return t.nav.groups;
    if (href === '/dashboard/attendance')    return t.nav.attendance;
    if (href === '/dashboard/payments')      return t.nav.payments;
    if (href === '/dashboard/analytics')     return t.nav.analytics;
    if (href === '/dashboard/reports')       return t.nav.reports;
    if (href === '/dashboard/calendar')      return 'Kalendar';
    if (href === '/dashboard/notifications') return 'Bildirishnomalar';
    if (href === '/dashboard/settings')      return t.nav.settings;
    return href;
  };

  // Filter nav items by user role (RBAC)
  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || !user?.role || item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        {/* Logo & Center Name */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center space-x-3">
            <img
              src="/photo_2026-06-12_11-17-02.jpg"
              alt="Logo"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight">
                {user?.centerName || 'EduFlow'}
              </span>
              <span className="text-xs text-muted-foreground">CRM</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Super Admin Menu */}
          {user?.role === 'SUPER_ADMIN' && (
            <>
              <div className="mb-2 px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Super Admin
              </div>
              {[
                { to: '/super-admin', end: true, icon: Shield, label: 'Dashboard' },
                { to: '/super-admin/users', icon: Users, label: 'Foydalanuvchilar' },
                { to: '/super-admin/centers', icon: Building2, label: 'Markazlar' },
                { to: '/super-admin/plans', icon: Award, label: 'Tariflar' },
                { to: '/super-admin/subscriptions', icon: CreditCard, label: 'Obunalar' },
              ].map(({ to, end, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </NavLink>
              ))}
              <div className="my-4 border-t"></div>
            </>
          )}

          {/* Regular Admin/Manager/Teacher Menu */}
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{navLabel(item.href)}</span>
              {/* Unread badge for notifications */}
              {item.href === '/dashboard/notifications' && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Billing link — ADMIN only */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <NavLink
              to="/dashboard/billing"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-1",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <CreditCard className="h-5 w-5" />
              <span>Billing</span>
            </NavLink>
          )}
        </nav>

        {/* Trial Badge - ADMIN/MANAGER uchun */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <TrialBadgeSidebar />
        )}

        {/* User info + Footer */}
        <div className="border-t">
          <div className="p-4 space-y-1">
            <button
              onClick={() => navigate('/')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>{t.nav.home}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>{t.nav.logout}</span>
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} EduFlow CRM
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
