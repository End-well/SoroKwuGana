import { Router } from 'express';
import authRouter from './auth.js';
import postsRouter from './posts.js';
import categoriesRouter from './categories.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/posts', postsRouter);
router.use('/categories', categoriesRouter);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
