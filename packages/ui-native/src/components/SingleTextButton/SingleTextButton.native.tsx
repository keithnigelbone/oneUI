/**
 * SingleTextButton.native.tsx
 *
 * RN peer of `packages/ui/src/components/SingleTextButton/SingleTextButton.tsx`.
 * Circular single-text action button (max 2 characters). Attention level drives
 * the full visual:
 *   - high   → bold fill (Primary-Bold bg, Primary-Bold-TintedA11y text)
 *   - medium → subtle fill (Primary-Subtle bg, Primary-TintedA11y text)
 *   - low    → ghost (transparent bg, Primary-TintedA11y text)
 *
 * Static geometry lives in `./SingleTextButton.styles.native.ts`; this file owns
 * the render tree + dynamic brand paint from `useSurfaceTokens(appearance)`
 * (mirrors web's "precompiled stylesheet + runtime-resolved CSS variables"
 * model). Press-state colour flip runs in the Pressable function-form `style`
 * callback; tap-scale animates on an `Animated.Value` with `useNativeDriver`.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import Svg, { Circle } from 'react-native-svg';
import {
  getSingleTextButtonAccessibilityProps,
  getButtonFamilyLoadingSpinnerAccessibility,
  resolveSingleTextButtonAppearance,
  useSingleTextButtonState,
  type SingleTextButtonProps,
  type SingleTextButtonVariant,
} from './interface';
import {
  useMotion,
  useOneUITheme,
  useReduceMotion,
  useSurfaceAppearance,
  useSurfaceTokens,
  useTypographyTokens,
  useComponentRecipe,
  resolveRecipeBorderRadius,
  type NativeRoleTokens,
} from '../../theme';
import {
  styles,
  CONTAINER,
  CONTAINER_CONDENSED,
  SIZE_TO_LABEL,
  DISABLED_OPACITY,
  SPINNER_VIEWBOX,
  SPINNER_RADIUS,
  SPINNER_STROKE_WIDTH,
  SPINNER_DASH_VISIBLE,
  SPINNER_DASH_GAP,
} from './SingleTextButton.styles.native';

// ─── Paint model — mirrors the web module's data-attention → intermediate vars ──

interface Paint {
  bg: string;
  text: string;
  pressedBg: string;
}

const VARIANT_PAINT: Record<SingleTextButtonVariant, (role: NativeRoleTokens) => Paint> = {
  // high attention → bold fill + on-bold text.
  bold: (role) => ({
    bg: role.surfaces.bold,
    text: role.onBoldContent.tintedA11y,
    pressedBg: role.states.boldPressed,
  }),
  // medium attention → subtle fill + accent (tinted-a11y) text.
  subtle: (role) => ({
    bg: role.surfaces.subtle,
    text: role.content.tintedA11y,
    pressedBg: role.states.subtlePressed,
  }),
  // low attention → ghost (transparent) + accent text; pressed uses default Pressed.
  ghost: (role) => ({
    bg: 'transparent',
    text: role.content.tintedA11y,
    pressedBg: role.states.pressed,
  }),
};

// ─── Loading spinner ────────────────────────────────────────────────────────
// Mirrors web's `<CircularProgressIndicator variant="indeterminate">` inside the
// button — the web `.spinner` wrapper forces the indicator to `currentColor`,
// i.e. the button's attention-driven text colour. We reproduce that here by
// colouring the arc with the resolved text colour so it stays legible on every
// variant (on-bold on high, accent on medium/low). Geometry matches web's
// 16-unit viewBox (r=6.5, dasharray 30.63/10.21); rotation is driven by an
// outer Animated.View (Svg props can't be Animated directly).

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
    <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${SPINNER_VIEWBOX} ${SPINNER_VIEWBOX}`}>
        <Circle
          cx={SPINNER_VIEWBOX / 2}
          cy={SPINNER_VIEWBOX / 2}
          r={SPINNER_RADIUS}
          stroke={color}
          strokeWidth={SPINNER_STROKE_WIDTH}
          strokeDasharray={`${SPINNER_DASH_VISIBLE} ${SPINNER_DASH_GAP}`}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SingleTextButton(props: SingleTextButtonProps): React.ReactElement {
  const {
    children,
    size = 'm',
    condensed,
    fullWidth,
    onPress,
    onClick,
    'aria-label': ariaLabel,
    accessibilityHint,
    'aria-describedby': ariaDescribedby,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    'aria-controls': ariaControls,
    'aria-hidden': ariaHidden,
    testID,
    style: styleProp,
  } = props;

  const { isDisabled, resolvedVariant, ariaProps, dataAttrs } = useSingleTextButtonState(props);

  // Activation + tap-scale are suppressed while disabled OR busy (loading), so a
  // spinner-only button can't be double-pressed. `isDisabled` alone drives the
  // disabled semantics (a11y disabled, dim opacity); loading stays "busy".
  const isInteractionBlocked = isDisabled || Boolean(props.loading);

  // Surface-role inheritance (web parity): a bare button inside a
  // `<Surface appearance="…">` adopts the surrounding role when `appearance`
  // is unset / 'auto'.
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = resolveSingleTextButtonAppearance(props.appearance, parentAppearance);

  const { shape } = useOneUITheme();
  const role = useSurfaceTokens(resolvedAppearance);
  const paint = VARIANT_PAINT[resolvedVariant](role);
  const reduceMotion = useReduceMotion();
  const motion = useMotion();

  // Enforce max 2 characters — the circular shape breaks beyond that (web parity).
  if (__DEV__ && typeof children === 'string' && children.length > 2) {
    // eslint-disable-next-line no-console
    console.warn(
      `SingleTextButton: children "${children}" exceeds 2 characters. ` +
        'This component is designed for 1-2 character labels (e.g. "Ag", "En"). ' +
        'Text will be truncated.',
    );
  }
  const truncatedChildren =
    typeof children === 'string' && children.length > 2 ? children.slice(0, 2) : children;

  // Brand-overridable corner radius; defaults to Shape-Pill (circular).
  const recipeDecisions = useComponentRecipe('SingleTextButton');
  const borderRadius = resolveRecipeBorderRadius(recipeDecisions, shape) ?? shape.Pill;

  const label = useTypographyTokens('label', SIZE_TO_LABEL[size], { emphasis: 'high' });

  const sizeStyle = condensed ? CONTAINER_CONDENSED[size] : CONTAINER[size];
  // Spinner replaces the label — size it to the label's font size (web parity:
  // CircularProgressIndicator scales with the button's text).
  const spinnerSize = Math.round(label.fontSize);

  // Tap-scale spring animation. Ratio + tuning come from `useMotion()` so a
  // brand (or accessibility preset) can swap them theme-wide.
  const scale = useRef(new Animated.Value(1)).current;
  const pressTarget = fullWidth ? motion.tapScale.fullWidth : motion.tapScale.default;

  const onPressIn = (): void => {
    if (reduceMotion || isInteractionBlocked) return;
    Animated.spring(scale, {
      toValue: pressTarget,
      useNativeDriver: true,
      ...motion.spring.pressIn,
    }).start();
  };
  const onPressOut = (): void => {
    if (reduceMotion || isInteractionBlocked) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...motion.spring.pressOut,
    }).start();
  };

  const handlePress = isInteractionBlocked
    ? undefined
    : () => {
        onPress?.();
        onClick?.();
      };

  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.container,
      sizeStyle,
      fullWidth ? styles.fullWidth : styles.circular,
      { borderRadius },
      { backgroundColor: pressed ? paint.pressedBg : paint.bg },
      // Only `disabled` dims the button. `loading` is a busy state (spinner) and
      // renders at full opacity — a loading button looks like a normal enabled one.
      props.disabled ? { opacity: DISABLED_OPACITY } : null,
      styleProp as StyleProp<ViewStyle>,
    ],
    [sizeStyle, fullWidth, borderRadius, paint.pressedBg, paint.bg, props.disabled, styleProp],
  );

  const dataSet = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    // Reflect the surface-inherited appearance rather than the pure-hook value.
    const merged = { ...dataAttrs, 'data-appearance': resolvedAppearance };
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined) continue;
      out[key.startsWith('data-') ? key.slice(5) : key] = value;
    }
    return out;
  }, [dataAttrs, resolvedAppearance]);

  return (
    <Animated.View
      style={[
        { transform: [{ scale }] },
        fullWidth ? styles.fullWidth : { alignSelf: 'flex-start' },
      ]}
      pointerEvents={isInteractionBlocked ? 'none' : 'auto'}
    >
      <Pressable
        {...getSingleTextButtonAccessibilityProps(
          {
            'aria-label': ariaLabel,
            accessibilityHint,
            'aria-describedby': ariaDescribedby,
            'aria-expanded': ariaExpanded,
            'aria-haspopup': ariaHaspopup,
            'aria-controls': ariaControls,
            'aria-hidden': ariaHidden,
            loading: props.loading,
            disabled: props.disabled,
          },
          { isDisabled },
        )}
        {...ariaProps}
        {...({ dataSet } as object)}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        testID={testID}
        style={pressableStyle}
      >
        {props.loading ? (
          <View
            testID="single-text-button-spinner"
            style={[styles.spinnerWrap, { width: spinnerSize, height: spinnerSize }]}
            {...getButtonFamilyLoadingSpinnerAccessibility()}
          >
            <Spinner size={spinnerSize} color={paint.text} reduceMotion={reduceMotion} />
          </View>
        ) : (
          <Text
            style={[
              styles.label,
              {
                fontFamily: label.fontFamily,
                fontSize: label.fontSize,
                lineHeight: label.lineHeight,
                fontWeight: label.fontWeight,
                color: paint.text,
              },
            ]}
            numberOfLines={1}
          >
            {truncatedChildren}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export type { SingleTextButtonProps } from './interface';
