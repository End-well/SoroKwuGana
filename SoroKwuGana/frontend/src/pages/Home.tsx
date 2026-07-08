import { useState } from 'react';
import { Link } from 'react-router-dom';
import { posts, trendingPosts, latestPosts, featuredPosts, formatViews, formatDate } from '../data/mockPosts';
import ArticleCard from '../components/ui/ArticleCard';
import CategoryBadge from '../components/ui/CategoryBadge';

/* ── Hero Section ───────────────────────────────────────────────────────────── */
function HeroSection() {
  const hero = featuredPosts[0];
  const side = featuredPosts.slice(1, 3);

  return (
    <section aria-label="Featured stories" className="max-w-screen-xl mx-auto px-4 lg:px-6 pt-8 pb-12">
      <div className="grid lg:grid-cols-5 gap-4 lg:gap-6">

        {/* Main hero */}
        <Link to={`/article/${hero.slug}`} className="group lg:col-span-3 relative rounded-3xl overflow-hidden block img-zoom min-h-[420px] lg:min-h-[520px] shadow-2xl">
          <img src={hero.coverImage} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          {/* Breaking badge */}
          {hero.breaking && (
            <div className="absolute top-5 left-5">
              <span className="bg-[#FF4D6D] text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot" />BREAKING
              </span>
            </div>
          )}
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <CategoryBadge category={hero.category} slug={hero.categorySlug} size="md" />
            <h1 className="mt-3 font-display font-black text-white text-2xl lg:text-4xl leading-tight group-hover:text-[#00D4FF] transition-colors line-clamp-3">
              {hero.title}
            </h1>
            <p className="mt-2 text-gray-300 text-sm lg:text-base line-clamp-2 max-w-xl">{hero.excerpt}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={hero.author.avatar} alt={hero.author.name} className="w-8 h-8 rounded-full border-2 border-white/30" />
                <span className="text-white/80 text-sm font-medium">{hero.author.name}</span>
              </div>
              <span className="text-white/50 text-sm">{formatDate(hero.publishedAt)}</span>
              <span className="text-white/50 text-sm">{hero.readingTime} min read</span>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#6C63FF] hover:text-white transition-colors shadow-lg">
              Read Story
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/>
              </svg>
            </span>
          </div>
        </Link>

        {/* Side cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {side.map(post => (
            <Link key={post.id} to={`/article/${post.slug}`} className="group relative rounded-2xl overflow-hidden block img-zoom flex-1 min-h-[200px] shadow-xl">
              <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <CategoryBadge category={post.category} slug={post.categorySlug} />
                <h2 className="mt-2 font-display font-bold text-white text-lg leading-snug group-hover:text-[#00D4FF] transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="mt-1 text-gray-400 text-xs">{formatDate(post.publishedAt)} · {post.readingTime} min</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Trending Section ───────────────────────────────────────────────────────── */
function TrendingSection() {
  const [tab, setTab] = useState<'today' | 'week' | 'editors'>('today');
  const tabs = [
    { key: 'today', label: 'Trending Today' },
    { key: 'week',  label: 'This Week' },
    { key: 'editors', label: "Editor's Picks" },
  ] as const;

  return (
    <section aria-label="Trending content" className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800 py-12">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
            <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">What's Hot</h2>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trending list */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {trendingPosts.map((post, i) => (
            <Link key={post.id} to={`/article/${post.slug}`} className="group flex gap-3 items-start bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 card-hover shadow-sm">
              <span className="text-3xl font-black leading-none pt-1 flex-shrink-0 gradient-text opacity-60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <CategoryBadge category={post.category} slug={post.categorySlug} />
                <h3 className="mt-1.5 font-bold text-sm text-gray-900 dark:text-white line-clamp-3 group-hover:text-[#6C63FF] transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                  </svg>
                  {formatViews(post.views)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Category strip ─────────────────────────────────────────────────────────── */
const categories = [
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
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map(cat => (
          <Link key={cat.slug} to={cat.href}
            className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 card-hover shadow-sm hover:border-[#6C63FF]/30 hover:shadow-[#6C63FF]/10 transition-all text-center`}>
            <span className="text-2xl">{cat.emoji}</span>
            <span className={`text-xs font-bold cat-${cat.slug}`}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── Latest Articles Grid ───────────────────────────────────────────────────── */
function LatestArticles() {
  const [visible, setVisible] = useState(6);
  const shown = latestPosts.slice(0, visible);

  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Latest Stories</h2>
        </div>
        <Link to="/trending" className="text-sm font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">View all →</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map(post => <ArticleCard key={post.id} post={post} />)}
      </div>

      {visible < latestPosts.length && (
        <div className="mt-10 text-center">
          <button onClick={() => setVisible(v => v + 6)}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm px-8 py-3 rounded-full hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors shadow-sm">
            Load More Stories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7"/>
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}

/* ── Sidebar Trending + Entertainment spotlight ─────────────────────────────── */
function SidebarSection() {
  return (
    <aside className="space-y-8">
      {/* Most Read */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse-dot" /> Most Read
        </h3>
        <div className="space-y-4">
          {trendingPosts.map((post, i) => (
            <ArticleCard key={post.id} post={{ ...post, id: String(i + 1) }} variant="minimal" />
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] p-6 text-white shadow-xl shadow-[#6C63FF]/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h3 className="font-display font-black text-xl leading-tight mb-2">Never Miss a Story</h3>
          <p className="text-white/80 text-sm mb-5">Join 50,000+ readers. Weekly digest, zero spam.</p>
          <form className="space-y-3" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" required
              className="w-full bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-white placeholder-white/60 text-sm focus:outline-none focus:bg-white/25 transition-colors" />
            <button type="submit" className="w-full bg-white text-[#6C63FF] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-100 transition-colors shadow-lg">
              Subscribe Free →
            </button>
          </form>
          <p className="mt-3 text-white/50 text-xs">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      {/* Trending tags */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h3 className="font-display font-black text-lg text-gray-900 dark:text-white mb-4">Trending Tags</h3>
        <div className="flex flex-wrap gap-2">
          {['#Afrobeats', '#Nollywood', '#Fashion2026', '#JollofWars', '#GTA6', '#Skincare', '#Nigeria', '#Travel', '#Celebrity', '#Music'].map(tag => (
            <Link key={tag} to={`/trending?tag=${tag.slice(1)}`}
              className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-[#6C63FF]/10 hover:text-[#6C63FF] transition-colors font-medium">
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ── Video Section ──────────────────────────────────────────────────────────── */
function VideoSection() {
  const videos = [
    { id: 'dQw4w9WgXcQ', title: 'Afrobeats Goes Global: The Story Behind the Movement', category: 'Music' },
    { id: 'rokGy0huYEA', title: 'Nollywood 2.0: Inside the Nigerian Film Renaissance', category: 'Movies' },
    { id: 'JGwWNGJdvx8', title: 'Fashion Week 2026 Highlights Reel', category: 'Fashion' },
  ];
  return (
    <section className="bg-gray-900 dark:bg-gray-950 py-14">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#FF4D6D] rounded-full" />
            <h2 className="font-display font-black text-2xl text-white">Videos</h2>
          </div>
          <Link to="/videos" className="text-sm font-semibold text-[#00D4FF] hover:text-white transition-colors">See all →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {videos.map(v => (
            <div key={v.id} className="group relative rounded-2xl overflow-hidden bg-black card-hover shadow-xl shadow-black/30">
              <div className="relative aspect-video">
                <img src={`https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`} alt={v.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-[#FF4D6D] ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider">{v.category}</span>
                <h3 className="mt-1 text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#00D4FF] transition-colors">{v.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Newsletter Banner ──────────────────────────────────────────────────────── */
function NewsletterBanner() {
  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 py-16">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#6C63FF] via-[#9C64FF] to-[#FF4D6D] p-10 lg:p-16 text-center text-white shadow-2xl shadow-[#6C63FF]/30">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="relative">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Newsletter</span>
          <h2 className="font-display font-black text-3xl lg:text-5xl leading-tight mb-3">
            Stay in the Loop
          </h2>
          <p className="text-white/75 text-lg max-w-md mx-auto mb-8">
            The hottest stories, delivered to your inbox every morning. 50,000+ readers trust us.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" required
              className="flex-1 bg-white/15 border border-white/25 rounded-2xl px-5 py-3.5 text-white placeholder-white/60 focus:outline-none focus:bg-white/25 transition-colors text-sm" />
            <button type="submit"
              className="bg-white text-[#6C63FF] font-black px-8 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors text-sm shadow-xl whitespace-nowrap">
              Get Stories →
            </button>
          </form>
          <p className="mt-4 text-white/40 text-xs">No spam, ever. Unsubscribe with one click.</p>
        </div>
      </div>
    </section>
  );
}

/* ── Entertainment Spotlight ────────────────────────────────────────────────── */
function EntertainmentSpotlight() {
  const entertainmentPosts = posts.filter(p => ['movies', 'music', 'celebrity', 'tv-shows'].includes(p.categorySlug)).slice(0, 4);
  return (
    <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#FF4D6D] to-[#6C63FF] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Entertainment</h2>
        </div>
        <Link to="/entertainment/movies" className="text-sm font-semibold text-[#6C63FF] hover:text-[#FF4D6D] transition-colors">View all →</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {entertainmentPosts.map(post => <ArticleCard key={post.id} post={post} />)}
      </div>
    </section>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrendingSection />
      <CategoriesStrip />

      {/* Two-column layout: articles + sidebar */}
      <section className="max-w-screen-xl mx-auto px-4 lg:px-6 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LatestArticles />
          </div>
          <SidebarSection />
        </div>
      </section>

      <VideoSection />
      <EntertainmentSpotlight />
      <NewsletterBanner />
    </div>
  );
}
