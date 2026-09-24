import { Schema, model, Document, Types } from 'mongoose';

export interface INewsletterSend extends Document {
  post:      Types.ObjectId;
  postTitle: string;
  sentAt:    Date;
  sent:      number;
  failed:    number;
}

const NewsletterSendSchema = new Schema<INewsletterSend>(
  {
    post:      { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    postTitle: { type: String, required: true },
    sentAt:    { type: Date, default: Date.now },
    sent:      { type: Number, default: 0 },
    failed:    { type: Number, default: 0 },
  },
  { timestamps: false }
);

NewsletterSendSchema.index({ sentAt: -1 });

export const NewsletterSend = model<INewsletterSend>('NewsletterSend', NewsletterSendSchema);
