/**
 * Separator interface (native)
 */

import type { ViewStyle } from 'react-native';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps {
  orientation?: SeparatorOrientation;
  style?: ViewStyle;
  testID?: string;
}

/** Decorative separator — hidden from the accessibility tree (peer web `aria-hidden`). */
export const SEPARATOR_A11Y = {
  'aria-hidden': true as const,
  accessible: false as const,
};

export function getSeparatorAccessibilityProps(): typeof SEPARATOR_A11Y {
  return SEPARATOR_A11Y;
}

export function useSeparatorState(props: SeparatorProps) {
  return {
    isVertical: props.orientation === 'vertical',
  };
}
