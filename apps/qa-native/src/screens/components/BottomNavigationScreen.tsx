/**
 * BottomNavigationScreen — focused test surface for `<BottomNavigation>` +
 * `<BottomNavigationItem>` from `@oneui/ui-native`, per
 * CombinationsRules/BottomNavigationRules.txt.
 *
 * Sections:
 *   1. Item counts — bars with 2 / 3 / 4 / 5 items
 *   2. Label type  — labelType '1line' and '2line'
 *
 * Each bar is uncontrolled (seeded `defaultValue`) so the active item is
 * visible and the bar stays interactive. Icons come from the JDS icon set.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { BottomNavigation } from '@oneui/ui-native/components/BottomNavigation';
import { BottomNavigationItem } from '@oneui/ui-native/components/BottomNavigationItem';
import type { BottomNavigationLabelType } from '@oneui/ui-native/components/BottomNavigation';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

interface ItemDef {
  readonly value: string;
  readonly label: string;
  readonly icon: typeof JdsIcons.IcHome;
}

// Pool of up to 5 items; slice per count.
const ITEMS: readonly ItemDef[] = [
  { value: 'home', label: 'Home', icon: JdsIcons.IcHome },
  { value: 'search', label: 'Search', icon: JdsIcons.IcSearch },
  { value: 'favorites', label: 'Favorites', icon: JdsIcons.IcFavorite },
  { value: 'profile', label: 'Profile', icon: JdsIcons.IcUser },
  { value: 'settings', label: 'Settings', icon: JdsIcons.IcSettings },
];

// Longer, multi-word labels for the label-type section so `2line` actually
// wraps onto a second line (single words like "Home" never wrap).
const LONG_LABEL_ITEMS: readonly ItemDef[] = [
  { value: 'home', label: 'Home Dashboard', icon: JdsIcons.IcHome },
  { value: 'search', label: 'Search Everything', icon: JdsIcons.IcSearch },
  { value: 'favorites', label: 'My Saved Favorites', icon: JdsIcons.IcFavorite },
  { value: 'profile', label: 'Account Profile Page', icon: JdsIcons.IcUser },
];

const COUNTS = [2, 3, 4, 5] as const;
const LABEL_TYPES: readonly BottomNavigationLabelType[] = ['1line', '2line'];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function BottomNavigationScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-BottomNavigation'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Item counts */}
      <Section testID='section-item-counts' title='1 · Item counts (2 / 3 / 4 / 5)'>
        {COUNTS.map((count) => {
          const items = ITEMS.slice(0, count);
          return (
            <Cell key={count} label={`${count} items`}>
              <BottomNavigation
                testID={`bottomnav-count-${count}`}
                aria-label={`${count}-item navigation`}
                defaultValue={items[0].value}
              >
                {items.map((item) => (
                  <BottomNavigationItem
                    key={item.value}
                    testID={`bottomnav-count-${count}-item-${item.value}`}
                    value={item.value}
                    icon={item.icon}
                    label={item.label}
                    aria-label={item.label}
                  />
                ))}
              </BottomNavigation>
            </Cell>
          );
        })}
      </Section>

      {/* 2 · Label type — 1line / 2line */}
      <Section testID='section-label-type' title='2 · Label type (1line / 2line)'>
        {LABEL_TYPES.map((labelType) => {
          const items = LONG_LABEL_ITEMS;
          return (
            <Cell key={labelType} label={`labelType=${labelType}`}>
              <BottomNavigation
                testID={`bottomnav-labeltype-${labelType}`}
                aria-label={`${labelType} navigation`}
                labelType={labelType}
                defaultValue={items[0].value}
              >
                {items.map((item) => (
                  <BottomNavigationItem
                    key={item.value}
                    testID={`bottomnav-labeltype-${labelType}-item-${item.value}`}
                    value={item.value}
                    icon={item.icon}
                    label={item.label}
                    aria-label={item.label}
                  />
                ))}
              </BottomNavigation>
            </Cell>
          );
        })}
      </Section>
    </ScrollView>
  );
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  children,
}: {
  testID: string;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      {children}
    </View>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={styles.cell}>
      <Text style={[styles.caption, { color: role.content.low }]}>{label}</Text>
      {children}
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['4'],
    gap: tokens.spacing['5'],
  },
  section: {
    gap: tokens.spacing['4'],
    paddingBottom: tokens.spacing['4'],
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.high,
  },
  cell: {
    gap: tokens.spacing['2'],
  },
  caption: {
    fontSize: typography.size.xs,
  },
});
