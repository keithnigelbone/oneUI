/**
 * campaignPlan.test.ts — CAMP-02 / D-06 schema behaviors.
 *
 *   1. CampaignPlanSchema.parse(validPlanFixture) succeeds — 3 directions, each
 *      carrying a leadRole ∈ the 9 appearance roles + a surfaceMood ∈ the 7
 *      surface tokens.
 *   2. Anthropic-safety: the compiled JSON schema string contains NONE of
 *      "minimum" / "maximum" / "propertyNames" (Zod-4 number bounds re-break
 *      Anthropic structured output; closed enums + describe prose instead).
 *   3. CreativeDirectionSchema rejects an invented role + an invented surface mood
 *      (DS-grounded closed enums — the planner cannot invent a visual system).
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  CampaignPlanSchema,
  CreativeDirectionSchema,
  APPEARANCE_ROLES,
  SURFACE_MOODS,
} from './campaignPlan';

const VALID_DIRECTION = {
  name: 'Bold Data Drop',
  concept: 'Lead with the headline data offer in a confident, high-contrast hero.',
  copyAngle: 'Punchy, benefit-first, urgent.',
  leadRole: 'primary' as const,
  surfaceMood: 'bold' as const,
  layoutMotif: 'centered-hero-stack',
};

const VALID_PLAN = {
  briefSummary: 'A 5-frame Instagram carousel for the new unlimited prepaid plan.',
  audience: 'Urban prepaid users, 18–24, heavy data consumers.',
  messageHierarchy: ['Unlimited data', 'No daily caps', 'Same low price', 'Sign up in-app'],
  directions: [
    VALID_DIRECTION,
    { ...VALID_DIRECTION, name: 'Calm Confidence', leadRole: 'neutral' as const, surfaceMood: 'subtle' as const },
    { ...VALID_DIRECTION, name: 'Sparkle Spotlight', leadRole: 'sparkle' as const, surfaceMood: 'elevated' as const },
  ],
  recommendedDirectionIndex: 0,
  recommendedFrameCount: 5,
};

describe('CampaignPlanSchema — DS-grounded structured plan (CAMP-02 / D-06)', () => {
  it('parses a valid 3-direction plan with closed role/surface enums', () => {
    const parsed = CampaignPlanSchema.parse(VALID_PLAN);
    expect(parsed.directions).toHaveLength(3);
    for (const dir of parsed.directions) {
      expect(APPEARANCE_ROLES).toContain(dir.leadRole);
      expect(SURFACE_MOODS).toContain(dir.surfaceMood);
    }
  });

  it('exposes the 9 Jio appearance roles and 7 surface tokens as closed enums', () => {
    expect(APPEARANCE_ROLES).toEqual([
      'primary',
      'secondary',
      'neutral',
      'sparkle',
      'positive',
      'negative',
      'warning',
      'informative',
      'brand-bg',
    ]);
    expect(SURFACE_MOODS).toEqual([
      'default',
      'ghost',
      'minimal',
      'subtle',
      'moderate',
      'bold',
      'elevated',
    ]);
  });
});

describe('CreativeDirectionSchema — closed enums reject invented values (D-06)', () => {
  it('rejects an invented leadRole', () => {
    expect(() =>
      CreativeDirectionSchema.parse({ ...VALID_DIRECTION, leadRole: 'turquoise' }),
    ).toThrow();
  });

  it('rejects an invented surfaceMood', () => {
    expect(() =>
      CreativeDirectionSchema.parse({ ...VALID_DIRECTION, surfaceMood: 'gradient-mesh' }),
    ).toThrow();
  });
});

describe('Anthropic-safety — no integer bounds / propertyNames in the JSON schema', () => {
  it('compiles to JSON schema with no "minimum" / "maximum" / "propertyNames"', () => {
    // Same conversion the structured-output stack uses (Zod 4 native).
    const json = JSON.stringify(z.toJSONSchema(CampaignPlanSchema));
    expect(json).not.toContain('"minimum"');
    expect(json).not.toContain('"maximum"');
    expect(json).not.toContain('"propertyNames"');
  });
});
