/**
 * Standardized Response Handlers
 */

export function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

export function sendError(res, message = 'An unexpected error occurred', statusCode = 500, code = 'SERVER_ERROR', details = []) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}
