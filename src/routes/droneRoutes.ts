import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserType } from '../types';
import * as droneController from '../controllers/droneController';
import {
  validateBody,
  updateLocationSchema,
  markOrderStatusSchema,
} from '../middleware/validation';
const router = Router();
router.use(authenticate);
router.use(authorize(UserType.DRONE));
router.get('/jobs', droneController.getAvailableJobs);
router.post('/reserve', droneController.reserveJob);
router.post('/grab', droneController.grabOrder);
router.put('/order/status', validateBody(markOrderStatusSchema), droneController.markOrderStatus);
router.post('/broken', droneController.markAsBroken);
router.put('/location', validateBody(updateLocationSchema), droneController.updateLocation);
router.get('/order', droneController.getCurrentOrder);
export default router;
