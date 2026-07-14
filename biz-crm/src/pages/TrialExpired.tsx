import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Phone, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TrialExpired() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <Lock className="h-12 w-12 text-red-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Sinov muddati tugadi</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{user?.centerName}</span> uchun 10 kunlik sinov muddati tugadi.
            Davom etish uchun obuna xarid qiling.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-white font-medium hover:bg-teal-700 transition-colors"
          >
            <CreditCard className="h-5 w-5" />
            Obuna xarid qilish
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="tel:+998901234567"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-6 py-3 font-medium hover:bg-accent transition-colors"
          >
            <Phone className="h-5 w-5 text-teal-600" />
            Qo'llab-quvvatlash bilan bog'lanish
          </a>

          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Savollar bo'lsa:{' '}
          <a href="tel:+998901234567" className="text-teal-600 hover:underline">
            +998 90 123 45 67
          </a>
        </p>
      </div>
    </div>
  );
}
