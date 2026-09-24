import { Schema, model, Document, Types } from 'mongoose';

// A single media item — image or video
export interface IMediaItem {
  url: string;
  type: 'image' | 'video';
  caption?: string;
  source?: string; // credit / source label
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  referenceImages: IMediaItem[];
  videos: IMediaItem[];
  published: boolean;
  featured: boolean;
  breaking: boolean;
  views: number;
  likes: number;
  rating?: number;          // admin-set editorial score (1–10)
  userRatingSum: number;    // sum of all user ratings
  userRatingCount: number;  // number of user ratings
  userRatingAvg?: number;   // computed average shown to readers
  category: Types.ObjectId;
  author: Types.ObjectId;
  tags: Types.ObjectId[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>({
  url:     { type: String, required: true },
  type:    { type: String, enum: ['image', 'video'], required: true },
  caption: { type: String },
  source:  { type: String },
}, { _id: false });

const PostSchema = new Schema<IPost>(
  {
    title:           { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:         { type: String },
    content:         { type: String, required: true },
    coverImage:      { type: String },
    referenceImages: { type: [MediaItemSchema], default: [] },
    videos:          { type: [MediaItemSchema], default: [] },
    published:       { type: Boolean, default: false },
    featured:        { type: Boolean, default: false },
    breaking:        { type: Boolean, default: false },
    views:           { type: Number, default: 0 },
    likes:           { type: Number, default: 0 },
    rating:          { type: Number, min: 1, max: 10, default: null },
    userRatingSum:   { type: Number, default: 0 },
    userRatingCount: { type: Number, default: 0 },
    userRatingAvg:   { type: Number, default: null },
    category:        { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    author:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:            [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    publishedAt:     { type: Date },
  },
  { timestamps: true }
);

PostSchema.index({ published: 1, publishedAt: -1 });
PostSchema.index({ published: 1, featured: 1 });
PostSchema.index({ published: 1, breaking: 1 });

export const Post = model<IPost>('Post', PostSchema);
