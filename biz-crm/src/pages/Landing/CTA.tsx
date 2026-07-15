import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
          Bugun bepul boshlang
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          14 kunlik sinov muddati. Kredit karta kerak emas. O'rnatish talab qilinmaydi.
        </p>

        <div className="flex justify-center mb-10">
          <Link
            to="/register"
            className="inline-flex items-center justify-center bg-amber-400 text-slate-900 hover:bg-amber-300 px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Ro'yxatdan o'tish
          </Link>
        </div>

        <div className="inline-flex items-center space-x-2 text-slate-400 text-sm">
          <Users className="w-4 h-4" />
          <span>1,000+ o'quvchi allaqachon EduFlow da o'qimoqda</span>
        </div>
      </div>
    </section>
  );
}
