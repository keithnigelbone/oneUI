/**
 * BadgeScreen — focused test surface for `<Badge>` from
 * `@oneui/ui-native/components/Badge`, per CombinationsRules/BadgeRules.txt.
 *
 * Sections:
 *   1. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative
 *   2. Sizes           — XS / S / M / L / XL
 *   3. Attentions      — high / medium / low
 *   4. Slots           — start / end / start-end, each filled with an icon,
 *                        avatar, counter badge and indicator badge
 *
 * Badge is non-interactive, so cells render directly (no stateful wrapper).
 * Slot children (Avatar / CounterBadge / IndicatorBadge) auto-size against the
 * parent Badge via its slot context; the raw Icon gets an explicit pixel size.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Badge } from '@oneui/ui-native/components/Badge';
import type {
  BadgeAppearance,
  BadgeAttention,
  BadgeSize,
} from '@oneui/ui-native/components/Badge';
import { Icon } from '@oneui/ui-native/components/Icon';
import { Avatar } from '@oneui/ui-native/components/Avatar';
import { CounterBadge } from '@oneui/ui-native/components/CounterBadge';
import { IndicatorBadge } from '@oneui/ui-native/components/IndicatorBadge';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcFavorite;

const APPEARANCES: readonly BadgeAppearance[] = [
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

const SIZES: readonly BadgeSize[] = ['xs', 's', 'm', 'l', 'xl'];
const ATTENTIONS: readonly BadgeAttention[] = ['high', 'medium', 'low'];

/* ─── Slot builders ──────────────────────────────────────────────────────── */

type SlotKind = 'icon' | 'avatar' | 'counter' | 'indicator';

const SLOT_KINDS: readonly SlotKind[] = ['icon', 'avatar', 'counter', 'indicator'];

// Slot content for a default ('m') Badge. Avatar / CounterBadge / IndicatorBadge
// inherit their size from the Badge slot context; Icon needs an explicit size
// (m → 12px, matching BADGE_SLOT_SIZES.m.iconPx).
function slotNode(kind: SlotKind): React.ReactNode {
  switch (kind) {
    case 'icon':
      return <Icon icon={GLYPH} size={tokens.spacing['3']} appearance='secondary' aria-hidden />;
    case 'avatar':
      return <Avatar content='text' appearance='secondary' alt='AB' />;
    case 'counter':
      return <CounterBadge value={3} appearance='negative' aria-label='3' />;
    case 'indicator':
      return <IndicatorBadge appearance='negative' aria-label='status' />;
  }
}

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface BadgeSpec {
  readonly testID: string;
  readonly label: string;
  readonly size?: BadgeSize;
  readonly appearance?: BadgeAppearance;
  readonly attention?: BadgeAttention;
  readonly start?: React.ReactNode;
  readonly end?: React.ReactNode;
}

// 1 · All appearances.
const APPEARANCE_CELLS: readonly BadgeSpec[] = APPEARANCES.map((appearance) => ({
  testID: `badge-appearance-${appearance}`,
  label: appearance,
  appearance,
  attention: 'high',
}));

// 2 · Sizes XS / S / M / L / XL.
const SIZE_CELLS: readonly BadgeSpec[] = SIZES.map((size) => ({
  testID: `badge-size-${size}`,
  label: size.toUpperCase(),
  size,
  attention: 'high',
}));

// 3 · Attentions high / medium / low.
const ATTENTION_CELLS: readonly BadgeSpec[] = ATTENTIONS.map((attention) => ({
  testID: `badge-attention-${attention}`,
  label: attention,
  attention,
}));

// 4 · Slots — start / end / start-end × icon / avatar / counter / indicator.
const SLOT_CELLS: readonly BadgeSpec[] = SLOT_KINDS.flatMap((kind) =>
  (['start', 'end', 'start-end'] as const).map((position) => ({
    testID: `badge-slot-${position}-${kind}`,
    label: `${position} · ${kind}`,
    attention: 'high' as const,
    start: position !== 'end' ? slotNode(kind) : undefined,
    end: position !== 'start' ? slotNode(kind) : undefined,
  })),
);

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly BadgeSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (XS / S / M / L / XL)', cells: SIZE_CELLS },
  { testID: 'section-attentions', title: '3 · Attentions (high / medium / low)', cells: ATTENTION_CELLS },
  { testID: 'section-slots', title: '4 · Slots (start / end / start-end)', cells: SLOT_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function BadgeScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Badge'
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
  cells: readonly BadgeSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.row}>
        {cells.map((cell) => (
          <Badge
            key={cell.testID}
            testID={cell.testID}
            size={cell.size}
            appearance={cell.appearance}
            attention={cell.attention}
            start={cell.start}
            end={cell.end}
            aria-label={cell.label}
          >
            {cell.label}
          </Badge>
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
    gap: tokens.spacing['3'],
  },
});
