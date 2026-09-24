import { Schema, model, Document, Types } from 'mongoose';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AUTHOR';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name:     { type: String, required: true, trim: true },
    role:     { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'AUTHOR'], default: 'AUTHOR' },
    avatar:   { type: String },
    bio:      { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
