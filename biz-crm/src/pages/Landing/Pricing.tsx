import { useContext, useEffect, useState } from 'react';
import { Check, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { billingApi, type PublicPlan } from '@/lib/api/billing';

interface DisplayPlan {
  name: string;
  tagline: string;
  icon: typeof Sparkles;
  price: string;
  duration: string;
  badge: string | null;
  highlighted: boolean;
  features: string[];
}

function toDisplayPlan(plan: PublicPlan, isMostExpensive: boolean): DisplayPlan {
  const isFree = plan.price === 0;
  let features: string[] = [];
  try {
    features = JSON.parse(plan.features);
  } catch {
    features = [];
  }
  // Telegram bot is temporarily disabled sitewide — hide it even if still listed in the plan record
  features = features.filter((f) => !f.toLowerCase().includes('telegram'));

  return {
    name: plan.name,
    tagline: isFree
      ? 'Yangi boshlayotgan markazlar uchun'
      : "Faol o'sib borayotgan markazlar uchun",
    icon: isMostExpensive ? Crown : Sparkles,
    price: isFree ? 'Bepul' : plan.price.toLocaleString('uz-UZ'),
    duration: isFree && plan.trialDays > 0 ? `${plan.trialDays} kun` : "so'm/oy",
    badge: isMostExpensive ? 'Tavsiya etiladi' : null,
    highlighted: isMostExpensive,
    features: [
      `${plan.maxStudents} o'quvchigacha`,
      `${plan.maxTeachers} o'qituvchi`,
      `${plan.maxGroups} guruh`,
      ...features,
    ],
  };
}

export function Pricing() {
  const authCtx = useContext(AuthContext);
  const isAuthenticated = authCtx?.isAuthenticated ?? false;
  // Already-logged-in users land on Billing (to actually pay/upgrade),
  // not Register — registering again makes no sense for an existing account.
  const ctaTarget = isAuthenticated ? '/dashboard/billing' : '/register';

  const [plans, setPlans] = useState<DisplayPlan[]>([]);

  useEffect(() => {
    billingApi.getPublicPlans()
      .then((data) => {
        const maxPrice = Math.max(...data.map((p) => p.price));
        setPlans(data.map((p) => toDisplayPlan(p, p.price === maxPrice && maxPrice > 0)));
      })
      .catch(() => setPlans([]));
  }, []);

  if (plans.length === 0) return null;

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-900/30 px-4 py-1.5 text-xs font-bold tracking-wide text-teal-700 dark:text-teal-400 uppercase mb-4">
            Tariflar
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Har bir markaz uchun mos narx
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto px-2">
            10 kun bepul sinab ko'ring. Keyin oylik obuna bilan davom eting — istalgan vaqtda bekor qilish mumkin.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-300 flex flex-col h-full ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl shadow-amber-500/10 ring-1 ring-amber-400/30'
                    : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl border-2 border-indigo-100 dark:border-indigo-900/40 hover:-translate-y-1'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      <Crown className="w-3.5 h-3.5" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-4 ${
                      plan.highlighted ? 'bg-amber-400/10' : 'bg-indigo-50 dark:bg-indigo-900/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${plan.highlighted ? 'text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.highlighted ? 'text-slate-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {plan.tagline}
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-4xl font-extrabold tracking-tight ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm font-medium ${plan.highlighted ? 'text-slate-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {plan.duration}
                    </span>
                  </div>
                </div>

                <div className={`h-px w-full mb-6 ${plan.highlighted ? 'bg-white/10' : 'bg-gray-100 dark:bg-gray-700'}`} />

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                          plan.highlighted ? 'bg-amber-400/15' : 'bg-indigo-50 dark:bg-indigo-900/30'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${plan.highlighted ? 'text-amber-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      </span>
                      <span className={`text-sm ${plan.highlighted ? 'text-slate-200' : 'text-gray-600 dark:text-gray-300'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={ctaTarget}
                  className={`group flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-sm'
                      : 'border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                >
                  Boshlash
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 sm:mt-10 px-2">
          Hoziroq ro'yxatdan o'ting va{' '}
          <span className="font-semibold text-teal-600 dark:text-teal-400">10 kun bepul</span> foydalaning
        </p>
      </div>
    </section>
  );
}
