import { useState } from 'react';
import { Link } from 'react-router-dom';

// Category badge colours matching the public site
const catColors: Record<string, string> = {
  movies: 'bg-amber-100 text-amber-700',
  music: 'bg-violet-100 text-violet-700',
  celebrity: 'bg-rose-100 text-rose-700',
  'tv-shows': 'bg-emerald-100 text-emerald-700',
  fashion: 'bg-pink-100 text-pink-700',
  beauty: 'bg-purple-100 text-purple-700',
  health: 'bg-teal-100 text-teal-700',
  travel: 'bg-sky-100 text-sky-700',
  food: 'bg-orange-100 text-orange-700',
};

type FilterStatus = 'all' | 'published' | 'draft';

export default function Posts() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Posts</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Create and manage all blog content.</p>
        </div>
        <Link to="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">
          ✏️ New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search"
            placeholder="Search posts…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
          />
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'published', 'draft'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all capitalize ${status === s ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] text-gray-600">
          <option value="">All categories</option>
          {Object.keys(catColors).map(c => (
            <option key={c} value={c} className="capitalize">{c.replace('-', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Author</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 font-medium">No posts found.</p>
                <p className="text-gray-400 text-xs mt-1">
                  {search ? 'Try a different search term.' : 'Create your first post to get started.'}
                </p>
                {!search && (
                  <Link to="/admin/posts/new"
                    className="mt-4 inline-flex items-center gap-2 text-[#6C63FF] font-semibold text-sm hover:underline">
                    ✏️ Create first post
                  </Link>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing 0 of 0 posts</span>
        <div className="flex gap-1">
          <button disabled className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">← Prev</button>
          <button disabled className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">Next →</button>
        </div>
      </div>
    </div>
  );
}
