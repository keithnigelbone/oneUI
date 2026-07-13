/**
 * evaluate.test.ts — EVAL-01 / D-06 / D-07 two-track scoring.
 *
 * Credential-free: the subjective track's vision judge is the injected mock
 * `callModel` (no `ANTHROPIC_API_KEY`). The objective short-circuit asserts NO
 * model call happens when blocking violations exist.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JioExperienceIRT, JioValidationResultT } from '@oneui/experience-builder-core';
import { __setCallModelImpl, type CallModelArgs } from '../modelAdapter';
import { evaluateStep } from './evaluate';
import { EVALUATOR_CONFIG } from '../evaluatorRubric';
import type { RunContext } from '../runContext';

const IR: JioExperienceIRT = {
  version: 1,
  artifactType: 'web-ui',
  outputProfile: 'web-desktop',
  brandId: 'jio-default',
  sections: [
    {
      id: 'section-main',
      name: 'main',
      instances: [{ id: 'cmp-1', type: 'Button', props: { children: 'Go' } }],
    },
  ],
} as unknown as JioExperienceIRT;

function passedValidation(): JioValidationResultT {
  return {
    passed: true,
    blocking: [],
    warnings: [],
    repairSuggestions: [],
    componentGaps: [],
    foundationGaps: [],
  };
}

function failedValidation(): JioValidationResultT {
  return {
    passed: false,
    blocking: [{ code: 'non-jio-import', message: 'tailwind', severity: 'blocking' }],
    warnings: [],
    repairSuggestions: ['Replace tailwind'],
    componentGaps: [],
    foundationGaps: [],
  };
}

function baseCtx(overrides: Partial<RunContext> = {}): RunContext {
  return {
    runId: 'run-test',
    request: { brandId: 'jio-default', artifactType: 'web-ui', outputProfile: 'web-desktop' },
    events: [],
    outcome: 'error',
    halted: false,
    ir: IR,
    rendered: true,
    screenshots: [{ profile: 'desktop', png: Buffer.from('fake-png') }],
    ...overrides,
  };
}

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('evaluateStep — objective track (D-06 short-circuit)', () => {
  it('sets a failing composite and does NOT call the model when validation has blocking violations', async () => {
    let modelCalls = 0;
    restore = __setCallModelImpl(async () => {
      modelCalls += 1;
      return {} as never;
    });

    const ctx = baseCtx({ validation: failedValidation() });
    await evaluateStep.execute({ inputData: { ctx } } as never);

    expect(modelCalls).toBe(0); // NO model call on the objective short-circuit.
    expect(ctx.evaluation?.objectivePass).toBe(false);
    expect(ctx.composite!).toBeLessThan(EVALUATOR_CONFIG.threshold);
  });

  it('treats rendered:false as a failing objective signal (VAL-06) with no model call', async () => {
    let modelCalls = 0;
    restore = __setCallModelImpl(async () => {
      modelCalls += 1;
      return {} as never;
    });

    const ctx = baseCtx({ validation: passedValidation(), rendered: false });
    await evaluateStep.execute({ inputData: { ctx } } as never);

    expect(modelCalls).toBe(0);
    expect(ctx.evaluation?.objectivePass).toBe(false);
    expect(ctx.composite!).toBeLessThan(EVALUATOR_CONFIG.threshold);
  });
});

describe('evaluateStep — subjective track (D-06 / D-07)', () => {
  it('calls the vision judge with an image part, clamps scores, and computes the composite', async () => {
    const seenArgs: CallModelArgs<never>[] = [];
    restore = __setCallModelImpl(async (args) => {
      seenArgs.push(args as unknown as CallModelArgs<never>);
      // Out-of-range scores to prove clamping (hierarchy>5, density<0).
      return { hierarchy: 9, spacing: 5, density: -3, brandFit: 5, notes: 'ok' } as never;
    });

    const ctx = baseCtx({ validation: passedValidation() });
    await evaluateStep.execute({ inputData: { ctx } } as never);

    expect(seenArgs).toHaveLength(1);
    expect(seenArgs[0]!.images).toBeDefined();
    expect(seenArgs[0]!.images!.length).toBeGreaterThan(0);

    // Clamped: hierarchy→5, density→0.
    expect(ctx.evaluation?.rubric?.hierarchy).toBe(5);
    expect(ctx.evaluation?.rubric?.density).toBe(0);
    expect(ctx.evaluation?.objectivePass).toBe(true);

    // Expanded rubric maps legacy values into theme/layout/spacing/hierarchy/
    // component/page/preview/agent fields. density<0 maps preview/agent to 0.
    expect(ctx.composite!).toBeCloseTo(4.2, 5);
  });

  it('a high-scoring rubric clears the pass threshold', async () => {
    restore = __setCallModelImpl(
      async () => ({ hierarchy: 5, spacing: 5, density: 5, brandFit: 5, notes: 'great' }) as never
    );
    const ctx = baseCtx({ validation: passedValidation() });
    await evaluateStep.execute({ inputData: { ctx } } as never);
    expect(ctx.composite!).toBeGreaterThanOrEqual(EVALUATOR_CONFIG.threshold);
  });
});

describe('evaluatorRubric — Zod-4 ↔ Anthropic safety', () => {
  it('the rubric schema uses plain z.number() with no .int()/.min()/.max()/keyed z.record', () => {
    const src = readFileSync(
      fileURLToPath(new URL('../evaluatorRubric.ts', import.meta.url)),
      'utf8'
    );
    expect(src).toMatch(/z\.number\(\)/);
    // No integer/min/max constraints inside the VisualRubric block and no keyed record.
    const rubricBlock = src.slice(
      src.indexOf('export const VisualRubric'),
      src.indexOf('export type VisualRubricT')
    );
    expect(rubricBlock).not.toMatch(/\.int\(\)/);
    expect(rubricBlock).not.toMatch(/\.min\(/);
    expect(rubricBlock).not.toMatch(/\.max\(/);
    expect(rubricBlock).not.toMatch(/z\.record\(/);
  });
});

describe('evaluate.ts — ORCH-04 no direct AI import', () => {
  it('does not import ai / @ai-sdk directly', () => {
    const src = readFileSync(fileURLToPath(new URL('./evaluate.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
  });
});
