import { Router } from 'express';
import {
  explainCode,
  debugCode,
  generatePracticeProblem,
  getHint,
  getFullSolution,
  chatTutor
} from '../controllers/aiController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  explainCodeSchema,
  debugCodeSchema,
  practiceGenerateSchema,
  hintRequestSchema,
  solutionRequestSchema,
  chatRequestSchema
} from '../validators/aiValidators.js';
import { aiEndpointLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Apply AI rate-limiting and optional auth to all AI operations
router.use(aiEndpointLimiter);
router.use(optionalAuth);

router.post('/explain', validateRequest(explainCodeSchema), explainCode);
router.post('/debug', validateRequest(debugCodeSchema), debugCode);
router.post('/practice/generate', validateRequest(practiceGenerateSchema), generatePracticeProblem);
router.post('/hints', validateRequest(hintRequestSchema), getHint);
router.post('/solution', validateRequest(solutionRequestSchema), getFullSolution);
router.post('/chat', validateRequest(chatRequestSchema), chatTutor);

export default router;
