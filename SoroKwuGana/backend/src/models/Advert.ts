import { Schema, model, Document, Types } from 'mongoose';

export type AdvertPlan = '1month' | '6months' | '1year';
export type AdvertStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface IAdvert extends Document {
  _id: Types.ObjectId;
  // Advertiser info
  businessName: string;
  contactName:  string;
  email:        string;
  phone?:       string;
  website?:     string;
  // Ad content
  adTitle:      string;
  adDescription: string;
  adImageUrl?:  string;
  adLinkUrl?:   string;
  // Plan & billing
  plan:         AdvertPlan;
  amount:       number;      // NGN
  // Admin control
  status:       AdvertStatus;
  adminNotes?:  string;
  startDate?:   Date;
  endDate?:     Date;
  // Metrics
  impressions:  number;
  clicks:       number;
  createdAt:    Date;
  updatedAt:    Date;
}

const AdvertSchema = new Schema<IAdvert>(
  {
    businessName:   { type: String, required: true, trim: true },
    contactName:    { type: String, required: true, trim: true },
    email:          { type: String, required: true, lowercase: true, trim: true },
    phone:          { type: String },
    website:        { type: String },
    adTitle:        { type: String, required: true, trim: true },
    adDescription:  { type: String, required: true },
    adImageUrl:     { type: String },
    adLinkUrl:      { type: String },
    plan:           { type: String, enum: ['1month', '6months', '1year'], required: true },
    amount:         { type: Number, required: true },
    status:         { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
    adminNotes:     { type: String },
    startDate:      { type: Date },
    endDate:        { type: Date },
    impressions:    { type: Number, default: 0 },
    clicks:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

AdvertSchema.index({ status: 1, createdAt: -1 });
AdvertSchema.index({ endDate: 1 });

export const Advert = model<IAdvert>('Advert', AdvertSchema);

// Plan pricing in NGN
export const PLAN_PRICES: Record<AdvertPlan, number> = {
  '1month':  2000,
  '6months': 5000,
  '1year':   8000,
};

export const PLAN_LABELS: Record<AdvertPlan, string> = {
  '1month':  '1 Month',
  '6months': '6 Months',
  '1year':   '1 Year',
};

export const PLAN_DURATIONS_DAYS: Record<AdvertPlan, number> = {
  '1month':  30,
  '6months': 180,
  '1year':   365,
};
