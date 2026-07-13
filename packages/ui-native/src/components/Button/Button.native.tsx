/**
 * Button.native.tsx
 *
 * Build-time-leaning Button. Same prop contract + visual fidelity as
 * `packages/ui/src/components/Button/Button.tsx`.
 *
 * Static styling lives in `./Button.styles.native.ts` (the native peer of
 * `Button.module.css`). This file owns the render logic + dynamic state:
 *
 *   - Brand paint comes from `useSurfaceTokens(appearance)` and merges as
 *     a small inline override on top of the registered StyleSheet IDs
 *     exported from the styles file. Mirrors web's
 *     "precompiled stylesheet + runtime-resolved CSS variables" model.
 *   - Press-state colour flip is in the Pressable function-form `style`
 *     callback (driving bg via Animated.Value was measured net-negative).
 *   - Tap-scale animation runs on `Animated.Value` with `useNativeDriver`.
 *   - `contained={false}` renders inline as a link-style button (transparent
 *     bg + neutral high text colour). No delegation to `<LinkButton>` — that
 *     was creating prop-cast churn at the boundary; uncontained sizing /
 *     padding are now first-class on Button itself.
 *   - `<DecorationProvider>`-assigned brand ornaments render via
 *     `react-native-svg`'s `<Svg>/<G>/<Path>` as siblings of Pressable inside
 *     Animated.View, with padding reserving flow space (mirrors web's margin).
 */

import React, {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
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
import Svg, { Circle, G, Path } from 'react-native-svg';
import {
  extractSvgContent,
  getOpenStrokePath,
  type DecorationConfig,
} from '@oneui/shared';
import {
  getButtonAccessibilityProps,
  getButtonFamilyLoadingSpinnerAccessibility,
  useButtonState,
  type ButtonProps,
  type ButtonVariant,
} from './interface';
import {
  useComponentDecoration,
  useMotion,
  useOneUITheme,
  useReduceMotion,
  useSurfaceTokens,
  useRoleMaterial,
  type ResolvedMetallicGradient,
  type MaterialAssignmentTarget,
} from '../../theme';
import { useButtonStyle } from './useButtonStyle';
import { MetallicGradientFill } from '../MetallicGradientFill';
import { ButtonSlot } from './ButtonSlot.native';
import {
  getButtonCondensedMetrics,
  getButtonIconMetrics,
  getButtonSizeMetrics,
  getButtonSlotMetrics,
  type ButtonNumericSize,
} from './buttonLayout';
import {
  styles,
  ornamentStyles,
  DISABLED_OPACITY,
  GHOST_ORNAMENT_STROKE_WIDTH,
  SPINNER_VIEWBOX,
  SPINNER_RADIUS,
  SPINNER_STROKE_WIDTH,
  SPINNER_DASH_VISIBLE,
  SPINNER_DASH_GAP,
} from './Button.styles.native';

/**
 * Pick the per-context tap-scale target from the motion bundle. Mirrors
 * web's `--Motion-Tap-Scale-{XS, Default, FullWidth}` semantic chain.
 */
function tapTargetFor(
  numericSize: number,
  fullWidth: boolean | undefined,
  motion: { tapScale: { xs: number; default: number; fullWidth: number } }
): number {
  if (fullWidth) return motion.tapScale.fullWidth;
  if (numericSize === 6) return motion.tapScale.xs;
  return motion.tapScale.default;
}


const warnedIconStrings = new Set<string>();

function devWarnIconString(slot: string, name: string): void {
  if (process.env.NODE_ENV === 'production') return;
  const key = `${slot}:${name}`;
  if (warnedIconStrings.has(key)) return;
  warnedIconStrings.add(key);
  // eslint-disable-next-line no-console
  console.warn(
    `[OneUI Button] Native slots expect a ReactNode icon component (stage 1). ` +
    `Semantic string "${name}" via ${slot} is ignored until Jio catalog wiring lands — ` +
    `use start={<YourIcon size={…} color={…} />} via @oneui/ui-native/icons.`
  );
}

function resolveSlot(
  primary: ReactNode | string | undefined,
  deprecated: unknown,
  primarySlotName: string,
  deprecatedSlotName: string
): ReactNode {
  if (typeof primary === 'string') {
    devWarnIconString(primarySlotName, primary);
    return null;
  }
  if (primary != null && primary !== false) return primary as ReactNode;
  if (typeof deprecated === 'string') {
    devWarnIconString(deprecatedSlotName, deprecated);
    return null;
  }
  if (isValidElement(deprecated)) return deprecated;
  return null;
}

// ============================================================================
// Loading spinner — mirrors web's `<svg viewBox="0 0 16 16"><circle … strokeDasharray />`.
// Web uses a 16-unit viewBox with r=6.5, dasharray 30.63/10.21. Reproducing the same
// geometry on RN via `react-native-svg` gives pixel-identical output; rotation is
// driven by an outer `Animated.View` (Svg props can't be Animated directly).
// ============================================================================

interface SpinnerProps {
  size: number;
  color: string;
  reduceMotion: boolean;
}

// ============================================================================
// Ornament (brand decoration)
//
// Native peer of ButtonDecoration.tsx in packages/ui. resolveOrnamentData
// extracts raw path data (viewBox, fillPath, strokePath, leftMirrorTransform).
// Each Ornament renders as Svg/G/Path with a reactive fill prop — mirrors
// web's fill: var(--_btn-bg) which updates on :active. Ornaments are siblings
// of Pressable inside Animated.View, with padding equal to ornamentWidth
// reserving flow space (mirrors web's margin-left/right on .button).
//
// ============================================================================

interface OrnamentData {
  showLeft: boolean;
  showRight: boolean;
  aspectRatio: number;
  viewBox: string;
  fillPath: string;
  strokePath: string | null;
  leftMirrorTransform: string | undefined;
}

function resolveOrnamentData(
  decoration: DecorationConfig | null,
  isGhost: boolean,
): OrnamentData | null {
  if (!decoration) return null;
  const { svgContent, mirror, placement, aspectRatio } = decoration;
  const showRight = placement === 'edges' || placement === 'right';
  const showLeft = placement === 'edges' || placement === 'left';

  const extracted = extractSvgContent(svgContent);
  if (!extracted) return null;

  const fillPath = getOpenStrokePath(svgContent);
  if (!fillPath) return null;

  const { viewBox } = extracted;
  const vbParts = viewBox.split(' ').map(Number);
  const vbWidth = vbParts[2] ?? 0;

  const leftMirrorTransform = showLeft && mirror ? `translate(${vbWidth},0) scale(-1,1)` : undefined;

  return {
    showLeft,
    showRight,
    aspectRatio,
    viewBox,
    fillPath,
    strokePath: isGhost ? fillPath : null,
    leftMirrorTransform,
  };
}

interface OrnamentProps {
  side: 'left' | 'right';
  viewBox: string;
  fillPath: string;
  strokePath: string | null;
  mirrorTransform: string | undefined;
  fill: string;
  strokeColor: string;
  strokeWidth: number;
  width: number;
}

function Ornament({
  side, viewBox, fillPath, strokePath, mirrorTransform,
  fill, strokeColor, strokeWidth, width,
}: OrnamentProps): React.ReactElement {
  return (
    <View
      aria-hidden
      pointerEvents="none"
      style={[
        ornamentStyles.wrapper,
        { width },
        side === 'left' ? { left: 0, transform: [{ translateX: 0.35 }] } : { right: 0, transform: [{ translateX: -0.75 }] },
      ]}
    >
      <Svg viewBox={viewBox} width={width} height="100%" preserveAspectRatio="none">
        <G transform={mirrorTransform}>
          <Path d={fillPath} fill={fill} stroke="none" />
          {strokePath ? (
            <Path
              d={strokePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          ) : null}
        </G>
      </Svg>
    </View>
  );
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
      })
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

// ============================================================================
// Button
// ============================================================================

export function Button(props: ButtonProps): React.ReactElement {
  const {
    contained = true,
    condensed,
    fullWidth,
    onPress,
    onClick,
    children,
    start: startProp,
    end: endProp,
    leftIcon,
    rightIcon,
    'aria-label': ariaLabel,
    accessibilityHint,
    'aria-describedby': ariaDescribedby,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    'aria-controls': ariaControls,
    'aria-hidden': ariaHidden,
    testID,
    style: styleProp,
    attention,
  } = props;

  if (__DEV__ && children != null && typeof children !== 'string') {
    console.warn(
      '[OneUI Button] `children` should be a string. Avoid passing React elements as Button content — use `start` / `end` slots for icons.'
    );
  }

  const { isDisabled, resolvedVariant, resolvedAppearance, numericSize, ariaProps, dataAttrs } =
    useButtonState(props);
  const theme = useOneUITheme();
  const sizeKey = numericSize as ButtonNumericSize;

  // Single-pass style resolution — all 4 sources (surface-engine, emphasisStyle,
  // recipe, tokenRefs) merged into one typed struct by the pure `resolveButtonStyle`
  // function. Mirrors web's `buildAllComponentCSS` merge pass.
  const style = useButtonStyle({ resolvedVariant, resolvedAppearance, sizeKey });
  const { paint } = style;

  // role stays for resolvedTextColor (attention-aware) and ornament (strokeLow).
  const role = useSurfaceTokens(resolvedAppearance);
  // Auto-swap: if role has a metallic assignment, treat bold variant as gradient.
  const roleMaterial = useRoleMaterial(resolvedAppearance as MaterialAssignmentTarget);
  const activeGradient: ResolvedMetallicGradient | null =
    paint.bgGradient ??
    (resolvedVariant === 'bold' && roleMaterial != null ? roleMaterial : null);
  const [isGradientPressed, setIsGradientPressed] = useState(false);
  const [gradientDims, setGradientDims] = useState<{ w: number; h: number } | null>(null);
  const showGradient = activeGradient != null && !isGradientPressed && contained;
  const reduceMotion = useReduceMotion();

  const layout = useMemo(() => {
    const size = condensed
      ? getButtonCondensedMetrics(theme.spacing, sizeKey)
      : getButtonSizeMetrics(theme.spacing, sizeKey);
    return {
      size,
      icons: getButtonIconMetrics(theme.spacing, sizeKey),
      slots: getButtonSlotMetrics(theme.spacing, sizeKey, condensed),
    };
  }, [theme.spacing, sizeKey, condensed]);

  const startContent = resolveSlot(startProp, leftIcon, 'start', 'leftIcon');
  const endContent = resolveSlot(endProp, rightIcon, 'end', 'rightIcon');
  const hasStart = startContent != null || props.loading;
  const hasEnd = endContent != null;

  const sizeBaseStyle = useMemo(
    () => ({
      minHeight: layout.size.minHeight,
      paddingVertical: layout.size.paddingVertical,
      paddingHorizontal: layout.size.paddingHorizontal,
    }),
    [layout.size]
  );

  const slotPad = layout.slots;
  const recipePadH = style.paddingHorizontal?.[sizeKey];
  const padHOverride = useMemo<ViewStyle | null>(() => {
    if (!contained) {
      return { paddingHorizontal: theme.spacing['0-5'], paddingVertical: 0 };
    }
    if (hasStart && hasEnd) {
      return { paddingHorizontal: Math.min(slotPad.padWithStart, slotPad.padWithEnd) };
    }
    if (hasStart) {
      return {
        paddingLeft: slotPad.padWithStart,
        paddingRight: layout.size.paddingHorizontal,
        paddingHorizontal: undefined,
      };
    }
    if (hasEnd) {
      return {
        paddingLeft: layout.size.paddingHorizontal,
        paddingRight: slotPad.padWithEnd,
        paddingHorizontal: undefined,
      };
    }
    if (recipePadH != null) return { paddingHorizontal: recipePadH };
    if (condensed) return null; // condensed already has its own padH
    return null;
  }, [
    theme.spacing,
    layout.size.paddingHorizontal,
    recipePadH,
    contained,
    condensed,
    hasStart,
    hasEnd,
    slotPad.padWithStart,
    slotPad.padWithEnd,
  ]);

  // Brand ornament (decoration) — resolved from DecorationContext, same path as
  // web's `useComponentDecoration('Button')`. `props.decoration` acts as a direct
  // override: pass `null` to suppress a context-provided ornament, pass a
  // DecorationConfig to force a specific ornament.
  const contextDecoration = useComponentDecoration('Button');
  const decoration = props.decoration !== undefined ? props.decoration : contextDecoration;
  const isGhost = resolvedVariant === 'ghost';
  const ornament = useMemo(
    () => resolveOrnamentData(contained ? decoration : null, isGhost),
    [contained, decoration, isGhost]
  );
  // Mirrors web: calc(var(--_btn-min-h) * ratio * var(--Button-ornamentHeightScale, 1))
  const ornamentWidth = ornament
    ? Math.round(layout.size.minHeight * ornament.aspectRatio * style.ornamentHeightScale)
    : 0;
  const [ornamentPressed, setOrnamentPressed] = useState(false);

  // Effective borderRadius — pre-resolved by resolveButtonStyle (4-source chain:
  // tokenRef > recipe > shapeLanguage > Shape-Pill).
  // Always inlined (never from StyleSheet): Android requires borderRadius in the
  // same style object as backgroundColor so the background clip sees the radius.
  const borderBaseRadius = style.borderRadius;

  // Always produces an inline borderRadius for contained buttons so Android
  // sees it in the same style layer as backgroundColor. When an ornament is
  // attached, zero out the matching corner radii so the ornament meets a
  // straight edge.
  const radiusOverride = useMemo<ViewStyle | null>(() => {
    if (!contained) return null;
    const base: ViewStyle = { borderRadius: borderBaseRadius };
    if (!ornament) return base;
    const cornerOverrides: ViewStyle = {};
    if (ornament.showLeft) {
      cornerOverrides.borderTopLeftRadius = 0;
      cornerOverrides.borderBottomLeftRadius = 0;
    }
    if (ornament.showRight) {
      cornerOverrides.borderTopRightRadius = 0;
      cornerOverrides.borderBottomRightRadius = 0;
    }
    return { ...base, ...cornerOverrides };
  }, [contained, borderBaseRadius, ornament]);

  // Tap-scale spring animation. Target + tuning come from `useMotion()` so a
  // brand (or accessibility preset) can swap scale ratios / spring physics
  // for the whole tree by passing `motionOverrides` to the theme provider.
  const motion = useMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const pressTarget = tapTargetFor(numericSize, fullWidth, motion);
  // `loading` is a busy state, not disabled (shared `resolveButtonStateBase`):
  // it must still suppress activation + tap-scale so a spinning button can't be
  // re-pressed, without marking the control `accessibilityState.disabled`.
  const isInteractionBlocked = isDisabled || Boolean(props.loading);
  const onPressIn = (): void => {
    setOrnamentPressed(true);
    if (activeGradient) setIsGradientPressed(true);
    if (reduceMotion || isInteractionBlocked) return;
    Animated.spring(scale, {
      toValue: pressTarget,
      useNativeDriver: true,
      ...motion.spring.pressIn,
    }).start();
  };
  const onPressOut = (): void => {
    setOrnamentPressed(false);
    if (activeGradient) setIsGradientPressed(false);
    if (reduceMotion || isInteractionBlocked) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...motion.spring.pressOut,
    }).start();
  };

  const handlePress = isInteractionBlocked ? undefined : (onPress ?? onClick);

  // Stable wrapper transform style — Animated.Value is ref-stable.
  const wrapperStyle = useMemo<ViewStyle>(() => ({ transform: [{ scale }] }), [scale]);

  // Slot surface mode pre-resolved by resolveButtonStyle from variant + emphasisStyle.
  const effectiveMode = style.slotSurfaceMode;

  // Pressable's style callback. Layered: registered base IDs first, then
  // runtime overrides (paint, opacity, recipe, fullWidth, caller's style).
  //
  // IMPORTANT: always pass this function directly to Pressable — never wrap it
  // in an array like `[pressableStyle, extraObj]`. Pressable only invokes the
  // style as a function when `typeof style === 'function'`; an array wrapper
  // makes Pressable treat the function as a static StyleProp (ignoring it),
  // which means radiusOverride (corner-zeroing for ornaments) is never applied.
  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.container,
      sizeBaseStyle,
      radiusOverride,
      padHOverride,
      fullWidth ? styles.containerFullWidth : { alignSelf: 'flex-start' },
      contained && {
        backgroundColor: showGradient ? 'transparent' : pressed ? paint.pressedBg : paint.bg,
      },
      !contained ? { minHeight: undefined } : null,
      // emphasisStyle:outline — all-side border. borderRadius + borderWidth must
      // be in the same object for Android to clip the border to the corner radius.
      // radiusOverride is spread here so ornament-side corners (zeroed there) are
      // not overridden by a blanket borderRadius: borderBaseRadius.
      paint.borderColor
        ? {
          borderColor: paint.borderColor,
          borderWidth: paint.borderWidth ?? 1,
          ...(radiusOverride ?? { borderRadius: borderBaseRadius }),
        }
        : null,
      // Only `disabled` dims. `loading` is a busy state (spinner) and renders at
      // full opacity so a loading button reads as active, not disabled.
      props.disabled ? { opacity: DISABLED_OPACITY } : null,
      styleProp as StyleProp<ViewStyle>,
    ],
    [
      sizeBaseStyle,
      contained,
      radiusOverride,
      padHOverride,
      fullWidth,
      showGradient,
      paint.pressedBg,
      paint.bg,
      paint.borderColor,
      paint.borderWidth,
      borderBaseRadius,
      props.disabled,
      styleProp,
    ]
  );

  // Label style — registered `textAlign: center` + brand-resolved typography
  // + runtime paint + recipe overrides. `lineHeight` comes from
  // `useTypographyTokens` (native ceil(fontSize × 1.25) rule).
  //
  // Uncontained buttons read their label colour from the neutral role's page
  // foreground (`Neutral-High`) rather than the variant paint, since
  // `paint.text` for ghost is the variant tint — too low-contrast for body
  // copy. Mirrors the web behaviour where uncontained Button reads the
  // ambient text colour.
  const neutral = useSurfaceTokens('neutral');

  const resolvedTextColor = useMemo(() => {
    if (!contained) {
      if (attention === 'high' || resolvedVariant === 'bold') {
        return role.content.tintedA11y;
      }
      if (attention === 'medium' || resolvedVariant === 'subtle') {
        return neutral.content.high;
      }
      return neutral.content.low;
    }
    return paint.text;
  }, [contained, attention, resolvedVariant, role, neutral, paint]);

  const labelStyle = useMemo(
    () => [
      styles.labelAlign,
      {
        fontFamily: style.labelFontFamily,
        fontSize: style.labelFontSize,
        lineHeight: style.labelLineHeight,
        fontWeight: style.labelFontWeight,
      },
      { color: resolvedTextColor },
      style.textTransform ? { textTransform: style.textTransform } : null,
      style.letterSpacing != null ? { letterSpacing: style.letterSpacing } : null,
    ],
    [style, resolvedTextColor],
  );

  const dataSet = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(dataAttrs)) {
      if (value === undefined) continue;
      const name = key.startsWith('data-') ? key.slice(5) : key;
      out[name] = value;
    }
    if (ornament) {
      out['has-decoration'] = '';
    }
    return out;
  }, [dataAttrs, ornament]);

  return (
    <Animated.View
      style={[
        wrapperStyle,
        { width: fullWidth ? '100%' : undefined },
        ornament ? {
          paddingLeft: ornament.showLeft ? ornamentWidth : 0,
          paddingRight: ornament.showRight ? ornamentWidth : 0,
          overflow: 'visible' as const,
        } : null,
      ]}
      pointerEvents={isInteractionBlocked ? 'none' : 'auto'}
    >
      {ornament?.showLeft && (
        <Ornament
          side="left"
          viewBox={ornament.viewBox}
          fillPath={ornament.fillPath}
          strokePath={paint.bg !== 'transparent' ? ornament.strokePath : null}
          mirrorTransform={ornament.leftMirrorTransform}
          fill={ornamentPressed ? paint.pressedBg : paint.bg}
          strokeColor={role.content.strokeLow}
          strokeWidth={paint.borderWidth ?? GHOST_ORNAMENT_STROKE_WIDTH}
          width={ornamentWidth}
        />
      )}
      <Pressable
        {...getButtonAccessibilityProps(
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
          { isDisabled }
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
        {showGradient && (
          <View
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onLayout={e => setGradientDims({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
            pointerEvents="none"
          >
            {gradientDims && (
              <MetallicGradientFill
                colors={activeGradient!.colors}
                locations={activeGradient!.locations}
                strokeColors={paint.strokeWidth != null ? activeGradient!.strokeColors : undefined}
                strokeLocations={paint.strokeWidth != null ? activeGradient!.strokeLocations : undefined}
                angle={activeGradient!.angle}
                width={gradientDims.w}
                height={gradientDims.h}
                borderRadius={radiusOverride ? undefined : borderBaseRadius}
                borderRadii={radiusOverride ? {
                  topLeft: (radiusOverride.borderTopLeftRadius ?? radiusOverride.borderRadius ?? borderBaseRadius) as number,
                  topRight: (radiusOverride.borderTopRightRadius ?? radiusOverride.borderRadius ?? borderBaseRadius) as number,
                  bottomLeft: (radiusOverride.borderBottomLeftRadius ?? radiusOverride.borderRadius ?? borderBaseRadius) as number,
                  bottomRight: (radiusOverride.borderBottomRightRadius ?? radiusOverride.borderRadius ?? borderBaseRadius) as number,
                } : undefined}
                borderWidth={paint.strokeWidth}
              />
            )}
          </View>
        )}
        {props.loading && (
          <View testID="button-spinner" {...getButtonFamilyLoadingSpinnerAccessibility()}>
            <ButtonSlot
              side="start"
              width={layout.icons.start}
              height={layout.icons.start}
              gap={layout.slots.gapStart}
              mode={effectiveMode}
              appearance={resolvedAppearance}
              iconColor={resolvedTextColor}
            >
              <Spinner
                size={layout.icons.start}
                color={resolvedTextColor}
                reduceMotion={reduceMotion}
              />
            </ButtonSlot>
          </View>
        )}
        {startContent != null && (
          <ButtonSlot
            side="start"
            testID="button-start-slot"
            width={layout.icons.start}
            height={layout.icons.start}
            gap={layout.slots.gapStart}
            mode={effectiveMode}
            appearance={resolvedAppearance}
            iconColor={resolvedTextColor}
          >
            {startContent}
          </ButtonSlot>
        )}
        <Text
          style={labelStyle}
          numberOfLines={1}
          accessible={!props.loading}
          accessibilityElementsHidden={!!props.loading}
        >
          {children}
        </Text>
        {endContent != null && (
          <ButtonSlot
            side="end"
            testID="button-end-slot"
            width={layout.icons.end}
            height={layout.icons.end}
            gap={layout.slots.gapEnd}
            mode={effectiveMode}
            appearance={resolvedAppearance}
            iconColor={resolvedTextColor}
          >
            {endContent}
          </ButtonSlot>
        )}
      </Pressable>
      {ornament?.showRight && (
        <Ornament
          side="right"
          viewBox={ornament.viewBox}
          fillPath={ornament.fillPath}
          strokePath={paint.bg !== 'transparent' ? ornament.strokePath : null}
          mirrorTransform={undefined}
          fill={ornamentPressed ? paint.pressedBg : paint.bg}
          strokeColor={role.content.strokeLow}
          strokeWidth={paint.borderWidth ?? GHOST_ORNAMENT_STROKE_WIDTH}
          width={ornamentWidth}
        />
      )}
    </Animated.View>
  );
}

export type { ButtonProps, ButtonNativeProps } from './interface';