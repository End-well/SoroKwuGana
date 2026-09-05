import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { latestPosts, formatViews } from '../data/mockPosts';
import ArticleCard from '../components/ui/ArticleCard';
import CategoryBadge from '../components/ui/CategoryBadge';

interface CategoryPageProps {
  categorySlug: string;
  categoryName: string;
  description: string;
  parentSection?: 'entertainment' | 'lifestyle';
}

export default function CategoryPage({ categorySlug, categoryName, description, parentSection }: CategoryPageProps) {
  const categoryPosts = useMemo(
    () => latestPosts.filter(p => p.categorySlug === categorySlug),
    [categorySlug]
  );
  const otherPosts = latestPosts.filter(p => p.categorySlug !== categorySlug).slice(0, 4);
  const hero = categoryPosts[0];
  const rest = categoryPosts.slice(1);

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#6C63FF] transition-colors">Home</Link>
          <span>/</span>
          {parentSection && (
            <>
              <Link to={`/${parentSection}`} className="hover:text-[#6C63FF] transition-colors capitalize">{parentSection}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-400">{categoryName}</span>
        </nav>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">{categoryName}</h1>
            <p className="mt-2 text-gray-500 text-lg">{description}</p>
          </div>
          <CategoryBadge category={categoryName} slug={categorySlug} size="md" />
        </div>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] rounded-full" />
      </div>

      {categoryPosts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-gray-500 text-lg">No stories yet in {categoryName}. Check back soon!</p>
          <Link to="/" className="mt-6 inline-block text-[#6C63FF] font-semibold hover:underline">← Back to Home</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hero post */}
            {hero && (
              <Link to={`/article/${hero.slug}`} className="group block rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 card-hover shadow-sm">
                <div className="img-zoom aspect-video">
                  <img src={hero.coverImage} alt={hero.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <CategoryBadge category={hero.category} slug={hero.categorySlug} size="md" />
                  <h2 className="mt-3 font-display font-black text-2xl lg:text-3xl text-gray-900 dark:text-white leading-tight group-hover:text-[#6C63FF] transition-colors">
                    {hero.title}
                  </h2>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 leading-relaxed">{hero.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <img src={hero.author.avatar} alt={hero.author.name} className="w-7 h-7 rounded-full" />
                      <span>{hero.author.name}</span>
                    </div>
                    <span>{hero.readingTime} min read</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                      {formatViews(hero.views)}
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of rest */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {rest.map(post => <ArticleCard key={post.id} post={post} />)}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm lg:sticky lg:top-20">
              <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-4">More Stories</h3>
              <div className="space-y-4">
                {otherPosts.map(p => <ArticleCard key={p.id} post={p} variant="horizontal" />)}
              </div>
            </div>

            {/* Newsletter widget */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] p-5 text-white">
              <h3 className="font-display font-black text-lg mb-2">Get {categoryName} Updates</h3>
              <p className="text-white/70 text-sm mb-4">Be first to read the latest stories.</p>
              <form onSubmit={e => e.preventDefault()} className="space-y-2">
                <input type="email" placeholder="your@email.com" required
                  className="w-full bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/25 transition-colors" />
                <button type="submit" className="w-full bg-white text-[#6C63FF] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors">
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
