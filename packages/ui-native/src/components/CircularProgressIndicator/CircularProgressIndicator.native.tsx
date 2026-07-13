/**
 * CircularProgressIndicator.native.tsx
 *
 * RN peer of `packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.tsx`.
 *
 * Visual model:
 *   - `react-native-svg` `<Svg>` with a track + indicator `<Circle>`.
 *   - Stroke colours come from `useSurfaceTokens(resolvedAppearance)` so the
 *     ring participates in the `<Surface>` cascade exactly like web's
 *     `[data-surface]` token remapping.
 *   - Determinate: stroke-dashoffset transitions between value updates via an
 *     `Animated.Value` listener that drives `setNativeProps` on the indicator
 *     `<Circle>`. Duration uses `tokens.motion.duration.expressive.xlong` so
 *     the timing tracks web's `--Motion-Duration-3XL` as closely as the
 *     native motion scale allows.
 *   - Indeterminate: a single 0→1 `Animated.Value` (one trim cycle) plus a
 *     separate rotation Value drive the head, tail, dashOffset, and SVG
 *     rotation. Mirrors the three independent animation tracks in web's
 *     `@keyframes cpi-indeterminate-head` / `tail` / `rotate`.
 *   - Entry / exit: opt-in via `animate`. A scale `Animated.Value` plus a
 *     stroke-width modifier mirror web's `cpi-enter` / `cpi-exit` keyframes
 *     (scale 0.93 → 1, stroke 0 → natural). State-machine logic (entry only
 *     at value=0, exit only when value reaches 100) matches the web
 *     component verbatim.
 *
 * Pressable is not used — CPI is not interactive.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// `AnimatedCircle` lets us bind `strokeDashoffset` to an `Animated.Value`
// directly — same shape as web's CSS `transition: stroke-dashoffset`.
// Without this wrapper, JSX prop commits race `setNativeProps` updates and
// large value jumps (the showcase's "Jumping" demo) snap-then-rewind.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { tokens } from '@oneui/tokens';
import {
  CPI_VIEWBOX,
  getCircularProgressIndicatorAccessibilityProps,
  isCpiIconContentVisible,
  isCpiTextContentVisible,
  useCircularProgressIndicatorState,
  type CircularProgressIndicatorProps,
  type CircularProgressIndicatorSize,
  type CircularProgressIndicatorVariant,
} from './interface';
import {
  CPI_ENTRY_EXIT_FALLBACK_MS,
  CPI_ENTRY_SCALE_FROM,
  CPI_ENTRY_SCALE_TO,
  CPI_HEAD_SEGMENTS,
  CPI_INDETERMINATE_ROTATE_MS,
  CPI_INDETERMINATE_TRIM_MS,
  CPI_TAIL_SEGMENTS,
  SIZE_STYLE,
  SIZE_TO_LABEL,
  styles,
} from './CircularProgressIndicator.styles.native';
import {
  typographyToTextStyle,
  useMotion,
  useReduceMotion,
  useSurfaceTokens,
  useTypographyTokens,
} from '../../theme';

type AnimationPhase = 'entering' | 'visible' | 'exiting' | 'hidden';

function initialPhase(
  animate: boolean,
  show: boolean,
  variant: CircularProgressIndicatorVariant,
  value: number | undefined,
): AnimationPhase {
  if (!show) return 'hidden';
  if (!animate) return 'visible';
  if (variant === 'determinate') {
    return value === 0 ? 'entering' : 'visible';
  }
  return 'entering';
}

export function CircularProgressIndicator(
  props: CircularProgressIndicatorProps,
): React.ReactElement | null {
  const {
    variant: variantProp = 'determinate',
    size = 'M',
    value,
    children,
    animate = false,
    show = true,
    style: styleProp,
    testID,
  } = props;

  const state = useCircularProgressIndicatorState(props);
  const {
    isIndeterminate,
    center,
    radius,
    strokeWidth,
    circumference,
    dashOffset,
    resolvedAppearance,
    resolvedSize,
    resolvedVariant,
    resolvedContent,
    percentage,
  } = state;
  const role = useSurfaceTokens(resolvedAppearance);
  const reduceMotion = useReduceMotion();
  const motion = useMotion();

  // Resolved entry / exit duration — peer of web's `--Motion-Duration-XL`.
  const entryExitMs =
    motion?.duration?.moderate?.xl ?? CPI_ENTRY_EXIT_FALLBACK_MS;

  // Value-transition duration — peer of web's `--Motion-Duration-3XL` (the
  // jumping motion in the showcase). Caller can override per-instance via
  // `valueTransitionDuration` (mirrors web's
  // `--CircularProgressIndicator-valueTransitionDuration`); the tracking-
  // continuous pattern in the showcase passes `0` so each rapid value update
  // lands instantly and the cumulative motion reads as smooth/linear.
  const valueTransitionMs =
    props.valueTransitionDuration ??
    motion?.duration?.moderate?.['3xl'] ??
    tokens.motion.duration.expressive.xlong;

  // Resolved Transition Moderate easing — peer of web's
  // `--Motion-Easing-Transition-Moderate`. Used by both the determinate
  // dash-offset transition (jumping motion) and the indeterminate head/tail
  // keyframe segments below.
  const transitionEasing = useMemo(() => {
    const b = motion?.easings?.transition?.moderate?.bezier;
    if (b != null && b.length === 4) {
      return Easing.bezier(b[0], b[1], b[2], b[3]);
    }
    return Easing.bezier(0.4, 0, 0.2, 1);
  }, [motion]);

  // ── Phase state machine (mirrors web `CircularProgressIndicator.tsx`) ──
  const [phase, setPhase] = useState<AnimationPhase>(() =>
    initialPhase(animate, show, variantProp, value),
  );
  const isFirstRenderRef = useRef(true);
  const prevValueRef = useRef<number | undefined>(value);
  const prevShowRef = useRef(show);
  const phaseTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const clearPhaseTimers = (): void => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current.clear();
  };
  const schedulePhase = (next: AnimationPhase, delay: number): void => {
    const t = setTimeout(() => {
      setPhase(next);
      phaseTimersRef.current.delete(t);
    }, delay);
    phaseTimersRef.current.add(t);
  };

  useEffect(() => () => clearPhaseTimers(), []);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (phase === 'entering') {
        schedulePhase('visible', entryExitMs);
      }
      prevValueRef.current = value;
      prevShowRef.current = show;
      return;
    }

    if (!animate) {
      clearPhaseTimers();
      setPhase(show ? 'visible' : 'hidden');
      prevValueRef.current = value;
      prevShowRef.current = show;
      return;
    }

    const prevValue = prevValueRef.current;
    const prevShow = prevShowRef.current;
    prevValueRef.current = value;
    prevShowRef.current = show;

    if (resolvedVariant === 'determinate') {
      if (!show) {
        if (phase !== 'hidden') {
          clearPhaseTimers();
          setPhase('hidden');
        }
        return;
      }
      if (!prevShow && show) {
        clearPhaseTimers();
        if (value === 0) {
          setPhase('entering');
          schedulePhase('visible', entryExitMs);
        } else {
          setPhase('visible');
        }
        return;
      }
      if (
        prevValue !== undefined &&
        prevValue !== null &&
        prevValue < 100 &&
        value === 100 &&
        (phase === 'visible' || phase === 'entering')
      ) {
        clearPhaseTimers();
        schedulePhase('exiting', valueTransitionMs);
        schedulePhase('hidden', valueTransitionMs + entryExitMs);
        return;
      }
      if (prevValue !== 0 && value === 0 && phase === 'hidden') {
        clearPhaseTimers();
        setPhase('entering');
        schedulePhase('visible', entryExitMs);
      }
      return;
    }

    if (show) {
      if (phase === 'hidden' || phase === 'exiting') {
        clearPhaseTimers();
        setPhase('entering');
        schedulePhase('visible', entryExitMs);
      }
    } else if (phase === 'visible' || phase === 'entering') {
      clearPhaseTimers();
      setPhase('exiting');
      schedulePhase('hidden', entryExitMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phase intentionally omitted
  }, [show, animate, value, resolvedVariant, entryExitMs, valueTransitionMs]);

  useEffect(() => {
    if (
      animate &&
      resolvedVariant === 'determinate' &&
      phase === 'hidden' &&
      show &&
      value === 0
    ) {
      clearPhaseTimers();
      setPhase('entering');
      schedulePhase('visible', entryExitMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- helpers are stable refs
  }, [phase, animate, resolvedVariant, show, value, entryExitMs]);

  // ── Animated values ───────────────────────────────────────────────────────
  // Determinate dashOffset — driven by an `Animated.Value` consumed directly
  // by `AnimatedCircle`'s `strokeDashoffset` prop. This is the same pattern
  // the web component uses via CSS (`transition: stroke-dashoffset`): the
  // value is bound to the rendered prop and updates animate smoothly when
  // the target changes. NO React-prop / `setNativeProps` race that would
  // make jumping flicker.
  const dashOffsetAnim = useRef(new Animated.Value(dashOffset)).current;
  const indicatorRef = useRef<Circle>(null);
  useEffect(() => {
    if (isIndeterminate) return;
    // Reduced motion or explicit zero-duration override (continuous tracking
    // pattern): land on the target instantly. Skipping `Animated.timing`
    // avoids per-update scheduler overhead at 50 ms cadences.
    if (reduceMotion || valueTransitionMs <= 0) {
      dashOffsetAnim.setValue(dashOffset);
      return;
    }
    Animated.timing(dashOffsetAnim, {
      toValue: dashOffset,
      duration: valueTransitionMs,
      easing: transitionEasing,
      useNativeDriver: false,
    }).start();
  }, [dashOffset, isIndeterminate, reduceMotion, valueTransitionMs, transitionEasing, dashOffsetAnim]);

  // Indeterminate — ALL three animation tracks (head, tail, rotation) live in
  // a SINGLE `requestAnimationFrame` loop reading wall-clock time. Earlier
  // attempts split rotation onto `Animated.loop(useNativeDriver: true)` and
  // the trim onto rAF, but the native-driver rotation's iteration boundary
  // (every 6000 ms = exactly 4 trim cycles) was pausing the JS-driven trim
  // updates — head got "stuck" at its last value while only the tail kept
  // animating. Folding rotation into the same rAF removes that interference
  // entirely: every tick computes all three values from `performance.now()`
  // and updates a single React state.
  //
  // Math mirrors the web `@keyframes`:
  //   head:    2 → 100 over 0..76.667% (eased), 100 → 102 over 76.667..100% (eased)
  //   tail:    held at 0 until 43.333%, then 0 → 100 over 43.333..100% (eased)
  //   rotate:  0° → 1080° over 6000 ms, linear
  //   dasharray:  (head - tail) / 100 * circumference  visible
  //   dashoffset: -(tail % 100) / 100 * circumference

  const [trim, setTrim] = useState(() => ({
    visible: (CPI_HEAD_SEGMENTS.start / 100) * circumference,
    offset: 0,
    rotation: 0,
  }));
  useEffect(() => {
    if (!isIndeterminate || reduceMotion) return;
    let raf: number | null = null;
    const startTime =
      typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    const trimCycle = CPI_INDETERMINATE_TRIM_MS;
    const rotateCycle = CPI_INDETERMINATE_ROTATE_MS;
    const headBreak = CPI_HEAD_SEGMENTS.segment1.durationMs / trimCycle; // 0.76667
    const tailBreak = CPI_TAIL_SEGMENTS.segment1.holdMs / trimCycle;     // 0.43333
    const headS1Span = CPI_HEAD_SEGMENTS.segment1.to - CPI_HEAD_SEGMENTS.start;        // 98
    const headS2Span = CPI_HEAD_SEGMENTS.segment2.to - CPI_HEAD_SEGMENTS.segment1.to;  // 2
    const tailS2Span = CPI_TAIL_SEGMENTS.segment2.to - CPI_TAIL_SEGMENTS.start;        // 100

    const tick = (): void => {
      const now =
        typeof performance !== 'undefined' && typeof performance.now === 'function'
          ? performance.now()
          : Date.now();
      const sinceStart = now - startTime;
      const trimElapsed = sinceStart % trimCycle;
      const rotateElapsed = sinceStart % rotateCycle;
      const t = trimElapsed / trimCycle;
      // Web rotates 0 → 1080° over the rotation cycle; we collapse to the
      // visible 0..360° range (1080 mod 360 = 0) which RN can express as a
      // continuous degree string without overflow concerns.
      const rotation = (rotateElapsed / rotateCycle) * 1080;

      let head: number;
      if (t < headBreak) {
        const local = t / headBreak;
        head = CPI_HEAD_SEGMENTS.start + transitionEasing(local) * headS1Span;
      } else {
        const local = (t - headBreak) / (1 - headBreak);
        head = CPI_HEAD_SEGMENTS.segment1.to + transitionEasing(local) * headS2Span;
      }

      let tail: number;
      if (t < tailBreak) {
        tail = CPI_TAIL_SEGMENTS.start;
      } else {
        const local = (t - tailBreak) / (1 - tailBreak);
        tail = CPI_TAIL_SEGMENTS.start + transitionEasing(local) * tailS2Span;
      }

      const span = Math.max(0, Math.min(100, head - tail));
      const visible = (span / 100) * circumference;
      const offset = -((tail % 100) / 100) * circumference;
      setTrim({ visible, offset, rotation });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [isIndeterminate, reduceMotion, circumference, transitionEasing]);

  // Entry / exit values (scale + stroke-width modifier + content opacity).
  const scaleAnim = useRef(
    new Animated.Value(
      phase === 'entering' ? CPI_ENTRY_SCALE_FROM : CPI_ENTRY_SCALE_TO,
    ),
  ).current;
  const strokeScaleAnim = useRef(
    new Animated.Value(phase === 'entering' ? 0 : 1),
  ).current;
  const contentOpacityAnim = useRef(
    new Animated.Value(phase === 'entering' ? 0 : 1),
  ).current;

  useEffect(() => {
    if (!animate || reduceMotion) {
      scaleAnim.setValue(CPI_ENTRY_SCALE_TO);
      strokeScaleAnim.setValue(1);
      contentOpacityAnim.setValue(1);
      return;
    }
    const easing = Easing.bezier(0.4, 0, 0.2, 1);
    if (phase === 'entering') {
      scaleAnim.setValue(CPI_ENTRY_SCALE_FROM);
      strokeScaleAnim.setValue(0);
      contentOpacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: CPI_ENTRY_SCALE_TO,
          duration: entryExitMs,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(strokeScaleAnim, {
          toValue: 1,
          duration: entryExitMs,
          easing,
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacityAnim, {
          toValue: 1,
          duration: entryExitMs,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === 'exiting') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: CPI_ENTRY_SCALE_FROM,
          duration: entryExitMs,
          easing,
          useNativeDriver: true,
        }),
        Animated.timing(strokeScaleAnim, {
          toValue: 0,
          duration: entryExitMs,
          easing,
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacityAnim, {
          toValue: 0,
          duration: entryExitMs,
          easing,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === 'visible') {
      scaleAnim.setValue(CPI_ENTRY_SCALE_TO);
      strokeScaleAnim.setValue(1);
      contentOpacityAnim.setValue(1);
    }
  }, [
    phase,
    animate,
    reduceMotion,
    entryExitMs,
    scaleAnim,
    strokeScaleAnim,
    contentOpacityAnim,
  ]);

  // Stroke width is bound to an `Animated.Value` interpolation, NOT to a
  // listener-driven `setNativeProps`. The indeterminate trim re-renders the
  // indicator every frame via state to update dasharray, and any JSX-level
  // `strokeWidth={literal}` would clobber the listener's setNativeProps on
  // every commit — making the exit animation look like an instant disappear
  // instead of the web's stroke-shrink. Binding through `AnimatedCircle`
  // gives the Animated system sole ownership of the prop, matching web's
  // `@keyframes cpi-exit-stroke { to { stroke-width: 0; } }`.
  const trackRef = useRef<Circle>(null);
  const animatedStrokeWidth = useMemo(
    () =>
      strokeScaleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, strokeWidth],
      }),
    [strokeScaleAnim, strokeWidth],
  );

  // ── Accessibility ─────────────────────────────────────────────────────────
  const a11y = getCircularProgressIndicatorAccessibilityProps(props, state);

  // ── Render guards ─────────────────────────────────────────────────────────
  if (phase === 'hidden') return null;

  if (
    process.env.NODE_ENV !== 'production' &&
    !props['aria-label'] &&
    !props['aria-labelledby'] &&
    !props['aria-hidden']
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      'CircularProgressIndicator: an `aria-label` or `aria-labelledby` prop is required for accessibility.',
    );
  }

  const sizeStyle = SIZE_STYLE[resolvedSize];
  const containerStyle: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
  };

  const strokeColorIndicator = role.surfaces.bold;
  const strokeColorTrack = role.surfaces.subtle;
  const textColor = role.content.tintedA11y;

  const showLabelText = isCpiTextContentVisible(resolvedContent, resolvedSize);
  const showIconContent = isCpiIconContentVisible(resolvedContent, children);

  // Stroke width is driven entirely by `animatedStrokeWidth` (the
  // strokeScaleAnim → [0, strokeWidth] interpolation). No JSX-level fallback
  // needed because AnimatedCircle owns the prop; `strokeScaleAnim` is seeded
  // to 1 when not animating and to 0 during the entry phase by the entry/exit
  // effect, so the very first paint is correct.
  const initialDashOffset = isIndeterminate ? 0 : dashOffset;

  return (
    <Animated.View
      style={[styles.root, sizeStyle, containerStyle, styleProp as StyleProp<ViewStyle>]}
      testID={testID}
      {...a11y}
    >
      <View
        style={{
          width: sizeStyle.width,
          height: sizeStyle.height,
          transform: isIndeterminate ? [{ rotate: `${trim.rotation}deg` }] : undefined,
        }}
      >
        <Svg
          width={sizeStyle.width}
          height={sizeStyle.height}
          viewBox={`0 0 ${CPI_VIEWBOX} ${CPI_VIEWBOX}`}
        >
          <AnimatedCircle
            ref={trackRef}
            cx={center}
            cy={center}
            r={radius}
            stroke={strokeColorTrack}
            strokeWidth={animatedStrokeWidth}
            fill="none"
          />
          {isIndeterminate ? (
            <AnimatedCircle
              ref={indicatorRef}
              cx={center}
              cy={center}
              r={radius}
              stroke={strokeColorIndicator}
              strokeWidth={animatedStrokeWidth}
              strokeLinecap="round"
              fill="none"
              // Indeterminate state-driven trim — re-renders every frame
              // via the `trim` state set by the trimAnim listener. Falls
              // back to a 2% arc on first paint while the loop spins up.
              strokeDasharray={`${trim.visible || (2 / 100) * circumference} ${circumference - (trim.visible || (2 / 100) * circumference)}`}
              strokeDashoffset={trim.offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          ) : (
            <AnimatedCircle
              ref={indicatorRef}
              cx={center}
              cy={center}
              r={radius}
              stroke={strokeColorIndicator}
              strokeWidth={animatedStrokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              // Bind directly to the Animated.Value — Animated.timing on
              // value change produces a smooth ~3XL eased transition,
              // matching web's `transition: stroke-dashoffset` CSS rule.
              strokeDashoffset={dashOffsetAnim}
              transform={`rotate(-90 ${center} ${center})`}
            />
          )}
        </Svg>
      </View>

      {(showLabelText || showIconContent) && (
        <Animated.View
          pointerEvents="none"
          style={[styles.centerContent, { opacity: contentOpacityAnim }]}
        >
          {showLabelText && (
            <CenterLabel size={resolvedSize} color={textColor} percentage={percentage} />
          )}
          {showIconContent && children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

interface CenterLabelProps {
  size: CircularProgressIndicatorSize;
  color: string;
  percentage: number;
}

function CenterLabel({ size, color, percentage }: CenterLabelProps): React.ReactElement {
  const typo = useTypographyTokens('label', SIZE_TO_LABEL[size], { emphasis: 'medium' });
  const textStyle: StyleProp<TextStyle> = useMemo(
    () => [styles.labelText, typographyToTextStyle(typo), { color }],
    [typo, color],
  );
  return (
    <Text style={textStyle} numberOfLines={1} accessible={false}>
      {percentage}
    </Text>
  );
}

export type {
  CircularProgressIndicatorProps,
  CircularProgressIndicatorSize,
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorVariant,
  CircularProgressIndicatorContent,
} from './interface';
