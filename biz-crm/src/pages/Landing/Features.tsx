import {
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  BarChart3,
  GraduationCap,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: "O'quvchilar",
    description: "O'quvchi ma'lumotlari, hujjatlar va tarixni to'liq boshqaring",
  },
  {
    icon: BookOpen,
    title: 'Guruhlar',
    description: "Guruhlar, jadval va darslarni oson tashkil qiling",
  },
  {
    icon: ClipboardList,
    title: 'Davomat',
    description: "Avtomatik davomat hisobi va ota-onalarga xabar",
  },
  {
    icon: CreditCard,
    title: "To'lovlar",
    description: "To'lov tarixi, eslatmalar va moliyaviy hisobotlar",
  },
  {
    icon: BarChart3,
    title: 'Hisobotlar',
    description: "Keng qamrovli analitika va statistik ma'lumotlar",
  },
  {
    icon: GraduationCap,
    title: "O'qituvchilar",
    description: "O'qituvchi profili, ish haqi va dars jadvali",
  },
  {
    icon: MessageSquare,
    title: 'SMS xabarlar',
    description: "O'quvchi va ota-onalarga avtomatik bildirishnomalar",
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: "Barcha ma'lumotlar bir ko'rinishda, real vaqtda",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Barcha imkoniyatlar bitta tizimda
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            O'quv markazingizni boshqarish uchun kerak bo'lgan hamma narsa
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 group"
              >
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
