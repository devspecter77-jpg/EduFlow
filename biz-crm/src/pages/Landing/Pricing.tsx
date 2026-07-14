import { useContext } from 'react';
import { Check, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';

const plans = [
  {
    name: 'Sinov',
    tagline: 'Yangi boshlayotgan markazlar uchun',
    icon: Sparkles,
    price: 'Bepul',
    duration: '10 kun',
    badge: null,
    highlighted: false,
    features: [
      "10 kunlik bepul sinov",
      "50 o'quvchigacha",
      "5 o'qituvchi",
      "5 guruh",
      'SMS bildirishnomalar',
      'Telegram bot',
      'Barcha funksiyalar',
      'Online qo\'llab-quvvatlash',
    ],
  },
  {
    name: 'Premium',
    tagline: 'Faol o\'sib borayotgan markazlar uchun',
    icon: Crown,
    price: '200 000',
    duration: "so'm/oy",
    badge: 'Tavsiya etiladi',
    highlighted: true,
    features: [
      "200 o'quvchigacha",
      "20 o'qituvchi",
      "30 guruh",
      'Cheklanmagan funksiyalar',
      'Excel import/export',
      'SMS bildirishnomalar',
      'Telegram bot integratsiya',
      'To\'lov izlash',
      'Davomat tizimi',
      'Kengaytirilgan hisobotlar',
      "Priority qo'llab-quvvatlash",
      '24/7 yordam',
    ],
  },
];

export function Pricing() {
  const authCtx = useContext(AuthContext);
  const isAuthenticated = authCtx?.isAuthenticated ?? false;
  // Already-logged-in users land on Billing (to actually pay/upgrade),
  // not Register — registering again makes no sense for an existing account.
  const ctaTarget = isAuthenticated ? '/dashboard/billing' : '/register';

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
                className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-300 flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-teal-600 via-teal-600 to-cyan-600 text-white shadow-2xl shadow-teal-500/20 md:scale-105 ring-1 ring-teal-400/50'
                    : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:-translate-y-1'
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
                      plan.highlighted ? 'bg-white/15' : 'bg-teal-50 dark:bg-teal-900/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${plan.highlighted ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.highlighted ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {plan.tagline}
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className={`text-4xl font-extrabold tracking-tight ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm font-medium ${plan.highlighted ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {plan.duration}
                    </span>
                  </div>
                </div>

                <div className={`h-px w-full mb-6 ${plan.highlighted ? 'bg-white/15' : 'bg-gray-100 dark:bg-gray-700'}`} />

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                          plan.highlighted ? 'bg-white/20' : 'bg-teal-50 dark:bg-teal-900/30'
                        }`}
                      >
                        <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                      </span>
                      <span className={`text-sm ${plan.highlighted ? 'text-teal-50' : 'text-gray-600 dark:text-gray-300'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={ctaTarget}
                  className={`group flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-white text-teal-700 hover:bg-teal-50 shadow-sm'
                      : 'border-2 border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
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
