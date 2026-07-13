/**
 * Radio.native.tsx
 *
 * RN peer of `packages/ui/src/components/Radio/Radio.tsx` — the standalone
 * radio leaf. Selection across multiple options is the parent's
 * responsibility (typically `RadioField`); Radio itself is a self-contained
 * controlled/uncontrolled toggle.
 *
 * Visual model (mirrors `Radio.module.css`):
 *   - Unchecked    → transparent fill + role-stroke border (`role.content.strokeMedium`).
 *   - Checked      → role bold fill + on-bold tinted-a11y dot (`role.surfaces.bold` /
 *                    `role.onBoldContent.tintedA11y`).
 *   - Read-only    → solid `--{Role}-High` fill+border (distinct from disabled).
 *   - Disabled     → opacity reduction, no press.
 *
 * State API:
 *   - `checked` (controlled) — Radio renders against this value; `onChange`
 *     fires with the intended next state on press but Radio does not flip
 *     itself.
 *   - `defaultChecked` (uncontrolled) — initial state; press toggles internal
 *     state and fires `onChange` with the new value.
 *   - `onPress` (raw) — always fires before `onChange`, regardless of mode.
 *
 * Web parity gaps documented in `docs/parity/radio-web-native-parity.md`:
 *   - Web `<RadioGroup>` orchestrator has no native peer; multi-option
 *     semantics live in `RadioField`.
 *   - Press-scale (1.07) + indicator scale-burst (2 → 1) crossfade are
 *     simplified to opacity-only on native.
 *   - The Informative-Bold focus halo has no native counterpart (RN touch
 *     surfaces have no focus indicator).
 *
 * Recipe-aware: `cornerRadius` decision overrides the default `Shape-Pill`
 * radius via `resolveRecipeBorderRadius(decisions, shape)`.
 */

import React, { useCallback, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  useComponentRecipe,
  useComponentTheme,
  useOneUITheme,
  useSurfaceTokens,
  useTypographyTokens,
  resolveRecipeBorderRadius,
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  typographyToTextStyle,
  type NativeRoleTokens,
} from '../../theme';
import { getRadioAccessibilityProps, useRadioState, type RadioProps } from './interface';
import {
  RADIO_BOX_SIZE,
  RADIO_DESCRIPTION_BODY_SIZE,
  RADIO_DISABLED_OPACITY,
  RADIO_DOT_SIZE,
  RADIO_LABEL_BODY_SIZE,
  RADIO_STROKE_M_WIDTH,
  styles,
} from './Radio.styles.native';

// ─── Paint resolver ────────────────────────────────────────────────────────
//
// Mirrors the `--_rd-*` cascade in `Radio.module.css`:
//
//   web                                native
//   --_rd-default-medium-stroke    ↔  role.content.strokeMedium
//   --_rd-default-high             ↔  role.content.high (read-only fill)
//   --_rd-bold                     ↔  role.surfaces.bold
//   --_rd-bold-high                ↔  role.onBoldContent.tintedA11y
//                                       fallback → role.onBoldContent.high
//   --_rd-bold-pressed             ↔  role.states.boldPressed
//   --_rd-default-pressed          ↔  Neutral pressed surface tint

interface RadioPaint {
  borderColor: string;
  backgroundColor: string;
  pressedBackgroundColor: string;
  indicatorColor: string;
  borderWidth: number;
}

function paintFor(
  role: NativeRoleTokens,
  state: { isChecked: boolean; isReadOnly: boolean }
): RadioPaint {
  if (state.isReadOnly) {
    const highFill = role.content.high;
    return {
      borderColor: highFill,
      backgroundColor: state.isChecked ? highFill : 'transparent',
      pressedBackgroundColor: state.isChecked ? highFill : 'transparent',
      indicatorColor: role.onBoldContent.tintedA11y,
      borderWidth: RADIO_STROKE_M_WIDTH,
    };
  }

  if (state.isChecked) {
    return {
      borderColor: role.surfaces.bold,
      backgroundColor: role.surfaces.bold,
      pressedBackgroundColor: role.states.boldPressed,
      indicatorColor: role.onBoldContent.tintedA11y,
      borderWidth: RADIO_STROKE_M_WIDTH,
    };
  }

  return {
    borderColor: role.content.strokeMedium,
    backgroundColor: 'transparent',
    pressedBackgroundColor: role.states.subtlePressed,
    indicatorColor: role.onBoldContent.tintedA11y,
    borderWidth: RADIO_STROKE_M_WIDTH,
  };
}

// ─── Default radius (Shape-Pill = circular) ────────────────────────────────

const PILL_RADIUS = 9999;

function dotRadiusFor(boxRadius: number, boxSize: number, dotSize: number): number {
  // Mirrors the web `max(0, calc(boxRadius - (boxSize - dotSize) / 2))`.
  return Math.max(0, boxRadius - (boxSize - dotSize) / 2);
}

// ============================================================================
// Radio
// ============================================================================

export function Radio(props: RadioProps): React.ReactElement {
  const {
    label,
    description,
    children,
    labelSuffixInside,
    labelTrailing,
    errorHighlight,
    checked: controlledChecked,
    defaultChecked,
    onChange,
    onPress,
    style: styleProp,
    testID,
  } = props;

  // Controlled vs. uncontrolled checked state.
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState<boolean>(defaultChecked === true);
  const effectiveChecked = isControlled ? controlledChecked === true : internalChecked;

  const state = useRadioState({ ...props, checked: effectiveChecked });
  const { isDisabled, isReadOnly, isChecked, resolvedAppearance, resolvedSize } = state;

  const role = useSurfaceTokens(isReadOnly ? 'neutral' : resolvedAppearance);
  const { shape } = useOneUITheme();
  const recipeDecisions = useComponentRecipe('radio');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  const componentTheme = useComponentTheme('radio');

  const paint = paintFor(role, { isChecked, isReadOnly });
  const a11y = getRadioAccessibilityProps(props, {
    isDisabled,
    isReadOnly,
    isChecked,
  });

  const labelTypo = useTypographyTokens('body', RADIO_LABEL_BODY_SIZE[resolvedSize], {
    emphasis: 'low',
  });
  const descriptionTypo = useTypographyTokens('body', RADIO_DESCRIPTION_BODY_SIZE, {
    emphasis: 'low',
  });

  const boxSide = RADIO_BOX_SIZE[resolvedSize];
  const dotPx = RADIO_DOT_SIZE[resolvedSize];
  const shapeLanguageRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, shape) ??
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'inputs');
  const boxRadius = shapeLanguageRadius ?? PILL_RADIUS;
  const dotRadius = shapeLanguageRadius != null
    ? dotRadiusFor(shapeLanguageRadius, boxSide, dotPx)
    : PILL_RADIUS;

  const handlePress = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    onPress?.();
    const next = !effectiveChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  }, [isDisabled, isReadOnly, onPress, effectiveChecked, isControlled, onChange]);

  const boxStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.box,
      {
        width: boxSide,
        height: boxSide,
        borderRadius: boxRadius,
        borderWidth: paint.borderWidth,
        borderColor: errorHighlight ? role.content.tintedA11y : paint.borderColor,
        backgroundColor: pressed ? paint.pressedBackgroundColor : paint.backgroundColor,
      },
    ],
    [
      boxSide,
      boxRadius,
      paint.borderColor,
      paint.backgroundColor,
      paint.pressedBackgroundColor,
      paint.borderWidth,
      errorHighlight,
      role.content.tintedA11y,
    ]
  );

  const indicatorStyle: ViewStyle = {
    width: dotPx,
    height: dotPx,
    borderRadius: dotRadius,
    backgroundColor: paint.indicatorColor,
    opacity: isChecked ? 1 : 0,
  };

  const labelTextStyle: StyleProp<TextStyle> = [
    typographyToTextStyle(labelTypo),
    { color: role.content.high },
  ];
  const descriptionTextStyle: StyleProp<TextStyle> = [
    typographyToTextStyle(descriptionTypo),
    { color: role.content.medium },
  ];

  const wrapperStyle: StyleProp<ViewStyle> = [
    styles.wrapper,
    isDisabled && !isReadOnly ? { opacity: RADIO_DISABLED_OPACITY } : null,
    styleProp,
  ];

  const inlineLabel: React.ReactNode = label != null ? label : children;
  const hasAnyTrailing =
    inlineLabel != null || description || labelSuffixInside != null || labelTrailing != null;

  return (
    <View style={wrapperStyle}>
      <Pressable
        {...a11y}
        testID={testID}
        disabled={isDisabled || isReadOnly}
        onPress={handlePress}
        style={boxStyle}
      >
        <View style={[styles.indicator, indicatorStyle]} />
      </Pressable>
      {hasAnyTrailing ? (
        <View style={styles.besideColumn}>
          {inlineLabel != null || labelSuffixInside != null || labelTrailing != null ? (
            <View style={styles.labelRow}>
              {inlineLabel != null || labelSuffixInside != null ? (
                <View style={styles.labelTextRow}>
                  {typeof inlineLabel === 'string' ? (
                    <Text style={labelTextStyle} accessible={false}>
                      {inlineLabel}
                    </Text>
                  ) : (
                    inlineLabel
                  )}
                  {labelSuffixInside}
                </View>
              ) : null}
              {labelTrailing ? <View style={styles.labelTrailing}>{labelTrailing}</View> : null}
            </View>
          ) : null}
          {description ? (
            <Text style={descriptionTextStyle} accessible={false}>
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

Radio.displayName = 'Radio';

export type { RadioProps, RadioNativeProps } from './interface';
