/**
 * ComponentsListScreen.tsx
 *
 * SectionList of every entry in `nativeRegistry`. Tapping a row navigates
 * to the detail screen. Rows whose `hasNativeImpl === false` get a small
 * "pending" badge so the parity gap is visible at a glance.
 */

import React from 'react';
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import {
  CATEGORY_ORDER,
  NATIVE_REGISTRY,
  type NativeComponentCategory,
  type NativeComponentEntry,
} from './nativeRegistry';
import type { ComponentsStackParamList } from './ComponentsStack';

type Section = { title: NativeComponentCategory; data: NativeComponentEntry[] };

export function ComponentsListScreen(): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const navigation = useNavigation<
    NativeStackNavigationProp<ComponentsStackParamList, 'List'>
  >();

  const sections = React.useMemo<Section[]>(() => {
    return CATEGORY_ORDER.map((cat) => ({
      title: cat,
      data: NATIVE_REGISTRY.filter((entry) => entry.category === cat),
    })).filter((section) => section.data.length > 0);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: roles.surfaces.default }]}>
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
  badge: {
    paddingHorizontal: tokens.spacing['2-5'],
    paddingVertical: tokens.spacing['1-5'],
    borderRadius: tokens.shape.pill,
  },
});
