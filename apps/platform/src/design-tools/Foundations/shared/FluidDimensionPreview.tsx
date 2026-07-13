/**
 * FluidDimensionPreview.tsx
 *
 * Unified "Dimension scale" section: viewport-slider controls (fluid/static) +
 * the live scale table (Step · Multiplier · value · Token · Ramp). Drag the
 * viewport — fluid glides continuously via clamp(); static snapshots step at the
 * S/M/L breakpoints (619 / 990). Mirrors the Figma "Body" design.
 *
 * Shared across the Dimension, Grid, and Shapes foundation pages.
 */

'use client';

import { useState, useMemo, useDeferredValue, useCallback, type ReactNode } from 'react';
import {
  F_STEPS,
  fStepToDimensionStep,
  FSTEP_TO_SPACING,
  interpolateValue,
  resolveBreakpointRange,
  DIMENSION_TOKEN_MULTIPLIERS,
  NEGATIVE_SPACING_TOKENS,
  type DensityId,
  type FStep,
} from '@oneui/shared';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import { PreviewControls } from './PreviewControls';
import styles from './FluidDimensionPreview.module.css';

export interface FluidEndpoints {
  /** Base size at the min viewport (S edge). */
  mobileBase: number;
  /** Base size at the max viewport (L edge). */
  desktopBase: number;
}

export interface FluidDimensionPreviewProps {
  /** Per-density base-size endpoints the scale interpolates between. */
  endpoints: Record<DensityId, FluidEndpoints>;
  minViewport?: number;
  maxViewport?: number;
  title?: string;
  description?: string;
  /** Optional override for which f-steps to list. Defaults to all. */
  steps?: FStep[];
  /** Also render a "Negative spacing" table (derived from the positive tokens). */
  showNegative?: boolean;
}

interface ScaleRow {
  step: FStep;
  multiplier: number;
  value: number;
  spacingToken: string;
}

/** One scale table (Step · Multiplier · Value · Token · Ramp). */
function ScaleTable({
  title,
  rightSlot,
  rows,
  fmt,
}: {
  title: string;
  rightSlot?: ReactNode;
  rows: ScaleRow[];
  fmt: (v: number) => string;
}) {
  return (
    <div className={styles.tableSection}>
      <div className={styles.tableHead}>
        <h3 className={styles.tableTitle}>{title}</h3>
        {rightSlot}
      </div>
      <div className={styles.tableScroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colStep}>Step</th>
              <th className={styles.colMult}>Multiplier</th>
              <th className={styles.colValue}>Value</th>
              <th className={styles.colToken}>Token</th>
              <th className={styles.colRamp}>Ramp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.step}>
                <td className={styles.stepCell}>{r.step}</td>
                <td className={styles.multCell}>×{r.multiplier}</td>
                <td className={styles.valueCell}>{fmt(r.value)}</td>
                <td className={styles.tokenCell}>
                  <code>{r.spacingToken}</code>
                </td>
                <td>
                  <span className={styles.ramp} style={{ width: `${Math.min(Math.abs(r.value), RAMP_MAX_WIDTH_PX)}px` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** ColourTool default per-density fluid endpoints (used when no brand config is wired). */
export const DEFAULT_FLUID_ENDPOINTS: Record<DensityId, FluidEndpoints> = {
  compact: { mobileBase: 14, desktopBase: 18 },
  default: { mobileBase: 16, desktopBase: 20 },
  open: { mobileBase: 18, desktopBase: 22 },
};

const VIEWPORT_PRESETS = [360, 768, 1024, 1440, 1920];

/** Max rendered width (px) of the value ramp bar — caps the visual length so
 *  large f-steps don't overflow the table cell. */
const RAMP_MAX_WIDTH_PX = 320;

const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Parse an f-step ('f-8', 'f0', 'f2-5', 'f16') to its numeric position for sorting. */
function fStepValue(step: FStep): number {
  if (step === 'f2-5') return 2.5;
  return Number(step.slice(1));
}

const SORTED_STEPS = [...F_STEPS].sort((a, b) => fStepValue(a) - fStepValue(b));

/** Static (snapshot) base per breakpoint — Option A Min/Mid/Max. */
export function staticBaseForBreakpoint(bp: 'S' | 'M' | 'L', ep: FluidEndpoints): number {
  if (bp === 'S') return ep.mobileBase;
  if (bp === 'L') return ep.desktopBase;
  return (ep.mobileBase + ep.desktopBase) / 2;
}

export function FluidDimensionPreview({
  endpoints,
  minViewport = 360,
  maxViewport = 1920,
  title = 'Spacing',
  description,
  steps = SORTED_STEPS,
  showNegative = false,
}: FluidDimensionPreviewProps) {
  const [mode, setMode] = useState<'fluid' | 'static'>('fluid');
  const [viewport, setViewport] = useState(maxViewport);
  const [density, setDensity] = useState<DensityId>('default');
  const [valueMode, setValueMode] = useState<'exact' | 'integers'>('exact');

  // Defer the viewport for the heavy table recompute so dragging stays smooth.
  const deferredViewport = useDeferredValue(viewport);
  const ep = endpoints[density];
  const bp = resolveBreakpointRange(deferredViewport);

  const base = useMemo(() => {
    if (mode === 'fluid') {
      return interpolateValue(deferredViewport, minViewport, maxViewport, ep.mobileBase, ep.desktopBase);
    }
    return staticBaseForBreakpoint(bp, ep);
  }, [mode, deferredViewport, minViewport, maxViewport, ep, bp]);

  const rows = useMemo(() => {
    const computed = steps.map((step) => {
      const token = fStepToDimensionStep(step);
      const multiplier = DIMENSION_TOKEN_MULTIPLIERS[token];
      const value = round2(base * multiplier);
      const spacingKey = FSTEP_TO_SPACING[step] ?? token;
      return { step, multiplier, value, spacingToken: `--Spacing-${String(spacingKey).replace('.', '-')}` };
    });
    return computed;
  }, [steps, base]);

  // Negative spacing tokens — derived from the positive ones (value × −1).
  const negativeRows = useMemo<ScaleRow[]>(() => {
    if (!showNegative) return [];
    const allowed = new Set<string>(NEGATIVE_SPACING_TOKENS);
    return steps
      .map((step) => ({ step, token: fStepToDimensionStep(step) }))
      .filter(({ token }) => allowed.has(token))
      .map(({ step, token }) => {
        const mult = DIMENSION_TOKEN_MULTIPLIERS[token];
        return {
          step,
          multiplier: -mult,
          value: round2(-(base * mult)),
          spacingToken: `--Spacing-Negative-${String(token).replace('.', '-')}`,
        };
      });
  }, [showNegative, steps, base]);

  const fmt = useCallback(
    (v: number) => (valueMode === 'integers' ? String(Math.round(v)) : String(round2(v))),
    [valueMode],
  );

  const setVp = useCallback((v: number) => setViewport(v), []);

  return (
    <div className={styles.root}>
      {description && <p className={styles.sectionDesc}>{description}</p>}

      {/* ── Controls (shared sticky section) ─────────────────────── */}
      <PreviewControls
        viewport={viewport}
        minViewport={minViewport}
        maxViewport={maxViewport}
        presets={VIEWPORT_PRESETS}
        onViewportChange={setVp}
        fields={[
          {
            label: 'Scaling',
            value: mode,
            onChange: (v) => setMode(v as 'fluid' | 'static'),
            options: [
              { value: 'fluid', label: 'Fluid' },
              { value: 'static', label: 'Static' },
            ],
          },
          {
            label: 'Density',
            value: density,
            appearance: 'neutral',
            onChange: (v) => setDensity(v as DensityId),
            options: [
              { value: 'compact', label: 'Compact' },
              { value: 'default', label: 'Default' },
              { value: 'open', label: 'Open' },
            ],
          },
        ]}
        readouts={[
          { label: 'Base size', value: `${round2(base)} px` },
          { label: 'Active breakpoint', value: `Breakpoint ${bp}` },
        ]}
      />

      {/* ── Dimension scale table ────────────────────────────────── */}
      <ScaleTable
        title={title}
        rows={rows}
        fmt={fmt}
        rightSlot={
          <SegmentedControl
            value={valueMode}
            onValueChange={(v) => setValueMode(v as 'exact' | 'integers')}
            size="s"
            equalWidth={false}
            aria-label="Value format"
          >
            <SegmentedControl.Item value="exact">Exact values</SegmentedControl.Item>
            <SegmentedControl.Item value="integers">Integers</SegmentedControl.Item>
          </SegmentedControl>
        }
      />

      {/* ── Negative spacing table (same style, derived) ─────────── */}
      {showNegative && negativeRows.length > 0 && (
        <ScaleTable title="Negative spacing" rows={negativeRows} fmt={fmt} />
      )}
    </div>
  );
}
