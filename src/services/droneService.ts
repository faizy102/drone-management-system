import { db } from '../models/database';
import { Drone, DroneStatus, Location, Order, OrderStatus } from '../types';
import { generateId, calculateDistance, calculateETA } from '../utils/helpers';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
export class DroneService {
  async createDrone(location: Location, userId?: string): Promise<Drone> {
    const drone: Drone = {
      id: generateId('drone_'),
      userId: userId || generateId('user_'),
      status: DroneStatus.IDLE,
      location,
      currentOrderId: null,
      lastHeartbeat: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return await db.createDrone(drone);
  }
  async getDrone(id: string): Promise<Drone> {
    const drone = await db.getDrone(id);
    if (!drone) {
      throw new AppError(404, `Drone ${id} not found`);
    }
    return drone;
  }
  async getDroneByUserId(userId: string): Promise<Drone> {
    let drone = await db.getDroneByUserId(userId);
    if (!drone) {
      const newDrone: Drone = {
        id: generateId('drone_'),
        userId: userId,
        status: DroneStatus.IDLE,
        location: { latitude: 0, longitude: 0 },
        currentOrderId: null,
        lastHeartbeat: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      drone = await db.createDrone(newDrone);
    }
    return drone;
  }
  async getAllDrones(): Promise<Drone[]> {
    return await db.getAllDrones();
  }
  async reserveJob(droneUserId: string): Promise<Order> {
    const drone = await this.getDroneByUserId(droneUserId);
    if (drone.status !== DroneStatus.IDLE) {
      throw new AppError(400, `Drone ${droneUserId} is not available (status: ${drone.status})`);
    }
    const pendingOrders = await db.findPendingOrders();
    if (pendingOrders.length === 0) {
      throw new AppError(404, 'No pending orders available');
    }
    const order = pendingOrders[0];
    await db.updateOrder(order.id, {
      status: OrderStatus.RESERVED,
      assignedDroneId: drone.id,
    });
    await db.updateDrone(drone.id, {
      status: DroneStatus.RESERVED,
      currentOrderId: order.id,
    });
    return (await db.getOrder(order.id))!;
  }
  async grabOrder(droneUserId: string, _fromLocation: 'origin' | 'broken_drone'): Promise<Order> {
    const drone = await this.getDroneByUserId(droneUserId);
    if (!drone.currentOrderId) {
      throw new AppError(400, `Drone ${droneUserId} has no assigned order`);
    }
    const order = await db.getOrder(drone.currentOrderId);
    if (!order) {
      throw new AppError(404, 'Assigned order not found');
    }
    if (order.status !== OrderStatus.RESERVED) {
      throw new AppError(400, `Order ${order.id} cannot be picked up (status: ${order.status})`);
    }
    const distance = calculateDistance(drone.location, order.destination);
    const eta = calculateETA(distance, config.droneSpeedKmPerHour);
    await db.updateOrder(order.id, {
      status: OrderStatus.IN_TRANSIT,
      currentLocation: drone.location,
      pickedUpAt: new Date(),
      estimatedDeliveryTime: eta,
    });
    await db.updateDrone(drone.id, {
      status: DroneStatus.IN_TRANSIT,
    });
    return (await db.getOrder(order.id))!;
  }
  async markOrderStatus(droneUserId: string, status: OrderStatus.DELIVERED | OrderStatus.FAILED): Promise<Order> {
    const drone = await this.getDroneByUserId(droneUserId);
    if (!drone.currentOrderId) {
      throw new AppError(400, `Drone ${droneUserId} has no assigned order`);
    }
    const order = await db.getOrder(drone.currentOrderId);
    if (!order) {
      throw new AppError(404, 'Assigned order not found');
    }
    if (order.status !== OrderStatus.IN_TRANSIT && order.status !== OrderStatus.PICKED_UP) {
      throw new AppError(400, `Cannot mark order as ${status}. Order must be picked up first (current status: ${order.status})`);
    }
    const updates: Partial<Order> =
      status === OrderStatus.DELIVERED
        ? {
            status,
            deliveredAt: new Date(),
            currentLocation: order.destination,
          }
        : {
            status,
            currentLocation: drone.location,
          };
    await db.updateOrder(order.id, updates);
    await db.updateDrone(drone.id, {
      status: DroneStatus.IDLE,
      currentOrderId: null,
    });
    return (await db.getOrder(order.id))!;
  }
  async markAsBroken(droneUserId: string): Promise<{ drone: Drone; handoffOrder: Order | null }> {
    const drone = await this.getDroneByUserId(droneUserId);
    let handoffOrder: Order | null = null;
    if (drone.currentOrderId) {
      const currentOrder = await db.getOrder(drone.currentOrderId);
      if (currentOrder && currentOrder.status === OrderStatus.IN_TRANSIT) {
        handoffOrder = await db.createOrder({
          id: generateId('order_handoff_'),
          enduserName: currentOrder.enduserName,
          origin: drone.location,
          destination: currentOrder.destination,
          status: OrderStatus.PENDING,
          assignedDroneId: null,
          currentLocation: null,
          estimatedDeliveryTime: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          pickedUpAt: null,
          deliveredAt: null,
        });
        await db.updateOrder(currentOrder.id, {
          status: OrderStatus.FAILED,
        });
      }
    }
    const updated = (await db.updateDrone(drone.id, {
      status: DroneStatus.BROKEN,
      currentOrderId: null,
    }))!;
    return { drone: updated, handoffOrder };
  }
  async updateLocation(droneUserId: string, location: Location): Promise<Drone> {
    const drone = await this.getDroneByUserId(droneUserId);
    const updated = (await db.updateDrone(drone.id, {
      location,
      lastHeartbeat: new Date(),
    }))!;
    if (drone.currentOrderId && drone.status === DroneStatus.IN_TRANSIT) {
      const order = await db.getOrder(drone.currentOrderId);
      if (order) {
        const distance = calculateDistance(location, order.destination);
        const eta = calculateETA(distance, config.droneSpeedKmPerHour);
        await db.updateOrder(drone.currentOrderId, {
          currentLocation: location,
          estimatedDeliveryTime: eta,
        });
      }
    }
    return updated;
  }
  async getCurrentOrder(droneUserId: string): Promise<Order | null> {
    const drone = await this.getDroneByUserId(droneUserId);
    if (!drone.currentOrderId) {
      return null;
    }
    return (await db.getOrder(drone.currentOrderId)) || null;
  }
  async markAsFixed(droneId: string): Promise<Drone> {
    const drone = await this.getDrone(droneId);
    if (drone.status !== DroneStatus.BROKEN) {
      throw new AppError(400, `Drone ${droneId} is not marked as broken`);
    }
    return (await db.updateDrone(droneId, {
      status: DroneStatus.IDLE,
    }))!;
  }
}
export const droneService = new DroneService();
