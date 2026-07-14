import { Users, Building2, Shield, Headphones } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: "1,000+",
    label: "O'quvchilar",
  },
  {
    icon: Building2,
    value: "50+",
    label: "Markazlar",
  },
  {
    icon: Shield,
    value: "99.9%",
    label: "Ishonchlilik",
  },
  {
    icon: Headphones,
    value: "24/7",
    label: "Qo'llab-quvvatlash",
  },
];

export function Stats() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-center group"
              >
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
