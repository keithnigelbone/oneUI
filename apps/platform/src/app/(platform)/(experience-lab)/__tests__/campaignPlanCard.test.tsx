/**
 * campaignPlanCard.test.tsx — Wave 3 fill (Plan 04).
 *
 * Owning requirements (VALIDATION test map 04.1-04-01, 04.1-04-02):
 *   - CHAT-06: a campaign SUSPEND (result `outcome:'gap'` carrying a
 *              `campaignPlan` + `campaignRunId`) renders an inline campaign-plan
 *              card — NOT a refusal — letting the user pick a direction + frame
 *              count and POST `/api/experience-lab/resume`.
 *              - Resume POST uses the EXACT `ResumeRequestBody` fields.
 *              - directionIndex / frameCount clamped at the route edge.
 *              - plan fields are React-escaped.
 *   - CHAT-07: dispatch on the second part type (`data-campaign-plan`) routes
 *              to the inline card without refactoring the run-turn branch.
 *
 * Uses the `campaign-suspend` fixture (the suspend-as-gap-with-plan branch) +
 * the `resume-carousel` fixture (to assert the resume response flows back into
 * `onResolved` so carousel frames reach the canvas placement seam).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  makeMockRunFetch,
  FIXTURE_CAMPAIGN_PLAN,
  fixtureResultFrame,
} from './labRunStreamFixtures';
import { CampaignPlanCard } from '../_chat/parts/CampaignPlanCard';
import { renderLabMessagePart } from '../_chat/parts/renderLabMessagePart';
import { PART_CAMPAIGN_PLAN } from '../_chat/parts/renderLabMessagePart';

const RESUME_ENDPOINT = '/api/experience-lab/resume';

describe('CampaignPlanCard — inline campaign suspend → resume (CHAT-06)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Test 1 (CHAT-06) — the card renders the full plan with the recommended
  // direction marked, a frame-count Stepper, and a single confirm button.
  // -------------------------------------------------------------------------
  it('CHAT-06: renders brief/audience/message-hierarchy/3 directions, the recommended marker, a Stepper, and one Generate frames button', () => {
    render(
      <CampaignPlanCard
        plan={FIXTURE_CAMPAIGN_PLAN}
        campaignRunId="persisted-run-1"
        brandId="brand-123"
      />,
    );

    // Sections / copy.
    expect(screen.getByText(/brief/i)).toBeTruthy();
    expect(screen.getByText(FIXTURE_CAMPAIGN_PLAN.briefSummary)).toBeTruthy();
    expect(screen.getByText(FIXTURE_CAMPAIGN_PLAN.audience)).toBeTruthy();

    // All 3 direction names render.
    for (const dir of FIXTURE_CAMPAIGN_PLAN.directions) {
      expect(screen.getByText(dir.name)).toBeTruthy();
    }

    // Recommended marker present (single Badge).
    expect(screen.getByText(/recommended/i)).toBeTruthy();

    // Frame-count control labelled.
    expect(screen.getByText(/frames per direction/i)).toBeTruthy();

    // Exactly one "Generate frames" primary action.
    const buttons = screen.getAllByRole('button', { name: /generate frames/i });
    expect(buttons.length).toBe(1);

    // Labelled region (a11y) — the card itself is the group named by its title.
    expect(screen.getByRole('group', { name: /campaign plan/i })).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 2 (CHAT-06 resume) — confirming POSTs the EXACT ResumeRequestBody.
  // -------------------------------------------------------------------------
  it('CHAT-06: clicking Generate frames POSTs the exact ResumeRequestBody fields to /resume', async () => {
    const fetchImpl = vi.fn(makeMockRunFetch('resume-carousel'));
    const onResolved = vi.fn();

    render(
      <CampaignPlanCard
        plan={FIXTURE_CAMPAIGN_PLAN}
        campaignRunId="persisted-run-1"
        brandId="brand-123"
        subBrandConfigId="sub-9"
        fetchImpl={fetchImpl as unknown as typeof fetch}
        onResolved={onResolved}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /generate frames/i }));

    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(RESUME_ENDPOINT);
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string) as Record<string, unknown>;

    // EXACTLY the existing ResumeRequestBody fields — no extra keys.
    expect(new Set(Object.keys(body))).toEqual(
      new Set(['runId', 'brandId', 'directionIndex', 'frameCount', 'subBrandConfigId']),
    );
    expect(body.runId).toBe('persisted-run-1');
    expect(body.brandId).toBe('brand-123');
    expect(body.subBrandConfigId).toBe('sub-9');
    // Defaults to the recommended direction + frame count.
    expect(body.directionIndex).toBe(FIXTURE_CAMPAIGN_PLAN.recommendedDirectionIndex);
    expect(body.frameCount).toBe(FIXTURE_CAMPAIGN_PLAN.recommendedFrameCount);

    // The resume response (same NDJSON stream) is handed back to onResolved so
    // the conversation hook places the carousel frames on the canvas.
    await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1));
    const resolvedResponse = onResolved.mock.calls[0][0] as Response;
    expect(resolvedResponse).toBeInstanceOf(Response);
    // The fixture's resume stream is the resume-carousel result frame.
    const expected = fixtureResultFrame('resume-carousel');
    expect(expected.carouselFrames?.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Test 2b — when no subBrandConfigId is provided, the key is omitted.
  // -------------------------------------------------------------------------
  it('CHAT-06: omits subBrandConfigId when not supplied (conditional spread, never empty string)', async () => {
    const fetchImpl = vi.fn(makeMockRunFetch('resume-carousel'));

    render(
      <CampaignPlanCard
        plan={FIXTURE_CAMPAIGN_PLAN}
        campaignRunId="persisted-run-1"
        brandId="brand-123"
        fetchImpl={fetchImpl as unknown as typeof fetch}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /generate frames/i }));
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect('subBrandConfigId' in body).toBe(false);
    expect(new Set(Object.keys(body))).toEqual(
      new Set(['runId', 'brandId', 'directionIndex', 'frameCount']),
    );
  });

  // -------------------------------------------------------------------------
  // Test 3 (Anthropic-safe) — plan fields render React-escaped (no raw HTML).
  // -------------------------------------------------------------------------
  it('CHAT-06: plan fields (briefSummary / direction names) render React-escaped', () => {
    const plan = {
      ...FIXTURE_CAMPAIGN_PLAN,
      briefSummary: '<script>alert(1)</script> safe summary',
    };
    const { container } = render(
      <CampaignPlanCard plan={plan} campaignRunId="persisted-run-1" brandId="brand-123" />,
    );
    // React escapes the markup — no live <script> node in the DOM.
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('<script>alert');
  });

  // -------------------------------------------------------------------------
  // Dispatch (CHAT-07) — the second part type routes to the inline card.
  // -------------------------------------------------------------------------
  it('CHAT-07: renderLabMessagePart routes data-campaign-plan to the inline card', () => {
    const ctx = { message: { id: 'm', role: 'assistant' as const }, index: 0 };
    const node = renderLabMessagePart(
      {
        type: PART_CAMPAIGN_PLAN,
        plan: FIXTURE_CAMPAIGN_PLAN,
        campaignRunId: 'persisted-run-1',
        brandId: 'brand-123',
      },
      ctx,
    );
    expect(node).toBeTruthy();

    // Unknown parts still fall through to null (no regression).
    const unknown = renderLabMessagePart({ type: 'data-something-else' }, ctx);
    expect(unknown).toBeNull();
  });
});
