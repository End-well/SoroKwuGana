import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStats, useRecentActivity, useCategories } from '../hooks/useStats';

// ── Icon primitive ─────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
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
  arrow:    'M17 8l4 4m0 0l-4 4m4-4H3',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  eye:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  warn:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  spark:    'M13 10V3L4 14h7v7l9-11h-7z',
  chart:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconPath, color, href, alert }: {
  label: string;
  value: number | string;
  sub: string;
  iconPath: string;
  color: { bg: string; icon: string; ring: string; text: string };
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      to={href}
      className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Subtle corner accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] opacity-[0.06] ${color.bg}`} />

      <div className="relative flex flex-col gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.ring} flex items-center justify-center flex-shrink-0`}>
          <Icon d={iconPath} className={`w-5 h-5 ${color.icon}`} />
        </div>

        {/* Value + alert dot */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={`text-3xl font-black leading-none tracking-tight ${alert ? 'text-rose-600' : 'text-gray-900'}`}>
              {value ?? '—'}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-1.5 leading-tight">{label}</p>
          </div>
          {alert && (
            <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </div>

        <p className="text-xs text-gray-400 leading-tight">{sub}</p>
      </div>

      {/* Bottom hover bar */}
      <div className={`absolute bottom-0 left-0 w-full h-[2px] ${color.bg} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </Link>
  );
}

// ── Activity Item ──────────────────────────────────────────────────────────────
function ActivityItem({ type, title, meta, time, href }: {
  type: 'post' | 'comment';
  title: string;
  meta: string;
  time: string;
  href: string;
}) {
  return (
    <Link to={href} className="flex items-start gap-3.5 py-3 group hover:bg-gray-50 px-4 -mx-4 rounded-xl transition-colors">
      <div className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
        type === 'post'
          ? 'bg-violet-100 text-violet-600'
          : 'bg-amber-100 text-amber-600'
      }`}>
        <Icon d={type === 'post' ? IC.edit : IC.comment} className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-[#6C63FF] line-clamp-1 transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{meta}</p>
      </div>
      <span className="flex-shrink-0 text-xs text-gray-400 mt-0.5 whitespace-nowrap">{time}</span>
    </Link>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ icon, title, action, actionHref }: {
  icon: string; title: string; action: string; actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
        <Icon d={icon} className="w-6 h-6 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-500 mb-3">{title}</p>
      <Link to={actionHref}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] px-4 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm">
        <Icon d={IC.plus} className="w-3.5 h-3.5" />
        {action}
      </Link>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();
  const { data: categories = [] } = useCategories();

  const totalActivity = (recent?.recentPosts?.length ?? 0) + (recent?.recentComments?.length ?? 0);

  const statCards = [
    {
      label: 'Total Posts',
      value: stats?.totalPosts ?? '—',
      sub: 'All articles ever written',
      iconPath: IC.posts,
      color: { bg: 'bg-violet-500', icon: 'text-white', ring: 'ring-2 ring-violet-100', text: 'text-violet-600' },
      href: '/admin/posts',
    },
    {
      label: 'Published',
      value: stats?.published ?? '—',
      sub: 'Live & visible to readers',
      iconPath: IC.check,
      color: { bg: 'bg-emerald-500', icon: 'text-white', ring: 'ring-2 ring-emerald-100', text: 'text-emerald-600' },
      href: '/admin/posts?status=published',
    },
    {
      label: 'Drafts',
      value: stats?.drafts ?? '—',
      sub: 'Saved but not published',
      iconPath: IC.draft,
      color: { bg: 'bg-amber-400', icon: 'text-white', ring: 'ring-2 ring-amber-100', text: 'text-amber-600' },
      href: '/admin/posts?status=draft',
    },
    {
      label: 'Pending',
      value: stats?.pendingComments ?? '—',
      sub: 'Comments awaiting review',
      iconPath: IC.comment,
      color: { bg: 'bg-rose-500', icon: 'text-white', ring: 'ring-2 ring-rose-100', text: 'text-rose-600' },
      href: '/admin/comments',
      alert: (stats?.pendingComments ?? 0) > 0,
    },
    {
      label: 'Users',
      value: stats?.totalUsers ?? '—',
      sub: 'Authors, admins & editors',
      iconPath: IC.users,
      color: { bg: 'bg-sky-500', icon: 'text-white', ring: 'ring-2 ring-sky-100', text: 'text-sky-600' },
      href: '/admin/users',
    },
    {
      label: 'Categories',
      value: stats?.totalCategories ?? '—',
      sub: 'Content topic sections',
      iconPath: IC.category,
      color: { bg: 'bg-fuchsia-500', icon: 'text-white', ring: 'ring-2 ring-fuchsia-100', text: 'text-fuchsia-600' },
      href: '/admin/categories',
    },
  ];

  return (
    <div className="space-y-7">

      {/* ── Hero Welcome Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1040] via-[#2d1b69] to-[#1a1040] px-7 py-7">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-[#6C63FF]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 left-20 w-40 h-40 rounded-full bg-[#FF4D6D]/20 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems live
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent">
                {user?.name?.split(' ')[0] ?? 'Admin'}
              </span>{' '}
              👋
            </h1>
            <p className="text-sm text-white/50 mt-1.5">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/admin/posts/new"
              className="inline-flex items-center gap-2 bg-white text-[#2d1b69] font-black text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
            >
              <Icon d={IC.edit} className="w-4 h-4" />
              Write a Post
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
            >
              <Icon d={IC.eye} className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </a>
          </div>
        </div>

        {/* Mini stat pills */}
        <div className="relative mt-6 flex flex-wrap gap-2">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-7 w-28 bg-white/10 rounded-full animate-pulse" />
            ))
          ) : (
            <>
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80">
                <Icon d={IC.check} className="w-3.5 h-3.5 text-emerald-400" />
                {stats?.published ?? 0} published
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80">
                <Icon d={IC.draft} className="w-3.5 h-3.5 text-amber-400" />
                {stats?.drafts ?? 0} drafts
              </div>
              {(stats?.pendingComments ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-400/30 px-3 py-1.5 rounded-full text-xs font-semibold text-rose-300">
                  <Icon d={IC.warn} className="w-3.5 h-3.5" />
                  {stats?.pendingComments} need review
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80">
                <Icon d={IC.chart} className="w-3.5 h-3.5 text-violet-400" />
                {stats?.totalPosts ?? 0} total posts
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Pending comments alert ──────────────────────────────────────────── */}
      {(stats?.pendingComments ?? 0) > 0 && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Icon d={IC.warn} className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {stats?.pendingComments} comment{stats?.pendingComments !== 1 ? 's' : ''} waiting for approval
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Review and approve before they appear on the site.</p>
            </div>
          </div>
          <Link
            to="/admin/comments"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            Review Now →
          </Link>
        </div>
      )}

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <section aria-label="Statistics">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Icon d={IC.chart} className="w-3.5 h-3.5" />
            Overview
          </h2>
          <Link to="/admin/posts" className="text-xs text-[#6C63FF] font-semibold hover:underline">
            All posts →
          </Link>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse h-32">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
                <div className="h-7 bg-gray-200 rounded-lg w-10 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {statCards.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        )}
      </section>

      {/* ── Main content: Recent posts + sidebar ────────────────────────────── */}
      <div className="grid xl:grid-cols-3 gap-5">

        {/* Recent posts */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-black text-gray-900">Recent Posts</h2>
              <p className="text-xs text-gray-400 mt-0.5">Your latest articles</p>
            </div>
            <Link to="/admin/posts" className="inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">
              View all <Icon d={IC.arrow} className="w-3 h-3" />
            </Link>
          </div>

          {recentLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-20 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : recent?.recentPosts?.length ? (
            <div className="divide-y divide-gray-50">
              {recent.recentPosts.map(post => {
                const cat = post.category as { name: string; slug: string } | undefined;
                return (
                  <div key={post._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors group">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-100 to-fuchsia-100">
                      {(post as { coverImage?: string }).coverImage ? (
                        <img
                          src={(post as { coverImage?: string }).coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon d={IC.posts} className="w-5 h-5 text-violet-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/admin/posts/${post._id}/edit`}
                        className="text-sm font-semibold text-gray-900 group-hover:text-[#6C63FF] transition-colors line-clamp-1 block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {cat && (
                          <span className="text-xs font-medium text-gray-400">{cat.name}</span>
                        )}
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Icon d={IC.clock} className="w-3 h-3" />
                          {formatRelative(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status + edit */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`hidden sm:inline-flex text-xs font-bold px-2.5 py-1 rounded-full ${
                        post.published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {post.published ? 'Live' : 'Draft'}
                      </span>
                      <Link
                        to={`/admin/posts/${post._id}/edit`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 px-2.5 py-1 rounded-lg"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={IC.posts}
              title="No posts yet — start writing!"
              action="Write first post"
              actionHref="/admin/posts/new"
            />
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: 'Write New Post',     href: '/admin/posts/new',  icon: IC.edit,     color: 'bg-violet-500', desc: 'Create a new article' },
                { label: 'Manage Categories',  href: '/admin/categories', icon: IC.category, color: 'bg-fuchsia-500', desc: 'Add or edit sections' },
                { label: 'Review Comments',    href: '/admin/comments',   icon: IC.comment,  color: 'bg-amber-400',  desc: 'Moderate reader comments' },
                { label: 'Manage Users',       href: '/admin/users',      icon: IC.users,    color: 'bg-sky-500',    desc: 'Authors & permissions' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon d={item.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[#6C63FF] transition-colors">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <Icon d={IC.arrow} className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6C63FF] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-gray-900">Recent Activity</h2>
              {totalActivity > 0 && (
                <span className="text-xs font-bold bg-[#6C63FF]/10 text-[#6C63FF] px-2 py-0.5 rounded-full">
                  {totalActivity}
                </span>
              )}
            </div>
            <div className="p-4 overflow-y-auto max-h-64">
              {recentLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-100 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-50 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : totalActivity === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No recent activity.</p>
              ) : (
                <div className="space-y-0.5">
                  {recent?.recentPosts?.slice(0, 3).map(post => (
                    <ActivityItem
                      key={post._id}
                      type="post"
                      title={post.title}
                      meta={post.published ? 'Published' : 'Saved as draft'}
                      time={formatRelative(post.createdAt)}
                      href={`/admin/posts/${post._id}/edit`}
                    />
                  ))}
                  {recent?.recentComments?.slice(0, 3).map(comment => (
                    <ActivityItem
                      key={comment._id}
                      type="comment"
                      title={(comment as { content: string }).content?.slice(0, 60) + '…'}
                      meta="Pending approval"
                      time={formatRelative((comment as { createdAt: string }).createdAt)}
                      href="/admin/comments"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content by Category ─────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-black text-gray-900">Content by Category</h2>
              <p className="text-xs text-gray-400 mt-0.5">Published post distribution</p>
            </div>
            <Link to="/admin/categories" className="text-xs font-bold text-[#6C63FF] hover:underline">Manage →</Link>
          </div>

          <div className="p-6">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {categories.map(cat => {
                const max = Math.max(...categories.map(c => c._count?.posts ?? 0), 1);
                const pct = ((cat._count?.posts ?? 0) / max) * 100;
                const isEnt = cat.parent === 'entertainment';
                return (
                  <Link
                    key={cat._id}
                    to={`/admin/posts?category=${cat.slug}`}
                    className="group flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isEnt ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-[#6C63FF] transition-colors w-20 flex-shrink-0 truncate">
                      {cat.name}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isEnt ? 'bg-gradient-to-r from-violet-500 to-fuchsia-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-gray-400 flex-shrink-0 w-5 text-right">
                      {cat._count?.posts ?? 0}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Section legend */}
            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                Entertainment
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Lifestyle
              </div>
              <span className="ml-auto text-xs text-gray-400">{categories.length} categories total</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Today's date stamp ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 pb-2">
        <span>Last refreshed: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
        <Link to="/admin/posts/new" className="text-[#6C63FF] font-semibold hover:underline flex items-center gap-1">
          <Icon d={IC.spark} className="w-3.5 h-3.5" />
          Start writing
        </Link>
      </div>

    </div>
  );
}
