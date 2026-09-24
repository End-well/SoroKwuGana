import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Advert, PLAN_PRICES, PLAN_DURATIONS_DAYS, type AdvertPlan } from '../models/Advert.js';
import { AdvertMessage } from '../models/AdvertMessage.js';
import { PaymentSettings } from '../models/PaymentSettings.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────
const SubmitSchema = z.object({
  businessName:   z.string().min(2).max(100),
  contactName:    z.string().min(2).max(100),
  email:          z.string().email(),
  phone:          z.string().optional(),
  website:        z.string().url().optional().or(z.literal('')),
  adTitle:        z.string().min(3).max(100),
  adDescription:  z.string().min(10).max(500),
  adImageUrl:     z.string().url().optional().or(z.literal('')),
  adLinkUrl:      z.string().url().optional().or(z.literal('')),
  plan:           z.enum(['1month', '6months', '1year']),
});

const UpdateSchema = z.object({
  status:     z.enum(['pending', 'approved', 'rejected', 'expired']).optional(),
  adminNotes: z.string().optional(),
  startDate:  z.string().optional(),
  adImageUrl: z.string().url().optional().or(z.literal('')),
  adLinkUrl:  z.string().url().optional().or(z.literal('')),
});

// ── POST /api/adverts — public submission ─────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = SubmitSchema.parse(req.body);
    const plan = data.plan as AdvertPlan;
    const amount = PLAN_PRICES[plan];

    const advert = await Advert.create({
      ...data,
      amount,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Your advert request has been submitted! We will review and contact you within 24 hours.',
      id: advert._id,
      amount,
      plan,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/adverts — admin: list all ───────────────────────────────────────
router.get('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page   = Math.max(1, Number(req.query.page) || 1);
      const limit  = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const filter: Record<string, unknown> = {};
      if (status && status !== 'all') filter.status = status;
      if (search) filter.$or = [
        { businessName:  { $regex: search, $options: 'i' } },
        { email:         { $regex: search, $options: 'i' } },
        { adTitle:       { $regex: search, $options: 'i' } },
      ];

      const [adverts, total] = await Promise.all([
        Advert.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Advert.countDocuments(filter),
      ]);

      res.json({ adverts, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/adverts/stats — admin stats ─────────────────────────────────────
router.get('/stats', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [total, pending, approved, rejected, expired] = await Promise.all([
        Advert.countDocuments(),
        Advert.countDocuments({ status: 'pending' }),
        Advert.countDocuments({ status: 'approved' }),
        Advert.countDocuments({ status: 'rejected' }),
        Advert.countDocuments({ status: 'expired' }),
      ]);

      // Revenue from approved + expired
      const revenueResult = await Advert.aggregate([
        { $match: { status: { $in: ['approved', 'expired'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const revenue = revenueResult[0]?.total ?? 0;

      res.json({ total, pending, approved, rejected, expired, revenue });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/adverts/active — public: active ads for display ──────────────────
router.get('/active', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const adverts = await Advert.find({
      status: 'approved',
      $or: [
        { endDate: { $gte: now } },
        { endDate: null },
      ],
    }).select('adTitle adDescription adImageUrl adLinkUrl businessName').lean();

    // Track impressions
    const ids = adverts.map(a => a._id);
    if (ids.length) {
      await Advert.updateMany({ _id: { $in: ids } }, { $inc: { impressions: 1 } });
    }

    res.json(adverts);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/adverts/:id — admin get single ───────────────────────────────────
router.get('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const advert = await Advert.findById(req.params.id).lean();
      if (!advert) { res.status(404).json({ message: 'Advert not found' }); return; }
      res.json(advert);
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /api/adverts/:id — admin update (approve/reject/notes) ──────────────
router.patch('/:id', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = UpdateSchema.parse(req.body);
      const update: Record<string, unknown> = { ...data };

      // If approving, set start/end dates
      if (data.status === 'approved') {
        const advert = await Advert.findById(req.params.id).lean();
        if (!advert) { res.status(404).json({ message: 'Advert not found' }); return; }

        const start = data.startDate ? new Date(data.startDate) : new Date();
        const days  = PLAN_DURATIONS_DAYS[advert.plan as AdvertPlan] ?? 30;
        const end   = new Date(start);
        end.setDate(end.getDate() + days);

        update.startDate = start;
        update.endDate   = end;
      }

      const advert = await Advert.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!advert) { res.status(404).json({ message: 'Advert not found' }); return; }
      res.json(advert);
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/adverts/:id/click — track click ─────────────────────────────────
router.post('/:id/click', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Advert.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete('/:id', authenticate, requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Advert.findByIdAndDelete(req.params.id);
      await AdvertMessage.deleteMany({ advertId: req.params.id });
      res.status(204).end();
    } catch (err) { next(err); }
  }
);

// Payment settings GET
router.get('/payment-settings', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const s = await PaymentSettings.findOne().lean();
    res.json(s ?? null);
  } catch (err) { next(err); }
});

// Payment settings PUT (SUPER_ADMIN)
router.put('/payment-settings', authenticate, requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = z.object({
        bankName: z.string().min(2), accountName: z.string().min(2),
        accountNumber: z.string().min(6), bankCode: z.string().optional(),
        additionalInfo: z.string().optional(),
      }).parse(req.body);
      const s = await PaymentSettings.findOneAndUpdate({}, data, { upsert: true, new: true });
      res.json(s);
    } catch (err) { next(err); }
  }
);

// Messages: advertiser GET
router.get('/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const advert = await Advert.findById(req.params.id).lean();
    if (!advert) { res.status(404).json({ message: 'Not found' }); return; }
    const messages = await AdvertMessage.find({ advertId: req.params.id }).sort({ createdAt: 1 }).lean();
    await AdvertMessage.updateMany({ advertId: req.params.id, readByAdvertiser: false }, { readByAdvertiser: true });
    const paymentSettings = await PaymentSettings.findOne().lean();
    res.json({ messages, advert, paymentSettings });
  } catch (err) { next(err); }
});

// Messages: advertiser POST
router.post('/:id/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, imageUrl } = z.object({
      text: z.string().min(1).max(2000),
      imageUrl: z.string().url().optional().or(z.literal('')),
    }).parse(req.body);
    const advert = await Advert.findById(req.params.id).lean();
    if (!advert) { res.status(404).json({ message: 'Not found' }); return; }
    const msg = await AdvertMessage.create({
      advertId: req.params.id, sender: 'advertiser', text,
      imageUrl: imageUrl || undefined, readByAdmin: false, readByAdvertiser: true,
    });
    res.status(201).json(msg);
  } catch (err) { next(err); }
});

// Messages: admin GET (marks advertiser messages read)
router.get('/:id/messages/admin', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await AdvertMessage.find({ advertId: req.params.id }).sort({ createdAt: 1 }).lean();
      await AdvertMessage.updateMany({ advertId: req.params.id, readByAdmin: false }, { readByAdmin: true });
      const advert = await Advert.findById(req.params.id).lean();
      res.json({ messages, advert });
    } catch (err) { next(err); }
  }
);

// Messages: admin POST
router.post('/:id/messages/admin', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, imageUrl } = z.object({
        text: z.string().min(1).max(2000),
        imageUrl: z.string().url().optional().or(z.literal('')),
      }).parse(req.body);
      const advert = await Advert.findById(req.params.id).lean();
      if (!advert) { res.status(404).json({ message: 'Not found' }); return; }
      const msg = await AdvertMessage.create({
        advertId: req.params.id, sender: 'admin', text,
        imageUrl: imageUrl || undefined, readByAdmin: true, readByAdvertiser: false,
      });
      await AdvertMessage.updateMany({ advertId: req.params.id, sender: 'advertiser' }, { readByAdmin: true });
      res.status(201).json(msg);
    } catch (err) { next(err); }
  }
);

export default router;
