import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Comment } from '../models/Comment.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

const CreateCommentSchema = z.object({
  content:    z.string().min(1).max(2000),
  postId:     z.string(),
  guestName:  z.string().optional(),
  guestEmail: z.string().email().optional(),
});

// GET /api/comments — admin only, all comments with filters
router.get('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page     = Math.max(1, Number(req.query.page) || 1);
      const limit    = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const approved = req.query.approved;
      const search   = req.query.search as string | undefined;

      const filter: Record<string, unknown> = {};
      if (approved === 'true')  filter.approved = true;
      if (approved === 'false') filter.approved = false;
      if (search) filter.content = { $regex: search, $options: 'i' };

      const [comments, total] = await Promise.all([
        Comment.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('post', 'title slug')
          .populate('author', 'name avatar')
          .lean(),
        Comment.countDocuments(filter),
      ]);

      res.json({ comments, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/comments — public (guest or logged-in user)
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, postId, guestName, guestEmail } = CreateCommentSchema.parse(req.body);

    const token = req.headers.authorization?.split(' ')[1];
    let authorId: string | undefined;

    if (token) {
      try {
        const { verifyToken } = await import('../lib/jwt.js');
        const payload = verifyToken(token);
        authorId = payload.userId;
      } catch { /* guest comment */ }
    }

    const comment = await Comment.create({
      content,
      post:       postId,
      author:     authorId,
      guestName:  authorId ? undefined : guestName,
      guestEmail: authorId ? undefined : guestEmail,
      approved:   false, // all comments need moderation
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/comments/:id/approve — admin only
router.patch('/:id/approve', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params.id, { approved: true }, { new: true }
      );
      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }
      res.json(comment);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/comments/:id — admin only
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findByIdAndDelete(req.params.id);
      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
