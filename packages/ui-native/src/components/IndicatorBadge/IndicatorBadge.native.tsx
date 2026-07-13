/**
 * IndicatorBadge.native.tsx
 *
 * RN peer of `packages/ui/src/components/IndicatorBadge/IndicatorBadge.tsx`.
 * Tiny coloured dot — static size geometry lives in
 * `./IndicatorBadge.styles.native.ts`; the brand-resolved fill colour merges
 * inline (mirrors web's `--_idb-bold` → `var(--{Role}-Bold)` cascade).
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import {
  useSurfaceTokens,
  useComponentRecipe,
  useComponentTheme,
  resolveRecipeBorderRadius,
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
  useOneUITheme,
} from '../../theme';
import {
  getIndicatorBadgeAccessibilityProps,
  useIndicatorBadgeState,
  type IndicatorBadgeProps,
} from './interface';
import { styles } from './IndicatorBadge.styles.native';
import { useBadgeSlotSize } from '../Badge/BadgeSlotContext';

export function IndicatorBadge(props: IndicatorBadgeProps): React.ReactElement {
  const slotSizes = useBadgeSlotSize();
  const { resolvedSize, resolvedAppearance } = useIndicatorBadgeState({
    size: props.size ?? slotSizes?.indicatorBadge,
    appearance: props.appearance,
    'aria-label': props['aria-label'] ?? '',
  } as IndicatorBadgeProps);
  const { shape } = useOneUITheme();
  const role = useSurfaceTokens(resolvedAppearance);
  const componentTheme = useComponentTheme('indicatorbadge');
  const recipeDecisions = useComponentRecipe('indicator-badge');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  // Brand tokenRef → recipe → shapeLanguage override, else keep the size default
  // (full circle, SIZE/2) from styles[size]. Never emit `borderRadius: undefined`
  // — in RN a later `undefined` overrides the base radius and renders a square.
  const overrideBorderRadius =
    resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, shape) ??
    recipeBorderRadius ??
    resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'display');
  const a11y = getIndicatorBadgeAccessibilityProps(props);
  const hasLabel = a11y.accessible;

  if (process.env.NODE_ENV !== 'production' && !hasLabel) {
    // eslint-disable-next-line no-console
    console.warn(
      'IndicatorBadge: `aria-label` prop is recommended when the indicator conveys status.'
    );
  }

  return (
    <View
      {...a11y}
      style={[
        styles[resolvedSize],
        overrideBorderRadius != null ? { borderRadius: overrideBorderRadius } : null,
        { backgroundColor: role.surfaces.bold },
        props.style as ViewStyle,
      ]}
      testID={(props as { testID?: string }).testID}
    />
  );
}

export type { IndicatorBadgeProps, IndicatorBadgeNativeProps } from './interface';
