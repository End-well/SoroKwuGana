import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories, useStats } from '../hooks/useStats';
import type { Category } from '../types';

// ── Icons ─────────────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  dashboard:  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  posts:      'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  categories: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  comments:   'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  users:      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  chevronDown:'M19 9l-7 7-7-7',
  chevronRight:'M9 5l7 7-7 7',
  newPost:    'M12 4v16m8-8H4',
  logout:     'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu:       'M4 6h16M4 12h16M4 18h16',
  close:      'M6 18L18 6M6 6l12 12',
  external:   'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};

// Section colour chips
const SECTION_COLORS: Record<string, { pill: string; dot: string }> = {
  entertainment: { pill: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  lifestyle:     { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

// ── Category Sub-Nav ──────────────────────────────────────────────────────────
function CategoryNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ entertainment: true, lifestyle: true });
  const sections = ['entertainment', 'lifestyle'];

  const toggle = (s: string) => setOpen(prev => ({ ...prev, [s]: !prev[s] }));
  const grouped = (s: string) => categories.filter(c => c.parent === s);

  return (
    <div className="mt-1 space-y-1">
      {sections.map(section => {
        const cats = grouped(section);
        if (cats.length === 0) return null;
        const col = SECTION_COLORS[section] ?? { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

        return (
          <div key={section}>
            <button
              onClick={() => toggle(section)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-800/60 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${col.dot}`} />
                {section}
              </span>
              <Icon
                d={open[section] ? ICONS.chevronDown : ICONS.chevronRight}
                className="w-3 h-3 opacity-50"
              />
            </button>

            {open[section] && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-700/60 pl-3">
                {cats.map(cat => (
                  <NavLink
                    key={cat._id}
                    to={`/posts?category=${cat.slug}`}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'text-white bg-gray-700/80'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      }`
                    }
                  >
                    <span className="truncate font-medium">{cat.name}</span>
                    {(cat._count?.posts ?? 0) > 0 && (
                      <span className="flex-shrink-0 text-xs bg-gray-700 text-gray-300 rounded-full px-1.5 py-0.5 font-mono">
                        {cat._count?.posts}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sidebar content (shared between desktop & mobile) ─────────────────────────
function SidebarContent({
  onNavClick,
  pendingComments,
  categories,
  user,
  onLogout,
}: {
  onNavClick?: () => void;
  pendingComments: number;
  categories: Category[];
  user: { name?: string; email?: string; role?: string } | null;
  onLogout: () => void;
}) {
  const mainItems = [
    { label: 'Dashboard',  href: '/',          icon: ICONS.dashboard,  end: true },
    { label: 'Posts',      href: '/posts',      icon: ICONS.posts,      end: false },
    { label: 'Comments',   href: '/comments',   icon: ICONS.comments,   end: false, badge: pendingComments },
    { label: 'Users',      href: '/users',      icon: ICONS.users,      end: false },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800/80 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">SK</span>
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight leading-none">
              Soro<span className="text-rose-400">Kwu</span>Gana
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-none" aria-label="Main navigation">
        {/* Main links */}
        {mainItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#6C63FF]/90 to-[#FF4D6D]/90 text-white shadow-md shadow-[#6C63FF]/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon d={item.icon} className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </span>
            {item.badge != null && item.badge > 0 && (
              <span className="flex-shrink-0 text-xs font-bold bg-[#FF4D6D] text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* Categories section divider */}
        <div className="pt-4 pb-1 px-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Categories</span>
            <NavLink
              to="/categories"
              onClick={onNavClick}
              className={({ isActive }) =>
                `text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#6C63FF]/20 text-[#6C63FF]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/60'
                }`
              }
              title="Manage categories"
            >
              <Icon d={ICONS.categories} className="w-3 h-3" />
              Manage
            </NavLink>
          </div>
        </div>

        {/* Live category links */}
        {categories.length === 0 ? (
          <p className="px-3 text-xs text-gray-600 italic">No categories yet.</p>
        ) : (
          <CategoryNav categories={categories} />
        )}

        {/* Quick create */}
        <div className="pt-4">
          <Link
            to="/posts/new"
            onClick={onNavClick}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C63FF]/20"
          >
            <Icon d={ICONS.newPost} className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </nav>

      {/* User profile + logout */}
      <div className="flex-shrink-0 px-3 py-4 border-t border-gray-800/80 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800/40">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user?.role?.replace('_', ' ').toLowerCase() ?? ''}
            </p>
          </div>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
            title="View site"
          >
            <Icon d={ICONS.external} className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
        >
          <Icon d={ICONS.logout} className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────
function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  const labels: Record<string, string> = {
    posts: 'Posts', categories: 'Categories', comments: 'Comments',
    users: 'Users', new: 'New Post', edit: 'Edit Post',
  };

  if (parts.length === 0) return <span className="text-sm text-gray-400">Dashboard</span>;

  return (
    <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      <Link to="/" className="text-gray-400 hover:text-gray-700 transition-colors">Home</Link>
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        const label = labels[part] ?? (part.length === 24 ? '…' : part);
        return (
          <span key={i} className="flex items-center gap-1.5">
            <Icon d={ICONS.chevronRight} className="w-3 h-3 text-gray-300" />
            <span className={isLast ? 'text-gray-700 font-semibold' : 'text-gray-400'}>
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

// ── Main Layout ────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: stats } = useStats();
  const pendingComments = stats?.pendingComments ?? 0;

  // Close mobile sidebar on navigation
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarProps = {
    pendingComments,
    categories,
    user,
    onLogout: handleLogout,
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-gray-950 flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-gray-950 flex flex-col z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent {...sidebarProps} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">

        {/* Top header bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Open menu"
            >
              <Icon d={mobileOpen ? ICONS.close : ICONS.menu} className="w-5 h-5" />
            </button>
            <Breadcrumb />
          </div>

          {/* Right: quick actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Pending comments badge */}
            {pendingComments > 0 && (
              <Link
                to="/comments"
                className="relative flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {pendingComments} pending
              </Link>
            )}

            {/* New post shortcut */}
            <Link
              to="/posts/new"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] px-3.5 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
            >
              <Icon d={ICONS.newPost} className="w-3.5 h-3.5" />
              New Post
            </Link>

            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-6 py-3 text-xs text-gray-400 flex items-center justify-between">
          <span>SoroKwuGana Admin © {new Date().getFullYear()}</span>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#6C63FF] transition-colors flex items-center gap-1"
          >
            <Icon d={ICONS.external} className="w-3 h-3" />
            View live site
          </a>
        </footer>
      </div>
    </div>
  );
}
