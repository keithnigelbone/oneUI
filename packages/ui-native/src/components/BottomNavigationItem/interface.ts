/**
 * BottomNavigationItem interface (native)
 * Semantic source: BottomNavItemProps in BottomNavigation.shared.ts
 */

import type { ReactElement } from 'react';
import type { ViewStyle } from 'react-native';
import type { IconComponent, SemanticIconName } from '@oneui/shared';
import {
  resolveBottomNavigationAppearance,
  useBottomNavigationContext,
  type BottomNavigationAppearance,
  type BottomNavigationLabelType,
} from '../BottomNavigation/BottomNavigationContext';

export type { BottomNavigationAppearance, BottomNavigationLabelType };

export interface BottomNavigationItemProps {
  icon: SemanticIconName | ReactElement | IconComponent;
  activeIcon?: SemanticIconName | ReactElement | IconComponent;
  label?: string;
  active?: boolean;
  value?: string;
  href?: string;
  onClick?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  appearance?: BottomNavigationAppearance;
  labelType?: BottomNavigationLabelType;
  'aria-label'?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityHint?: string;
}

/** Web export name — same props contract. */
export type BottomNavItemProps = BottomNavigationItemProps;

/**
 * Resolves whether a nav item is selected.
 *
 * When the parent BottomNavigation has a `value`, only the matching item is active —
 * explicit `active` cannot override (mutual exclusivity).
 */
export function resolveBottomNavigationItemActive(
  props: Pick<BottomNavigationItemProps, 'active' | 'value'>,
  parentValue: string | undefined,
  inNavigationGroup: boolean,
): boolean {
  const groupSelectionActive =
    props.value !== undefined && parentValue !== undefined && parentValue === props.value;

  if (inNavigationGroup && parentValue !== undefined && props.value !== undefined) {
    return groupSelectionActive;
  }
  if (props.active !== undefined) {
    return props.active;
  }
  return groupSelectionActive;
}

export function useBottomNavigationItemState(props: BottomNavigationItemProps) {
  const ctx = useBottomNavigationContext();
  const labelType = props.labelType ?? ctx?.labelType ?? '1line';
  const resolvedAppearance = resolveBottomNavigationAppearance(
    props.appearance ?? ctx?.appearance,
  );

  const groupSelectionActive =
    props.value !== undefined && ctx?.value !== undefined && ctx.value === props.value;

  const isActive = resolveBottomNavigationItemActive(
    props,
    ctx?.value,
    ctx != null,
  );

  if (
    process.env.NODE_ENV !== 'production' &&
    props.active !== undefined &&
    props.value !== undefined &&
    ctx?.value !== undefined &&
    props.active !== groupSelectionActive
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      'BottomNavigationItem: `active` is ignored when inside BottomNavigation with a selection value. Use matching `value` on the parent instead.',
    );
  }

  return {
    labelType,
    resolvedAppearance,
    isActive,
    showLabel: labelType !== 'none' && Boolean(props.label),
    iconSizePx: labelType === 'none' ? ('large' as const) : ('default' as const),
  };
}

export const useBottomNavItemState = useBottomNavigationItemState;

/** Turn `my-saved-items` → `My Saved Items` for icon-only tab announcements. */
export function humanizeBottomNavigationValue(value: string): string {
  const words = value.split(/[-_/]+/).filter(Boolean);
  if (words.length === 0) return value;
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const ICON_ONLY_FALLBACK_LABEL = 'Tab';

export function resolveBottomNavigationItemAccessibilityLabel(
  props: Pick<BottomNavigationItemProps, 'aria-label' | 'label' | 'value'>,
): string {
  const ariaLabel = props['aria-label']?.trim();
  if (ariaLabel) return ariaLabel;
  const visibleLabel = props.label?.trim();
  if (visibleLabel) return visibleLabel;
  const itemValue = props.value?.trim();
  if (itemValue) return humanizeBottomNavigationValue(itemValue);
  return ICON_ONLY_FALLBACK_LABEL;
}

export const resolveBottomNavItemAccessibilityLabel = resolveBottomNavigationItemAccessibilityLabel;

export function getBottomNavigationItemAccessibilityProps(
  props: Pick<
    BottomNavigationItemProps,
    'aria-label' | 'label' | 'value' | 'accessibilityHint' | 'disabled'
  >,
  state: { isActive: boolean },
): {
  accessible: boolean;
  accessibilityRole: 'tab';
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityState: { disabled: boolean; selected: boolean };
} {
  const accessibilityLabel = resolveBottomNavigationItemAccessibilityLabel(props);
  return {
    accessible: true,
    accessibilityRole: 'tab',
    accessibilityLabel,
    accessibilityHint: props.accessibilityHint,
    accessibilityState: {
      disabled: Boolean(props.disabled),
      selected: state.isActive,
    },
  };
}

export const getBottomNavItemAccessibilityProps = getBottomNavigationItemAccessibilityProps;
