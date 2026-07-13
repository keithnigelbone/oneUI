/**
 * CounterBadge.native.tsx
 *
 * RN peer of `packages/ui/src/components/CounterBadge/CounterBadge.tsx`.
 * Static geometry lives in `./CounterBadge.styles.native.ts`. Brand paint
 * and label typography flow inline — same model as Badge.
 */

import React from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import {
  useSurfaceTokens,
  useTypographyTokens,
  useComponentRecipe,
  useComponentTheme,
  resolveRecipeBorderRadius,
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  useOneUITheme,
  type NativeRoleTokens,
} from '../../theme';
import {
  getCounterBadgeAccessibilityProps,
  useCounterBadgeState,
  type CounterBadgeProps,
  type CounterBadgeSize,
  type CounterBadgeVariant,
} from './interface';
import { styles, CONTAINER, SIZE_TO_LABEL } from './CounterBadge.styles.native';
import { useBadgeSlotSize } from '../Badge/BadgeSlotContext';

interface Paint {
  bg: string;
  text: string;
  borderColor?: string;
  borderWidth?: number;
}

function paintFor(
  variant: CounterBadgeVariant,
  role: NativeRoleTokens,
  rootRole: NativeRoleTokens,
): Paint {
  switch (variant) {
    case 'bold':
      // Numeric text uses the ROOT achromatic on-bold-high (white on a saturated
      // brand bold), NOT the context-re-derived one. Inside a bold surface the
      // fill re-steps to a lighter shade; re-deriving on-bold-high against that
      // light fill flips it to black. Web keeps `--{Role}-Bold-High` at the root
      // value (its `[data-surface]` block never re-emits it), so badge counts stay
      // white for maximum contrast. Fill still adapts for a distinguishable pill.
      return { bg: role.surfaces.bold, text: rootRole.onBoldContent.high };
    case 'subtle':
      return { bg: role.surfaces.subtle, text: role.content.tintedA11y };
    case 'ghost':
    default:
      return {
        bg: 'transparent',
        text: role.content.tintedA11y,
        borderColor: role.content.strokeLow,
        borderWidth: tokens.borderWidth.hairline,
      };
  }
}

export function CounterBadge(props: CounterBadgeProps): React.ReactElement | null {
  const { resolvedVariant, resolvedAppearance, displayValue, isHidden } =
    useCounterBadgeState(props);
  const theme = useOneUITheme();
  const { shape } = theme;
  const role = useSurfaceTokens(resolvedAppearance);
  // Root role tokens (page-level, context-immune) — used for the achromatic
  // on-bold-high text so a bold counter keeps white numerals on any surface.
  // Falls back through primary/neutral (mirrors `useSurfaceTokens`) and finally
  // to the context `role` so a brand missing the requested key never throws.
  const rootRole =
    theme.rootRoles[resolvedAppearance] ??
    theme.rootRoles.primary ??
    theme.rootRoles.neutral ??
    role;
  const slotSizes = useBadgeSlotSize();
  const sizeKey = (props.size ?? slotSizes?.counterBadge ?? 'm') as CounterBadgeSize;
  const componentTheme = useComponentTheme('counterbadge');
  const recipeDecisions = useComponentRecipe('counter-badge');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  // Brand tokenRef → recipe → shapeLanguage override, else keep the size default
  // (pill) from CONTAINER[size]. Never emit `borderRadius: undefined` — in RN a
  // later `undefined` overrides the base pill and renders the badge square.
  const overrideBorderRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, shape) ??
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'display');
  const paint = paintFor(resolvedVariant, role, rootRole);
  const labelTypo = useTypographyTokens('label', SIZE_TO_LABEL[sizeKey], {
    emphasis: 'medium',
    lineHeightMultiplier: 1,
  });

  if (isHidden) return null;

  const a11y = getCounterBadgeAccessibilityProps(props, displayValue);

  const containerExtras: ViewStyle = {
    backgroundColor: paint.bg,
    ...(paint.borderWidth != null
      ? { borderWidth: paint.borderWidth, borderColor: paint.borderColor }
      : null),
  };
  const labelExtras: TextStyle = {
    color: paint.text,
    fontSize: labelTypo.fontSize,
    lineHeight: labelTypo.lineHeight,
    fontWeight: labelTypo.fontWeight,
    fontFamily: labelTypo.fontFamily,
  };

  return (
    <View
      {...a11y}
      style={[
        styles.containerBase,
        CONTAINER[sizeKey],
        overrideBorderRadius != null ? { borderRadius: overrideBorderRadius } : null,
        containerExtras,
        props.style as ViewStyle,
      ]}
      testID={(props as { testID?: string }).testID}
    >
      <Text
        accessible={false}
        importantForAccessibility="no"
        numberOfLines={1}
        style={[styles.labelBase, labelExtras]}
      >
        {displayValue}
      </Text>
    </View>
  );
}

export type { CounterBadgeProps, CounterBadgeNativeProps } from './interface';
