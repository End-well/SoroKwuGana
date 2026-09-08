import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  approved: boolean;
  post: Types.ObjectId;
  author?: Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content:    { type: String, required: true },
    approved:   { type: Boolean, default: false },
    post:       { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author:     { type: Schema.Types.ObjectId, ref: 'User' },
    guestName:  { type: String },
    guestEmail: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Comment = model<IComment>('Comment', CommentSchema);
