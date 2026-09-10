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
  categoryId:      z.string(),
  tags:            z.array(z.string()).optional(),
});

// GET /api/posts — public, published only
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
    }
    if (featured) filter.featured = true;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ publishedAt: -1 })
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

// GET /api/posts/:slug — public, full post with all media
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true })
      .populate('category')
      .populate('author', 'name avatar bio')
      .populate('tags', 'name slug');

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — authors and above
router.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { tags, categoryId, ...rest } = PostSchema.parse(req.body);

      const tagIds = await Promise.all(
        (tags ?? []).map(async (name) => {
          const slug = name.toLowerCase().replace(/\s+/g, '-');
          const tag = await Tag.findOneAndUpdate(
            { slug },
            { $setOnInsert: { name, slug } },
            { upsert: true, new: true }
          );
          return tag!._id;
        })
      );

      const post = await Post.create({
        ...rest,
        category:    categoryId,
        author:      req.user!.userId,
        tags:        tagIds,
        publishedAt: rest.published ? new Date() : undefined,
      });

      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/posts/:id — owner or admin
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { tags: _tags, categoryId, ...rest } = PostSchema.partial().parse(req.body);

      const update: Record<string, unknown> = { ...rest };
      if (categoryId) update.category = categoryId;
      if (rest.published === true) update.publishedAt = new Date();

      const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
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

// DELETE /api/posts/:id — admin and above
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
