/**
 * ComponentsListScreen.tsx
 *
 * SectionList of every entry in `nativeRegistry`. Tapping a row navigates
 * to the detail screen. Rows whose `hasNativeImpl === false` get a small
 * "pending" badge so the parity gap is visible at a glance.
 */

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ComponentsChrome } from '../../components/ComponentsChrome';
import {
  CATEGORY_ORDER,
  NATIVE_REGISTRY,
  type NativeComponentCategory,
  type NativeComponentEntry,
} from './nativeRegistry';
import type { ComponentsStackParamList } from './ComponentsStack';

type Section = { title: NativeComponentCategory; data: NativeComponentEntry[] };

type Props = NativeStackScreenProps<ComponentsStackParamList, 'List'>;

export function ComponentsListScreen({ navigation }: Props): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const sections = useMemo<Section[]>(() => {
    const matches = (entry: NativeComponentEntry): boolean => {
      if (!normalizedQuery) return true;
      return (
        entry.name.toLowerCase().includes(normalizedQuery) ||
        entry.id.toLowerCase().includes(normalizedQuery)
      );
    };

    return CATEGORY_ORDER.map((cat) => ({
      title: cat,
      data: NATIVE_REGISTRY.filter((entry) => entry.category === cat && matches(entry)),
    })).filter((section) => section.data.length > 0);
  }, [normalizedQuery]);

  const totalResults = useMemo(
    () => sections.reduce((sum, section) => sum + section.data.length, 0),
    [sections],
  );

  return (
    <View style={styles.outer}>
      <ComponentsChrome variant='list' navigation={navigation} />
      <View style={[styles.root, { flex: 1, backgroundColor: roles.surfaces.default }]}>
        <Pressable
          onPress={() => navigation.navigate('AllComponents')}
          accessibilityRole='button'
          accessibilityLabel='Open all components showcase'
          style={({ pressed }) => [
            styles.fontWeightsBanner,
            {
              borderBottomColor: roles.content.strokeLow,
              backgroundColor: pressed ? roles.states.pressed : roles.surfaces.minimal,
            },
          ]}
        >
          <View style={{ flex: 1, gap: tokens.spacing['1-5'] }}>
            <Text
              style={{
                color: roles.content.high,
                fontSize: typography.size.m,
                fontWeight: typography.weight.medium,
              }}
            >
              All Components
            </Text>
            <Text
              style={{
                color: roles.content.medium,
                fontSize: typography.size.xs,
              }}
            >
              All components · all attention variants
            </Text>
          </View>
          <Text
            style={{
              color: roles.content.medium,
              fontSize: typography.size.l,
            }}
          >
            ›
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Icons')}
          accessibilityRole='button'
          accessibilityLabel='Open Jio icon gallery'
          style={({ pressed }) => [
            styles.fontWeightsBanner,
            {
              borderBottomColor: roles.content.strokeLow,
              backgroundColor: pressed ? roles.states.pressed : roles.surfaces.minimal,
            },
          ]}
        >
          <View style={{ flex: 1, gap: tokens.spacing['1-5'] }}>
            <Text
              style={{
                color: roles.content.high,
                fontSize: typography.size.m,
                fontWeight: typography.weight.medium,
              }}
            >
              Jio Icons
            </Text>
            <Text
              style={{
                color: roles.content.medium,
                fontSize: typography.size.xs,
              }}
            >
              1,609 icons · @oneui/icons-jio-native
            </Text>
          </View>
          <Text
            style={{
              color: roles.content.medium,
              fontSize: typography.size.l,
            }}
          >
            ›
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('FontWeights')}
          accessibilityRole='button'
          accessibilityLabel='Open bundled JioType font weight preview'
          style={({ pressed }) => [
            styles.fontWeightsBanner,
            {
              borderBottomColor: roles.content.strokeLow,
              backgroundColor: pressed ? roles.states.pressed : roles.surfaces.minimal,
            },
          ]}
        >
          <View style={{ flex: 1, gap: tokens.spacing['1-5'] }}>
            <Text
              style={{
                color: roles.content.high,
                fontSize: typography.size.m,
                fontWeight: typography.weight.medium,
              }}
            >
              Font weights (JioType)
            </Text>
            <Text
              style={{
                color: roles.content.medium,
                fontSize: typography.size.xs,
              }}
            >
              Bundled cuts under assets/fonts/JioType/ — see screen.
            </Text>
          </View>
          <Text
            style={{
              color: roles.content.medium,
              fontSize: typography.size.l,
            }}
          >
            ›
          </Text>
        </Pressable>
        <View
          style={[
            styles.searchRow,
            {
              borderBottomColor: roles.content.strokeLow,
              backgroundColor: roles.surfaces.default,
            },
          ]}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder='Search components…'
            placeholderTextColor={roles.content.low}
            accessibilityLabel='Search components'
            accessibilityHint='Filters the component list by name or id'
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
          {normalizedQuery ? (
            <Text
              style={{
                color: roles.content.medium,
                fontSize: typography.size.xs,
              }}
            >
              {totalResults === 0
                ? 'No matches'
                : `${totalResults} result${totalResults === 1 ? '' : 's'}`}
            </Text>
          ) : null}
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={[
                styles.sectionHeader,
                { backgroundColor: roles.surfaces.minimal },
              ]}
            >
              <Text
                style={{
                  color: roles.content.medium,
                  fontSize: typography.size['2xs'],
                  fontWeight: typography.weight.high,
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('Detail', {
                  id: item.id,
                  name: item.name,
                })
              }
              accessibilityRole='button'
              accessibilityLabel={`Open ${item.name}`}
              style={({ pressed }) => [
                styles.row,
                {
                  borderBottomColor: roles.content.strokeLow,
                  backgroundColor: pressed
                    ? roles.states.pressed
                    : roles.surfaces.default,
                },
              ]}
            >
              <Text
                style={{
                  flex: 1,
                  color: roles.content.high,
                  fontSize: typography.size.m,
                  fontWeight: typography.weight.medium,
                }}
              >
                {item.name}
              </Text>
              {item.hasNativeImpl ? (
                <Badge
                  label='native'
                  bg={primary.surfaces.bold}
                  fg={primary.onBoldContent.high}
                />
              ) : (
                <Badge
                  label='pending'
                  bg={roles.surfaces.subtle}
                  fg={roles.content.medium}
                />
              )}
              <Text
                style={{
                  color: roles.content.medium,
                  fontSize: typography.size.l,
                  marginLeft: tokens.spacing['2-5'],
                }}
              >
                ›
              </Text>
            </Pressable>
          )}
          stickySectionHeadersEnabled
        />
      </View>
    </View>
  );
}

interface BadgeProps {
  label: string;
  bg: string;
  fg: string;
}

function Badge({ label, bg, fg }: BadgeProps): React.ReactElement {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text
        style={{
          color: fg,
          fontSize: typography.size['2xs'],
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: tokens.spacing['7'],
  },
  sectionHeader: {
    paddingHorizontal: tokens.spacing['4-5'],
    paddingVertical: tokens.spacing['2-5'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing['4-5'],
    paddingVertical: tokens.spacing['3-5'],
    borderBottomWidth: tokens.borderWidth.hairline,
    gap: tokens.spacing['2-5'],
  },
  fontWeightsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing['4-5'],
    paddingVertical: tokens.spacing['4'],
    borderBottomWidth: tokens.borderWidth.hairline,
    gap: tokens.spacing['3-5'],
  },
  searchRow: {
    paddingHorizontal: tokens.spacing['4-5'],
    paddingVertical: tokens.spacing['3-5'],
    borderBottomWidth: tokens.borderWidth.hairline,
    gap: tokens.spacing['2-5'],
  },
  searchInput: {
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['2-5'],
    borderRadius: tokens.shape.xs,
    borderWidth: tokens.borderWidth.hairline,
  },
  badge: {
    paddingHorizontal: tokens.spacing['2-5'],
    paddingVertical: tokens.spacing['1-5'],
    borderRadius: tokens.shape.pill,
  },
});
