// v2 — All · Approved · Pending tabs, 3-col grid, toggle, stats, view, delete
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComments, useToggleComment, useDeleteComment, useCommentStats } from '../hooks/useStats';
import type { Comment } from '../types';

type Tab = 'all' | 'approved' | 'pending';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  check:    'M5 13l4 4L19 7',
  ban:      'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  trash:    'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  comment:  'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  reply:    'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
  post:     'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  view:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  prev:     'M15 19l-7-7 7-7',
  next:     'M9 5l7 7-7 7',
  users:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending',  label: 'Pending' },
];

// ── Comment Card ──────────────────────────────────────────────────────────────
function CommentCard({
  comment,
  onToggle,
  onDelete,
  toggling,
  deleting,
}: {
  comment: Comment;
  onToggle: (id: string) => void;
  onDelete: (id: string, preview: string) => void;
  toggling: string | null;
  deleting: string | null;
}) {
  const name    = comment.author?.name ?? comment.guestName ?? 'Guest';
  const isReply = !!(comment as { parentId?: string | null }).parentId;
  const post    = comment.post as { title: string; slug: string } | undefined;

  return (
    <div className={`bg-white rounded-xl border flex flex-col transition-shadow hover:shadow-sm ${
      comment.approved ? 'border-gray-200' : 'border-gray-300'
    }`}>
      {/* Thread indicator — left accent bar shows pending vs live */}
      <div className={`w-full h-0.5 rounded-t-xl ${comment.approved ? 'bg-gray-200' : 'bg-gray-400'}`} />

      <div className="px-4 pt-3.5 pb-3 flex-1">
        {/* Author + status */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">
              {name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
                {isReply && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded flex-shrink-0">
                    <Icon d={IC.reply} className="w-2.5 h-2.5" />
                    reply
                  </span>
                )}
                {!comment.author && (
                  <span className="text-[10px] text-gray-400 flex-shrink-0">Guest</span>
                )}
              </div>
              {comment.guestEmail && (
                <p className="text-[10px] text-gray-400 font-mono truncate">{comment.guestEmail}</p>
              )}
            </div>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded border ${
            comment.approved
              ? 'text-gray-600 border-gray-300 bg-gray-50'
              : 'text-gray-700 border-gray-400 bg-gray-100'
          }`}>
            {comment.approved ? 'Live' : 'Pending'}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 line-clamp-4">
          {comment.content}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Icon d={IC.clock} className="w-3 h-3" />
            {timeAgo(comment.createdAt)}
          </span>
          {post?.title && (
            <>
              <span>·</span>
              <Link
                to={`/article/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 truncate max-w-[140px] hover:text-gray-600 transition-colors"
              >
                <Icon d={IC.post} className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{post.title}</span>
                <Icon d={IC.external} className="w-2.5 h-2.5 flex-shrink-0 opacity-50" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-1.5">
        <button
          onClick={() => onToggle(comment._id)}
          disabled={toggling === comment._id}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40"
        >
          {toggling === comment._id
            ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            : <Icon d={comment.approved ? IC.ban : IC.check} className="w-3 h-3" />
          }
          {comment.approved ? 'Unpublish' : 'Approve'}
        </button>

        {post?.slug && (
          <Link
            to={`/article/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Icon d={IC.view} className="w-3 h-3" />
            View
          </Link>
        )}

        <button
          onClick={() => onDelete(comment._id, comment.content.slice(0, 60))}
          disabled={deleting === comment._id}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-40 ml-auto"
        >
          {deleting === comment._id
            ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            : <Icon d={IC.trash} className="w-3 h-3" />
          }
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Main Comments Page ────────────────────────────────────────────────────────
export default function Comments() {
  const [tab, setTab]       = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const approvedParam = tab === 'pending' ? 'false' : tab === 'approved' ? 'true' : undefined;
  const { data, isLoading } = useComments({ page, approved: approvedParam, search: search || undefined });
  const { data: stats } = useCommentStats();
  const toggle = useToggleComment();
  const remove = useDeleteComment();

  const comments: Comment[] = data?.comments ?? [];
  const total: number       = data?.total ?? 0;
  const pages: number       = data?.pages ?? 1;

  const handleToggle = async (id: string) => {
    setToggling(id);
    try { await toggle.mutateAsync(id); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id: string, preview: string) => {
    if (!confirm(`Delete this comment?\n\n"${preview}…"`)) return;
    setDeleting(id);
    try { await remove.mutateAsync(id); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Comments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Moderate reader comments and replies.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: stats?.total    ?? '—', icon: IC.comment },
          { label: 'Live',    value: stats?.approved ?? '—', icon: IC.check },
          { label: 'Pending', value: stats?.pending  ?? '—', icon: IC.clock },
          { label: 'Replies', value: stats?.replies  ?? '—', icon: IC.reply },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon d={icon} className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              {t.key === 'pending' && (stats?.pending ?? 0) > 0 && (
                <span className="ml-1.5 text-[10px] font-black bg-[#FF4D6D] text-white rounded-full px-1.5 py-0.5">
                  {stats?.pending}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <Icon d={IC.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search comments…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] w-60 shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-48">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="h-3.5 bg-gray-200 rounded w-28" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-4">
            <Icon d={IC.comment} className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            {tab === 'pending' ? 'No comments awaiting review.' : tab === 'approved' ? 'No approved comments.' : 'No comments yet.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comments.map(comment => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onToggle={handleToggle}
              onDelete={handleDelete}
              toggling={toggling}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{comments.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Icon d={IC.prev} className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 font-medium">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Icon d={IC.next} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
