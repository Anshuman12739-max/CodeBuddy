import { sendError } from '../utils/responseHandler.js';

/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validateRequest(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const issues = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return sendError(
          res,
          'Validation error: Please check your input parameters.',
          400,
          'VALIDATION_ERROR',
          issues
        );
      }
      next(err);
    }
  };
}
