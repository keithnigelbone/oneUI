/**
 * SurfaceValidationTable.tsx
 *
 * Port of OneUIColourTool/packages/web-tool/src/components/SurfacesPage.tsx.
 * Renders a 25-step × role grid cross-checking surface resolution against the
 * reference. Used by foundations/surfaces as a Validation tab so designers can
 * spot-check that our engine's output matches the canonical algorithm.
 *
 * Intentional departures from the rest of foundations:
 * - Raw `style={{ backgroundColor }}` on swatches — resolved steps are being
 *   inspected, not themed surfaces. Every other value uses design tokens.
 * - 25 columns per row — this is a diagnostic grid, not a user-facing surface.
 */

'use client';

import { useMemo, useState } from 'react';
import {
  contrastDir,
  textOnBg,
  resolveSurface,
  resolveContent,
  resolveFocusRing,
  resolveInteractionOverlay,
  hexToRgbTuple,
  preParseRGBPalette,
  type SurfaceToken,
  type ContentToken,
  type ScaleDefinition,
  type InteractionState,
} from '@oneui/shared/engine';
import styles from './SurfaceValidationTable.module.css';

// ============================================================================
// Constants
// ============================================================================

const SURFACE_ROWS: SurfaceToken[] = [
  'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
];
const CONTENT_ROWS: ContentToken[] = [
  'high', 'medium', 'low', 'tinted', 'tintedA11y', 'strokeMedium', 'strokeLow',
];
const FOCUS_DEMO_SURFACES: SurfaceToken[] = ['ghost', 'subtle', 'bold', 'blend'];
const COLUMN_STEPS: number[] = Array.from({ length: 25 }, (_, i) => 2500 - i * 100);

const INTERACTION_STATES: InteractionState[] = ['idle', 'hover', 'pressed'];

// ============================================================================
// Props
// ============================================================================

export interface SurfaceValidationTableProps {
  /** Named scale definitions to choose from (one per appearance role). */
  scales: ReadonlyArray<{ name: string; scale: ScaleDefinition }>;
  /** Informative scale — drives focus ring resolution. */
  informativeScale: ScaleDefinition;
  /** Light/dark toggle — flips the `default` surface resolution. */
  darkMode: boolean;
  /** Initial scale selection. Defaults to 'primary' if present, else first. */
  initialScaleName?: string;
}

// ============================================================================
// Component
// ============================================================================

export function SurfaceValidationTable({
  scales,
  informativeScale,
  darkMode,
  initialScaleName,
}: SurfaceValidationTableProps) {
  const defaultName =
    initialScaleName && scales.some(s => s.name === initialScaleName)
      ? initialScaleName
      : scales.find(s => s.name.toLowerCase() === 'primary')?.name ?? scales[0]?.name ?? '';

  const [selectedScaleName, setSelectedScaleName] = useState(defaultName);

  const active = scales.find(s => s.name === selectedScaleName) ?? scales[0];

  if (!active) {
    return null;
  }

  return (
    <ValidationTableBody
      scaleEntry={active}
      scales={scales}
      informativeScale={informativeScale}
      darkMode={darkMode}
      selectedScaleName={selectedScaleName}
      onSelectScale={setSelectedScaleName}
    />
  );
}

interface TableBodyProps {
  scaleEntry: { name: string; scale: ScaleDefinition };
  scales: SurfaceValidationTableProps['scales'];
  informativeScale: ScaleDefinition;
  darkMode: boolean;
  selectedScaleName: string;
  onSelectScale: (name: string) => void;
}

function ValidationTableBody({
  scaleEntry,
  scales,
  informativeScale,
  darkMode,
  selectedScaleName,
  onSelectScale,
}: TableBodyProps) {
  const { scale } = scaleEntry;
  const palette = scale.palette;

  const rgbPalette = useMemo(() => preParseRGBPalette(palette), [palette]);

  // INTENTIONAL-LITERAL: palette-step hex fallbacks for color-math (WCAG contrast computation), not styling
  const step200Hex = palette[200] ?? '#000000';
  const step2500Hex = palette[2500] ?? '#ffffff';
  const dot600 = palette[600] ?? palette[scale.baseStep] ?? '#808080';

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.selectWrap}>
          <span className={styles.selectDot} style={{ backgroundColor: dot600 }} />
          <select
            className={styles.select}
            value={selectedScaleName}
            onChange={e => onSelectScale(e.target.value)}
          >
            {scales.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <span className={styles.baseInfo}>
          base: {scale.baseStep}&nbsp;&nbsp;/&nbsp;&nbsp;baseDark: {scale.darkerBaseStep}
        </span>
      </div>

      <div className={styles.outer}>
        <div className={styles.labels}>
          <div className={styles.colHead} />
          <div className={`${styles.colBody} ${styles.colBodyPlain}`}>
            <div className={`${styles.row} ${styles.rowSection}`}>surface</div>
            {SURFACE_ROWS.map(r => (
              <div key={r} className={`${styles.row} ${styles.rowName}`}>{r}</div>
            ))}
            <div className={`${styles.row} ${styles.rowSection}`}>content (on parent)</div>
            {CONTENT_ROWS.map(r => (
              <div key={r} className={`${styles.row} ${styles.rowName}`}>{r}</div>
            ))}
            <div className={`${styles.row} ${styles.rowSection}`}>on bold</div>
            {CONTENT_ROWS.map(r => (
              <div key={`b-${r}`} className={`${styles.row} ${styles.rowName}`}>{r}</div>
            ))}
            <div className={`${styles.row} ${styles.rowSection}`}>on subtle</div>
            {CONTENT_ROWS.map(r => (
              <div key={`s-${r}`} className={`${styles.row} ${styles.rowName}`}>{r}</div>
            ))}
            <div className={`${styles.row} ${styles.rowSection}`}>interaction</div>
            {SURFACE_ROWS.map(r => (
              <div key={`i-${r}`} className={`${styles.row} ${styles.rowName}`}>{r}</div>
            ))}
            <div className={`${styles.row} ${styles.rowSection}`}>focus</div>
            {FOCUS_DEMO_SURFACES.map(r => (
              <div key={`fd-${r}`} className={`${styles.row} ${styles.rowName}`}>focus ({r})</div>
            ))}
          </div>
        </div>

        <div className={styles.scroll}>
          <div className={styles.table}>
            {COLUMN_STEPS.map(parentStep => (
              <StepColumn
                key={parentStep}
                parentStep={parentStep}
                scale={scale}
                palette={palette}
                rgbPalette={rgbPalette}
                step200Hex={step200Hex}
                step2500Hex={step2500Hex}
                darkMode={darkMode}
                informativeScale={informativeScale}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// StepColumn
// ============================================================================

interface StepColumnProps {
  parentStep: number;
  scale: ScaleDefinition;
  palette: Record<number, string>;
  rgbPalette: ReturnType<typeof preParseRGBPalette>;
  step200Hex: string;
  step2500Hex: string;
  darkMode: boolean;
  informativeScale: ScaleDefinition;
}

function StepColumn({
  parentStep,
  scale,
  palette,
  rgbPalette,
  step200Hex,
  step2500Hex,
  darkMode,
  informativeScale,
}: StepColumnProps) {
  // INTENTIONAL-LITERAL: hex/rgba fallbacks for color-math (WCAG contrast + on-colour overlays), not styling tokens
  const colBg = palette[parentStep] ?? '#808080';
  const dir = contrastDir(colBg, step2500Hex, step200Hex);
  const parentRgb = rgbPalette[parentStep] ?? hexToRgbTuple(colBg);
  const isDarkCol = dir === 1; // dir=1 means lighter has higher contrast → column is dark
  const onCol = isDarkCol ? 'rgba(255,255,255,0.7)' : 'rgba(12,13,16,0.57)';

  const informativePalette = preParseRGBPalette(informativeScale.palette);

  return (
    <div className={styles.col}>
      <div className={styles.colHead}>
        <span className={styles.stepNum}>{parentStep}</span>
      </div>
      <div className={styles.colBody} style={{ backgroundColor: colBg }}>
        <div className={styles.spacer} />

        {/* Surface section */}
        {SURFACE_ROWS.map(token => {
          // INTENTIONAL-LITERAL: hex/rgba fallbacks for swatch rendering + dark-mode hairline overlay, not styling tokens
          const resolvedStep = resolveSurface(token, parentStep, scale, dir, darkMode);
          const swatchBg = palette[resolvedStep] ?? '#808080';
          const textColor = textOnBg(swatchBg);
          const isGhost = token === 'ghost';
          const needsBorder = token === 'default' || token === 'ghost';
          const border = needsBorder
            ? isDarkCol
              ? 'inset 0 0 0 1px rgba(255,255,255,0.2)'
              : 'inset 0 0 0 1px rgba(0,0,0,0.1)'
            : undefined;

          return (
            <div
              key={token}
              className={styles.swatch}
              style={{
                backgroundColor: isGhost ? 'transparent' : swatchBg,
                boxShadow: border,
                color: isGhost ? onCol : textColor,
              }}
            >
              <span className={styles.swatchText}>
                {resolvedStep}{isGhost ? ' 0%' : ''}
              </span>
            </div>
          );
        })}

        <div className={styles.spacer} />

        {/* Content section (on parent) */}
        {CONTENT_ROWS.map(token => {
          const { step, opacity } = resolveContent(
            token, parentStep, parentRgb, scale, rgbPalette, dir,
          );
          // INTENTIONAL-LITERAL: hex fallback for content-dot rendering, not a styling token
          const dotColor = palette[step] ?? '#808080';
          const opacityPct = Math.round(opacity * 100);

          return (
            <div key={token} className={styles.contentCell}>
              <div className={styles.contentLeft}>
                <span className={styles.contentStep} style={{ color: onCol }}>{step}</span>
                {opacityPct < 100 && (
                  <span className={styles.contentOpacity} style={{ color: onCol }}>
                    {opacityPct}%
                  </span>
                )}
              </div>
              <div
                className={styles.contentDot}
                style={{ backgroundColor: dotColor, opacity }}
              />
            </div>
          );
        })}

        <div className={styles.spacer} />

        {/* On-bold content — resolved against the role's own bold fill step.
            This is what the Avatar HIGH, Button bold, Chip bold etc. read. */}
        {(() => {
          const boldStep = resolveSurface('bold', parentStep, scale, dir, darkMode);
          const boldSwatchBg = palette[boldStep] ?? '#808080';
          const boldRgb = rgbPalette[boldStep] ?? hexToRgbTuple(boldSwatchBg);
          const boldDir = contrastDir(boldSwatchBg, step2500Hex, step200Hex);
          return CONTENT_ROWS.map(token => {
            const { step, opacity } = resolveContent(
              token, boldStep, boldRgb, scale, rgbPalette, boldDir,
            );
            const dotColor = palette[step] ?? '#808080';
            const opacityPct = Math.round(opacity * 100);
            return (
              <div key={`b-${token}`} className={styles.contentCell} style={{ backgroundColor: boldSwatchBg, borderRadius: 'var(--Shape-3-5)', paddingLeft: 'var(--Spacing-2-5)' }}>
                <div className={styles.contentLeft}>
                  <span className={styles.contentStep} style={{ color: textOnBg(boldSwatchBg) }}>{step}</span>
                  {opacityPct < 100 && (
                    <span className={styles.contentOpacity} style={{ color: textOnBg(boldSwatchBg) }}>
                      {opacityPct}%
                    </span>
                  )}
                </div>
                <div
                  className={styles.contentDot}
                  style={{ backgroundColor: dotColor, opacity }}
                />
              </div>
            );
          });
        })()}

        <div className={styles.spacer} />

        {/* On-subtle content — resolved against the role's own subtle fill step.
            This is what components read when sitting on a subtle fill. */}
        {(() => {
          // INTENTIONAL-LITERAL: hex fallbacks for color-math (subtle-surface content resolution), not styling
          const subtleStep = resolveSurface('subtle', parentStep, scale, dir, darkMode);
          const subtleSwatchBg = palette[subtleStep] ?? '#808080';
          const subtleRgb = rgbPalette[subtleStep] ?? hexToRgbTuple(subtleSwatchBg);
          const subtleDir = contrastDir(subtleSwatchBg, step2500Hex, step200Hex);
          return CONTENT_ROWS.map(token => {
            const { step, opacity } = resolveContent(
              token, subtleStep, subtleRgb, scale, rgbPalette, subtleDir,
            );
            const dotColor = palette[step] ?? '#808080';
            const opacityPct = Math.round(opacity * 100);
            return (
              <div key={`s-${token}`} className={styles.contentCell} style={{ backgroundColor: subtleSwatchBg, borderRadius: 'var(--Shape-3-5)', paddingLeft: 'var(--Spacing-2-5)' }}>
                <div className={styles.contentLeft}>
                  <span className={styles.contentStep} style={{ color: textOnBg(subtleSwatchBg) }}>{step}</span>
                  {opacityPct < 100 && (
                    <span className={styles.contentOpacity} style={{ color: textOnBg(subtleSwatchBg) }}>
                      {opacityPct}%
                    </span>
                  )}
                </div>
                <div
                  className={styles.contentDot}
                  style={{ backgroundColor: dotColor, opacity }}
                />
              </div>
            );
          });
        })()}

        <div className={styles.spacer} />

        {/* Interaction section */}
        {SURFACE_ROWS.map(token => {
          const surfaceStep = resolveSurface(token, parentStep, scale, dir, darkMode);
          return (
            <div key={`i-${token}`} className={styles.pillWrap}>
              <div className={styles.pill}>
                {INTERACTION_STATES.map(state => {
                  const overlay = resolveInteractionOverlay(state, surfaceStep, token, dir);
                  // INTENTIONAL-LITERAL: hex fallback for interaction-state swatch rendering, not a styling token
                  return (
                    <div
                      key={state}
                      className={styles.pillSeg}
                      style={{ backgroundColor: palette[overlay.step] ?? '#808080', opacity: overlay.opacity }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className={styles.spacer} />

        {/* Focus section */}
        {FOCUS_DEMO_SURFACES.map(token => {
          // INTENTIONAL-LITERAL: hex fallbacks for focus-ring color-math (palette → swatch resolution), not styling tokens
          const surfaceStep = resolveSurface(token, parentStep, scale, dir, darkMode);
          const surfaceBg = palette[surfaceStep] ?? '#808080';
          const offset = resolveFocusRing('focusRingOffset', parentStep, parentRgb, informativeScale, dir);
          const offsetBg = palette[offset.step] ?? '#808080';
          const ring = resolveFocusRing('focusRing', parentStep, parentRgb, informativeScale, dir);
          const ringBg = informativeScale.palette[ring.step] ?? '#0066ff';
          // Keep informativePalette referenced so the cache isn't thrown away.
          void informativePalette;

          return (
            <div key={`fd-${token}`} className={styles.pillWrap}>
              <div
                className={styles.focusPill}
                style={{
                  backgroundColor: surfaceBg,
                  boxShadow: `0 0 0 2px ${offsetBg}, 0 0 0 4px ${ringBg}`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
