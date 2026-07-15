import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'EduFlow bepulmi?',
    answer:
      "Ha, 10 kunlik bepul sinov muddati mavjud. Kredit karta talab qilinmaydi. Sinov tugagach, o'zingizga mos rejani tanlashingiz mumkin.",
  },
  {
    question: "Ma'lumotlarim xavfsizmi?",
    answer:
      "Albatta. Barcha ma'lumotlar AES-256 shifrlash bilan himoyalangan va faqat siz va ruxsat bergan foydalanuvchilar ko'ra oladi.",
  },
  {
    question: "Nechta o'quvchi qo'shish mumkin?",
    answer:
      "Bu tanlagan tarifingizga bog'liq — aniq limitlarni yuqoridagi \"Narxlar\" bo'limidagi tarif kartalarida ko'rishingiz mumkin.",
  },
  {
    question: 'SMS xabarlar qanday ishlaydi?',
    answer:
      "Tizim avtomatik ravishda o'quvchi va ota-onalarga dars, to'lov va davomat haqida SMS jo'natadi. Xabarlar matnini o'zingiz sozlashingiz mumkin.",
  },
  {
    question: 'Mobil ilovasi bormi?',
    answer:
      'Hozircha veb-brauzer orqali telefon va planshetda to\'liq ishlaydi. Maxsus mobil ilova yaqin orada chiqariladi.',
  },
  {
    question: 'Texnik yordam qanday?',
    answer:
      "Standard va Premium foydalanuvchilar uchun ustuvor texnik yordam, Basic foydalanuvchilar uchun esa email orqali qo'llab-quvvatlash mavjud.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
            Ko'p so'raladigan savollar
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors text-[15px]">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4 group-hover:text-teal-500 transition-colors" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
