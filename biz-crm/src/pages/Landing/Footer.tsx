import { Link } from 'react-router-dom';

const footerLinks = {
  product: {
    title: 'Mahsulot',
    links: [
      { label: 'Imkoniyatlar', href: '#features' },
      { label: 'Narxlar', href: '#pricing' },
      { label: 'Demo', href: '#' },
      { label: 'Yangiliklar', href: '#' },
    ],
  },
  company: {
    title: 'Kompaniya',
    links: [
      { label: 'Biz haqimizda', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Karyera', href: '#' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8 sm:gap-10">
          {/* Column 1: Brand — spans both columns on phones so the logo/description/socials get full width */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div className="flex items-center space-x-2">
              <img
                src="/photo_2026-06-12_11-17-02.jpg"
                alt="EduFlow CRM"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-lg font-bold text-white">EduFlow CRM</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              O'quv markazlari uchun professional boshqaruv tizimi
            </p>
            {/* Social icons */}
            <div className="flex items-center space-x-3">
              <a
                href="https://t.me/RootDev07"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-[#229ED9] rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.038-1.36 5.354-.168.557-.5.743-.82.761-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.248-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.122.1.155.235.171.331.016.095.036.314.02.485z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/eduflow__support?igsh=MXhkNnFldTduaHBoNQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Columns 2-4 */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-sm text-gray-500 text-center">
            © 2026 EduFlow CRM. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <span>Toshkent, O'zbekiston</span>
            <span>·</span>
            <Link to="/login" className="hover:text-teal-400 transition-colors">Kirish</Link>
            <span>·</span>
            <Link to="/register" className="hover:text-teal-400 transition-colors">Ro'yxatdan o'tish</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
