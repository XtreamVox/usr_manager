import request from 'supertest';
import { describe, expect, it } from '@jest/globals';
import app from '../../app.js';

describe('Health endpoint', () => {
  it('returns server, database and process status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      db: expect.stringMatching(/^(connected|disconnected)$/),
      uptime: expect.any(Number),
      timestamp: expect.any(String)
    });
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
