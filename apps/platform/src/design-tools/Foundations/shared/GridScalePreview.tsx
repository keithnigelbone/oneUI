/**
 * GridScalePreview.tsx
 *
 * Grid foundation viewer + light editor, mirroring the OneUI Colour Tool 5.0 grid
 * page: a viewport slider, S/M/L breakpoint cards, a spec table (columns /
 * max-width editable, margin / gutter derived per density), and a live grid
 * preview. Margin/gutter px glide with the viewport (fluid base × token).
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  BREAKPOINT_IDS,
  BREAKPOINT_RANGES,
  DIMENSION_TOKEN_MULTIPLIERS,
  interpolateValue,
  resolveBreakpointRange,
  type BreakpointId,
  type DensityId,
  type DimensionSpacingToken,
} from '@oneui/shared';
import { Surface } from '@oneui/ui/components/Surface';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import { staticBaseForBreakpoint, type FluidEndpoints } from './FluidDimensionPreview';
import { PreviewControls } from './PreviewControls';
import styles from './GridScalePreview.module.css';

/** Preview sizing mode: 1:1 pixels (scrolls) vs scaled-to-fit the canvas. */
type PreviewFit = 'actual' | 'fit';

export interface GridBreakpointSpec {
  columns: number;
  maxWidth: number | null;
}

export interface GridScalePreviewProps {
  /** Resolved per-breakpoint columns + max-width (defaults already filled). Read-only. */
  breakpoints: Record<BreakpointId, GridBreakpointSpec>;
  /** Per-density fluid base endpoints (for resolving margin/gutter px). */
  endpoints: Record<DensityId, FluidEndpoints>;
  minViewport?: number;
  maxViewport?: number;
}

const DENSITIES: { id: DensityId; label: string }[] = [
  { id: 'compact', label: 'Compact' },
  { id: 'default', label: 'Default' },
  { id: 'open', label: 'Open' },
];
const VIEWPORT_PRESETS = [360, 768, 1024, 1440, 1920];

const round2 = (v: number): number => Math.round(v * 100) / 100;

function rangeLabel(min: number | null, max: number | null): string {
  if (min == null && max != null) return `< ${max + 1}px`;
  if (max == null && min != null) return `> ${min - 1}px`;
  if (min != null && max != null) return `${min}–${max}px`;
  return 'all';
}

function getRange(bp: BreakpointId) {
  return BREAKPOINT_RANGES.find((r) => r.id === bp)!;
}

export function GridScalePreview({
  breakpoints,
  endpoints,
  minViewport = 360,
  maxViewport = 1920,
}: GridScalePreviewProps) {
  const [viewport, setViewport] = useState(maxViewport);
  const [density, setDensity] = useState<DensityId>('default');
  // Grid margin/gutter derive from the dimension base size, which scales either
  // fluidly (clamp interpolation) or statically (Min/Mid/Max per breakpoint) —
  // same switch as the Dimension page.
  const [scaling, setScaling] = useState<'fluid' | 'static'>('fluid');

  const activeBp = resolveBreakpointRange(viewport);
  const ep = endpoints[density];
  const base = useMemo(
    () =>
      scaling === 'fluid'
        ? interpolateValue(viewport, minViewport, maxViewport, ep.mobileBase, ep.desktopBase)
        : staticBaseForBreakpoint(activeBp, ep),
    [scaling, viewport, minViewport, maxViewport, ep, activeBp],
  );
  const px = useCallback(
    (token: DimensionSpacingToken) => round2(base * DIMENSION_TOKEN_MULTIPLIERS[token]),
    [base],
  );

  const activeMarginToken = getRange(activeBp).margin[density];
  const activeGutterToken = getRange(activeBp).gutter[density];
  const activeMarginPx = px(activeMarginToken);
  const activeGutterPx = px(activeGutterToken);
  const activeColumns = breakpoints[activeBp].columns;

  // Live preview geometry as % of viewport, so it scales to the container.
  const marginPct = (activeMarginPx / viewport) * 100;
  const gutterPct = (activeGutterPx / viewport) * 100;

  // The preview window is always 600px tall. The mode only changes its width:
  //  • 'actual' — true pixel width (= the slider viewport); scrolls if it
  //    overflows the canvas.
  //  • 'fit'    — fills the canvas width; margins/gutters stay proportional
  //    (they're a % of the viewport), so the grid shrinks to fit WITHOUT
  //    scaling the height.
  const [fitMode, setFitMode] = useState<PreviewFit>('fit');

  return (
    <div className={styles.root}>
      {/* ── Controls (shared sticky section) ─────────────────────── */}
      <PreviewControls
        viewport={viewport}
        minViewport={minViewport}
        maxViewport={maxViewport}
        presets={VIEWPORT_PRESETS}
        onViewportChange={setViewport}
        fields={[
          {
            label: 'Scaling',
            value: scaling,
            onChange: (v) => setScaling(v as 'fluid' | 'static'),
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
            options: DENSITIES.map((d) => ({ value: d.id, label: d.label })),
          },
        ]}
      />

      {/* ── Breakpoints ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Breakpoints</h3>
        <div className={styles.bpCards}>
          {BREAKPOINT_IDS.map((bp) => {
            const r = getRange(bp);
            return (
              <div key={bp} className={`${styles.bpCard} ${bp === activeBp ? styles.bpCardActive : ''}`}>
                <div className={styles.bpName}>Breakpoint {bp}</div>
                <div className={styles.bpRange}>{rangeLabel(r.min, r.max)}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Specs ────────────────────────────────────────────────────
          One value column (the active breakpoint × density), NOT split per
          breakpoint — matches Figma. Item · Value · Token. */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Specs</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colItem}>Item</th>
              <th className={styles.colValue}>Value</th>
              <th>Token</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.itemCell}>Columns</td>
              <td>{activeColumns}</td>
              <td />
            </tr>
            <tr>
              <td className={styles.itemCell}>Margin</td>
              <td>{activeMarginPx}</td>
              <td><code>--Grid-Margin</code></td>
            </tr>
            <tr>
              <td className={styles.itemCell}>Gutter</td>
              <td>{activeGutterPx}</td>
              <td><code>--Grid-Gutter</code></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ── Preview ──────────────────────────────────────────────────
          Renders at true pixel width (= the slider). 'actual' scrolls when it
          overflows the canvas; 'fit' zooms the whole window down to fit.
          Primary-tinted minimal surface holds elevated (white) column cells
          with primary-tinted labels — matches Figma's bound variables. */}
      <section className={styles.section}>
        <div className={styles.sectionHeadRow}>
          <h3 className={styles.sectionTitle}>Preview</h3>
          <SegmentedControl
            value={fitMode}
            onValueChange={(v) => setFitMode(v as PreviewFit)}
            size="s"
            equalWidth={false}
            aria-label="Preview fit"
          >
            <SegmentedControl.Item value="fit">Fit</SegmentedControl.Item>
            <SegmentedControl.Item value="actual">Actual</SegmentedControl.Item>
          </SegmentedControl>
        </div>
        <div
          className={`${styles.previewStage} ${fitMode === 'actual' ? styles.previewStageScroll : ''}`}
        >
          <Surface
            mode="minimal"
            appearance="primary"
            className={styles.previewWrap}
            style={{ width: fitMode === 'actual' ? `${viewport}px` : '100%' }}
          >
            <div
              className={styles.preview}
              style={{ paddingLeft: `${marginPct}%`, paddingRight: `${marginPct}%` }}
            >
              <div className={styles.previewCols} style={{ gap: `${gutterPct}%` }}>
                {Array.from({ length: activeColumns }).map((_, i) => (
                  <Surface key={i} mode="elevated" className={styles.previewCol}>
                    <span className={styles.previewColLabel}>{i + 1}</span>
                  </Surface>
                ))}
              </div>
            </div>
          </Surface>
        </div>
      </section>
    </div>
  );
}
