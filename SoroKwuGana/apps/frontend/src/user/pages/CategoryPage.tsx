import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { formatViews, formatDate } from '../lib/utils';
import type { Post, PaginatedPosts } from '../types/post';
import ArticleCard from '../components/ui/ArticleCard';
import CategoryBadge from '../components/ui/CategoryBadge';
import SkeletonCard from '../components/ui/SkeletonCard';

interface CategoryPageProps {
  categorySlug: string;
  categoryName: string;
  description: string;
  parentSection?: 'entertainment' | 'lifestyle';
}

// ── Skeleton hero ─────────────────────────────────────────────────────────────
function SkeletonHero() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-800" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CategoryPage({ categorySlug, categoryName, description, parentSection }: CategoryPageProps) {
  const [page, setPage] = useState(1);

  // Posts in this category
  const { data, isLoading } = useQuery<PaginatedPosts>({
    queryKey: ['posts', 'category', categorySlug, page],
    queryFn: () => api.get('/posts', { params: { category: categorySlug, limit: 9, page } }).then(r => r.data),
    staleTime: 60_000,
  });

  // "More stories" sidebar — other categories
  const { data: sidebarData } = useQuery<PaginatedPosts>({
    queryKey: ['posts', 'sidebar', categorySlug],
    queryFn: () => api.get('/posts', { params: { limit: 5, page: 1 } }).then(r => r.data),
    staleTime: 60_000,
  });

  const categoryPosts: Post[] = data?.posts ?? [];
  const hasMore = page < (data?.pages ?? 1);

  // Sidebar: posts NOT in this category
  const otherPosts: Post[] = (sidebarData?.posts ?? [])
    .filter(p => p.category?.slug !== categorySlug)
    .slice(0, 4);

  const hero = categoryPosts[0];
  const rest = categoryPosts.slice(1);

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#6C63FF] transition-colors">Home</Link>
          <span>/</span>
          {parentSection && (
            <>
              <Link to={`/${parentSection}`} className="hover:text-[#6C63FF] transition-colors capitalize">
                {parentSection}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-400">{categoryName}</span>
        </nav>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">
              {categoryName}
            </h1>
            <p className="mt-2 text-gray-500 text-lg">{description}</p>
          </div>
          <CategoryBadge category={categoryName} slug={categorySlug} size="md" />
        </div>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] rounded-full" />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SkeletonHero />
            <div className="grid sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
          <aside>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && categoryPosts.length === 0 && (
        <div className="py-24 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-5xl mb-4">📰</p>
          <h2 className="font-display font-bold text-xl text-gray-700 dark:text-gray-300 mb-2">
            No stories in {categoryName} yet
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Publish posts from the admin dashboard to see them here.
          </p>
          <Link to="/" className="inline-block text-[#6C63FF] font-semibold hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>
      )}

      {/* Content */}
      {!isLoading && categoryPosts.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero post */}
            {hero && (
              <Link to={`/article/${hero.slug}`}
                className="group block rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-[#6C63FF]/30 hover:shadow-lg transition-all shadow-sm">
                {/* Cover image */}
                <div className="img-zoom aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                  {hero.coverImage ? (
                    <img src={hero.coverImage} alt={hero.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">📰</div>
                  )}
                  {hero.breaking && (
                    <span className="absolute top-4 left-4 bg-[#FF4D6D] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Breaking
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <CategoryBadge category={hero.category?.name ?? ''} slug={hero.category?.slug ?? ''} size="md" />
                  <h2 className="mt-3 font-display font-black text-2xl lg:text-3xl text-gray-900 dark:text-white leading-tight group-hover:text-[#6C63FF] transition-colors">
                    {hero.title}
                  </h2>
                  {hero.excerpt && (
                    <p className="mt-2 text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">{hero.excerpt}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      {hero.author?.avatar ? (
                        <img src={hero.author.avatar} alt={hero.author.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-xs font-bold">
                          {hero.author?.name?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                      )}
                      <span className="font-medium text-gray-600 dark:text-gray-300">{hero.author?.name}</span>
                    </div>
                    {hero.publishedAt && <span>{formatDate(hero.publishedAt)}</span>}
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                      {formatViews(hero.views)}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of remaining posts */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {rest.map(post => <ArticleCard key={post._id} post={post} />)}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm px-8 py-3 rounded-full hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors shadow-sm"
                >
                  Load More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm lg:sticky lg:top-20">
              <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-4">More Stories</h3>
              {otherPosts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No other stories yet.</p>
              ) : (
                <div className="space-y-4">
                  {otherPosts.map(p => <ArticleCard key={p._id} post={p} variant="horizontal" />)}
                </div>
              )}
            </div>

            {/* Newsletter widget */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] p-5 text-white shadow-xl shadow-[#6C63FF]/20">
              <h3 className="font-display font-black text-lg mb-2">Get {categoryName} Updates</h3>
              <p className="text-white/70 text-sm mb-4">Be first to read the latest stories.</p>
              <form onSubmit={e => e.preventDefault()} className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/25 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-[#6C63FF] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
                >
                  Subscribe →
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
