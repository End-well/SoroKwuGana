import type { NavItem, SocialLink } from '../types';

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Entertainment',
    dropdown: [
      { label: 'Movies', href: '/entertainment/movies' },
      { label: 'TV Shows', href: '/entertainment/tv-shows' },
      { label: 'Music', href: '/entertainment/music' },
      { label: 'Celebrity', href: '/entertainment/celebrity' },
    ],
  },
  {
    label: 'Lifestyle',
    dropdown: [
      { label: 'Fashion', href: '/lifestyle/fashion' },
      { label: 'Beauty', href: '/lifestyle/beauty' },
      { label: 'Health', href: '/lifestyle/health' },
      { label: 'Travel', href: '/lifestyle/travel' },
      { label: 'Food', href: '/lifestyle/food' },
    ],
  },
  { label: 'Trending', href: '/trending' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const socialLinks: SocialLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/sorokwugana', icon: 'instagram' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@sorokwugana_blog', icon: 'tiktok' },
  { label: 'YouTube', href: 'https://youtube.com/@sorokwugana', icon: 'youtube' },
];
