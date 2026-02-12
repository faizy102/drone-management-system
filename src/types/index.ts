export enum UserType {
  ADMIN = 'admin',
  ENDUSER = 'enduser',
  DRONE = 'drone',
}
export enum OrderStatus {
  PENDING = 'pending', // Order created, waiting for drone
  RESERVED = 'reserved', // Drone reserved the job
  PICKED_UP = 'picked_up', // Drone picked up the order
  IN_TRANSIT = 'in_transit', // Order is being delivered
  DELIVERED = 'delivered', // Successfully delivered
  FAILED = 'failed', // Delivery failed
  WITHDRAWN = 'withdrawn', // Cancelled by enduser
}
export enum DroneStatus {
  IDLE = 'idle', // Available for jobs
  RESERVED = 'reserved', // Reserved a job but not picked up yet
  IN_TRANSIT = 'in_transit', // Currently delivering
  BROKEN = 'broken', // Needs maintenance
}
export interface Location {
  latitude: number;
  longitude: number;
}
export interface Drone {
  id: string;
  userId: string;
  status: DroneStatus;
  location: Location;
  currentOrderId: string | null;
  lastHeartbeat: Date;
  createdAt: Date;
  updatedAt: Date;
}
export interface Order {
  id: string;
  enduserName: string; // Who submitted the order
  origin: Location;
  destination: Location;
  status: OrderStatus;
  assignedDroneId: string | null;
  currentLocation: Location | null; // Current location if in transit
  estimatedDeliveryTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
}
export interface JWTPayload {
  name: string;
  type: UserType;
  iat?: number;
  exp?: number;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface PaginationParams {
  page?: number;
  limit?: number;
}
export interface CreateOrderRequest {
  origin: Location;
  destination: Location;
}
export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
}
export interface UpdateOrderLocationRequest {
  origin?: Location;
  destination?: Location;
}
export interface MarkOrderStatusRequest {
  status: OrderStatus.DELIVERED | OrderStatus.FAILED;
}
export interface AuthRequest extends Request {
  user?: JWTPayload;
}
