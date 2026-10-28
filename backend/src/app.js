import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import { standardLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';
import { sendError } from './utils/responseHandler.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman) or matching frontend
    if (!origin || origin === config.frontendOrigin || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limiting
app.use(standardLimiter);

// Mount main REST API
app.use('/api', apiRoutes);

// Handle 404 Not Found
app.use((req, res) => {
  return sendError(res, `Route '${req.method} ${req.originalUrl}' not found.`, 404, 'NOT_FOUND');
});

// Centralized error handling
app.use(errorHandler);

export default app;
