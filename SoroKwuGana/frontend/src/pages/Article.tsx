import { useParams, Link, useNavigate } from 'react-router-dom';
import { posts, formatDate, formatViews } from '../data/mockPosts';
import ArticleCard from '../components/ui/ArticleCard';
import CategoryBadge from '../components/ui/CategoryBadge';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-black text-gray-900 dark:text-white">404</h1>
        <p className="mt-4 text-gray-500">Article not found.</p>
        <button onClick={() => navigate(-1)} className="mt-6 text-[#6C63FF] font-semibold hover:underline">← Go back</button>
      </div>
    );
  }

  const related = posts.filter(p => p.categorySlug === post.categorySlug && p.id !== post.id).slice(0, 3);
  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(post.title);

  // Fake article body paragraphs
  const bodyParagraphs = [
    `${post.excerpt} The story has been developing over the past several weeks, with insiders suggesting that this marks a turning point not just for those directly involved, but for the entire industry.`,
    `Speaking exclusively to SoroKwuGana, sources close to the matter revealed that negotiations had been ongoing for months before the announcement was made public. "This is bigger than people realise," one source told us. "The implications will be felt for years to come."`,
    `The reaction from fans and industry veterans alike has been overwhelmingly positive, with social media lighting up within minutes of the news breaking. Hashtags related to the story trended globally within the hour, racking up millions of impressions across Twitter, Instagram, and TikTok.`,
    `Analysts are already weighing in on what this means for the broader landscape. "We're watching history being made in real time," said Dr. Amara Okonkwo of the University of Lagos's Media Studies department. "The cultural implications cannot be overstated."`,
    `What remains to be seen is how this development will unfold in the coming weeks and months. SoroKwuGana will be following the story closely and will bring you updates as they happen. In the meantime, be sure to check our trending section for related stories and deeper dives into what's happening right now.`,
  ];

  return (
    <article className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-[#6C63FF] transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/entertainment/${post.categorySlug}`} className="hover:text-[#6C63FF] transition-colors capitalize">{post.category}</Link>
            <span>/</span>
            <span className="text-gray-400 truncate max-w-xs">{post.title}</span>
          </nav>

          {/* Category + Breaking */}
          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={post.category} slug={post.categorySlug} size="md" />
            {post.breaking && (
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FF4D6D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D] animate-pulse-dot" /> Breaking
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display font-black text-3xl lg:text-5xl text-gray-900 dark:text-white leading-tight mb-5">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800 mb-6">
            <div className="flex items-center gap-2.5">
              <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#6C63FF]/20" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                <p className="text-xs text-gray-500">{post.author.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                {post.readingTime} min read
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
                {formatViews(post.views)}
              </span>
            </div>
            {/* Share buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-400 font-medium">Share:</span>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#6C63FF] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Share on X">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Share on Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <button onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#6C63FF] hover:text-white text-gray-600 dark:text-gray-300 transition-colors" aria-label="Copy link">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"/></svg>
              </button>
            </div>
          </div>

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden mb-8 shadow-xl">
            <img src={post.coverImage} alt={post.title} className="w-full max-h-[500px] object-cover" />
          </div>

          {/* Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-6 font-display italic">
              "{post.excerpt}"
            </p>
            {bodyParagraphs.map((p, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-base lg:text-lg">
                {p}
              </p>
            ))}

            {/* Pull quote */}
            <blockquote className="my-10 pl-6 border-l-4 border-[#6C63FF]">
              <p className="font-display font-black text-2xl text-gray-900 dark:text-white leading-snug italic">
                "The cultural implications cannot be overstated. We're watching history being made."
              </p>
              <cite className="mt-2 text-sm text-gray-500 not-italic">— Dr. Amara Okonkwo, University of Lagos</cite>
            </blockquote>

            {bodyParagraphs.slice(3).map((p, i) => (
              <p key={`b${i}`} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-base lg:text-lg">{p}</p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-500 mb-3">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Link key={tag} to={`/trending?tag=${tag}`}
                  className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] transition-colors font-medium">
                  #{tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Author card */}
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-4">
              <img src={post.author.avatar} alt={post.author.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-[#6C63FF]/20 flex-shrink-0" />
              <div>
                <p className="font-black text-gray-900 dark:text-white">{post.author.name}</p>
                <p className="text-sm text-[#6C63FF] font-medium mb-2">{post.author.role}</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A seasoned journalist covering the best in entertainment and culture. With over a decade of experience, their stories have shaped conversations across Africa and the diaspora.
                </p>
              </div>
            </div>
          </div>

          {/* Prev / Next */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {posts[posts.findIndex(p => p.id === post.id) - 1] && (
              <Link to={`/article/${posts[posts.findIndex(p => p.id === post.id) - 1].slug}`}
                className="group p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#6C63FF]/40 bg-white dark:bg-gray-900 transition-colors shadow-sm">
                <p className="text-xs text-gray-400 mb-1">← Previous</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#6C63FF] transition-colors line-clamp-2">
                  {posts[posts.findIndex(p => p.id === post.id) - 1].title}
                </p>
              </Link>
            )}
            {posts[posts.findIndex(p => p.id === post.id) + 1] && (
              <Link to={`/article/${posts[posts.findIndex(p => p.id === post.id) + 1].slug}`}
                className="group p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#6C63FF]/40 bg-white dark:bg-gray-900 transition-colors shadow-sm text-right sm:ml-auto w-full">
                <p className="text-xs text-gray-400 mb-1">Next →</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#6C63FF] transition-colors line-clamp-2">
                  {posts[posts.findIndex(p => p.id === post.id) + 1].title}
                </p>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm sticky top-20">
            <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-4">Related Stories</h3>
            <div className="space-y-4">
              {related.map(p => <ArticleCard key={p.id} post={p} variant="horizontal" />)}
            </div>
          </div>
        </aside>
      </div>

      {/* Related articles full width */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-8">More in {post.category}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => <ArticleCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </article>
  );
}
