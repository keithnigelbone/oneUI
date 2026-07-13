/**
 * Spinner.native.tsx
 *
 * RN peer of `packages/ui/src/components/Spinner/Spinner.tsx`. Static
 * per-size geometry lives in `./Spinner.styles.native.ts`; the rotating
 * ring colour comes from `useSurfaceTokens('primary').content.tintedA11y`
 * and the animation uses `useMotion().spinner.rotationMs` with linear easing
 * (default 1500ms — matches web `@keyframes circular-progress`).
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, type ViewStyle } from 'react-native';
import { getSpinnerAccessibilityProps, SPINNER_RING_A11Y, useSpinnerGeometry, type SpinnerProps } from './interface';
import { tokens } from '@oneui/tokens';
import { useMotion, useReduceMotion, useSurfaceTokens } from '../../theme';
import { styles, OUTER_STYLE, SIZE_PX } from './Spinner.styles.native';

export function Spinner(props: SpinnerProps): React.ReactElement {
  const { size = 'M', label = 'Loading', style: styleProp } = props;
  const role = useSurfaceTokens('primary');
  const reduceMotion = useReduceMotion();
  const motion = useMotion();
  const rotationDuration = motion.spinner.rotationMs;
  const geom = useSpinnerGeometry(size);

  const diameter = SIZE_PX[size];
  const strokeWidth = Math.max(
    tokens.borderWidth.thin,
    Math.round((geom.strokeWidth / 100) * diameter),
  );

  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      rotation.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: rotationDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation, reduceMotion, rotationDuration]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ringStyle: ViewStyle = {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
    borderWidth: strokeWidth,
    borderColor: 'transparent',
    borderTopColor: role.content.tintedA11y,
    transform: [{ rotate: spin }],
  };

  const spinnerA11y = getSpinnerAccessibilityProps({ label });

  return (
    <View
      {...spinnerA11y}
      role='progressbar'
      aria-label={label}
      style={[styles.container, OUTER_STYLE[size], styleProp as ViewStyle]}
      testID={props.testID}
    >
      <Animated.View {...SPINNER_RING_A11Y} style={ringStyle} />
    </View>
  );
}

export type { SpinnerProps } from './interface';
