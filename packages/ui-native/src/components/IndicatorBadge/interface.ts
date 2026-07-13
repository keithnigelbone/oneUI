/**
 * IndicatorBadge interface (native)
 */

import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { useSlotParentAppearance } from '../../slots/SlotParentAppearanceContext.native';

export type IndicatorBadgeAppearance = ComponentAppearance;
export type IndicatorBadgeSize = 'xs' | 's' | 'm' | 'l' | 'xl';

export interface IndicatorBadgeProps {
  size?: IndicatorBadgeSize;
  appearance?: IndicatorBadgeAppearance;
  style?: ViewStyle;
  'aria-label'?: string;
  testID?: string;
  accessibilityHint?: string;
}

export type IndicatorBadgeNativeProps = IndicatorBadgeProps;

export function useIndicatorBadgeState(props: IndicatorBadgeProps) {
  const slotParent = useSlotParentAppearance();
  const resolvedSize = props.size ?? 'm';
  // Mirrors web `IndicatorBadge.shared.ts`: explicit role wins, else inherit
  // from a slot-owning parent (Badge / Button / …), else `'primary'`.
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> =
    props.appearance != null && props.appearance !== 'auto'
      ? (props.appearance as Exclude<ComponentAppearance, 'auto'>)
      : (slotParent ?? 'primary');

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': resolvedSize,
    'data-appearance': resolvedAppearance,
  };

  return { resolvedSize, resolvedAppearance, dataAttrs };
}

export function getIndicatorBadgeAccessibilityProps(props: IndicatorBadgeProps): {
  accessible: boolean;
  accessibilityRole: 'image' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityElementsHidden: boolean;
} {
  const ariaLabel = props['aria-label'];
  const hasLabel = Boolean(ariaLabel);
  return {
    accessible: hasLabel,
    accessibilityRole: hasLabel ? 'image' : 'none',
    accessibilityLabel: ariaLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityElementsHidden: !hasLabel,
  };
}
