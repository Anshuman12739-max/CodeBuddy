import { Router } from 'express';
import {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  deleteConversation
} from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createConversationSchema,
  updateConversationSchema
} from '../validators/conversationValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/', getConversations);
router.post('/', validateRequest(createConversationSchema), createConversation);
router.get('/:id', getConversationById);
router.patch('/:id', validateRequest(updateConversationSchema), updateConversation);
router.delete('/:id', deleteConversation);

export default router;
