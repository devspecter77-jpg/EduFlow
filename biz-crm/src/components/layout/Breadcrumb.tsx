import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  students: "O'quvchilar",
  teachers: "O'qituvchilar",
  groups: 'Guruhlar',
  attendance: 'Davomat',
  payments: "To'lovlar",
  analytics: 'Tahlil',
  reports: 'Hisobotlar',
  notifications: 'Bildirishnomalar',
  billing: 'Billing',
  calendar: 'Kalendar',
  settings: 'Sozlamalar',
  profile: 'Profil',
  'super-admin': 'Super Admin',
  users: 'Foydalanuvchilar',
  centers: 'Markazlar',
  plans: 'Tariflar',
  subscriptions: 'Obunalar',
  'payment-requests': "To'lov so'rovlari",
};

export function Breadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean); // ['dashboard', 'students']

  if (parts.length <= 1) return null;

  const crumbs = parts.map((part, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    const label = ROUTE_LABELS[part] ?? part;
    const isLast = idx === parts.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <div key={crumb.href} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
