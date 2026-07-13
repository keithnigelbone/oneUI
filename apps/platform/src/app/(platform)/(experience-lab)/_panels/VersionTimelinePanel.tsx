/**
 * VersionTimelinePanel.tsx
 *
 * The per-artifact version-timeline panel (VER-02 / D-14). Given an
 * `artifactId`, it reads the persisted version chain via
 * `useQuery(api.experienceRuns.getArtifactHistory, { artifactId })` and renders
 * one row per version in lineage order (root → newest, chained by
 * `parentVersionId`). Each row surfaces the version's metadata: whether
 * validation passed, the evaluation composite score, and the creation time.
 *
 * This is the user-observable surface of the VER-01 end-to-end persistence: the
 * run route persists `previewState` / `evaluation` / `thumbnail` / `originRunId`
 * onto each `experienceArtifactVersions` row, and this timeline browses them.
 * Without the route wiring (Task 2's persistArtifact extension) these fields
 * would be null and the rows would render blanks.
 *
 * Sits on a `bg-subtle` Surface (UI-SPEC Color § Secondary) so the timeline is
 * visually grouped without competing with the canvas. All Jio components are
 * deep-path imports (never the barrel); styling is token-only (LAB-02). Mirrors
 * `RunInspectorPanel.tsx`.
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import { Spinner } from '@oneui/ui-internal/components/Spinner/Spinner';
import styles from './VersionTimelinePanel.module.css';

export interface VersionTimelinePanelProps {
  /**
   * The artifact whose version chain to browse. When absent the panel renders
   * its empty state (no card focused).
   */
  artifactId?: Id<'experienceArtifacts'>;
}

/** The minimal version-row shape the timeline reads (a subset of the Convex doc). */
interface TimelineVersion {
  _id: string;
  createdAt?: number;
  parentVersionId?: string;
  validation?: { passed?: boolean } | null;
  evaluation?: { composite?: number; objectivePass?: boolean } | null;
}

/**
 * Order the versions by `parentVersionId` lineage (root → newest). Falls back to
 * `createdAt` ordering when the chain is broken / partial, so a malformed chain
 * never drops a version.
 */
function orderByLineage(versions: TimelineVersion[]): TimelineVersion[] {
  const byId = new Map(versions.map((v) => [v._id, v]));
  const childOf = new Map<string | undefined, TimelineVersion>();
  for (const v of versions) childOf.set(v.parentVersionId, v);

  // Root = a version whose parent is absent or not in this set.
  const root = versions.find((v) => !v.parentVersionId || !byId.has(v.parentVersionId));
  if (!root) {
    return [...versions].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
  }

  const ordered: TimelineVersion[] = [];
  const seen = new Set<string>();
  let cursor: TimelineVersion | undefined = root;
  while (cursor && !seen.has(cursor._id)) {
    ordered.push(cursor);
    seen.add(cursor._id);
    cursor = childOf.get(cursor._id);
  }
  // Append any versions not reached by the chain walk (defensive).
  for (const v of versions) if (!seen.has(v._id)) ordered.push(v);
  return ordered;
}

function formatTime(at?: number): string {
  if (!at) return '';
  try {
    return new Date(at).toLocaleTimeString();
  } catch {
    return '';
  }
}

export function VersionTimelinePanel({ artifactId }: VersionTimelinePanelProps) {
  // `'skip'` until a card is focused — Convex's documented no-fetch sentinel.
  const history = useQuery(
    api.experienceRuns.getArtifactHistory,
    artifactId ? { artifactId } : 'skip',
  );

  const ordered = useMemo(() => {
    if (!history || !history.versions) return [];
    return orderByLineage(history.versions as unknown as TimelineVersion[]);
  }, [history]);

  return (
    <Surface mode="subtle" className={styles.panel}>
      <div data-testid="version-timeline-panel" aria-label="Version timeline">
        <h2 className={styles.panelTitle}>Version timeline</h2>

        {!artifactId ? (
          <p className={styles.emptyState} data-testid="version-timeline-empty">
            Select an artifact card to browse its version history.
          </p>
        ) : history === undefined ? (
          <Spinner size="S" />
        ) : ordered.length === 0 ? (
          <p className={styles.emptyState} data-testid="version-timeline-empty">
            No versions persisted for this artifact yet.
          </p>
        ) : (
          <ol className={styles.timeline} data-testid="version-timeline-list">
            {ordered.map((version, i) => {
              const passed = version.validation?.passed === true;
              const composite = version.evaluation?.composite;
              return (
                <Surface
                  key={version._id}
                  mode="ghost"
                  as="li"
                  className={styles.row}
                  data-testid="version-timeline-entry"
                >
                  <div className={styles.rowMain}>
                    <span className={styles.rowLabel}>Version {i + 1}</span>
                    <Badge size="s" appearance={passed ? 'positive' : 'negative'}>
                      {passed ? 'valid' : 'blocked'}
                    </Badge>
                  </div>
                  <div className={styles.rowMeta}>
                    {typeof composite === 'number' && (
                      <span className={styles.rowScore}>
                        score {composite.toFixed(2)}
                      </span>
                    )}
                    <span className={styles.rowTime}>{formatTime(version.createdAt)}</span>
                  </div>
                </Surface>
              );
            })}
          </ol>
        )}
      </div>
    </Surface>
  );
}

export default VersionTimelinePanel;
