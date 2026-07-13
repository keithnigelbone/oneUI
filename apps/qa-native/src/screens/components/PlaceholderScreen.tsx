/**
 * PlaceholderScreen — rendered for any component that does not yet have a
 * Figma-backed test screen. Replace by adding a real `<Name>Screen.tsx`
 * sibling and wiring it into `componentRegistry.ts`.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { tokens, typography } from '@oneui/tokens';

import type { ComponentProps } from '../../../App';

export function PlaceholderScreen({ route }: ComponentProps): React.ReactElement {
  const { name } = route.params;
  const role = useSurfaceTokens('neutral');

  return (
    <View
      testID={`screen-${name}`}
      style={[styles.container, { backgroundColor: role.surfaces.default }]}
    >
      <Text style={[styles.title, { color: role.content.high }]}>{name}</Text>
      <Text style={[styles.body, { color: role.content.medium }]}>
        No Figma-backed screen yet. Add{' '}
        <Text style={styles.code}>src/screens/components/{name}Screen.tsx</Text> and
        wire it into <Text style={styles.code}>componentRegistry.ts</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing['6'],
    gap: tokens.spacing['3'],
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.high,
  },
  body: {
    fontSize: typography.size.m,
    textAlign: 'center',
  },
  code: {
    fontWeight: typography.weight.medium,
  },
});
