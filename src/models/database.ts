import { Drone, Order, DroneStatus, OrderStatus, Location } from '../types';
import { DroneModel } from './droneModel';
import { OrderModel } from './orderModel';
class Database {
  async createDrone(drone: Drone): Promise<Drone> {
    const{id, ...rest} = drone;
    const doc = await DroneModel.create(rest);
    return this.droneDocToObject(doc);
  }
  async getDrone(id: string): Promise<Drone | undefined> {
    const doc = await DroneModel.findById(id);
    if (!doc) return undefined;
    return this.droneDocToObject(doc);
  }
  async getDroneByUserId(userId: string): Promise<Drone | undefined> {
    const doc = await DroneModel.findOne({ userId });
    if (!doc) return undefined;
    return this.droneDocToObject(doc);
  }
  async getAllDrones(): Promise<Drone[]> {
    const docs = await DroneModel.find();
    return docs.map(this.droneDocToObject);
  }
  async updateDrone(id: string, updates: Partial<Drone>): Promise<Drone | undefined> {
    const doc = await DroneModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    if (!doc) return undefined;
    return this.droneDocToObject(doc);
  }
  async deleteDrone(id: string): Promise<boolean> {
    const result = await DroneModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
  async createOrder(order: Order): Promise<Order> {
    const{id, ...rest} = order;
    const doc = await OrderModel.create(rest);
    return this.orderDocToObject(doc);
  }
  async getOrder(id: string): Promise<Order | undefined> {
    const doc = await OrderModel.findById(id);
    if (!doc) return undefined;
    return this.orderDocToObject(doc);
  }
  async getAllOrders(): Promise<Order[]> {
    const docs = await OrderModel.find();
    return docs.map(this.orderDocToObject);
  }
  async getOrdersByEnduser(enduserName: string): Promise<Order[]> {
    const docs = await OrderModel.find({ enduserName });
    return docs.map(this.orderDocToObject);
  }
  async getOrdersByDrone(droneId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ assignedDroneId: droneId });
    return docs.map(this.orderDocToObject);
  }
  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    if (!doc) return undefined;
    return this.orderDocToObject(doc);
  }
  async deleteOrder(id: string): Promise<boolean> {
    const result = await OrderModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
  async findAvailableDrone(_location: Location): Promise<Drone | undefined> {
    const doc = await DroneModel.findOne({ status: DroneStatus.IDLE });
    if (!doc) return undefined;
    return this.droneDocToObject(doc);
  }
  async findPendingOrders(): Promise<Order[]> {
    const docs = await OrderModel.find({ status: OrderStatus.PENDING });
    return docs.map(this.orderDocToObject);
  }
  async reset(): Promise<void> {
    await DroneModel.deleteMany({});
    await OrderModel.deleteMany({});
  }
  private droneDocToObject(doc: any): Drone {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      status: doc.status,
      location: doc.location,
      currentOrderId: doc.currentOrderId,
      lastHeartbeat: doc.lastHeartbeat,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
  private orderDocToObject(doc: any): Order {
    return {
      id: doc._id.toString(),
      enduserName: doc.enduserName,
      origin: doc.origin,
      destination: doc.destination,
      status: doc.status,
      assignedDroneId: doc.assignedDroneId,
      currentLocation: doc.currentLocation,
      estimatedDeliveryTime: doc.estimatedDeliveryTime,
      pickedUpAt: doc.pickedUpAt,
      deliveredAt: doc.deliveredAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
export const db = new Database();
