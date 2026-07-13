/**
 * runTurn.test.tsx — Plan 03 fill (Wave 2).
 *
 * Owning requirements (VALIDATION test map 04.1-03-02):
 *   - CHAT-05: a streaming run turn reduces the ordered `ExperienceBuilderEvent`
 *              stream into an in-place step ticker, then collapses to a summary
 *              with expandable structured detail rows (`describeEvent`).
 *   - CHAT-09: a REAL gap (no campaignPlan) renders a refusal turn, distinct
 *              from a campaign suspend.
 *   - CHAT-06 (pitfall): a campaign-suspend result frame carrying campaignPlan
 *              does NOT render a refusal headline (suspend-before-failure branch).
 *   - CHAT-07: dispatch on an unknown part type falls through to `null`.
 *
 * Drives the run-turn over real NDJSON frames decoded from the Plan-01 fixtures
 * (`buildRunFrames`) so the reducer is exercised against the production wire
 * contract.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  buildRunFrames,
  fixtureResultFrame,
} from './labRunStreamFixtures';
import { isEventFrame } from '../_canvas/runStream';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import { RunTurn } from '../_chat/parts/RunTurn';
import { renderLabMessagePart } from '../_chat/parts/renderLabMessagePart';
import { PART_RUN_PROGRESS } from '../_chat/useLabConversation';

/** Collect the ordered event timeline a scenario emits (for the run turn). */
function eventsOf(scenario: Parameters<typeof buildRunFrames>[0]): ExperienceBuilderEventT[] {
  return buildRunFrames(scenario)
    .filter(isEventFrame)
    .map((f) => f.event);
}

describe('RunTurn — streaming event reducer + turn rendering (CHAT-05/09/06)', () => {
  // -------------------------------------------------------------------------
  // Test 1 (CHAT-05) — ticker while running; collapsed summary + expandable.
  // -------------------------------------------------------------------------
  it('CHAT-05: shows a live ticker while running and a collapsible summary on done', () => {
    const events = eventsOf('web-run');

    // While running — the live ticker region is present (aria-live polite).
    const { rerender, container } = render(
      <RunTurn events={events.slice(0, 2)} status="running" outcome="pending" />,
    );
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeTruthy();

    // Terminal — collapses to the done summary with the expandable detail toggle.
    rerender(
      <RunTurn
        events={events}
        status="done"
        outcome="artifact"
        result={fixtureResultFrame('web-run')}
      />,
    );
    // The summary mentions the generated outcome.
    expect(screen.getByTestId('run-turn-summary')).toBeTruthy();
    // The full describeEvent rows live behind a "Show run detail" expander.
    expect(screen.getByText(/show run detail/i)).toBeTruthy();
  });

  it('CHAT-05: describeEvent rows are React-escaped (no dangerouslySetInnerHTML)', () => {
    const events = eventsOf('web-run');
    const { container } = render(
      <RunTurn
        events={events}
        status="done"
        outcome="artifact"
        result={fixtureResultFrame('web-run')}
      />,
    );
    // No raw HTML injection anywhere in the rendered tree.
    expect(container.innerHTML).not.toContain('<script');
  });

  // -------------------------------------------------------------------------
  // Test 2 (CHAT-09) — a real gap (no plan) renders a refusal headline.
  // -------------------------------------------------------------------------
  it('CHAT-09: a gap-run (no campaignPlan) renders an assertive refusal headline', () => {
    const events = eventsOf('gap-run');
    render(
      <RunTurn
        events={events}
        status="done"
        outcome="gap"
        result={fixtureResultFrame('gap-run')}
      />,
    );
    expect(screen.getByText(/generation refused — jio system gap/i)).toBeTruthy();
    // Announced assertively (actionable terminal state).
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(assertive).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 3 (CHAT-06 pitfall) — a campaign-suspend (gap + plan) is NOT a refusal.
  // -------------------------------------------------------------------------
  it('CHAT-06: a campaign-suspend result (gap carrying campaignPlan) renders NO refusal headline', () => {
    const events = eventsOf('campaign-suspend');
    render(
      <RunTurn
        events={events}
        status="done"
        outcome="gap"
        result={fixtureResultFrame('campaign-suspend')}
      />,
    );
    expect(screen.queryByText(/generation refused/i)).toBeNull();
    expect(screen.queryByText(/generation failed/i)).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Dispatch — renderLabMessagePart routes the run-progress part and falls
  // through to null for unknown parts (CHAT-07).
  // -------------------------------------------------------------------------
  it('CHAT-07: renderLabMessagePart returns a RunTurn for data-run-progress and null for unknown parts', () => {
    const ctx = { message: { id: 'm', role: 'assistant' as const }, index: 0 };
    const node = renderLabMessagePart(
      {
        type: PART_RUN_PROGRESS,
        events: eventsOf('web-run'),
        status: 'done',
        outcome: 'artifact',
        result: fixtureResultFrame('web-run'),
      },
      ctx,
    );
    expect(node).toBeTruthy();

    const unknown = renderLabMessagePart({ type: 'data-something-else' }, ctx);
    expect(unknown).toBeNull();
  });
});

// ===========================================================================
// Wave 0 (04.2-01) RED — enriched chat step labels (AGENT-02 / D-06b).
//
// PINS the contract Plan 05 Task 3 drives to GREEN: each pipeline `step` event
// renders a human-readable ACTIVITY line from a (to-be-added) STEP_LABELS map
// in RunTurn.tsx, not the raw `event.step` token. An UNKNOWN step falls back to
// the raw token.
//
// These MUST fail now: `describeEvent`'s `'step'` case returns `event.step`
// verbatim today (RunTurn.tsx:66-76), so the human label is never rendered.
// ===========================================================================

/** Build a single `step` event (status:'completed') for a pipeline step. */
function stepEvent(step: string): ExperienceBuilderEventT {
  return { type: 'step', runId: 'r-labels', step, status: 'completed', at: 1 } as ExperienceBuilderEventT;
}

/** Render the terminal RunTurn and expand the "Show run detail" disclosure. */
function renderExpanded(events: ExperienceBuilderEventT[]) {
  const utils = render(
    <RunTurn events={events} status="done" outcome="artifact" result={fixtureResultFrame('web-run')} />,
  );
  fireEvent.click(screen.getByText(/show run detail/i));
  return utils;
}

describe('RunTurn — enriched step labels (AGENT-02 / RED)', () => {
  const STEP_LABEL_CASES: Array<[string, RegExp]> = [
    ['plan', /Planner is defining structure/i],
    ['design', /Design advisor is selecting layout, hierarchy & components/i],
    ['copy', /Tone advisor is refining copy & CTA/i],
    ['generate-ir', /Assembler is producing valid One UI IR/i],
    ['compile', /Compiler is validating React \+ Jio CSS/i],
    ['validate', /Validator is checking Jio compliance/i],
    ['evaluate', /Evaluator is checking screenshot quality/i],
  ];

  it.each(STEP_LABEL_CASES)(
    'step "%s" renders its human-readable STEP_LABELS activity line (not the raw token)',
    (step, labelRe) => {
      renderExpanded([stepEvent(step)]);
      expect(screen.getByText(labelRe)).toBeTruthy();
    },
  );

  it('an UNKNOWN step falls back to the raw step token', () => {
    renderExpanded([stepEvent('some-future-step')]);
    expect(screen.getByText('some-future-step')).toBeTruthy();
  });
});
