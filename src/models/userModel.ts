import mongoose, { Schema, Document, Types } from 'mongoose';
import { UserType } from '../types';
export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  type: UserType;
  lastLogin: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(UserType),
      required: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      required: true,
      default: Date.now,
    },
    loginCount: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'users',
  }
);
userSchema.index({ name: 1, type: 1 });
export const UserModel = mongoose.model<UserDocument>('User', userSchema);
