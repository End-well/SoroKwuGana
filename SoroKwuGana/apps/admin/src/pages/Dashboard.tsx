import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Posts',  value: '—', sub: 'all time',       icon: '📝', color: 'from-[#6C63FF] to-[#9C64FF]', href: '/admin/posts' },
  { label: 'Published',    value: '—', sub: 'live on site',    icon: '✅', color: 'from-emerald-500 to-teal-500',  href: '/admin/posts' },
  { label: 'Drafts',       value: '—', sub: 'pending review',  icon: '📋', color: 'from-amber-500 to-orange-500',  href: '/admin/posts' },
  { label: 'Comments',     value: '—', sub: 'awaiting review', icon: '💬', color: 'from-[#FF4D6D] to-rose-600',   href: '/admin/comments' },
];

const quickActions = [
  { label: 'New Post',      href: '/admin/posts/new',  icon: '✏️',  color: 'bg-[#6C63FF] hover:bg-[#5a52e0]' },
  { label: 'Add Category',  href: '/admin/categories', icon: '🗂️',  color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'View Comments', href: '/admin/comments',   icon: '💬',  color: 'bg-amber-500 hover:bg-amber-600' },
  { label: 'Manage Users',  href: '/admin/users',      icon: '👥',  color: 'bg-[#FF4D6D] hover:bg-rose-600' },
];

export default function Dashboard() {
  const { user } = useAuth();

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
        {stats.map(stat => (
          <Link key={stat.label} to={stat.href}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-lg mb-4`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(a => (
            <Link key={a.label} to={a.href}
              className={`inline-flex items-center gap-2 ${a.color} text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm`}>
              <span>{a.icon}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent posts table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">Recent Posts</h2>
          <Link to="/admin/posts" className="text-xs font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">
            View all →
          </Link>
        </div>
        <div className="p-6 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No posts yet. <Link to="/admin/posts/new" className="text-[#6C63FF] font-semibold hover:underline">Create your first post →</Link></p>
        </div>
      </div>

      {/* 2-col: categories + comments */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-black text-gray-900">Categories</h2>
            <Link to="/admin/categories" className="text-xs font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">Manage →</Link>
          </div>
          <div className="p-6 text-center text-gray-400">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="text-sm">Connect the backend to see categories.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-black text-gray-900">Pending Comments</h2>
            <Link to="/admin/comments" className="text-xs font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">Review →</Link>
          </div>
          <div className="p-6 text-center text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm">No comments awaiting review.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
