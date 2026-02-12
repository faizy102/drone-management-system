import { Router } from 'express';
import authRoutes from './authRoutes';
import droneRoutes from './droneRoutes';
import enduserRoutes from './enduserRoutes';
import adminRoutes from './adminRoutes';
const router = Router();
router.use('/auth', authRoutes);
router.use('/drone', droneRoutes);
router.use('/enduser', enduserRoutes);
router.use('/admin', adminRoutes);
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Drone Delivery Management API is running',
    timestamp: new Date().toISOString(),
  });
});
export default router;
