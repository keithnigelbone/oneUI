/**
 * AgentPulse.native.tsx
 *
 * RN peer of `packages/ui/src/components/AgentPulse/AgentPulse.tsx`.
 * Animated brand-coloured indicator for agent states.
 *
 * Refactored to use JS-driven animations (useNativeDriver: false)
 * because layout properties (top, left, width, height, borderRadius)
 * are being animated, which are not supported by the native driver.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useSurfaceTokens, useReduceMotion } from '../../theme';
import {
  type AgentPulseProps,
  type AgentPulseState,
  type AgentPulsePhase,
  LISTENING_ENTRY_MS,
  LISTENING_EXIT_MS,
  IDLE_SETTLE_MS,
  THINKING_LOOP_MS,
  getAgentPulseAccessibilityProps,
} from './interface';
import { styles, SIZE_MAP } from './AgentPulse.styles.native';

export function AgentPulse(props: AgentPulseProps): React.ReactElement {
  const {
    state = 'idle',
    appearance = 'auto',
    size = 'md',
    autoTransition = true,
    paused = false,
    reducedMotionFallback = 'static',
    testID,
  } = props;

  const role = useSurfaceTokens(appearance === 'auto' ? 'primary' : appearance);
  const reduceMotion = useReduceMotion();

  const [phase, setPhase] = useState<AgentPulsePhase>(state);
  const prevStateRef = useRef<AgentPulseState>(state);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const s = resolvedSize / 1000; // Scaling factor from 1000 base

  // Animation values
  const idlePulse = useRef(new Animated.Value(1)).current;
  const transitionRotation = useRef(new Animated.Value(0)).current; // 0-1 range for 0-180 or 180-360
  const thinkingRotation = useRef(new Animated.Value(0)).current;
  const speakingScale = useRef(new Animated.Value(1)).current;

  // Transition values for each pill (P1-P4)
  const pillX = useRef([
    new Animated.Value(309 * s),
    new Animated.Value(500 * s),
    new Animated.Value(309 * s),
    new Animated.Value(500 * s),
  ]).current;
  const pillY = useRef([
    new Animated.Value(309 * s),
    new Animated.Value(309 * s),
    new Animated.Value(500 * s),
    new Animated.Value(500 * s),
  ]).current;
  const pillW = useRef([
    new Animated.Value(191 * s),
    new Animated.Value(191 * s),
    new Animated.Value(191 * s),
    new Animated.Value(191 * s),
  ]).current;
  const pillH = useRef([
    new Animated.Value(191 * s),
    new Animated.Value(191 * s),
    new Animated.Value(191 * s),
    new Animated.Value(191 * s),
  ]).current;
  const pillR = useRef([
    new Animated.Value(95.5 * s),
    new Animated.Value(95.5 * s),
    new Animated.Value(95.5 * s),
    new Animated.Value(95.5 * s),
  ]).current;
  const pillScale = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  // Reset timers on unmount
  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    },
    []
  );

  // Handle state transitions
  useEffect(() => {
    const prev = prevStateRef.current;
    if (prev === state) return;
    prevStateRef.current = state;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (!autoTransition) {
      setPhase(state);
      return;
    }

    if (prev === 'idle' && state === 'listening') {
      // Step 1: Settle pulse
      setPhase('idle-settling');
      transitionTimerRef.current = setTimeout(() => {
        // Step 2: Play entry
        setPhase('transitioning-to-listening');
        transitionTimerRef.current = setTimeout(() => {
          setPhase('listening');
        }, LISTENING_ENTRY_MS);
      }, IDLE_SETTLE_MS);
      return;
    }

    if (prev === 'listening' && state === 'thinking') {
      setPhase('transitioning-to-thinking');
      transitionTimerRef.current = setTimeout(() => {
        setPhase('thinking');
      }, LISTENING_EXIT_MS);
      return;
    }

    setPhase(state);
  }, [state, autoTransition]);

  // Animation Loops
  useEffect(() => {
    if (paused || reduceMotion) {
      idlePulse.stopAnimation();
      thinkingRotation.stopAnimation();
      speakingScale.stopAnimation();
      return;
    }

    const loops: Animated.CompositeAnimation[] = [];

    if (phase === 'idle') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(idlePulse, {
            toValue: 1.41,
            duration: 1000,
            easing: Easing.bezier(0.5, 0, 0.3, 1),
            useNativeDriver: false,
          }),
          Animated.timing(idlePulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.5, 0, 0.3, 1),
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      loops.push(loop);
    } else if (phase === 'thinking') {
      const stepDuration = THINKING_LOOP_MS / 4;
      const easing = Easing.bezier(0.5, 0, 0.3, 1);

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(thinkingRotation, {
            toValue: 0.25,
            duration: stepDuration,
            easing,
            useNativeDriver: false,
          }),
          Animated.timing(thinkingRotation, {
            toValue: 0.5,
            duration: stepDuration,
            easing,
            useNativeDriver: false,
          }),
          Animated.timing(thinkingRotation, {
            toValue: 0.75,
            duration: stepDuration,
            easing,
            useNativeDriver: false,
          }),
          Animated.timing(thinkingRotation, {
            toValue: 1,
            duration: stepDuration,
            easing,
            useNativeDriver: false,
          }),
        ])
      );
      thinkingRotation.setValue(0);
      loop.start();
      loops.push(loop);
    } else if (phase === 'speaking') {
      const easing = Easing.bezier(0.5, 0, 0.3, 1);
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(speakingScale, {
            toValue: 1.2,
            duration: 500,
            easing,
            useNativeDriver: false,
          }),
          Animated.timing(speakingScale, {
            toValue: 1,
            duration: 500,
            easing,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      loops.push(loop);
    }

    return () => {
      loops.forEach((l) => l.stop());
    };
  }, [phase, paused, reduceMotion, idlePulse, thinkingRotation, speakingScale]);

  // Resolve geometry based on phase (Transitions)
  useEffect(() => {
    const isListening = phase === 'listening';
    const isTransitioningIn = phase === 'transitioning-to-listening';
    const isTransitioningOut = phase === 'transitioning-to-thinking';
    const isIdleSettle = phase === 'idle-settling';

    const duration = isTransitioningIn
      ? LISTENING_ENTRY_MS
      : isTransitioningOut
        ? LISTENING_EXIT_MS
        : isIdleSettle
          ? IDLE_SETTLE_MS
          : 0;

    const easing = Easing.bezier(0.5, 0, 0.3, 1);

    // Rotation animation
    if (isTransitioningIn) {
      transitionRotation.setValue(0);
      Animated.timing(transitionRotation, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: false,
      }).start();
    } else if (isTransitioningOut) {
      transitionRotation.setValue(0);
      Animated.timing(transitionRotation, {
        toValue: 1,
        duration,
        easing,
        useNativeDriver: false,
      }).start();
    } else {
      transitionRotation.setValue(0);
    }

    const targets =
      isListening || isTransitioningIn || isTransitioningOut
        ? {
            x: [130 * s, 330 * s, 530 * s, 730 * s],
            y: [440 * s, 440 * s, 440 * s, 440 * s],
            w: [120 * s, 120 * s, 120 * s, 120 * s],
            h: [120 * s, 120 * s, 120 * s, 120 * s],
            r: [60 * s, 60 * s, 60 * s, 60 * s],
            scale: [0.628, 0.628, 0.628, 0.628],
          }
        : {
            x: [309 * s, 500 * s, 309 * s, 500 * s],
            y: [309 * s, 309 * s, 500 * s, 500 * s],
            w: [191 * s, 191 * s, 191 * s, 191 * s],
            h: [191 * s, 191 * s, 191 * s, 191 * s],
            r: [95.5 * s, 95.5 * s, 95.5 * s, 95.5 * s],
            scale: [1, 1, 1, 1],
          };

    Animated.parallel([
      ...pillX.map((v, i) =>
        Animated.timing(v, { toValue: targets.x[i], duration, easing, useNativeDriver: false })
      ),
      ...pillY.map((v, i) =>
        Animated.timing(v, { toValue: targets.y[i], duration, easing, useNativeDriver: false })
      ),
      ...pillW.map((v, i) =>
        Animated.timing(v, { toValue: targets.w[i], duration, easing, useNativeDriver: false })
      ),
      ...pillH.map((v, i) =>
        Animated.timing(v, { toValue: targets.h[i], duration, easing, useNativeDriver: false })
      ),
      ...pillR.map((v, i) =>
        Animated.timing(v, { toValue: targets.r[i], duration, easing, useNativeDriver: false })
      ),
      ...pillScale.map((v, i) =>
        Animated.timing(v, { toValue: targets.scale[i], duration, easing, useNativeDriver: false })
      ),
    ]).start();
  }, [phase, s, pillX, pillY, pillW, pillH, pillR, pillScale, transitionRotation]);

  const a11yProps = getAgentPulseAccessibilityProps(props);

  const spinThinking = thinkingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinTransition = transitionRotation.interpolate({
    inputRange: [0, 1],
    outputRange: phase === 'transitioning-to-listening' ? ['0deg', '180deg'] : ['180deg', '360deg'],
  });

  const clusterRotation =
    phase === 'thinking'
      ? spinThinking
      : phase.startsWith('transitioning')
        ? spinTransition
        : '0deg';

  const renderContent = () => {
    if (reduceMotion && reducedMotionFallback !== 'none') {
      return (
        <Svg viewBox="0 0 24 24" width={resolvedSize} height={resolvedSize}>
          <Rect x="3" y="6" width="3" height="12" rx="1.5" fill={role.surfaces.default} />
          <Rect x="8" y="3" width="3" height="18" rx="1.5" fill={role.surfaces.default} />
          <Rect x="13" y="6" width="3" height="12" rx="1.5" fill={role.surfaces.default} />
          <Rect x="18" y="9" width="3" height="6" rx="1.5" fill={role.surfaces.default} />
        </Svg>
      );
    }

    return (
      <Animated.View
        style={{
          width: resolvedSize,
          height: resolvedSize,
          transform: [
            { rotate: clusterRotation },
            { scale: phase === 'speaking' ? speakingScale : 1 },
          ],
        }}
      >
        {pillX.map((v, i) => {
          const baseScale = phase === 'idle' ? idlePulse : pillScale[i];

          return (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: v,
                top: pillY[i],
                width: pillW[i],
                height: pillH[i],
                borderRadius: pillR[i],
                backgroundColor: role.surfaces.bold,
                transform: [{ scale: baseScale }],
              }}
            />
          );
        })}
      </Animated.View>
    );
  };

  return (
    <View
      {...a11yProps}
      style={[styles.root, { width: resolvedSize, height: resolvedSize }, props.style]}
      testID={testID}
    >
      {renderContent()}
    </View>
  );
}
