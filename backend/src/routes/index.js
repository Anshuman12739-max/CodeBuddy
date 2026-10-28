import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';
import conversationRoutes from './conversationRoutes.js';
import practiceRoutes from './practiceRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import profileRoutes from './profileRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/conversations', conversationRoutes);
router.use('/practice', practiceRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/profile', profileRoutes);

export default router;
