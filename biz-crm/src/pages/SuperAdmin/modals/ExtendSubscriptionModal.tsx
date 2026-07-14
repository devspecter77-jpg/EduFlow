import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';
import { superAdminApi, type Plan, type Center } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';

interface ExtendSubscriptionModalProps {
  center: Center;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExtendSubscriptionModal({ center, onClose, onSuccess }: ExtendSubscriptionModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [formData, setFormData] = useState({
    planId: '',
    months: 1,
    price: 0,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await superAdminApi.listPlans();
      setPlans(data.filter(p => p.isActive));
      
      // Set default plan if subscription exists
      if (center.subscriptions?.[0]?.planId) {
        setFormData(prev => ({
          ...prev,
          planId: center.subscriptions![0].planId,
        }));
      }
    } catch {
      showToast('error', 'Planlarni yuklashda xatolik');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planId || formData.months < 1) {
      showToast('error', 'Barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    try {
      await superAdminApi.extendSubscription({
        centerId: center.id,
        planId: formData.planId,
        months: formData.months,
        price: formData.price,
      });
      showToast('success', 'Obuna uzaytirildi');
      onSuccess();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === formData.planId);
  const calculatedPrice = selectedPlan ? selectedPlan.price * formData.months : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-xl font-bold">Obunani uzaytirish</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Center Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">Markaz</label>
            <input
              type="text"
              value={center.name}
              disabled
              className="w-full rounded-lg border bg-accent/50 px-4 py-2.5 text-sm"
            />
          </div>

          {/* Plan Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Plan <span className="text-destructive">*</span>
            </label>
            {loadingPlans ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
              </div>
            ) : (
              <select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={loading}
              >
                <option value="">Tanlang</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.price.toLocaleString('uz-UZ')} so'm/oy
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Plan Info */}
          {selectedPlan && (
            <div className="rounded-lg border bg-accent/50 p-4">
              <h4 className="font-semibold mb-2">{selectedPlan.name}</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• O'quvchilar: {selectedPlan.maxStudents === -1 ? 'Cheksiz' : selectedPlan.maxStudents}</p>
                <p>• O'qituvchilar: {selectedPlan.maxTeachers === -1 ? 'Cheksiz' : selectedPlan.maxTeachers}</p>
                <p>• Guruhlar: {selectedPlan.maxGroups === -1 ? 'Cheksiz' : selectedPlan.maxGroups}</p>
                <p className="font-medium text-teal-600 dark:text-teal-400">
                  Narx: {selectedPlan.price.toLocaleString('uz-UZ')} so'm/oy
                </p>
              </div>
            </div>
          )}

          {/* Months */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Oylar soni <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <input
                type="number"
                min="1"
                max="24"
                value={formData.months}
                onChange={(e) => setFormData({ ...formData, months: Number(e.target.value) })}
                className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground">oy</span>
            </div>
          </div>

          {/* Price Override */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              To'lov summasi (ixtiyoriy)
            </label>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder={`${calculatedPrice.toLocaleString('uz-UZ')} so'm (hisoblangan)`}
                className="flex-1 rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
              <span className="text-sm text-muted-foreground">so'm</span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Bo'sh qoldirsa, avtomatik hisoblanadi: {calculatedPrice.toLocaleString('uz-UZ')} so'm
            </p>
          </div>

          {/* Summary */}
          {selectedPlan && (
            <div className="rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 p-4">
              <p className="text-sm font-medium text-teal-900 dark:text-teal-100 mb-2">
                Jami:
              </p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {(formData.price || calculatedPrice).toLocaleString('uz-UZ')} so'm
              </p>
              <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
                {formData.months} oy uchun
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border px-4 py-2.5 font-medium hover:bg-accent transition-colors"
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
              disabled={loading || !formData.planId}
            >
              {loading ? 'Saqlanmoqda...' : 'Uzaytirish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
