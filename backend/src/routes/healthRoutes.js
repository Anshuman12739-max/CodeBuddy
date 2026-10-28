import { Router } from 'express';
import { getSystemHealth, getAIHealth } from '../controllers/healthController.js';

const router = Router();

router.get('/', getSystemHealth);
router.get('/ai', getAIHealth);

export default router;
