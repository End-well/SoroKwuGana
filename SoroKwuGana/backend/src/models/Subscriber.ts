import { Schema, model, Document } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  name?: string;
  active: boolean;
  unsubscribeToken: string;
  subscribedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:             { type: String, trim: true },
    active:           { type: Boolean, default: true },
    unsubscribeToken: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: 'subscribedAt', updatedAt: false } }
);

export const Subscriber = model<ISubscriber>('Subscriber', SubscriberSchema);
