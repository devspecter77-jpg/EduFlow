import { CheckCircle, Check, X, Minus } from 'lucide-react';

const advantages = [
  {
    title: 'Hammasi bitta tizimda',
    description: "O'quvchi, guruh, to'lov va davomatni alohida dasturlarsiz boshqaring",
  },
  {
    title: 'Tez va samarali',
    description: "Bir soniyada istalgan ma'lumotni toping. Ish vaqtingizni 3 barobarga tejang",
  },
  {
    title: "100% xavfsiz",
    description: "Ma'lumotlaringiz shifrlangan va faqat siz ko'rishingiz mumkin",
  },
  {
    title: 'Bulutli platforma',
    description: "Internet bo'lsa, istalgan joydan, istalgan qurilmadan kiring",
  },
  {
    title: 'Mobil qurilmada ishlaydi',
    description: 'Telefon, planshet yoki kompyuterdan bir xil ravon ishlaydi',
  },
  {
    title: 'Statistik hisobotlar',
    description: "Markazingiz o'sishini kuzating, to'g'ri qarorlar qabul qiling",
  },
];

type CellValue = 'check-green' | 'check-yellow' | 'x-red' | 'minus-yellow';

const comparisonRows: { feature: string; eduflow: CellValue; excel: CellValue; other: CellValue }[] = [
  { feature: "O'quvchi bazasi", eduflow: 'check-green', excel: 'check-yellow', other: 'check-green' },
  { feature: 'Avtomatik SMS', eduflow: 'check-green', excel: 'x-red', other: 'check-green' },
  { feature: "To'lov hisobi", eduflow: 'check-green', excel: 'minus-yellow', other: 'check-green' },
  { feature: 'Davomat', eduflow: 'check-green', excel: 'x-red', other: 'minus-yellow' },
  { feature: 'Hisobotlar', eduflow: 'check-green', excel: 'minus-yellow', other: 'check-green' },
  { feature: 'Mobil qurilma', eduflow: 'check-green', excel: 'x-red', other: 'x-red' },
  { feature: "24/7 qo'llab-q.", eduflow: 'check-green', excel: 'x-red', other: 'minus-yellow' },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === 'check-green') return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  if (value === 'check-yellow') return <Check className="w-5 h-5 text-yellow-500 mx-auto" />;
  if (value === 'x-red') return <X className="w-5 h-5 text-red-500 mx-auto" />;
  return <Minus className="w-5 h-5 text-yellow-500 mx-auto" />;
}

export function WhyEduFlow() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Nega EduFlow CRM?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Raqobatchilardan farqli ravishda, biz faqat o'quv markazlari uchun yaratilganmiz
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: advantages */}
          <div className="space-y-5">
            {advantages.map((item) => (
              <div key={item.title} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                  <CheckCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: comparison table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Xususiyat</th>
                  <th className="px-4 py-3 font-semibold text-teal-600 dark:text-teal-400 text-center">EduFlow</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-center">Excel</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-center">Boshqa dastur</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-t border-gray-100 dark:border-gray-700 ${
                      i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-700/20'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium">{row.feature}</td>
                    <td className="px-4 py-3 text-center"><CellIcon value={row.eduflow} /></td>
                    <td className="px-4 py-3 text-center"><CellIcon value={row.excel} /></td>
                    <td className="px-4 py-3 text-center"><CellIcon value={row.other} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
