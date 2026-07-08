import { useState, useRef, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { navItems, socialLinks } from '../../data/navLinks';
import { useClickOutside } from '../../hooks/useClickOutside';
import SearchModal from '../ui/SearchModal';

// ── Social Icons ──────────────────────────────────────────────────────────────
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-[18px] h-[18px]">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="w-6 h-6">
      {open ? (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

// ── Social icon map ───────────────────────────────────────────────────────────
const SocialIconMap = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
};

// ── Desktop Dropdown ──────────────────────────────────────────────────────────
function DesktopDropdown({ item }: { item: typeof navItems[0] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  if (!item.dropdown) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-rose-500 dark:hover:text-rose-400 transition-colors py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {item.label}
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50 animate-dropdown">
          {item.dropdown.map(sub => (
            <NavLink
              key={sub.href}
              to={sub.href}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                    : 'text-gray-700 dark:text-gray-300 hover:text-rose-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              {sub.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile Menu Item ──────────────────────────────────────────────────────────
function MobileNavItem({
  item,
  onClose,
}: {
  item: typeof navItems[0];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  if (item.dropdown) {
    return (
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-base font-semibold text-gray-800 dark:text-gray-100 hover:text-rose-500 dark:hover:text-rose-400 transition-colors focus:outline-none"
          aria-expanded={open}
        >
          {item.label}
          <ChevronDown open={open} />
        </button>
        {open && (
          <div className="bg-gray-50 dark:bg-gray-800/60">
            {item.dropdown.map(sub => (
              <NavLink
                key={sub.href}
                to={sub.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `block pl-8 pr-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-rose-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-rose-500'
                  }`
                }
              >
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href!}
      onClick={onClose}
      className={({ isActive }) =>
        `block px-4 py-3 text-base font-semibold transition-colors ${
          isActive
            ? 'text-rose-500'
            : 'text-gray-800 dark:text-gray-100 hover:text-rose-500 dark:hover:text-rose-400'
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Split nav: left items (before About/Contact), right items
  const leftItems = navItems.filter(
    i => !['About', 'Contact'].includes(i.label)
  );
  const rightItems = navItems.filter(i => ['About', 'Contact'].includes(i.label));

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        {/* Top ticker / brand bar */}
        <div className="bg-rose-600 text-white text-xs py-1.5 text-center font-medium tracking-wide">
          ✦ Your #1 Source for Entertainment & Lifestyle ✦
        </div>

        {/* Main nav row */}
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 text-xl font-black tracking-tight text-gray-900 dark:text-white"
          >
            Soro<span className="text-rose-500">Kwu</span>Gana
          </Link>

          {/* Desktop left nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary navigation">
            {leftItems.map(item =>
              item.dropdown ? (
                <DesktopDropdown key={item.label} item={item} />
              ) : (
                <NavLink
                  key={item.label}
                  to={item.href!}
                  className={({ isActive }) =>
                    `px-2 py-2 text-sm font-medium transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      isActive
                        ? 'text-rose-500'
                        : 'text-gray-700 dark:text-gray-200 hover:text-rose-500 dark:hover:text-rose-400'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Right nav links (About, Contact) */}
            {rightItems.map(item => (
              <NavLink
                key={item.label}
                to={item.href!}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-rose-500'
                      : 'text-gray-700 dark:text-gray-200 hover:text-rose-500 dark:hover:text-rose-400'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* Divider */}
            <span className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(s => {
                const Icon = SocialIconMap[s.icon];
                return (
                  <a
                    key={s.icon}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1 rounded"
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <span className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <SearchIcon />
            </button>

            {/* Subscribe */}
            <a
              href="/subscribe"
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
            >
              Subscribe
            </a>

            {/* Login */}
            <button
              aria-label="Login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <LoginIcon />
              <span>Login</span>
            </button>
          </div>

          {/* Mobile right icons */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <SearchIcon />
            </button>
            <a
              href="/subscribe"
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              Subscribe
            </a>
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="text-gray-700 dark:text-gray-200 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div
            ref={mobileRef}
            className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 divide-y divide-gray-100 dark:divide-gray-800 animate-dropdown"
          >
            <nav aria-label="Mobile navigation">
              {navItems.map(item => (
                <MobileNavItem key={item.label} item={item} onClose={closeMobile} />
              ))}
            </nav>

            {/* Mobile bottom bar */}
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {socialLinks.map(s => {
                  const Icon = SocialIconMap[s.icon];
                  return (
                    <a
                      key={s.icon}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="text-gray-500 hover:text-rose-500 transition-colors"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-500 transition-colors">
                <LoginIcon />
                Login
              </button>
            </div>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
