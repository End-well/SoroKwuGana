import { Schema, model, Document, Types } from 'mongoose';

export interface ITag extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
}

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
});

export const Tag = model<ITag>('Tag', TagSchema);
