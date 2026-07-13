/**
 * LinkButton.native.tsx
 *
 * RN peer of `packages/ui/src/components/LinkButton/LinkButton.tsx`.
 * Link-style button — text + optional underline, no fill. Same prop contract
 * via `LinkButtonProps` from `@oneui/ui/components/LinkButton/shared`.
 *
 * Used by `Button.native.tsx` for the `contained={false}` delegation path,
 * mirroring how web's Button delegates to LinkButton in the same branch.
 *
 * Build-time-leaning pattern (same as Button.native.tsx):
 *   - Static layout / spacing / radius in module-scope `StyleSheet.create({…})`
 *   - Brand-aware label typography via `useTypographyTokens('label', size)`
 *   - Runtime paint via inline `style={[id, { color, backgroundColor }]}`
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import {
  getLinkButtonAccessibilityProps,
  LINK_BUTTON_LOADING_SLOT_A11Y,
  useLinkButtonState,
  type LinkButtonProps,
  type LinkButtonVariant,
} from './interface';
import { tokens, touchTarget } from '@oneui/tokens';
import {
  useMotion,
  useReduceMotion,
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
  type NativeRoleTokens,
} from '../../theme';

// ============================================================================
// Static styles
// ============================================================================

// INTENTIONAL-LITERAL: Spinner SVG geometry matches web's inline
// `<circle cx=8 cy=8 r=6.5 strokeDasharray="30.63 10.21" />`.
const SPINNER_VIEWBOX = 16;
const SPINNER_RADIUS = 6.5;
const SPINNER_STROKE_WIDTH = 1.5;
const SPINNER_DASH_VISIBLE = 30.63;
const SPINNER_DASH_GAP = 10.21;

// INTENTIONAL-LITERAL: web emits 0.5 for `--LinkButton-disabledOpacity`.
// `loading` is a busy state and renders at full opacity (no loading dim), so a
// loading button reads as active, not disabled.
const DISABLED_OPACITY = 0.5;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    minWidth: touchTarget.min,
  },
  // Per-size min-height — Spacing-6 / 8 / 10 / 12 (matches Button).
  size6:  { minHeight: tokens.spacing['6'] },
  size8:  { minHeight: tokens.spacing['8'] },
  size10: { minHeight: tokens.spacing['10'] },
  size12: { minHeight: tokens.spacing['12'] },
  slotLeft6:   { marginRight: tokens.spacing['1'] },
  slotLeft8:   { marginRight: tokens.spacing['1'] },
  slotLeft10:  { marginRight: tokens.spacing['1-5'] },
  slotLeft12:  { marginRight: tokens.spacing['1-5'] },
  slotRight6:  { marginLeft: tokens.spacing['1'] },
  slotRight8:  { marginLeft: tokens.spacing['1'] },
  slotRight10: { marginLeft: tokens.spacing['1-5'] },
  slotRight12: { marginLeft: tokens.spacing['1-5'] },
  labelAlign: { textAlign: 'left' },
});

const SIZE_STYLE = {
  6:  styles.size6,
  8:  styles.size8,
  10: styles.size10,
  12: styles.size12,
} as const;

const SLOT_LEFT_STYLE = {
  6:  styles.slotLeft6,
  8:  styles.slotLeft8,
  10: styles.slotLeft10,
  12: styles.slotLeft12,
} as const;

const SLOT_RIGHT_STYLE = {
  6:  styles.slotRight6,
  8:  styles.slotRight8,
  10: styles.slotRight10,
  12: styles.slotRight12,
} as const;

const SIZE_TO_LABEL = {
  6: 'XS',
  8: 'S',
  10: 'M',
  12: 'L',
} as const;

const ICON_SIZE: Record<6 | 8 | 10 | 12, number> = {
  6:  tokens.spacing['3'],
  8:  tokens.spacing['4'],
  10: tokens.spacing['5'],
  12: tokens.spacing['6'],
};

// ============================================================================
// Variant paint
// ============================================================================

interface Paint {
  text: string;
  hoverBg: string;
  pressedBg: string;
  underline: string;
}

const VARIANT_PAINT: Record<LinkButtonVariant, (role: NativeRoleTokens) => Paint> = {
  bold: (role) => ({
    text:      role.content.tintedA11y,
    hoverBg:   role.states.hover,
    pressedBg: role.states.pressed,
    underline: role.content.tintedA11y,
  }),
  subtle: (role) => ({
    text:      role.content.tintedA11y,
    hoverBg:   role.states.hover,
    pressedBg: role.states.pressed,
    // Web: subtle underline transparent until hover. Native has no hover,
    // so we render it transparent permanently.
    underline: 'transparent',
  }),
  ghost: (role) => ({
    text:      role.content.high,
    hoverBg:   role.states.hover,
    pressedBg: role.states.pressed,
    underline: 'transparent',
  }),
};

// ============================================================================
// Spinner
// ============================================================================

interface SpinnerProps {
  size: number;
  color: string;
  reduceMotion: boolean;
}

function Spinner({ size, color, reduceMotion }: SpinnerProps): React.ReactElement {
  const motion = useMotion();
  const rotationDuration = motion.spinner.rotationMs;
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
  return (
    <Animated.View
      style={{ width: size, height: size, transform: [{ rotate: spin }] }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${SPINNER_VIEWBOX} ${SPINNER_VIEWBOX}`}>
        <Circle
          cx={SPINNER_VIEWBOX / 2}
          cy={SPINNER_VIEWBOX / 2}
          r={SPINNER_RADIUS}
          stroke={color}
          strokeWidth={SPINNER_STROKE_WIDTH}
          strokeDasharray={`${SPINNER_DASH_VISIBLE} ${SPINNER_DASH_GAP}`}
          strokeLinecap='round'
          fill='none'
        />
      </Svg>
    </Animated.View>
  );
}

// ============================================================================
// LinkButton
// ============================================================================

export function LinkButton(props: LinkButtonProps): React.ReactElement {
  const { isDisabled, resolvedVariant, resolvedAppearance, numericSize } = useLinkButtonState(props);
  const role = useSurfaceTokens(resolvedAppearance);
  const paint = VARIANT_PAINT[resolvedVariant](role);
  const reduceMotion = useReduceMotion();
  const sizeKey = numericSize as 6 | 8 | 10 | 12;
  const labelTypo = useTypographyTokens('label', SIZE_TO_LABEL[sizeKey], {
    emphasis: 'high',
  });

  const sizeBaseStyle = SIZE_STYLE[sizeKey];

  // `loading` is a busy state, not disabled (shared `resolveButtonStateBase`):
  // suppress activation + press feedback while busy, without marking the control
  // `accessibilityState.disabled`.
  const isInteractionBlocked = isDisabled || Boolean(props.loading);

  const handlePress = isInteractionBlocked
    ? undefined
    : props.onPress ?? (props as { onClick?: () => void }).onClick;

  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.container,
      sizeBaseStyle,
      pressed && !isInteractionBlocked ? { backgroundColor: paint.pressedBg } : null,
      props.disabled ? { opacity: DISABLED_OPACITY } : null,
      props.style as StyleProp<ViewStyle>,
    ],
    [sizeBaseStyle, isInteractionBlocked, paint.pressedBg, props.disabled, props.style],
  );

  // Underline is `text-decoration` on web. RN doesn't support a separate
  // underline color, so we use `textDecorationLine` + `textDecorationColor`.
  // For variants where the underline is transparent (subtle / ghost), we
  // simply skip the textDecorationLine.
  const labelStyle = useMemo(
    () => [
      styles.labelAlign,
      typographyToTextStyle(labelTypo),
      {
        color: paint.text,
        textDecorationLine:
          paint.underline === 'transparent' ? 'none' : 'underline',
        textDecorationColor: paint.underline,
      } as const,
    ],
    [labelTypo, paint.text, paint.underline],
  );

  const { testID } = props;
  const linkA11y = getLinkButtonAccessibilityProps(props, { isDisabled });

  return (
    <Pressable
      {...linkA11y}
      role='link'
      aria-label={linkA11y.accessibilityLabel}
      disabled={isDisabled}
      onPress={handlePress}
      testID={testID}
      style={pressableStyle}
    >
      {props.loading && (
        <View
          {...LINK_BUTTON_LOADING_SLOT_A11Y}
          testID={testID ? `${testID}-spinner` : 'linkbutton-spinner'}
          style={SLOT_LEFT_STYLE[sizeKey]}
        >
          <Spinner size={ICON_SIZE[sizeKey]} color={paint.text} reduceMotion={reduceMotion} />
        </View>
      )}
      {props.start != null && typeof props.start !== 'string' && (
        <View
          testID={testID ? `${testID}-start` : 'linkbutton-start-slot'}
          style={SLOT_LEFT_STYLE[sizeKey]}
        >
          {props.start as React.ReactNode}
        </View>
      )}
      {props.children != null && (
        <Text style={labelStyle} numberOfLines={1}>
          {props.children}
        </Text>
      )}
      {props.end != null && typeof props.end !== 'string' && (
        <View
          testID={testID ? `${testID}-end` : 'linkbutton-end-slot'}
          style={SLOT_RIGHT_STYLE[sizeKey]}
        >
          {props.end as React.ReactNode}
        </View>
      )}
    </Pressable>
  );
}

export type { LinkButtonProps } from './interface';
