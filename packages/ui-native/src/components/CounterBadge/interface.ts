/**
 * CounterBadge interface (native)
 */

import type { ViewStyle } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';
import { useSlotParentAppearance } from '../../slots/SlotParentAppearanceContext.native';

export type CounterBadgeAppearance = ComponentAppearance;
export type CounterBadgeAttention = 'high' | 'medium' | 'low';
export type CounterBadgeVariant = 'bold' | 'subtle' | 'ghost';
export type CounterBadgeSize = 'xs' | 's' | 'm' | 'l';

const ATTENTION_TO_VARIANT: Record<CounterBadgeAttention, CounterBadgeVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface CounterBadgeProps {
  value: number;
  max?: number;
  showZero?: boolean;
  size?: CounterBadgeSize;
  variant?: CounterBadgeVariant;
  attention?: CounterBadgeAttention;
  appearance?: CounterBadgeAppearance;
  style?: ViewStyle;
  'aria-label'?: string;
  testID?: string;
  accessibilityHint?: string;
}

export type CounterBadgeNativeProps = CounterBadgeProps;

export const COUNTER_BADGE_DEFAULT_MAX = 99;

/** Positive overflow cap; invalid or sub-1 values fall back to the default max. */
export function resolveCounterBadgeMax(max?: number): number {
  if (typeof max !== 'number' || !Number.isFinite(max) || max < 1) {
    return COUNTER_BADGE_DEFAULT_MAX;
  }
  return Math.floor(max);
}

/** Invalid counts are hidden; zero is shown only when `showZero` is set. */
export function isCounterBadgeHidden(value: number, showZero = false): boolean {
  if (value < 0) return true;
  return value === 0 && !showZero;
}

export function getCounterBadgeDisplayValue(
  value: number,
  options?: Pick<CounterBadgeProps, 'max' | 'showZero'>,
): string {
  const { max, showZero = false } = options ?? {};
  if (isCounterBadgeHidden(value, showZero)) return '';
  const effectiveMax = resolveCounterBadgeMax(max);
  return value > effectiveMax ? `${effectiveMax}+` : String(value);
}

export function useCounterBadgeState(props: CounterBadgeProps) {
  const slotParent = useSlotParentAppearance();
  const {
    value,
    max,
    showZero = false,
    size = 'm',
    variant: variantProp,
    attention,
    appearance,
  } = props;

  const resolvedVariant: CounterBadgeVariant =
    variantProp ?? (attention ? ATTENTION_TO_VARIANT[attention] : 'bold');

  // Mirrors web `CounterBadge.shared.ts`: explicit role wins, else inherit
  // from a slot-owning parent (Badge / Button / …), else `'primary'`.
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> =
    appearance != null && appearance !== 'auto'
      ? (appearance as Exclude<ComponentAppearance, 'auto'>)
      : (slotParent ?? 'primary');

  const isHidden = isCounterBadgeHidden(value, showZero);
  const displayValue = isHidden ? '' : getCounterBadgeDisplayValue(value, { max, showZero });

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
  };

  return { resolvedVariant, resolvedAppearance, displayValue, isHidden, dataAttrs };
}

export function getCounterBadgeAccessibilityProps(
  props: CounterBadgeProps,
  displayValue: string | number,
): {
  accessible: true;
  accessibilityRole: 'text';
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityLiveRegion: 'polite';
} {
  return {
    accessible: true,
    accessibilityRole: 'text',
    accessibilityLabel: props['aria-label'] ?? String(displayValue),
    accessibilityHint: props.accessibilityHint,
    accessibilityLiveRegion: 'polite',
  };
}
