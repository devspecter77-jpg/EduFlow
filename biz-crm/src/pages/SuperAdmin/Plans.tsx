import { useState, useEffect } from 'react';
import { Loader3D } from '@/components/Loader3D';
import { superAdminApi, type Plan, type UpdatePlanData } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';
import { Award, Edit2, Check } from 'lucide-react';

export function SuperAdminPlans() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<UpdatePlanData>({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.listPlans();
      setPlans(data);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      maxStudents: plan.maxStudents,
      maxTeachers: plan.maxTeachers,
      maxGroups: plan.maxGroups,
      features: JSON.parse(plan.features || '[]'),
    });
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    try {
      await superAdminApi.updatePlan(editingPlan.id, formData);
      showToast('success', 'Plan yangilandi');
      setEditingPlan(null);
      loadPlans();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const getPlanColor = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
      case 'STANDARD':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'PREMIUM':
        return 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader3D size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Tariflar</h1>
        <p className="text-muted-foreground">Barcha tariflarni boshqarish</p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className={`p-6 ${getPlanColor(plan.type)}`}>
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8" />
                <button
                  onClick={() => handleEdit(plan)}
                  className="rounded-lg p-2 hover:bg-white/20"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm opacity-80">{plan.type}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-3xl font-bold">
                  {plan.price.toLocaleString('uz-UZ')} so'm
                </p>
                <p className="text-sm text-muted-foreground">/ oyiga</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    Maksimal {plan.maxStudents} ta o'quvchi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Maksimal {plan.maxTeachers} ta o'qituvchi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Maksimal {plan.maxGroups} ta guruh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.trialDays} kunlik trial</span>
                </div>
              </div>

              {plan.features && JSON.parse(plan.features).length > 0 && (
                <div className="pt-4 border-t">
                  <p className="mb-2 font-semibold">Qo'shimcha funksiyalar:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {JSON.parse(plan.features).map((feature: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-teal-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">Tarifni tahrirlash</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Nomi</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Narx (so'm)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">O'quvchilar</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, maxStudents: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">O'qituvchilar</label>
                  <input
                    type="number"
                    value={formData.maxTeachers}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTeachers: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Guruhlar</label>
                  <input
                    type="number"
                    value={formData.maxGroups}
                    onChange={(e) =>
                      setFormData({ ...formData, maxGroups: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t p-6">
              <button
                onClick={() => setEditingPlan(null)}
                className="rounded-lg border px-6 py-2 hover:bg-accent"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-teal-600 px-6 py-2 text-white hover:bg-teal-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
