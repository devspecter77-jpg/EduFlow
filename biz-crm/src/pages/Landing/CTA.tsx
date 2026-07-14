import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Bugun bepul boshlang
        </h2>
        <p className="text-lg text-teal-100 mb-10 max-w-xl mx-auto">
          14 kunlik sinov muddati. Kredit karta kerak emas. O'rnatish talab qilinmaydi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-white text-teal-700 hover:bg-teal-50 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Ro'yxatdan o'tish
          </Link>
          <button className="inline-flex items-center justify-center border-2 border-white/70 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5">
            Demo so'rash
          </button>
        </div>

        <div className="inline-flex items-center space-x-2 text-teal-100 text-sm">
          <Users className="w-4 h-4" />
          <span>1,000+ o'quvchi allaqachon EduFlow da o'qimoqda</span>
        </div>
      </div>
    </section>
  );
}
