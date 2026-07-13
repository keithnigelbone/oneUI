/**
 * statusRoute.test.ts — durable run status read model.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
  const query = vi.fn();
  const createRequiredAuthedConvexClient = vi.fn();
  return { query, createRequiredAuthedConvexClient };
});

vi.mock('@/lib/convexServer', () => ({
  createRequiredAuthedConvexClient: h.createRequiredAuthedConvexClient,
}));

vi.mock('@oneui/convex', () => ({
  api: {
    experienceRuns: {
      getRun: 'getRun',
    },
  },
}));

import { GET } from '@/app/api/experience-lab/status/route';

function statusRequest(runId?: string): Request {
  const url = new URL('http://localhost/api/experience-lab/status');
  if (runId) url.searchParams.set('runId', runId);
  return new Request(url);
}

describe('experience-lab status route', () => {
  beforeEach(() => {
    h.query.mockReset();
    h.createRequiredAuthedConvexClient.mockReset();
    h.createRequiredAuthedConvexClient.mockResolvedValue({ query: h.query });
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://example.convex.cloud';
  });

  it('returns the durable run status projection', async () => {
    h.query.mockResolvedValue({
      _id: 'run-1',
      brandId: 'brand-1',
      status: 'artifact',
      request: { artifactType: 'web-ui', outputProfile: 'desktop' },
      events: [{ type: 'run-started', runId: 'wf-1', at: 1 }],
      artifactId: 'artifact-1',
      validation: { passed: true },
      previewUrl: 'https://preview.example/run-1',
      createdAt: 1,
      updatedAt: 2,
      completedAt: 3,
    });

    const res = await GET(statusRequest('run-1'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(h.query).toHaveBeenCalledWith('getRun', { runId: 'run-1' });
    expect(body).toMatchObject({
      runId: 'run-1',
      brandId: 'brand-1',
      status: 'artifact',
      artifactId: 'artifact-1',
      previewUrl: 'https://preview.example/run-1',
    });
  });

  it('rejects a missing run id', async () => {
    const res = await GET(statusRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Invalid status request');
    expect(h.query).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown run', async () => {
    h.query.mockResolvedValue(null);

    const res = await GET(statusRequest('missing-run'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Experience run not found');
  });

  it('returns 503 when Convex is not configured', async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    const res = await GET(statusRequest('run-1'));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error).toContain('Convex not configured');
    expect(h.query).not.toHaveBeenCalled();
  });

  it('requires an authenticated Convex client before reading a run', async () => {
    h.createRequiredAuthedConvexClient.mockResolvedValue(null);

    const res = await GET(statusRequest('run-1'));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Authentication required');
    expect(h.query).not.toHaveBeenCalled();
  });
});
