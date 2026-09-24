import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const UpdateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  email:    z.string().email().optional(),
  role:     z.enum(['SUPER_ADMIN', 'ADMIN', 'AUTHOR']).optional(),
  avatar:   z.string().url().optional().or(z.literal('')),
  bio:      z.string().optional(),
  password: z.string().min(8).optional(),
});

const CreateUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['SUPER_ADMIN', 'ADMIN', 'AUTHOR']).default('AUTHOR'),
});

// GET /api/users — admin only
router.get('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page  = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const role  = req.query.role as string | undefined;
      const search = req.query.search as string | undefined;

      const filter: Record<string, unknown> = {};
      if (role && role !== 'ALL') filter.role = role;
      if (search) filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/users — super admin only
router.post('/', authenticate, requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = CreateUserSchema.parse(req.body);

      const existing = await User.findOne({ email });
      if (existing) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, password: hashed, role });

      res.status(201).json({
        id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/users/:id — admin or self
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = UpdateUserSchema.parse(req.body);
      const update: Record<string, unknown> = { ...data };

      if (data.password) {
        update.password = await bcrypt.hash(data.password, 12);
      }

      const user = await User.findByIdAndUpdate(
        req.params.id, update, { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/users/:id — super admin only
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
