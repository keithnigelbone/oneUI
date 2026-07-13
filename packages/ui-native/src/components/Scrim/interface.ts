/**
 * Scrim interface (native)
 *
 * Native-only — no web peer. Spec: `./scrim.md` (Layers jdsScrim parity).
 */

import type { ViewStyle } from 'react-native';

export type ScrimAttention = 'low' | 'medium' | 'high';
export type ScrimSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'full';
export type ScrimPosition = 'top' | 'bottom' | 'start' | 'end' | 'center';
export type ScrimVariant = 'gradient' | 'overlay';
export type ScrimTone = 'light' | 'dark';

export interface ScrimProps {
  /** Fade strength. Default: `'medium'`. */
  attention?: ScrimAttention;
  /** Band coverage within the parent. Default: `'XS'`. */
  size?: ScrimSize;
  /** Edge the fade anchors to. Default: `'bottom'`. */
  position?: ScrimPosition;
  /** `gradient` edge fade or `overlay` flat tint. Default: `'gradient'`. */
  variant?: ScrimVariant;
  /** Inline styles on the root container. */
  style?: ViewStyle;
  testID?: string;
}

export const SCRIM_A11Y = {
  accessible: false as const,
  'aria-hidden': true as const,
  importantForAccessibility: 'no-hide-descendants' as const,
};

export function getScrimAccessibilityProps(): typeof SCRIM_A11Y {
  return SCRIM_A11Y;
}

/** Layers dark-mode flip — light scrim on dark surfaces stays visible. */
export function resolveScrimTone(darkMode: boolean): ScrimTone {
  return darkMode ? 'light' : 'dark';
}

/**
 * Full-area flat scrim — uniform opacity tint (no edge gradient).
 * Triggers: `center`, `size="full"`, or `variant="overlay"` (any combination).
 */
export function isScrimFullCoverageMode(
  position: ScrimPosition,
  size: ScrimSize,
  variant: ScrimVariant,
): boolean {
  return position === 'center' || size === 'full' || variant === 'overlay';
}

export interface ScrimLayoutState {
  isHorizontal: boolean;
  showZone1: boolean;
  showZone2: boolean;
  zoneFlex: number;
  bandFlex: number;
  gradientDirection: {
    x1: string;
    y1: string;
    x2: string;
    y2: string;
  };
  rootAlign: Pick<ViewStyle, 'justifyContent' | 'alignItems' | 'flexDirection'>;
}

const SIZE_FLEX: Record<ScrimSize, { zone: number; band: number }> = {
  XS: { zone: 9, band: 1 },
  S: { zone: 8, band: 2 },
  M: { zone: 6, band: 4 },
  L: { zone: 4, band: 6 },
  XL: { zone: 2, band: 8 },
  full: { zone: 0, band: 1 },
};

const GRADIENT_DIRECTION: Record<
  ScrimPosition,
  ScrimLayoutState['gradientDirection']
> = {
  top: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
  bottom: { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
  start: { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
  end: { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
  center: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
};

export function resolveScrimLayout(
  position: ScrimPosition,
  size: ScrimSize,
  variant: ScrimVariant,
): ScrimLayoutState {
  const isHorizontal = position === 'start' || position === 'end';
  const metrics = SIZE_FLEX[size];
  const fullCoverageMode = isScrimFullCoverageMode(position, size, variant);

  let showZone1 = true;
  let showZone2 = true;

  if (fullCoverageMode) {
    showZone1 = false;
    showZone2 = false;
  } else if (position === 'top') {
    showZone1 = false;
  } else if (position === 'bottom') {
    showZone2 = false;
  } else if (position === 'start') {
    // Mirror `top`: band anchors to the leading edge (left in LTR).
    showZone1 = false;
  } else if (position === 'end') {
    // Mirror `bottom`: band anchors to the trailing edge (right in LTR).
    showZone2 = false;
  }

  const rootAlign: ScrimLayoutState['rootAlign'] = isHorizontal
    ? {
        flexDirection: 'row',
        justifyContent:
          position === 'end' ? 'flex-end' : position === 'start' ? 'flex-start' : 'center',
        alignItems: 'stretch',
      }
    : {
        flexDirection: 'column',
        justifyContent:
          position === 'bottom'
            ? 'flex-end'
            : position === 'top'
              ? 'flex-start'
              : 'center',
        alignItems: 'stretch',
      };

  return {
    isHorizontal,
    showZone1,
    showZone2,
    zoneFlex: metrics.zone,
    bandFlex: fullCoverageMode ? 1 : metrics.band,
    gradientDirection: GRADIENT_DIRECTION[position],
    rootAlign,
  };
}

export function useScrimState(props: ScrimProps): {
  attention: ScrimAttention;
  size: ScrimSize;
  position: ScrimPosition;
  variant: ScrimVariant;
  layout: ScrimLayoutState;
} {
  const attention = props.attention ?? 'medium';
  const size = props.size ?? 'XS';
  const position = props.position ?? 'bottom';
  const variant = props.variant ?? 'gradient';

  return {
    attention,
    size,
    position,
    variant,
    layout: resolveScrimLayout(position, size, variant),
  };
}
