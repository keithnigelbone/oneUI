/**
 * Spinner interface (native)
 */

import type { ViewStyle } from 'react-native';

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
  size?: SpinnerSize;
  label?: string;
  style?: ViewStyle;
  testID?: string;
}

export const SPINNER_SVG_STROKE_MAP: Record<SpinnerSize, number> = {
  '2XS': 25,
  XS: 16.67,
  S: 18.75,
  M: 15,
  L: 16.67,
  XL: 12.5,
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
  dataAttrs: Record<string, string | undefined>;
}

export function useSpinnerGeometry(size: SpinnerSize): SpinnerGeometry {
  const strokeWidth = SPINNER_SVG_STROKE_MAP[size];
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

/**
 * Indeterminate loading indicator.
 * Uses `progressbar` + `busy` (RN) rather than APG `status` — both convey
 * ongoing activity; `accessibilityLiveRegion` announces label updates.
 */
export function getSpinnerAccessibilityProps(
  props: Pick<SpinnerProps, 'label'>,
): {
  accessible: true;
  accessibilityRole: 'progressbar';
  accessibilityLabel?: string;
  accessibilityState: { busy: true };
  accessibilityLiveRegion: 'polite';
  'aria-busy': true;
} {
  return {
    accessible: true,
    accessibilityRole: 'progressbar',
    accessibilityLabel: props.label,
    accessibilityState: { busy: true },
    accessibilityLiveRegion: 'polite',
    'aria-busy': true,
  };
}

export const SPINNER_RING_A11Y = {
  'aria-hidden': true as const,
};
