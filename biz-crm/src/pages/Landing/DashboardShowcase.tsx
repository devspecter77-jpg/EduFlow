import { BarChart2, Bell, Lock, LayoutDashboard, Users, CreditCard, ClipboardList, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users, label: "O'quvchilar", active: false },
  { icon: ClipboardList, label: 'Davomat', active: false },
  { icon: CreditCard, label: "To'lovlar", active: false },
  { icon: Settings, label: 'Sozlamalar', active: false },
];

const chartBars = [60, 80, 45, 90, 70, 55, 85];
const chartDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

const activities = [
  { name: 'Sardor T.', action: "To'lov amalga oshirdi", time: '2 daq oldin', color: 'bg-green-400' },
  { name: 'Malika Y.', action: 'Guruhga qo\'shildi', time: '15 daq oldin', color: 'bg-blue-400' },
  { name: 'Bobur A.', action: 'Davomat belgilandi', time: '1 soat oldin', color: 'bg-teal-400' },
  { name: 'Shahnoza R.', action: 'Yangi ro\'yxat', time: '2 soat oldin', color: 'bg-purple-400' },
];

const highlights = [
  {
    icon: BarChart2,
    title: 'Real vaqt statistikasi',
    description: 'Har kuni yangilanadigan ma\'lumotlar',
  },
  {
    icon: Bell,
    title: 'Avtomatik bildirishnomalar',
    description: 'SMS va email orqali xabarlar',
  },
  {
    icon: Lock,
    title: 'Rol asosida kirish',
    description: "Admin, menejer va o'qituvchi uchun alohida huquqlar",
  },
];

const stats = [
  { label: "O'quvchilar", value: '1,240', color: 'text-teal-600 dark:text-teal-400' },
  { label: 'Guruhlar', value: '48', color: 'text-blue-600 dark:text-blue-400' },
  { label: 'Davomat', value: '94%', color: 'text-green-600 dark:text-green-400' },
  { label: "To'lovlar", value: '87%', color: 'text-purple-600 dark:text-purple-400' },
];

export function DashboardShowcase() {
  return (
    <section className="py-14 sm:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Kuchli dashboard, sodda boshqaruv
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 max-w-2xl mx-auto px-2">
            Real vaqtda statistika va to'liq nazorat
          </p>
        </div>

        {/* Large Dashboard Mockup */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 sm:mb-14">
          {/* Top bar */}
          <div className="bg-gray-50 dark:bg-gray-900 px-3 sm:px-5 py-3 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs font-semibold text-gray-400 truncate">app.eduflow.uz</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:h-80">
            {/* Sidebar — hidden on phones; the real app also collapses this on mobile */}
            <div className="hidden sm:block w-44 bg-gray-50 dark:bg-gray-900/60 border-r border-gray-200 dark:border-gray-700 py-4 px-3 flex-shrink-0">
              <div className="flex items-center space-x-2 mb-6 px-2">
                <img
                  src="/photo_2026-06-12_11-17-02.jpg"
                  alt="EduFlow CRM"
                  className="h-6 w-6 rounded-md object-cover"
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">EduFlow</span>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        item.active
                          ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 p-3 sm:p-5 overflow-hidden min-w-0">
              {/* Mini stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-5">
                {stats.map((s) => (
                  <div key={s.label} className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-2.5 sm:p-3 min-w-0">
                    <div className={`text-sm sm:text-base font-bold truncate ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 truncate">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Chart */}
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 min-w-0">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">Haftalik davomat</div>
                  <div className="flex items-end space-x-2 h-16">
                    {chartBars.map((h, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-teal-500 dark:bg-teal-400 rounded-t-sm opacity-80"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[8px] text-gray-400 mt-1">{chartDays[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 min-w-0">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">So'nggi faoliyat</div>
                  <div className="space-y-2">
                    {activities.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${a.color} flex-shrink-0`} />
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 font-medium flex-shrink-0">{a.name}</span>
                        <span className="text-[10px] text-gray-400 truncate min-w-0">{a.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.title} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{h.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{h.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
