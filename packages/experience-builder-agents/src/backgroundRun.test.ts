/**
 * backgroundRun.test.ts — D-05 Background Tasks behaviors, credential-free.
 *
 *   1. a background-task run emits >= 1 progress ExperienceBuilderEvent during
 *      execution (progress event count > 0).
 *   2. the background path resolves to the SAME RunExperienceResult as the
 *      inline runExperienceWorkflow path for identical input (outcome + ir +
 *      events set, model mocked deterministically; runId/at normalized).
 *   3. backgroundRun.ts imports createBackgroundTask and no second `ai` seam.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { __setCallModelImpl, type CallModelArgs } from './modelAdapter';
import { clearCache } from './cache';
import { runExperienceWorkflow } from './workflow';
import { runExperienceWorkflowBackground } from './backgroundRun';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import type { PreviewExecutor, RenderResult } from '@oneui/experience-builder-preview';

/** Credential-free mock executor (matches workflow.test.ts) for the preview step. */
const mockExecutor: PreviewExecutor = {
  render: async (): Promise<RenderResult> => ({
    screenshots: [{ profile: 'desktop', png: Buffer.from('fake-png') }],
    previewState: { url: '?t=mock-token', expiresAt: Date.now() + 60_000 },
    rendered: true,
  }),
};

const coveredRequest = {
  brandId: 'jio-default',
  artifactType: 'web-ui' as const,
  outputProfile: 'web-desktop' as const,
  // Inject the mock so the new preview step renders without a live browser.
  previewExecutor: mockExecutor,
};

/** Schema-aware deterministic mock (same shape as workflow.test.ts). */
function schemaAwareModelImpl<TSchema extends import('zod').z.ZodType>(
  args: CallModelArgs<TSchema>,
): Promise<import('zod').z.infer<TSchema>> {
  const shape = (args.schema as { shape?: Record<string, unknown> }).shape ?? {};
  let value: unknown;
  if ('sections' in shape && 'screenCount' in shape) {
    value = {
      sections: [{ id: 's1', name: 'main', intent: 'The main section' }],
      messageHierarchy: ['Primary message'],
      primaryCTA: 'Get started',
      screenCount: 1,
    };
  } else if ('surfaceMode' in shape && 'components' in shape) {
    value = { surfaceMode: 'default', components: ['Button'] };
  } else if ('headline' in shape && 'body' in shape) {
    value = { headline: 'Headline copy', body: 'Body copy.', cta: 'Go' };
  } else if ('hierarchy' in shape && 'brandFit' in shape) {
    // VisualRubric (vision judge) — high scores so the artifact passes cleanly.
    value = { hierarchy: 5, spacing: 5, density: 5, brandFit: 5, notes: 'clean' };
  } else if ('ops' in shape) {
    value = { ops: [{ op: 'replace', path: '/brandId', value: 'jio-default' }] };
  } else {
    value = { instances: [{ id: 'cmp-1', type: 'Button', props: {}, slots: {} }] };
  }
  return Promise.resolve(value as import('zod').z.infer<TSchema>);
}

/** Normalize a result to its identity-free shape for cross-run comparison. */
function normalize(events: ExperienceBuilderEventT[]) {
  return events.map((e) =>
    e.type === 'step' ? { type: e.type, step: e.step, status: e.status } : { type: e.type },
  );
}

let restore: (() => void) | undefined;
beforeEach(() => {
  clearCache();
  restore = __setCallModelImpl(schemaAwareModelImpl);
});
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('runExperienceWorkflowBackground — streaming progress (D-05)', () => {
  it('emits >= 1 progress ExperienceBuilderEvent during execution', async () => {
    const progress: ExperienceBuilderEventT[] = [];
    const result = await runExperienceWorkflowBackground(coveredRequest, {
      onEvent: (e) => progress.push(e),
    });

    expect(result.outcome).toBe('artifact');
    // Progress streamed: more than zero events surfaced as the run progressed.
    expect(progress.length).toBeGreaterThan(0);
    // The progress frames are the run's own ExperienceBuilderEvents.
    expect(progress.some((e) => e.type === 'run-started')).toBe(true);
    expect(progress.some((e) => e.type === 'run-completed')).toBe(true);
  });
});

describe('runExperienceWorkflowBackground — same result as inline (D-05)', () => {
  it('resolves to the SAME outcome + ir + events set as runExperienceWorkflow', async () => {
    const inline = await runExperienceWorkflow(coveredRequest);
    const background = await runExperienceWorkflowBackground(coveredRequest);

    // Same terminal outcome.
    expect(background.outcome).toBe(inline.outcome);
    // Same IR (the committed artifact).
    expect(background.ir).toEqual(inline.ir);
    // Same validation pass/fail.
    expect(background.validation?.passed).toBe(inline.validation?.passed);
    // Same compiled bundle.
    expect(background.bundle).toBe(inline.bundle);
    // Same event SET (identity fields runId/at normalized out — they differ per run).
    expect(normalize(background.events)).toEqual(normalize(inline.events));
  });
});

describe('single ai-seam + Mastra-native submission', () => {
  it('imports createBackgroundTask and no `ai` / `@ai-sdk` second seam', () => {
    const src = readFileSync(fileURLToPath(new URL('./backgroundRun.ts', import.meta.url)), 'utf8');
    expect(src).toMatch(/createBackgroundTask/);
    expect(src).toMatch(/@mastra\/core\/background-tasks/);
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
  });
});
