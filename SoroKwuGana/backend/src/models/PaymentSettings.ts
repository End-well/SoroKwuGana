import { Schema, model, Document } from 'mongoose';

/** Single-document store for payment receiving details set by SUPER_ADMIN */
export interface IPaymentSettings extends Document {
  bankName:       string;
  accountName:    string;
  accountNumber:  string;
  bankCode?:      string;
  additionalInfo?: string;  // e.g. "Send proof of payment after transfer"
  updatedAt:      Date;
}

const PaymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    bankName:       { type: String, required: true },
    accountName:    { type: String, required: true },
    accountNumber:  { type: String, required: true },
    bankCode:       { type: String },
    additionalInfo: { type: String },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const PaymentSettings = model<IPaymentSettings>('PaymentSettings', PaymentSettingsSchema);
