/**
 * FoundationTiles.tsx
 *
 * Compact preview tiles for the brand overview's Foundation Selections rows.
 * Each tile renders from data already available client-side: the live brand
 * CSS vars (shape language, elevation fallbacks) or the foundation configs in
 * useFoundationData() — zero additional queries.
 */

'use client';

import React from 'react';
import {
  elevationLevelToBoxShadow,
  normalizeMetallicConfig,
  type ElevationFoundationConfig,
} from '@oneui/shared/engine';
import { generateElevationLevel } from '@oneui/shared';
import styles from './FoundationTiles.module.css';

// ---------------------------------------------------------------------------
// Shape — live shape-language swatches (Actions / Cards / Inputs)
// ---------------------------------------------------------------------------

const SHAPE_SAMPLES = [
  { label: 'Actions', radius: 'var(--Button-borderRadius, var(--Shape-Pill))' },
  { label: 'Cards', radius: 'var(--Card-borderRadius, var(--Shape-0))' },
  { label: 'Inputs', radius: 'var(--InputField-borderRadius, var(--Shape-2))' },
] as const;

export function ShapeLanguagePreview() {
  return (
    <span className={styles.tileRow} aria-hidden="true">
      {SHAPE_SAMPLES.map((sample) => (
        <span
          key={sample.label}
          className={styles.shapeSwatch}
          style={{ borderRadius: sample.radius }}
          title={sample.label}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Elevation — three sample tiles at levels 1 / 3 / 5
// ---------------------------------------------------------------------------

// Levels 1-3 keep the shadows readable at swatch size; 4-5 spread wider
// than the tile itself and read as clipped artifacts in a tight row.
const ELEVATION_SAMPLE_LEVELS = [1, 2, 3] as const;

export function ElevationPreview({
  config,
  isDarkMode,
}: {
  config: ElevationFoundationConfig | null | undefined;
  isDarkMode: boolean;
}) {
  return (
    <span className={styles.tileRow} aria-hidden="true">
      {ELEVATION_SAMPLE_LEVELS.map((level) => (
        <span
          key={level}
          className={styles.elevationSwatch}
          style={{
            boxShadow: config
              ? elevationLevelToBoxShadow(
                  generateElevationLevel(level, isDarkMode ? 'high' : 'low'),
                  {
                    isDarkMode,
                    baseOpacity: config.baseOpacity,
                    darkModeMultiplier: config.darkModeMultiplier,
                  },
                )
              : `var(--Elevation-${level})`,
          }}
          title={`Level ${level}`}
        />
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Motion — easing curve + base duration
// ---------------------------------------------------------------------------

interface MotionConfigLike {
  baseDuration?: number;
  easings?: { transition?: { moderate?: string } };
}

function parseCubicBezier(easing: string | undefined): [number, number, number, number] | null {
  if (!easing) return null;
  const match = /cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/.exec(
    easing,
  );
  if (!match) return null;
  const [, x1, y1, x2, y2] = match;
  return [Number(x1), Number(y1), Number(x2), Number(y2)];
}

export function MotionPreview({ config }: { config: MotionConfigLike | null | undefined }) {
  const bezier = parseCubicBezier(config?.easings?.transition?.moderate);
  // SVG viewBox is 32×24; map bezier (0..1, 0..1) to it with y flipped.
  const points = bezier ?? [0.4, 0, 0.2, 1];
  const [x1, y1, x2, y2] = points;
  const path = `M 0 24 C ${x1 * 32} ${24 - y1 * 24}, ${x2 * 32} ${24 - y2 * 24}, 32 0`;
  return (
    <span className={styles.tileRow}>
      <svg className={styles.motionCurve} viewBox="0 0 32 24" fill="none" aria-hidden="true">
        <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {config?.baseDuration != null && (
        <span className={styles.motionLabel}>{config.baseDuration}ms base</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Grid — column bars for the first configured platform
// ---------------------------------------------------------------------------

interface GridConfigLike {
  platforms?: Partial<Record<string, { columns?: number }>>;
}

export function GridPreview({ config }: { config: GridConfigLike | null | undefined }) {
  const firstPlatform = Object.values(config?.platforms ?? {}).find(
    (platform) => typeof platform?.columns === 'number',
  );
  const columns = firstPlatform?.columns ?? null;
  if (!columns) return null;
  return (
    <span className={styles.tileRow}>
      <span className={styles.gridBars} aria-hidden="true">
        {Array.from({ length: Math.min(columns, 12) }, (_, i) => (
          <span key={i} className={styles.gridBar} />
        ))}
      </span>
      <span className={styles.motionLabel}>{columns} columns</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Materials — metallic gradient swatches for active metals
// ---------------------------------------------------------------------------

interface MaterialsConfigLike {
  metallic?: unknown;
  activeMetals?: Partial<Record<string, boolean>>;
}

export function MaterialsPreview({ config }: { config: MaterialsConfigLike | null | undefined }) {
  if (!config) return null;
  const presets = normalizeMetallicConfig(config);
  const activeNames = Object.entries(config.activeMetals ?? {})
    .filter(([, active]) => active)
    .map(([name]) => name)
    .slice(0, 3);
  if (!activeNames.length) return null;
  return (
    <span className={styles.tileRow} aria-hidden="true">
      {activeNames.map((name) => {
        const preset = presets[name as keyof typeof presets];
        if (!preset) return null;
        const gradient = `linear-gradient(${preset.gradientAngle}deg, ${preset.shadow}, ${preset.baseDark}, ${preset.base}, ${preset.baseLight}, ${preset.highlight})`;
        return (
          <span
            key={name}
            className={styles.materialSwatch}
            style={{ background: gradient }}
            title={name}
          />
        );
      })}
    </span>
  );
}
