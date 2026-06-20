import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/metrics', AdminController.getPlatformMetrics);
router.delete('/users/:id', AdminController.deleteUser);

export default router;
