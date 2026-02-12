import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { orderService } from '../services/orderService';
import { droneService } from '../services/droneService';
import { AppError } from '../middleware/errorHandler';
export async function getAllOrders(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get orders',
    });
  }
}
export async function getOrderDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderDetails(orderId); // No enduser restriction
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order details',
      });
    }
  }
}
export async function updateOrderLocation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;
    const { origin, destination } = req.body;
    const order = await orderService.updateOrderLocation(orderId, { origin, destination });
    res.status(200).json({
      success: true,
      data: order,
      message: 'Order location updated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order location',
      });
    }
  }
}
export async function getAllDrones(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const drones = await droneService.getAllDrones();
    res.status(200).json({
      success: true,
      data: drones,
      count: drones.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get drones',
    });
  }
}
export async function updateDroneStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { droneId } = req.params;
    const { status } = req.body;
    let result;
    if (status === 'broken') {
      result = await droneService.markAsBroken(droneId);
    } else if (status === 'fixed') {
      const drone = await droneService.markAsFixed(droneId);
      result = { drone, handoffOrder: null };
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid status. Must be "broken" or "fixed"',
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: result,
      message: `Drone marked as ${status}`,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update drone status',
      });
    }
  }
}
