import { Link } from 'react-router-dom';
import { trendingPosts, latestPosts, formatViews, formatDate } from '../data/mockPosts';
import ArticleCard from '../components/ui/ArticleCard';

export default function Trending() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-[#6C63FF]">Home</Link> <span>/</span>
          <span className="text-gray-400">Trending</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">Trending & Viral</h1>
        <p className="mt-2 text-gray-500 text-lg">What the internet can't stop talking about right now.</p>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-[#FF4D6D] to-[#6C63FF] rounded-full" />
      </div>

      {/* Top trending numbered list */}
      <section className="mb-12">
        <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-6">🔥 Top Stories Right Now</h2>
        <div className="space-y-3">
          {trendingPosts.map((post, i) => (
            <Link key={post.id} to={`/article/${post.slug}`}
              className="group flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 card-hover shadow-sm hover:border-[#6C63FF]/30 transition-all">
              <span className="text-3xl font-black w-12 text-center flex-shrink-0 gradient-text opacity-50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="hidden xs:block img-zoom w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={post.coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#6C63FF] uppercase tracking-wider mb-1">{post.category}</p>
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#6C63FF] transition-colors line-clamp-2 text-sm lg:text-base leading-snug">
                  {post.title}
                </h3>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-400">
                <span>{formatViews(post.views)} views</span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All latest */}
      <section>
        <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-6">All Stories</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map(post => <ArticleCard key={post.id} post={post} />)}
        </div>
      </section>
    </div>
  );
}
