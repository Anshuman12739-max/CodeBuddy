import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/responseHandler.js';

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'Too many requests from this IP address, please try again after 15 minutes.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }
});

export const aiEndpointLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 AI requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(
      res,
      'You are generating AI responses too quickly. Please pause for a moment.',
      429,
      'AI_RATE_LIMIT_EXCEEDED'
    );
  }
});
