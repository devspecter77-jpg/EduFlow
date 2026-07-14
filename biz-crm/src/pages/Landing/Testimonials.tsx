import { Star } from 'lucide-react';

const testimonials = [
  {
    stars: 5,
    text: "EduFlow bizning ishimizni to'liq o'zgartirdi. Endi hamma narsa tartibli va tez.",
    initials: 'AK',
    name: 'Aziz Karimov',
    org: 'Najot IT Maktabi, Toshkent',
    color: 'bg-teal-600',
  },
  {
    stars: 5,
    text: "To'lov va davomat hisobi uchun alohida dasturlar ishlatardik. Endi hammasi bitta joyda.",
    initials: 'NK',
    name: 'Nodira Xoliqova',
    org: "Brilliant O'quv Markazi, Samarqand",
    color: 'bg-cyan-600',
  },
  {
    stars: 5,
    text: "O'quvchilar soni 2 barobarga oshdi, lekin boshqaruv osonlashdi. Tavsiya qilaman!",
    initials: 'JY',
    name: 'Jasur Yusupov',
    org: 'ProCode Academy, Namangan',
    color: 'bg-blue-600',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Mijozlarimiz fikri
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            O'zbekiston bo'ylab 50+ o'quv markazi EduFlow ishlatmoqda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700"
            >
              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-[15px] mb-6">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.org}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
