import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateProfileSchema } from '../validators/profileValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProfile);
router.patch('/', validateRequest(updateProfileSchema), updateProfile);

export default router;
