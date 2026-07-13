/**
 * Separator.native.tsx
 *
 * RN peer of `packages/ui/src/components/Separator/Separator.tsx`. Static
 * layout (orientation + 1px stroke) lives in `Separator.styles.native.ts`;
 * the runtime stroke colour from `useSurfaceTokens('neutral').content.strokeLow`
 * merges as an inline override — mirrors web's `background-color: var(--Border-Subtle)`.
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { getSeparatorAccessibilityProps, useSeparatorState, type SeparatorProps } from './interface';
import { useSurfaceTokens } from '../../theme';
import { styles } from './Separator.styles.native';

export function Separator(props: SeparatorProps): React.ReactElement {
  const { isVertical } = useSeparatorState(props);
  const role = useSurfaceTokens('neutral');
  const base = isVertical ? styles.vertical : styles.horizontal;
  return (
    <View
      {...getSeparatorAccessibilityProps()}
      style={[base, { backgroundColor: role.content.strokeLow }, props.style as ViewStyle]}
      testID={props.testID}
    />
  );
}

export type { SeparatorProps } from './interface';
