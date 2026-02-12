import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { orderService } from '../services/orderService';
import { AppError } from '../middleware/errorHandler';
export async function submitOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const enduserName = req.user!.name;
    const { origin, destination } = req.body;
    const order = await orderService.createOrder(enduserName, { origin, destination });
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order submitted successfully',
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
        error: error instanceof Error ? error.message : 'Failed to submit order',
      });
    }
  }
}
export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const enduserName = req.user!.name;
    const orders = await orderService.getOrdersByEnduser(enduserName);
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
    const enduserName = req.user!.name;
    const { orderId } = req.params;
    const order = await orderService.getOrderDetails(orderId, enduserName);
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
export async function withdrawOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const enduserName = req.user!.name;
    const { orderId } = req.params;
    const order = await orderService.withdrawOrder(orderId, enduserName);
    res.status(200).json({
      success: true,
      data: order,
      message: 'Order withdrawn successfully',
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
        error: error instanceof Error ? error.message : 'Failed to withdraw order',
      });
    }
  }
}
