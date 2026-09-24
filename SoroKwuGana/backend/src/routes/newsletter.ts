import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Subscriber } from '../models/Subscriber.js';
import { Post } from '../models/Post.js';
import { NewsletterSend } from '../models/NewsletterSend.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sendMail, buildPostEmail, buildWelcomeEmail, isSmtpConfigured, verifySmtp } from '../lib/mailer.js';

const router = Router();

// ── POST /api/newsletter/subscribe ───────────────────────────────────────────
router.post('/subscribe', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = z.object({
      email: z.string().email(),
      name:  z.string().max(100).optional(),
    }).parse(req.body);

    // Reactivate if previously unsubscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.active) {
        res.status(409).json({ message: 'You are already subscribed!' });
        return;
      }
      existing.active = true;
      if (name) existing.name = name;
      await existing.save();
      res.json({ message: 'Welcome back! You have been re-subscribed.' });
      return;
    }

    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    await Subscriber.create({ email, name, unsubscribeToken });

    // Send welcome email — fire and forget (don't fail the request if email is not configured)
    sendMail({
      to:      email,
      subject: '🎉 You\'re in the loop — SoroKwuGana',
      html:    buildWelcomeEmail({ unsubscribeToken }),
    }).catch(err => console.warn('Welcome email failed (SMTP not configured?):', err.message));

    res.status(201).json({ message: 'You\'re subscribed! Check your inbox for a welcome email.' });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/newsletter/unsubscribe/:token ────────────────────────────────────
router.get('/unsubscribe/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sub = await Subscriber.findOne({ unsubscribeToken: req.params.token });
    if (!sub) {
      res.status(404).send('<h2>Link not found or already unsubscribed.</h2>');
      return;
    }
    sub.active = false;
    await sub.save();
    res.send(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"/>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f4f4f5;margin:0}
      .box{background:#fff;border-radius:16px;padding:40px;text-align:center;max-width:400px;box-shadow:0 2px 12px rgba(0,0,0,.08)}
      h2{color:#111827}p{color:#6b7280}a{color:#6C63FF}</style></head>
      <body><div class="box">
        <h2>Unsubscribed ✓</h2>
        <p>You've been removed from the SoroKwuGana mailing list.<br/>You won't receive any more emails from us.</p>
        <a href="${process.env.SITE_URL ?? 'http://localhost:5173'}">← Back to site</a>
      </div></body></html>
    `);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/newsletter/subscribers — admin only ──────────────────────────────
router.get('/subscribers', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page   = Math.max(1, Number(req.query.page) || 1);
      const limit  = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
      const active = req.query.active;
      const search = req.query.search as string | undefined;

      const filter: Record<string, unknown> = {};
      if (active === 'true')  filter.active = true;
      if (active === 'false') filter.active = false;
      if (search) filter.email = { $regex: search, $options: 'i' };

      const [subscribers, total] = await Promise.all([
        Subscriber.find(filter)
          .sort({ subscribedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Subscriber.countDocuments(filter),
      ]);

      const activeCount = await Subscriber.countDocuments({ active: true });
      res.json({ subscribers, total, activeCount, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/newsletter/subscribers/:id — admin only ──────────────────────
router.delete('/subscribers/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Subscriber.findByIdAndDelete(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/newsletter/send/:postId — send post to all subscribers ──────────
router.post('/send/:postId', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Guard: reject immediately if SMTP not configured
      if (!isSmtpConfigured()) {
        res.status(503).json({
          message: 'Email sending is not configured. Add SMTP_USER and SMTP_PASS to backend/.env, then restart the server.',
          smtpConfigured: false,
          sent: 0,
          failed: 0,
        });
        return;
      }

      const post = await Post.findById(req.params.postId)
        .populate('category', 'name slug')
        .lean();

      if (!post) {
        res.status(404).json({ message: 'Post not found.' });
        return;
      }

      const subscribers = await Subscriber.find({ active: true }).lean();

      if (!subscribers.length) {
        res.json({ message: 'No active subscribers to send to.', sent: 0, failed: 0 });
        return;
      }

      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      const BATCH = 10;
      for (let i = 0; i < subscribers.length; i += BATCH) {
        const batch = subscribers.slice(i, i + BATCH);
        await Promise.all(batch.map(async sub => {
          try {
            await sendMail({
              to:      sub.email,
              subject: `📰 ${post.title} — SoroKwuGana`,
              html:    buildPostEmail({
                postTitle:        post.title,
                postExcerpt:      post.excerpt ?? 'Check out our latest story on SoroKwuGana.',
                postSlug:         post.slug,
                postCoverImage:   post.coverImage,
                unsubscribeToken: sub.unsubscribeToken,
              }),
            });
            sent++;
          } catch (e: unknown) {
            failed++;
            errors.push(`${sub.email}: ${(e as Error).message}`);
          }
        }));
      }

      res.json({
        message: failed === 0
          ? `✅ Newsletter sent to all ${sent} subscribers.`
          : `Sent to ${sent}, failed for ${failed}. Check errors below.`,
        sent,
        failed,
        smtpConfigured: true,
        errors: errors.slice(0, 10),
      });

      // Log the send for chart analytics
      await NewsletterSend.create({
        post:      post._id,
        postTitle: post.title,
        sent,
        failed,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/newsletter/test-smtp — verify SMTP connection ──────────────────
router.post('/test-smtp', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await verifySmtp();
      res.json({ ok: true, message: 'SMTP connection verified successfully.' });
    } catch (err: unknown) {
      res.status(503).json({
        ok: false,
        message: `SMTP connection failed: ${(err as Error).message}`,
        hint: 'Check SMTP_USER, SMTP_PASS in backend/.env. For Gmail use an App Password from myaccount.google.com/apppasswords',
      });
    }
  }
);

// ── GET /api/newsletter/stats ─────────────────────────────────────────────────
router.get('/stats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [total, active, inactive] = await Promise.all([
        Subscriber.countDocuments(),
        Subscriber.countDocuments({ active: true }),
        Subscriber.countDocuments({ active: false }),
      ]);
      res.json({ total, active, inactive });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/newsletter/send-chart?period=daily|weekly|monthly|yearly ─────────
router.get('/send-chart', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = (req.query.period as string) ?? 'weekly';
      const now = new Date();

      interface RawRow { _id: string; emails: number; sends: number; }
      const points: { label: string; emails: number; sends: number }[] = [];

      if (period === 'daily') {
        // Last 30 days grouped by YYYY-MM-DD
        const from = new Date(now); from.setDate(from.getDate() - 29);
        const raw = await NewsletterSend.aggregate([
          { $match: { sentAt: { $gte: from } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } }, emails: { $sum: '$sent' }, sends: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]) as RawRow[];
        const map = new Map(raw.map(r => [r._id, r]));
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now); d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          const row = map.get(key);
          const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
          points.push({ label, emails: row?.emails ?? 0, sends: row?.sends ?? 0 });
        }

      } else if (period === 'weekly') {
        // Last 12 weeks — use Monday of each week as the key (YYYY-MM-DD)
        const getMondayKey = (d: Date) => {
          const copy = new Date(d);
          const day = copy.getDay(); // 0=Sun
          const diff = day === 0 ? -6 : 1 - day;
          copy.setDate(copy.getDate() + diff);
          return copy.toISOString().slice(0, 10);
        };

        // Build 12 week slots
        const slots: { key: string; label: string }[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now); d.setDate(d.getDate() - i * 7);
          const mondayKey = getMondayKey(d);
          const label = `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
          slots.push({ key: mondayKey, label });
        }

        const from = new Date(slots[0].key);
        const raw = await NewsletterSend.aggregate([
          { $match: { sentAt: { $gte: from } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: { $dateTrunc: { date: '$sentAt', unit: 'week', startOfWeek: 'monday' } } } }, emails: { $sum: '$sent' }, sends: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]) as RawRow[];
        const map = new Map(raw.map(r => [r._id, r]));
        for (const slot of slots) {
          const row = map.get(slot.key);
          points.push({ label: slot.label, emails: row?.emails ?? 0, sends: row?.sends ?? 0 });
        }

      } else if (period === 'monthly') {
        // Last 12 months grouped by YYYY-MM
        const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const raw = await NewsletterSend.aggregate([
          { $match: { sentAt: { $gte: from } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$sentAt' } }, emails: { $sum: '$sent' }, sends: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]) as RawRow[];
        const map = new Map(raw.map(r => [r._id, r]));
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
          const row = map.get(key);
          points.push({ label, emails: row?.emails ?? 0, sends: row?.sends ?? 0 });
        }

      } else {
        // Yearly — last 5 years grouped by YYYY
        const from = new Date(now.getFullYear() - 4, 0, 1);
        const raw = await NewsletterSend.aggregate([
          { $match: { sentAt: { $gte: from } } },
          { $group: { _id: { $dateToString: { format: '%Y', date: '$sentAt' } }, emails: { $sum: '$sent' }, sends: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]) as RawRow[];
        const map = new Map(raw.map(r => [r._id, r]));
        for (let i = 4; i >= 0; i--) {
          const year = now.getFullYear() - i;
          const row = map.get(String(year));
          points.push({ label: String(year), emails: row?.emails ?? 0, sends: row?.sends ?? 0 });
        }
      }

      const totalSent  = points.reduce((s, p) => s + p.emails, 0);
      const totalSends = points.reduce((s, p) => s + p.sends, 0);

      res.json({ points, totalSent, totalSends, period });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
