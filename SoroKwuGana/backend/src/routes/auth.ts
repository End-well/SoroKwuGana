import fs from 'fs';
import path from 'path';
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken } from '../lib/jwt.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────
const RegisterSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const ProfileSchema = z.object({
  name:            z.string().min(2).optional(),
  email:           z.string().email().optional(),
  avatar:          z.string().url().optional().or(z.literal('')),
  bio:             z.string().max(500).optional(),
  password:        z.string().min(8).optional(),
  currentPassword: z.string().min(1).optional(),
});

const SecuritySchema = z.object({
  jwtSecret:    z.string().min(16).optional(),
  jwtExpiresIn: z.enum(['1d', '3d', '7d', '14d', '30d', '90d']).optional(),
});

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = RegisterSchema.parse(req.body);

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = signToken({ userId: String(user._id), email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/auth/profile — update own profile ─────────────────────────────
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = ProfileSchema.parse(req.body);

    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Require current password if changing password
    if (data.password) {
      if (!data.currentPassword) {
        res.status(400).json({ message: 'Current password is required to set a new password.' });
        return;
      }
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) {
        res.status(401).json({ message: 'Current password is incorrect.' });
        return;
      }
    }

    // Email uniqueness check
    if (data.email && data.email !== user.email) {
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        res.status(409).json({ message: 'That email address is already in use.' });
        return;
      }
    }

    const update: Record<string, unknown> = {};
    if (data.name  !== undefined) update.name   = data.name;
    if (data.email !== undefined) update.email  = data.email;
    if (data.avatar !== undefined) update.avatar = data.avatar;
    if (data.bio    !== undefined) update.bio    = data.bio;
    if (data.password) update.password = await bcrypt.hash(data.password, 12);

    const updated = await User.findByIdAndUpdate(
      req.user!.userId, update, { new: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/auth/security — update JWT config (SUPER_ADMIN only) ───────────
router.patch('/security', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      res.status(403).json({ message: 'Only Super Admins can change security settings.' });
      return;
    }

    const data = SecuritySchema.parse(req.body);
    if (!data.jwtSecret && !data.jwtExpiresIn) {
      res.status(400).json({ message: 'Nothing to update.' });
      return;
    }

    // Locate .env file relative to backend cwd
    const candidates = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '..', '.env'),
    ];
    const envPath = candidates.find(p => fs.existsSync(p));

    if (!envPath) {
      res.status(500).json({ message: '.env file not found on the server.' });
      return;
    }

    let content = fs.readFileSync(envPath, 'utf8');

    if (data.jwtSecret) {
      content = /^JWT_SECRET=.*/m.test(content)
        ? content.replace(/^JWT_SECRET=.*/m, `JWT_SECRET=${data.jwtSecret}`)
        : `${content}\nJWT_SECRET=${data.jwtSecret}`;
      process.env.JWT_SECRET = data.jwtSecret;
    }

    if (data.jwtExpiresIn) {
      content = /^JWT_EXPIRES_IN=.*/m.test(content)
        ? content.replace(/^JWT_EXPIRES_IN=.*/m, `JWT_EXPIRES_IN=${data.jwtExpiresIn}`)
        : `${content}\nJWT_EXPIRES_IN=${data.jwtExpiresIn}`;
      process.env.JWT_EXPIRES_IN = data.jwtExpiresIn;
    }

    fs.writeFileSync(envPath, content, 'utf8');

    res.json({
      message: 'Security settings saved. New tokens will use the updated values immediately.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
