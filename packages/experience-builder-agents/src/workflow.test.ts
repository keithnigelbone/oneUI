/**
 * workflow.test.ts
 *
 * ORCH-01 / ORCH-03 / ORCH-04:
 *   - The workflow runs the mock pipeline end-to-end emitting the expected
 *     ExperienceBuilderEvent sequence (ORCH-01/03).
 *   - A gap input branches to a gap event + produces NO artifact (ORCH-01).
 *   - Orchestration (sequencing/branching) lives in the Mastra workflow, never
 *     in an AI-SDK callback: structurally, workflow.ts imports no `ai`/`@ai-sdk`
 *     and the only AI-SDK touchpoint is modelAdapter.ts (ORCH-04).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ExperienceBuilderEvent } from '@oneui/experience-builder-core';
import type { PreviewExecutor, RenderResult } from '@oneui/experience-builder-preview';
import { runExperienceWorkflow, runExperienceWorkflowHitl, runVariants, experienceWorkflow, CampaignResumeSchema, type FoundationsLoader } from './workflow';
import type { BrandFoundations } from './foundationResolver';
import type { CampaignPlanPersister } from './runTypes';
import type { PlatformsFoundationConfig, PlatformEntry } from '@oneui/shared';
import { __setCallModelImpl, type CallModelArgs } from './modelAdapter';
import { clearCache } from './cache';

/** A credential-free mock PreviewExecutor: always renders, returns a fake PNG. */
function makeMockExecutor(rendered = true): PreviewExecutor {
  return {
    render: async (): Promise<RenderResult> => ({
      screenshots: [{ profile: 'desktop', png: Buffer.from('fake-png') }],
      previewState: { url: '?t=mock-token', expiresAt: Date.now() + 60_000 },
      rendered,
    }),
  };
}

/**
 * A preview executor that THROWS — models a Daytona/preview INFRA failure
 * (browser launch / sandbox provisioning / network). Generation + validation
 * have already succeeded by the time this runs; only the screenshot/preview
 * step fails. PREV-04 / RESEARCH Pitfall 5 / T-031-06.
 */
function makeThrowingExecutor(message = 'Daytona sandbox provisioning failed'): PreviewExecutor {
  return {
    render: async (): Promise<RenderResult> => {
      throw new Error(message);
    },
  };
}

const coveredRequest = {
  brandId: 'jio-default',
  artifactType: 'web-ui' as const,
  outputProfile: 'web-desktop' as const,
  // Inject the credential-free mock executor so the preview step renders without
  // a live browser / Daytona key. Harmless for gap tests (preview never runs).
  previewExecutor: makeMockExecutor(),
};

/**
 * The full assembler-last pipeline (Plan 02-03) makes FOUR kinds of model call:
 * the planner (plan), the Design adapter (design), the ToV adapter (copy), and
 * the IR Generator (generate-ir). Each uses a different Output.object schema. A
 * single fixed-queue mock can't satisfy all four, so this SCHEMA-AWARE mock
 * branches on the requested schema shape — fully deterministic, credential-free,
 * NO `ANTHROPIC_API_KEY`. The gap branches still short-circuit before any model
 * call (the foundation gate runs in the plan step / generateIR).
 */
function schemaAwareModelImpl<TSchema extends import('zod').z.ZodType>(
  args: CallModelArgs<TSchema>,
): Promise<import('zod').z.infer<TSchema>> {
  const shape = (args.schema as { shape?: Record<string, unknown> }).shape ?? {};
  let value: unknown;
  if ('directions' in shape && 'recommendedFrameCount' in shape) {
    // Campaign planner schema (CAMP-02). DS-grounded 3-direction plan.
    const dir = (leadRole: string, surfaceMood: string, name: string) => ({
      name,
      concept: 'A DS-grounded direction.',
      copyAngle: 'Punchy.',
      leadRole,
      surfaceMood,
      layoutMotif: 'centered-hero-stack',
    });
    value = {
      briefSummary: 'A carousel for the new unlimited plan.',
      audience: 'Urban prepaid users, 18–24',
      messageHierarchy: ['Unlimited data', 'No caps', 'Sign up'],
      directions: [
        dir('primary', 'bold', 'Bold Data Drop'),
        dir('neutral', 'subtle', 'Calm Confidence'),
        dir('sparkle', 'elevated', 'Sparkle Spotlight'),
      ],
      recommendedDirectionIndex: 0,
      recommendedFrameCount: 5,
    };
  } else if ('sections' in shape && 'screenCount' in shape) {
    // Planner schema.
    value = {
      sections: [{ id: 's1', name: 'main', intent: 'The main section' }],
      messageHierarchy: ['Primary message'],
      primaryCTA: 'Get started',
      screenCount: 1,
    };
  } else if ('surfaceMode' in shape && 'components' in shape) {
    // Design adapter schema.
    value = { surfaceMode: 'default', components: ['Button'] };
  } else if ('headline' in shape && 'body' in shape) {
    // ToV adapter schema.
    value = { headline: 'Headline copy', body: 'Body copy.', cta: 'Go' };
  } else if ('hierarchy' in shape && 'brandFit' in shape) {
    // VisualRubric (vision judge) schema — high scores so the artifact passes.
    value = { hierarchy: 5, spacing: 5, density: 5, brandFit: 5, notes: 'clean' };
  } else if ('ops' in shape) {
    // RepairPatch schema — a minimal no-op-ish replace.
    value = { ops: [{ op: 'replace', path: '/brandId', value: 'jio-default' }] };
  } else {
    // IR Generator section-fill schema.
    value = { instances: [{ id: 'cmp-1', type: 'Button', props: {}, slots: {} }] };
  }
  return Promise.resolve(value as import('zod').z.infer<TSchema>);
}

let restoreModel: (() => void) | undefined;
beforeEach(() => {
  clearCache();
  restoreModel = __setCallModelImpl(schemaAwareModelImpl);
});
afterEach(() => {
  restoreModel?.();
  restoreModel = undefined;
});

describe('experienceWorkflow', () => {
  it('exposes a committed Mastra workflow (createWorkflow)', () => {
    expect(experienceWorkflow).toBeDefined();
    // The committed workflow carries its declared id.
    expect((experienceWorkflow as { id?: string }).id).toBe('experience-generation');
  });
});

describe('runExperienceWorkflow — happy path (ORCH-01/03)', () => {
  it('emits the full event sequence ending in an artifact run-completed', async () => {
    const result = await runExperienceWorkflow(coveredRequest);

    expect(result.outcome).toBe('artifact');
    expect(result.ir).toBeDefined();
    expect(result.validation?.passed).toBe(true);

    // Every emitted event conforms to the frozen ExperienceBuilderEvent union.
    for (const event of result.events) {
      expect(ExperienceBuilderEvent.safeParse(event).success).toBe(true);
    }

    const types = result.events.map((e) => e.type);
    // Lifecycle bookends.
    expect(types[0]).toBe('run-started');
    expect(types[types.length - 1]).toBe('run-completed');
    // Per-step events for the full sequence (ORCH-01 step order).
    const steps = result.events
      .filter((e): e is Extract<typeof e, { type: 'step' }> => e.type === 'step')
      .map((e) => e.step);
    expect(steps).toEqual(
      expect.arrayContaining([
        'intent',
        'resolve-foundation',
        'retrieve',
        'plan',
        'storybook-docs',
        'design',
        'copy',
        'generate-ir',
        'compile',
        'validate',
      ]),
    );
    // Assembler-last (D-01): plan/design/copy each emit started+completed, and
    // ONLY generate-ir produces the `ir-produced` event — the advisors advise,
    // the IR Generator commits.
    for (const advisor of ['plan', 'design', 'copy'] as const) {
      const advisorEvents = result.events.filter(
        (e): e is Extract<typeof e, { type: 'step' }> => e.type === 'step' && e.step === advisor,
      );
      const statuses = advisorEvents.map((e) => e.status);
      expect(statuses).toContain('started');
      expect(statuses).toContain('completed');
    }
    // Exactly one ir-produced event, fired by generate-ir (no advisor emits IR).
    expect(types.filter((t) => t === 'ir-produced')).toHaveLength(1);
    // The IR + validation events fired (ORCH-03).
    expect(types).toContain('ir-produced');
    expect(types).toContain('validation');
    // GEN-06: the compile step produced the canonical bundle string.
    expect(result.bundle).toBeDefined();
    expect(result.bundle).toMatch(/from '@oneui\/ui';/);
    // No gap on the happy path.
    expect(types).not.toContain('gap');

    // Terminal event outcome is 'artifact'.
    const completed = result.events.find((e) => e.type === 'run-completed');
    expect(completed && completed.type === 'run-completed' && completed.outcome).toBe('artifact');
  });
});

describe('runExperienceWorkflow — strict Storybook recipes', () => {
  it('generates WebHeader navigation from local Storybook source when MCP is offline', async () => {
    const result = await runExperienceWorkflow({
      ...coveredRequest,
      prompt: 'Create a web page with WebHeader navigation using the exact Storybook composition.',
      storybookMcpUrl: 'http://127.0.0.1:1/mcp',
    });

    expect(result.outcome).toBe('artifact');
    expect(result.ir).toBeDefined();
    expect(result.compositionSpec).toBeDefined();
    expect(result.storybookMcpStatus).toBe('unavailable');
    expect(result.storybookDocsUsed).toEqual(
      expect.arrayContaining(['packages/ui/src/components/WebHeader/WebHeader.stories.tsx#Default'])
    );
    expect(result.agentTrace?.storybook?.status).toBe('unavailable');
    expect(result.validation?.blocking.map((violation) => violation.code)).not.toContain(
      'storybook-docs-unavailable'
    );

    const types = result.events.map((event) => event.type);
    expect(types).not.toContain('gap');
    expect(types).toContain('ir-produced');
  });
});

describe('runExperienceWorkflow — gap branch (ORCH-01)', () => {
  it('branches to a gap event and produces NO artifact for an uncovered profile', async () => {
    const result = await runExperienceWorkflow({
      brandId: 'jio-default',
      artifactType: 'social-post',
      outputProfile: 'ig-square',
    });

    expect(result.outcome).toBe('gap');
    expect(result.ir).toBeUndefined();

    const types = result.events.map((e) => e.type);
    expect(types).toContain('gap');
    // The gap short-circuit means validation never ran (no artifact produced).
    expect(types).not.toContain('ir-produced');
    expect(types).not.toContain('validation');

    const gap = result.events.find((e) => e.type === 'gap');
    expect(gap && gap.type === 'gap' && gap.foundationGap).toBeDefined();

    const completed = result.events.find((e) => e.type === 'run-completed');
    expect(completed && completed.type === 'run-completed' && completed.outcome).toBe('gap');
  });

  it('branches to a gap event for an unregistered component request', async () => {
    const result = await runExperienceWorkflow({
      ...coveredRequest,
      requestedComponents: ['FancyHero'],
    });
    expect(result.outcome).toBe('gap');
    expect(result.ir).toBeUndefined();
    const gap = result.events.find((e) => e.type === 'gap');
    expect(gap && gap.type === 'gap' && gap.componentGap?.componentType).toBe('FancyHero');
  });
});

/**
 * A configured-brand foundations fixture (reuses the foundationResolver.test.ts
 * `CONFIGURED_BRAND` shape): a single custom primary scale + an appearance
 * config anchoring `primary`. This is the shape a real loader returns from the
 * public `getBrandOverviewData`-derived record.
 */
const CONFIGURED_BRAND: BrandFoundations = {
  colorConfig: {
    brandScales: [{ name: 'primary', source: 'custom', baseColor: '#1A73E8' }],
  },
  presetSelection: null,
  appearanceConfig: {
    accentCount: 1,
    accents: [{ role: 'primary', scaleName: 'primary', baseStep: 1700 }],
  },
};

describe('runExperienceWorkflow — foundationsLoader injection (FND-01/FND-04)', () => {
  it('calls the injected loader and resolves a real ThemeConfig end-to-end (outcome === artifact)', async () => {
    let called = false;
    const mockLoader: FoundationsLoader = async (input) => {
      called = true;
      expect(input.brandId).toBe(coveredRequest.brandId);
      return CONFIGURED_BRAND;
    };

    const result = await runExperienceWorkflow({
      ...coveredRequest,
      foundationsLoader: mockLoader,
    });

    expect(called).toBe(true);
    expect(result.outcome).toBe('artifact');
    expect(result.ir).toBeDefined();
    // A real-shaped loader result reached the resolver — no spurious gap.
    expect(result.events.map((e) => e.type)).not.toContain('gap');
  });

  it('still completes via engine system defaults when the loader returns null (D-08)', async () => {
    let called = false;
    const nullLoader: FoundationsLoader = async () => {
      called = true;
      return null;
    };

    const result = await runExperienceWorkflow({
      ...coveredRequest,
      foundationsLoader: nullLoader,
    });

    expect(called).toBe(true);
    // A null loader is NOT a foundation gap — the engine system defaults resolve.
    expect(result.outcome).toBe('artifact');
    expect(result.events.map((e) => e.type)).not.toContain('gap');
  });

  it('degrades to system defaults when the loader THROWS — never aborts the run (CR-01 / D-08)', async () => {
    const throwingLoader: FoundationsLoader = async () => {
      throw new Error('Convex network blip / malformed id');
    };

    const result = await runExperienceWorkflow({
      ...coveredRequest,
      foundationsLoader: throwingLoader,
    });

    // A thrown loader error must NOT produce outcome 'error'. It degrades to the
    // engine system defaults exactly like a null result (the D-08 guarantee).
    expect(result.outcome).toBe('artifact');
    expect(result.events.map((e) => e.type)).not.toContain('gap');
    const completed = result.events.find((e) => e.type === 'run-completed');
    expect(completed && completed.type === 'run-completed' && completed.outcome).toBe('artifact');
  });

  it('forwards subBrandConfigId to the loader when the request carries one', async () => {
    let receivedSubBrandId: string | undefined;
    const mockLoader: FoundationsLoader = async (input) => {
      receivedSubBrandId = input.subBrandConfigId;
      return CONFIGURED_BRAND;
    };

    const result = await runExperienceWorkflow({
      ...coveredRequest,
      subBrandConfigId: 'sub-brand-42',
      foundationsLoader: mockLoader,
    });

    expect(receivedSubBrandId).toBe('sub-brand-42');
    expect(result.outcome).toBe('artifact');
  });

  it('does not require a loader — behaves as before when none is injected (no regression)', async () => {
    const result = await runExperienceWorkflow(coveredRequest);
    expect(result.outcome).toBe('artifact');
    expect(result.ir).toBeDefined();
  });
});

describe('runExperienceWorkflow — preview→evaluate→version-freeze (Plan 04 sequence)', () => {
  it('runs preview, evaluate, and version-freeze (no repair needed) on a passing artifact', async () => {
    const result = await runExperienceWorkflow(coveredRequest);
    expect(result.outcome).toBe('artifact');

    const steps = result.events
      .filter((e): e is Extract<typeof e, { type: 'step' }> => e.type === 'step')
      .map((e) => e.step);
    expect(steps).toEqual(
      expect.arrayContaining(['validate', 'preview', 'evaluate', 'version-freeze']),
    );
    // preview comes after validate; version-freeze is last among the new steps.
    expect(steps.indexOf('preview')).toBeGreaterThan(steps.indexOf('validate'));
    expect(steps.indexOf('evaluate')).toBeGreaterThan(steps.indexOf('preview'));
    expect(steps.indexOf('version-freeze')).toBeGreaterThan(steps.indexOf('evaluate'));

    // The evaluation + previewState surface on the result.
    expect(result.evaluation?.composite).toBeGreaterThan(0);
    expect(result.previewState?.url).toBeDefined();
    // No repair needed on a clean pass.
    expect(steps).not.toContain('repair');
  });

  it('VAL-06: a rendered:false executor is a failing objective signal → routes to repair', async () => {
    const result = await runExperienceWorkflow({
      ...coveredRequest,
      previewExecutor: makeMockExecutor(false), // render failed
    });
    const steps = result.events
      .filter((e): e is Extract<typeof e, { type: 'step' }> => e.type === 'step')
      .map((e) => e.step);
    // rendered:false fails the objective track, so repair runs at least once.
    expect(steps).toContain('repair');
  });
});

describe('runExperienceWorkflow — preview-error vs gap polarity (PREV-04 / RESEARCH Pitfall 5 / T-031-06)', () => {
  it('Test A: a preview-executor THROW (with valid IR + passing validation) surfaces a preview-error, NOT a gap', async () => {
    const result = await runExperienceWorkflow({
      ...coveredRequest,
      previewExecutor: makeThrowingExecutor('Daytona sandbox provisioning failed'),
    });

    // Generation succeeded — the IR is present and validation passed.
    expect(result.ir).toBeDefined();
    expect(result.validation?.passed).toBe(true);

    // The infra failure is recorded distinctly so the run is diagnosable (T-031-06).
    expect(result.previewError).toBeDefined();
    expect(result.previewError?.message).toContain('Daytona sandbox provisioning failed');

    // Crucially: the run does NOT masquerade as a DS gap ("generation refused").
    expect(result.outcome).not.toBe('gap');

    // The preview step emitted a 'failed' status (frozen StepEvent union, not
    // swallowed), and NO gap event fired.
    const types = result.events.map((e) => e.type);
    expect(types).not.toContain('gap');
    const previewSteps = result.events.filter(
      (e): e is Extract<typeof e, { type: 'step' }> => e.type === 'step' && e.step === 'preview',
    );
    expect(previewSteps.map((e) => e.status)).toContain('failed');
    // Every event still conforms to the frozen ExperienceBuilderEvent union.
    for (const event of result.events) {
      expect(ExperienceBuilderEvent.safeParse(event).success).toBe(true);
    }

    // The terminal wire event is NOT 'gap'.
    const completed = result.events.find((e) => e.type === 'run-completed');
    expect(completed && completed.type === 'run-completed' && completed.outcome).not.toBe('gap');
  });

  it('Test B: a genuine foundation gap still finalizes outcome "gap" with NO previewError flag', async () => {
    const result = await runExperienceWorkflow({
      brandId: 'jio-default',
      artifactType: 'social-post',
      outputProfile: 'ig-square',
    });

    // The gap short-circuit runs before preview — no IR, outcome 'gap'.
    expect(result.outcome).toBe('gap');
    expect(result.ir).toBeUndefined();
    // The fix must NOT blur a real gap into a preview-error.
    expect(result.previewError).toBeUndefined();

    const types = result.events.map((e) => e.type);
    expect(types).toContain('gap');
    const completed = result.events.find((e) => e.type === 'run-completed');
    expect(completed && completed.type === 'run-completed' && completed.outcome).toBe('gap');
  });
});

describe('runExperienceWorkflow — bounded repair loop (ORCH-02/EVAL-03/D-10/D-11)', () => {
  /** A model mock that makes validation keep failing so repair runs to the cap. */
  function failingModelImpl<TSchema extends import('zod').z.ZodType>(
    args: CallModelArgs<TSchema>,
  ): Promise<import('zod').z.infer<TSchema>> {
    const shape = (args.schema as { shape?: Record<string, unknown> }).shape ?? {};
    let value: unknown;
    if ('sections' in shape && 'screenCount' in shape) {
      value = { sections: [{ id: 's1', name: 'main', intent: 'x' }], messageHierarchy: ['m'], primaryCTA: 'go', screenCount: 1 };
    } else if ('surfaceMode' in shape && 'components' in shape) {
      value = { surfaceMode: 'default', components: ['Button'] };
    } else if ('headline' in shape && 'body' in shape) {
      value = { headline: 'h', body: 'b', cta: 'go' };
    } else if ('hierarchy' in shape && 'brandFit' in shape) {
      // LOW scores so the composite never clears the threshold (forces repair).
      value = { hierarchy: 1, spacing: 1, density: 1, brandFit: 1, notes: 'bad' };
    } else if ('ops' in shape) {
      // A repair that does NOT fix validation — drives cap/convergence.
      value = { ops: [{ op: 'replace', path: '/brandId', value: 'jio-default' }] };
    } else {
      value = { instances: [{ id: 'cmp-1', type: 'Button', props: {}, slots: {} }] };
    }
    return Promise.resolve(value as import('zod').z.infer<TSchema>);
  }

  it('stops after at most 3 repair attempts (cap) on a perpetually low-scoring artifact', async () => {
    const restore = __setCallModelImpl(failingModelImpl);
    try {
      const result = await runExperienceWorkflow(coveredRequest);
      const repairs = result.events.filter(
        (e) => e.type === 'step' && e.step === 'repair' && e.status === 'started',
      ).length;
      // The same validation error converges immediately (sameValidationError),
      // so repair runs at least once but never exceeds the hard cap of 3 (D-11).
      expect(repairs).toBeGreaterThanOrEqual(1);
      expect(repairs).toBeLessThanOrEqual(3);
    } finally {
      restore();
    }
  });

  it('a component gap during repair short-circuits immediately (halted, D-11)', async () => {
    // Request an unregistered component so generate-ir emits a component gap and
    // the run halts before ever reaching the repair loop (zero repair attempts).
    const result = await runExperienceWorkflow({
      ...coveredRequest,
      requestedComponents: ['FancyHero'],
    });
    expect(result.outcome).toBe('gap');
    const repairs = result.events.filter((e) => e.type === 'step' && e.step === 'repair').length;
    expect(repairs).toBe(0);
  });
});

describe('runVariants — best-of-N (GEN-07/D-08)', () => {
  it('runs N sequential variants, ranks by composite, and groups them under one id', async () => {
    const group = await runVariants(coveredRequest, 3);
    expect(group.ranked).toHaveLength(3);
    // All variants share the group id.
    for (const v of group.ranked) {
      expect(v.variantGroupId).toBe(group.variantGroupId);
    }
    // Ranked best→worst by composite.
    for (let i = 1; i < group.ranked.length; i++) {
      expect(group.ranked[i - 1]!.composite).toBeGreaterThanOrEqual(group.ranked[i]!.composite);
    }
    // The best is rank 0.
    expect(group.best.rank).toBe(0);
    expect(group.best).toBe(group.ranked[0]);
  });
});

describe('HITL suspend/resume at non-convergence (ORCH-02)', () => {
  /** A model mock whose vision judge always scores LOW so the loop never passes. */
  function lowScoringModelImpl<TSchema extends import('zod').z.ZodType>(
    args: CallModelArgs<TSchema>,
  ): Promise<import('zod').z.infer<TSchema>> {
    const shape = (args.schema as { shape?: Record<string, unknown> }).shape ?? {};
    let value: unknown;
    if ('sections' in shape && 'screenCount' in shape) {
      value = { sections: [{ id: 's1', name: 'main', intent: 'x' }], messageHierarchy: ['m'], primaryCTA: 'go', screenCount: 1 };
    } else if ('surfaceMode' in shape && 'components' in shape) {
      value = { surfaceMode: 'default', components: ['Button'] };
    } else if ('headline' in shape && 'body' in shape) {
      value = { headline: 'h', body: 'b', cta: 'go' };
    } else if ('hierarchy' in shape && 'brandFit' in shape) {
      value = { hierarchy: 1, spacing: 1, density: 1, brandFit: 1, notes: 'bad' };
    } else if ('ops' in shape) {
      value = { ops: [{ op: 'replace', path: '/brandId', value: 'jio-default' }] };
    } else {
      value = { instances: [{ id: 'cmp-1', type: 'Button', props: {}, slots: {} }] };
    }
    return Promise.resolve(value as import('zod').z.infer<TSchema>);
  }

  function isSuspended(out: unknown): out is { result: import('./workflow').RunExperienceResult; resume: (d: import('./workflow').ResumeDecisionT) => Promise<unknown> } {
    return typeof (out as { resume?: unknown }).resume === 'function';
  }

  it('suspends a non-converging run when hitl:true and surfaces the payload', async () => {
    const restore = __setCallModelImpl(lowScoringModelImpl);
    try {
      const out = await runExperienceWorkflowHitl(coveredRequest);
      expect(isSuspended(out)).toBe(true);
      if (!isSuspended(out)) return;
      expect(out.result.outcome).toBe('suspended');
      expect(out.result.suspendPayload?.reason).toBe('non-converging-repair');
      expect(out.result.suspendPayload?.composite).toBeLessThan(4);
      expect(out.result.suspendPayload?.ir).toBeDefined();
    } finally {
      restore();
    }
  });

  it('resume "accept" proceeds to version-freeze (artifact)', async () => {
    const restore = __setCallModelImpl(lowScoringModelImpl);
    try {
      const out = await runExperienceWorkflowHitl(coveredRequest);
      if (!isSuspended(out)) throw new Error('expected suspend');
      const next = (await out.resume({ decision: 'accept' })) as import('./workflow').RunExperienceResult;
      expect(next.outcome).toBe('artifact');
      const steps = next.events.filter((e) => e.type === 'step').map((e) => (e as { step: string }).step);
      expect(steps).toContain('version-freeze');
    } finally {
      restore();
    }
  });

  it('resume "abandon" emits a gap', async () => {
    const restore = __setCallModelImpl(lowScoringModelImpl);
    try {
      const out = await runExperienceWorkflowHitl(coveredRequest);
      if (!isSuspended(out)) throw new Error('expected suspend');
      const next = (await out.resume({ decision: 'abandon' })) as import('./workflow').RunExperienceResult;
      expect(next.outcome).toBe('gap');
      expect(next.events.some((e) => e.type === 'gap')).toBe(true);
    } finally {
      restore();
    }
  });

  it('resume "repair-again" runs one more bounded attempt then re-checkpoints', async () => {
    const restore = __setCallModelImpl(lowScoringModelImpl);
    try {
      const out = await runExperienceWorkflowHitl(coveredRequest);
      if (!isSuspended(out)) throw new Error('expected suspend');
      const next = await out.resume({ decision: 'repair-again' });
      // Still non-converging → suspends again (or terminates if cap hit).
      const terminalOutcome = isSuspended(next) ? next.result.outcome : next.outcome;
      expect(['suspended', 'gap', 'artifact']).toContain(terminalOutcome);
    } finally {
      restore();
    }
  });

  it('default-off: hitl:false (plain run) never suspends — unchanged from Task 3', async () => {
    const restore = __setCallModelImpl(lowScoringModelImpl);
    try {
      const result = await runExperienceWorkflow(coveredRequest); // hitl unset
      // No suspend: it finalizes deterministically (gap/artifact), never 'suspended'.
      expect(result.outcome).not.toBe('suspended');
      expect(result.suspendPayload).toBeUndefined();
    } finally {
      restore();
    }
  });

  it('resume decision branching is workflow-owned (ORCH-04): no ai/@ai-sdk import', () => {
    const src = readFileSync(fileURLToPath(new URL('./workflow.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
    // The suspend/resume wiring + the hitl gate live in workflow.ts.
    expect(src).toMatch(/suspend\(/);
    expect(src).toMatch(/resumeData/);
    expect(src).toMatch(/resumeSchema/);
    expect(src).toMatch(/hitl/);
  });
});

describe('ORCH-04 — orchestration is NOT in an AI-SDK callback', () => {
  it('workflow.ts imports no `ai` / `@ai-sdk/*` — the AI SDK is only touched by modelAdapter.ts', () => {
    const workflowSrc = readFileSync(
      fileURLToPath(new URL('./workflow.ts', import.meta.url)),
      'utf8',
    );
    // No direct AI-SDK import in the orchestration module.
    expect(workflowSrc).not.toMatch(/from\s+['"]ai['"]/);
    expect(workflowSrc).not.toMatch(/from\s+['"]@ai-sdk\//);
    // Orchestration uses Mastra's workflow engine.
    expect(workflowSrc).toMatch(/from\s+['"]@mastra\/core\/workflows['"]/);
    expect(workflowSrc).toMatch(/createWorkflow/);
  });

  it('modelAdapter.ts is the sole AI-SDK touchpoint and carries no sequencing/branching', () => {
    const adapterSrc = readFileSync(
      fileURLToPath(new URL('./modelAdapter.ts', import.meta.url)),
      'utf8',
    );
    // It is the AI-SDK boundary (imports @mastra/ai-sdk).
    expect(adapterSrc).toMatch(/from\s+['"]@mastra\/ai-sdk['"]/);
    // It pins the v6 transport version.
    expect(adapterSrc).toMatch(/['"]v6['"]/);
    // It contains no workflow/step sequencing primitives (no orchestration).
    expect(adapterSrc).not.toMatch(/createWorkflow|createStep|\.then\(|\.branch\(|\.dountil\(/);
  });
});

// ---------------------------------------------------------------------------
// Campaign branch (CAMP-01 / CAMP-02 / D-05) — plan → suspend → resume
// ---------------------------------------------------------------------------

/** A `social` platform that SEEDS the ig-square canvas → resolvable per-brand. */
const SOCIAL_PLATFORM: PlatformEntry = {
  id: 'social',
  label: 'Social',
  description: 'Instagram / social canvases',
  isEnabled: true,
  category: 'digital-fixed',
  viewingDistance: 400,
  ppi: 72,
  pixelDensity: 1,
  calculatedBaseSize: 16,
  breakpoints: [
    {
      id: 'ig-square',
      label: 'IG Square',
      viewportWidth: 1080,
      viewportHeight: 1080,
      units: 'px',
      isActive: true,
    },
  ],
  viewportMin: 320,
  viewportMax: 1080,
  fluidScaling: false,
  densityConfigs: [
    { density: 'default', mobile: { baseSize: 16, scaleFactor: 1.2 }, desktop: { baseSize: 16, scaleFactor: 1.2 } },
  ],
};

const PLATFORMS_WITH_SOCIAL: PlatformsFoundationConfig = {
  platforms: [SOCIAL_PLATFORM],
  defaultPlatform: 'social',
  defaultDensity: 'default',
};

const campaignCovered = {
  brandId: 'jio-default',
  artifactType: 'instagram-carousel' as const,
  outputProfile: 'ig-carousel' as const,
  prompt: 'Launch the new unlimited prepaid plan',
  audience: 'Urban prepaid users, 18–24',
  objective: 'Drive in-app sign-ups',
  channel: 'instagram',
  brandFoundations: CONFIGURED_BRAND,
  brandPlatforms: {
    ...PLATFORMS_WITH_SOCIAL,
    platforms: [
      {
        ...SOCIAL_PLATFORM,
        breakpoints: [
          { ...SOCIAL_PLATFORM.breakpoints[0], id: 'ig-carousel' },
        ],
      },
    ],
  } as PlatformsFoundationConfig,
};

describe('runExperienceWorkflow — campaign branch (CAMP-01/CAMP-02)', () => {
  it('a covered social/carousel run takes the campaign branch and suspends with the plan', async () => {
    const result = await runExperienceWorkflow(campaignCovered);

    expect(result.outcome).toBe('suspended');
    expect(result.suspendPayload?.reason).toBe('campaign-plan');
    const plan = result.suspendPayload?.plan;
    expect(plan).toBeDefined();
    expect(plan?.directions).toHaveLength(3);
    expect(plan?.recommendedFrameCount).toBe(5);
    expect(plan?.briefSummary).toBeTruthy();
    expect(plan?.audience).toBeTruthy();
    expect(plan?.messageHierarchy.length).toBeGreaterThan(0);
    // The campaign branch never runs the web pipeline.
    const types = result.events.map((e) => e.type);
    expect(types).not.toContain('ir-produced');
    expect(types).not.toContain('validation');
  });

  it('a web run does NOT take the campaign branch (web pipeline unchanged)', async () => {
    const result = await runExperienceWorkflow(coveredRequest);
    expect(result.outcome).toBe('artifact');
    // No campaign-plan suspend on the web path.
    expect(result.suspendPayload).toBeUndefined();
    expect(result.events.map((e) => e.type)).toContain('ir-produced');
  });

  it('a campaign run on a foundation MISS short-circuits to a gap BEFORE the planner', async () => {
    // No brandPlatforms → the ig canvas is unseeded → resolver gaps (D-02).
    const result = await runExperienceWorkflow({
      brandId: 'jio-default',
      artifactType: 'social-post',
      outputProfile: 'ig-square',
      prompt: 'A social post',
    });

    expect(result.outcome).toBe('gap');
    const types = result.events.map((e) => e.type);
    expect(types).toContain('gap');
    // The planner never ran — no 'plan' completed step before the gap.
    expect(result.suspendPayload).toBeUndefined();
  });

  it('persists the plan to Convex BEFORE suspend (T-04-14)', async () => {
    const persisted: Array<{ runId: string; campaignPlan: unknown }> = [];
    const persistCampaignPlan: CampaignPlanPersister = async ({ runId, campaignPlan }) => {
      persisted.push({ runId, campaignPlan });
    };

    const result = await runExperienceWorkflow({ ...campaignCovered, persistCampaignPlan });

    expect(result.outcome).toBe('suspended');
    // The persister was called exactly once, keyed by the run id, with the plan.
    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.runId).toBe(result.runId);
    expect((persisted[0]?.campaignPlan as { directions: unknown[] }).directions).toHaveLength(3);
  });

  it('re-entering with a campaignSelection applies the clamped selection past the checkpoint', async () => {
    // Out-of-range selection is clamped (index -1 → 0, frameCount 99 → 10).
    const result = await runExperienceWorkflow({
      ...campaignCovered,
      campaignSelection: { directionIndex: -1, frameCount: 99 },
    });

    // The run proceeds past the checkpoint (no re-suspend); selection captured.
    expect(result.outcome).not.toBe('suspended');
    expect(result.suspendPayload).toBeUndefined();
  });

  it('CampaignResumeSchema is Anthropic-safe (plain numbers) and strict', () => {
    const json = JSON.stringify(z.toJSONSchema(CampaignResumeSchema));
    expect(json).not.toContain('"minimum"');
    expect(json).not.toContain('"maximum"');
    // Strict body rejects unknown keys (T-04-04).
    expect(
      CampaignResumeSchema.safeParse({ directionIndex: 1, frameCount: 4, evil: true }).success,
    ).toBe(false);
    expect(CampaignResumeSchema.safeParse({ directionIndex: 1, frameCount: 4 }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Carousel generation after resume (CAMP-03/CAMP-04/CAMP-05 — Plan 03)
// ---------------------------------------------------------------------------

describe('runExperienceWorkflow — carousel after resume (CAMP-04)', () => {
  it('re-entering with a campaignSelection drives N ordered frames (shared variantGroupId + sequential orderIndex)', async () => {
    const result = await runExperienceWorkflow({
      ...campaignCovered,
      campaignSelection: { directionIndex: 0, frameCount: 4 },
    });

    // The run proceeds past the checkpoint and produces ordered frames.
    expect(result.outcome).not.toBe('suspended');
    expect(result.carouselFrames).toBeDefined();
    expect(result.carouselFrames).toHaveLength(4);
    // All frames share one group id (D-07).
    const groupIds = new Set(result.carouselFrames!.map((f) => f.variantGroupId));
    expect(groupIds.size).toBe(1);
    // Sequential 0-based order index.
    expect(result.carouselFrames!.map((f) => f.orderIndex)).toEqual([0, 1, 2, 3]);
  });

  it('a foundation gap (unseeded canvas) yields ZERO carousel frames (CAMP-05)', async () => {
    const result = await runExperienceWorkflow({
      brandId: 'jio-default',
      artifactType: 'social-post',
      outputProfile: 'ig-square',
      prompt: 'A social post',
      // No brandPlatforms → the ig canvas is unseeded → resolver gaps before frames.
      campaignSelection: { directionIndex: 0, frameCount: 5 },
    });

    expect(result.outcome).toBe('gap');
    // No frames produced — never fabricate a canvas.
    expect(result.carouselFrames ?? []).toHaveLength(0);
  });

  it('each frame requests its own ToV copy and runs the per-frame pipeline (CAMP-03)', async () => {
    const result = await runExperienceWorkflow({
      ...campaignCovered,
      campaignSelection: { directionIndex: 0, frameCount: 3 },
    });

    expect(result.carouselFrames).toHaveLength(3);
    // Each frame carries per-frame copy (headline/body) from the ToV seam.
    for (const frame of result.carouselFrames!) {
      expect(frame.copy.headline).toBeTruthy();
      expect(frame.copy.body).toBeTruthy();
    }
  });
});
