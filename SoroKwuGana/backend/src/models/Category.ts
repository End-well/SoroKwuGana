import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    parent:      { type: String }, // e.g. "entertainment" or "lifestyle"
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Category = model<ICategory>('Category', CategorySchema);
