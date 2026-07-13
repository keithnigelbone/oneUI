/**
 * labRunStreamFixtures.ts — Wave 0 reusable NDJSON run-stream fixture factory.
 *
 * Downstream waves (chat host, run turn, inline card, selection binding) all
 * decode the same NDJSON `RunStreamFrame` contract via `readNdjson`
 * (`_canvas/useExperienceLabRun.ts`). This module exports `makeMockRunFetch`,
 * a `fetchImpl`-compatible factory that streams one JSON line per frame
 * through a real `ReadableStream` body, so `readNdjson` consumes it unchanged
 * — no live backend, no `ai`/`@ai-sdk` import (the Lab single-`ai` gate).
 *
 * Four scenarios cover every run shape the chat-first UI must render:
 *
 *   - `'web-run'`         — events → result `outcome:'artifact'` carrying an IR.
 *   - `'gap-run'`         — events + a `gap` event → result `outcome:'gap'`
 *                            with NO `campaignPlan` (a REAL refusal, CHAT-09).
 *   - `'campaign-suspend'`— events → result `outcome:'gap'` carrying a valid
 *                            `CampaignPlanT` + `campaignRunId` (a SUSPEND, NOT
 *                            a failure — the suspend-as-gap pitfall, CHAT-06).
 *   - `'resume-carousel'` — events → result carrying ordered `carouselFrames`.
 *
 * The frame shapes are imported from `runStream.ts` verbatim so the fixture can
 * never drift from the production wire contract.
 */

import { validationPassed } from '@oneui/experience-builder-core';
import type {
  CampaignPlanT,
  JioExperienceIRT,
  ExperienceBuilderEventT,
} from '@oneui/experience-builder-core';
import type {
  RunEventFrame,
  RunResultFrame,
  RunStreamFrame,
  CarouselFrameFrame,
} from '../_canvas/runStream';

/** The four run shapes the chat-first UI must render. */
export type RunFetchScenario =
  | 'web-run'
  | 'gap-run'
  | 'campaign-suspend'
  | 'resume-carousel';

const RUN_ID = 'wf-fixture-1';

/** A minimal, validator-agnostic IR stub for artifact-producing scenarios. */
const FIXTURE_IR = {
  artifactType: 'web-ui',
  version: 1,
} as unknown as JioExperienceIRT;

/**
 * A valid `CampaignPlanT` (mirrors the core contract fixture): exactly three
 * DS-grounded directions, plain-number recommended index/frame count. Used by
 * the `campaign-suspend` scenario to prove the result frame carries a plan.
 */
export const FIXTURE_CAMPAIGN_PLAN: CampaignPlanT = {
  briefSummary: 'A 5-frame Instagram carousel for the new unlimited prepaid plan.',
  audience: 'Urban prepaid users, 18–24, heavy data consumers.',
  messageHierarchy: ['Unlimited data', 'No daily caps', 'Same low price', 'Sign up in-app'],
  directions: [
    {
      name: 'Bold Data Drop',
      concept: 'Lead with the headline data offer in a confident, high-contrast hero.',
      copyAngle: 'Punchy, benefit-first, urgent.',
      leadRole: 'primary',
      surfaceMood: 'bold',
      layoutMotif: 'centered-hero-stack',
    },
    {
      name: 'Calm Confidence',
      concept: 'Lead with the headline data offer in a confident, high-contrast hero.',
      copyAngle: 'Punchy, benefit-first, urgent.',
      leadRole: 'neutral',
      surfaceMood: 'subtle',
      layoutMotif: 'centered-hero-stack',
    },
    {
      name: 'Sparkle Spotlight',
      concept: 'Lead with the headline data offer in a confident, high-contrast hero.',
      copyAngle: 'Punchy, benefit-first, urgent.',
      leadRole: 'sparkle',
      surfaceMood: 'elevated',
      layoutMotif: 'centered-hero-stack',
    },
  ],
  recommendedDirectionIndex: 0,
  recommendedFrameCount: 5,
};

/** Three ordered carousel frames for the `resume-carousel` scenario. */
const FIXTURE_CAROUSEL_FRAMES: CarouselFrameFrame[] = [0, 1, 2].map((orderIndex) => ({
  variantGroupId: 'vg-fixture-1',
  orderIndex,
  outcome: 'artifact',
  validationPassed: true,
  copy: {
    headline: `Frame ${orderIndex + 1} headline`,
    body: 'On-brand body copy composed from Jio foundations.',
    cta: 'Get the plan',
    caption: 'Unlimited data, no daily caps.',
  },
  ir: FIXTURE_IR,
}));

/** Build the ordered frame list for a scenario (event frames + terminal result). */
export function buildRunFrames(scenario: RunFetchScenario): RunStreamFrame[] {
  const startedAt = 1;
  /** Wrap an event in its NDJSON frame, narrowing to the discriminated union. */
  const ev = (event: ExperienceBuilderEventT): RunEventFrame => ({ kind: 'event', event });

  const baseEvents: RunEventFrame[] = [
    ev({ type: 'run-started', runId: RUN_ID, at: startedAt }),
    ev({ type: 'step', runId: RUN_ID, step: 'resolve-foundation', status: 'completed', at: startedAt + 1 }),
  ];

  switch (scenario) {
    case 'web-run': {
      const events: RunEventFrame[] = [
        ...baseEvents,
        ev({ type: 'step', runId: RUN_ID, step: 'generate-ir', status: 'completed', at: startedAt + 2 }),
        ev({ type: 'ir-produced', runId: RUN_ID, irId: 'ir-1', at: startedAt + 3 }),
        ev({ type: 'validation', runId: RUN_ID, result: validationPassed(), at: startedAt + 4 }),
        ev({ type: 'run-completed', runId: RUN_ID, outcome: 'artifact', at: startedAt + 5 }),
      ];
      const result: RunResultFrame = {
        kind: 'result',
        outcome: 'artifact',
        ir: FIXTURE_IR,
        validation: validationPassed(),
      };
      return [...events, result];
    }

    case 'gap-run': {
      // A REAL refusal: a gap event short-circuits and the result carries NO
      // campaignPlan. The chat host must render this as a gap, never a suspend.
      const events: RunEventFrame[] = [
        ...baseEvents,
        ev({
          type: 'gap',
          runId: RUN_ID,
          foundationGap: {
            artifactType: 'outdoor-display',
            outputProfile: 'billboard-landscape',
            reason: 'No Jio outdoor-display output profile exists for this brand.',
          },
          at: startedAt + 2,
        }),
        ev({ type: 'run-completed', runId: RUN_ID, outcome: 'gap', at: startedAt + 3 }),
      ];
      const result: RunResultFrame = { kind: 'result', outcome: 'gap' };
      return [...events, result];
    }

    case 'campaign-suspend': {
      // A SUSPEND (not a failure): outcome rides as 'gap' on the wire — like
      // every suspend — but the result carries a valid campaignPlan + the
      // durable campaignRunId. The chat host must render a plan card here, NOT
      // a refusal. This is the suspend-as-gap-with-plan pitfall fixture.
      const events: RunEventFrame[] = [
        ...baseEvents,
        ev({ type: 'step', runId: RUN_ID, step: 'plan-campaign', status: 'completed', at: startedAt + 2 }),
      ];
      const result: RunResultFrame = {
        kind: 'result',
        outcome: 'gap',
        campaignPlan: FIXTURE_CAMPAIGN_PLAN,
        campaignRunId: 'persisted-run-1',
      };
      return [...events, result];
    }

    case 'resume-carousel': {
      const events: RunEventFrame[] = [
        ...baseEvents,
        ev({ type: 'step', runId: RUN_ID, step: 'generate-frames', status: 'completed', at: startedAt + 2 }),
        ev({ type: 'run-completed', runId: RUN_ID, outcome: 'artifact', at: startedAt + 3 }),
      ];
      const result: RunResultFrame = {
        kind: 'result',
        outcome: 'artifact',
        carouselFrames: FIXTURE_CAROUSEL_FRAMES,
      };
      return [...events, result];
    }
  }
}

/** Encode a frame list as an NDJSON byte stream (one JSON line + `\n` each). */
function framesToReadableStream(frames: RunStreamFrame[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const frame of frames) {
        controller.enqueue(encoder.encode(`${JSON.stringify(frame)}\n`));
      }
      controller.close();
    },
  });
}

/**
 * A `fetchImpl`-compatible mock for `useExperienceLabRun`'s injectable fetch.
 * Returns a `Response` whose `body` is a real NDJSON `ReadableStream`, so the
 * production `readNdjson` decoder consumes it unchanged.
 *
 * @example
 *   const fetchImpl = makeMockRunFetch('campaign-suspend');
 *   await runForPrompt(promptId, { fetchImpl });
 */
export function makeMockRunFetch(scenario: RunFetchScenario): typeof fetch {
  const frames = buildRunFrames(scenario);
  const mock = async (): Promise<Response> =>
    new Response(framesToReadableStream(frames), {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Experience-Run-Id': RUN_ID,
      },
    });
  return mock as unknown as typeof fetch;
}

/**
 * Decode a fixture `Response` body back into ordered frames — a small helper so
 * fixture-shape assertions don't have to re-implement NDJSON parsing.
 */
export async function readFixtureFrames(response: Response): Promise<RunStreamFrame[]> {
  const text = await response.text();
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RunStreamFrame);
}

/** The terminal result frame of a scenario — convenience for assertions. */
export function fixtureResultFrame(scenario: RunFetchScenario): RunResultFrame {
  const frames = buildRunFrames(scenario);
  const last = frames[frames.length - 1];
  if (last.kind !== 'result') {
    throw new Error(`scenario "${scenario}" did not end with a result frame`);
  }
  return last;
}
