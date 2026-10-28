import app from './app.js';
import { config, validateConfig } from './config/env.js';
import { logger } from './utils/logger.js';
import { aiService } from './services/ai/aiService.js';

async function startServer() {
  // Validate configuration
  const validation = validateConfig();
  if (!validation.isValid) {
    logger.warn('Configuration warnings detected:');
    validation.issues.forEach(issue => logger.warn(` - ${issue}`));
  }

  const port = config.port;

  const server = app.listen(port, async () => {
    logger.info('==================================================');
    logger.info(`  CodeBuddy AI Backend Server Running on :${port}`);
    logger.info(`  Environment : ${config.nodeEnv}`);
    logger.info(`  AI Provider : ${config.ai.provider.toUpperCase()}`);
    logger.info(`  AI Model    : ${config.ai.provider === 'gemini' ? config.ai.gemini.model : config.ai.ollama.model}`);
    logger.info(`  CORS Origin : ${config.frontendOrigin}`);
    logger.info('==================================================');

    // Run initial AI health check asynchronously
    try {
      const health = await aiService.healthCheck();
      if (health.isHealthy) {
        logger.info(`AI Provider Status: ONLINE (${health.latencyMs}ms latency)`);
      } else {
        logger.warn(`AI Provider Status: OFFLINE or UNCONFIGURED - ${health.error}`);
      }
    } catch (err) {
      logger.warn(`AI Provider Health check error: ${err.message}`);
    }
  });

  // Graceful shutdown handling
  const shutdown = () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
