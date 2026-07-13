/**
 * RunTurn.tsx — the streaming run-turn message part (D-11 / D-09 / D-12).
 *
 * Renders one generation run inside the chat transcript:
 *   - While running: an in-place step ticker (`AgentThinking`) inside an
 *     `aria-live="polite"` region announces progress (resolve → … → repair).
 *   - On the terminal frame: collapses to a one-line summary (`StreamingText`),
 *     with the full `describeEvent` rows behind a `Collapsible`
 *     ("Show run detail" / "Hide run detail"). Event-log rows use the Code
 *     typography role (`--Code-S-*` + `var(--Typography-Font-Code)`).
 *
 * REUSES `describeEvent` (the event → label/Badge/appearance mapping) verbatim
 * from `RunInspectorPanel.tsx` so the run timeline never drifts from the docked
 * inspector's semantics.
 *
 * CRITICAL branch (Pitfall 5 / D-12 / CHAT-06): a `gap` result frame CARRYING
 * `result.campaignPlan` is a SUSPEND, NOT a failure — it renders NO refusal
 * headline (the campaign card is dispatched separately by Plan 04). Only a REAL
 * gap (a gap event / `gap` outcome with NO campaignPlan) renders the
 * `aria-live="assertive"` refusal headline (the canvas gap card is created by the
 * run hook in Task 3).
 *
 * Threat posture (T-04.1-07): all text renders through React escaping — never
 * `dangerouslySetInnerHTML`; event rows are structured `describeEvent` labels.
 *
 * Isolation: all `@oneui/ui` imports use the deep `@oneui/ui-internal/*` alias.
 */

'use client';

import { useId, useMemo, useState } from 'react';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import { AgentThinking } from '@oneui/ui-internal/components/ChatSurface/parts/AgentThinking';
import { StreamingText } from '@oneui/ui-internal/components/ChatSurface/parts/StreamingText';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import type { RunResultFrame } from '../../_canvas/runStream';
import styles from './RunTurn.module.css';

/** Rotating live-status phrases while a run streams (UI-SPEC copy). */
const THINKING_MESSAGES = [
  'Resolving foundations…',
  'Retrieving components…',
  'Planning…',
  'Generating IR…',
  'Compiling…',
  'Validating…',
  'Evaluating…',
  'Repairing…',
] as const;

type BadgeAppearance = 'positive' | 'negative' | 'warning' | 'informative' | 'neutral';

/**
 * AGENT-02 / D-06b: human-readable activity lines for each pipeline `step`,
 * naming the responsible agent so the chat ticker reads as "transparency, not
 * noise" — legible without implementation knowledge. Reuses the existing 04.1
 * ticker (no run-turn refactor): `describeEvent`'s `'step'` case maps the raw
 * `event.step` token through this table, falling back to the raw token for any
 * future/unknown step so the timeline never goes blank.
 */
const STEP_LABELS: Record<string, string> = {
  plan: 'Planner is defining structure',
  design: 'Design advisor is selecting layout, hierarchy & components',
  copy: 'Tone advisor is refining copy & CTA',
  'generate-ir': 'Assembler is producing valid One UI IR',
  compile: 'Compiler is validating React + Jio CSS',
  validate: 'Validator is checking Jio compliance',
  evaluate: 'Evaluator is checking screenshot quality',
  repair: 'Repairing the IR',
};

/**
 * Map an event to a human label + a semantic Badge appearance.
 * REUSED verbatim from `RunInspectorPanel.tsx` (CHAT-05) so the run timeline
 * stays consistent with the docked inspector's semantics.
 */
function describeEvent(event: ExperienceBuilderEventT): {
  label: string;
  appearance: BadgeAppearance;
  statusText: string;
} {
  switch (event.type) {
    case 'run-started':
      return { label: 'Run started', appearance: 'informative', statusText: 'started' };
    case 'step':
      return {
        // AGENT-02 / D-06b: enrich the raw step token with a named agent
        // activity line; unknown/future steps fall back to the raw token.
        label: STEP_LABELS[event.step] ?? event.step,
        appearance:
          event.status === 'completed'
            ? 'positive'
            : event.status === 'failed'
              ? 'negative'
              : 'informative',
        statusText: event.status,
      };
    case 'ir-produced':
      return { label: 'IR produced', appearance: 'positive', statusText: 'valid' };
    case 'validation':
      return {
        label: 'Validation',
        appearance: event.result.passed ? 'positive' : 'negative',
        statusText: event.result.passed ? 'passed' : 'blocked',
      };
    case 'gap':
      return { label: 'Foundation gap', appearance: 'warning', statusText: 'gap' };
    case 'run-completed':
      return {
        label: 'Run completed',
        appearance:
          event.outcome === 'artifact'
            ? 'positive'
            : event.outcome === 'gap'
              ? 'warning'
              : 'negative',
        statusText: event.outcome,
      };
  }
}

/** Pull a human gap reason off the terminal/gap event for the refusal body. */
function gapReason(events: ExperienceBuilderEventT[]): string {
  const gap = events.find((e) => e.type === 'gap');
  if (!gap || gap.type !== 'gap') return '';
  if (gap.componentGap) return gap.componentGap.reason;
  if (gap.foundationGap) return gap.foundationGap.reason;
  return '';
}

export type RunTurnStatus = 'running' | 'done' | 'error';
export type RunTurnOutcome = 'artifact' | 'gap' | 'error' | 'pending';

export interface RunTurnProps {
  /** Ordered `ExperienceBuilderEvent` timeline for this run. */
  events: ExperienceBuilderEventT[];
  /** Transport status of this run turn. */
  status: RunTurnStatus;
  /** Terminal outcome — `pending` while running. */
  outcome: RunTurnOutcome;
  /** The terminal result frame (carries campaignPlan for a suspend, D-12). */
  result?: RunResultFrame;
}

export function RunTurn({ events, status, outcome, result }: RunTurnProps) {
  const [expanded, setExpanded] = useState(false);

  const rows = useMemo(() => {
    // Collapse each pipeline step's started→completed pair into ONE row that
    // shows its LATEST status, so a step appears once instead of as two
    // near-identical consecutive rows (the "duplicate" the run detail showed,
    // e.g. "Design advisor is selecting layout…" rendered twice). Non-step events
    // (ir-produced / validation / gap / run-completed) are kept individually.
    const out: { event: ExperienceBuilderEventT; key: string }[] = [];
    const stepRowIndex = new Map<string, number>();
    events.forEach((event, i) => {
      if (event.type === 'step') {
        const existing = stepRowIndex.get(event.step);
        if (existing !== undefined) {
          out[existing] = { event, key: `step-${event.step}` };
          return;
        }
        stepRowIndex.set(event.step, out.length);
        out.push({ event, key: `step-${event.step}` });
        return;
      }
      out.push({ event, key: `${event.type}-${i}` });
    });
    return out;
  }, [events]);

  const isRunning = status === 'running';

  // D-12 / Pitfall 5: a gap CARRYING a campaignPlan is a SUSPEND — never a
  // refusal. Branch on the plan BEFORE treating a gap as a failure.
  const hasCampaignPlan = Boolean(result?.campaignPlan);
  const isRealGap = outcome === 'gap' && !hasCampaignPlan;
  const isError = outcome === 'error';

  // ── Running: live step ticker (aria-live polite) ──────────────────────────
  if (isRunning) {
    return (
      <div className={styles.root} data-run-turn data-status="running">
        <div className={styles.ticker} aria-live="polite">
          <AgentThinking messages={THINKING_MESSAGES} />
        </div>
        {rows.length > 0 && (
          <ol className={styles.eventLog} data-testid="run-turn-events-live">
            {rows.map(({ event, key }) => {
              const { label, appearance, statusText } = describeEvent(event);
              return (
                <li key={key} className={styles.eventRow}>
                  <span className={styles.eventLabel}>{label}</span>
                  <Badge size="s" appearance={appearance}>
                    {statusText}
                  </Badge>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  // ── Terminal: refusal headline (real gap) ─────────────────────────────────
  if (isRealGap) {
    const reason = gapReason(events);
    return (
      <div className={styles.root} data-run-turn data-status="gap">
        <div className={styles.refusal} role="alert" aria-live="assertive">
          <h3 className={styles.refusalHeading}>Generation refused — Jio system gap</h3>
          <p className={styles.refusalBody}>
            {reason || 'A required Jio foundation or component is missing.'} See the gap report on
            the canvas.
          </p>
        </div>
        <RunDetail rows={rows} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      </div>
    );
  }

  // ── Terminal: error headline ──────────────────────────────────────────────
  if (isError) {
    return (
      <div className={styles.root} data-run-turn data-status="error">
        <div className={styles.refusal} role="alert" aria-live="assertive">
          <h3 className={styles.refusalHeading}>Generation failed</h3>
          <p className={styles.refusalBody}>
            Something went wrong during the run. Try again or refine your prompt.
          </p>
        </div>
        <RunDetail rows={rows} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      </div>
    );
  }

  // ── Terminal: done summary (artifact, or a campaign-plan suspend) ─────────
  const summary = hasCampaignPlan
    ? 'Campaign plan ready — pick a creative direction below.'
    : 'Generated experience — added to canvas.';

  return (
    <div className={styles.root} data-run-turn data-status="done">
      <p className={styles.summary} data-testid="run-turn-summary">
        <StreamingText text={summary} isStreaming={false} />
      </p>
      <RunDetail rows={rows} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
    </div>
  );
}

interface RunDetailProps {
  rows: { event: ExperienceBuilderEventT; key: string }[];
  expanded: boolean;
  onToggle: () => void;
}

/**
 * The expandable full event log (UI-SPEC: "Show run detail" / "Hide run
 * detail"). Rendered as a native disclosure (button + region) so the toggle is
 * keyboard-operable and carries the Focus Halo. Event rows use the Code
 * typography role.
 */
function RunDetail({ rows, expanded, onToggle }: RunDetailProps) {
  const detailId = useId();
  if (rows.length === 0) return null;
  return (
    <div className={styles.detail}>
      <button
        type="button"
        className={styles.detailToggle}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailId}
      >
        {expanded ? 'Hide run detail' : 'Show run detail'}
      </button>
      {expanded && (
        <ol id={detailId} className={styles.eventLog} data-testid="run-turn-events">
          {rows.map(({ event, key }) => {
            const { label, appearance, statusText } = describeEvent(event);
            return (
              <li key={key} className={styles.eventRow}>
                <span className={styles.eventLabel}>{label}</span>
                <Badge size="s" appearance={appearance}>
                  {statusText}
                </Badge>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default RunTurn;
