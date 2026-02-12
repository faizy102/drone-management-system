import mongoose, { Schema, Document, Types } from 'mongoose';
import { Order as IOrder, OrderStatus } from '../types';
export interface OrderDocument extends Omit<IOrder, 'id'>, Document {
  _id: Types.ObjectId;
}
const orderSchema = new Schema<OrderDocument>(
  {
    enduserName: {
      type: String,
      required: true,
      index: true,
    },
    origin: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    destination: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
      default: OrderStatus.PENDING,
      index: true,
    },
    assignedDroneId: {
      type: String,
      default: null,
      index: true,
    },
    currentLocation: {
      type: {
        latitude: Number,
        longitude: Number,
      },
      default: null,
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: 'orders',
  }
);
orderSchema.index({ enduserName: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ assignedDroneId: 1, status: 1 });
export const OrderModel = mongoose.model<OrderDocument>('Order', orderSchema);
