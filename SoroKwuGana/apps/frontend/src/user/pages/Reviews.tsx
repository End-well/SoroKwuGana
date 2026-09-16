import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { formatDate, formatViews } from '../lib/utils';
import type { Post, PaginatedPosts } from '../types/post';
import ArticleCard from '../components/ui/ArticleCard';
import SkeletonCard from '../components/ui/SkeletonCard';

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Pick the best available score for a post:
 *  1. Community average (userRatingAvg) if at least 2 people rated
 *  2. Admin editorial rating (rating)
 *  3. 0 (no score)
 */
function effectiveScore(post: Post): number {
  if (post.userRatingAvg != null && (post.userRatingCount ?? 0) >= 2) {
    return post.userRatingAvg;
  }
  if (post.rating != null && post.rating > 0) {
    return post.rating;
  }
  return 0;
}

function verdict(score: number): { label: string; color: string; bg: string; dot: string } {
  if (score >= 9)  return { label: 'Masterpiece',  color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500' };
  if (score >= 8)  return { label: 'Must Watch',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50  dark:bg-emerald-900/20', dot: 'bg-emerald-400' };
  if (score >= 7)  return { label: 'Great',        color: 'text-sky-700    dark:text-sky-400',      bg: 'bg-sky-100    dark:bg-sky-900/30',      dot: 'bg-sky-500'     };
  if (score >= 6)  return { label: 'Good',         color: 'text-blue-700   dark:text-blue-400',     bg: 'bg-blue-100   dark:bg-blue-900/30',     dot: 'bg-blue-500'    };
  if (score >= 5)  return { label: 'Average',      color: 'text-amber-700  dark:text-amber-400',    bg: 'bg-amber-100  dark:bg-amber-900/30',    dot: 'bg-amber-500'   };
  if (score >= 4)  return { label: 'Mixed',        color: 'text-orange-700 dark:text-orange-400',   bg: 'bg-orange-100 dark:bg-orange-900/30',   dot: 'bg-orange-500'  };
  return             { label: 'Skip It',           color: 'text-red-700    dark:text-red-400',      bg: 'bg-red-100    dark:bg-red-900/30',      dot: 'bg-red-500'     };
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const v = verdict(score);
  const cls = {
    sm: 'w-9 h-9 text-sm rounded-xl',
    md: 'w-12 h-12 text-lg rounded-2xl',
    lg: 'w-16 h-16 text-2xl rounded-2xl',
  }[size];
  return (
    <div className={`${cls} font-black flex items-center justify-center flex-shrink-0 shadow-sm ${v.bg} ${v.color}`}>
      {Number.isInteger(score) ? score : score.toFixed(1)}
    </div>
  );
}

// ── Star row ──────────────────────────────────────────────────────────────────
function StarRow({ score, max = 10 }: { score: number; max?: number }) {
  const filled = Math.round((score / max) * 5);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${score}/${max}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < filled ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Score row (badge + stars + verdict + source label) ───────────────────────
function ScoreRow({ post, size = 'sm' }: { post: Post; size?: 'sm' | 'md' }) {
  const adminScore  = (post.rating ?? 0) > 0 ? (post.rating as number) : null;
  const communityAvg = (post.userRatingAvg ?? 0) > 0 ? (post.userRatingAvg as number) : null;
  const communityCount = post.userRatingCount ?? 0;

  if (!adminScore && !communityAvg) return null;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${size === 'md' ? 'mb-4' : 'mt-1.5'}`}>
      {/* Editorial score */}
      {adminScore != null && (
        <div className="flex items-center gap-2">
          <ScoreBadge score={adminScore} size={size === 'md' ? 'md' : 'sm'} />
          <div>
            <div className="flex items-center gap-1.5">
              <StarRow score={adminScore} />
              <span className={`font-bold ${size === 'md' ? 'text-sm' : 'text-xs'} text-gray-700 dark:text-gray-300`}>
                {adminScore}/10
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{verdict(adminScore).label} · Editorial</p>
          </div>
        </div>
      )}

      {/* Divider if both */}
      {adminScore != null && communityAvg != null && (
        <span className="text-gray-200 dark:text-gray-700 text-lg font-thin">|</span>
      )}

      {/* Community score */}
      {communityAvg != null && communityCount >= 1 && (
        <div className="flex items-center gap-2">
          <ScoreBadge score={communityAvg} size={size === 'md' ? 'md' : 'sm'} />
          <div>
            <div className="flex items-center gap-1.5">
              <StarRow score={communityAvg} />
              <span className={`font-bold ${size === 'md' ? 'text-sm' : 'text-xs'} text-gray-700 dark:text-gray-300`}>
                {communityAvg.toFixed(1)}/10
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {communityCount} reader vote{communityCount !== 1 ? 's' : ''} · Community
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Hero review card ──────────────────────────────────────────────────────────
function HeroReviewCard({ post }: { post: Post }) {
  const score = effectiveScore(post);
  const v = score > 0 ? verdict(score) : null;

  return (
    <Link to={`/article/${post.slug}`}
      className="group relative flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">

      {/* Cover */}
      <div className="md:w-2/5 relative overflow-hidden bg-gray-100 dark:bg-gray-800 min-h-[220px] md:min-h-0">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">🎬</div>
        )}
        {/* Score badge over image */}
        {score > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <ScoreBadge score={score} size="lg" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center gap-3">

        {/* Category + verdict */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-[#6C63FF] uppercase tracking-wider">{post.category?.name}</span>
          {v && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${v.bg} ${v.color}`}>
              {v.label}
            </span>
          )}
          {post.breaking && (
            <span className="text-xs font-black text-[#FF4D6D] uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-pulse" />Breaking
            </span>
          )}
        </div>

        <h2 className="font-display font-black text-2xl lg:text-3xl text-gray-900 dark:text-white leading-tight group-hover:text-[#6C63FF] transition-colors">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}

        {/* Score rows — both editorial + community */}
        <ScoreRow post={post} size="md" />

        {/* Author + meta */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-1">
          {post.author?.avatar
            ? <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
            : <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-bold">
                {post.author?.name?.[0]?.toUpperCase()}
              </div>
          }
          <span className="font-medium text-gray-500 dark:text-gray-400">{post.author?.name}</span>
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          <span className="flex items-center gap-1 ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            {formatViews(post.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Compact review card ───────────────────────────────────────────────────────
function ReviewCard({ post }: { post: Post }) {
  const score = effectiveScore(post);
  const v = score > 0 ? verdict(score) : null;

  return (
    <Link to={`/article/${post.slug}`}
      className="group flex gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4">
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        {post.coverImage
          ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">🎬</div>
        }
        {score > 0 && (
          <div className={`absolute bottom-1 right-1 text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${v?.bg} ${v?.color}`}>
            {Number.isInteger(score) ? score : score.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold text-[#6C63FF]">{post.category?.name}</span>
          {v && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${v.bg} ${v.color}`}>{v.label}</span>}
        </div>
        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#6C63FF] transition-colors leading-snug">
          {post.title}
        </h3>
        <ScoreRow post={post} size="sm" />
        {(!post.rating && !post.userRatingAvg) && post.publishedAt && (
          <span className="text-xs text-gray-400">{formatDate(post.publishedAt)}</span>
        )}
      </div>
    </Link>
  );
}

// ── Score overview sidebar ────────────────────────────────────────────────────
function ScoreOverview({ posts }: { posts: Post[] }) {
  const adminRated     = posts.filter(p => (p.rating ?? 0) > 0);
  const communityRated = posts.filter(p => (p.userRatingAvg ?? 0) > 0 && (p.userRatingCount ?? 0) >= 1);

  if (adminRated.length === 0 && communityRated.length === 0) return null;

  const adminAvg = adminRated.length > 0
    ? adminRated.reduce((s, p) => s + (p.rating ?? 0), 0) / adminRated.length
    : null;

  const commAvg = communityRated.length > 0
    ? communityRated.reduce((s, p) => s + (p.userRatingAvg ?? 0), 0) / communityRated.length
    : null;

  const totalVotes = posts.reduce((s, p) => s + (p.userRatingCount ?? 0), 0);

  const buckets = [
    { label: '9–10', min: 9, max: 11, color: 'bg-emerald-500' },
    { label: '7–8',  min: 7, max: 9,  color: 'bg-sky-500' },
    { label: '5–6',  min: 5, max: 7,  color: 'bg-amber-400' },
    { label: '1–4',  min: 1, max: 5,  color: 'bg-red-400' },
  ];

  const scoredPosts = posts.filter(p => effectiveScore(p) > 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <h3 className="text-sm font-black text-gray-900 dark:text-white">Score Overview</h3>

      {/* Editorial average */}
      {adminAvg != null && (
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <ScoreBadge score={parseFloat(adminAvg.toFixed(1))} size="md" />
          <div>
            <p className="font-black text-gray-900 dark:text-white leading-none">{verdict(Math.round(adminAvg)).label}</p>
            <StarRow score={adminAvg} />
            <p className="text-xs text-gray-400 mt-0.5">
              Editorial avg · {adminRated.length} review{adminRated.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Community average */}
      {commAvg != null && (
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <ScoreBadge score={parseFloat(commAvg.toFixed(1))} size="md" />
          <div>
            <p className="font-black text-gray-900 dark:text-white leading-none">{verdict(Math.round(commAvg)).label}</p>
            <StarRow score={commAvg} />
            <p className="text-xs text-gray-400 mt-0.5">
              Community avg · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Distribution bars */}
      {scoredPosts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score Distribution</p>
          {buckets.map(b => {
            const count = scoredPosts.filter(p => {
              const s = effectiveScore(p);
              return s >= b.min && s < b.max;
            }).length;
            const pct = scoredPosts.length > 0 ? (count / scoredPosts.length) * 100 : 0;
            return (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right font-mono flex-shrink-0">{b.label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div className={`${b.color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-4 text-right font-mono flex-shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Reviews Page ─────────────────────────────────────────────────────────
type ScoreFilter = 'all' | '9-10' | '7-8' | '5-6' | '1-4' | 'unscored';

export default function Reviews() {
  const [page, setPage]          = useState(1);
  const [scoreFilter, setFilter] = useState<ScoreFilter>('all');

  const { data, isLoading } = useQuery<PaginatedPosts>({
    queryKey: ['reviews', page],
    queryFn: () => api.get('/posts', { params: { category: 'reviews', limit: 20, page } }).then(r => r.data),
    staleTime: 60_000,
  });

  const allPosts: Post[] = data?.posts ?? [];
  const hasMore = page < (data?.pages ?? 1);

  // Filter uses effective score (community or editorial, whichever is available)
  const filtered = allPosts.filter(p => {
    const s = effectiveScore(p);
    if (scoreFilter === '9-10')   return s >= 9;
    if (scoreFilter === '7-8')    return s >= 7 && s < 9;
    if (scoreFilter === '5-6')    return s >= 5 && s < 7;
    if (scoreFilter === '1-4')    return s >= 1 && s < 5;
    if (scoreFilter === 'unscored') return s === 0;
    return true;
  });

  const hero = filtered[0];
  const rest = filtered.slice(1);

  const FILTERS: { value: ScoreFilter; label: string }[] = [
    { value: 'all',      label: 'All' },
    { value: '9-10',     label: '★ 9–10' },
    { value: '7-8',      label: '★ 7–8' },
    { value: '5-6',      label: '★ 5–6' },
    { value: '1-4',      label: '★ 1–4' },
    { value: 'unscored', label: 'Unscored' },
  ];

  // Stats for header
  const ratedCount     = allPosts.filter(p => effectiveScore(p) > 0).length;
  const totalVotes     = allPosts.reduce((s, p) => s + (p.userRatingCount ?? 0), 0);
  const topRated       = allPosts.filter(p => effectiveScore(p) >= 8).sort((a, b) => effectiveScore(b) - effectiveScore(a));

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-[#6C63FF] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Reviews</span>
        </nav>

        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">
              Reviews
            </h1>
            <p className="mt-2 text-gray-500 text-lg">
              Honest takes on movies, music, games, shows and more.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2.5 rounded-2xl">
              <span className="text-xl">⭐</span>
              <div>
                <p className="font-black text-amber-700 dark:text-amber-400 leading-none">{ratedCount}</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-500/70">scored</p>
              </div>
            </div>
            {totalVotes > 0 && (
              <div className="flex items-center gap-2 bg-[#6C63FF]/10 dark:bg-[#6C63FF]/20 border border-[#6C63FF]/20 px-4 py-2.5 rounded-2xl">
                <span className="text-xl">👥</span>
                <div>
                  <p className="font-black text-[#6C63FF] leading-none">{totalVotes}</p>
                  <p className="text-xs text-[#6C63FF]/60">reader votes</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-amber-400 to-[#FF4D6D] rounded-full" />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-8">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : allPosts.length === 0 ? (
        /* ── Rich empty state ── */
        <div className="space-y-12">

          {/* Hero empty banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8 sm:p-12 text-white text-center shadow-2xl">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#6C63FF]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FF4D6D]/20 rounded-full blur-3xl" />

            <div className="relative">
              {/* Animated stars */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-8 h-8 text-amber-400" style={{ animationDelay: `${i * 0.1}s` }}
                    fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl mb-3">
                Reviews are coming soon
              </h2>
              <p className="text-white/60 text-base max-w-lg mx-auto mb-8">
                Our team is working on honest, in-depth reviews of the latest movies, music, games and shows.
                Check back soon — or explore what's trending now.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/trending"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                  🔥 See What's Trending
                </Link>
                <Link to="/"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* What to expect */}
          <div>
            <h3 className="font-display font-black text-xl text-gray-900 dark:text-white text-center mb-6">
              What to expect in Reviews
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🎬', title: 'Movies',    desc: 'Box office hits, indie gems and everything in between.' },
                { icon: '🎵', title: 'Music',     desc: 'Album deep-dives, single breakdowns and artist profiles.' },
                { icon: '🎮', title: 'Games',     desc: 'Gaming reviews from casual picks to hardcore titles.' },
                { icon: '📺', title: 'TV & Shows', desc: 'Series recaps, season reviews and binge-worthy picks.' },
              ].map(item => (
                <div key={item.title}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <span className="text-3xl mb-3 block">{item.icon}</span>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rating system explainer */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-5 text-center">
              Our Scoring System
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { range: '9–10', label: 'Masterpiece',  desc: 'Exceptional — an instant classic.',  bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-700 dark:text-emerald-400' },
                { range: '7–8',  label: 'Great',        desc: 'Highly recommended, minor flaws.',   bg: 'bg-sky-100 dark:bg-sky-900/30',         color: 'text-sky-700 dark:text-sky-400' },
                { range: '5–6',  label: 'Average',      desc: 'Worth seeing, has its moments.',     bg: 'bg-amber-100 dark:bg-amber-900/30',     color: 'text-amber-700 dark:text-amber-400' },
                { range: '3–4',  label: 'Mixed',        desc: 'Some good, plenty bad.',             bg: 'bg-orange-100 dark:bg-orange-900/30',   color: 'text-orange-700 dark:text-orange-400' },
                { range: '1–2',  label: 'Skip It',      desc: 'Not worth your time.',               bg: 'bg-red-100 dark:bg-red-900/30',         color: 'text-red-700 dark:text-red-400' },
                { range: '👥',   label: 'You Decide',   desc: 'Every article lets readers vote.',   bg: 'bg-[#6C63FF]/10 dark:bg-[#6C63FF]/20',  color: 'text-[#6C63FF]' },
              ].map(item => (
                <div key={item.range} className={`flex items-start gap-3 p-3 rounded-xl ${item.bg}`}>
                  <span className={`text-base font-black w-12 text-center flex-shrink-0 pt-0.5 ${item.color}`}>
                    {item.range}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${item.color}`}>{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter CTA */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] p-6 sm:p-8 text-white text-center shadow-xl shadow-[#6C63FF]/20">
            <h3 className="font-display font-black text-xl mb-2">Get notified when reviews drop</h3>
            <p className="text-white/70 text-sm mb-5 max-w-sm mx-auto">
              Subscribe and be first to read our latest reviews, delivered straight to your inbox.
            </p>
            <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input type="email" placeholder="your@email.com" required
                className="flex-1 bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/25 transition-colors" />
              <button type="submit"
                className="bg-white text-[#6C63FF] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap shadow-lg">
                Notify Me →
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Filter bar */}
            <div className="flex gap-2 flex-wrap items-center">
              {FILTERS.map(f => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                    scoreFilter === f.value
                      ? 'bg-[#6C63FF] text-white border-[#6C63FF] shadow-md shadow-[#6C63FF]/20'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#6C63FF] hover:text-[#6C63FF]'
                  }`}>
                  {f.label}
                </button>
              ))}
              {scoreFilter !== 'all' && (
                <span className="text-xs text-gray-400 ml-1">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Empty filter */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm text-gray-500">No reviews in this score range yet.</p>
                <button onClick={() => setFilter('all')} className="mt-3 text-xs text-[#6C63FF] font-semibold hover:underline">
                  Show all reviews
                </button>
              </div>
            ) : (
              <>
                {/* Hero */}
                {hero && <HeroReviewCard post={hero} />}

                {/* Grid */}
                {rest.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {rest.map(p => <ArticleCard key={p._id} post={p} />)}
                  </div>
                )}

                {/* Load more */}
                {hasMore && scoreFilter === 'all' && (
                  <div className="text-center">
                    <button onClick={() => setPage(n => n + 1)}
                      className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm px-8 py-3 rounded-full hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors shadow-sm">
                      Load More Reviews
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"/>
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6">

            {/* Score overview */}
            <ScoreOverview posts={allPosts} />

            {/* Top rated */}
            {topRated.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  🏆 Top Rated
                </h3>
                <div className="space-y-3">
                  {topRated.slice(0, 5).map(p => <ReviewCard key={p._id} post={p} />)}
                </div>
              </div>
            )}

            {/* Verdict guide */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4">Verdict Guide</h3>
              <div className="space-y-2">
                {([
                  { range: '9–10', score: 9 },
                  { range: '7–8',  score: 7 },
                  { range: '5–6',  score: 5 },
                  { range: '3–4',  score: 3 },
                  { range: '1–2',  score: 1 },
                ] as const).map(({ range, score }) => {
                  const v = verdict(score);
                  return (
                    <div key={range} className="flex items-center gap-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg w-14 text-center ${v.bg} ${v.color}`}>
                        {range}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.dot}`} />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{v.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                Scores combine editorial and community ratings. Scroll to the end of any article to rate it.
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
