/**
 * Progress.native.tsx
 *
 * Native peer of `packages/ui/src/components/Progress/Progress.tsx`.
 *
 * Build-time-leaning pattern (same as Button / Spinner):
 *   - Static layout in `./Progress.styles.native.ts` (peer of `Progress.module.css`).
 *   - Dynamic paint from `useSurfaceTokens('primary')` as small inline overrides.
 *   - Indeterminate: `Animated` translate loop, `useReduceMotion` gate.
 *
 * Indeterminate **duration** uses `tokens.motion.duration.expressive.long` so it
 * tracks web's `--Motion-Duration-Expressive-Long` (500ms) from primitives — not
 * `useMotion().duration.moderate.*`, which follows the brand ladder from a
 * different base (~300ms L) and would visibly desync from web/CSS.
 *
 * **Easing** uses `useMotion().easings.transition.moderate` bezier when present
 * (peer to web `--Motion-Easing-Standard` / transition curve); falls back to
 * `Easing.inOut(Easing.ease)`.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View, type ViewStyle } from 'react-native';
import {
  getProgressAccessibilityProps,
  PROGRESS_INDICATOR_A11Y,
  useProgressState,
  type ProgressProps,
} from './interface';
import { tokens } from '@oneui/tokens';
import { useMotion, useReduceMotion, useSurfaceTokens } from '../../theme';
import {
  styles,
  SIZE_STYLE,
  INDETERMINATE_WIDTH_RATIO,
} from './Progress.styles.native';

export function Progress(props: ProgressProps): React.ReactElement {
  const { size = 'medium' } = props;
  const styleProp = (props as { style?: ViewStyle }).style;
  const { percentage, isIndeterminate } = useProgressState(props);
  const role = useSurfaceTokens('primary');
  const reduceMotion = useReduceMotion();
  const motion = useMotion();

  const indeterminateEasing = useMemo(() => {
    const b = motion.easings.transition.moderate.bezier;
    if (b != null && b.length === 4) {
      return Easing.bezier(b[0], b[1], b[2], b[3]);
    }
    return Easing.inOut(Easing.ease);
  }, [motion.easings.transition.moderate.bezier]);

  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isIndeterminate || reduceMotion) {
      translateX.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: tokens.motion.duration.expressive.long,
        easing: indeterminateEasing,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [isIndeterminate, reduceMotion, translateX, indeterminateEasing]);

  const trackStyle: ViewStyle = {
    backgroundColor: role.surfaces.subtle,
  };

  const determinateIndicatorStyle: ViewStyle = {
    width: `${percentage}%`,
    backgroundColor: role.surfaces.bold,
  };

  const indeterminateIndicatorStyle = {
    width: `${INDETERMINATE_WIDTH_RATIO * 100}%`,
    backgroundColor: role.surfaces.bold,
    transform: [
      {
        translateX: translateX.interpolate({
          inputRange: [0, 1],
          outputRange: [
            `-${(1 / INDETERMINATE_WIDTH_RATIO) * 100}%`,
            `${(2.5 / INDETERMINATE_WIDTH_RATIO) * 100}%`,
          ],
        }),
      },
    ],
  } as Animated.WithAnimatedObject<ViewStyle>;

  const progressA11y = getProgressAccessibilityProps(props, { isIndeterminate });

  return (
    <View
      {...progressA11y}
      role='progressbar'
      aria-label={progressA11y.accessibilityLabel}
      aria-labelledby={props['aria-labelledby']}
      aria-valuemin={progressA11y['aria-valuemin']}
      aria-valuemax={progressA11y['aria-valuemax']}
      aria-valuenow={progressA11y['aria-valuenow']}
      aria-busy={progressA11y['aria-busy']}
      style={[styles.track, SIZE_STYLE[size], trackStyle, styleProp]}
      testID={props.testID}
    >
      {isIndeterminate ? (
        <Animated.View
          {...PROGRESS_INDICATOR_A11Y}
          style={[styles.indicator, indeterminateIndicatorStyle]}
        />
      ) : (
        <View {...PROGRESS_INDICATOR_A11Y} style={[styles.indicator, determinateIndicatorStyle]} />
      )}
    </View>
  );
}

export type { ProgressProps, ProgressSize } from './interface';
