import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { droneService } from '../services/droneService';
import { orderService } from '../services/orderService';
import { AppError } from '../middleware/errorHandler';
export async function getAvailableJobs(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const pendingOrders = await orderService.getPendingOrders();
    res.status(200).json({
      success: true,
      data: pendingOrders,
      count: pendingOrders.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get available jobs',
    });
  }
}
export async function reserveJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const droneId = req.user!.name;
    const order = await droneService.reserveJob(droneId);
    res.status(200).json({
      success: true,
      data: order,
      message: 'Job reserved successfully',
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
        error: error instanceof Error ? error.message : 'Failed to reserve job',
      });
    }
  }
}
export async function grabOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const droneId = req.user!.name;
    const { fromLocation } = req.body;
    const order = await droneService.grabOrder(droneId, fromLocation || 'origin');
    res.status(200).json({
      success: true,
      data: order,
      message: 'Order picked up successfully',
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
        error: error instanceof Error ? error.message : 'Failed to grab order',
      });
    }
  }
}
export async function markOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const droneId = req.user!.name;
    const { status } = req.body;
    const order = await droneService.markOrderStatus(droneId, status);
    res.status(200).json({
      success: true,
      data: order,
      message: `Order marked as ${status}`,
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
        error: error instanceof Error ? error.message : 'Failed to update order status',
      });
    }
  }
}
export async function markAsBroken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const droneId = req.user!.name;
    const result = await droneService.markAsBroken(droneId);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Drone marked as broken. Handoff order created if applicable.',
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
        error: error instanceof Error ? error.message : 'Failed to mark drone as broken',
      });
    }
  }
}
export async function updateLocation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const droneId = req.user!.name;
    const { latitude, longitude } = req.body;
    const drone = await droneService.updateLocation(droneId, { latitude, longitude });
    res.status(200).json({
      success: true,
      data: drone,
      message: 'Location updated successfully',
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
        error: error instanceof Error ? error.message : 'Failed to update location',
      });
    }
  }
}
export async function getCurrentOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const droneId = req.user!.name;
    const order = await droneService.getCurrentOrder(droneId);
    if (!order) {
      res.status(404).json({
        success: false,
        error: 'No current order assigned',
      });
      return;
    }
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
        error: error instanceof Error ? error.message : 'Failed to get current order',
      });
    }
  }
}
