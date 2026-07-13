/**
 * Separator.showcase.native.tsx
 *
 * Native variant matrix for the Separator.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Separator } from './Separator.native';
import { useSurfaceTokens } from '../../theme';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

export function SeparatorHorizontal(): React.ReactElement {
  return (
    <View style={column}>
      <Label>Top</Label>
      <Separator />
      <Label>Bottom</Label>
    </View>
  );
}

export function SeparatorVertical(): React.ReactElement {
  return (
    <View
      style={{
        flexDirection: 'row',
        height: tokens.spacing['9'],
        alignItems: 'stretch',
        gap: tokens.spacing['3-5'],
      }}
    >
      <Label>Left</Label>
      <Separator orientation='vertical' />
      <Label>Right</Label>
    </View>
  );
}
