import { Router } from 'express';
import authRouter       from './auth.js';
import postsRouter      from './posts.js';
import categoriesRouter from './categories.js';
import usersRouter      from './users.js';
import commentsRouter   from './comments.js';
import adminRouter      from './admin.js';
import uploadRouter     from './upload.js';
import newsletterRouter from './newsletter.js';
import advertsRouter    from './adverts.js';
import rssRouter        from './rss.js';

const router = Router();

router.use('/auth',       authRouter);
router.use('/posts',      postsRouter);
router.use('/categories', categoriesRouter);
router.use('/users',      usersRouter);
router.use('/comments',   commentsRouter);
router.use('/admin',      adminRouter);
router.use('/upload',     uploadRouter);
router.use('/newsletter', newsletterRouter);
router.use('/adverts',    advertsRouter);

// RSS feed — Zapier/IFTTT/Buffer subscribe to this
router.use('/rss',        rssRouter);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
