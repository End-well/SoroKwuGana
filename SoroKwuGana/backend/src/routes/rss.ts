/**
 * GET /rss.xml — RSS 2.0 feed for SoroKwuGana
 * Zapier, IFTTT, Buffer, and other tools can subscribe to this URL
 * to get notified when new posts are published.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { Post } from '../models/Post.js';

const router = Router();

const SITE_URL  = process.env.SITE_URL  ?? 'http://localhost:5173';
const SITE_NAME = 'SoroKwuGana';
const SITE_DESC = 'African entertainment, lifestyle, celebrity, music, movies and culture news.';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await Post.find({ published: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(20)
      .populate('category', 'name slug')
      .populate('author', 'name')
      .lean();

    const items = posts.map(post => {
      const url      = `${SITE_URL}/article/${post.slug}`;
      const title    = escapeXml(post.title);
      const excerpt  = escapeXml(post.excerpt ?? post.content?.slice(0, 200) ?? '');
      const author   = escapeXml((post.author as { name?: string })?.name ?? 'SoroKwuGana');
      const category = escapeXml((post.category as { name?: string })?.name ?? '');
      const pubDate  = new Date(post.publishedAt ?? post.createdAt).toUTCString();
      const image    = post.coverImage ?? '';

      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${excerpt}</description>
      <author>${author}</author>
      <category>${category}</category>
      <pubDate>${pubDate}</pubDate>
      ${image ? `<enclosure url="${escapeXml(image)}" type="image/jpeg" length="0"/>` : ''}
      <media:content url="${escapeXml(image)}" medium="image"/>
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>en-NG</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.png</url>
      <title>${SITE_NAME}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300'); // cache 5 mins
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;
