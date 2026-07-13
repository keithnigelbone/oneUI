/**
 * Spinner.shared.ts
 * Shared types and geometry for the Spinner component.
 *
 * Spinner is an indeterminate loader that always renders three distinct
 * role-colored full-circle strokes (primary + secondary + sparkle).
 * Each circle animates a draw→erase sweep around a full 360°, staggered
 * by 1/3 of a cycle so the colours chase each other and the ring always
 * completes. Sizes mirror the Figma spec (node 2314:1385): 10 t-shirt
 * sizes from 2XS (8px) through 5XL (64px).
 */

import type { CSSProperties } from 'react';

/** T-shirt size presets — match Figma spec exactly (10 sizes). */
export type SpinnerSize =
  | '2XS'
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL'
  | '3XL'
  | '4XL'
  | '5XL';

export interface SpinnerProps {
  /** Size preset — maps to spacing dimension tokens. Default: 'M' (20px). */
  size?: SpinnerSize;
  /**
   * Accessible label announced by screen readers. Default: 'Loading'.
   * The Spinner always renders with role="progressbar" aria-busy="true".
   */
  label?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * SVG stroke width in viewBox units per size.
 * ViewBox is a fixed 100×100. Ratio = strokePx / containerPx × 100.
 *
 * Figma spec (stroke / diameter):
 *  - 2XS  8px  → Stroke-XL  (2px) → 25.00
 *  - XS  12px  → Stroke-XL  (2px) → 16.67
 *  - S   16px  → Stroke-2XL (3px) → 18.75
 *  - M   20px  → Stroke-2XL (3px) → 15.00
 *  - L   24px  → Stroke-3XL (4px) → 16.67
 *  - XL  32px  → Stroke-3XL (4px) → 12.50
 *  - 2XL 40px  → Stroke-4XL (6px) → 15.00
 *  - 3XL 48px  → Stroke-4XL (6px) → 12.50
 *  - 4XL 56px  → Stroke-5XL (8px) → 14.29
 *  - 5XL 64px  → Stroke-5XL (8px) → 12.50
 */
export const SPINNER_SVG_STROKE_MAP: Record<SpinnerSize, number> = {
  '2XS': 25,
  'XS': 16.67,
  'S': 18.75,
  'M': 15,
  'L': 16.67,
  'XL': 12.5,
  '2XL': 15,
  '3XL': 12.5,
  '4XL': 14.29,
  '5XL': 12.5,
};

export const SPINNER_VIEWBOX = 100;
export const SPINNER_CENTER = SPINNER_VIEWBOX / 2;

export interface SpinnerGeometry {
  center: number;
  radius: number;
  strokeWidth: number;
  /** Data attributes for CSS selectors. */
  dataAttrs: Record<string, string | undefined>;
}

/** Compute stable SVG geometry for a given size. */
export function useSpinnerGeometry(size: SpinnerSize): SpinnerGeometry {
  const strokeWidth = SPINNER_SVG_STROKE_MAP[size];
  // Keep the stroke inside the viewBox: radius accounts for half a stroke
  // on each side of the circle's mathematical line.
  const radius = (SPINNER_VIEWBOX - strokeWidth) / 2;

  return {
    center: SPINNER_CENTER,
    radius,
    strokeWidth,
    dataAttrs: {
      'data-size': size,
    },
  };
}
