import { Link } from 'react-router-dom';
import { socialLinks } from '../../data/navLinks';

const SocialIconMap = {
  instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  ),
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link to="/" className="text-xl font-black text-white">
            Soro<span className="text-rose-500">Kwu</span>Gana
          </Link>
          <p className="mt-3 text-sm leading-relaxed">
            Your #1 destination for entertainment news, lifestyle tips, and everything trending.
          </p>
          <div className="flex gap-3 mt-5">
            {socialLinks.map(s => {
              const Icon = SocialIconMap[s.icon];
              return (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-gray-400 hover:text-rose-400 transition-colors"
                >
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        {/* Entertainment */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Entertainment</h3>
          <ul className="space-y-2 text-sm">
            {['Movies', 'TV Shows', 'Music', 'Celebrity'].map(item => (
              <li key={item}>
                <Link
                  to={`/entertainment/${item.toLowerCase().replace(' ', '-')}`}
                  className="hover:text-rose-400 transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Lifestyle */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Lifestyle</h3>
          <ul className="space-y-2 text-sm">
            {['Fashion', 'Beauty', 'Health', 'Travel', 'Food'].map(item => (
              <li key={item}>
                <Link
                  to={`/lifestyle/${item.toLowerCase()}`}
                  className="hover:text-rose-400 transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Trending', href: '/trending' },
              { label: 'Reviews', href: '/reviews' },
            ].map(item => (
              <li key={item.href}>
                <Link to={item.href} className="hover:text-rose-400 transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} SoroKwuGana. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-rose-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-rose-400 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
