/**
 * BottomNavigation interface (native) — container only.
 * Semantic source: packages/ui/src/components/BottomNavigation/BottomNavigation.shared.ts
 */

import { Children, useCallback, useMemo, useState, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import {
  BottomNavigationContext,
  useBottomNavigationContext,
  resolveBottomNavigationAppearance,
  type BottomNavigationAppearance,
  type BottomNavigationContextValue,
  type BottomNavigationLabelType,
} from './BottomNavigationContext';

export type { BottomNavigationAppearance, BottomNavigationLabelType };
export {
  BottomNavigationContext,
  useBottomNavigationContext,
  resolveBottomNavigationAppearance,
};

export interface BottomNavigationProps {
  children: ReactNode;
  labelType?: BottomNavigationLabelType;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  showDivider?: boolean;
  appearance?: BottomNavigationAppearance;
  'aria-label': string;
  testID?: string;
  style?: ViewStyle;
  accessibilityHint?: string;
}

/** Design-system maximum tab count (2–5 supported; excess items are not rendered). */
export const BOTTOM_NAVIGATION_MAX_ITEMS = 5;

/** Returns at most {@link BOTTOM_NAVIGATION_MAX_ITEMS} item nodes for rendering. */
export function clampBottomNavigationChildren(
  children: ReactNode,
  max: number = BOTTOM_NAVIGATION_MAX_ITEMS,
): ReactNode[] {
  return Children.toArray(children).slice(0, max);
}

export function useBottomNavigationState(props: BottomNavigationProps) {
  const {
    labelType = '1line',
    value,
    defaultValue,
    onValueChange,
    appearance,
  } = props;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const currentValue = isControlled ? value : internalValue;
  const resolvedAppearance = resolveBottomNavigationAppearance(appearance);

  const handleValueChange = useCallback(
    (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const contextValue = useMemo(
    (): BottomNavigationContextValue => ({
      labelType,
      value: currentValue,
      onValueChange: handleValueChange,
      appearance: resolvedAppearance,
    }),
    [currentValue, handleValueChange, labelType, resolvedAppearance],
  );

  return { contextValue, currentValue, resolvedAppearance, labelType };
}

export function getBottomNavigationAccessibilityProps(
  props: Pick<BottomNavigationProps, 'aria-label' | 'accessibilityHint'>,
): {
  accessible: boolean;
  accessibilityRole: 'tablist';
  accessibilityLabel: string;
  accessibilityHint?: string;
} {
  return {
    accessible: true,
    accessibilityRole: 'tablist',
    accessibilityLabel: props['aria-label'],
    accessibilityHint: props.accessibilityHint,
  };
}
