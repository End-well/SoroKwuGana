import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStats, useRecentActivity, useCategories } from '../hooks/useStats';

// ── Inline SVG icon helper ─────────────────────────────────────────────────────
function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  posts:    'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  check:    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  draft:    'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  comment:  'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  category: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  edit:     'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  plus:     'M12 4v16m8-8H4',
  arrow:    'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  eye:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  warn:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, iconPath, gradient, href, trend,
}: {
  label: string;
  value: number | string;
  sub: string;
  iconPath: string;
  gradient: string;
  href: string;
  trend?: string;
}) {
  return (
    <Link
      to={href}
      className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${gradient}`} />

      <div className="relative">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-3`}>
          <Icon d={iconPath} className="w-5 h-5 text-white" />
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none">{value ?? '—'}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
          </div>
          {trend && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>

      {/* Hover indicator */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
    </Link>
  );
}

// ── Quick action button ────────────────────────────────────────────────────────
function QuickAction({ label, href, iconPath, gradient, desc }: {
  label: string; href: string; iconPath: string; gradient: string; desc: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon d={iconPath} className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900 group-hover:text-[#6C63FF] transition-colors">{label}</p>
        <p className="text-xs text-gray-400 truncate">{desc}</p>
      </div>
      <Icon d={IC.arrow} className="w-4 h-4 text-gray-300 group-hover:text-[#6C63FF] group-hover:translate-x-0.5 transition-all ml-auto flex-shrink-0" />
    </Link>
  );
}

// ── Greeting based on time ─────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();
  const { data: categories = [] } = useCategories();

  const statCards = [
    {
      label: 'Total Posts', value: stats?.totalPosts ?? '—', sub: 'all articles ever created',
      iconPath: IC.posts, gradient: 'from-[#6C63FF] to-[#9C64FF]', href: '/posts',
    },
    {
      label: 'Published', value: stats?.published ?? '—', sub: 'live & visible on site',
      iconPath: IC.check, gradient: 'from-emerald-500 to-teal-500', href: '/posts?status=published',
    },
    {
      label: 'Drafts', value: stats?.drafts ?? '—', sub: 'saved, not yet live',
      iconPath: IC.draft, gradient: 'from-amber-500 to-orange-400', href: '/posts?status=draft',
    },
    {
      label: 'Pending Comments', value: stats?.pendingComments ?? '—', sub: 'awaiting moderation',
      iconPath: IC.comment, gradient: 'from-[#FF4D6D] to-rose-500', href: '/comments',
      trend: (stats?.pendingComments ?? 0) > 0 ? 'Needs review' : undefined,
    },
    {
      label: 'Users', value: stats?.totalUsers ?? '—', sub: 'registered authors & admins',
      iconPath: IC.users, gradient: 'from-sky-500 to-blue-600', href: '/users',
    },
    {
      label: 'Categories', value: stats?.totalCategories ?? '—', sub: 'topic sections',
      iconPath: IC.category, gradient: 'from-violet-500 to-purple-600', href: '/categories',
    },
  ];

  const quickActions = [
    { label: 'Write New Post',   href: '/posts/new',   iconPath: IC.edit,     gradient: 'from-[#6C63FF] to-[#9C64FF]', desc: 'Start a new article from scratch' },
    { label: 'Manage Categories', href: '/categories', iconPath: IC.category, gradient: 'from-violet-500 to-purple-600', desc: 'Add, edit or delete categories' },
    { label: 'Review Comments',  href: '/comments',    iconPath: IC.comment,  gradient: 'from-amber-500 to-orange-400', desc: 'Moderate reader comments' },
    { label: 'Manage Users',     href: '/users',       iconPath: IC.users,    gradient: 'from-sky-500 to-blue-600',     desc: 'Admins, authors & roles' },
  ];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's what's happening with <span className="font-semibold text-gray-700">SoroKwuGana</span> today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System online
          </span>
          <Link
            to="/posts/new"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-[#6C63FF]/20"
          >
            <Icon d={IC.plus} className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* ── Pending comments alert ── */}
      {(stats?.pendingComments ?? 0) > 0 && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-400/20 flex items-center justify-center">
              <Icon d={IC.warn} className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">
                {stats?.pendingComments} comment{stats?.pendingComments !== 1 ? 's' : ''} waiting for review
              </p>
              <p className="text-xs text-amber-600">Approve or delete comments before they go live on the site.</p>
            </div>
          </div>
          <Link
            to="/comments"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* ── Stats grid ── */}
      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Overview</h2>
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-3" />
                <div className="h-6 bg-gray-200 rounded w-12 mb-1.5" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        )}
      </div>

      {/* ── Main content area: Recent posts + Quick actions ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent posts table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-black text-gray-900">Recent Posts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest articles across all categories</p>
            </div>
            <Link to="/posts" className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">
              View all
              <Icon d={IC.arrow} className="w-3 h-3" />
            </Link>
          </div>

          {recentLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                  </div>
                  <div className="h-5 bg-gray-100 rounded-full w-16" />
                </div>
              ))}
            </div>
          ) : recent?.recentPosts?.length ? (
            <div className="divide-y divide-gray-50">
              {recent.recentPosts.map((post) => {
                const cat = post.category as { name: string; slug: string } | undefined;
                return (
                  <div key={post._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                    {/* Cover thumbnail */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF]/10 to-[#FF4D6D]/10 flex items-center justify-center overflow-hidden">
                      {(post as { coverImage?: string }).coverImage ? (
                        <img
                          src={(post as { coverImage?: string }).coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Icon d={IC.posts} className="w-4 h-4 text-[#6C63FF]/40" />
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/posts/${post._id}/edit`}
                        className="text-sm font-semibold text-gray-900 group-hover:text-[#6C63FF] transition-colors line-clamp-1"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {cat && (
                          <span className="text-xs text-gray-400">{cat.name}</span>
                        )}
                        <span className="text-gray-300 text-xs">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Icon d={IC.clock} className="w-3 h-3" />
                          {formatRelative(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        post.published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <Link
                        to={`/posts/${post._id}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#6C63FF] font-semibold hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-3">
                <Icon d={IC.posts} className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No posts yet</p>
              <Link to="/posts/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#6C63FF] font-bold hover:underline">
                <Icon d={IC.plus} className="w-4 h-4" />
                Write your first post
              </Link>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div>
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map(a => <QuickAction key={a.label} {...a} />)}
            </div>
          </div>

          {/* Category breakdown */}
          {categories.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900">Categories</h3>
                <Link to="/categories" className="text-xs text-[#6C63FF] font-semibold hover:underline">Manage</Link>
              </div>
              <div className="p-3 space-y-1">
                {categories.slice(0, 8).map(cat => (
                  <Link
                    key={cat._id}
                    to={`/posts?category=${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        cat.parent === 'entertainment' ? 'bg-violet-500' : 'bg-emerald-500'
                      }`} />
                      <span className="text-sm text-gray-700 group-hover:text-[#6C63FF] transition-colors truncate font-medium">
                        {cat.name}
                      </span>
                    </div>
                    <span className="flex-shrink-0 text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded-md">
                      {cat._count?.posts ?? 0}
                    </span>
                  </Link>
                ))}
                {categories.length > 8 && (
                  <Link to="/categories" className="block text-center text-xs text-gray-400 hover:text-[#6C63FF] py-1.5 transition-colors">
                    +{categories.length - 8} more categories
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Site info */}
          <div className="bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] rounded-2xl p-5 text-white">
            <h3 className="text-sm font-black mb-1">Live Site</h3>
            <p className="text-xs text-white/70 mb-4">View how your published content looks to readers.</p>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              <Icon d={IC.eye} className="w-4 h-4" />
              Open Frontend
              <Icon d={IC.external} className="w-3 h-3 ml-auto" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Category post breakdown table ── */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-black text-gray-900">Content by Category</h2>
              <p className="text-xs text-gray-400 mt-0.5">Published post count per section</p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">
              Manage →
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {categories.map(cat => {
                const max = Math.max(...categories.map(c => c._count?.posts ?? 0), 1);
                const pct = ((cat._count?.posts ?? 0) / max) * 100;
                return (
                  <div key={cat._id} className="flex items-center gap-4">
                    <div className="w-24 text-right flex-shrink-0">
                      <Link
                        to={`/posts?category=${cat.slug}`}
                        className="text-xs font-semibold text-gray-600 hover:text-[#6C63FF] transition-colors truncate block"
                      >
                        {cat.name}
                      </Link>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          cat.parent === 'entertainment'
                            ? 'bg-gradient-to-r from-violet-500 to-purple-400'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs font-mono text-gray-400 flex-shrink-0 text-right">
                      {cat._count?.posts ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
