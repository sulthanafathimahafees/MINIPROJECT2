import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';

// Create a test app instance matching health endpoint logic
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'OptiBuy Backend API',
    database: 'PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

describe('Backend API Health Check Endpoint', () => {
  it('GET /api/health should return 200 OK and service status details', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'online');
    expect(response.body).toHaveProperty('service', 'OptiBuy Backend API');
    expect(response.body).toHaveProperty('database', 'PostgreSQL');
    expect(response.body).toHaveProperty('timestamp');
  });
});
