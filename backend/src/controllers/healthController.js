import { aiService } from '../services/ai/aiService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export async function getSystemHealth(req, res) {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  }, 'System is operational');
}

export async function getAIHealth(req, res) {
  try {
    const health = await aiService.healthCheck();
    if (!health.isHealthy) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_PROVIDER_UNHEALTHY',
          message: health.error || 'AI provider failed health check',
          provider: health.provider,
          model: health.model
        }
      });
    }

    return sendSuccess(res, health, `AI provider '${health.provider}' is operational`);
  } catch (err) {
    return sendError(res, err.message, 500, 'AI_HEALTH_CHECK_FAILED');
  }
}
