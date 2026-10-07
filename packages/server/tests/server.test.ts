import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../src/index.js';
import { FastifyInstance } from 'fastify';

describe('Zixie Backend Fastify API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = createServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns healthy', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('healthy');
  });

  it('GET /api/demo runs analysis on benchmark cohort and returns rings', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/demo',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.reportId).toBeDefined();
    expect(body.candidates.length).toBe(6);
    expect(body.report.summary.collusionRingsCount).toBeGreaterThanOrEqual(1);
    expect(body.report.summary.aiFlaggedCount).toBe(1);
  });

  it('POST /api/analyze rejects payload with fewer than 2 candidates', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: {
        candidates: [
          {
            id: 'c1',
            candidateName: 'Lone Wolf',
            filename: 'test.js',
            language: 'javascript',
            sourceCode: 'console.log(1);',
          },
        ],
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('GET /api/reports/:id/compare retrieves side-by-side diff with tiles', async () => {
    // 1. First trigger demo to get a reportId
    const demoRes = await app.inject({
      method: 'GET',
      url: '/api/demo',
    });
    const demoData = JSON.parse(demoRes.payload);
    const reportId = demoData.reportId;

    // 2. Compare Alice and Bob
    const compareRes = await app.inject({
      method: 'GET',
      url: `/api/reports/${reportId}/compare?candA=cand-alice&candB=cand-bob`,
    });

    expect(compareRes.statusCode).toBe(200);
    const diff = JSON.parse(compareRes.payload);
    expect(diff.candA.candidateName).toBe('Alice Vance');
    expect(diff.candB.candidateName).toBe('Bob Miller');
    expect(diff.comparison.similarityScore).toBeGreaterThanOrEqual(0.80);
    expect(diff.comparison.matchedTiles.length).toBeGreaterThan(0);
  });
});
