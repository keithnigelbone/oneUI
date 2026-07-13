/**
 * buildNativeMotion.ts
 *
 * Pure builder: Convex `motionConfigs` (or Jio defaults) → numeric RN motion
 * bundle aligned with `computeMotionScale` / `primitives.css` / web CSS injection.
 */

import {
  computeMotionScale,
  getDefaultMotionFoundationConfig,
  parseCubicBezier,
  type MotionEasings,
  type MotionFoundationConfig,
} from '../utils/motion';

/** One easing curve: CSS string + optional cubic control points for `Easing.bezier`. */
export interface EasingCurveResolved {
  css: string;
  /** `null` for `linear` — use `Easing.linear` on RN. */
  bezier: [number, number, number, number] | null;
}

export interface ResolvedNativeMotionEasings {
  entrance: { moderate: EasingCurveResolved; subtle: EasingCurveResolved };
  exit: { moderate: EasingCurveResolved; subtle: EasingCurveResolved };
  transition: { moderate: EasingCurveResolved; subtle: EasingCurveResolved };
  bounce: { moderate: EasingCurveResolved; subtle: EasingCurveResolved };
  linear: EasingCurveResolved;
}

/** Spring tuning consumed by `Animated.spring` (RN-only; not in CSS tokens). */
export interface SpringTuning {
  speed: number;
  bounciness: number;
}

export interface TapScaleTokens {
  xs: number;
  default: number;
  fullWidth: number;
}

export interface SpinnerMotion {
  rotationMs: number;
}

/** Motion translate distances — mirrors `primitives.css` `--Motion-Distance-*` (px). */
export interface MotionDistances {
  micro: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

/**
 * Complete resolved motion for React Native. Attach to `OneUINativeTheme.motion`
 * and expose via `useMotion()`.
 */
export interface ResolvedNativeMotion {
  duration: ReturnType<typeof computeMotionScale>['duration'];
  offset: ReturnType<typeof computeMotionScale>['offset'];
  distances: MotionDistances;
  easings: ResolvedNativeMotionEasings;
  tapScale: TapScaleTokens;
  spring: {
    pressIn: SpringTuning;
    pressOut: SpringTuning;
  };
  spinner: SpinnerMotion;
}

/** Slim input matching Convex `motionConfigs` row (no interactionPatterns). */
export type NativeMotionConfigInput = Pick<MotionFoundationConfig, 'baseDuration' | 'easings'> | null;

function resolveEasingCurve(css: string): EasingCurveResolved {
  const trimmed = css.trim();
  if (trimmed === 'linear') {
    return { css: 'linear', bezier: null };
  }
  const bezier = parseCubicBezier(trimmed);
  return { css: trimmed, bezier };
}

function mapEasings(e: MotionEasings): ResolvedNativeMotionEasings {
  return {
    entrance: {
      moderate: resolveEasingCurve(e.entrance.moderate),
      subtle: resolveEasingCurve(e.entrance.subtle),
    },
    exit: {
      moderate: resolveEasingCurve(e.exit.moderate),
      subtle: resolveEasingCurve(e.exit.subtle),
    },
    transition: {
      moderate: resolveEasingCurve(e.transition.moderate),
      subtle: resolveEasingCurve(e.transition.subtle),
    },
    bounce: {
      moderate: resolveEasingCurve(e.bounce.moderate),
      subtle: resolveEasingCurve(e.bounce.subtle),
    },
    linear: resolveEasingCurve(e.linear),
  };
}

// INTENTIONAL-LITERAL: `packages/tokens/src/css/primitives.css` `--Motion-Distance-*`
const PRIMITIVE_DISTANCES: MotionDistances = {
  micro: 1,
  small: 4,
  medium: 8,
  large: 16,
  xlarge: 100,
};

// INTENTIONAL-LITERAL: matches web `--Motion-Tap-Scale-*` semantic defaults.
const DEFAULT_TAP_SCALE: TapScaleTokens = {
  xs: 0.93,
  default: 0.97,
  fullWidth: 1,
};

const DEFAULT_SPRING: ResolvedNativeMotion['spring'] = {
  pressIn: { speed: 30, bounciness: 0 },
  pressOut: { speed: 20, bounciness: 4 },
};

// INTENTIONAL-LITERAL: web `@keyframes circular-progress 1.5s linear` (Spinner).
const DEFAULT_SPINNER: SpinnerMotion = {
  rotationMs: 1500,
};

/**
 * Build the native motion bundle. Pass `null` to use Jio defaults from
 * `getDefaultMotionFoundationConfig()` (same as web static primitives fallbacks).
 */
export function buildNativeMotion(config: NativeMotionConfigInput): ResolvedNativeMotion {
  const defaults = getDefaultMotionFoundationConfig();
  const full: MotionFoundationConfig =
    config == null
      ? defaults
      : {
          ...defaults,
          baseDuration: config.baseDuration ?? defaults.baseDuration,
          easings: {
            ...defaults.easings,
            ...config.easings,
            entrance: {
              ...defaults.easings.entrance,
              ...config.easings?.entrance,
            },
            exit: { ...defaults.easings.exit, ...config.easings?.exit },
            transition: {
              ...defaults.easings.transition,
              ...config.easings?.transition,
            },
            bounce: { ...defaults.easings.bounce, ...config.easings?.bounce },
            linear: config.easings?.linear ?? defaults.easings.linear,
          },
        };
  const scale = computeMotionScale(full.baseDuration, full.easings);
  return {
    duration: scale.duration,
    offset: scale.offset,
    distances: { ...PRIMITIVE_DISTANCES },
    easings: mapEasings(scale.easings),
    tapScale: { ...DEFAULT_TAP_SCALE },
    spring: { ...DEFAULT_SPRING },
    spinner: { ...DEFAULT_SPINNER },
  };
}
