/**
 * RunInspectorPanel.tsx
 *
 * The docked run-inspector panel (ORCH-03). It renders the active run's ordered
 * `ExperienceBuilderEvent` timeline as the run streams from the Node route. Each
 * event is a row (ListItem-style) with a semantic status Badge; an in-progress
 * step shows the `informative` role + a Spinner.
 *
 * Sits on a `bg-subtle` Surface (UI-SPEC Color § Secondary) so the timeline is
 * visually grouped without competing with the canvas. All Jio components are
 * deep-path imports (never the barrel); styling is token-only (LAB-02).
 *
 * The panel is a pure view over the event list owned by the canvas shell — it
 * holds no run state of its own, so the same ordered stream the route emits is
 * what renders here.
 */

'use client';

import { useMemo } from 'react';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import { Spinner } from '@oneui/ui-internal/components/Spinner/Spinner';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import styles from './RunInspectorPanel.module.css';

export interface RunInspectorPanelProps {
  /** Ordered `ExperienceBuilderEvent` timeline for the active run. */
  events: ExperienceBuilderEventT[];
  /** Whether the run is still in flight (shows the trailing spinner row). */
  isRunning?: boolean;
}

type BadgeAppearance =
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative'
  | 'neutral';

/** Map an event to a human label + a semantic Badge appearance. */
function describeEvent(event: ExperienceBuilderEventT): {
  label: string;
  detail: string;
  appearance: BadgeAppearance;
  statusText: string;
} {
  switch (event.type) {
    case 'run-started':
      return {
        label: 'Run started',
        detail: '',
        appearance: 'informative',
        statusText: 'started',
      };
    case 'step':
      return {
        label: event.step,
        detail: '',
        appearance:
          event.status === 'completed'
            ? 'positive'
            : event.status === 'failed'
              ? 'negative'
              : 'informative',
        statusText: event.status,
      };
    case 'ir-produced':
      return {
        label: 'IR produced',
        detail: '',
        appearance: 'positive',
        statusText: 'valid',
      };
    case 'validation':
      return {
        label: 'Validation',
        detail: '',
        appearance: event.result.passed ? 'positive' : 'negative',
        statusText: event.result.passed ? 'passed' : 'blocked',
      };
    case 'gap':
      return {
        label: 'Foundation gap',
        detail: '',
        appearance: 'warning',
        statusText: 'gap',
      };
    case 'run-completed':
      return {
        label: 'Run completed',
        detail: '',
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

function formatTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString();
  } catch {
    return '';
  }
}

export function RunInspectorPanel({ events, isRunning = false }: RunInspectorPanelProps) {
  const rows = useMemo(
    () => events.map((event, i) => ({ event, key: `${event.type}-${i}` })),
    [events],
  );

  return (
    <Surface mode="subtle" className={styles.panel}>
      <div data-testid="run-inspector-panel" aria-label="Run inspector">
        <h2 className={styles.panelTitle}>Run inspector</h2>

        {events.length === 0 && !isRunning ? (
          <p className={styles.emptyState} data-testid="run-inspector-empty">
            No run yet. Select a prompt card and run a generation to see the live
            event timeline.
          </p>
        ) : (
          <ol className={styles.timeline} data-testid="run-inspector-timeline">
            {rows.map(({ event, key }) => {
              const { label, appearance, statusText } = describeEvent(event);
              return (
                <li key={key} className={styles.row}>
                  <div className={styles.rowMain}>
                    <span className={styles.rowLabel}>{label}</span>
                    <Badge size="s" appearance={appearance}>
                      {statusText}
                    </Badge>
                  </div>
                  <span className={styles.rowTime}>{formatTime(event.at)}</span>
                </li>
              );
            })}
            {isRunning && (
              <li className={styles.row} data-testid="run-inspector-running">
                <div className={styles.rowMain}>
                  <span className={styles.rowLabel}>running…</span>
                  <Spinner size="S" />
                </div>
              </li>
            )}
          </ol>
        )}
      </div>
    </Surface>
  );
}

export default RunInspectorPanel;
