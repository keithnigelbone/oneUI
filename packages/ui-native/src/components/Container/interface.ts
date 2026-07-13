/**
 * Container interface (native)
 *
 * Native keeps a narrow prop surface for now; extended layout/surface props
 * exist on web only (`packages/ui/src/components/Container/Container.shared.ts`).
 *
 * Layout spacing props (`gap`, `padding*`) accept a `NativeSpacingKey` and are
 * resolved at runtime via `theme.spacing[key]` (see `resolveLayoutStyle`), so
 * generated/authored screens stay token-only (no literal px).
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { LayoutSpacingProps } from '../../utils/layoutStyle';

export type ContainerVariant = 'fluid' | 'fixed' | 'full-bleed';

// Re-export layout sub-types so existing imports from this module keep working.
export type {
  LayoutDirection as ContainerDirection,
  LayoutAlign as ContainerAlign,
  LayoutJustify as ContainerJustify,
} from '../../utils/layoutStyle';

export interface ContainerProps extends LayoutSpacingProps {
  variant?: ContainerVariant;
  maxWidth?: string | number;
  style?: ViewStyle;
  children?: ReactNode;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
}

/**
 * Layout container — presentational on native (no landmark role).
 * Children remain in the default accessibility order.
 */
export function getContainerAccessibilityProps(): {
  accessible: false;
} {
  return { accessible: false };
}
