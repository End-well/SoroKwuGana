import { useState } from 'react';
import { useComments, useApproveComment, useDeleteComment } from '../hooks/useStats';
import type { Comment } from '../types';

type Tab = 'pending' | 'approved' | 'all';

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Comments() {
  const [tab, setTab]       = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const approvedParam = tab === 'pending' ? 'false' : tab === 'approved' ? 'true' : undefined;

  const { data, isLoading } = useComments({ page, approved: approvedParam, search: search || undefined });
  const approve = useApproveComment();
  const remove  = useDeleteComment();

  const comments: Comment[] = data?.comments ?? [];
  const total: number       = data?.total ?? 0;
  const pages: number       = data?.pages ?? 1;

  const handleApprove = (id: string) => approve.mutate(id);
  const handleDelete  = async (id: string, preview: string) => {
    if (!confirm(`Delete comment "${preview}"?`)) return;
    remove.mutate(id);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'all',      label: 'All' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Comments</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Moderate reader comments before they go live.</p>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="search" placeholder="Search comments…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] w-56" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))
        ) : comments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <p className="text-5xl mb-3">💬</p>
            <p className="text-gray-500 font-medium">
              {tab === 'pending' ? 'No comments awaiting review.' : `No ${tab} comments.`}
            </p>
          </div>
        ) : comments.map(comment => (
          <div key={comment._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Author info */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(comment.author?.name ?? comment.guestName ?? 'G')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.author?.name ?? comment.guestName ?? 'Guest'}
                  </span>
                  {comment.guestEmail && (
                    <span className="text-xs text-gray-400">({comment.guestEmail})</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{timeAgo(comment.createdAt)}</span>
                </div>

                {/* Comment content */}
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.content}</p>

                {/* Post link */}
                <p className="text-xs text-gray-400">
                  On: <span className="font-medium text-gray-600">{(comment.post as { title: string })?.title ?? 'Unknown post'}</span>
                </p>
              </div>

              {/* Status badge */}
              <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${comment.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {comment.approved ? 'Approved' : 'Pending'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              {!comment.approved && (
                <button onClick={() => handleApprove(comment._id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                  ✓ Approve
                </button>
              )}
              <button onClick={() => handleDelete(comment._id, comment.content.slice(0, 40))}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {comments.length} of {total}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Prev</button>
            <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
