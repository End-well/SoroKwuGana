import { useState, useRef, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navItems, socialLinks } from '../../data/navLinks';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTheme } from '../../context/ThemeContext';
import SearchModal from '../ui/SearchModal';

/* ── Icons ──────────────────────────────────────────────────────────────────── */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);
const SocialIconMap = { instagram: InstagramIcon, tiktok: TikTokIcon, youtube: YouTubeIcon };

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const ChevronDown = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
    className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-6 h-6" aria-hidden="true">
    {open ? (<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>) : (<><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>)}
  </svg>
);

/* ── Breaking news ticker ───────────────────────────────────────────────────── */
const breakingItems = [
  '🔥 Major Hollywood studio signs first African superhero franchise',
  '🎵 Afrobeats artist breaks streaming record with 1B plays in 7 days',
  '✨ Fashion Week 2026: 5 trends you need to know right now',
  '🏆 Nollywood film wins Best Picture at international film festival',
];

/* ── Desktop Dropdown ──────────────────────────────────────────────────────── */
function DesktopDropdown({ item }: { item: typeof navItems[0] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []));
  if (!item.dropdown) return null;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6C63FF] dark:hover:text-[#6C63FF] transition-colors py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] rounded"
        aria-expanded={open} aria-haspopup="true">
        {item.label} <ChevronDown open={open} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50 animate-dropdown">
          {item.dropdown.map(sub => (
            <NavLink key={sub.href} to={sub.href} onClick={() => setOpen(false)}
              className={({ isActive }) => `block px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#6C63FF] bg-[#6C63FF]/5' : 'text-gray-700 dark:text-gray-300 hover:text-[#6C63FF] hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {sub.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mobile Nav Item ────────────────────────────────────────────────────────── */
function MobileNavItem({ item, onClose }: { item: typeof navItems[0]; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  if (item.dropdown) {
    return (
      <div>
        <button onClick={() => setOpen(v => !v)}
          className="flex items-center justify-between w-full px-5 py-3.5 text-base font-semibold text-gray-800 dark:text-gray-100 hover:text-[#6C63FF] transition-colors"
          aria-expanded={open}>
          {item.label} <ChevronDown open={open} />
        </button>
        {open && (
          <div className="bg-gray-50 dark:bg-gray-800/60">
            {item.dropdown.map(sub => (
              <NavLink key={sub.href} to={sub.href} onClick={onClose}
                className={({ isActive }) => `block pl-9 pr-5 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-[#6C63FF]' : 'text-gray-600 dark:text-gray-400 hover:text-[#6C63FF]'}`}>
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <NavLink to={item.href!} onClick={onClose}
      className={({ isActive }) => `block px-5 py-3.5 text-base font-semibold transition-colors ${isActive ? 'text-[#6C63FF]' : 'text-gray-800 dark:text-gray-100 hover:text-[#6C63FF]'}`}>
      {item.label}
    </NavLink>
  );
}

/* ── Main Navbar ────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const leftItems = navItems.filter(i => !['About', 'Contact'].includes(i.label));

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Breaking news ticker */}
        <div className="bg-gradient-to-r from-[#6C63FF] via-[#FF4D6D] to-[#6C63FF] text-white text-xs py-1.5 overflow-hidden whitespace-nowrap relative w-full">
          <div className="animate-ticker inline-flex">
            {[...breakingItems, ...breakingItems].map((item, i) => (
              <span key={i} className="mx-10 font-semibold tracking-wide">{item}</span>
            ))}
          </div>
        </div>

        {/* Main nav */}
        <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/80">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
              <img src="/favicon.png" alt="SKG Logo" className="w-11 h-11 flex-shrink-0 object-contain" />
              <span className="font-display font-black text-xl tracking-tight text-gray-900 dark:text-white">
                Soro<span className="gradient-text">Kwu</span>Gana
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary navigation">
              {leftItems.map(item =>
                item.dropdown ? (
                  <DesktopDropdown key={item.label} item={item} />
                ) : (
                  <NavLink key={item.label} to={item.href!}
                    className={({ isActive }) => `px-3 py-2 text-sm font-semibold transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] ${isActive ? 'text-[#6C63FF]' : 'text-gray-700 dark:text-gray-200 hover:text-[#6C63FF] dark:hover:text-[#6C63FF]'}`}>
                    {item.label}
                  </NavLink>
                )
              )}
            </nav>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Social icons */}
              {socialLinks.map(s => {
                const Icon = SocialIconMap[s.icon];
                return (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="text-gray-400 hover:text-[#6C63FF] transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Icon />
                  </a>
                );
              })}
              <span className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* Dark mode toggle */}
              <button onClick={toggleTheme} aria-label="Toggle dark mode"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* Search */}
              <button onClick={() => setSearchOpen(true)} aria-label="Open search"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <SearchIcon />
              </button>

              {/* Advertise CTA */}
              <Link to="/advertise"
                className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 shadow-md shadow-[#6C63FF]/25">
                Advertise
              </Link>
            </div>

            {/* Mobile right */}
            <div className="flex lg:hidden items-center gap-1.5">
              <button onClick={toggleTheme} aria-label="Toggle dark mode"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
              <button onClick={() => setSearchOpen(true)} aria-label="Open search"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <SearchIcon />
              </button>
              <button onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}
                className="p-2 text-gray-700 dark:text-gray-200 hover:text-[#6C63FF] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <HamburgerIcon open={mobileOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 animate-dropdown shadow-xl">
            <nav aria-label="Mobile navigation">
              {navItems.map(item => <MobileNavItem key={item.label} item={item} onClose={closeMobile} />)}
            </nav>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex gap-3">
                {socialLinks.map(s => { const Icon = SocialIconMap[s.icon]; return <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-gray-400 hover:text-[#6C63FF] transition-colors"><Icon /></a>; })}
              </div>
              <Link to="/advertise" onClick={closeMobile} className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white text-xs font-bold px-4 py-2 rounded-full">Advertise</Link>
            </div>
          </div>
        )}
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
