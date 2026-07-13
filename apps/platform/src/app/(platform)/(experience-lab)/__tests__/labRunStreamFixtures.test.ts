/**
 * labRunStreamFixtures.test.ts — Wave 0 self-test for the NDJSON fixture factory.
 *
 * Proves the reusable `makeMockRunFetch` fixture emits all four run shapes in a
 * form the production `readNdjson` decoder consumes, and — critically — that the
 * two pitfall branches are distinguishable:
 *
 *   - `campaign-suspend` → result `outcome:'gap'` WITH a `campaignPlan` (a
 *     SUSPEND, CHAT-06).
 *   - `gap-run`          → result `outcome:'gap'` with NO `campaignPlan` (a REAL
 *     refusal, CHAT-09).
 *
 * No `ai`/`@ai-sdk` import — the Lab single-`ai` gate applies to test files too.
 */

import { describe, it, expect } from 'vitest';
import { CampaignPlanSchema } from '@oneui/experience-builder-core';
import { isResultFrame, isEventFrame } from '../_canvas/runStream';
import {
  makeMockRunFetch,
  readFixtureFrames,
  fixtureResultFrame,
  type RunFetchScenario,
} from './labRunStreamFixtures';

const SCENARIOS: RunFetchScenario[] = ['web-run', 'gap-run', 'campaign-suspend', 'resume-carousel'];

describe('labRunStreamFixtures — reusable NDJSON run-stream factory (Wave 0)', () => {
  it('every scenario streams a NDJSON body consumable as ordered frames ending in a result', async () => {
    for (const scenario of SCENARIOS) {
      const res = await makeMockRunFetch(scenario)('/api/experience-lab/run', { method: 'POST' });
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(ReadableStream);

      const frames = await readFixtureFrames(res);
      expect(frames.length).toBeGreaterThan(0);
      expect(frames.filter(isEventFrame).length).toBeGreaterThan(0);
      const results = frames.filter(isResultFrame);
      expect(results).toHaveLength(1);
      expect(frames[frames.length - 1].kind).toBe('result');
    }
  });

  it("'web-run' produces an artifact result carrying an IR", () => {
    const result = fixtureResultFrame('web-run');
    expect(result.outcome).toBe('artifact');
    expect(result.ir).toBeDefined();
    expect(result.campaignPlan).toBeUndefined();
  });

  it("'campaign-suspend' is a SUSPEND: outcome 'gap' WITH a valid campaignPlan + campaignRunId (CHAT-06)", () => {
    const result = fixtureResultFrame('campaign-suspend');
    expect(result.outcome).toBe('gap');
    expect(result.campaignPlan).toBeDefined();
    expect(result.campaignRunId).toBeTruthy();
    // The carried plan is a REAL valid CampaignPlanT, not a stub.
    expect(() => CampaignPlanSchema.parse(result.campaignPlan)).not.toThrow();
  });

  it("'gap-run' is a REAL refusal: outcome 'gap' with NO campaignPlan (CHAT-09)", () => {
    const result = fixtureResultFrame('gap-run');
    expect(result.outcome).toBe('gap');
    expect(result.campaignPlan).toBeUndefined();
    expect(result.campaignRunId).toBeUndefined();
  });

  it("'resume-carousel' carries ordered carouselFrames", () => {
    const result = fixtureResultFrame('resume-carousel');
    expect(result.carouselFrames).toBeDefined();
    expect(result.carouselFrames!.length).toBeGreaterThan(0);
    const orders = result.carouselFrames!.map((f) => f.orderIndex);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});
