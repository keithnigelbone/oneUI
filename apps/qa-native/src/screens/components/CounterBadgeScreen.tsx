/**
 * CounterBadgeScreen — focused test surface for `<CounterBadge>` from
 * `@oneui/ui-native/components/CounterBadge`, per
 * CombinationsRules/CounterBadgeRules.txt.
 *
 * Sections:
 *   1. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative
 *   2. Sizes           — XS / S / M / L
 *   3. Attentions      — high / medium / low
 *
 * CounterBadge is non-interactive and requires a numeric `value`; every cell
 * uses a representative count so the badge renders visibly.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { CounterBadge } from '@oneui/ui-native/components/CounterBadge';
import type {
  CounterBadgeAppearance,
  CounterBadgeAttention,
  CounterBadgeSize,
} from '@oneui/ui-native/components/CounterBadge';
import { tokens, typography } from '@oneui/tokens';

const VALUE = 3;

const APPEARANCES: readonly CounterBadgeAppearance[] = [
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

// Native CounterBadge has no `xl` — scale is xs / s / m / l.
const SIZES: readonly CounterBadgeSize[] = ['xs', 's', 'm', 'l'];
const ATTENTIONS: readonly CounterBadgeAttention[] = ['high', 'medium', 'low'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface CounterSpec {
  readonly testID: string;
  readonly label: string;
  readonly size?: CounterBadgeSize;
  readonly appearance?: CounterBadgeAppearance;
  readonly attention?: CounterBadgeAttention;
}

// 1 · All appearances — high attention so the bold fill colour is visible.
const APPEARANCE_CELLS: readonly CounterSpec[] = APPEARANCES.map((appearance) => ({
  testID: `counter-appearance-${appearance}`,
  label: appearance,
  appearance,
  attention: 'high',
}));

// 2 · Sizes XS / S / M / L.
const SIZE_CELLS: readonly CounterSpec[] = SIZES.map((size) => ({
  testID: `counter-size-${size}`,
  label: size.toUpperCase(),
  size,
  attention: 'high',
}));

// 3 · Attentions high / medium / low.
const ATTENTION_CELLS: readonly CounterSpec[] = ATTENTIONS.map((attention) => ({
  testID: `counter-attention-${attention}`,
  label: attention,
  attention,
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly CounterSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (XS / S / M / L)', cells: SIZE_CELLS },
  { testID: 'section-attentions', title: '3 · Attentions (high / medium / low)', cells: ATTENTION_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function CounterBadgeScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-CounterBadge'
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
  cells: readonly CounterSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.row}>
        {cells.map((cell) => (
          <View key={cell.testID} style={styles.cell}>
            <CounterBadge
              testID={cell.testID}
              value={VALUE}
              size={cell.size}
              appearance={cell.appearance}
              attention={cell.attention}
              aria-label={`${cell.label} · ${VALUE}`}
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
