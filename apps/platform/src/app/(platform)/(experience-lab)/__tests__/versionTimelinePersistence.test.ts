/**
 * versionTimelinePersistence.test.ts
 *
 * VER-01 END-TO-END wiring for the run route — the blocker fix proven.
 *
 * Asserts that after a SUCCESSFUL run the route invokes `persistArtifact` with
 * the FULL D-13 version object: a non-empty `previewState`, a non-empty
 * `evaluation`, and a `thumbnail` `_storage` id (uploaded from the first
 * preview screenshot via `generateUploadUrl`), plus `originRunId`. Without this
 * wiring those fields stay null and the VER-02 timeline renders blanks.
 *
 * Also asserts the INPUT-05 iterate path: a body carrying `parentVersionId` is
 * accepted and `parentVersionId` is threaded into `persistArtifact` so the new
 * version chains onto its parent.
 *
 * The Mastra workflow + the Convex client + `fetch` (the `_storage` upload) are
 * mocked — this exercises the route's real VER-01 wiring + best-effort guards,
 * not the backend. (Named `versionTimeline*` so the Plan 06 `-t versionTimeline`
 * filter runs it alongside the VER-02 panel test.)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getValidProfilesForType } from '@oneui/experience-builder-core';

const h = vi.hoisted(() => {
  const mutation = vi.fn(
    async (ref: string, _args?: unknown): Promise<string | undefined> => {
      if (ref === 'createRun') return 'persisted-run-1';
      if (ref === 'generateUploadUrl') return 'https://upload.example/put';
      return undefined;
    },
  );
  const query = vi.fn(async (ref: string, _args?: unknown): Promise<unknown> => {
    if (ref === 'getBrandOverviewData') {
      return { color: { config: { brandScales: [] } }, presetSelection: null, appearanceConfig: null };
    }
    if (ref === 'getStorageUrl') return 'https://convex.example/storage/thumb.png';
    return null;
  });
  const runExperienceWorkflow = vi.fn();
  return { mutation, query, runExperienceWorkflow };
});

vi.mock('@oneui/experience-builder-agents', () => ({
  runExperienceWorkflow: h.runExperienceWorkflow,
}));

vi.mock('@oneui/shared', () => ({
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
    foundations: { getBrandOverviewData: 'getBrandOverviewData' },
    subBrandConfigs: { getById: 'getById' },
    renderedScreenshots: { generateUploadUrl: 'generateUploadUrl' },
    references: { getStorageUrl: 'getStorageUrl' },
  },
}));

import { POST } from '@/app/api/experience-lab/run/route';

const ARTIFACT_TYPE = 'web-ui';
const PROFILE = getValidProfilesForType(ARTIFACT_TYPE)[0].id;

function makeRequest(brandId: string, extra: Record<string, unknown> = {}) {
  return new Request('http://localhost/api/experience-lab/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandId,
      artifactType: ARTIFACT_TYPE,
      outputProfile: PROFILE,
      prompt: 'a hero section',
      ...extra,
    }),
  });
}

// A valid-IR run carrying the FULL VER-01 version object the route must persist.
const FULL_RUN = {
  runId: 'wf-1',
  outcome: 'artifact' as const,
  ir: { artifactType: ARTIFACT_TYPE, version: 1 },
  validation: { passed: true, blocking: [], warnings: [] },
  bundle: 'export const App = () => null;',
  previewState: { url: 'https://preview.example/r?t=opaque', expiresAt: 9_999_999_999 },
  evaluation: { composite: 0.77, objectivePass: true },
  screenshots: [{ profile: 'desktop', png: Buffer.from('fake-png-bytes') }],
  events: [{ type: 'run-started', runId: 'wf-1', at: 1 }],
};

describe('versionTimeline VER-01 end-to-end persistence', () => {
  beforeEach(() => {
    h.mutation.mockClear();
    h.query.mockClear();
    h.runExperienceWorkflow.mockReset();
    process.env.NEXT_PUBLIC_CONVEX_URL = 'https://example.convex.cloud';
    // Mock the `_storage` upload POST → returns a storageId.
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ json: async () => ({ storageId: 'storage-thumb-1' }) })),
    );
  });

  it('persistArtifact receives non-null previewState, evaluation, thumbnail + originRunId', async () => {
    h.runExperienceWorkflow.mockResolvedValue(FULL_RUN);

    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text(); // drain the NDJSON stream

    expect(res.status).toBe(200);
    const persistCall = h.mutation.mock.calls.find((c) => c[0] === 'persistArtifact');
    expect(persistCall).toBeTruthy();
    const args = persistCall![1] as {
      previewState?: { url?: string };
      evaluation?: { composite?: number };
      thumbnail?: string;
      originRunId?: string;
    };

    // VER-01: none of these stay null after a successful run.
    expect(args.previewState?.url).toBe('https://preview.example/r?t=opaque');
    expect(args.evaluation?.composite).toBe(0.77);
    expect(args.thumbnail).toBe('storage-thumb-1');
    expect(args.originRunId).toBe('persisted-run-1');

    // The thumbnail was uploaded via generateUploadUrl + a POST to the put URL.
    const refs = h.mutation.mock.calls.map((c) => c[0]);
    expect(refs).toContain('generateUploadUrl');

    // The live preview URL + thumbnail URL surface on the terminal result frame.
    const stream = await POST(makeRequest('k57xrealbrandid000'));
    const body = await stream.text();
    expect(body).toContain('"previewUrl":"https://preview.example/r?t=opaque"');
    expect(body).toContain('"thumbnailUrl":"https://convex.example/storage/thumb.png"');
  });

  it('a missing screenshot does NOT abort persistence (thumbnail simply omitted)', async () => {
    h.runExperienceWorkflow.mockResolvedValue({ ...FULL_RUN, screenshots: [] });

    const res = await POST(makeRequest('k57xrealbrandid000'));
    await res.text();

    const persistCall = h.mutation.mock.calls.find((c) => c[0] === 'persistArtifact');
    expect(persistCall).toBeTruthy();
    const args = persistCall![1] as { thumbnail?: string; evaluation?: unknown };
    expect(args.thumbnail).toBeUndefined();
    // Persistence still ran with the rest of the version object.
    expect(args.evaluation).toBeTruthy();
  });

  it('INPUT-05 iterate: a parentVersionId body threads parentVersionId into persistArtifact', async () => {
    h.runExperienceWorkflow.mockResolvedValue(FULL_RUN);

    const res = await POST(
      makeRequest('k57xrealbrandid000', { parentVersionId: 'parent-v-1' }),
    );
    await res.text();

    // The route accepts the iterate body and seeds the run (no 400).
    expect(res.status).toBe(200);
    const persistCall = h.mutation.mock.calls.find((c) => c[0] === 'persistArtifact');
    const args = persistCall![1] as { parentVersionId?: string };
    expect(args.parentVersionId).toBe('parent-v-1');
  });
});
