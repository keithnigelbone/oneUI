/**
 * IconsScreen.tsx
 *
 * Scrollable grid of all 1,609 Jio icons from @oneui/icons-jio-native.
 * Supports live search filtering by icon name.
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { tokens, typography } from '@oneui/tokens';
import { Icon, useSurfaceTokens } from '@oneui/ui-native';
import type { IconComponent } from '@oneui/ui-native/icons';
import { ComponentsChrome } from '../../components/ComponentsChrome';
import type { ComponentsStackParamList } from './ComponentsStack';

// Importing the package triggers auto-registration of all 1,609 icons.
import * as JioNativeIcons from '@oneui/icons-jio-native';

type Props = NativeStackScreenProps<ComponentsStackParamList, 'Icons'>;

type IconEntry = {
  name: string;
  Component: IconComponent;
};

// Build the icon list once at module level — filtering by Ic* names skips
// the initJioNativeIcons, initJdsJioIcons, etc. non-icon exports.
const ALL_ICONS: IconEntry[] = (
  Object.entries(JioNativeIcons) as [string, unknown][]
)
  .filter(([k, v]) => k.startsWith('Ic') && typeof v === 'function')
  .map(([name, Component]) => ({ name, Component: Component as IconComponent }))
  .sort((a, b) => a.name.localeCompare(b.name));

const ICON_SIZE = 28;
const NUM_COLUMNS = 5;
const CELL_PADDING = tokens.spacing['3'];

export function IconsScreen({ navigation }: Props): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const [query, setQuery] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo<IconEntry[]>(() => {
    if (!normalizedQuery) return ALL_ICONS;
    return ALL_ICONS.filter((entry) =>
      entry.name.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  function handleIconPress(name: string) {
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1200);
  }

  return (
    <View style={styles.outer}>
      <ComponentsChrome variant='icons' navigation={navigation} title='Jio Icons' />

      <View style={[styles.searchRow, { backgroundColor: roles.surfaces.default, borderBottomColor: roles.content.strokeLow }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder='Search icons…'
          placeholderTextColor={roles.content.low}
          accessibilityLabel='Search icons'
          autoCapitalize='none'
          autoCorrect={false}
          clearButtonMode='while-editing'
          style={[
            styles.searchInput,
            {
              color: roles.content.high,
              fontSize: typography.size.m,
              backgroundColor: roles.surfaces.minimal,
              borderColor: roles.content.strokeLow,
            },
          ]}
        />
        <Text style={[styles.countLabel, { color: roles.content.medium }]}>
          {filtered.length === ALL_ICONS.length
            ? `${ALL_ICONS.length} icons`
            : `${filtered.length} / ${ALL_ICONS.length}`}
        </Text>
      </View>

      {copiedName ? (
        <View style={[styles.toast, { backgroundColor: roles.surfaces.bold }]}>
          <Text style={[styles.toastText, { color: roles.onBoldContent.high }]}>
            {copiedName}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.name}
        contentContainerStyle={[
          styles.grid,
          { backgroundColor: roles.surfaces.default },
        ]}
        style={{ backgroundColor: roles.surfaces.default }}
        initialNumToRender={60}
        maxToRenderPerBatch={40}
        windowSize={5}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleIconPress(item.name)}
            accessibilityRole='button'
            accessibilityLabel={item.name}
            style={({ pressed }) => [
              styles.cell,
              {
                backgroundColor: pressed
                  ? roles.states.pressed
                  : roles.surfaces.default,
              },
            ]}
          >
            <Icon
              icon={item.Component}
              size={ICON_SIZE}
              appearance="primary"
              emphasis="tinted"
            />
            <Text
              numberOfLines={1}
              style={[styles.cellLabel, { color: roles.content.medium }]}
            >
              {item.name.replace(/^Ic/, '')}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: roles.content.medium }]}>
              No icons match "{query}"
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  searchRow: {
    paddingHorizontal: tokens.spacing['4-5'],
    paddingVertical: tokens.spacing['3-5'],
    borderBottomWidth: tokens.borderWidth.hairline,
    gap: tokens.spacing['2'],
  },
  searchInput: {
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['2-5'],
    borderRadius: tokens.shape.xs,
    borderWidth: tokens.borderWidth.hairline,
  },
  countLabel: {
    fontSize: typography.size['2xs'],
    textAlign: 'right',
  },
  grid: {
    padding: CELL_PADDING,
    paddingBottom: tokens.spacing['8'],
  },
  cell: {
    flex: 1 / NUM_COLUMNS,
    alignItems: 'center',
    paddingVertical: tokens.spacing['3'],
    paddingHorizontal: tokens.spacing['1'],
    gap: tokens.spacing['1-5'],
    borderRadius: tokens.shape.xs,
  },
  cellLabel: {
    fontSize: 10,
    textAlign: 'center',
    width: '100%',
  },
  toast: {
    position: 'absolute',
    bottom: tokens.spacing['8'],
    alignSelf: 'center',
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['2-5'],
    borderRadius: tokens.shape.pill,
    zIndex: 100,
  },
  toastText: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: tokens.spacing['8'],
  },
  emptyText: {
    fontSize: typography.size.m,
  },
});
