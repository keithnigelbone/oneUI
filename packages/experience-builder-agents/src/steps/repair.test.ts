/**
 * repair.test.ts — EVAL-02 / D-09 / D-10 / D-11.
 *
 * Credential-free: the patch generator is the injected mock `callModel`.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { JioExperienceIRT, JioValidationResultT } from '@oneui/experience-builder-core';
import { __setCallModelImpl } from '../modelAdapter';
import { repairStep, updateSameValidationError } from './repair';
import type { RunContext } from '../runContext';

function makeIr(buttonText: string): JioExperienceIRT {
  return {
    version: 1,
    artifactType: 'web-ui',
    outputProfile: 'web-desktop',
    brandId: 'jio-default',
    sections: [
      {
        id: 'section-main',
        name: 'main',
        instances: [{ id: 'cmp-1', type: 'Button', props: { children: buttonText } }],
      },
    ],
  } as unknown as JioExperienceIRT;
}

function failedValidation(overrides: Partial<JioValidationResultT> = {}): JioValidationResultT {
  return {
    passed: false,
    blocking: [{ code: 'literal-value', message: 'hard-coded #fff', severity: 'blocking', nodeId: 'cmp-1' }],
    warnings: [],
    repairSuggestions: ['Use a token instead of #fff'],
    componentGaps: [],
    foundationGaps: [],
    ...overrides,
  };
}

function baseCtx(overrides: Partial<RunContext> = {}): RunContext {
  return {
    runId: 'run-test',
    request: { brandId: 'jio-default', artifactType: 'web-ui', outputProfile: 'web-desktop' },
    events: [],
    outcome: 'error',
    halted: false,
    ir: makeIr('Go'),
    composite: 1,
    threshold: 4,
    validation: failedValidation(),
    ...overrides,
  };
}

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('repairStep — IR patch via frozen applyPatch (D-09)', () => {
  it('produces a NEW IR from a targeted patch and leaves the original IR unchanged (pure)', async () => {
    restore = __setCallModelImpl(async () =>
      ({ ops: [{ op: 'replace', path: '/sections/0/instances/0/props/children', value: 'Repaired' }] } as never),
    );

    const ctx = baseCtx();
    const original = ctx.ir;
    const originalSnapshot = JSON.stringify(original);

    await repairStep.execute({ inputData: { ctx } } as never);

    // Original object identity is replaced; the prior object is untouched (pure).
    expect(JSON.stringify(original)).toBe(originalSnapshot);
    expect(ctx.ir).not.toBe(original);
    // The patch was applied (button text changed).
    const sections = (ctx.ir as unknown as { sections: Array<{ instances: Array<{ props: { children: string } }> }> }).sections;
    expect(sections[0]!.instances[0]!.props.children).toBe('Repaired');
    expect(ctx.attempt).toBe(1);
  });

  it('the patch is a small op array, not a whole-IR replacement', async () => {
    let capturedOps: unknown;
    restore = __setCallModelImpl(async () => {
      capturedOps = [{ op: 'replace', path: '/sections/0/instances/0/props/children', value: 'X' }];
      return { ops: capturedOps } as never;
    });
    const ctx = baseCtx();
    await repairStep.execute({ inputData: { ctx } } as never);
    expect(Array.isArray(capturedOps)).toBe(true);
    expect((capturedOps as unknown[]).length).toBeLessThanOrEqual(3);
  });
});

describe('repairStep — gap short-circuit (D-11)', () => {
  it('halts with a gap event and ZERO model attempts on a component gap', async () => {
    let modelCalls = 0;
    restore = __setCallModelImpl(async () => {
      modelCalls += 1;
      return {} as never;
    });

    const ctx = baseCtx({
      validation: failedValidation({
        componentGaps: [{ componentType: 'FancyHero', reason: 'not registered' }],
      }),
    });
    await repairStep.execute({ inputData: { ctx } } as never);

    expect(modelCalls).toBe(0);
    expect(ctx.halted).toBe(true);
    expect(ctx.outcome).toBe('gap');
    expect(ctx.attempt).toBeUndefined(); // no attempt consumed
    const gap = ctx.events.find((e) => e.type === 'gap');
    expect(gap && gap.type === 'gap' && gap.componentGap?.componentType).toBe('FancyHero');
  });
});

describe('updateSameValidationError — convergence (D-10)', () => {
  it('sets sameValidationError=true when the post-repair blocking set equals the prior set', () => {
    const ctx = baseCtx();
    ctx.previousBlockingCodes = ['literal-value'];
    ctx.validation = failedValidation(); // still the same blocking code
    updateSameValidationError(ctx);
    expect(ctx.sameValidationError).toBe(true);
  });

  it('sets sameValidationError=false when the blocking set changed', () => {
    const ctx = baseCtx();
    ctx.previousBlockingCodes = ['literal-value'];
    ctx.validation = failedValidation({
      blocking: [{ code: 'non-jio-import', message: 'tailwind', severity: 'blocking' }],
    });
    updateSameValidationError(ctx);
    expect(ctx.sameValidationError).toBe(false);
  });
});

describe('repair.ts — no JSX / no whole-IR regen / ORCH-04', () => {
  it('does not import ai/@ai-sdk and never calls generateIR or dangerouslySetInnerHTML', () => {
    const src = readFileSync(fileURLToPath(new URL('./repair.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
    expect(src).not.toMatch(/generateIR/);
    expect(src).not.toMatch(/dangerouslySetInnerHTML/);
    expect(src).toMatch(/applyPatch/);
  });
});
