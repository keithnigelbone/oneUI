/**
 * ChipGroupScreen — focused test surface for `<ChipGroup>` from
 * `@oneui/ui-native/components/ChipGroup`, per
 * CombinationsRules/ChipGroupRules.txt.
 *
 * Sections:
 *   1. Sizes        — S / M / L (group size flows to child chips via context)
 *   2. Orientation  — horizontal and vertical
 *
 * Each group is uncontrolled (seeded `defaultValue`) so the chips stay
 * interactive.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ChipGroup } from '@oneui/ui-native/components/ChipGroup';
import type { ChipSize } from '@oneui/ui-native/components/ChipGroup';
import { Chip } from '@oneui/ui-native/components/Chip';
import { tokens, typography } from '@oneui/tokens';

const SIZES: readonly ChipSize[] = ['s', 'm', 'l'];

const SHORT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'news', label: 'News' },
  { value: 'sport', label: 'Sport' },
  { value: 'tech', label: 'Tech' },
] as const;

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function ChipGroupScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-ChipGroup'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Sizes S / M / L */}
      <Section testID='section-sizes' title='1 · Sizes (S / M / L)'>
        {SIZES.map((size) => (
          <Cell key={size} label={`size ${size}`}>
            <ChipGroup
              testID={`chipgroup-size-${size}`}
              aria-label={`size ${size} group`}
              size={size}
              defaultValue={['news']}
            >
              {SHORT_OPTIONS.map((opt) => (
                <Chip key={opt.value} value={opt.value}>
                  {opt.label}
                </Chip>
              ))}
            </ChipGroup>
          </Cell>
        ))}
      </Section>

      {/* 2 · Orientation — horizontal / vertical */}
      <Section testID='section-orientation' title='2 · Orientation (horizontal / vertical)'>
        {(['horizontal', 'vertical'] as const).map((orientation) => (
          <Cell key={orientation} label={orientation}>
            <ChipGroup
              testID={`chipgroup-orientation-${orientation}`}
              aria-label={`${orientation} group`}
              orientation={orientation}
              defaultValue={['all']}
            >
              {SHORT_OPTIONS.map((opt) => (
                <Chip key={opt.value} value={opt.value}>
                  {opt.label}
                </Chip>
              ))}
            </ChipGroup>
          </Cell>
        ))}
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
