export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: { name: string; avatar: string; role: string };
  publishedAt: string;
  readingTime: number;
  views: number;
  likes: number;
  coverImage: string;
  featured?: boolean;
  breaking?: boolean;
  tags: string[];
}

const UNSPLASH = (id: string, w = 800, h = 500) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const posts: Post[] = [
  // ── Hero / Featured ──
  {
    id: '1',
    title: "The Music Industry's Biggest Comeback: How Afrobeats Conquered the Globe",
    slug: 'afrobeats-global-conquest',
    excerpt: 'From Lagos to Los Angeles, Afrobeats has rewritten the global music rulebook — and the movement is only just getting started.',
    category: 'Music',
    categorySlug: 'music',
    author: { name: 'Adaeze Okafor', avatar: 'https://i.pravatar.cc/40?img=47', role: 'Music Editor' },
    publishedAt: '2026-07-05',
    readingTime: 8,
    views: 142_000,
    likes: 8_400,
    coverImage: UNSPLASH('photo-1493225457124-a3eb161ffa5f', 1200, 700),
    featured: true,
    breaking: false,
    tags: ['Afrobeats', 'Music', 'Nigeria', 'Global'],
  },
  {
    id: '2',
    title: "Fashion Week 2026: The Trends That Will Define Your Wardrobe",
    slug: 'fashion-week-2026-trends',
    excerpt: 'Bold colours, sculptural silhouettes, and a bold return of Y2K aesthetics dominated the runways in Paris, Milan and Lagos.',
    category: 'Fashion',
    categorySlug: 'fashion',
    author: { name: 'Chioma Bello', avatar: 'https://i.pravatar.cc/40?img=45', role: 'Fashion Director' },
    publishedAt: '2026-07-04',
    readingTime: 6,
    views: 98_000,
    likes: 5_200,
    coverImage: UNSPLASH('photo-1469334031218-e382a71b716b', 800, 500),
    featured: true,
    tags: ['Fashion', 'Style', 'Runway', '2026'],
  },
  {
    id: '3',
    title: 'Breaking: Major Hollywood Studio Signs First African Superhero Franchise',
    slug: 'african-superhero-franchise',
    excerpt: 'In a landmark deal, a major Hollywood studio has acquired rights to an African superhero IP set to rival the MCU.',
    category: 'Movies',
    categorySlug: 'movies',
    author: { name: 'Emeka Nwosu', avatar: 'https://i.pravatar.cc/40?img=12', role: 'Entertainment Reporter' },
    publishedAt: '2026-07-06',
    readingTime: 5,
    views: 210_000,
    likes: 14_200,
    coverImage: UNSPLASH('photo-1536440136628-849c177e76a1', 800, 500),
    featured: true,
    breaking: true,
    tags: ['Movies', 'Hollywood', 'Africa', 'Superhero'],
  },
  {
    id: '4',
    title: "Celebrity Weddings of 2026: The Most Stunning Ceremonies So Far",
    slug: 'celebrity-weddings-2026',
    excerpt: 'From intimate beach ceremonies to extravagant ballroom affairs, here are the celebrity unions that had everyone talking.',
    category: 'Celebrity',
    categorySlug: 'celebrity',
    author: { name: 'Ngozi Eze', avatar: 'https://i.pravatar.cc/40?img=32', role: 'Celebrity Correspondent' },
    publishedAt: '2026-07-03',
    readingTime: 7,
    views: 176_000,
    likes: 9_800,
    coverImage: UNSPLASH('photo-1519741347686-c1e0aadf4611', 800, 500),
    featured: false,
    tags: ['Celebrity', 'Weddings', '2026', 'Gossip'],
  },
  {
    id: '5',
    title: 'The 10 Best TV Shows of 2026 You Absolutely Cannot Miss',
    slug: 'best-tv-shows-2026',
    excerpt: 'Streaming wars are hotter than ever. These are the series dominating conversations from Twitter to office break rooms.',
    category: 'TV Shows',
    categorySlug: 'tv-shows',
    author: { name: 'Tunde Adeyemi', avatar: 'https://i.pravatar.cc/40?img=8', role: 'TV Critic' },
    publishedAt: '2026-07-02',
    readingTime: 9,
    views: 88_000,
    likes: 4_600,
    coverImage: UNSPLASH('photo-1522869635100-9f4c5e86aa37', 800, 500),
    featured: false,
    tags: ['TV Shows', 'Streaming', 'Netflix', '2026'],
  },
  {
    id: '6',
    title: 'Skin Care Secrets: The Nigerian Beauty Routine Taking Over TikTok',
    slug: 'nigerian-beauty-routine-tiktok',
    excerpt: 'Indigenous ingredients and century-old practices are going viral. Discover the routines that have millions obsessed.',
    category: 'Beauty',
    categorySlug: 'beauty',
    author: { name: 'Amara Obi', avatar: 'https://i.pravatar.cc/40?img=56', role: 'Beauty Editor' },
    publishedAt: '2026-07-01',
    readingTime: 6,
    views: 65_000,
    likes: 3_900,
    coverImage: UNSPLASH('photo-1596462502278-27bfdc403348', 800, 500),
    featured: false,
    tags: ['Beauty', 'Skincare', 'TikTok', 'Nigeria'],
  },
  {
    id: '7',
    title: '50 Breathtaking Destinations to Visit in Africa Before 2030',
    slug: 'africa-travel-destinations-2030',
    excerpt: 'The continent is open and calling. From the dunes of Namibia to the shores of Zanzibar — your ultimate Africa bucket list.',
    category: 'Travel',
    categorySlug: 'travel',
    author: { name: 'Kofi Mensah', avatar: 'https://i.pravatar.cc/40?img=15', role: 'Travel Writer' },
    publishedAt: '2026-06-30',
    readingTime: 12,
    views: 54_000,
    likes: 3_100,
    coverImage: UNSPLASH('photo-1516026672322-bc52d61a55d5', 800, 500),
    tags: ['Travel', 'Africa', 'Bucket List', 'Adventure'],
  },
  {
    id: '8',
    title: 'Jollof Wars: Scientists Finally Settle the Nigeria vs Ghana Debate',
    slug: 'jollof-wars-nigeria-ghana',
    excerpt: 'A bold study of 10,000 taste-testers has produced results so conclusive they may finally end the greatest culinary debate in African history.',
    category: 'Food',
    categorySlug: 'food',
    author: { name: 'Bola Fashola', avatar: 'https://i.pravatar.cc/40?img=22', role: 'Food Critic' },
    publishedAt: '2026-06-28',
    readingTime: 5,
    views: 320_000,
    likes: 22_000,
    coverImage: UNSPLASH('photo-1567620905732-2d1ec7ab7445', 800, 500),
    tags: ['Food', 'Jollof', 'Nigeria', 'Ghana', 'Viral'],
  },
  {
    id: '9',
    title: 'Health Reset: 30-Day Challenge That Changed 1 Million Lives',
    slug: 'health-reset-30-day-challenge',
    excerpt: 'One viral challenge. One million transformations. We spoke to the people whose lives were changed by putting their phones down and moving their bodies.',
    category: 'Health',
    categorySlug: 'health',
    author: { name: 'Dr. Funke Adeyemi', avatar: 'https://i.pravatar.cc/40?img=38', role: 'Health & Wellness Editor' },
    publishedAt: '2026-06-27',
    readingTime: 8,
    views: 47_000,
    likes: 2_800,
    coverImage: UNSPLASH('photo-1571019613454-1cb2f99b2d8b', 800, 500),
    tags: ['Health', 'Wellness', 'Fitness', 'Challenge'],
  },
  {
    id: '10',
    title: "GTA VI Review: Rockstar's Greatest Achievement — or Biggest Letdown?",
    slug: 'gta-vi-review',
    excerpt: 'After years of waiting, GTA VI is finally here. We played it for 80 hours straight. Here is our verdict.',
    category: 'Reviews',
    categorySlug: 'reviews',
    author: { name: 'Chike Obi', avatar: 'https://i.pravatar.cc/40?img=5', role: 'Gaming & Tech Critic' },
    publishedAt: '2026-06-26',
    readingTime: 15,
    views: 485_000,
    likes: 31_000,
    coverImage: UNSPLASH('photo-1550745165-9bc0b252726f', 800, 500),
    tags: ['Gaming', 'Reviews', 'GTA VI', 'Rockstar'],
  },
  {
    id: '11',
    title: 'The Rise of Nollywood 2.0: Inside the Billion-Dollar Renaissance',
    slug: 'nollywood-2-renaissance',
    excerpt: 'New studios, Netflix deals, and a new generation of directors are transforming Nigerian cinema into a global powerhouse.',
    category: 'Movies',
    categorySlug: 'movies',
    author: { name: 'Emeka Nwosu', avatar: 'https://i.pravatar.cc/40?img=12', role: 'Entertainment Reporter' },
    publishedAt: '2026-06-25',
    readingTime: 10,
    views: 93_000,
    likes: 5_600,
    coverImage: UNSPLASH('photo-1485846234645-a62644f84728', 800, 500),
    tags: ['Movies', 'Nollywood', 'Nigeria', 'Netflix'],
  },
  {
    id: '12',
    title: "Style File: How to Build a Capsule Wardrobe on a Budget",
    slug: 'capsule-wardrobe-budget',
    excerpt: 'Looking expensive has nothing to do with spending big. Our fashion editors share the ultimate capsule wardrobe guide.',
    category: 'Fashion',
    categorySlug: 'fashion',
    author: { name: 'Chioma Bello', avatar: 'https://i.pravatar.cc/40?img=45', role: 'Fashion Director' },
    publishedAt: '2026-06-24',
    readingTime: 7,
    views: 41_000,
    likes: 2_400,
    coverImage: UNSPLASH('photo-1558618666-fcd25c85cd64', 800, 500),
    tags: ['Fashion', 'Style', 'Budget', 'Tips'],
  },
];

export const trendingPosts = posts.slice().sort((a, b) => b.views - a.views).slice(0, 5);
export const featuredPosts = posts.filter(p => p.featured);
export const latestPosts   = posts.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function getPostsByCategory(slug: string) {
  return posts.filter(p => p.categorySlug === slug);
}

export function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
