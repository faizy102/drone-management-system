import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateBody, loginSchema } from '../middleware/validation';
const router = Router();
router.post('/login', validateBody(loginSchema), login);
export default router;
