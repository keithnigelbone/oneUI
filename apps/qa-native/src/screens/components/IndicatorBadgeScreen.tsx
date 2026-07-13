/**
 * IndicatorBadgeScreen — focused test surface for `<IndicatorBadge>` from
 * `@oneui/ui-native/components/IndicatorBadge`, per
 * CombinationsRules/IndicatorBadgeRules.txt.
 *
 * Sections:
 *   1. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative
 *   2. Sizes           — XS / S / M / L
 *
 * IndicatorBadge renders no text, so each cell pairs the dot with a caption and
 * carries an `aria-label` for screen readers.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { IndicatorBadge } from '@oneui/ui-native/components/IndicatorBadge';
import type {
  IndicatorBadgeAppearance,
  IndicatorBadgeSize,
} from '@oneui/ui-native/components/IndicatorBadge';
import { tokens, typography } from '@oneui/tokens';

const APPEARANCES: readonly IndicatorBadgeAppearance[] = [
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

// Rules cover XS / S / M / L (the component also supports `xl`).
const SIZES: readonly IndicatorBadgeSize[] = ['xs', 's', 'm', 'l'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface IndicatorSpec {
  readonly testID: string;
  readonly label: string;
  readonly size?: IndicatorBadgeSize;
  readonly appearance?: IndicatorBadgeAppearance;
}

// 1 · All appearances.
const APPEARANCE_CELLS: readonly IndicatorSpec[] = APPEARANCES.map((appearance) => ({
  testID: `indicator-appearance-${appearance}`,
  label: appearance,
  appearance,
}));

// 2 · Sizes XS / S / M / L.
const SIZE_CELLS: readonly IndicatorSpec[] = SIZES.map((size) => ({
  testID: `indicator-size-${size}`,
  label: size.toUpperCase(),
  size,
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly IndicatorSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (XS / S / M / L)', cells: SIZE_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function IndicatorBadgeScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-IndicatorBadge'
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
  cells: readonly IndicatorSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.row}>
        {cells.map((cell) => (
          <View key={cell.testID} style={styles.cell}>
            <IndicatorBadge
              testID={cell.testID}
              size={cell.size}
              appearance={cell.appearance}
              aria-label={cell.label}
            />
            <Text style={[styles.caption, { color: role.content.low }]}>{cell.label}</Text>
          </View>
        ))}
      </View>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacing['4'],
  },
  cell: {
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  caption: {
    fontSize: typography.size.xs,
  },
});
