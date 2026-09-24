import { Router, Request, Response, NextFunction } from 'express';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/stats — dashboard stats
router.get('/stats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalPosts, published, drafts, pendingComments, totalUsers, totalCategories] = await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ published: true }),
        Post.countDocuments({ published: false }),
        Comment.countDocuments({ approved: false }),
        User.countDocuments(),
        Category.countDocuments(),
      ]);

      res.json({ totalPosts, published, drafts, pendingComments, totalUsers, totalCategories });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/posts — all posts (including drafts) for admin
router.get('/posts', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page     = Math.max(1, Number(req.query.page) || 1);
      const limit    = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
      const status   = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const search   = req.query.search as string | undefined;

      const filter: Record<string, unknown> = {};

      // Authors can only see their own posts
      if (req.user?.role === 'AUTHOR') filter.author = req.user.userId;

      if (status === 'published') filter.published = true;
      if (status === 'draft')     filter.published = false;

      // Resolve category slug → _id before filtering
      if (category) {
        const cat = await Category.findOne({ slug: category }).select('_id').lean();
        if (cat) {
          filter.category = cat._id;
        } else {
          // Unknown slug — return empty
          res.json({ posts: [], total: 0, page, pages: 0 });
          return;
        }
      }

      if (search)   filter.title = { $regex: search, $options: 'i' };

      const [posts, total] = await Promise.all([
        Post.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('category', 'name slug')
          .populate('author', 'name avatar')
          .select('-content')
          .lean(),
        Post.countDocuments(filter),
      ]);

      res.json({ posts, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/admin/posts/:id — single post with full content for editing
router.get('/posts/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN', 'AUTHOR'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await Post.findById(req.params.id)
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

// GET /api/admin/recent — recent activity feed
router.get('/recent', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [recentPosts, recentComments] = await Promise.all([
        Post.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('author', 'name')
          .populate('category', 'name slug')
          .select('title slug published createdAt author category')
          .lean(),
        Comment.find({ approved: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('post', 'title slug')
          .lean(),
      ]);

      res.json({ recentPosts, recentComments });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
