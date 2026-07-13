/**
 * HomeScreen — lists every component the QA app can mount. Each row
 * carries a stable `testID` (`nav-<ComponentName>`) so Maestro / Detox
 * can tap by id rather than label.
 */

import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { tokens, typography } from '@oneui/tokens';

import type { HomeProps } from '../../App';
import { componentRouteNames, type ComponentRouteName } from '../componentRegistry';

export function HomeScreen({ navigation }: HomeProps): React.ReactElement {
  const role = useSurfaceTokens('neutral');

  const renderItem = ({ item }: ListRenderItemInfo<ComponentRouteName>) => (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={`Open ${item} screen`}
      testID={`nav-${item}`}
      onPress={() => navigation.navigate('Component', { name: item })}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: role.content.strokeLow,
          backgroundColor: pressed ? role.surfaces.subtle : 'transparent',
        },
      ]}
    >
      <Text style={[styles.label, { color: role.content.high }]}>{item}</Text>
      <Text style={[styles.chevron, { color: role.content.medium }]}>›</Text>
    </Pressable>
  );

  return (
    <View
      testID='screen-Home'
      style={[styles.container, { backgroundColor: role.surfaces.default }]}
    >
      <FlatList
        testID='nav-list'
        data={componentRouteNames}
        keyExtractor={(name) => name}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: tokens.spacing['2'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  label: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.medium,
  },
  chevron: {
    fontSize: typography.size.l,
  },
});
