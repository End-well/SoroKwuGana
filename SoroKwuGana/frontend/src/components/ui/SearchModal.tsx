import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const popularSearches = [
  { label: 'Afrobeats', href: '/entertainment/music' },
  { label: 'Celebrity News', href: '/entertainment/celebrity' },
  { label: 'Fashion Week', href: '/lifestyle/fashion' },
  { label: 'Movie Reviews', href: '/entertainment/movies' },
  { label: 'Travel Guide', href: '/lifestyle/travel' },
  { label: 'Beauty Tips', href: '/lifestyle/beauty' },
  { label: 'Nollywood', href: '/entertainment/movies' },
  { label: 'Food & Culture', href: '/lifestyle/food' },
];

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" role="dialog" aria-modal="true" aria-label="Search">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-gray-800">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input ref={inputRef} type="search" placeholder="Search stories, celebrities, music…"
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-base outline-none" />
          <button onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 transition-colors font-mono">
            ESC
          </button>
        </div>

        {/* Quick links */}
        <div className="px-5 py-5">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map(s => (
              <Link key={s.label} to={s.href} onClick={onClose}
                className="text-sm px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] transition-colors font-medium">
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick navigation</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🎬 Movies', href: '/entertainment/movies' },
              { label: '🎵 Music', href: '/entertainment/music' },
              { label: '⭐ Celebrity', href: '/entertainment/celebrity' },
              { label: '👗 Fashion', href: '/lifestyle/fashion' },
            ].map(item => (
              <Link key={item.href} to={item.href} onClick={onClose}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] transition-colors">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
