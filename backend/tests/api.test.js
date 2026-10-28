import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('CodeBuddy AI - Backend API Suite', () => {

  describe('GET /api/health', () => {
    it('returns healthy status with system telemetry', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data).toHaveProperty('uptime');
    });
  });

  describe('GET /api/health/ai', () => {
    it('returns provider health details', async () => {
      const res = await request(app).get('/api/health/ai');
      // Status will be 200 if Ollama is running or 503 if unreachable, both return standardized json
      expect([200, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('provider');
        expect(res.body.data).toHaveProperty('model');
      } else {
        expect(res.body.success).toBe(false);
        expect(res.body.error).toHaveProperty('code');
      }
    });
  });

  describe('Input Validation on AI Endpoints', () => {
    it('rejects /api/ai/explain with empty code', async () => {
      const res = await request(app)
        .post('/api/ai/explain')
        .send({ language: 'python', code: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unsupported programming language in /api/ai/explain', async () => {
      const res = await request(app)
        .post('/api/ai/explain')
        .send({ language: 'rust', code: 'fn main() {}' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects /api/ai/hints when requested level is greater than 4', async () => {
      const res = await request(app)
        .post('/api/ai/hints')
        .send({
          level: 5,
          problemContext: { title: 'Test', description: 'Test problem', language: 'python' }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body.error)).toContain('Progressive hints only support levels 1 through 4');
    });

    it('rejects /api/ai/hints when requested level is 0 or negative', async () => {
      const res = await request(app)
        .post('/api/ai/hints')
        .send({
          level: 0,
          problemContext: { title: 'Test', description: 'Test problem', language: 'python' }
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects /api/ai/debug when code is missing', async () => {
      const res = await request(app)
        .post('/api/ai/debug')
        .send({ language: 'javascript' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication Enforcement', () => {
    it('returns 401 when accessing protected /api/conversations without token', async () => {
      const res = await request(app).get('/api/conversations');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('returns 401 when accessing /api/dashboard/stats without token', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });

    it('returns 401 when accessing /api/profile without token', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('Safe 404 Routing', () => {
    it('returns standardized 404 JSON for non-existent route', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
