/**
 * Checkbox.native.tsx
 *
 * RN peer of `packages/ui/src/components/Checkbox/Checkbox.tsx`.
 *
 * Visual model (mirrors `Checkbox.module.css`):
 *   - Unchecked  → transparent fill + role-stroke border
 *   - Checked    → role bold fill + on-bold tinted-a11y check glyph
 *   - Indeterminate → role bold fill + on-bold tinted-a11y minus glyph
 *   - Read-only  → solid `--{Role}-High` fill/border (distinct from disabled)
 *   - Disabled   → opacity reduction, no press
 *
 * `appearance` drives BOTH the unchecked context and the checked fill —
 * matching the web "remap all 8 vars" approach (`--_cb-default-*` +
 * `--_cb-bold-*`). Native reads the equivalent role tokens from
 * `useSurfaceTokens(appearance)`.
 *
 * Surface context: rendered inside `<Surface mode="…">`, the resolved role
 * tokens are remapped automatically by the surface engine, so a checkbox
 * placed on a bold or subtle surface stays distinguishable without any
 * caller-side adaptation.
 *
 * Recipe-aware: `cornerRadius` decision can override the default
 * `Shape-1 / 1-5 / 2` per-size radii via
 * `resolveRecipeBorderRadius(decisions, shape)`.
 *
 * Web parity gaps documented in `docs/parity/checkbox-web-native-parity.md`:
 *   - press-scale spring + indeterminate↔checked rotation crossfade are
 *     replaced by a simple opacity fade; the static visual matches but
 *     the choreography is simplified.
 *   - Field-stack helpers (`labelAssociation` / `labelWrapper` /
 *     `labelTrailing` / etc.) are not mirrored — RN has no `<Field>`.
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
import Svg, { Path } from 'react-native-svg';
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
  type NativeShape,
} from '../../theme';
import {
  getCheckboxAccessibilityProps,
  useCheckboxState,
  type CheckboxProps,
} from './interface';
import {
  BOX_SIZE,
  DESCRIPTION_BODY_SIZE,
  DISABLED_OPACITY,
  ICON_GLYPH_SIZE,
  SIZE_TO_BODY,
  STROKE_M_WIDTH,
  styles,
} from './Checkbox.styles.native';

// ─── Inline glyphs (mirror web Icon name="check" / name="remove") ───────────
//
// The RN Icon resolver does not yet load the Jio "check" / "remove" semantic
// names — wiring those is tracked separately. The two paths below come from
// the Material Icons set used by the web `lucide` fallback so the visual
// stays identical regardless of brand override.

const CHECK_PATH = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
const MINUS_PATH = 'M19 13H5v-2h14v2z';

interface GlyphProps {
  size: number;
  color: string;
}

function CheckGlyph({ size, color }: GlyphProps): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24'>
      <Path d={CHECK_PATH} fill={color} />
    </Svg>
  );
}

function MinusGlyph({ size, color }: GlyphProps): React.ReactElement {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24'>
      <Path d={MINUS_PATH} fill={color} />
    </Svg>
  );
}

// ─── Paint resolver ────────────────────────────────────────────────────────
//
// Mirrors the `--_cb-*` intermediate variable cascade in `Checkbox.module.css`:
//
//   web                                 native
//   --_cb-default-medium-stroke    ↔   role.content.strokeMedium
//   --_cb-default-high             ↔   role.content.high (also Text-High)
//   --_cb-bold                     ↔   role.surfaces.bold
//   --_cb-bold-high                ↔   role.onBoldContent.tintedA11y
//                                       fallback → role.onBoldContent.high
//   --_cb-bold-pressed             ↔   role.states.boldPressed
//   --_cb-default-pressed          ↔   role.states.subtlePressed
//                                       (used as the unchecked press tint
//                                        which web wires from
//                                        `--Neutral-Pressed` regardless of
//                                        appearance — matches the spec
//                                        comment: "Unchecked = no role
//                                        committed → neutral surface tints,
//                                        regardless of appearance")
//
// `readOnly` collapses the cascade onto `--_cb-default-high`, the brand role's
// content-high colour, with a contrasting on-bold-tinted-a11y indicator.

interface CheckboxPaint {
  borderColor: string;
  backgroundColor: string;
  pressedBackgroundColor: string;
  indicatorColor: string;
  borderWidth: number;
}

function paintFor(
  role: NativeRoleTokens,
  state: { isSelected: boolean; isIndeterminate: boolean; isReadOnly: boolean },
): CheckboxPaint {
  const isFilled = state.isSelected || state.isIndeterminate;

  // Read-only fill: the brand's content-high colour, mirroring web's
  // `.checkbox[data-readonly][data-selected] { background: --_cb-default-high }`
  // (data-readonly + data-unselected just sets the border to the same value).
  //
  // The indicator must contrast against `content.high` — NOT against
  // `surfaces.bold`. `onBoldContent.tintedA11y` is designed for "on-bold"
  // pairing, so in dark theme (where `content.high` is near-white) it would
  // also be light and the tick disappears against the fill.
  // `surfaces.default` is the natural inverse of `content.high` (it's the
  // page surface that `content.high` is the contrasting text colour for):
  //   - light theme → `content.high` ≈ dark, `surfaces.default` ≈ light → visible
  //   - dark  theme → `content.high` ≈ light, `surfaces.default` ≈ dark → visible
  if (state.isReadOnly) {
    const highFill = role.content.high;
    return {
      borderColor: highFill,
      backgroundColor: isFilled ? highFill : 'transparent',
      pressedBackgroundColor: isFilled ? highFill : 'transparent',
      indicatorColor: role.surfaces.default,
      borderWidth: STROKE_M_WIDTH,
    };
  }

  if (isFilled) {
    return {
      borderColor: role.surfaces.bold,
      backgroundColor: role.surfaces.bold,
      pressedBackgroundColor: role.states.boldPressed,
      indicatorColor: role.onBoldContent.tintedA11y,
      borderWidth: STROKE_M_WIDTH,
    };
  }

  return {
    borderColor: role.content.strokeMedium,
    backgroundColor: 'transparent',
    pressedBackgroundColor: role.states.subtlePressed,
    indicatorColor: role.onBoldContent.tintedA11y,
    borderWidth: STROKE_M_WIDTH,
  };
}

// ─── Per-size border radius (mirrors Shape-1 / Shape-1-5 / Shape-2) ─────────
//
// Web maps S→Shape-1, M→Shape-1-5, L→Shape-2. The native theme exposes the
// matching f-step values via `theme.shape.{NativeShapeKey}` —
// `5XS` (f-6) = 4, `4XS` (f-5) = 6, `3XS` (f-4) = 8 — all density-aware.

function defaultRadiusFor(size: 's' | 'm' | 'l', shape: NativeShape): number {
  if (size === 's') return shape['1'];
  if (size === 'm') return shape['1-5'];
  return shape['2'];
}

// ============================================================================
// Checkbox
// ============================================================================

export function Checkbox(props: CheckboxProps): React.ReactElement {
  const {
    label,
    description,
    labelSuffixInside,
    labelTrailing,
    selected: selectedProp,
    defaultSelected,
    indeterminate = false,
    onSelectedChange,
    onPress,
    errorHighlight,
    style: styleProp,
    testID,
  } = props;

  const isControlled = selectedProp !== undefined;
  const [internalSelected, setInternalSelected] = useState<boolean>(defaultSelected ?? false);
  const isSelected = isControlled ? !!selectedProp : internalSelected;

  const {
    isDisabled,
    isReadOnly,
    resolvedAppearance,
    resolvedSize,
  } = useCheckboxState(props);

  const role = useSurfaceTokens(resolvedAppearance);
  const { shape } = useOneUITheme();
  const recipeDecisions = useComponentRecipe('checkbox');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  const componentTheme = useComponentTheme('checkbox');

  const paint = paintFor(role, {
    isSelected,
    isIndeterminate: indeterminate,
    isReadOnly,
  });
  const a11y = getCheckboxAccessibilityProps(props, {
    isDisabled,
    isReadOnly,
    isSelected,
    isIndeterminate: indeterminate,
  });

  const labelTypo = useTypographyTokens('body', SIZE_TO_BODY[resolvedSize], {
    emphasis: 'low',
  });
  const descriptionTypo = useTypographyTokens('body', DESCRIPTION_BODY_SIZE, {
    emphasis: 'low',
  });

  const boxSide = BOX_SIZE[resolvedSize];
  const iconPx = ICON_GLYPH_SIZE[resolvedSize];
  const borderRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, shape) ??
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'inputs') ??
    defaultRadiusFor(resolvedSize, shape);

  const handlePress = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    const next = indeterminate ? true : !isSelected;
    if (!isControlled) setInternalSelected(next);
    onSelectedChange?.(next);
    onPress?.();
  }, [isDisabled, isReadOnly, indeterminate, isSelected, isControlled, onSelectedChange, onPress]);

  // Box style — radius co-located with backgroundColor + borderColor so
  // Android clips the border to the corner radius (same constraint Button
  // documents in detail).
  const boxStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      styles.box,
      {
        width: boxSide,
        height: boxSide,
        borderRadius,
        borderWidth: paint.borderWidth,
        borderColor: errorHighlight ? role.content.tintedA11y : paint.borderColor,
        backgroundColor: pressed ? paint.pressedBackgroundColor : paint.backgroundColor,
      },
    ],
    [
      boxSide,
      borderRadius,
      paint.borderColor,
      paint.borderWidth,
      paint.backgroundColor,
      paint.pressedBackgroundColor,
      errorHighlight,
      role.content.tintedA11y,
    ],
  );

  const indicatorVisible = isSelected || indeterminate;
  const indicatorWrapStyle: ViewStyle = {
    width: iconPx,
    height: iconPx,
    opacity: indicatorVisible ? 1 : 0,
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
        style={boxStyle}
      >
        <View style={[styles.indicator, indicatorWrapStyle]}>
          {indeterminate ? (
            <MinusGlyph size={iconPx} color={paint.indicatorColor} />
          ) : (
            <CheckGlyph size={iconPx} color={paint.indicatorColor} />
          )}
        </View>
      </Pressable>
      {(label || description || labelSuffixInside || labelTrailing) ? (
        <View style={styles.besideColumn}>
          {(label || labelSuffixInside || labelTrailing) ? (
            <View style={styles.labelRow}>
              {(label || labelSuffixInside) ? (
                <View style={styles.labelTextRow}>
                  {label ? (
                    <Text style={labelTextStyle} accessible={false}>
                      {label}
                    </Text>
                  ) : null}
                  {labelSuffixInside}
                </View>
              ) : null}
              {labelTrailing ? (
                <View style={styles.labelTrailing}>{labelTrailing}</View>
              ) : null}
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

export type { CheckboxProps, CheckboxNativeProps } from './interface';
