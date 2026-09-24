import { Schema, model, Document, Types } from 'mongoose';

export interface IAdvertMessage extends Document {
  _id:       Types.ObjectId;
  advertId:  Types.ObjectId;
  sender:    'admin' | 'advertiser';
  text:      string;
  imageUrl?: string;   // receipt or image uploads
  isSystem?: boolean;  // automated messages (e.g. "Advert approved")
  readByAdvertiser: boolean;
  readByAdmin:      boolean;
  createdAt: Date;
}

const AdvertMessageSchema = new Schema<IAdvertMessage>(
  {
    advertId:         { type: Schema.Types.ObjectId, ref: 'Advert', required: true },
    sender:           { type: String, enum: ['admin', 'advertiser'], required: true },
    text:             { type: String, required: true },
    imageUrl:         { type: String },
    isSystem:         { type: Boolean, default: false },
    readByAdvertiser: { type: Boolean, default: false },
    readByAdmin:      { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AdvertMessageSchema.index({ advertId: 1, createdAt: 1 });

export const AdvertMessage = model<IAdvertMessage>('AdvertMessage', AdvertMessageSchema);
