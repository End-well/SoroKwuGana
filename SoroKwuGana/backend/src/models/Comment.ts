import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  approved: boolean;
  post: Types.ObjectId;
  author?: Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  /** null = top-level comment, otherwise points to the direct parent */
  parentId?: Types.ObjectId | null;
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
    parentId:   { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for fast "fetch all comments for a post" + "fetch replies for a comment"
CommentSchema.index({ post: 1, approved: 1, parentId: 1, createdAt: 1 });

export const Comment = model<IComment>('Comment', CommentSchema);
