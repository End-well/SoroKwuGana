import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Category } from '../models/Category.js';
import { Post } from '../models/Post.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const CategorySchema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  parent:      z.string().optional(),
});

// GET /api/categories
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Attach published post count for each category
    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Post.countDocuments({ category: cat._id, published: true });
        return { ...cat, _count: { posts: count } };
      })
    );

    res.json(withCount);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — admin only
router.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = CategorySchema.parse(req.body);
      const category = await Category.create(data);
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
      const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
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
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
