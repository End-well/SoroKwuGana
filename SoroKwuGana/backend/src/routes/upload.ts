/**
 * POST /api/upload        — upload an image, store in MongoDB GridFS
 * GET  /api/upload/:id    — serve the image back by its GridFS file ID
 *
 * Images are stored directly in MongoDB using GridFSBucket.
 * The frontend receives a URL like /api/upload/<id> which it saves to the post.
 * No external service or API key required.
 */
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ── Multer — memory storage (no disk writes) ──────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// ── POST /api/upload ──────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No image file provided.' });
        return;
      }

      const db = mongoose.connection.db;
      if (!db) {
        res.status(503).json({ message: 'Database not ready.' });
        return;
      }

      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });

      // Generate a unique filename
      const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

      // Create a readable stream from the buffer and pipe into GridFS
      const readable = Readable.from(req.file.buffer);
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: req.file.mimetype,
        metadata: {
          originalName: req.file.originalname,
          uploadedBy: (req as { user?: { userId: string } }).user?.userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      readable.pipe(uploadStream);

      uploadStream.on('error', next);

      uploadStream.on('finish', () => {
        // Return the URL the frontend will save in the post
        const url = `${req.protocol}://${req.get('host')}/api/upload/${uploadStream.id}`;
        res.status(201).json({
          url,
          id: uploadStream.id.toString(),
          filename,
          size: req.file!.size,
          mimetype: req.file!.mimetype,
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/upload/:id — serve image ────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).json({ message: 'Database not ready.' });
      return;
    }

    let fileId: mongoose.Types.ObjectId;
    try {
      fileId = new mongoose.Types.ObjectId(String(req.params.id));
    } catch {
      res.status(400).json({ message: 'Invalid image ID.' });
      return;
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });

    // Check file exists and get metadata for Content-Type
    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      res.status(404).json({ message: 'Image not found.' });
      return;
    }

    const file = files[0];
    res.set('Content-Type', file.contentType ?? 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000, immutable'); // cache 1 year

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => res.status(404).end());
    downloadStream.pipe(res);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/upload/:id — remove image (admin only) ───────────────────────
router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.status(503).end();
      return;
    }

    let fileId: mongoose.Types.ObjectId;
    try {
      fileId = new mongoose.Types.ObjectId(String(req.params.id));
    } catch {
      res.status(400).json({ message: 'Invalid image ID.' });
      return;
    }

    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
    await bucket.delete(fileId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
