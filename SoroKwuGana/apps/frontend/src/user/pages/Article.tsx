import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { formatDate, formatViews } from '../lib/utils';
import type { Post } from '../types/post';
import ArticleCard from '../components/ui/ArticleCard';
import CategoryBadge from '../components/ui/CategoryBadge';
import SkeletonCard from '../components/ui/SkeletonCard';

// ── Types ─────────────────────────────────────────────────────────────────────
interface IComment {
  _id: string;
  content: string;
  guestName?: string;
  author?: { name: string; avatar?: string };
  createdAt: string;
  _pending?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getYouTubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function verdictLabel(score: number) {
  if (score >= 9) return 'Masterpiece';
  if (score >= 8) return 'Must Watch';
  if (score >= 7) return 'Great';
  if (score >= 6) return 'Good';
  if (score >= 5) return 'Average';
  if (score >= 4) return 'Mixed';
  return 'Poor';
}

function verdictColor(score: number) {
  if (score >= 7) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' };
  if (score >= 5) return { bg: 'bg-amber-100 dark:bg-amber-900/30',     text: 'text-amber-700 dark:text-amber-400' };
  return               { bg: 'bg-red-100 dark:bg-red-900/30',           text: 'text-red-700 dark:text-red-400' };
}

// ── Data hooks ────────────────────────────────────────────────────────────────
function usePost(slug: string) {
  return useQuery<Post>({
    queryKey: ['post', slug],
    queryFn: () => api.get(`/posts/${slug}`).then(r => r.data),
    enabled: !!slug,
    retry: false,
  });
}

function useRelated(categorySlug: string, excludeId: string) {
  return useQuery({
    queryKey: ['posts', { category: categorySlug, limit: 3 }],
    queryFn: () => api.get('/posts', { params: { category: categorySlug, limit: 4 } }).then(r => r.data),
    enabled: !!categorySlug,
    select: (data: { posts: Post[] }) => data.posts.filter(p => p._id !== excludeId).slice(0, 3),
  });
}

function useComments(postId: string) {
  return useQuery<{ comments: IComment[]; total: number }>({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/comments/post/${postId}`).then(r => r.data),
    enabled: !!postId,
    staleTime: 30_000,
  });
}

// ── Star display row ──────────────────────────────────────────────────────────
function StarDisplay({ score, max = 10, size = 'sm' }: { score: number; max?: number; size?: 'sm' | 'md' | 'lg' }) {
  const filled = Math.round((score / max) * 5);
  const px = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${px} ${i < filled ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  const labels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${n} star${n !== 1 ? 's' : ''}`}
          >
            <svg
              className={`w-10 h-10 transition-colors ${n <= active ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
              fill="currentColor" viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </button>
        ))}
      </div>
      <p className={`text-sm font-bold transition-colors ${active > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
        {active > 0 ? labels[active] : 'Tap to rate'}
      </p>
    </div>
  );
}

// ── Rating Modal (scroll-triggered) ──────────────────────────────────────────
function RatingModal({
  postId,
  postTitle,
  existingUserAvg,
  existingUserCount,
  onClose,
}: {
  postId: string;
  postTitle: string;
  existingUserAvg?: number | null;
  existingUserCount?: number;
  onClose: () => void;
}) {
  const ratedKey = `rated_${postId}`;
  const alreadyRated = localStorage.getItem(ratedKey) === '1';

  const [stars, setStars]         = useState(0);
  const [submitting, setSubmit]   = useState(false);
  const [done, setDone]           = useState(false);
  const [newAvg, setNewAvg]       = useState<number | null>(null);
  const [newCount, setNewCount]   = useState<number | null>(null);
  const [visible, setVisible]     = useState(false);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const submit = async () => {
    if (!stars) return;
    setSubmit(true);
    try {
      // 5 stars = 10, 4 = 8, 3 = 6, 2 = 4, 1 = 2
      const score = stars * 2;
      const { data } = await api.post(`/posts/${postId}/rate`, { score });
      setNewAvg(data.userRatingAvg);
      setNewCount(data.userRatingCount);
      localStorage.setItem(ratedKey, '1');
      setDone(true);
    } catch {
      // silent — dismiss anyway
      dismiss();
    } finally {
      setSubmit(false);
    }
  };

  const displayAvg = newAvg ?? existingUserAvg;
  const displayCount = newCount ?? existingUserCount ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal — slides up from bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Rate this story"
      >
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl shadow-black/20 px-6 pt-5 pb-8">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />

          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {alreadyRated || done ? (
            /* ── Thank you state ── */
            <div className="text-center py-4">
              <div className="text-4xl mb-3">{done ? '🎉' : '✅'}</div>
              <h3 className="font-display font-black text-xl text-gray-900 dark:text-white mb-1">
                {done ? 'Thanks for rating!' : 'Already rated'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {done ? 'Your rating has been added to the story.' : "You've already rated this story."}
              </p>

              {/* Show updated community rating */}
              {displayAvg != null && (
                <div className="inline-flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3 mb-5">
                  <div className="text-2xl font-black text-amber-500">{displayAvg.toFixed(1)}</div>
                  <div className="text-left">
                    <StarDisplay score={displayAvg} max={10} size="md" />
                    <p className="text-xs text-gray-500 mt-0.5">{displayCount} reader{displayCount !== 1 ? 's' : ''} rated</p>
                  </div>
                </div>
              )}

              <button
                onClick={dismiss}
                className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-8 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          ) : (
            /* ── Rating state ── */
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6C63FF] mb-1">Rate this story</p>
              <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
                {postTitle}
              </h3>
              {displayAvg != null && displayCount > 0 && (
                <p className="text-xs text-gray-400 mb-5">
                  Community avg: <span className="font-bold text-amber-500">{displayAvg.toFixed(1)}/10</span> from {displayCount} reader{displayCount !== 1 ? 's' : ''}
                </p>
              )}
              {!displayAvg && <div className="mb-5" />}

              <StarPicker value={stars} onChange={setStars} />

              <button
                onClick={submit}
                disabled={!stars || submitting}
                className="mt-6 w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Submit Rating
                  </>
                )}
              </button>

              <button onClick={dismiss} className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Not now
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Like Button ───────────────────────────────────────────────────────────────
function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const likedKey = `liked_${postId}`;
  const [liked, setLiked]     = useState(() => localStorage.getItem(likedKey) === '1');
  const [count, setCount]     = useState(initialLikes);
  const [animating, setAnim]  = useState(false);

  const handle = async () => {
    if (liked) return;
    setAnim(true); setLiked(true); setCount(c => c + 1);
    localStorage.setItem(likedKey, '1');
    setTimeout(() => setAnim(false), 600);
    try {
      const { data } = await api.post(`/comments/${postId}/like`);
      setCount(data.likes);
    } catch { /* optimistic */ }
  };

  return (
    <button onClick={handle} disabled={liked} aria-label={liked ? 'You liked this' : 'Like this story'}
      className={`group flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all select-none ${
        liked
          ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-default dark:bg-rose-900/20 dark:border-rose-800'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
      }`}>
      <span className={`text-lg leading-none transition-transform ${animating ? 'scale-150' : liked ? 'scale-110' : 'group-hover:scale-110'}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span>{formatViews(count)}</span>
      {liked && <span className="text-xs text-rose-400 font-normal">Liked!</span>}
    </button>
  );
}

// ── Community rating bar ──────────────────────────────────────────────────────
function CommunityRatingBar({
  avg, count, onRateClick,
}: { avg?: number | null; count?: number; onRateClick: () => void }) {
  const alreadyRated = false; // parent knows
  if (!avg || !count) {
    return (
      <button onClick={onRateClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-dashed border-[#6C63FF]/40 text-sm font-semibold text-[#6C63FF] hover:bg-[#6C63FF]/5 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        Be first to rate
      </button>
    );
  }

  const vc = verdictColor(avg);
  return (
    <button onClick={onRateClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all hover:opacity-80 ${vc.bg} ${vc.text} border-current/20`}>
      <span className="font-black text-base leading-none">{avg.toFixed(1)}</span>
      <StarDisplay score={avg} max={10} />
      <span className="text-xs font-normal opacity-70">{count} vote{count !== 1 ? 's' : ''}</span>
    </button>
  );
}

// ── Single comment bubble ─────────────────────────────────────────────────────
function CommentBubble({ comment }: { comment: IComment & { _pending?: boolean } }) {
  const name   = comment.author?.name ?? comment.guestName ?? 'Anonymous';
  const avatar = comment.author?.avatar;

  return (
    <div className={`flex gap-3 ${comment._pending ? 'opacity-60' : ''}`}>
      <div className="flex-shrink-0">
        {avatar
          ? <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#6C63FF]/20" />
          : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-black">
              {name[0]?.toUpperCase()}
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white">{name}</span>
            {!comment.author && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">Guest</span>
            )}
            {comment._pending && (
              <span className="text-xs bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Awaiting moderation
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
        <p className="mt-1 ml-2 text-xs text-gray-400 dark:text-gray-600">
          {comment._pending ? 'just now' : timeAgo(comment.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ── Comments Section ──────────────────────────────────────────────────────────
function CommentsSection({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useComments(postId);
  const comments = data?.comments ?? [];
  const total    = data?.total    ?? 0;

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [body, setBody]         = useState('');
  const [submitting, setSub]    = useState(false);
  const [submitted, setSent]    = useState(false);
  const [error, setError]       = useState('');
  const [optimistic, setOpt]    = useState<IComment[]>([]);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!body.trim()) { setError('Comment cannot be empty.'); return; }
    setError(''); setSub(true);
    try {
      const { data: created } = await api.post('/comments', {
        postId, content: body.trim(), guestName: name.trim(),
        guestEmail: email.trim() || undefined,
      });
      if (created._autoApproved) {
        setOpt(prev => [{ ...created, _pending: false }, ...prev]);
        qc.invalidateQueries({ queryKey: ['comments', postId] });
      } else {
        setOpt(prev => [{ ...created, _pending: true }, ...prev]);
      }
      setName(''); setEmail(''); setBody('');
      setSent(true);
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string; _rejected?: boolean } } })?.response;
      setError(resp?.data?._rejected
        ? (resp?.data?.message ?? 'Your comment contains inappropriate language.')
        : (resp?.data?.message ?? 'Could not post comment. Try again.'));
    } finally { setSub(false); }
  };

  const allComments = [...optimistic, ...comments];

  return (
    <section className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display font-black text-xl text-gray-900 dark:text-white">
          {total > 0 ? `${total} Comment${total !== 1 ? 's' : ''}` : 'Comments'}
        </h2>
        {isLoading && <span className="w-4 h-4 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-8">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Join the conversation</h3>

        {submitted && optimistic.length > 0 ? (
          <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
            optimistic[0]?._pending
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          }`}>
            <span className="text-lg">{optimistic[0]?._pending ? '⏳' : '✅'}</span>
            <div>
              <p className={`text-sm font-bold ${optimistic[0]?._pending ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                {optimistic[0]?._pending ? 'Comment submitted — awaiting review' : 'Comment posted!'}
              </p>
              <p className={`text-xs mt-0.5 ${optimistic[0]?._pending ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {optimistic[0]?._pending
                  ? 'Your comment contained content that needs manual review before going live.'
                  : 'Your comment passed our check and is now live below.'}
              </p>
            </div>
            <button onClick={() => { setSent(false); setOpt([]); setTimeout(() => textRef.current?.focus(), 50); }}
              className="ml-auto text-xs font-semibold hover:underline flex-shrink-0 text-gray-500">
              Write another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-xl">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={100}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Email <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Comment <span className="text-rose-400">*</span>
              </label>
              <textarea ref={textRef} value={body} onChange={e => setBody(e.target.value)} rows={4} maxLength={2000}
                placeholder="Share your thoughts on this story…"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none transition-all" />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400">Comments are reviewed before going live.</p>
                <span className="text-xs text-gray-400 font-mono">{body.length}/2000</span>
              </div>
            </div>
            <button type="submit" disabled={submitting || !name.trim() || !body.trim()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting…</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Post Comment</>
              )}
            </button>
          </form>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : allComments.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No comments yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allComments.map((c, i) => <CommentBubble key={c._id ?? `opt-${i}`} comment={c} />)}
          {(data?.pages ?? 1) > 1 && (
            <p className="text-center text-sm text-gray-400 pt-2">Showing {comments.length} of {total} comments</p>
          )}
        </div>
      )}
    </section>
  );
}

// ── Main Article Page ─────────────────────────────────────────────────────────
export default function Article() {
  const { slug }    = useParams<{ slug: string }>();
  const navigate    = useNavigate();
  const { data: post, isLoading, isError } = usePost(slug ?? '');
  const { data: related = [] } = useRelated(post?.category?.slug ?? '', post?._id ?? '');

  // Rating modal state
  const [showRating, setShowRating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const modalShownRef = useRef(false); // only show once per page visit

  // Scroll detection — show modal when user reaches bottom sentinel
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (!post) return;
    const ratedKey = `rated_${post._id}`;
    if (modalShownRef.current) return;
    if (localStorage.getItem(ratedKey) === '1') return; // already rated
    if (entries[0]?.isIntersecting) {
      modalShownRef.current = true;
      // Short delay so it feels natural
      setTimeout(() => setShowRating(true), 600);
    }
  }, [post]);

  useEffect(() => {
    const sentinel = bottomRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(handleIntersect, { threshold: 0.5 });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [handleIntersect]);

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="aspect-video bg-gray-200 rounded-2xl" />
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
          <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-black text-gray-900 dark:text-white">404</h1>
        <p className="mt-4 text-gray-500">Article not found.</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-[#6C63FF] font-semibold hover:underline">← Go back</button>
      </div>
    );
  }

  const shareUrl  = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(post.title);
  const readTime  = post.content ? Math.max(1, Math.ceil(post.content.trim().split(/\s+/).length / 200)) : 1;

  return (
    <>
      <article className="w-full max-w-screen-xl mx-auto px-4 lg:px-6 py-8 overflow-hidden">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 min-w-0">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
              <Link to="/" className="hover:text-[#6C63FF] transition-colors shrink-0">Home</Link>
              <span className="shrink-0">/</span>
              {post.category && (
                <Link to={`/${post.category.parent ?? 'entertainment'}/${post.category.slug}`}
                  className="hover:text-[#6C63FF] transition-colors capitalize shrink-0">{post.category.name}</Link>
              )}
              <span className="shrink-0">/</span>
              <span className="text-gray-400 truncate min-w-0">{post.title}</span>
            </nav>

            {/* Category + Breaking + admin rating badge */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {post.category && <CategoryBadge category={post.category.name} slug={post.category.slug} size="md" />}
              {post.breaking && (
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FF4D6D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-pulse" /> Breaking
                </span>
              )}
              {post.rating != null && post.rating > 0 && (() => {
                const vc = verdictColor(post.rating);
                return (
                  <div className={`flex items-center gap-2 ml-auto px-3 py-1.5 rounded-xl ${vc.bg}`}>
                    <span className={`text-base font-black ${vc.text}`}>{post.rating}</span>
                    <div>
                      <p className={`text-xs font-black leading-none ${vc.text}`}>{verdictLabel(post.rating)}</p>
                      <StarDisplay score={post.rating} max={10} size="sm" />
                    </div>
                    <span className={`text-xs opacity-60 ${vc.text}`}>Editorial</span>
                  </div>
                );
              })()}
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white leading-tight mb-5">
              {post.title}
            </h1>

            {/* Author + meta */}
            <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-2.5">
                {post.author?.avatar
                  ? <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#6C63FF]/20" />
                  : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white font-bold">{post.author?.name?.[0]?.toUpperCase()}</div>
                }
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.author?.name}</p>
                  {post.author?.role && <p className="text-xs text-gray-500">{post.author.role}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {readTime} min read
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {formatViews(post.views)}
                </span>
              </div>
              {/* Share */}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto flex-wrap">
                <span className="text-xs text-gray-400 font-medium">Share:</span>
                <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Share on X">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Share on Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#25D366] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Share on WhatsApp">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
                <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#6C63FF] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Copy link">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                </button>
              </div>
            </div>

            {/* Cover image */}
            {post.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-xl w-full">
                <img src={post.coverImage} alt={post.title} className="w-full max-h-[280px] sm:max-h-[400px] lg:max-h-[500px] object-cover" />
              </div>
            )}

            {/* Body */}
            <div>
              {post.excerpt && (
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-6 font-display italic">"{post.excerpt}"</p>
              )}
              {post.content?.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-base lg:text-lg">{para}</p>
              ))}
            </div>

            {/* Reference images */}
            {post.referenceImages?.length > 0 && (
              <div className="mt-8 space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900 dark:text-white">Photos</h3>
                {post.referenceImages.map((img, i) => (
                  <figure key={i} className="rounded-2xl overflow-hidden shadow-md">
                    <img src={img.url} alt={img.caption ?? `Image ${i + 1}`} className="w-full object-cover max-h-96" loading="lazy" />
                    {(img.caption || img.source) && (
                      <figcaption className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 flex justify-between">
                        {img.caption && <span>{img.caption}</span>}
                        {img.source && <span>© {img.source}</span>}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {/* Videos */}
            {post.videos?.length > 0 && (
              <div className="mt-8 space-y-6">
                <h3 className="font-display font-black text-xl text-gray-900 dark:text-white">Videos</h3>
                {post.videos.map((vid, i) => {
                  const embed = getYouTubeEmbed(vid.url);
                  return (
                    <figure key={i} className="rounded-2xl overflow-hidden shadow-md">
                      {embed
                        ? <iframe src={embed} className="w-full aspect-video" allowFullScreen title={vid.caption ?? `Video ${i + 1}`} />
                        : <video src={vid.url} controls className="w-full aspect-video bg-black" />
                      }
                      {(vid.caption || vid.source) && (
                        <figcaption className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 flex justify-between">
                          {vid.caption && <span>{vid.caption}</span>}
                          {vid.source && <span>© {vid.source}</span>}
                        </figcaption>
                      )}
                    </figure>
                  );
                })}
              </div>
            )}

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-500 mb-3">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link key={tag._id} to={`/trending?tag=${tag.slug}`}
                      className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] transition-colors font-medium">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── Like + community rating bar ── */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 flex-wrap">
              <LikeButton postId={post._id} initialLikes={post.likes} />
              <CommunityRatingBar
                avg={post.userRatingAvg}
                count={post.userRatingCount}
                onRateClick={() => setShowRating(true)}
              />
            </div>

            {/* Author card */}
            <div className="mt-8 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-3 sm:gap-4">
                {post.author?.avatar
                  ? <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-[#6C63FF]/20 flex-shrink-0" />
                  : <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">{post.author?.name?.[0]?.toUpperCase()}</div>
                }
                <div className="min-w-0">
                  <p className="font-black text-gray-900 dark:text-white">{post.author?.name}</p>
                  {post.author?.role && <p className="text-sm text-[#6C63FF] font-medium mb-2">{post.author.role}</p>}
                  {post.author?.bio && <p className="text-sm text-gray-500 leading-relaxed">{post.author.bio}</p>}
                </div>
              </div>
            </div>

            {/* Comments */}
            <CommentsSection postId={post._id} />

            {/* Scroll sentinel — rating modal triggers when this is in view */}
            <div ref={bottomRef} className="h-1" aria-hidden="true" />
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6 min-w-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm lg:sticky lg:top-20">
              <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-4">Related Stories</h3>
              {related.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">No related stories yet.</p>
                : <div className="space-y-4">{related.map(p => <ArticleCard key={p._id} post={p} variant="horizontal" />)}</div>
              }
            </div>
          </aside>
        </div>

        {/* More in category */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
            <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-8">More in {post.category?.name}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(p => <ArticleCard key={p._id} post={p} />)}
            </div>
          </section>
        )}
      </article>

      {/* Rating modal */}
      {showRating && (
        <RatingModal
          postId={post._id}
          postTitle={post.title}
          existingUserAvg={post.userRatingAvg}
          existingUserCount={post.userRatingCount}
          onClose={() => setShowRating(false)}
        />
      )}
    </>
  );
}
