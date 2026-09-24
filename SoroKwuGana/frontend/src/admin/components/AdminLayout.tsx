import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories, useStats } from '../hooks/useStats';
import { getAllowedNav, ROLE_META, type Role } from '../lib/roles';
import type { Category } from '../types';

// ── Icon ──────────────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  posts:        'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  categories:   'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  comments:     'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  users:        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  chevronDown:  'M19 9l-7 7-7-7',
  chevronRight: 'M9 5l7 7-7 7',
  plus:         'M12 4v16m8-8H4',
  logout:       'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu:         'M4 6h16M4 12h16M4 18h16',
  close:        'M6 18L18 6M6 6l12 12',
  external:     'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  lock:         'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  settings:     'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  mail:         'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  star:         'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  adverts:      'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
};

const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',   href: '/admin',              icon: IC.dashboard,   end: true  },
  { key: 'posts',       label: 'Posts',        href: '/admin/posts',        icon: IC.posts,       end: false },
  { key: 'reviews',     label: 'Reviews',      href: '/admin/reviews',      icon: IC.star,        end: false },
  { key: 'adverts',     label: 'Adverts',      href: '/admin/adverts',      icon: IC.adverts,     end: false },
  { key: 'comments',    label: 'Comments',     href: '/admin/comments',     icon: IC.comments,    end: false },
  { key: 'categories',  label: 'Categories',   href: '/admin/categories',   icon: IC.categories,  end: false },
  { key: 'subscribers', label: 'Subscribers',  href: '/admin/subscribers',  icon: IC.mail,        end: false },
  { key: 'users',       label: 'Users',        href: '/admin/users',        icon: IC.users,       end: false },
  { key: 'settings',    label: 'Settings',     href: '/admin/settings',     icon: IC.settings,    end: false },
];

// ── Category sub-nav ──────────────────────────────────────────────────────────
function CategoryNav({ categories, onNavClick }: { categories: Category[]; onNavClick?: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ entertainment: true, lifestyle: true });
  const sections = ['entertainment', 'lifestyle'];
  const sectionMeta: Record<string, { dot: string; label: string }> = {
    entertainment: { dot: 'bg-violet-500', label: 'Entertainment' },
    lifestyle:     { dot: 'bg-emerald-500', label: 'Lifestyle' },
  };

  return (
    <div className="space-y-0.5">
      {sections.map(s => {
        const cats = categories.filter(c => c.parent === s);
        if (!cats.length) return null;
        const meta = sectionMeta[s];
        return (
          <div key={s}>
            {/* Section header — toggles open/close */}
            <button
              onClick={() => setOpen(p => ({ ...p, [s]: !p[s] }))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                <span className="text-xs font-bold text-gray-400">{meta.label}</span>
                <span className="text-[10px] text-gray-600 font-mono">({cats.length})</span>
              </span>
              <Icon d={open[s] ? IC.chevronDown : IC.chevronRight} className="w-3 h-3 text-gray-600" />
            </button>

            {/* Category links */}
            {open[s] && (
              <div className="ml-4 pl-2.5 border-l border-white/10 space-y-0.5 mb-1.5">
                {cats.map(cat => (
                  <NavLink
                    key={cat._id}
                    to={`/admin/posts?category=${cat.slug}`}
                    onClick={onNavClick}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        isActive
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                      }`
                    }
                  >
                    <span className="truncate">{cat.name}</span>
                    {(cat._count?.posts ?? 0) > 0 && (
                      <span className="flex-shrink-0 text-[10px] bg-white/10 text-gray-400 rounded px-1.5 py-0.5 font-mono leading-none">
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

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({
  onNavClick, pendingComments, categories, user, onLogout, allowedNav,
}: {
  onNavClick?: () => void;
  pendingComments: number;
  categories: Category[];
  user: { name?: string; email?: string; role?: string } | null;
  onLogout: () => void;
  allowedNav: string[];
}) {
  const roleMeta = ROLE_META[(user?.role as Role) ?? 'AUTHOR'];
  const visibleItems = NAV_ITEMS.filter(item => allowedNav.includes(item.key));

  return (
    <div className="flex flex-col h-full bg-[#0d0d1a]">

      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex-shrink-0">
        <Link to="/admin" onClick={onNavClick} className="flex items-center gap-3">
          <img src="/favicon.png" alt="SKG Logo" className="w-11 h-11 object-contain flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-white leading-none">
              Soro<span className="text-[#FF4D6D]">Kwu</span>Gana
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5 font-semibold uppercase tracking-widest">Admin</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="mx-4 mb-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${roleMeta?.bg ?? 'bg-gray-800'}/10 border border-white/5`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${roleMeta?.dot ?? 'bg-gray-500'}`} />
          <span className="text-xs font-bold text-gray-300">{roleMeta?.label ?? user?.role}</span>
          <span className="ml-auto">
            <Icon d={IC.lock} className="w-3 h-3 text-gray-700" />
          </span>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/5 mb-3" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 scrollbar-none">
        {visibleItems.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#6C63FF] to-[#7c3aed] text-white shadow-lg shadow-[#6C63FF]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="flex items-center gap-3">
              <Icon d={item.icon} className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </span>
            {item.key === 'comments' && pendingComments > 0 && (
              <span className="flex-shrink-0 text-[10px] font-black bg-[#FF4D6D] text-white rounded-full w-5 h-5 flex items-center justify-center">
                {pendingComments > 99 ? '99+' : pendingComments}
              </span>
            )}
          </NavLink>
        ))}

        {/* Locked items — shown greyed out for non-admins */}
        {NAV_ITEMS.filter(i => !allowedNav.includes(i.key)).map(item => (
          <div
            key={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm opacity-25 cursor-not-allowed select-none"
            title={`Requires higher privileges`}
          >
            <Icon d={item.icon} className="w-4 h-4 flex-shrink-0 text-gray-600" />
            <span className="text-gray-600">{item.label}</span>
            <Icon d={IC.lock} className="w-3 h-3 text-gray-700 ml-auto" />
          </div>
        ))}

        {/* Category sub-nav — visible for all roles that can see Posts */}
        {allowedNav.includes('posts') && categories.length > 0 && (
          <div className="pt-3">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-700">Browse by Category</span>
              {allowedNav.includes('categories') && (
                <NavLink
                  to="/admin/categories"
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                      isActive ? 'text-[#6C63FF] bg-[#6C63FF]/10' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
                    }`
                  }
                >
                  Manage
                </NavLink>
              )}
            </div>
            <CategoryNav categories={categories} onNavClick={onNavClick} />
          </div>
        )}

        {/* New post CTA removed — use Posts > New Post instead */}
      </nav>

      {/* Profile + logout */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">{user?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer" title="View live site"
            className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/5 flex-shrink-0">
            <Icon d={IC.external} className="w-3.5 h-3.5" />
          </a>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-white hover:bg-white/5 transition-colors font-semibold"
        >
          <Icon d={IC.logout} className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Breadcrumb ─────────────────────────────────────────────────────────────────
function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const labels: Record<string, string> = {
    posts: 'Posts', categories: 'Categories', comments: 'Comments',
    users: 'Users', new: 'New Post', edit: 'Edit', settings: 'Settings',
    subscribers: 'Subscribers', reviews: 'Reviews', adverts: 'Adverts',
  };
  if (!parts.length) {
    return (
      <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        <Icon d={IC.dashboard} className="w-3.5 h-3.5 text-gray-400" />
        Dashboard
      </span>
    );
  }
  return (
    <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
      <Link to="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
        <Icon d={IC.dashboard} className="w-3.5 h-3.5" />
      </Link>
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        const label = labels[part] ?? (part.length === 24 ? '…' : part);
        return (
          <span key={i} className="flex items-center gap-1">
            <Icon d={IC.chevronRight} className="w-3 h-3 text-gray-300" />
            <span className={isLast ? 'font-semibold text-gray-800' : 'text-gray-400'}>{label}</span>
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
  const allowedNav = getAllowedNav(user?.role ?? 'AUTHOR');

  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const sidebarProps = { pendingComments, categories, user, onLogout: handleLogout, allowedNav };

  return (
    <div className="min-h-screen flex bg-gray-50 admin-root">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30 shadow-2xl">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 z-50 lg:hidden flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent {...sidebarProps} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-60">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 h-14 flex items-center justify-between gap-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
              <Icon d={mobileOpen ? IC.close : IC.menu} className="w-5 h-5" />
            </button>
            <Breadcrumb />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {pendingComments > 0 && allowedNav.includes('comments') && (
              <Link to="/admin/comments"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="hidden sm:inline">{pendingComments} pending</span>
                <span className="sm:hidden">{pendingComments}</span>
              </Link>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md"
              title={user?.name}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-gray-400">
          <span>SoroKwuGana Admin &copy; {new Date().getFullYear()}</span>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#6C63FF] transition-colors font-medium">
            <Icon d={IC.external} className="w-3 h-3" />
            View live site
          </a>
        </footer>
      </div>
    </div>
  );
}
