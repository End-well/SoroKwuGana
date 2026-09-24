import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Post } from '../models/Post.js';
import { Tag } from '../models/Tag.js';
import { Category } from '../models/Category.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

const MediaItemSchema = z.object({
  url:     z.string().url(),
  type:    z.enum(['image', 'video']),
  caption: z.string().optional(),
  source:  z.string().optional(),
});

const PostSchema = z.object({
  title:           z.string().min(3),
  slug:            z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  excerpt:         z.string().optional(),
  content:         z.string().min(1),
  coverImage:      z.string().url().optional().or(z.literal('')),
  referenceImages: z.array(MediaItemSchema).optional().default([]),
  videos:          z.array(MediaItemSchema).optional().default([]),
  published:       z.boolean().optional(),
  featured:        z.boolean().optional(),
  breaking:        z.boolean().optional(),
  rating:          z.number().min(1).max(10).optional().nullable(),
  categoryId:      z.string(),
  tags:            z.array(z.string()).optional(),
});

// ── Shared tag upsert helper ──────────────────────────────────────────────────
async function upsertTags(names: string[]): Promise<string[]> {
  const ids = await Promise.all(
    names.map(async (name) => {
      const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
      const tag = await Tag.findOneAndUpdate(
        { slug },
        { $setOnInsert: { name: name.trim(), slug } },
        { upsert: true, new: true }
      );
      return tag!._id.toString();
    })
  );
  return ids;
}

// ── GET /api/posts — public, published only ───────────────────────────────────
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page     = Math.max(1, Number(req.query.page) || 1);
    const limit    = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const catSlug  = req.query.category as string | undefined;
    const featured = req.query.featured === 'true';

    const filter: Record<string, unknown> = { published: true };

    if (catSlug) {
      const cat = await Category.findOne({ slug: catSlug });
      if (cat) filter.category = cat._id;
      else {
        res.json({ posts: [], total: 0, page, pages: 0 });
        return;
      }
    }

    if (featured) filter.featured = true;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .populate('tags', 'name slug')
        .select('-content -referenceImages -videos')
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/posts/:slug — public, full post with all media ───────────────────
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true })
      .populate('category', 'name slug parent')
      .populate('author', 'name avatar bio role')
      .populate('tags', 'name slug');

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }).exec();
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/posts — authors and above ───────────────────────────────────────
router.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { tags, categoryId, ...rest } = PostSchema.parse(req.body);

      const tagIds = tags?.length ? await upsertTags(tags) : [];

      const now = new Date();
      const post = await Post.create({
        ...rest,
        category:    categoryId,
        author:      req.user!.userId,
        tags:        tagIds,
        publishedAt: rest.published ? now : undefined,
      });

      const populated = await Post.findById(post._id)
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .populate('tags', 'name slug');

      res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/posts/:id — owner or admin ─────────────────────────────────────
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { tags, categoryId, ...rest } = PostSchema.partial().parse(req.body);

      const update: Record<string, unknown> = { ...rest };

      if (categoryId) update.category = categoryId;

      if (tags !== undefined) {
        update.tags = tags.length ? await upsertTags(tags) : [];
      }

      if (rest.published === true) {
        const existing = await Post.findById(req.params.id).select('publishedAt').lean();
        if (existing && !existing.publishedAt) {
          update.publishedAt = new Date();
        }
      }

      const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('category', 'name slug')
        .populate('author', 'name avatar')
        .populate('tags', 'name slug');

      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/posts/:id/rate — public, user community rating ─────────────────
router.post('/:id/rate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const score = Number(req.body.score);
    if (!score || score < 1 || score > 10 || !Number.isInteger(score)) {
      res.status(400).json({ message: 'Score must be an integer between 1 and 10.' });
      return;
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { userRatingSum: score, userRatingCount: 1 } },
      { new: true }
    ).select('userRatingSum userRatingCount userRatingAvg').lean();

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const avg = parseFloat((post.userRatingSum / post.userRatingCount).toFixed(1));
    await Post.findByIdAndUpdate(req.params.id, { userRatingAvg: avg });

    res.json({ userRatingAvg: avg, userRatingCount: post.userRatingCount });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/posts/:id — admin and above ───────────────────────────────────
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
