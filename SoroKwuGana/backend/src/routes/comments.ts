import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import { filterContent } from '../lib/profanityFilter.js';

const router = Router();

// ── Shared schema ─────────────────────────────────────────────────────────────
const CreateCommentSchema = z.object({
  content:    z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
  postId:     z.string().min(1),
  parentId:   z.string().optional().nullable(),   // null = top-level
  guestName:  z.string().min(1).max(100).optional(),
  guestEmail: z.string().email().optional(),
});

// ── Helper: resolve guest/auth user from request ──────────────────────────────
async function resolveAuthor(req: AuthRequest): Promise<string | undefined> {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return undefined;
  try {
    const { verifyToken } = await import('../lib/jwt.js');
    return verifyToken(token).userId;
  } catch {
    return undefined;
  }
}

// ── GET /api/comments/post/:postId ────────────────────────────────────────────
// Returns ALL approved comments for the post flat, client builds the tree.
router.get('/post/:postId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      approved: true,
    })
      .sort({ createdAt: 1 }) // oldest first so tree renders in order
      .populate('author', 'name avatar')
      .lean();

    res.json({ comments, total: comments.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/comments/stats — admin stats ────────────────────────────────────
router.get('/stats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [total, approved, pending, replies] = await Promise.all([
        Comment.countDocuments(),
        Comment.countDocuments({ approved: true }),
        Comment.countDocuments({ approved: false }),
        Comment.countDocuments({ parentId: { $ne: null } }),
      ]);
      res.json({ total, approved, pending, replies, topLevel: total - replies });
    } catch (err) { next(err); }
  }
);

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

// ── POST /api/comments — create top-level comment or reply ────────────────────
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, postId, parentId, guestName, guestEmail } =
      CreateCommentSchema.parse(req.body);

    // Post must exist and be published
    const post = await Post.findOne({ _id: postId, published: true }).lean();
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // If replying, parent comment must exist and belong to same post
    if (parentId) {
      const parent = await Comment.findById(parentId).lean();
      if (!parent || parent.post.toString() !== postId) {
        res.status(404).json({ message: 'Parent comment not found' });
        return;
      }
    }

    const authorId = await resolveAuthor(req);

    if (!authorId && !guestName?.trim()) {
      res.status(400).json({ message: 'Please provide your name to comment.' });
      return;
    }

    // Profanity check
    const filter = filterContent(content);
    if (!filter.clean) {
      res.status(422).json({
        message: 'Your comment contains language that is not allowed. Please revise it.',
        flaggedWords: filter.flaggedWords,
        _rejected: true,
      });
      return;
    }

    const comment = await Comment.create({
      content:    content.trim(),
      post:       postId,
      parentId:   parentId ?? null,
      author:     authorId,
      guestName:  authorId ? undefined : guestName?.trim(),
      guestEmail: authorId ? undefined : guestEmail?.trim(),
      approved:   true,
    });

    await comment.populate('author', 'name avatar');

    res.status(201).json({ ...comment.toObject(), _autoApproved: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/comments/:postId/like ──────────────────────────────────────────
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

// ── PATCH /api/comments/:id/approve ──────────────────────────────────────────
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

// ── PATCH /api/comments/:id/toggle — flip approved on/off ────────────────────
router.patch('/:id/toggle', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await Comment.findById(req.params.id);
      if (!existing) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }
      existing.approved = !existing.approved;
      await existing.save();
      res.json(existing);
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/comments/:id ──────────────────────────────────────────────────
router.delete('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Also delete all descendant replies
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      // BFS to find all descendant IDs
      const toDelete: string[] = [String(req.params.id)];
      let queue = [String(req.params.id)];
      while (queue.length) {
        const children = await Comment.find({ parentId: { $in: queue } })
          .select('_id').lean();
        const ids = children.map(c => c._id.toString());
        toDelete.push(...ids);
        queue = ids;
      }

      await Comment.deleteMany({ _id: { $in: toDelete } });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
