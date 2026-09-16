import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { filterContent } from '../lib/profanityFilter.js';

const router = Router();

const CreateCommentSchema = z.object({
  content:    z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  postId:     z.string().min(1),
  guestName:  z.string().min(1).max(100).optional(),
  guestEmail: z.string().email().optional(),
});

// ── GET /api/comments/post/:postId — public, approved comments ────────────────
router.get('/post/:postId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.postId, approved: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar')
        .lean(),
      Comment.countDocuments({ post: req.params.postId, approved: true }),
    ]);

    res.json({ comments, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/comments — admin only ───────────────────────────────────────────
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

// ── POST /api/comments — public ───────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, postId, guestName, guestEmail } = CreateCommentSchema.parse(req.body);

    // Verify the post exists and is published
    const post = await Post.findOne({ _id: postId, published: true }).lean();
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Try to resolve logged-in user from Bearer token
    const token = req.headers.authorization?.split(' ')[1];
    let authorId: string | undefined;
    if (token) {
      try {
        const { verifyToken } = await import('../lib/jwt.js');
        const payload = verifyToken(token);
        authorId = payload.userId;
      } catch { /* guest */ }
    }

    // Guest comments need a name
    if (!authorId && !guestName?.trim()) {
      res.status(400).json({ message: 'Please provide your name to comment.' });
      return;
    }

    // ── Profanity / harmful-content check ────────────────────────────────────
    const filter = filterContent(content);

    if (!filter.clean) {
      // Reject outright — don't save at all
      res.status(422).json({
        message: 'Your comment contains language that is not allowed. Please revise it.',
        flaggedWords: filter.flaggedWords,
        _rejected: true,
      });
      return;
    }

    // Clean comment → auto-approve, visible immediately
    const comment = await Comment.create({
      content:    content.trim(),
      post:       postId,
      author:     authorId,
      guestName:  authorId ? undefined : guestName?.trim(),
      guestEmail: authorId ? undefined : guestEmail?.trim(),
      approved:   true,   // ✅ no harmful words — publish straight away
    });

    // Populate author so the client can display it
    await comment.populate('author', 'name avatar');

    res.status(201).json({
      ...comment.toObject(),
      _autoApproved: true,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/comments/:postId/like — public ─────────────────────────────────
router.post('/:postId/like', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { likes: 1 } },
      { new: true }
    ).select('likes').lean();

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.json({ likes: post.likes });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/comments/:id/approve — admin only ─────────────────────────────
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

// ── DELETE /api/comments/:id — admin only ─────────────────────────────────────
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
