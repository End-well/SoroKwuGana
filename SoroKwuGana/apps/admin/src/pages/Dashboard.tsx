import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStats, useRecentActivity } from '../hooks/useStats';

function StatCard({ label, value, sub, icon, color, href }: {
  label: string; value: number | string; sub: string;
  icon: string; color: string; href: string;
}) {
  return (
    <Link to={href} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-lg mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recent, isLoading: recentLoading } = useRecentActivity();

  const statCards = [
    { label: 'Total Posts',  value: stats?.totalPosts     ?? '—', sub: 'all time',        icon: '📝', color: 'from-[#6C63FF] to-[#9C64FF]', href: '/posts' },
    { label: 'Published',    value: stats?.published      ?? '—', sub: 'live on site',     icon: '✅', color: 'from-emerald-500 to-teal-500',  href: '/posts?status=published' },
    { label: 'Drafts',       value: stats?.drafts         ?? '—', sub: 'pending review',   icon: '📋', color: 'from-amber-500 to-orange-500',  href: '/posts?status=draft' },
    { label: 'Comments',     value: stats?.pendingComments ?? '—', sub: 'awaiting review', icon: '💬', color: 'from-[#FF4D6D] to-rose-600',    href: '/comments' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-gray-700">{user?.name}</span> 👋</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System online
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
                <div className="h-7 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))
          : statCards.map(s => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'New Post',      href: '/posts/new',   icon: '✏️',  color: 'bg-[#6C63FF] hover:bg-[#5a52e0]' },
            { label: 'Add Category',  href: '/categories',  icon: '🗂️',  color: 'bg-emerald-600 hover:bg-emerald-700' },
            { label: 'View Comments', href: '/comments',    icon: '💬',  color: 'bg-amber-500 hover:bg-amber-600' },
            { label: 'Manage Users',  href: '/users',       icon: '👥',  color: 'bg-[#FF4D6D] hover:bg-rose-600' },
          ].map(a => (
            <Link key={a.label} to={a.href}
              className={`inline-flex items-center gap-2 ${a.color} text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm`}>
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">Recent Posts</h2>
          <Link to="/posts" className="text-xs font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">View all →</Link>
        </div>

        {recentLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="h-4 bg-gray-100 rounded flex-1" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : recent?.recentPosts?.length ? (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {recent.recentPosts.map(post => (
                <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link to={`/posts/${post._id}/edit`} className="font-semibold text-gray-900 hover:text-[#6C63FF] transition-colors line-clamp-1">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500 capitalize">{(post.category as { name: string })?.name}</span>
                  </td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full font-semibold ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/posts/${post._id}/edit`} className="text-xs text-[#6C63FF] font-semibold hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm">No posts yet. <Link to="/posts/new" className="text-[#6C63FF] font-semibold hover:underline">Create your first post →</Link></p>
          </div>
        )}
      </div>

      {/* Pending comments */}
      {(stats?.pendingComments ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-sm font-bold text-amber-800">{stats?.pendingComments} comment{stats?.pendingComments !== 1 ? 's' : ''} awaiting review</p>
              <p className="text-xs text-amber-600">Approve or delete reader comments before they go live.</p>
            </div>
          </div>
          <Link to="/comments" className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
}
