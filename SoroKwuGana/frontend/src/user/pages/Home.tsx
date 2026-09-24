import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { formatViews, formatDate } from '../lib/utils';
import type { Post, PaginatedPosts } from '../types/post';
import ArticleCard from '../components/ui/ArticleCard';
import CategoryBadge from '../components/ui/CategoryBadge';
import SkeletonCard from '../components/ui/SkeletonCard';
import NewsletterWidget from '../components/ui/NewsletterWidget';

// ── API hooks ─────────────────────────────────────────────────────────────────
function usePosts(params?: Record<string, string | number | boolean>) {
  return useQuery<PaginatedPosts>({
    queryKey: ['posts', params],
    queryFn: () => api.get('/posts', { params }).then(r => r.data),
    staleTime: 60_000,
  });
}

// ── Hero Section ───────────────────────────────────────────────────────────────
function HeroSection() {
  const { data, isLoading } = usePosts({ featured: true, limit: 3 });
  const posts = data?.posts ?? [];
  const hero = posts[0];
  const side = posts.slice(1, 3);

  if (isLoading) {
    return (
      <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pt-8 pb-12">
        <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
          <div className="lg:col-span-3 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse min-h-[420px]" />
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex-1 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse min-h-[200px]" />
            <div className="flex-1 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse min-h-[200px]" />
          </div>
        </div>
      </section>
    );
  }

  if (!hero) {
    return (
      <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pt-8 pb-12">
        <div className="rounded-3xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 min-h-[300px] flex flex-col items-center justify-center text-center p-10">
          <p className="text-5xl mb-4">📰</p>
          <h2 className="font-display font-black text-xl text-gray-900 dark:text-white mb-2">No Featured Stories Yet</h2>
          <p className="text-gray-500 text-sm">Publish and feature posts from the admin dashboard to see them here.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Featured stories" className="max-w-screen-xl mx-auto px-4 lg:px-6 pt-8 pb-12">
      <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">
        <Link to={`/article/${hero.slug}`} className="group lg:col-span-3 relative rounded-3xl overflow-hidden block img-zoom min-h-[280px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[520px] shadow-2xl bg-gray-900">
          {hero.coverImage && <img src={hero.coverImage} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {hero.breaking && (
            <div className="absolute top-5 left-5">
              <span className="bg-[#FF4D6D] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />BREAKING
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <CategoryBadge category={hero.category?.name} slug={hero.category?.slug} size="md" />
            <h1 className="mt-3 font-display font-black text-white text-xl sm:text-2xl lg:text-4xl leading-tight group-hover:text-[#00D4FF] transition-colors line-clamp-3">{hero.title}</h1>
            {hero.excerpt && <p className="mt-2 text-gray-300 text-sm lg:text-base line-clamp-2 max-w-xl hidden sm:block">{hero.excerpt}</p>}
            <div className="mt-4 flex items-center gap-4">
              {hero.author?.avatar && <img src={hero.author.avatar} alt={hero.author.name} className="w-8 h-8 rounded-full border-2 border-white/30" />}
              <span className="text-white/80 text-sm font-medium">{hero.author?.name}</span>
              {hero.publishedAt && <span className="text-white/50 text-sm">{formatDate(hero.publishedAt)}</span>}
            </div>
            <span className="mt-5 inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#6C63FF] hover:text-white transition-colors shadow-lg">
              Read Story
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
            </span>
          </div>
        </Link>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {side.map(post => (
            <Link key={post._id} to={`/article/${post.slug}`} className="group relative rounded-2xl overflow-hidden block img-zoom flex-1 min-h-[180px] shadow-xl bg-gray-900">
              {post.coverImage && <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <CategoryBadge category={post.category?.name} slug={post.category?.slug} />
                <h2 className="mt-2 font-display font-bold text-white text-lg leading-snug group-hover:text-[#00D4FF] transition-colors line-clamp-2">{post.title}</h2>
                {post.publishedAt && <p className="mt-1 text-gray-400 text-xs">{formatDate(post.publishedAt)}</p>}
              </div>
            </Link>
          ))}
          {side.length === 0 && (
            <div className="flex-1 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 min-h-[180px] flex items-center justify-center text-gray-400 text-sm">
              Feature more posts in admin
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Trending Section ───────────────────────────────────────────────────────────
function TrendingSection() {
  const { data, isLoading } = usePosts({ limit: 5 });
  const sorted = [...(data?.posts ?? [])].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <section aria-label="Trending" className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 py-12">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">What's Hot</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible snap-x snap-mandatory md:snap-none">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="min-w-[220px] md:min-w-0 bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded mb-2 w-16" />
                  <div className="h-4 bg-gray-200 rounded mb-1" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ))
            : sorted.length === 0
            ? (
              <div className="col-span-5 py-10 text-center text-gray-400">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm">No trending stories yet — publish some posts first.</p>
              </div>
            )
            : sorted.map((post, i) => (
                <Link key={post._id} to={`/article/${post.slug}`} className="group flex gap-3 items-start bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 card-hover shadow-sm min-w-[220px] sm:min-w-[260px] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink">
                  <span className="text-3xl font-black leading-none pt-1 flex-shrink-0 gradient-text opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <CategoryBadge category={post.category?.name} slug={post.category?.slug} />
                    <h3 className="mt-1.5 font-bold text-sm text-gray-900 dark:text-white line-clamp-3 group-hover:text-[#6C63FF] transition-colors leading-snug">{post.title}</h3>
                    <p className="mt-1.5 text-xs text-gray-500">{formatViews(post.views)} views</p>
                  </div>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
}

// ── Categories strip ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Celebrity', slug: 'celebrity', emoji: '⭐', href: '/entertainment/celebrity' },
  { name: 'Music',     slug: 'music',     emoji: '🎵', href: '/entertainment/music' },
  { name: 'Movies',    slug: 'movies',    emoji: '🎬', href: '/entertainment/movies' },
  { name: 'TV Shows',  slug: 'tv-shows',  emoji: '📺', href: '/entertainment/tv-shows' },
  { name: 'Fashion',   slug: 'fashion',   emoji: '👗', href: '/lifestyle/fashion' },
  { name: 'Beauty',    slug: 'beauty',    emoji: '💄', href: '/lifestyle/beauty' },
  { name: 'Travel',    slug: 'travel',    emoji: '✈️', href: '/lifestyle/travel' },
  { name: 'Food',      slug: 'food',      emoji: '🍽️', href: '/lifestyle/food' },
];

function CategoriesStrip() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
        <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Explore Topics</h2>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map(cat => (
          <Link key={cat.slug} to={cat.href} className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 card-hover shadow-sm hover:border-[#6C63FF]/30 transition-all text-center">
            <span className="text-2xl">{cat.emoji}</span>
            <span className={`text-xs font-bold cat-${cat.slug}`}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Latest Articles ────────────────────────────────────────────────────────────
function LatestArticles() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePosts({ page, limit: 6 });
  const posts: Post[] = data?.posts ?? [];
  const hasMore = page < (data?.pages ?? 1);

  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Latest Stories</h2>
        </div>
        <Link to="/trending" className="text-sm font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">View all →</Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No stories published yet.</p>
          <p className="text-gray-400 text-sm mt-1">Create and publish posts from the admin dashboard.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => <ArticleCard key={post._id} post={post} />)}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <button onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm px-8 py-3 rounded-full hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors shadow-sm">
                Load More Stories
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"/></svg>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function SidebarSection() {
  const { data } = usePosts({ limit: 5 });
  const mostRead = [...(data?.posts ?? [])].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <aside className="space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse-dot" /> Most Read
        </h3>
        {mostRead.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {mostRead.map((post, i) => <ArticleCard key={post._id} post={post} variant="minimal" index={i} />)}
          </div>
        )}
      </div>

      {/* Newsletter */}
      <NewsletterWidget
        variant="gradient"
        title="Never Miss a Story"
        subtitle="Join 50,000+ readers. Weekly digest, zero spam."
      />
    </aside>
  );
}

// ── Video Section ──────────────────────────────────────────────────────────────
function VideoSection() {
  const { data } = usePosts({ limit: 20 });
  const videoPosts = (data?.posts ?? []).filter(p => p.videos && p.videos.length > 0).slice(0, 3);

  if (videoPosts.length === 0) return null;

  return (
    <section className="bg-gray-900 dark:bg-gray-950 py-14">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#FF4D6D] rounded-full" />
            <h2 className="font-display font-black text-2xl text-white">Videos</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {videoPosts.map(post => {
            const video = post.videos[0];
            const ytMatch = video?.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            const thumb = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` : post.coverImage;
            return (
              <Link key={post._id} to={`/article/${post.slug}`} className="group relative rounded-2xl overflow-hidden bg-black card-hover shadow-xl shadow-black/30">
                <div className="relative aspect-video">
                  {thumb && <img src={thumb} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" loading="lazy" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-[#FF4D6D] ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">{post.category?.name}</span>
                  <h3 className="mt-1 text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#00D4FF] transition-colors">{post.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter Banner ──────────────────────────────────────────────────────────
function NewsletterBanner() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 py-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#6C63FF] via-[#9C64FF] to-[#FF4D6D] p-10 lg:p-16 text-center text-white shadow-2xl shadow-[#6C63FF]/30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="relative max-w-md mx-auto">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Newsletter</span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-5xl leading-tight mb-3">Stay in the Loop</h2>
          <p className="text-white/75 text-base sm:text-lg mb-8">The hottest stories, delivered to your inbox every morning.</p>
          <NewsletterWidget variant="gradient" buttonLabel="Get Stories →" subtitle="" title="" />
        </div>
      </div>
    </section>
  );
}

// ── Entertainment Spotlight ────────────────────────────────────────────────────
function EntertainmentSpotlight() {
  const { data, isLoading } = usePosts({ category: 'movies', limit: 4 });
  const movies = data?.posts ?? [];
  const { data: d2 } = usePosts({ category: 'music', limit: 4 });
  const music = d2?.posts ?? [];
  const { data: d3 } = usePosts({ category: 'celebrity', limit: 4 });
  const celebrity = d3?.posts ?? [];
  const { data: d4 } = usePosts({ category: 'tv-shows', limit: 4 });
  const tvShows = d4?.posts ?? [];

  const entPosts = [...movies, ...music, ...celebrity, ...tvShows]
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
    .slice(0, 8);

  if (!isLoading && entPosts.length === 0) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#FF4D6D] to-[#6C63FF] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Entertainment</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/entertainment/movies" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] transition-colors hidden sm:block">Movies</Link>
          <Link to="/entertainment/music" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] transition-colors hidden sm:block">Music</Link>
          <Link to="/entertainment/celebrity" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] transition-colors hidden sm:block">Celebrity</Link>
          <Link to="/entertainment/tv-shows" className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-[#6C63FF] transition-colors hidden sm:block">TV Shows</Link>
          <Link to="/trending" className="text-sm font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">View all →</Link>
        </div>
      </div>
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {entPosts.slice(0, 4).map(post => <ArticleCard key={post._id} post={post} />)}
        </div>
      )}
    </section>
  );
}

// ── Lifestyle Section ──────────────────────────────────────────────────────────
function LifestyleSection() {
  const { data: d1, isLoading } = usePosts({ category: 'fashion', limit: 2 });
  const { data: d2 } = usePosts({ category: 'beauty', limit: 2 });
  const { data: d3 } = usePosts({ category: 'health', limit: 2 });
  const { data: d4 } = usePosts({ category: 'food', limit: 2 });
  const { data: d5 } = usePosts({ category: 'travel', limit: 2 });

  const lifestylePosts = [
    ...(d1?.posts ?? []),
    ...(d2?.posts ?? []),
    ...(d3?.posts ?? []),
    ...(d4?.posts ?? []),
    ...(d5?.posts ?? []),
  ]
    .sort((a, b) => new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime())
    .slice(0, 4);

  if (!isLoading && lifestylePosts.length === 0) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-400 rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Lifestyle</h2>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/lifestyle/fashion"  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors hidden sm:block">Fashion</Link>
          <Link to="/lifestyle/beauty"   className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors hidden sm:block">Beauty</Link>
          <Link to="/lifestyle/health"   className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors hidden sm:block">Health</Link>
          <Link to="/lifestyle/food"     className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors hidden sm:block">Food</Link>
          <Link to="/lifestyle/travel"   className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors hidden sm:block">Travel</Link>
          <Link to="/trending" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">View all →</Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {lifestylePosts.map(post => <ArticleCard key={post._id} post={post} />)}
        </div>
      )}
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrendingSection />
      <CategoriesStrip />
      <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-1"><LatestArticles /></div>
          <div className="order-2 lg:order-2"><SidebarSection /></div>
        </div>
      </section>
      <VideoSection />
      <EntertainmentSpotlight />
      <LifestyleSection />
      <NewsletterBanner />
    </div>
  );
}
