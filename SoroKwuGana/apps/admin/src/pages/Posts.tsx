import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminPosts, useDeletePost } from '../hooks/useStats';
import type { Post } from '../types';

type FilterStatus = 'all' | 'published' | 'draft';

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Posts() {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState<FilterStatus>('all');
  const [page, setPage]       = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isLoading } = useAdminPosts({
    page,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
  });

  const deletePost = useDeletePost();
  const posts: Post[] = data?.posts ?? [];
  const total: number = data?.total ?? 0;
  const pages: number = data?.pages ?? 1;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deletePost.mutateAsync(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Posts</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Create and manage all blog content.</p>
        </div>
        <Link to="/posts/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">
          ✏️ New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="search" placeholder="Search posts…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'published', 'draft'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all capitalize ${status === s ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>
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
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                  <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-6 py-4" />
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 font-medium">No posts found.</p>
                  {!search && <Link to="/posts/new" className="mt-3 inline-flex text-[#6C63FF] font-semibold text-sm hover:underline">✏️ Create first post</Link>}
                </td>
              </tr>
            ) : posts.map(post => (
              <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 line-clamp-1">{post.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{post.views} views</div>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColors[post.category?.slug] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category?.name}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  {post.author?.name}
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/posts/${post._id}/edit`}
                      className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a52e0] px-3 py-1.5 rounded-lg hover:bg-[#6C63FF]/10 transition-colors">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(post._id, post.title)}
                      disabled={deleting === post._id}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-40">
                      {deleting === post._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {posts.length} of {total} posts</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            ← Prev
          </button>
          <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
