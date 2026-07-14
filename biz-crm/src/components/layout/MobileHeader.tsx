import { User, Menu, LogOut, UserCircle, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrialBadge } from "@/components/TrialBadge";
import { NotificationDropdown } from "./NotificationDropdown";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
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
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b bg-card lg:left-64">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">

        {/* Left — menu btn + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 hover:bg-accent lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>

        {/* Right — trial badge + notifications + user */}
        <div className="flex items-center gap-1 lg:gap-2">

          {/* Trial Badge */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <TrialBadge />
          )}

          {/* Notifications dropdown */}
          <NotificationDropdown />

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-medium">{user?.fullName || 'User'}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role === 'ADMIN'
                    ? 'Administrator'
                    : user?.role === 'MANAGER'
                    ? 'Menejer'
                    : "O'qituvchi"}
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform hidden sm:block ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-card shadow-lg z-40">
                {/* Mobile: show user info */}
                <div className="p-3 border-b sm:hidden">
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
