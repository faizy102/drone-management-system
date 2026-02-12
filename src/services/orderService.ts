import { db } from '../models/database';
import { Order, OrderStatus, CreateOrderRequest, Location } from '../types';
import { generateId } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
export class OrderService {
  async createOrder(enduserName: string, request: CreateOrderRequest): Promise<Order> {
    const order: Order = {
      id: generateId('order_'),
      enduserName,
      origin: request.origin,
      destination: request.destination,
      status: OrderStatus.PENDING,
      assignedDroneId: null,
      currentLocation: null,
      estimatedDeliveryTime: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      pickedUpAt: null,
      deliveredAt: null,
    };
    return await db.createOrder(order);
  }
  async getOrder(id: string): Promise<Order> {
    const order = await db.getOrder(id);
    if (!order) {
      throw new AppError(404, `Order ${id} not found`);
    }
    return order;
  }
  async getOrdersByEnduser(enduserName: string): Promise<Order[]> {
    return await db.getOrdersByEnduser(enduserName);
  }
  async getAllOrders(): Promise<Order[]> {
    return await db.getAllOrders();
  }
  async getPendingOrders(): Promise<Order[]> {
    return await db.findPendingOrders();
  }
  async withdrawOrder(orderId: string, enduserName: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (order.enduserName !== enduserName) {
      throw new AppError(403, 'You can only withdraw your own orders');
    }
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.RESERVED) {
      throw new AppError(400, 'Order cannot be withdrawn (already picked up or completed)');
    }
    if (order.assignedDroneId) {
      await db.updateDrone(order.assignedDroneId, {
        status: 'idle' as any,
        currentOrderId: null,
      });
    }
    return (await db.updateOrder(orderId, {
      status: OrderStatus.WITHDRAWN,
      assignedDroneId: null,
    }))!;
  }
  async updateOrderLocation(
    orderId: string,
    updates: { origin?: Location; destination?: Location }
  ): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError(400, 'Can only update location for pending orders');
    }
    return (await db.updateOrder(orderId, updates))!;
  }
  async getOrderDetails(orderId: string, enduserName?: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    if (enduserName && order.enduserName !== enduserName) {
      throw new AppError(403, 'You can only view your own orders');
    }
    return order;
  }
}
export const orderService = new OrderService();
