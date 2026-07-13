/**
 * foundations/shapes/page.tsx
 *
 * Shapes Foundation — a single viewport-driven spec table. Shape scale steps
 * (`Shape-0` … `Shape-10`) derive from dimension f-steps, so the viewport slider
 * (fluid/static + density) drives their resolved values live. `Shape-Pill`
 * (9999px) is a standalone constant appended as the final row. Previews render a
 * swatch filled with the primary Bold appearance, rounded by the shape value.
 *
 * Brand shape intent is not edited here — the `shapeLanguage` decision lives in
 * the Component Theme editor, which is the only surface that can also set the
 * exact token behind its `custom` option.
 */

'use client';

import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import {
  fStepToDimensionStep,
  interpolateValue,
  resolveBreakpointRange,
  DIMENSION_TOKEN_MULTIPLIERS,
  SHAPE_FSTEP_MAP,
  SHAPE_SCALE_ORDER,
  type DensityId,
  type FStep,
} from '@oneui/shared';
import { PreviewControls, DEFAULT_FLUID_ENDPOINTS } from '@/design-tools/Foundations/shared';
import type { FluidEndpoints } from '@/design-tools/Foundations/shared';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import styles from '../foundation.module.css';
import shapeStyles from './shapes.module.css';

// ─── Constants ─────────────────────────────────────────────────────────────

const MIN_VIEWPORT = 360;
const MAX_VIEWPORT = 1920;
const VIEWPORT_PRESETS = [360, 768, 1024, 1440, 1920];

/** Rows in canonical scale order (`Shape-0` → `Shape-10`, i.e. f-8 → f7).
 *  Iterate SHAPE_SCALE_ORDER, never `Object.keys(SHAPE_FSTEP_MAP)` — the map's
 *  integer-like keys enumerate `'1'`, `'2'`, … `'10'` before `'0-5'`, `'1-5'`, … */
const SHAPE_ORDER: { fStep: FStep; shape: string }[] = SHAPE_SCALE_ORDER.map((shape) => ({
  shape,
  fStep: SHAPE_FSTEP_MAP[shape] as FStep,
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

const round2 = (v: number): number => Math.round(v * 100) / 100;

/** Static (snapshot) base per breakpoint — Min/Mid/Max of the endpoints. */
function staticBaseForBreakpoint(bp: 'S' | 'M' | 'L', ep: FluidEndpoints): number {
  if (bp === 'S') return ep.mobileBase;
  if (bp === 'L') return ep.desktopBase;
  return (ep.mobileBase + ep.desktopBase) / 2;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ShapesFoundationPage() {
  const [mode, setMode] = useState<'fluid' | 'static'>('fluid');
  const [viewport, setViewport] = useState(MAX_VIEWPORT);
  const [density, setDensity] = useState<DensityId>('default');
  const [valueMode, setValueMode] = useState<'exact' | 'integers'>('exact');

  // Defer the viewport for the heavy table recompute so dragging stays smooth.
  const deferredViewport = useDeferredValue(viewport);
  const ep = DEFAULT_FLUID_ENDPOINTS[density];
  const bp = resolveBreakpointRange(deferredViewport);

  const base = useMemo(() => {
    if (mode === 'fluid') {
      return interpolateValue(deferredViewport, MIN_VIEWPORT, MAX_VIEWPORT, ep.mobileBase, ep.desktopBase);
    }
    return staticBaseForBreakpoint(bp, ep);
  }, [mode, deferredViewport, ep, bp]);

  // Shape rows: f-step → dimension multiplier → resolved px value + shape token.
  const rows = useMemo(
    () =>
      SHAPE_ORDER.map(({ fStep, shape }) => {
        const token = fStepToDimensionStep(fStep);
        const multiplier = DIMENSION_TOKEN_MULTIPLIERS[token];
        const value = round2(base * multiplier);
        return { fStep, shape, multiplier, value, cssToken: `--Shape-${shape}` };
      }),
    [base],
  );

  const fmt = useCallback(
    (v: number) => (valueMode === 'integers' ? String(Math.round(v)) : String(round2(v))),
    [valueMode],
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Shapes</h1>
        <p className={styles.description}>
          Shape tokens derive from the dimension f-step scale, responding automatically to platform and density changes.
        </p>
      </div>

      <div className={styles.content}>
        <div className={shapeStyles.previewRoot}>
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
            readouts={[
              { label: 'Base size', value: `${round2(base)} px` },
              { label: 'Active breakpoint', value: `Breakpoint ${bp}` },
            ]}
          />

          {/* ── Specs table ─────────────────────────────────────────── */}
          <section className={shapeStyles.specsSection}>
            <div className={shapeStyles.specsHead}>
              <h2 className={shapeStyles.specsTitle}>Specs</h2>
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

            <div className={shapeStyles.tableScroller}>
              <table className={shapeStyles.specTable}>
                <thead>
                  <tr>
                    <th className={shapeStyles.colStep}>Step</th>
                    <th className={shapeStyles.colMult}>Multiplier</th>
                    <th className={shapeStyles.colValue}>Value</th>
                    <th className={shapeStyles.colToken}>Token</th>
                    <th className={shapeStyles.colPreview}>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.shape}>
                      <td className={shapeStyles.stepCell}>{row.fStep}</td>
                      <td className={shapeStyles.multCell}>×{row.multiplier}</td>
                      <td className={shapeStyles.valueCell}>{fmt(row.value)}</td>
                      <td className={shapeStyles.tokenCell}>
                        <code>{row.cssToken}</code>
                      </td>
                      <td>
                        <span
                          className={shapeStyles.preview}
                          style={{ borderRadius: `${row.value}px` }}
                        />
                      </td>
                    </tr>
                  ))}

                  {/* Standalone constant — not part of the numeric scale. */}
                  <tr>
                    <td className={shapeStyles.stepCell} />
                    <td className={shapeStyles.multCell} />
                    <td className={shapeStyles.valueCell}>9999</td>
                    <td className={shapeStyles.tokenCell}>
                      <code>--Shape-Pill</code>
                    </td>
                    <td>
                      <span className={shapeStyles.preview} style={{ borderRadius: 'var(--Shape-Pill)' }} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
