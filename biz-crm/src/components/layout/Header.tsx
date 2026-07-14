import { User, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NotificationBell } from "@/components/NotificationBell";
import { GlobalSearch } from "@/components/GlobalSearch";

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/students': "O'quvchilar",
  '/dashboard/teachers': "O'qituvchilar",
  '/dashboard/groups': 'Guruhlar',
  '/dashboard/attendance': 'Davomat',
  '/dashboard/payments': "To'lovlar",
  '/dashboard/analytics': 'Tahlil',
  '/dashboard/reports': 'Hisobotlar',
  '/dashboard/calendar': 'Kalendar',
  '/dashboard/settings': 'Sozlamalar',
  '/dashboard/profile': 'Profil',
};

export function Header() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b bg-card">
      <div className="flex h-full items-center justify-between px-6">
        {/* Page Title - dynamic based on route */}
        <div>
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <GlobalSearch />

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user?.fullName || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MANAGER' ? 'Menejer' : 'O\'qituvchi'}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-card shadow-lg">
                <div className="p-3 border-b">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{user?.fullName}</div>
                      <div className="text-xs text-muted-foreground truncate">{user?.phone}</div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/dashboard/profile');
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>Profil</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
