/**
 * IconContainedScreen — focused test surface for `<IconContained>` from
 * `@oneui/ui-native/components/IconContained`, per
 * CombinationsRules/IconContainedRules.txt.
 *
 * Sections:
 *   1. All attention   — high / medium (the only two attention levels)
 *   2. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative
 *   3. All sizes       — XS / S / M / L / XL
 *
 * IconContained is a non-interactive contained glyph (no text, no onPress), so
 * each cell pairs the element with a caption and a stable `testID`.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { IconContained } from '@oneui/ui-native/components/IconContained';
import type {
  IconContainedAppearance,
  IconContainedAttention,
  IconContainedSize,
} from '@oneui/ui-native/components/IconContained';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

// Single glyph for every cell — fill + colour come from attention / appearance.
const GLYPH = JdsIcons.IcFavorite;

const ATTENTIONS: readonly IconContainedAttention[] = ['high', 'medium'];

const APPEARANCES: readonly IconContainedAppearance[] = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

const SIZES: readonly IconContainedSize[] = ['xs', 's', 'm', 'l', 'xl'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface CellSpec {
  readonly testID: string;
  readonly caption: string;
  readonly attention?: IconContainedAttention;
  readonly appearance?: IconContainedAppearance;
  readonly size?: IconContainedSize;
}

// 1 · All attention (high / medium).
const ATTENTION_CELLS: readonly CellSpec[] = ATTENTIONS.map((attention) => ({
  testID: `icon-contained-attn-${attention}`,
  caption: attention,
  attention,
}));

// 2 · All appearances (default attention = high).
const APPEARANCE_CELLS: readonly CellSpec[] = APPEARANCES.map((appearance) => ({
  testID: `icon-contained-appearance-${appearance}`,
  caption: appearance,
  appearance,
}));

// 3 · All sizes (default attention/appearance).
const SIZE_CELLS: readonly CellSpec[] = SIZES.map((size) => ({
  testID: `icon-contained-size-${size}`,
  caption: size,
  size,
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly CellSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-attention', title: '1 · All attention (high / medium)', cells: ATTENTION_CELLS },
  { testID: 'section-appearances', title: '2 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '3 · All sizes (XS–XL)', cells: SIZE_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function IconContainedScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-IconContained'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {SECTIONS.map((section) => (
        <Section key={section.testID} testID={section.testID} title={section.title} cells={section.cells} />
      ))}
    </ScrollView>
  );
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  cells,
}: {
  testID: string;
  title: string;
  cells: readonly CellSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.cellRow}>
        {cells.map((cell) => (
          <Cell key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

function Cell({
  testID,
  caption,
  attention,
  appearance,
  size,
}: CellSpec): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={styles.cell}>
      <IconContained
        testID={testID}
        icon={GLYPH}
        attention={attention}
        appearance={appearance}
        size={size}
        aria-label={`${caption} contained icon`}
      />
      <Text style={[styles.caption, { color: role.content.medium }]}>{caption}</Text>
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
  cellRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['4'],
    alignItems: 'flex-end',
  },
  cell: {
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },
  caption: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
