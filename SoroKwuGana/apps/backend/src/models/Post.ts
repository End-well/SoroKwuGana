import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  category: Types.ObjectId;
  author: Types.ObjectId;
  tags: Types.ObjectId[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt:     { type: String },
    content:     { type: String, required: true },
    coverImage:  { type: String },
    published:   { type: Boolean, default: false },
    featured:    { type: Boolean, default: false },
    views:       { type: Number, default: 0 },
    category:    { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    author:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:        [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for fast slug lookup and filtered listing
PostSchema.index({ slug: 1 });
PostSchema.index({ published: 1, publishedAt: -1 });
PostSchema.index({ published: 1, featured: 1 });

export const Post = model<IPost>('Post', PostSchema);
