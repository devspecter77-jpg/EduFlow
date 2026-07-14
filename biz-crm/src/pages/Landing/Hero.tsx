import { ArrowRight, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockStudents = [
  { name: 'Aziz Karimov', group: 'Python Boshlang\'ich', status: 'Faol', paid: "450,000" },
  { name: 'Malika Yusupova', group: 'English B1', status: 'Faol', paid: "300,000" },
  { name: 'Sardor Toshmatov', group: 'Math Pro', status: 'Kutilmoqda', paid: "0" },
  { name: 'Nilufar Rahimova', group: 'Design Kurs', status: 'Faol', paid: "550,000" },
];

export function Hero() {
  return (
    <section className="pt-28 pb-20 px-4 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div className="space-y-7">
            <div className="inline-flex items-center space-x-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-full border border-teal-200 dark:border-teal-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">O'quv markazlari uchun #1 CRM</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              O'quv markazingizni{' '}
              <span className="text-teal-600 dark:text-teal-400">zamonaviy</span>{' '}
              boshqaring
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              EduFlow CRM orqali o'quvchilar, guruhlar, to'lovlar va davomatni bir tizimda boshqaring.
              Vaqtingizni tejang, samaradorligingizni oshiring.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-xl font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 group"
              >
                Bepul sinab ko'rish
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 pt-2">
              {['Bepul boshlash', "10 kunlik sinov muddati", "Texnik yordam 24/7"].map((badge) => (
                <div key={badge} className="flex items-center space-x-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Dashboard Mockup */}
          <div className="relative">
            {/* Floating card top-right */}
            <div className="absolute -top-4 -right-2 z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3.5 border border-gray-100 dark:border-gray-700 flex items-center space-x-3 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">+18%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">bu oy</div>
              </div>
            </div>

            {/* Dashboard window */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Title bar */}
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs font-semibold text-gray-500 dark:text-gray-400">EduFlow Dashboard</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: "O'quvchilar", value: '1,240', color: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
                    { label: 'Guruhlar', value: '48', color: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Davomat', value: '94%', color: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
                    { label: 'Daromad', value: '124M', color: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.color} rounded-xl p-2 sm:p-3 text-center min-w-0`}>
                      <div className={`text-base sm:text-lg font-bold truncate ${s.text}`}>{s.value}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight truncate">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-3 py-2 grid grid-cols-3 gap-2">
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">ISM</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">GURUH</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">HOLAT</span>
                  </div>
                  {mockStudents.map((s, i) => (
                    <div
                      key={i}
                      className="px-3 py-2.5 grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{s.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.group}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${
                          s.status === 'Faol'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card bottom-left */}
            <div className="absolute -bottom-4 -left-2 z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-3.5 border border-gray-100 dark:border-gray-700 flex items-center space-x-3">
              <div className="w-9 h-9 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">12 yangi o'quvchi</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">bugun</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
