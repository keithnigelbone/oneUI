/**
 * foundations/strokes/page.tsx
 *
 * Strokes Foundation — read-only display page.
 * Stroke tokens are CSS-only (not configurable per brand).
 * Static strokes (None–2XL) are fixed pixel values.
 * Dynamic strokes (3XL–9XL) alias the f-scale and respond to platform × density.
 *
 * Layout mirrors the Figma "Strokes" system page: shared viewport preview
 * controls at the top (viewport slider + fluid/static + density), then a single
 * "Specs" table (Token · Step · value · Preview) whose dynamic values track the
 * live controls, with an exact-values / integers toggle.
 */

'use client';

import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import {
  STROKE_SCALE_TOKENS,
  fStepToDimensionStep,
  DIMENSION_TOKEN_MULTIPLIERS,
  interpolateValue,
  resolveBreakpointRange,
  type DensityId,
  type FStep,
} from '@oneui/shared';
import {
  PreviewControls,
  DEFAULT_FLUID_ENDPOINTS,
} from '@/design-tools/Foundations/shared';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import { usePlatformContext } from '@/contexts/PlatformContext';
import styles from '../foundation.module.css';
import strokeStyles from './strokes.module.css';

// ─── Constants ─────────────────────────────────────────────────────────────

const MIN_VIEWPORT = 360;
const MAX_VIEWPORT = 1920;
const VIEWPORT_PRESETS = [360, 768, 1024, 1440, 1920];

const STATIC_STROKES = STROKE_SCALE_TOKENS.filter((stroke) => stroke.kind === 'fixed');
const DYNAMIC_STROKES = STROKE_SCALE_TOKENS.filter((stroke) => stroke.kind === 'dimension');

/** Max rendered width (px) of a stroke preview line. */
const PREVIEW_MAX_WIDTH_PX = 200;

const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Static (snapshot) base per breakpoint — S / mid / L edges. */
function staticBase(bp: 'S' | 'M' | 'L', mobileBase: number, desktopBase: number): number {
  if (bp === 'S') return mobileBase;
  if (bp === 'L') return desktopBase;
  return (mobileBase + desktopBase) / 2;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StrokesFoundationPage() {
  const { currentBrand } = usePlatformContext();

  const [mode, setMode] = useState<'fluid' | 'static'>('fluid');
  const [viewport, setViewport] = useState(MAX_VIEWPORT);
  const [density, setDensity] = useState<DensityId>('default');
  const [valueMode, setValueMode] = useState<'exact' | 'integers'>('exact');

  // Defer the viewport for the value recompute so dragging stays smooth.
  const deferredViewport = useDeferredValue(viewport);
  const ep = DEFAULT_FLUID_ENDPOINTS[density];
  const bp = resolveBreakpointRange(deferredViewport);

  // Base size at the active viewport (fluid glides via interpolation; static
  // snapshots at the S/M/L edges) — mirrors FluidDimensionPreview.
  const base = useMemo(() => {
    if (mode === 'fluid') {
      return interpolateValue(deferredViewport, MIN_VIEWPORT, MAX_VIEWPORT, ep.mobileBase, ep.desktopBase);
    }
    return staticBase(bp, ep.mobileBase, ep.desktopBase);
  }, [mode, deferredViewport, ep, bp]);

  /** Resolve a dynamic stroke's px value from its f-step at the current base. */
  const getDynamicStrokeValue = useCallback(
    (fStep: string) => {
      const token = fStepToDimensionStep(fStep as FStep);
      const multiplier = DIMENSION_TOKEN_MULTIPLIERS[token];
      return round2(base * multiplier);
    },
    [base],
  );

  const fmt = useCallback(
    (v: number) => (valueMode === 'integers' ? String(Math.round(v)) : String(round2(v))),
    [valueMode],
  );

  // Unified spec rows — static strokes keep their fixed px; dynamic strokes
  // resolve against the live base. Order follows STROKE_SCALE_TOKENS.
  const rows = useMemo(
    () =>
      STROKE_SCALE_TOKENS.map((stroke) => {
        const px = stroke.kind === 'fixed' ? stroke.px : getDynamicStrokeValue(stroke.fStep);
        return {
          key: stroke.key,
          cssVar: stroke.cssVar,
          step: stroke.kind === 'fixed' ? 'static' : stroke.fStep,
          px,
        };
      }),
    [getDynamicStrokeValue],
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Strokes</h1>
        <p className={styles.description}>
          {STROKE_SCALE_TOKENS.length} stroke tokens — {STATIC_STROKES.length} static
          (fixed pixel values) and {DYNAMIC_STROKES.length} dynamic (responsive via the
          dimension f-scale). Dynamic strokes adapt automatically to platform and density
          context.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Viewing for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        <div className={`${styles.tabPanelStack} ${strokeStyles.panelStack}`}>

          {/* ── Preview controls (shared) ─────────────────────────────── */}
          <PreviewControls
            viewport={viewport}
            minViewport={MIN_VIEWPORT}
            maxViewport={MAX_VIEWPORT}
            presets={VIEWPORT_PRESETS}
            onViewportChange={setViewport}
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
          />

          {/* ── Specs table ───────────────────────────────────────────── */}
          <div className={strokeStyles.specsSection}>
            <div className={strokeStyles.specsHead}>
              <h2 className={strokeStyles.specsTitle}>Specs</h2>
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
            </div>

            <div className={strokeStyles.scaleList}>
              <div className={strokeStyles.tableHeader}>
                <span>Token</span>
                <span>Step</span>
                <span>Value</span>
                <span>Preview</span>
              </div>

              {rows.map(({ key, cssVar, step, px }) => (
                <div key={key} className={strokeStyles.row}>
                  <code className={strokeStyles.tokenName}>{cssVar}</code>
                  <div className={strokeStyles.stepCell}>{step}</div>
                  <div className={strokeStyles.valueBadge}>{fmt(px)}</div>
                  <div className={strokeStyles.previewCell}>
                    {px > 0 ? (
                      <div
                        className={strokeStyles.strokeLine}
                        style={{ borderTopWidth: `${px}px`, width: `${PREVIEW_MAX_WIDTH_PX}px` }}
                      />
                    ) : (
                      <span className={strokeStyles.nonePreview}>—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
