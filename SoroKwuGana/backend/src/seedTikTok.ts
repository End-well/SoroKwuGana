import 'dotenv/config';
import { connectDB } from './config/database.js';
import { Post } from './models/Post.js';
import { User } from './models/User.js';
import { Tag } from './models/Tag.js';
import { Category } from './models/Category.js';

async function main() {
  await connectDB();

  const admin = await User.findOne({ role: 'SUPER_ADMIN' });
  if (!admin) { console.error('No admin found.'); process.exit(1); }

  const musicCat = await Category.findOne({ slug: 'music' });
  if (!musicCat) { console.error('Music category not found.'); process.exit(1); }

  const slug = 'sorokwugana-now-on-tiktok-2026';
  const exists = await Post.findOne({ slug });
  if (exists) { console.log('Post already exists:', slug); process.exit(0); }

  // Upsert tags
  const tagNames = ['TikTok', 'SoroKwuGana', 'Afrobeats', 'social media'];
  const tagIds: string[] = [];
  for (const name of tagNames) {
    const s = name.toLowerCase().replace(/\s+/g, '-');
    const t = await Tag.findOneAndUpdate({ slug: s }, { $setOnInsert: { name, slug: s } }, { upsert: true, new: true });
    tagIds.push(t!._id.toString());
  }

  await Post.create({
    title:       'SoroKwuGana Is Now on TikTok — Follow Us for Daily African Entertainment',
    slug,
    excerpt:     'We have officially launched our TikTok page! Follow @sorokwugana_blog for the hottest entertainment, lifestyle, music and celebrity news from Africa every day.',
    content:     `Big news for the SoroKwuGana family — we are now officially on TikTok!\n\nFollow us at @sorokwugana_blog for:\n\n🎵 Afrobeats music news and artist spotlights\n🎬 Nollywood and movie reviews\n👗 African fashion trends and style inspiration\n🌍 Celebrity news from across the continent\n📰 Breaking stories as they happen\n\nOur TikTok page is where we share quick, engaging video content that brings our blog stories to life. Short reviews, trending reactions, and behind-the-scenes content you will not find anywhere else.\n\nTikTok has become one of the biggest platforms for African content creators, and SoroKwuGana is proud to join that conversation. We believe African stories deserve to be told on every platform — and we are bringing our unique voice to the TikTok generation.\n\nHit the follow button now and share this with everyone who loves African entertainment!\n\nSee you on the For You Page! 🎵`,
    coverImage:  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80',
    category:    musicCat._id,
    author:      admin._id,
    tags:        tagIds,
    published:   true,
    featured:    true,
    breaking:    true,
    publishedAt: new Date(),
    videos: [
      {
        url:     'https://www.tiktok.com/@sorokwugana_blog',
        type:    'video',
        caption: 'Follow SoroKwuGana on TikTok — @sorokwugana_blog',
        source:  'TikTok',
      }
    ],
  });

  console.log('✅ TikTok post created:', slug);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
