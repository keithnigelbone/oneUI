/**
 * Switch.native.tsx
 *
 * RN peer of `packages/ui/src/components/Switch/Switch.tsx`.
 *
 * Visual model (mirrors `Switch.module.css`):
 *   - Unchecked → neutral-subtle track + white thumb
 *   - Checked   → role-bold track + on-bold-tinted-a11y thumb
 *   - ReadOnly  → non-interactive, neutral role
 *   - Disabled  → opacity reduction, no press
 *
 * Animation:
 *   - Track background: `Animated.Value` interpolates between unchecked and
 *     checked fill colors via `backgroundColor.interpolate(…)`. The two
 *     endpoints are cached; a new animation runs whenever `isChecked` changes.
 *   - Thumb position: `Animated.Value` translates from 0 → KNOB_TRAVEL[size].
 *     Spring from `useMotion` drives the physics; `useReduceMotion` opts out.
 *
 * Surface context: inside `<Surface mode="bold">`, `useSurfaceTokens` returns
 * already-remapped values so checked bold fill stays distinguishable.
 *
 * Web parity gaps (documented in docs/parity/switch-web-native-parity.md):
 *   - Focus ring (Informative halo) — RN touch has no focus indicator.
 *   - Hover states — no hover on touch.
 *   - ReadOnly unchecked smaller-knob + outline style — simplified to
 *     standard disabled look on native (v1).
 *   - AccentPrimary / AccentSparkle cross-role — appearance still controls
 *     the fill since accent is a web-only CSS layer (v1).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  useSurfaceTokens,
  useMotion,
  useOneUITheme,
  useReduceMotion,
  useTypographyTokens,
  useComponentTheme,
  typographyToTextStyle,
  resolveShapeLanguageBorderRadius,
  useSurfaceAppearance,
} from '../../theme';
import {
  useSwitchState,
  getSwitchAccessibilityProps,
  resolveSize,
  type SwitchProps,
} from './interface';
import {
  DISABLED_OPACITY,
  HIT_SLOP,
  KNOB_SIZE,
  KNOB_TRAVEL,
  TRACK_BORDER_RADIUS,
  TRACK_PADDING,
  TRACK_WIDTH,
  styles,
} from './Switch.styles.native';

// ─── Label size → typography size key (mirrors Switch.module.css §LABEL) ──────

const LABEL_SIZE_TO_BODY = {
  s: 'S',
  m: 'M',
  l: 'L',
} as const;

// ============================================================================
// Switch
// ============================================================================

export function Switch(props: SwitchProps): React.ReactElement {
  const {
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    children,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    accessibilityHint,
    testID,
    style: styleProp,
  } = props;

  const { isDisabled, isReadOnly, resolvedAppearance, resolvedSize, isControlled } =
    useSwitchState(props);

  // ─── Controlled / uncontrolled state ────────────────────────────────────
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked ?? false);
  const isChecked = isControlled ? (checkedProp ?? false) : internalChecked;

  const componentTheme = useComponentTheme('switch');
  const { shape } = useOneUITheme();
  const trackRadius =
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'inputs') ??
    TRACK_BORDER_RADIUS;

  // ─── Tokens ─────────────────────────────────────────────────────────────
  // For readOnly, collapse to neutral role (matching web's neutral unchecked)
  const effectiveAppearance = isReadOnly ? 'neutral' : resolvedAppearance;
  const surfaceAppearance = useSurfaceAppearance();

  const role = useSurfaceTokens(effectiveAppearance);
  const surfaceRole = useSurfaceTokens(surfaceAppearance ?? 'neutral');

  const neutralRole = useSurfaceTokens('neutral');

  // Track fill colors: unchecked = neutral subtle, checked = role bold
  const uncheckedFill = surfaceRole.surfaces.subtle;
  const checkedFill = role.surfaces.bold;

  // Thumb fill: unchecked = surfaces.default (white-ish), checked = on-bold tinted a11y
  const thumbUncheckedFill = role.surfaces.default;
  const thumbCheckedFill = role.onBoldContent.tintedA11y;

  // ─── Motion ─────────────────────────────────────────────────────────────
  const motion = useMotion();
  const reduceMotion = useReduceMotion();

  // Animated value: 0 = unchecked, 1 = checked
  const anim = useRef(new Animated.Value(isChecked ? 1 : 0)).current;

  // Sync animation when checked state changes
  useEffect(() => {
    const toValue = isChecked ? 1 : 0;
    if (reduceMotion || isReadOnly) {
      anim.setValue(toValue);
      return;
    }
    Animated.spring(anim, {
      toValue,
      useNativeDriver: false, // backgroundColor can't use native driver
      ...motion.spring.pressIn,
    }).start();
  }, [isChecked, reduceMotion, isReadOnly, anim, motion.spring.pressIn]);

  // ─── Animated styles ────────────────────────────────────────────────────
  const animatedTrackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [uncheckedFill, checkedFill],
  });

  const sizeKey = resolveSize(props.size ?? 'm');
  const knobSide = KNOB_SIZE[sizeKey];
  const travel = KNOB_TRAVEL[sizeKey];

  const animatedThumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travel],
  });

  const animatedThumbColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [thumbUncheckedFill, thumbCheckedFill],
  });

  // ─── Press handler ───────────────────────────────────────────────────────
  const handlePress = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onCheckedChange?.(next);
  }, [isDisabled, isReadOnly, isChecked, isControlled, onCheckedChange]);

  // ─── Accessibility ───────────────────────────────────────────────────────
  const a11y = getSwitchAccessibilityProps(
    {
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
      accessibilityHint,
      children,
    },
    { isDisabled, isReadOnly, isChecked },
  );

  // ─── Typography ──────────────────────────────────────────────────────────
  const labelTypo = useTypographyTokens('body', LABEL_SIZE_TO_BODY[sizeKey], {
    emphasis: 'low',
  });

  // ─── Render ──────────────────────────────────────────────────────────────

  const trackWidth = TRACK_WIDTH[sizeKey];
  const trackHeight = knobSide + TRACK_PADDING * 2;

  const pressableStyle = useCallback(
    (_: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.track,
      {
        width: trackWidth,
        height: trackHeight,
        borderRadius: trackRadius,
      },
    ],
    [trackWidth, trackHeight],
  );

  const wrapperStyle: StyleProp<ViewStyle> = [
    styles.wrapper,
    isDisabled && !isReadOnly ? { opacity: DISABLED_OPACITY } : null,
    styleProp,
  ];

  return (
    <View style={wrapperStyle}>
      <Pressable
        {...a11y}
        testID={testID}
        disabled={isDisabled || isReadOnly}
        onPress={handlePress}
        hitSlop={HIT_SLOP}
        style={pressableStyle}
      >
        <Animated.View
          style={[
            styles.track,
            {
              width: trackWidth,
              height: trackHeight,
              borderRadius: trackRadius,
              backgroundColor: animatedTrackColor,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            styles.thumb,
            {
              width: knobSide,
              height: knobSide,
              borderRadius: trackRadius,
              backgroundColor: animatedThumbColor,
              transform: [{ translateX: animatedThumbTranslate }],
            },
          ]}
        />
      </Pressable>
      {typeof children === 'string' && children.length > 0 ? (
        <Text
          style={[
            typographyToTextStyle(labelTypo),
            { color: neutralRole.content.high },
          ]}
          accessible={false}
        >
          {children}
        </Text>
      ) : null}
    </View>
  );
}

export type { SwitchProps } from './interface';
