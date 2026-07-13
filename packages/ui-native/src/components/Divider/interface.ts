/**
 * Divider interface (native)
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import Icon from '../Icon';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSize = 's' | 'm' | 'l';
export type DividerContentAlign = 'center' | 'start' | 'end';
export type DividerAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';
export type DividerAttention = 'high' | 'medium' | 'low';

export type DividerContent = 'none' | 'icon' | 'label';

type AllowedChildren = string | React.ReactElement<typeof Icon>;

export interface DividerProps {
  orientation?: DividerOrientation;
  size?: DividerSize;
  contentAlign?: DividerContentAlign;
  appearance?: DividerAppearance;
  attention?: DividerAttention;
  roundCaps?: boolean;
  children?: AllowedChildren;
  style?: ViewStyle;
  accessibilityHint?: string;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
}

export type DividerNativeProps = DividerProps;
export type DividerNativeA11yProps = Pick<DividerProps, 'accessibilityHint' | 'testID'>;

export function useDividerState(props: DividerProps) {
  const {
    orientation = 'horizontal',
    size = 'm',
    contentAlign = 'center',
    appearance = 'auto',
    attention = 'low',
    roundCaps = false,
    children,
  } = props;

  const resolvedAppearance = appearance === 'auto' ? 'neutral' : appearance;

  let contentType: 'label' | 'icon' | 'none' = 'none';

  if (children != null) {
    if (typeof children === 'string') {
      contentType = 'label';
    } else if (React.isValidElement(children)) {
      const childType = children.type as { displayName?: string };

      if (children.type === Icon || childType.displayName === 'Icon') {
        contentType = 'icon';
      }
    }
  }

  const hasContent = contentType !== 'none';

  const dataAttrs: Record<string, string> = {
    'data-orientation': orientation,
    'data-size': size,
    'data-attention': attention,
  };

  return {
    orientation,
    size,
    contentType,
    contentAlign,
    resolvedAppearance,
    attention,
    roundCaps,
    hasContent,
    dataAttrs,
  };
}

export function getDividerAccessibilityProps(
  orientation: DividerOrientation,
  hint?: string
): {
  accessible: true;
  accessibilityRole: 'none';
  accessibilityHint?: string;
  role: 'separator';
  'aria-orientation': DividerOrientation;
} {
  return {
    accessible: true,
    accessibilityRole: 'none',
    accessibilityHint: hint,
    role: 'separator',
    'aria-orientation': orientation,
  };
}

export const DIVIDER_LINE_A11Y = {
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
  accessibilityElementsHidden: true,
  'aria-hidden': true,
};
