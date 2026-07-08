import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const CategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parent: z.string().optional(),
});

// GET /api/categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: { where: { published: true } } } } },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — admin only
router.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = CategorySchema.parse(req.body);
      const category = await prisma.category.create({ data });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/categories/:id — admin only
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = CategorySchema.partial().parse(req.body);
      const category = await prisma.category.update({ where: { id: String(req.params.id) }, data });
      res.json(category);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/categories/:id — super admin only
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await prisma.category.delete({ where: { id: String(req.params.id) } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
