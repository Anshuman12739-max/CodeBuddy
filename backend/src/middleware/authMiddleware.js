import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/supabaseClient.js';
import { sendError } from '../utils/responseHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication Middleware
 * Enforces token verification and extracts authenticated user context.
 * Never trusts client-supplied user_id in headers or bodies.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      'Authentication required. Please provide a valid Bearer token.',
      401,
      'AUTH_REQUIRED'
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return sendError(
      res,
      'Malformed Authorization header. Missing Bearer token.',
      401,
      'AUTH_INVALID_TOKEN'
    );
  }

  try {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.getUser(token);

      if (error || !data.user) {
        logger.warn('Supabase token verification failed:', error?.message);
        return sendError(
          res,
          'Session expired or invalid credentials. Please log in again.',
          401,
          'AUTH_EXPIRED_OR_INVALID'
        );
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata || {},
        token
      };
      return next();
    } else {
      // Local development fallback when Supabase keys are not yet connected
      // Decodes or provisions a consistent local student profile
      req.user = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'student@codebuddy.local',
        metadata: { display_name: 'Student Developer' },
        token: 'dev-token-offline'
      };
      return next();
    }
  } catch (err) {
    logger.error('Unexpected error in authMiddleware:', err.message);
    return sendError(res, 'Authentication verification error.', 500, 'AUTH_INTERNAL_ERROR');
  }
}

/**
 * Optional Auth Middleware
 * Populates req.user if token is present and valid, but does not block requests if unauthenticated.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.getUser(token);
      if (!error && data?.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata || {},
          token
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'student@codebuddy.local',
        metadata: { display_name: 'Student Developer' },
        token: 'dev-token-offline'
      };
    }
  } catch (err) {
    req.user = null;
  }
  next();
}
