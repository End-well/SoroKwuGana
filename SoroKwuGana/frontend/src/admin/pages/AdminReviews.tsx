import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminPosts, useDeletePost } from '../hooks/useStats';
import { useAuth } from '../context/AuthContext';
import type { Post } from '../types';

// Reviews category ID — matches what was seeded
const REVIEWS_SLUG = 'reviews';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  star:    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  plus:    'M12 4v16m8-8H4',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  prev:    'M15 19l-7-7 7-7',
  next:    'M9 5l7 7-7 7',
  external:'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};

function ScoreBadge({ score }: { score?: number | null }) {
  if (!score) return <span className="text-xs text-gray-400">—</span>;
  const col = score >= 8 ? 'bg-emerald-100 text-emerald-700' : score >= 6 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${col}`}>
      <Icon d={IC.star} className="w-3 h-3" />
      {score}/10
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

type ScoreFilter = 'all' | 'rated' | 'unrated' | 'high' | 'mid' | 'low';

export default function AdminReviews() {
  const { can } = useAuth();
  const [search, setSearch]       = useState('');
  const [scoreFilter, setScore]   = useState<ScoreFilter>('all');
  const [page, setPage]           = useState(1);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const { data, isLoading } = useAdminPosts({
    page,
    category: REVIEWS_SLUG,
    search: search || undefined,
  });

  const deletePost = useDeletePost();
  const allPosts: Post[] = data?.posts ?? [];
  const total: number    = data?.total ?? 0;
  const pages: number    = data?.pages ?? 1;
  const canDelete = can('ADMIN');

  // Client-side score filter
  const posts = allPosts.filter(p => {
    const score = (p as { rating?: number | null }).rating;
    if (scoreFilter === 'rated')   return !!score;
    if (scoreFilter === 'unrated') return !score;
    if (scoreFilter === 'high')    return score && score >= 8;
    if (scoreFilter === 'mid')     return score && score >= 5 && score < 8;
    if (scoreFilter === 'low')     return score && score < 5;
    return true;
  });

  // Stats
  const rated   = allPosts.filter(p => !!(p as { rating?: number | null }).rating).length;
  const unrated = allPosts.length - rated;
  const avgScore = rated > 0
    ? (allPosts.reduce((s, p) => s + ((p as { rating?: number | null }).rating ?? 0), 0) / rated).toFixed(1)
    : '—';

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await deletePost.mutateAsync(id); }
    finally { setDeleting(null); }
  };

  const SCORE_FILTERS: { key: ScoreFilter; label: string }[] = [
    { key: 'all',     label: 'All' },
    { key: 'rated',   label: 'Rated' },
    { key: 'unrated', label: 'Unrated' },
    { key: 'high',    label: '★ 8–10' },
    { key: 'mid',     label: '★ 5–7' },
    { key: 'low',     label: '★ 1–4' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">All posts in the Reviews category.</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity"
        >
          <Icon d={IC.plus} className="w-4 h-4" />
          New Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Reviews', value: total },
          { label: 'Rated',         value: rated },
          { label: 'Avg Score',     value: avgScore },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Icon d={IC.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search reviews…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SCORE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setScore(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                scoreFilter === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {f.label}
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
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Score</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th className="px-5 py-3.5 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 bg-gray-100 rounded w-16" /></td>
                  <td className="px-4 py-4 hidden md:table-cell"><div className="h-5 bg-gray-100 rounded w-14" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-5 py-4" />
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Icon d={IC.star} className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No reviews found.</p>
                  <Link to="/admin/posts/new" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF] hover:underline">
                    <Icon d={IC.plus} className="w-3.5 h-3.5" />
                    Write a Review
                  </Link>
                </td>
              </tr>
            ) : posts.map(post => {
              const score = (post as { rating?: number | null }).rating;
              return (
                <tr key={post._id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#6C63FF] transition-colors">{post.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Icon d={IC.eye} className="w-3 h-3" />{post.views} views
                      </p>
                      <a href={`/article/${post.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-[#6C63FF] flex items-center gap-0.5">
                        <Icon d={IC.external} className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <ScoreBadge score={score} />
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {post.published ? 'Live' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">{formatDate(post.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/admin/posts/${post._id}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-3 py-1.5 rounded-lg transition-colors">
                        <Icon d={IC.edit} className="w-3 h-3" />
                        Edit
                      </Link>
                      {canDelete && (
                        <button onClick={() => handleDelete(post._id, post.title)} disabled={deleting === post._id}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                          {deleting === post._id
                            ? <span className="w-3 h-3 border border-rose-400 border-t-transparent rounded-full animate-spin" />
                            : <Icon d={IC.trash} className="w-3 h-3" />
                          }
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{posts.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 transition-colors">
              <Icon d={IC.prev} className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 transition-colors">
              <Icon d={IC.next} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
