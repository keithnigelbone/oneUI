/**
 * MotionContext.tsx
 *
 * Native motion bundle: resolved on the server/engine side as
 * `OneUINativeTheme.motion` (`buildNativeTheme` → `buildNativeMotion`) and
 * exposed here via `useMotion()`. Optional `motionOverrides` on
 * `<OneUINativeThemeProvider>` shallow-merges on top (Storybook / QA).
 *
 * When `theme` is null (loading), `MotionProvider` falls back to
 * `buildNativeMotion(null)` Jio defaults — same as web static primitives.
 */

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  buildNativeMotion,
  type ResolvedNativeMotion,
  type ResolvedNativeMotionEasings,
  type EasingCurveResolved,
} from '@oneui/shared/engine';

/** Spring tuning consumed by `Animated.spring`. */
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

/** Public alias — identical to `ResolvedNativeMotion` from `@oneui/shared/engine`. */
export type NativeMotion = ResolvedNativeMotion;

const DEFAULT_MOTION_FALLBACK = buildNativeMotion(null);

/** Jio defaults — same as `buildNativeMotion(null)` / loading `MotionProvider` branch. */
export const DEFAULT_MOTION = DEFAULT_MOTION_FALLBACK;

const MotionContext = createContext<NativeMotion>(DEFAULT_MOTION_FALLBACK);

function mergeEasingPair(
  base: { moderate: EasingCurveResolved; subtle: EasingCurveResolved },
  over?: Partial<{ moderate?: EasingCurveResolved; subtle?: EasingCurveResolved }>,
): { moderate: EasingCurveResolved; subtle: EasingCurveResolved } {
  if (!over) return base;
  return {
    moderate: over.moderate ?? base.moderate,
    subtle: over.subtle ?? base.subtle,
  };
}

function mergeEasings(
  base: ResolvedNativeMotionEasings,
  over?: Partial<ResolvedNativeMotionEasings>,
): ResolvedNativeMotionEasings {
  if (!over) return base;
  return {
    entrance: mergeEasingPair(base.entrance, over.entrance),
    exit: mergeEasingPair(base.exit, over.exit),
    transition: mergeEasingPair(base.transition, over.transition),
    bounce: mergeEasingPair(base.bounce, over.bounce),
    linear: over.linear ?? base.linear,
  };
}

function mergeResolvedMotion(
  base: ResolvedNativeMotion,
  o?: MotionOverrides,
): ResolvedNativeMotion {
  if (!o) return base;
  return {
    duration: {
      moderate: { ...base.duration.moderate, ...o.duration?.moderate },
      subtle: { ...base.duration.subtle, ...o.duration?.subtle },
    },
    offset: {
      moderate: { ...base.offset.moderate, ...o.offset?.moderate },
      subtle: { ...base.offset.subtle, ...o.offset?.subtle },
    },
    distances: { ...base.distances, ...o.distances },
    easings: mergeEasings(base.easings, o.easings),
    tapScale: { ...base.tapScale, ...o.tapScale },
    spring: {
      pressIn: { ...base.spring.pressIn, ...o.spring?.pressIn },
      pressOut: { ...base.spring.pressOut, ...o.spring?.pressOut },
    },
    spinner: { ...base.spinner, ...o.spinner },
  };
}

export interface MotionOverrides {
  duration?: {
    moderate?: Partial<ResolvedNativeMotion['duration']['moderate']>;
    subtle?: Partial<ResolvedNativeMotion['duration']['subtle']>;
  };
  offset?: {
    moderate?: Partial<ResolvedNativeMotion['offset']['moderate']>;
    subtle?: Partial<ResolvedNativeMotion['offset']['subtle']>;
  };
  distances?: Partial<ResolvedNativeMotion['distances']>;
  easings?: Partial<ResolvedNativeMotionEasings>;
  tapScale?: Partial<TapScaleTokens>;
  spring?: Partial<{
    pressIn?: Partial<SpringTuning>;
    pressOut?: Partial<SpringTuning>;
  }>;
  spinner?: Partial<SpinnerMotion>;
}

export interface MotionProviderProps {
  /**
   * Resolved motion from `OneUINativeTheme.motion`. Pass `null` while the
   * theme is loading — Jio defaults from `buildNativeMotion(null)` apply.
   */
  baseMotion: ResolvedNativeMotion | null;
  overrides?: MotionOverrides;
  children: ReactNode;
}

export function MotionProvider({
  baseMotion,
  overrides,
  children,
}: MotionProviderProps): React.ReactElement {
  const value = useMemo(
    () => mergeResolvedMotion(baseMotion ?? DEFAULT_MOTION_FALLBACK, overrides),
    [baseMotion, overrides],
  );
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): NativeMotion {
  return useContext(MotionContext);
}
