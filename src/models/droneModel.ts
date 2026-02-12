import mongoose, { Schema, Document, Types } from 'mongoose';
import { Drone as IDrone, DroneStatus } from '../types';
export interface DroneDocument extends Omit<IDrone, 'id'>, Document {
  _id: Types.ObjectId;
}
const droneSchema = new Schema<DroneDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(DroneStatus),
      required: true,
      default: DroneStatus.IDLE,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
        default: 0,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
        default: 0,
      },
    },
    currentOrderId: {
      type: String,
      default: null,
    },
    lastHeartbeat: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'drones',
  }
);
droneSchema.index({ userId: 1 }, { unique: true });
droneSchema.index({ status: 1 });
droneSchema.index({ currentOrderId: 1 });
droneSchema.index({ lastHeartbeat: 1 });
export const DroneModel = mongoose.model<DroneDocument>('Drone', droneSchema);
