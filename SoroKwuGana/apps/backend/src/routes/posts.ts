import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

const PostSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().url().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  categoryId: z.string(),
  tags: z.array(z.string()).optional(),
});

// GET /api/posts — public, published only
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const category = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category;
    const featured = req.query.featured === 'true';

    const where = {
      published: true,
      ...(category && { category: { slug: category as string } }),
      ...(featured && { featured: true }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverImage: true, featured: true, views: true,
          publishedAt: true, createdAt: true,
          category: { select: { name: true, slug: true } },
          author: { select: { name: true, avatar: true } },
          tags: { select: { tag: { select: { name: true, slug: true } } } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:slug — public
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: String(req.params.slug), published: true },
      include: {
        category: true,
        author: { select: { name: true, avatar: true, bio: true } },
        tags: { include: { tag: true } },
        comments: { where: { approved: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    // Increment view count
    await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — authors and above
router.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = PostSchema.parse(req.body);
      const { tags, ...postData } = data;
      const post = await prisma.post.create({
        data: {
          ...postData,
          authorId: req.user!.userId,
          publishedAt: postData.published ? new Date() : null,
          ...(tags?.length && {
            tags: {
              create: await Promise.all(
                tags.map(async (name) => {
                  const slug = name.toLowerCase().replace(/\s+/g, '-');
                  const tag = await prisma.tag.upsert({
                    where: { slug }, update: {}, create: { name, slug },
                  });
                  return { tagId: tag.id };
                })
              ),
            },
          }),
        },
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
      const data = PostSchema.partial().parse(req.body);
      const { tags: _tags, ...postData } = data;
      const post = await prisma.post.update({
        where: { id: String(req.params.id) },
        data: {
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          coverImage: postData.coverImage ?? null,
          published: postData.published,
          featured: postData.featured,
          categoryId: postData.categoryId,
          ...(postData.published === true && { publishedAt: new Date() }),
        },
      });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id — admin and above
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.post.delete({ where: { id: String(_req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
