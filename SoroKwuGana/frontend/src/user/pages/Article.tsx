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
  parentId?: string | null;
  createdAt: string;
  _pending?: boolean;
  replies?: IComment[]; // built client-side
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

      {/* Modal — centered dialog */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Rate this story"
      >
        <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/20 px-6 pt-5 pb-8 relative">
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

// ── Shared localStorage key for commenter name (per post) ─────────────────────
const COMMENTER_KEY = (postId: string) => `commenter_name_${postId}`;
const COMMENTER_EMAIL_KEY = (postId: string) => `commenter_email_${postId}`;

// ── Block contact sharing in comment content ──────────────────────────────────
function blockContactSharing(text: string): string | null {
  // Patterns that suggest sharing personal contact/social info
  const CONTACT_PATTERNS = [
    /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i,                    // email address
    /\b(\+?[\d\s\-().]{7,})\b/,                             // phone number
    /\b(whatsapp|telegram|instagram|twitter|facebook|tiktok|snapchat)\b.*?(@|\.com|\.me)/i,
    /\bhttps?:\/\/(?!sorokwugana\.com)\S+/i,                // external URLs
    /\bwa\.me\/\S+/i,                                        // WhatsApp link
    /\bt\.me\/\S+/i,                                         // Telegram link
    /\bbit\.ly\/\S+/i,                                       // URL shortener
  ];
  for (const pattern of CONTACT_PATTERNS) {
    if (pattern.test(text)) return null; // blocked
  }
  return text;
}


function buildTree(flat: IComment[]): IComment[] {
  const map = new Map<string, IComment>();
  const roots: IComment[] = [];
  // First pass: index all with empty replies array
  for (const c of flat) {
    map.set(c._id, { ...c, replies: [] });
  }
  // Second pass: attach to parent or root
  for (const c of map.values()) {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

// ── Inline reply / comment form ───────────────────────────────────────────────
function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  autoFocus = false,
  compact = false,
}: {
  postId: string;
  parentId?: string | null;
  onSuccess: (comment: IComment) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  // Retain commenter name across comments/replies for this post
  const savedName  = typeof window !== 'undefined' ? localStorage.getItem(COMMENTER_KEY(postId)) ?? '' : '';
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem(COMMENTER_EMAIL_KEY(postId)) ?? '' : '';

  const [name, setName]       = useState(savedName);
  const [email, setEmail]     = useState(savedEmail);
  const [body, setBody]       = useState('');
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) setTimeout(() => textRef.current?.focus(), 80);
  }, [autoFocus]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!body.trim()) { setError('Comment cannot be empty.'); return; }

    // Block contact/social sharing
    const cleanContent = blockContactSharing(body.trim());
    if (!cleanContent) {
      setError('Please keep comments on topic. Sharing personal contact details, social media handles, phone numbers, or external links is not allowed.');
      return;
    }

    setError(''); setSub(true);
    try {
      const { data: created } = await api.post('/comments', {
        postId,
        parentId: parentId ?? null,
        content: cleanContent,
        guestName: name.trim(),
        guestEmail: email.trim() || undefined,
      });
      // Save name/email for this post so user doesn't need to re-enter
      localStorage.setItem(COMMENTER_KEY(postId), name.trim());
      if (email.trim()) localStorage.setItem(COMMENTER_EMAIL_KEY(postId), email.trim());

      onSuccess({ ...created, _pending: !created._autoApproved });
      setBody(''); // clear body but keep name/email
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string; _rejected?: boolean } } })?.response;
      setError(resp?.data?._rejected
        ? (resp?.data?.message ?? 'Your comment contains inappropriate language.')
        : (resp?.data?.message ?? 'Could not post. Try again.'));
    } finally { setSub(false); }
  };

  return (
    <form onSubmit={submit} className={`space-y-2.5 ${compact ? '' : 'mt-2'}`}>
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-xl">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name *" maxLength={100}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all" />
        </div>
      )}
      {compact && (
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name *" maxLength={100}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all" />
      )}
      <div className="relative">
        <textarea
          ref={textRef}
          value={body}
          onChange={e => { setBody(e.target.value); if (error) setError(''); }}
          rows={compact ? 2 : 4}
          maxLength={2000}
          placeholder={compact ? 'Write a reply…' : 'Share your thoughts on this story…'}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none transition-all"
        />
        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-mono pointer-events-none">{body.length}/2000</span>
      </div>
      {!compact && (
        <p className="text-[10px] text-gray-400">
          💡 Comments with phone numbers, emails, social media handles, or external links will be blocked.
        </p>
      )}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={submitting || !name.trim() || !body.trim()}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm">
          {submitting ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
            </svg>
          )}
          {compact ? 'Reply' : 'Post Comment'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ── Single comment node (recursive) ──────────────────────────────────────────
function CommentNode({
  comment,
  postId,
  depth = 0,
  onReplyAdded,
}: {
  comment: IComment;
  postId: string;
  depth?: number;
  onReplyAdded: (parentId: string, reply: IComment) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const name   = comment.author?.name ?? comment.guestName ?? 'Anonymous';
  const avatar = comment.author?.avatar;

  // Indent: 12px on mobile, 20px on larger screens. Cap at 3 levels to prevent overflow
  const indentPx = Math.min(depth, 3) * 12;

  return (
    <div style={{ marginLeft: depth > 0 ? indentPx : 0 }}>
      <div className={`flex gap-2.5 ${comment._pending ? 'opacity-60' : ''}`}>
        {/* Avatar */}
        <div className="flex flex-col items-center gap-0 flex-shrink-0">
          {avatar
            ? <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover ring-2 ring-[#6C63FF]/15" />
            : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-[10px] font-black">
                {name[0]?.toUpperCase()}
              </div>
          }
          {(comment.replies?.length ?? 0) > 0 && (
            <div className="w-px flex-1 mt-1 bg-gray-200 dark:bg-gray-700 min-h-[16px]" />
          )}
        </div>

        {/* Bubble */}
        <div className="flex-1 min-w-0 pb-2 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl rounded-tl-sm px-3 py-2.5">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-none break-all">{name}</span>
              {!comment.author && (
                <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full flex-shrink-0">Guest</span>
              )}
              {depth > 0 && (
                <span className="text-[10px] text-[#6C63FF] font-semibold flex-shrink-0">↩ Reply</span>
              )}
              {comment._pending && (
                <span className="text-[10px] bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending
                </span>
              )}
              <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{comment._pending ? 'just now' : timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {!comment._pending && (
            <button
              onClick={() => setShowReply(v => !v)}
              className="mt-1 ml-1 text-xs font-semibold text-gray-400 hover:text-[#6C63FF] dark:hover:text-[#6C63FF] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
              {showReply ? 'Cancel' : 'Reply'}
            </button>
          )}

          {/* Inline reply form */}
          {showReply && !comment._pending && (
            <div className="mt-3 pl-1">
              <CommentForm
                postId={postId}
                parentId={comment._id}
                compact
                autoFocus
                onSuccess={reply => {
                  onReplyAdded(comment._id, reply);
                  setShowReply(false);
                }}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Render children recursively */}
      {(comment.replies?.length ?? 0) > 0 && (
        <div className="space-y-3 mt-2">
          {comment.replies!.map(reply => (
            <CommentNode
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              onReplyAdded={onReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comments Section ──────────────────────────────────────────────────────────
function CommentsSection({ postId }: { postId: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useComments(postId);

  // Collapsed by default — open when user clicks the header
  const [expanded, setExpanded]   = useState(false);
  // How many top-level threads to show at once
  const [visibleCount, setVisible] = useState(5);

  // Local state for optimistic replies
  const [localComments, setLocal] = useState<IComment[]>([]);

  const serverFlat = data?.comments ?? [];
  const allFlat    = [...serverFlat, ...localComments];
  const tree       = buildTree(allFlat);
  const total      = (data?.total ?? 0) + localComments.filter(c => !c.parentId).length;

  const visibleTree = tree.slice(0, visibleCount);
  const hasMore     = tree.length > visibleCount;

  const handleReplyAdded = useCallback((parentId: string, reply: IComment) => {
    setLocal(prev => [...prev, { ...reply, parentId }]);
    qc.invalidateQueries({ queryKey: ['comments', postId] });
  }, [qc, postId]);

  const handleTopLevelAdded = useCallback((comment: IComment) => {
    setLocal(prev => [...prev, { ...comment, parentId: null }]);
    qc.invalidateQueries({ queryKey: ['comments', postId] });
    // Auto-expand when user posts
    setExpanded(true);
  }, [qc, postId]);

  return (
    <section className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">

      {/* ── Collapsible header ─────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between gap-3 group mb-4"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-display font-black text-xl text-gray-900 dark:text-white">
            Comments
            {total > 0 && (
              <span className="ml-2 text-sm font-semibold text-gray-400 dark:text-gray-500">
                ({total})
              </span>
            )}
          </h2>
          {isLoading && (
            <span className="w-4 h-4 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6C63FF]">
            {expanded ? 'Hide' : 'Show comments'}
          </span>
          <svg
            className={`w-4 h-4 text-[#6C63FF] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* ── Collapsed preview ─────────────────────────────────────────────── */}
      {!expanded && total > 0 && !isLoading && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5 transition-all group text-left"
        >
          {/* Avatar previews */}
          <div className="flex -space-x-2 flex-shrink-0">
            {tree.slice(0, 3).map((c, i) => {
              const name = c.author?.name ?? c.guestName ?? 'A';
              return (
                <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-[10px] font-black ring-2 ring-white dark:ring-gray-900">
                  {name[0].toUpperCase()}
                </div>
              );
            })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {total} comment{total !== 1 ? 's' : ''} — click to read
            </p>
            {tree[0] && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                "{tree[0].content.slice(0, 60)}{tree[0].content.length > 60 ? '…' : ''}"
              </p>
            )}
          </div>
          <svg className="w-4 h-4 text-[#6C63FF] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* ── Expanded content ──────────────────────────────────────────────── */}
      {expanded && (
        <>
          {/* Write a comment form */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#6C63FF]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Join the conversation
            </h3>
            <CommentForm
              postId={postId}
              parentId={null}
              onSuccess={handleTopLevelAdded}
            />
            <p className="text-xs text-gray-400 mt-3">Comments pass an automatic review before going live.</p>
          </div>

          {/* Comment tree */}
          {isLoading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : tree.length === 0 ? (
            <div className="py-10 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No comments yet</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <>
              <div className="space-y-5">
                {visibleTree.map(comment => (
                  <CommentNode
                    key={comment._id}
                    comment={comment}
                    postId={postId}
                    depth={0}
                    onReplyAdded={handleReplyAdded}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <button
                  onClick={() => setVisible(v => v + 5)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
                  </svg>
                  Load more comments ({tree.length - visibleCount} remaining)
                </button>
              )}

              {/* Collapse back */}
              <button
                onClick={() => { setExpanded(false); setVisible(5); }}
                className="mt-3 w-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
              >
                ↑ Hide comments
              </button>
            </>
          )}
        </>
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
                <a href="https://www.tiktok.com/@sorokwugana_blog" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-black hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="TikTok">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>
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
