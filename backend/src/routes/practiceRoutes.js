import { Router } from 'express';
import {
  getPracticeProblems,
  savePracticeProblem,
  getPracticeProblemById,
  submitAttempt,
  getUserAttempts
} from '../controllers/practiceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { saveProblemSchema, attemptSchema } from '../validators/practiceValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPracticeProblems);
router.post('/', validateRequest(saveProblemSchema), savePracticeProblem);
router.get('/attempts', getUserAttempts);
router.get('/:id', getPracticeProblemById);
router.post('/:id/attempts', validateRequest(attemptSchema), submitAttempt);

export default router;
