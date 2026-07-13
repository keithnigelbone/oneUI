/// <reference types="vite/client" />
/**
 * experienceRuns.test.ts
 *
 * Convex round-trip tests for the P3 version-persistence + variant-group slice
 * (VER-01 / VER-02 / CANVAS-05, plan 03-03). Exercises the public
 * mutations/queries through the convex-test harness:
 *
 *   - VER-01 : persistArtifact with the full D-13 version object, read back via
 *     getArtifactHistory — every field round-trips.
 *   - round-trip / no migration : a version persisted WITHOUT the new fields
 *     reads back without error (existing-row append-only safety).
 *   - CANVAS-05 : two artifacts sharing one variantGroupId are both returned by
 *     listVariantGroup.
 */
import { convexTest } from 'convex-test';
import { describe, expect, test } from 'vitest';

import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');

/** Seed a minimal active brand and return its id. */
async function seedBrand(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    const now = Date.now();
    return await ctx.db.insert('brands', {
      name: 'Test Brand',
      slug: `test-brand-${now}-${Math.random().toString(36).slice(2)}`,
      primaryHue: 220,
      primaryChroma: 0.15,
      secondaryHue: 30,
      secondaryChroma: 0.1,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  });
}

/** Create a running experience run for the given brand and return its id. */
async function seedRun(
  t: ReturnType<typeof convexTest>,
  brandId: Awaited<ReturnType<typeof seedBrand>>,
) {
  return await t.mutation(api.experienceRuns.createRun, {
    brandId,
    request: { artifactType: 'web-ui', outputProfile: 'desktop' },
  });
}

describe('experienceRuns version persistence (VER-01/VER-02)', () => {
  test('run lifecycle stores queued/running/suspended/terminal state on one durable row', async () => {
    const t = convexTest(schema, modules);
    const brandId = await seedBrand(t);

    const runId = await t.mutation(api.experienceRuns.createRun, {
      brandId,
      status: 'queued',
      request: {
        artifactType: 'web-ui',
        outputProfile: 'desktop',
        prompt: 'Create a JioFiber upgrade card',
        subBrandConfigId: 'sub-brand-1',
        parentVersionId: 'version-parent-1',
        canvasDocumentId: 'canvas-main',
        conversationThreadId: 'thread-1',
        requestedComponents: ['Button', 'Surface'],
        strictStorybook: true,
      },
    });

    let run = await t.query(api.experienceRuns.getRun, { runId });
    expect(run?.status).toBe('queued');
    expect(run?.request).toMatchObject({
      prompt: 'Create a JioFiber upgrade card',
      subBrandConfigId: 'sub-brand-1',
      parentVersionId: 'version-parent-1',
      canvasDocumentId: 'canvas-main',
      conversationThreadId: 'thread-1',
    });

    await t.mutation(api.experienceRuns.appendRunEvents, {
      runId,
      status: 'running',
      events: [{ type: 'run-started', runId: 'agent-run-1', at: 1 }],
    });
    await t.mutation(api.experienceRuns.appendRunEvents, {
      runId,
      status: 'suspended',
      events: [{ type: 'step', runId: 'agent-run-1', step: 'campaign-plan', status: 'completed', at: 2 }],
    });

    run = await t.query(api.experienceRuns.getRun, { runId });
    expect(run?.status).toBe('suspended');
    expect(run?.events).toHaveLength(2);

    await t.mutation(api.experienceRuns.recordRunEvents, {
      runId,
      status: 'artifact',
      events: [
        { type: 'run-started', runId: 'agent-run-1', at: 1 },
        { type: 'run-completed', runId: 'agent-run-1', outcome: 'artifact', at: 3 },
      ],
      validation: { passed: true, errors: [] },
      previewUrl: 'https://preview.example/run-1',
      toolCalls: [{ toolName: 'storybook-docs', status: 'completed' }],
      modelUsage: [{ provider: 'openai', model: 'gpt-test', totalTokens: 42 }],
    });

    run = await t.query(api.experienceRuns.getRun, { runId });
    expect(run?.status).toBe('artifact');
    expect(run?.events).toHaveLength(2);
    expect(run?.validation).toEqual({ passed: true, errors: [] });
    expect(run?.previewUrl).toBe('https://preview.example/run-1');
    expect(run?.toolCalls).toEqual([{ toolName: 'storybook-docs', status: 'completed' }]);
    expect(run?.modelUsage).toEqual([{ provider: 'openai', model: 'gpt-test', totalTokens: 42 }]);
    expect(run?.completedAt).toEqual(expect.any(Number));
  });

  test('createRun stores Storybook strict recipe metadata in the originating request', async () => {
    const t = convexTest(schema, modules);
    const brandId = await seedBrand(t);

    const runId = await t.mutation(api.experienceRuns.createRun, {
      brandId,
      request: {
        artifactType: 'web-ui',
        outputProfile: 'desktop',
        requestedComponents: ['WebHeader'],
        strictStorybook: true,
        storybookMcpUrl: 'http://localhost:6006/mcp',
      },
    });

    const run = await t.query(api.experienceRuns.getRun, { runId });
    expect(run?.request).toMatchObject({
      requestedComponents: ['WebHeader'],
      strictStorybook: true,
      storybookMcpUrl: 'http://localhost:6006/mcp',
    });
  });

  test('persistArtifact stores the full D-13 version object and getArtifactHistory reads it back', async () => {
    const t = convexTest(schema, modules);
    const brandId = await seedBrand(t);
    const runId = await seedRun(t, brandId);

    const ir = { kind: 'experience', sections: [{ id: 's1', instances: [] }] };
    const validation = { valid: true, blocking: [], warnings: [] };
    const previewState = { url: 'https://preview.example/abc', viewport: 'desktop', phase: 'live' };
    const evaluation = { composite: 4.2, objective: { passed: true }, subjective: { hierarchy: 4 } };

    const { artifactId, versionId } = await t.mutation(api.experienceRuns.persistArtifact, {
      runId,
      brandId,
      artifactType: 'web-ui',
      outputProfile: 'desktop',
      ir,
      validation,
      compiledBundle: { code: '<compiled/>', meta: { lang: 'tsx' } },
      previewState,
      evaluation,
      originRunId: runId,
    });

    const history = await t.query(api.experienceRuns.getArtifactHistory, { artifactId });
    expect(history).not.toBeNull();
    expect(history!.versions).toHaveLength(1);

    const version = history!.versions[0];
    expect(version._id).toEqual(versionId);
    // Full VER-01 object round-trips.
    expect(version.ir).toEqual(ir);
    expect(version.validation).toEqual(validation);
    expect(version.compiledBundle).toEqual({ code: '<compiled/>', meta: { lang: 'tsx' } });
    expect(version.previewState).toEqual(previewState);
    expect(version.evaluation).toEqual(evaluation);
    expect(version.originRunId).toEqual(runId);
    // parentVersionId absent for the root version (no migration needed).
    expect(version.parentVersionId).toBeUndefined();
  });

  test('round-trip: a version persisted WITHOUT the new D-13 fields reads back cleanly (append-only, no migration)', async () => {
    const t = convexTest(schema, modules);
    const brandId = await seedBrand(t);
    const runId = await seedRun(t, brandId);

    // Persist with ONLY the pre-existing fields — mirrors an existing row that
    // predates the D-13 additive fields.
    const { artifactId } = await t.mutation(api.experienceRuns.persistArtifact, {
      runId,
      brandId,
      artifactType: 'web-ui',
      outputProfile: 'desktop',
      ir: { kind: 'experience', sections: [] },
    });

    const history = await t.query(api.experienceRuns.getArtifactHistory, { artifactId });
    expect(history).not.toBeNull();
    expect(history!.versions).toHaveLength(1);

    const version = history!.versions[0];
    // New fields are simply absent — no error, no migration.
    expect(version.previewState).toBeUndefined();
    expect(version.thumbnail).toBeUndefined();
    expect(version.evaluation).toBeUndefined();
    expect(version.originRunId).toBeUndefined();
    // The artifact itself round-trips without a variantGroupId.
    expect(history!.artifact.variantGroupId).toBeUndefined();
  });
});

describe('experienceRuns variant grouping (CANVAS-05)', () => {
  test('two artifacts sharing one variantGroupId are both returned by listVariantGroup', async () => {
    const t = convexTest(schema, modules);
    const brandId = await seedBrand(t);
    const variantGroupId = `vg-${Date.now()}`;

    const runA = await seedRun(t, brandId);
    const { artifactId: artifactA } = await t.mutation(api.experienceRuns.persistArtifact, {
      runId: runA,
      brandId,
      artifactType: 'web-ui',
      outputProfile: 'desktop',
      ir: { kind: 'experience', sections: [], variant: 'A' },
      variantGroupId,
    });

    const runB = await seedRun(t, brandId);
    const { artifactId: artifactB } = await t.mutation(api.experienceRuns.persistArtifact, {
      runId: runB,
      brandId,
      artifactType: 'web-ui',
      outputProfile: 'desktop',
      ir: { kind: 'experience', sections: [], variant: 'B' },
      variantGroupId,
    });

    // A third artifact in a DIFFERENT group must NOT leak into the result.
    const runC = await seedRun(t, brandId);
    await t.mutation(api.experienceRuns.persistArtifact, {
      runId: runC,
      brandId,
      artifactType: 'web-ui',
      outputProfile: 'desktop',
      ir: { kind: 'experience', sections: [], variant: 'C' },
      variantGroupId: `vg-other-${Date.now()}`,
    });

    const siblings = await t.query(api.experienceRuns.listVariantGroup, { variantGroupId });
    expect(siblings).toHaveLength(2);
    const ids = siblings.map((a) => a._id).sort();
    expect(ids).toEqual([artifactA, artifactB].sort());
    for (const sibling of siblings) {
      expect(sibling.variantGroupId).toEqual(variantGroupId);
    }
  });
});
