import { Link } from 'react-router-dom';
import { socialLinks } from '../../data/navLinks';

const SocialIcons = {
  instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  ),
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Newsletter pre-footer */}
      <div className="border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-black text-2xl text-white mb-1">Never miss a story.</h3>
            <p className="text-gray-400 text-sm">Join 50,000+ readers getting the hottest takes every morning.</p>
          </div>
          <form className="flex gap-2 w-full lg:w-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required
              className="flex-1 lg:w-72 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-colors" />
            <button type="submit" className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg">
              Subscribe →
            </button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="font-display font-black text-xl text-white">
            Soro<span className="gradient-text">Kwu</span>Gana
          </Link>
          <p className="mt-3 text-sm leading-relaxed">
            Your #1 destination for African entertainment, lifestyle and culture. Speak to us. We're listening.
          </p>
          <div className="flex gap-3 mt-5">
            {socialLinks.map(s => {
              const Icon = SocialIcons[s.icon];
              return (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-[#6C63FF] hover:to-[#FF4D6D] transition-all">
                  <Icon />
                </a>
              );
            })}
          </div>
        </div>

        {/* Entertainment */}
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5">Entertainment</h3>
          <ul className="space-y-2.5 text-sm">
            {[['Movies', '/entertainment/movies'], ['TV Shows', '/entertainment/tv-shows'], ['Music', '/entertainment/music'], ['Celebrity', '/entertainment/celebrity']].map(([label, href]) => (
              <li key={href}><Link to={href} className="hover:text-white hover:translate-x-1 inline-block transition-all">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Lifestyle */}
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5">Lifestyle</h3>
          <ul className="space-y-2.5 text-sm">
            {[['Fashion', '/lifestyle/fashion'], ['Beauty', '/lifestyle/beauty'], ['Health', '/lifestyle/health'], ['Travel', '/lifestyle/travel'], ['Food', '/lifestyle/food']].map(([label, href]) => (
              <li key={href}><Link to={href} className="hover:text-white hover:translate-x-1 inline-block transition-all">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5">Company</h3>
          <ul className="space-y-2.5 text-sm">
            {[['About', '/about'], ['Contact', '/contact'], ['Trending', '/trending'], ['Reviews', '/reviews'], ['Privacy Policy', '/privacy'], ['Terms of Use', '/terms']].map(([label, href]) => (
              <li key={href}><Link to={href} className="hover:text-white hover:translate-x-1 inline-block transition-all">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} SoroKwuGana. All rights reserved. Made with ❤️ in Lagos.</p>
          <p className="text-gray-600">Entertainment · Lifestyle · Culture</p>
        </div>
      </div>
    </footer>
  );
}
