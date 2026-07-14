import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { X, Home, LogOut, Shield, Users, Award, CreditCard } from "lucide-react";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center space-x-3">
              <img src="/photo_2026-06-12_11-17-02.jpg" alt="Logo"
                className="h-10 w-10 rounded-lg object-cover" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-tight">
                  {user?.centerName || 'EduFlow'}
                </span>
                <span className="text-xs text-muted-foreground">CRM</span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Yopish" className="rounded-lg p-2 hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {/* Super Admin Menu */}
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <div className="mb-2 px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Super Admin
                </div>
                <NavLink
                  to="/super-admin"
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <Shield className="h-5 w-5" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/super-admin/users"
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <Users className="h-5 w-5" />
                  <span>Foydalanuvchilar</span>
                </NavLink>
                <NavLink
                  to="/super-admin/plans"
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )
                  }
                >
                  <Award className="h-5 w-5" />
                  <span>Tariflar</span>
                </NavLink>
                <div className="my-4 border-t"></div>
              </>
            )}

            {/* Regular Menu */}
            {NAV_ITEMS
              .filter(item => !item.roles || !user?.role || item.roles.includes(user.role))
              .map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{navLabel(item.href)}</span>
                </NavLink>
              ))}

            {/* Billing link — ADMIN/MANAGER only (matches desktop Sidebar) */}
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <NavLink
                to="/dashboard/billing"
                onClick={onClose}
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

          {/* Footer */}
          <div className="border-t">
            <div className="p-2">
              <button onClick={() => { navigate('/'); onClose(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <Home className="h-5 w-5" />
                <span>{t.nav.home}</span>
              </button>
              <button onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-5 w-5" />
                <span>{t.nav.logout}</span>
              </button>
            </div>
            <div className="px-4 pb-4 pt-2">
              <div className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} EduFlow CRM
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
