/**
 * IconButton.native.tsx
 *
 * RN peer of `packages/ui/src/components/IconButton/IconButton.tsx`.
 * Square/wide icon-only control; geometry from `iconButtonLayout.ts`, paint
 * from `useSurfaceTokens`, icon slot via `Icon` + `ComponentSlotIconContext`.
 */

import React, { isValidElement, useCallback, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { IconComponent, SemanticIconName } from '@oneui/shared';
import { resolvePressableHitSlop } from '../../utils/touchTargetA11y';
import {
  getIconButtonAccessibilityProps,
  useIconButtonState,
  type IconButtonLayout,
  type IconButtonPaintMode,
  type IconButtonProps,
} from './interface';
import { Icon } from '../Icon';
import {
  Surface,
  useComponentRecipe,
  useComponentTheme,
  useMotion,
  useOneUITheme,
  useReduceMotion,
  useSurfaceTokens,
  resolveRecipeBorderRadius,
  resolveShapeLanguageBorderRadius,
  type NativeRoleTokens,
  type NativeShape,
} from '../../theme';
import { asIconAppearance, type IconAppearance, type IconEmphasis } from '../Icon/interface';
import type { SurfaceToken } from '@oneui/shared/engine';
import { Spinner } from '../Spinner/Spinner.native';
import {
  getIconButtonMetrics,
  getPaddingHorizontal,
  ICON_BUTTON_SPINNER_SIZE,
  type IconButtonNumericSize,
} from './iconButtonLayout';
import { DISABLED_OPACITY, styles } from './IconButton.styles.native';

interface Paint {
  bg: string;
  pressedBg: string;
  borderColor?: string;
  borderWidth?: number;
}

/**
 * Surface mode that paints the IconButton AND establishes the surface
 * context for the inner `<Icon appearance={role}>` to resolve against.
 *
 *   high attention   → mode='bold'   → on-bold tokens for icon
 *   medium attention → mode='subtle' → on-subtle tokens for icon
 *   low attention    → mode='ghost'  → inherits parent surface step so the icon
 *                                    resolves correctly when nested inside a
 *                                    bold/subtle container (web parity: ghost
 *                                    inherits currentColor from the ambient
 *                                    surface, not a reset to the page).
 */
const PAINT_MODE_TO_SURFACE: Record<IconButtonPaintMode, SurfaceToken> = {
  bold: 'bold',
  subtle: 'subtle',
  ghost: 'ghost',
};

const PAINT_MODE_PAINT: Record<IconButtonPaintMode, (role: NativeRoleTokens) => Paint> = {
  bold: (role) => ({
    bg: role.surfaces.bold,
    pressedBg: role.states.boldPressed,
  }),
  subtle: (role) => ({
    bg: role.surfaces.subtle,
    pressedBg: role.states.subtlePressed,
  }),
  ghost: (role) => ({
    bg: 'transparent',
    pressedBg: role.states.subtleHover,
  }),
};

interface PaintWithMode {
  paint: Paint;
  mode: SurfaceToken;
}

/** Factory attention style per variant — that style is a no-op. */
const ICON_BUTTON_FACTORY_ATTENTION_STYLE: Record<string, string> = {
  bold: 'solid',
  subtle: 'tonal',
  ghost: 'quiet',
};

function applyIconButtonAttentionStyleToPaint(
  basePaint: Paint,
  baseMode: SurfaceToken,
  style: string | undefined,
  role: NativeRoleTokens,
  variant: string
): PaintWithMode {
  if (!style || style === ICON_BUTTON_FACTORY_ATTENTION_STYLE[variant]) {
    return { paint: basePaint, mode: baseMode };
  }
  switch (style) {
    case 'solid':
      return {
        paint: { bg: role.surfaces.bold, pressedBg: role.states.boldPressed },
        mode: 'bold',
      };
    case 'tonal':
      return {
        paint: { bg: role.surfaces.subtle, pressedBg: role.states.subtlePressed },
        mode: 'subtle',
      };
    case 'outline':
      return {
        paint: {
          bg: 'transparent',
          pressedBg: role.states.subtleHover,
          borderColor: role.content.tintedA11y,
          borderWidth: 1,
        },
        mode: 'ghost',
      };
    case 'quiet':
      return {
        paint: { bg: 'transparent', pressedBg: role.states.subtlePressed },
        mode: 'ghost',
      };
    default:
      return { paint: basePaint, mode: baseMode };
  }
}


function tapPressTarget(
  fullWidth: boolean | undefined,
  layout: IconButtonLayout,
  motion: ReturnType<typeof useMotion>
): number {
  if (fullWidth) return motion.tapScale.fullWidth;
  if (layout === '3:2') return motion.tapScale.default;
  return motion.tapScale.default;
}

/**
 * Web parity: web uses `--{Role}-Bold-TintedA11y` for bold icon colour (not Bold-High),
 * so all modes default to `'tintedA11y'` — branded accessible colour at the surface step.
 * Keyed by surfaceMode; empty = every mode falls back to `'tintedA11y'` in resolveIconContent.
 */
const MODE_ICON_EMPHASIS: Partial<Record<SurfaceToken, IconEmphasis>> = {};

function resolveIconContent(
  icon: SemanticIconName | React.ReactElement | IconComponent,
  appearance: IconAppearance,
  surfaceMode: SurfaceToken,
  iconPx: number
): React.ReactElement | null {
  if (isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || typeof icon === 'string') {
    return (
      <Icon
        icon={icon as IconComponent | SemanticIconName}
        appearance={appearance}
        emphasis={MODE_ICON_EMPHASIS[surfaceMode] ?? 'tintedA11y'}
        size={iconPx}
        aria-hidden
      />
    );
  }
  return null;
}

export function IconButton(props: IconButtonProps): React.ReactElement {
  const {
    icon,
    condensed,
    layout = '1:1',
    fullWidth,
    onPress,
    onClick,
    'aria-label': ariaLabel,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    accessibilityHint,
    testID,
    style: styleProp,
  } = props;

  const { isDisabled, resolvedVariant, resolvedAppearance, numericSize, contained, dataAttrs } =
    useIconButtonState(props as IconButtonProps);
  // Uncontained: bare icon — transparent, icon-sized, no padding; layout/fullWidth ignored.
  const effLayout: IconButtonLayout = contained ? layout : '1:1';
  const effFullWidth = contained ? fullWidth : false;
  const { spacing, shape } = useOneUITheme();
  const role = useSurfaceTokens(resolvedAppearance);
  const basePaint = PAINT_MODE_PAINT[resolvedVariant](role);
  const baseMode = PAINT_MODE_TO_SURFACE[resolvedVariant];
  const componentTheme = useComponentTheme('iconbutton');
  // Per-level attention styles: High→bold, Medium→subtle, Low→ghost.
  // The legacy emphasisStyle key aliases the High level.
  const attentionStyle =
    resolvedVariant === 'bold'
      ? componentTheme.highAttentionStyle ?? componentTheme.emphasisStyle
      : resolvedVariant === 'subtle'
        ? componentTheme.mediumAttentionStyle
        : componentTheme.lowAttentionStyle;
  const { paint, mode: surfaceMode } = applyIconButtonAttentionStyleToPaint(
    basePaint,
    baseMode,
    attentionStyle,
    role,
    resolvedVariant
  );
  const reduceMotion = useReduceMotion();
  const motion = useMotion();
  const recipeDecisions = useComponentRecipe('IconButton');
  const effectiveRadius =
    resolveRecipeBorderRadius(recipeDecisions, shape) ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'actions') ??
    shape.Pill;

  const sizeKey = numericSize as IconButtonNumericSize;
  const metrics = getIconButtonMetrics(spacing, sizeKey, condensed);
  const paddingHorizontal = contained
    ? getPaddingHorizontal(spacing, sizeKey, condensed, effLayout)
    : 0;
  const spinnerSize = ICON_BUTTON_SPINNER_SIZE[sizeKey];

  // Uncontained drops the chip fill/border entirely; the bare icon sits on the page.
  const effPaint: Paint = contained ? paint : { bg: 'transparent', pressedBg: 'transparent' };
  const effRadius = contained ? effectiveRadius : 0;

  const scale = useRef(new Animated.Value(1)).current;
  const pressTarget = tapPressTarget(effFullWidth, effLayout, motion);

  // `loading` is a busy state, not disabled (shared `resolveButtonStateBase`):
  // still suppress activation + tap-scale while busy, without marking the
  // control `accessibilityState.disabled`.
  const isInteractionBlocked = isDisabled || Boolean(props.loading);

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

  const boxMetrics = useMemo(() => {
    if (!contained) {
      // Bare icon: hug the icon, no chip box. hitSlop still guarantees 44px target.
      return { width: metrics.icon, height: metrics.icon };
    }
    const height = metrics.container;
    const width = effLayout === '3:2' || effFullWidth ? undefined : metrics.container;

    return { width, height };
  }, [contained, metrics.icon, metrics.container, effLayout, effFullWidth]);

  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.pressable,
      {
        width: boxMetrics.width,
        height: boxMetrics.height,
        minWidth: boxMetrics.width ?? undefined,
        paddingHorizontal: paddingHorizontal,
        borderRadius: effRadius,
        backgroundColor: pressed ? effPaint.pressedBg : effPaint.bg,
        borderColor: effPaint.borderColor,
        borderWidth: effPaint.borderWidth,
      },
      effFullWidth ? styles.pressableFullWidth : { alignSelf: 'flex-start' },
      // Only `disabled` dims. `loading` is a busy state and renders at full
      // opacity so a loading button reads as active, not disabled.
      props.disabled ? { opacity: DISABLED_OPACITY } : null,
      styleProp as ViewStyle,
    ],
    [
      boxMetrics,
      effRadius,
      effPaint,
      effFullWidth,
      props.disabled,
      styleProp,
      paddingHorizontal,
    ]
  );

  const dataSet = useMemo(() => {
    const out: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(dataAttrs)) {
      if (value === undefined) continue;
      out[key.startsWith('data-') ? key.slice(5) : key] = value;
    }
    return out;
  }, [dataAttrs]);

  const hitSlop = useMemo(
    () => resolvePressableHitSlop(boxMetrics.width, boxMetrics.height),
    [boxMetrics.width, boxMetrics.height]
  );

  const iconContent = resolveIconContent(
    icon,
    asIconAppearance(resolvedAppearance),
    surfaceMode,
    metrics.icon
  );

  return (
    <Animated.View style={{ transform: [{ scale }] }} pointerEvents={isInteractionBlocked ? 'none' : 'auto'}>
      <Pressable
        {...getIconButtonAccessibilityProps(
          {
            'aria-label': ariaLabel,
            'aria-expanded': ariaExpanded,
            'aria-haspopup': ariaHaspopup,
            accessibilityHint,
            loading: props.loading,
            disabled: props.disabled,
          },
          { isDisabled }
        )}
        hitSlop={hitSlop}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        testID={testID}
        style={pressableStyle}
        {...({ dataSet } as object)}
      >
        {props.loading ? (
          <Spinner size={spinnerSize} label="Loading" />
        ) : (
          // Surface establishes the [data-surface]-equivalent context so the
          // inner Icon (with appearance={resolvedAppearance}) resolves to the
          // on-bold / on-subtle / page-level tintedA11y colour automatically.
          // Background is suppressed (Pressable already paints `paint.bg`).
          <Surface
            mode={surfaceMode}
            appearance={resolvedAppearance}
            style={[
              styles.iconWrap,
              { width: metrics.icon, height: metrics.icon, backgroundColor: 'transparent' },
            ]}
          >
            <View
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
              style={{
                width: metrics.icon,
                height: metrics.icon,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {iconContent}
            </View>
          </Surface>
        )}
      </Pressable>
    </Animated.View>
  );
}

export type { IconButtonProps, IconButtonNativeProps } from './interface';
