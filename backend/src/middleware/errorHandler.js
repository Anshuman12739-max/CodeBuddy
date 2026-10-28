import { sendError } from '../utils/responseHandler.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled Server Error:', err.message, err.stack);

  // Zod validation error handled specifically
  if (err.name === 'ZodError') {
    return sendError(
      res,
      'Validation failed for incoming request parameters.',
      400,
      'VALIDATION_ERROR',
      err.errors
    );
  }

  // SyntaxError from malformed JSON in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(
      res,
      'Malformed JSON payload received.',
      400,
      'INVALID_JSON'
    );
  }

  // Safe error response - never leak internal stack traces to clients in production
  const isDev = process.env.NODE_ENV === 'development';
  return sendError(
    res,
    isDev ? err.message : 'An internal server error occurred. Please try again later.',
    err.statusCode || 500,
    err.code || 'SERVER_ERROR',
    isDev ? { stack: err.stack } : undefined
  );
}
