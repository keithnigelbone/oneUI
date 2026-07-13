/**
 * runRoute.test.ts — VER-03 persistence wiring for the run route.
 *
 * Proves the gap closed by the Phase 1 verification: the
 * `/api/experience-lab/run` route MUST durably persist a completed run (and its
 * IR) to Convex via `createRun` / `recordRunEvents` / `persistArtifact`.
 * Previously these mutations existed but were never invoked, so every run was
 * ephemeral.
 *
 * The Mastra workflow + the Convex client are mocked: this exercises the
 * route's real persistence wiring + best-effort guards, not the backend.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getValidProfilesForType } from '@oneui/experience-builder-core';

// Hoisted spies — shared between the vi.mock factories and the assertions.
const h = vi.hoisted(() => {
  const mutation = vi.fn(
    async (ref: string, _args?: unknown): Promise<string | undefined> =>
      ref === 'createRun' ? 'persisted-run-1' : undefined,
  );
  // The loader queries Convex via `query`. By default return a real-shaped
  // overview for the brand-overview query and `null` otherwise; individual
  // tests override per ref as needed.
  const query = vi.fn(async (ref: string, _args?: unknown): Promise<unknown> => {
    if (ref === 'getBrandOverviewData') {
      return { color: { config: { brandScales: [{ name: 'primary' }] } }, presetSelection: null, appearanceConfig: null };
    }
    return null;
  });
  const runExperienceWorkflow = vi.fn();
  return { mutation, query, runExperienceWorkflow };
});

vi.mock('@oneui/experience-builder-agents', () => ({
  runExperienceWorkflow: h.runExperienceWorkflow,
}));

vi.mock('@oneui/shared', () => ({
  // The loader only merges when a sub-brand is found; the default `query`
  // returns null for sub-brand fetches, so this is exercised only when a test
  // overrides `getById`. Identity-merge keeps the mapping assertions simple.
  applySubBrandAccentsToFoundation: (base: unknown, _sub: unknown) => base,
}));

vi.mock('convex/browser', () => ({
  ConvexHttpClient: vi
    .fn()
    .mockImplementation(() => ({ mutation: h.mutation, query: h.query })),
}));

vi.mock('@oneui/convex', () => ({
  api: {
    experienceRuns: {
      createRun: 'createRun',
      recordRunEvents: 'recordRunEvents',
      persistArtifact: 'persistArtifact',
    },
    foundations: {
      getBrandOverviewData: 'getBrandOverviewData',
    },
    subBrandConfigs: {
      getById: 'getById',
    },
  },
}));

import { POST } from '@/app/api/experience-lab/run/route';

const ARTIFACT_TYPE = 'web-ui';
const PROFILE = getValidProfilesForType(ARTIFACT_TYPE)[0].id;

function makeRequest(
  brandId: string,
  subBrandConfigId?: string,
  extraBody: Record<string, unknown> = {},
) {
  return new Request('http://localhost/api/experience-lab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandId,
      artifactType: ARTIFACT_TYPE,
      outputProfile: PROFILE,
      prompt: 'a hero section',
      ...(subBrandConfigId ? { subBrandConfigId } : {}),
      ...extraBody,
    }),
  });
}

const ARTIFACT_RUN = {
  runId: 'wf-1',
  outcome: 'artifact' as const,
  ir: { artifactType: ARTIFACT_TYPE, version: 1 },
  validation: { passed: true, blocking: [], warnings: [] },
  events: [{ type: 'run-started', runId: 'wf-1', at: 1 }],
};

const GAP_RUN = {
  runId: 'wf-2',
  outcome: 'gap' as const,
  events: [{ type: 'run-started', runId: 'wf-2', at: 1 }],
};

describe('experience-lab run route — VER-03 persistence', () => {
  beforeEach(() => {
    h.mutation.mockClear();
    h.query.mockClear();
    h.runExperienceWorkflow.mockReset();
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://example.convex.cloud';
  });

  it('persists a valid-IR run: createRun → recordRunEvents → persistArtifact', async () => {
    h.runExperienceWorkflow.mockResolvedValue(ARTIFACT_RUN);

    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text(); // drain the NDJSON stream

    expect(res.status).toBe(200);
    const refs = h.mutation.mock.calls.map((c) => c[0]);
    expect(refs).toEqual(['createRun', 'recordRunEvents', 'persistArtifact']);

    const recordArgs = h.mutation.mock.calls[1][1] as { events: unknown[]; status: string };
    expect(recordArgs.status).toBe('artifact');
    expect(recordArgs.events).toEqual(ARTIFACT_RUN.events);

    const artifactArgs = h.mutation.mock.calls[2][1] as { ir: unknown };
    expect(artifactArgs.ir).toEqual(ARTIFACT_RUN.ir);

    expect(res.headers.get('X-Experience-Persisted-Run-Id')).toBe('persisted-run-1');
  });

  it('accepts and persists Storybook strictness metadata for exact compound recipes', async () => {
    h.runExperienceWorkflow.mockResolvedValue(ARTIFACT_RUN);

    const res = await POST(
      makeRequest('k57xrealbrandid000', undefined, {
        requestedComponents: ['WebHeader'],
        strictStorybook: true,
        storybookMcpUrl: 'http://localhost:6006/mcp',
      }),
    );
    await res.text();

    expect(res.status).toBe(200);
    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      requestedComponents?: string[];
      strictStorybook?: boolean;
      storybookMcpUrl?: string;
    };
    expect(passed.requestedComponents).toEqual(['WebHeader']);
    expect(passed.strictStorybook).toBe(true);
    expect(passed.storybookMcpUrl).toBe('http://localhost:6006/mcp');

    const createArgs = h.mutation.mock.calls[0][1] as { request: Record<string, unknown> };
    expect(createArgs.request).toMatchObject({
      requestedComponents: ['WebHeader'],
      strictStorybook: true,
      storybookMcpUrl: 'http://localhost:6006/mcp',
    });
  });

  it('strips undefined values before persisting agent trace JSON to Convex', async () => {
    h.runExperienceWorkflow.mockResolvedValue({
      ...ARTIFACT_RUN,
      agentTrace: {
        registryMatches: ['Surface', undefined, 'Button'],
        planner: {
          sections: ['Hero'],
          messageHierarchy: ['headline', undefined],
          primaryCTA: 'Get started',
          optional: undefined,
        },
      },
    });

    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    expect(res.status).toBe(200);
    const persistCall = h.mutation.mock.calls.find((c) => c[0] === 'persistArtifact');
    expect(persistCall).toBeTruthy();
    expect((persistCall?.[1] as { agentTrace: unknown }).agentTrace).toEqual({
      registryMatches: ['Surface', 'Button'],
      planner: {
        sections: ['Hero'],
        messageHierarchy: ['headline'],
        primaryCTA: 'Get started',
      },
    });
  });

  it('persists a gap run as run-log only — no artifact fabricated', async () => {
    h.runExperienceWorkflow.mockResolvedValue(GAP_RUN);

    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    expect(res.status).toBe(200);
    const refs = h.mutation.mock.calls.map((c) => c[0]);
    expect(refs).toEqual(['createRun', 'recordRunEvents']);
    expect(refs).not.toContain('persistArtifact');
    expect((h.mutation.mock.calls[1][1] as { status: string }).status).toBe('gap');
  });

  it('skips persistence for the unsaved "jio" placeholder brand, stream still works', async () => {
    h.runExperienceWorkflow.mockResolvedValue(ARTIFACT_RUN);

    const res = await POST(makeRequest('jio'));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(h.mutation).not.toHaveBeenCalled();
    expect(res.headers.get('X-Experience-Persisted-Run-Id')).toBeNull();
    expect(body).toContain('"kind":"result"'); // stream intact
  });

  it('never breaks the stream when Convex is unconfigured', async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    h.runExperienceWorkflow.mockResolvedValue(ARTIFACT_RUN);

    const res = await POST(makeRequest('k57xrealbrandid000'));
    const body = await res.text();

    expect(res.status).toBe(200);
    expect(h.mutation).not.toHaveBeenCalled();
    expect(body).toContain('"kind":"result"');
  });
});

describe('experience-lab run route — FND-01/FND-04 foundations loader injection', () => {
  beforeEach(() => {
    h.mutation.mockClear();
    h.query.mockClear();
    h.runExperienceWorkflow.mockReset();
    h.runExperienceWorkflow.mockResolvedValue(ARTIFACT_RUN);
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://example.convex.cloud';
  });

  it('injects a foundationsLoader function into the workflow when Convex is configured', async () => {
    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      foundationsLoader?: unknown;
    };
    expect(typeof passed.foundationsLoader).toBe('function');
  });

  it('does NOT inject a foundationsLoader when Convex is unconfigured', async () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      foundationsLoader?: unknown;
    };
    expect(passed.foundationsLoader).toBeUndefined();
  });

  it('forwards subBrandConfigId from the body into RunExperienceInput', async () => {
    const res = await POST(makeRequest('k57xrealbrandid000', 'sub-1'));
    await res.text();

    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      subBrandConfigId?: string;
    };
    expect(passed.subBrandConfigId).toBe('sub-1');
  });

  it('the captured loader maps colorConfig from overview.color.config (Pitfall 1) and returns null for the placeholder brand', async () => {
    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      foundationsLoader: (input: { brandId: string; subBrandConfigId?: string }) => Promise<unknown>;
    };

    // Placeholder brand short-circuits to null → engine system defaults (D-08).
    await expect(passed.foundationsLoader({ brandId: 'jio' })).resolves.toBeNull();

    // A real brand maps `color.config` VERBATIM — NOT `overview.color`.
    const mapped = (await passed.foundationsLoader({
      brandId: 'k57xrealbrandid000',
    })) as { colorConfig: unknown };
    expect(mapped.colorConfig).toEqual({ brandScales: [{ name: 'primary' }] });
  });

  it('the captured loader returns null (→ system defaults) when Convex throws — never propagates (CR-01 / D-08)', async () => {
    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      foundationsLoader: (input: { brandId: string; subBrandConfigId?: string }) => Promise<unknown>;
    };

    // Simulate a transient Convex failure on the brand-overview query.
    h.query.mockRejectedValueOnce(new Error('Convex network blip'));

    // The loader must swallow the throw and degrade to null, not reject.
    await expect(
      passed.foundationsLoader({ brandId: 'k57xrealbrandid000' }),
    ).resolves.toBeNull();
  });

  it('the captured loader fetches + merges a sub-brand via getById when subBrandConfigId is present', async () => {
    // Override getById to return a sub-brand row so the merge path runs.
    h.query.mockImplementation(async (ref: string) => {
      if (ref === 'getBrandOverviewData') {
        return { color: { config: { brandScales: [] } }, presetSelection: null, appearanceConfig: null };
      }
      if (ref === 'getById') {
        return { _id: 'sub-1', name: 'Sub One' };
      }
      return null;
    });

    const res = await POST(makeRequest('k57xrealbrandid000', 'sub-1'));
    await res.text();

    const passed = h.runExperienceWorkflow.mock.calls[0][0] as {
      foundationsLoader: (input: { brandId: string; subBrandConfigId?: string }) => Promise<unknown>;
    };

    await passed.foundationsLoader({ brandId: 'k57xrealbrandid000', subBrandConfigId: 'sub-1' });

    const refs = h.query.mock.calls.map((c) => c[0]);
    expect(refs).toContain('getBrandOverviewData');
    expect(refs).toContain('getById');
  });
});
