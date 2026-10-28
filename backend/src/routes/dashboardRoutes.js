import { Router } from 'express';
import { getDashboardStats, getDashboardActivity } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

export default router;
