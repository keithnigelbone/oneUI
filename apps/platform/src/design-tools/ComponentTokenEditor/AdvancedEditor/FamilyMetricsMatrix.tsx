/**
 * FamilyMetricsMatrix.tsx
 *
 * Per-size metrics editor for a family's `custom` scale decision.
 * The primary gesture is a RAMP: shifting a metric moves every size the same
 * number of steps along the Spacing ladder, so the size ramp is preserved by
 * construction. Individual size cells can be PINNED to an exact Spacing token;
 * pinned cells win over the ramp and can be unpinned to rejoin it.
 *
 * Reads/writes flat `:`-namespaced selection params:
 *   `{scaleDecisionId}:ramp:{metric}`             → ramp offset ("-1", "2")
 *   `{scaleDecisionId}:cell:{metric}.{size}`      → pinned Spacing token
 */

'use client';

import React, { useMemo } from 'react';
import { Minus, Plus, Pin, X } from 'lucide-react';
import {
  AVAILABLE_TOKENS,
  parseRampOffset,
  shiftSpacingToken,
  themeParamKey,
  type ComponentThemeFamilyDefinition,
} from '@oneui/shared';
import { IconButton } from '@oneui/ui-internal/components/IconButton';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import {
  useComponentTokenEditor,
  generateTokenOptionsFromFoundation,
} from '../ComponentTokenEditorContext';
import styles from './FamilyMetricsMatrix.module.css';

const RAMP_MIN = -4;
const RAMP_MAX = 4;

/** F-step and t-shirt size keys → short display labels. */
const SIZE_LABELS: Record<string, string> = {
  '6': 'xs',
  '8': 's',
  '10': 'm',
  '12': 'l',
  s: 's',
  m: 'm',
  l: 'l',
  '': 'all',
};

function formatMetricLabel(metric: string): string {
  const withSpaces = metric.replace(/([A-Z])/g, ' $1').toLowerCase();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export interface FamilyMetricsMatrixProps {
  family: ComponentThemeFamilyDefinition;
  /** The family's scale-ish decision id (`controlScale` or `density`). */
  scaleDecisionId: string;
  /** Current family selections (flat, including `:` params). */
  selections: Record<string, string>;
  /** Set (value) or remove (null) one `:` param on the family. */
  onParam: (paramKey: string, value: string | null) => void;
}

export function FamilyMetricsMatrix({
  family,
  scaleDecisionId,
  selections,
  onParam,
}: FamilyMetricsMatrixProps) {
  const { foundationData } = useComponentTokenEditor();

  // The primary target drives the matrix; cells/ramps apply to every family
  // target that exposes the same metric.
  const target = useMemo(
    () => family.targets.find((candidate) => candidate.metricBaselines),
    [family],
  );

  const spacingOptions = useMemo(() => {
    const dynamic = generateTokenOptionsFromFoundation(foundationData, 'spacing');
    const available = dynamic.length > 0 ? dynamic : AVAILABLE_TOKENS.spacing;
    return available.map((option) => ({ value: option.token, label: option.label }));
  }, [foundationData]);

  if (!target?.metricBaselines) return null;

  const metrics = Object.entries(target.metricBaselines);

  return (
    <div className={styles.matrix} role="group" aria-label="Per-size metrics">
      <span className={styles.hint}>
        Shift a metric to move every size together along the spacing ladder, or pin an exact token
        per size.
      </span>
      {metrics.map(([metric, sizes]) => {
        const rampKey = themeParamKey(scaleDecisionId, `ramp:${metric}`);
        const rampOffset = parseRampOffset(selections[rampKey]);
        const sizeEntries = Object.entries(sizes);
        const effectiveTokens = sizeEntries.map(([size, baseline]) => {
          const cellKey = themeParamKey(scaleDecisionId, `cell:${metric}${size ? `.${size}` : ''}`);
          const pinned = selections[cellKey];
          return {
            size,
            cellKey,
            pinned: Boolean(pinned),
            token: pinned ?? shiftSpacingToken(baseline, rampOffset),
          };
        });
        const collapsed = effectiveTokens.some(
          (cell, index) => index > 0 && cell.token === effectiveTokens[index - 1].token && cell.size !== '',
        );

        return (
          <div key={metric} className={styles.metricRow}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>{formatMetricLabel(metric)}</span>
              <div className={styles.ramp}>
                <IconButton
                  icon={<Minus size={12} />}
                  size="s"
                  attention="low"
                  appearance="neutral"
                  disabled={rampOffset <= RAMP_MIN}
                  onPress={() =>
                    onParam(rampKey, rampOffset - 1 === 0 ? null : String(rampOffset - 1))
                  }
                  aria-label={`Shift ${formatMetricLabel(metric)} down one spacing step`}
                />
                <span className={styles.rampValue} aria-live="polite">
                  {rampOffset > 0 ? `+${rampOffset}` : String(rampOffset)}
                </span>
                <IconButton
                  icon={<Plus size={12} />}
                  size="s"
                  attention="low"
                  appearance="neutral"
                  disabled={rampOffset >= RAMP_MAX}
                  onPress={() =>
                    onParam(rampKey, rampOffset + 1 === 0 ? null : String(rampOffset + 1))
                  }
                  aria-label={`Shift ${formatMetricLabel(metric)} up one spacing step`}
                />
              </div>
            </div>
            <div className={styles.cells}>
              {effectiveTokens.map(({ size, cellKey, pinned, token }) => (
                <div key={cellKey} className={styles.cell} data-pinned={pinned || undefined}>
                  <span className={styles.cellSize}>{SIZE_LABELS[size] ?? size}</span>
                  <Select
                    value={token}
                    onChange={(value) => onParam(cellKey, value)}
                    options={spacingOptions}
                    size="sm"
                    aria-label={`${formatMetricLabel(metric)} for size ${SIZE_LABELS[size] ?? size}`}
                  />
                  {pinned && (
                    <span className={styles.pinnedBadge}>
                      <Pin size={10} aria-hidden />
                      <IconButton
                        icon={<X size={10} />}
                        size="s"
                        attention="low"
                        appearance="neutral"
                        onPress={() => onParam(cellKey, null)}
                        aria-label={`Unpin ${formatMetricLabel(metric)} for size ${SIZE_LABELS[size] ?? size}`}
                      />
                    </span>
                  )}
                </div>
              ))}
            </div>
            {collapsed && (
              <span className={styles.collapseWarning} role="status">
                Two sizes resolve to the same token — the size ramp is flattened here.
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FamilyMetricsMatrix;
