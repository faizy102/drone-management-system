import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserType } from '../types';
import * as adminController from '../controllers/adminController';
import * as authController from '../controllers/authController';
import {
  validateBody,
  updateOrderLocationSchema,
  markDroneStatusSchema,
} from '../middleware/validation';
const router = Router();
router.use(authenticate);
router.use(authorize(UserType.ADMIN));
router.get('/users', authController.getAllUsers);
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:orderId', adminController.getOrderDetails);
router.put(
  '/orders/:orderId/location',
  validateBody(updateOrderLocationSchema),
  adminController.updateOrderLocation
);
router.get('/drones', adminController.getAllDrones);
router.put(
  '/drones/:droneId/status',
  validateBody(markDroneStatusSchema),
  adminController.updateDroneStatus
);
export default router;
