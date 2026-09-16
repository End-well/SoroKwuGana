import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { formatViews, formatDate } from '../lib/utils';
import type { Post, PaginatedPosts } from '../types/post';
import ArticleCard from '../components/ui/ArticleCard';
import SkeletonCard from '../components/ui/SkeletonCard';

// ── Data hook ─────────────────────────────────────────────────────────────────
function useTrending() {
  return useQuery<PaginatedPosts>({
    queryKey: ['posts', 'trending'],
    queryFn: () => api.get('/posts', { params: { limit: 20, page: 1 } }).then(r => r.data),
    staleTime: 60_000,
  });
}

function usePosts(page: number) {
  return useQuery<PaginatedPosts>({
    queryKey: ['posts', 'all', page],
    queryFn: () => api.get('/posts', { params: { limit: 9, page } }).then(r => r.data),
    staleTime: 60_000,
  });
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-pulse">
      <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="hidden xs:block w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Trending() {
  const [page, setPage] = useState(1);
  const { data: trendingData, isLoading: trendingLoading } = useTrending();
  const { data: allData, isLoading: allLoading } = usePosts(page);

  // Sort by views descending for the numbered top list
  const topStories: Post[] = [...(trendingData?.posts ?? [])]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const allPosts: Post[] = allData?.posts ?? [];
  const hasMore = page < (allData?.pages ?? 1);

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#6C63FF] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Trending</span>
        </nav>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">
          Trending &amp; Viral
        </h1>
        <p className="mt-2 text-gray-500 text-lg">What the internet can't stop talking about right now.</p>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-[#FF4D6D] to-[#6C63FF] rounded-full" />
      </div>

      {/* Top 10 numbered list */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-[#FF4D6D] to-[#6C63FF] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">🔥 Top Stories Right Now</h2>
        </div>

        {trendingLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : topStories.length === 0 ? (
          <div className="py-16 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-5xl mb-3">📊</p>
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-1">No trending stories yet</h3>
            <p className="text-gray-400 text-sm">Publish posts from the admin dashboard to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topStories.map((post, i) => (
              <Link
                key={post._id}
                to={`/article/${post.slug}`}
                className="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:border-[#6C63FF]/40 hover:shadow-md transition-all"
              >
                {/* Rank */}
                <span className="text-3xl font-black w-12 text-center flex-shrink-0 gradient-text opacity-50 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Thumbnail */}
                {post.coverImage && (
                  <div className="hidden xs:block w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 img-zoom">
                    <img src={post.coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  {post.category && (
                    <p className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider mb-1">
                      {post.category.name}
                    </p>
                  )}
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#6C63FF] transition-colors line-clamp-2 text-sm lg:text-base leading-snug">
                    {post.title}
                  </h3>
                </div>

                {/* Meta */}
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-400">
                  <span>{formatViews(post.views)} views</span>
                  {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* All stories paginated grid */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">All Stories</h2>
        </div>

        {allLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : allPosts.length === 0 ? (
          <div className="py-16 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 font-medium">No stories published yet.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allPosts.map(post => <ArticleCard key={post._id} post={post} />)}
            </div>
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm px-8 py-3 rounded-full hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors shadow-sm"
                >
                  Load More Stories
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
