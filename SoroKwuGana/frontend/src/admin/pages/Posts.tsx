import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminPosts, useDeletePost, useCategories } from '../hooks/useStats';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

type FilterStatus = 'all' | 'published' | 'draft';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  plus:    'M12 4v16m8-8H4',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  post:    'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  prev:    'M15 19l-7-7 7-7',
  next:    'M9 5l7 7-7 7',
  mail:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

const CAT_COLORS: Record<string, string> = {
  movies:    'bg-amber-100 text-amber-700',
  music:     'bg-violet-100 text-violet-700',
  celebrity: 'bg-rose-100 text-rose-700',
  'tv-shows':'bg-emerald-100 text-emerald-700',
  fashion:   'bg-pink-100 text-pink-700',
  beauty:    'bg-purple-100 text-purple-700',
  health:    'bg-teal-100 text-teal-700',
  travel:    'bg-sky-100 text-sky-700',
  food:      'bg-orange-100 text-orange-700',
  reviews:   'bg-indigo-100 text-indigo-700',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Posts() {
  const { can } = useAuth();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState<FilterStatus>('all');
  const [catSlug, setCat]       = useState<string>('');
  const [page, setPage]         = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sending, setSending]   = useState<string | null>(null);
  const [sendMsg, setSendMsg]   = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  const { data, isLoading } = useAdminPosts({
    page,
    status: status === 'all' ? undefined : status,
    search: search || undefined,
    category: catSlug || undefined,
  });

  const deletePost = useDeletePost();
  const posts: Post[]  = data?.posts ?? [];
  const total: number  = data?.total ?? 0;
  const pages: number  = data?.pages ?? 1;
  const canDelete = can('ADMIN');

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await deletePost.mutateAsync(id); }
    finally { setDeleting(null); }
  };

  const handleSendNewsletter = async (id: string, title: string) => {
    if (!confirm(`Send "${title}" to all newsletter subscribers?`)) return;
    setSending(id);
    setSendMsg(null);
    try {
      const res = await fetch(`/api/newsletter/send/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });
      const json = await res.json();
      if (json.smtpConfigured === false) {
        setSendMsg({ id, text: 'SMTP not configured — set up in Subscribers page.', ok: false });
      } else {
        setSendMsg({ id, text: json.message ?? 'Sent!', ok: res.ok });
      }
    } catch {
      setSendMsg({ id, text: 'Failed. Check SMTP in Subscribers page.', ok: false });
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {can('ADMIN') ? 'Manage all blog content.' : 'Manage your own posts.'}
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity"
        >
          <Icon d={IC.plus} className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Search + status */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Icon d={IC.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search posts…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['all', 'published', 'draft'] as FilterStatus[]).map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all capitalize ${
                  status === s ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category toggles */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => { setCat(''); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              catSlug === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => { setCat(cat.slug === catSlug ? '' : cat.slug); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                catSlug === cat.slug
                  ? `${CAT_COLORS[cat.slug] ?? 'bg-gray-100 text-gray-700'} border-transparent`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {cat.name}
              {(cat._count?.posts ?? 0) > 0 && (
                <span className="ml-1 opacity-60 font-mono">{cat._count?.posts}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Author</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden xl:table-cell">Date</th>
              <th className="px-5 py-3.5 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-lg w-3/4 mb-1.5" /><div className="h-3 bg-gray-50 rounded w-16" /></td>
                  <td className="px-4 py-4 hidden md:table-cell"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded-lg w-24" /></td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                  <td className="px-4 py-4 hidden xl:table-cell"><div className="h-4 bg-gray-100 rounded-lg w-20" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-4">
                    <Icon d={IC.post} className="w-7 h-7 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-3">
                    {search ? 'No posts match your search.' : 'No posts yet.'}
                  </p>
                  {!search && (
                    <Link to="/admin/posts/new"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                      <Icon d={IC.plus} className="w-3.5 h-3.5" />
                      Write first post
                    </Link>
                  )}
                </td>
              </tr>
            ) : posts.map(post => (
              <tr key={post._id} className="hover:bg-gray-50/70 transition-colors group">
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#6C63FF] transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Icon d={IC.eye} className="w-3 h-3" />
                    {post.views} views
                  </p>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CAT_COLORS[post.category?.slug] ?? 'bg-gray-100 text-gray-600'}`}>
                    {post.category?.name}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden lg:table-cell">
                  {post.author?.name}
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {post.published ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400 hidden xl:table-cell">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/posts/${post._id}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Icon d={IC.edit} className="w-3 h-3" />
                      Edit
                    </Link>
                    {post.published && (
                      <button
                        onClick={() => handleSendNewsletter(post._id, post.title)}
                        disabled={sending === post._id}
                        className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                        title="Send to subscribers"
                      >
                        {sending === post._id
                          ? <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" />
                          : <Icon d={IC.mail} className="w-3 h-3" />
                        }
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(post._id, post.title)}
                        disabled={deleting === post._id}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                      >
                        {deleting === post._id
                          ? <span className="w-3 h-3 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                          : <Icon d={IC.trash} className="w-3 h-3" />
                        }
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                  {sendMsg?.id === post._id && (
                    <p className={`mt-1.5 text-xs font-medium ${sendMsg.ok ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {sendMsg.text}
                      {!sendMsg.ok && (
                        <Link to="/admin/subscribers" className="ml-1 underline text-[#6C63FF]">Setup →</Link>
                      )}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{posts.length}</span> of <span className="font-semibold text-gray-700">{total}</span> posts
        </p>
        {pages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon d={IC.prev} className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                  page === p
                    ? 'bg-[#6C63FF] text-white shadow-sm'
                    : 'border border-gray-200 text-gray-600 hover:border-[#6C63FF] hover:text-[#6C63FF]'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Icon d={IC.next} className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
