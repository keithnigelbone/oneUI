/**
 * plannerAgent.test.ts — GEN-04 behaviors, all credential-free (model mocked).
 *
 *   1. mocked model → schema-valid plan { sections, messageHierarchy,
 *      primaryCTA, screenCount } (Output.object / structuredOutput).
 *   2. the plan's section count is consistent with screenCount (no zero-section
 *      plan for a multi-screen artifact) — the structured contract, not free JSON.
 *   3. memoized: two identical-input runs call the underlying model EXACTLY ONCE
 *      (cache hit on the second).
 *   4. no `ai`/`@ai-sdk` import in this module (single-seam invariant).
 */

import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { __setCallModelImpl } from '../modelAdapter';
import { createModelMock } from '../testModelMock';
import {
  runPlanner,
  PlanSchema,
  type RunPlannerInput,
  runCampaignPlanner,
  type RunCampaignPlannerInput,
} from './plannerAgent';
import { createCache, clearCache } from '../cache';

const BASE_INPUT: RunPlannerInput = {
  prompt: 'A bold hero landing page for a new mobile plan',
  artifactType: 'web-ui',
  resolvedCoverage: {
    brandId: 'jio-default',
    outputProfile: 'web-desktop',
    appearanceRoles: ['primary', 'neutral'],
  },
};

const VALID_PLAN = {
  sections: [
    { id: 's1', name: 'hero', intent: 'Grab attention with the headline plan offer' },
    { id: 's2', name: 'features', intent: 'List the three key plan benefits' },
    { id: 's3', name: 'cta', intent: 'Drive sign-up' },
  ],
  messageHierarchy: ['New plan, more data', 'Three key benefits', 'Sign up today'],
  primaryCTA: 'Get the plan',
  screenCount: 1,
};

let restore: (() => void) | undefined;
beforeEach(() => {
  clearCache();
});
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('runPlanner — schema-valid structured plan (GEN-04 / D-02)', () => {
  it('returns a plan that conforms to PlanSchema (Output.object, not free JSON)', async () => {
    const mock = createModelMock([VALID_PLAN]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runPlanner({ ...BASE_INPUT, cache: createCache() });

    // Schema-valid (the structured-output contract).
    expect(PlanSchema.safeParse(plan).success).toBe(true);
    expect(plan.sections.length).toBeGreaterThan(0);
    expect(plan.primaryCTA).toBeTruthy();
    expect(plan.screenCount).toBeGreaterThanOrEqual(1);
  });

  it('keeps section count consistent with screenCount (no zero-section plan)', async () => {
    const multiScreen = {
      ...VALID_PLAN,
      screenCount: 3,
      sections: [
        { id: 's1', name: 'onboarding', intent: 'Welcome' },
        { id: 's2', name: 'plan-picker', intent: 'Choose a plan' },
        { id: 's3', name: 'confirm', intent: 'Confirm + pay' },
      ],
    };
    const mock = createModelMock([multiScreen]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runPlanner({
      ...BASE_INPUT,
      artifactType: 'app-screen',
      cache: createCache(),
    });

    expect(plan.screenCount).toBe(3);
    // A multi-screen artifact must have a non-empty section list.
    expect(plan.sections.length).toBeGreaterThanOrEqual(1);
  });

  it('pads incomplete web plans to the selected page recipe before generation', async () => {
    const mock = createModelMock([
      {
        ...VALID_PLAN,
        sections: [{ id: 's1', name: 'hero', intent: 'Lead with the offer' }],
      },
    ]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runPlanner({ ...BASE_INPUT, cache: createCache() });

    expect(plan.pagePatternId).toBe('campaign-landing-premium');
    expect(plan.sections.map((section) => section.patternId)).toEqual([
      'hero-centered',
      'feature-grid',
      'offer-banner',
      'faq',
    ]);
  });
});

describe('runPlanner — D-05 Response Caching memoizes identical inputs', () => {
  it('calls the underlying model exactly once across two identical-input runs', async () => {
    const mock = createModelMock([VALID_PLAN]);
    restore = __setCallModelImpl(mock.impl);

    const cache = createCache();
    const first = await runPlanner({ ...BASE_INPUT, cache });
    const second = await runPlanner({ ...BASE_INPUT, cache });

    expect(second).toEqual(first);
    // Cache HIT on the second identical-input call.
    expect(mock.callCount()).toBe(1);
  });

  it('re-calls the model for a different prompt (different cache key)', async () => {
    const mock = createModelMock([VALID_PLAN]);
    restore = __setCallModelImpl(mock.impl);

    const cache = createCache();
    await runPlanner({ ...BASE_INPUT, cache });
    await runPlanner({ ...BASE_INPUT, prompt: 'A different prompt entirely', cache });

    expect(mock.callCount()).toBe(2);
  });
});

describe('single model seam (Pitfall #1)', () => {
  it('plannerAgent.ts imports no `ai` / `@ai-sdk/*`', () => {
    const src = readFileSync(fileURLToPath(new URL('./plannerAgent.ts', import.meta.url)), 'utf8');
    expect(src).not.toMatch(/from\s+['"]ai['"]/);
    expect(src).not.toMatch(/from\s+['"]@ai-sdk\//);
  });
});

// ---------------------------------------------------------------------------
// runCampaignPlanner (CAMP-02 / D-06) — DS-grounded, clamped, single seam.
// ---------------------------------------------------------------------------

const CAMPAIGN_INPUT: RunCampaignPlannerInput = {
  prompt: 'A carousel launching the new unlimited prepaid plan',
  artifactType: 'instagram-carousel',
  audience: 'Urban prepaid users, 18–24',
  objective: 'Drive in-app sign-ups',
  channel: 'instagram',
  resolvedCoverage: {
    brandId: 'jio-default',
    outputProfile: 'ig-square',
    appearanceRoles: ['primary', 'neutral', 'sparkle'],
  },
};

const VALID_DIRECTION = {
  name: 'Bold Data Drop',
  concept: 'Lead with the unlimited data offer.',
  copyAngle: 'Punchy, benefit-first.',
  leadRole: 'primary' as const,
  surfaceMood: 'bold' as const,
  layoutMotif: 'centered-hero-stack',
};

const VALID_CAMPAIGN_PLAN = {
  briefSummary: 'A 5-frame carousel for the new unlimited prepaid plan.',
  audience: 'Urban prepaid users, 18–24',
  messageHierarchy: ['Unlimited data', 'No caps', 'Same price', 'Sign up'],
  directions: [
    VALID_DIRECTION,
    { ...VALID_DIRECTION, name: 'Calm Confidence', leadRole: 'neutral' as const, surfaceMood: 'subtle' as const },
    { ...VALID_DIRECTION, name: 'Sparkle Spotlight', leadRole: 'sparkle' as const, surfaceMood: 'elevated' as const },
  ],
  recommendedDirectionIndex: 0,
  recommendedFrameCount: 5,
};

describe('runCampaignPlanner — DS-grounded 3-direction plan (CAMP-02 / D-06)', () => {
  it('returns a schema-valid plan with exactly three directions', async () => {
    const mock = createModelMock([VALID_CAMPAIGN_PLAN]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runCampaignPlanner({ ...CAMPAIGN_INPUT, cache: createCache() });

    expect(plan.directions).toHaveLength(3);
    expect(plan.recommendedFrameCount).toBe(5);
    expect(plan.recommendedDirectionIndex).toBe(0);
    expect(mock.callCount()).toBe(1);
  });

  it('clamps out-of-range frame count + direction index from the model', async () => {
    // Model returns frameCount 99 (→ 10) and index -1 (→ 0).
    const mock = createModelMock([
      { ...VALID_CAMPAIGN_PLAN, recommendedFrameCount: 99, recommendedDirectionIndex: -1 },
    ]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runCampaignPlanner({ ...CAMPAIGN_INPUT, cache: createCache() });

    expect(plan.recommendedFrameCount).toBe(10);
    expect(plan.recommendedDirectionIndex).toBe(0);
  });

  it('rounds a fractional frame count to a whole number', async () => {
    const mock = createModelMock([{ ...VALID_CAMPAIGN_PLAN, recommendedFrameCount: 4.7 }]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runCampaignPlanner({ ...CAMPAIGN_INPUT, cache: createCache() });
    expect(plan.recommendedFrameCount).toBe(5);
  });

  it('trims a >3-direction list to exactly three', async () => {
    const mock = createModelMock([
      {
        ...VALID_CAMPAIGN_PLAN,
        directions: [...VALID_CAMPAIGN_PLAN.directions, { ...VALID_DIRECTION, name: 'Extra' }],
      },
    ]);
    restore = __setCallModelImpl(mock.impl);

    const plan = await runCampaignPlanner({ ...CAMPAIGN_INPUT, cache: createCache() });
    expect(plan.directions).toHaveLength(3);
  });

  it('throws when the model returns fewer than three directions', async () => {
    const mock = createModelMock([
      { ...VALID_CAMPAIGN_PLAN, directions: VALID_CAMPAIGN_PLAN.directions.slice(0, 2) },
    ]);
    restore = __setCallModelImpl(mock.impl);

    await expect(
      runCampaignPlanner({ ...CAMPAIGN_INPUT, cache: createCache() }),
    ).rejects.toThrow(/exactly 3 directions/i);
  });

  it('memoizes identical brief inputs (one model call)', async () => {
    const mock = createModelMock([VALID_CAMPAIGN_PLAN]);
    restore = __setCallModelImpl(mock.impl);

    const cache = createCache();
    const first = await runCampaignPlanner({ ...CAMPAIGN_INPUT, cache });
    const second = await runCampaignPlanner({ ...CAMPAIGN_INPUT, cache });

    expect(second).toEqual(first);
    expect(mock.callCount()).toBe(1);
  });
});
