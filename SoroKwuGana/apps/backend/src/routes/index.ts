import { Router } from 'express';
import authRouter      from './auth.js';
import postsRouter     from './posts.js';
import categoriesRouter from './categories.js';
import usersRouter     from './users.js';
import commentsRouter  from './comments.js';
import adminRouter     from './admin.js';

const router = Router();

router.use('/auth',       authRouter);
router.use('/posts',      postsRouter);
router.use('/categories', categoriesRouter);
router.use('/users',      usersRouter);
router.use('/comments',   commentsRouter);
router.use('/admin',      adminRouter);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
