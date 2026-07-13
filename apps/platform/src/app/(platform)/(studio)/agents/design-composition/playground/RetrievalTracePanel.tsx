/**
 * RetrievalTracePanel.tsx
 *
 * Hybrid-RAG trace viewer (RFC 0002). Renders the `RetrievalTrace` emitted
 * by the design executor alongside an AST so designers can see *which*
 * rules / references / skills the agent actually consumed and *why* each
 * one was kept or dropped.
 *
 * Used in two places today:
 *   - Playground Debug drawer (collapsible footer on the canvas)
 *   - Evaluation page expanded row
 *
 * The component is stateless and purely presentational — its job is to
 * explain the retrieval decision, not to mutate it. Consumers pass the
 * trace + optional prompt-size metric; the panel handles grouping, sort
 * order, and keyboard-accessible expand/collapse of the dropped section.
 *
 * Design decisions:
 * - Kept entries first, dropped collapsed by default. On a typical run the
 *   kept list is short (≤ 12) and the dropped list is long (20+). Putting
 *   them side-by-side would drown the signal in noise.
 * - Score is rendered as a percentage (0–100) even though vector scores
 *   are 0–1 floats. Designers think in percentages; converting once here
 *   keeps the math out of every caller.
 * - No background styling — the panel is meant to live inside a canvas
 *   footer or an eval row which already sets the surface. Using a raw
 *   div keeps it portable.
 */

'use client';

import { useState } from 'react';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import type { RetrievalTrace, RetrievalTraceEntry } from '@oneui/shared/engine';
import s from './RetrievalTracePanel.module.css';

export interface RetrievalTracePanelProps {
  trace: RetrievalTrace;
  /** Size of the final system prompt in chars — displayed as a headline
   *  stat. Omit when unknown (older turns, no retrieval). */
  promptSize?: number;
  /** Compact variant used inside dense rows (evaluation table). Removes
   *  the summary banner and shrinks type scale. */
  compact?: boolean;
  className?: string;
}

const KIND_LABEL: Record<RetrievalTraceEntry['kind'], string> = {
  rule: 'Rule',
  reference: 'Reference',
  skill: 'Skill',
};

const KIND_APPEARANCE: Record<
  RetrievalTraceEntry['kind'],
  'primary' | 'informative' | 'positive'
> = {
  rule: 'primary',
  reference: 'informative',
  skill: 'positive',
};

/**
 * Group entries by kind and sort descending by score so the most relevant
 * hit for each kind is always at the top. Invariant rules get score=1 by
 * convention, which lines them up ahead of retrieved rules in every group.
 */
function groupByKind(entries: RetrievalTraceEntry[]) {
  const groups: Record<RetrievalTraceEntry['kind'], RetrievalTraceEntry[]> = {
    rule: [],
    reference: [],
    skill: [],
  };
  for (const entry of entries) groups[entry.kind].push(entry);
  for (const key of Object.keys(groups) as Array<RetrievalTraceEntry['kind']>) {
    groups[key].sort((a, b) => b.score - a.score);
  }
  return groups;
}

export function RetrievalTracePanel({
  trace,
  promptSize,
  compact,
  className,
}: RetrievalTracePanelProps) {
  const [showDropped, setShowDropped] = useState(false);
  const kept = groupByKind(trace.kept);
  const dropped = groupByKind(trace.dropped);
  const keptTotal = trace.kept.length;
  const droppedTotal = trace.dropped.length;

  return (
    <div className={[s.panel, compact ? s.compact : '', className ?? ''].join(' ').trim()}>
      {!compact && (
        <header className={s.header}>
          <div className={s.summary}>{trace.summary}</div>
          {(promptSize !== undefined || keptTotal > 0) && (
            <div className={s.stats}>
              {promptSize !== undefined && (
                <span className={s.stat}>
                  <span className={s.statLabel}>Prompt</span>
                  <span className={s.statValue}>{(promptSize / 1000).toFixed(1)}k</span>
                </span>
              )}
              <span className={s.stat}>
                <span className={s.statLabel}>Kept</span>
                <span className={s.statValue}>{keptTotal}</span>
              </span>
              <span className={s.stat}>
                <span className={s.statLabel}>Dropped</span>
                <span className={s.statValue}>{droppedTotal}</span>
              </span>
            </div>
          )}
        </header>
      )}

      <div className={s.body}>
        {(['rule', 'reference', 'skill'] as const).map((kind) => {
          const entries = kept[kind];
          if (entries.length === 0) return null;
          return (
            <section key={kind} className={s.group} aria-labelledby={`trace-group-${kind}`}>
              <h4 id={`trace-group-${kind}`} className={s.groupTitle}>
                {KIND_LABEL[kind]}s · {entries.length}
              </h4>
              <ul className={s.entries}>
                {entries.map((entry) => (
                  <li key={entry.id} className={s.entry}>
                    <Badge
                      attention="medium"
                      size="s"
                      appearance={KIND_APPEARANCE[kind]}
                    >
                      {Math.round(entry.score * 100)}
                    </Badge>
                    <span className={s.entryId} title={entry.id}>
                      {entry.id}
                    </span>
                    <span className={s.entryReason}>{entry.reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {keptTotal === 0 && (
          <div className={s.empty}>
            No hits kept. Either retrieval returned nothing or everything was
            de-duped against invariants / pack rules.
          </div>
        )}
      </div>

      {droppedTotal > 0 && (
        <div className={s.dropped}>
          <Button
            className={s.droppedToggle}
            appearance="neutral"
            attention="low"
            size="s"
            onPress={() => setShowDropped((v) => !v)}
          >
            {showDropped ? 'Hide' : 'Show'} {droppedTotal} dropped
          </Button>
          {showDropped && (
            <ul className={s.droppedList}>
              {(['rule', 'reference', 'skill'] as const).flatMap((kind) =>
                dropped[kind].map((entry) => (
                  <li key={`${kind}-${entry.id}`} className={s.droppedEntry}>
                    <Badge attention="low" size="s" appearance="neutral">
                      {KIND_LABEL[kind]}
                    </Badge>
                    <span className={s.entryId} title={entry.id}>
                      {entry.id}
                    </span>
                    <span className={s.entryReason}>{entry.reason}</span>
                  </li>
                )),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
