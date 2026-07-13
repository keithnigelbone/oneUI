/**
 * ChipScreen — focused test surface for `<Chip>` from
 * `@oneui/ui-native/components/Chip`, per CombinationsRules/ChipRules.txt.
 *
 * Sections:
 *   1. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative (shown selected)
 *   2. Sizes           — S / M / L
 *   3. Selected        — selected=false and =true
 *   4. Attentions      — high / medium / low
 *   5. Disabled        — disabled=true, selected=true and =false
 *   6. Slots           — start / end / start-end, each filled with an icon,
 *                        avatar, counter badge and indicator badge
 *
 * Each Chip is wrapped in StatefulChip so it shows its initial state AND stays
 * interactive (controlled `selected` + `onSelectedChange`). disabled cells
 * naturally ignore taps.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Chip } from '@oneui/ui-native/components/Chip';
import type {
  ChipAppearance,
  ChipAttention,
  ChipSize,
} from '@oneui/ui-native/components/Chip';
import { Icon, type IconSize } from '@oneui/ui-native/components/Icon';
import { Avatar, type AvatarSize } from '@oneui/ui-native/components/Avatar';
import { CounterBadge } from '@oneui/ui-native/components/CounterBadge';
import { IndicatorBadge } from '@oneui/ui-native/components/IndicatorBadge';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcFavorite;

const APPEARANCES: readonly ChipAppearance[] = [
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

const SIZES: readonly ChipSize[] = ['s', 'm', 'l'];
const ATTENTIONS: readonly ChipAttention[] = ['high', 'medium', 'low'];

// Per-Chip-size sizing for slot content, mirroring the Chip showcase.
const ICON_SIZE_BY_CHIP: Record<ChipSize, IconSize> = { s: '3', m: '4', l: '5' };
const BADGE_SIZE_BY_CHIP: Record<ChipSize, 'xs' | 's' | 'm'> = { s: 'xs', m: 's', l: 'm' };
const AVATAR_SIZE_BY_CHIP: Record<ChipSize, AvatarSize> = { s: 'xs', m: 'xs', l: 's' };

/* ─── Slot builders ──────────────────────────────────────────────────────── */

type SlotKind = 'icon' | 'avatar' | 'counter' | 'indicator';

const SLOT_KINDS: readonly SlotKind[] = ['icon', 'avatar', 'counter', 'indicator'];

function slotNode(kind: SlotKind, size: ChipSize): React.ReactNode {
  switch (kind) {
    case 'icon':
      return <Icon icon={GLYPH} size={ICON_SIZE_BY_CHIP[size]} appearance='secondary' aria-hidden />;
    case 'avatar':
      return <Avatar size={AVATAR_SIZE_BY_CHIP[size]} appearance='secondary' alt='JD' />;
    case 'counter':
      return (
        <CounterBadge value={3} size={BADGE_SIZE_BY_CHIP[size]} appearance='negative' aria-label='3' />
      );
    case 'indicator':
      return (
        <IndicatorBadge size={BADGE_SIZE_BY_CHIP[size]} appearance='negative' aria-label='status' />
      );
  }
}

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface ChipSpec {
  readonly testID: string;
  readonly label: string;
  readonly initialSelected?: boolean;
  readonly size?: ChipSize;
  readonly appearance?: ChipAppearance;
  readonly attention?: ChipAttention;
  readonly disabled?: boolean;
  readonly start?: React.ReactNode;
  readonly end?: React.ReactNode;
}

// 1 · All appearances — shown selected so the selected fill colour is visible.
const APPEARANCE_CELLS: readonly ChipSpec[] = APPEARANCES.map((appearance) => ({
  testID: `chip-appearance-${appearance}`,
  label: appearance,
  appearance,
  attention: 'high',
  initialSelected: true,
}));

// 2 · Sizes S / M / L.
const SIZE_CELLS: readonly ChipSpec[] = SIZES.map((size) => ({
  testID: `chip-size-${size}`,
  label: `size ${size}`,
  size,
  attention: 'high',
  initialSelected: true,
}));

// 3 · Selected false / true.
const SELECTED_CELLS: readonly ChipSpec[] = [false, true].map((sel) => ({
  testID: `chip-selected-${sel}`,
  label: `selected ${sel}`,
  attention: 'high',
  initialSelected: sel,
}));

// 4 · Attentions high / medium / low.
const ATTENTION_CELLS: readonly ChipSpec[] = ATTENTIONS.map((attention) => ({
  testID: `chip-attention-${attention}`,
  label: attention,
  attention,
  initialSelected: true,
}));

// 5 · Disabled, selected=true and =false.
const DISABLED_CELLS: readonly ChipSpec[] = [true, false].map((sel) => ({
  testID: `chip-disabled-${sel ? 'selected' : 'unselected'}`,
  label: `disabled · ${sel ? 'selected' : 'unselected'}`,
  disabled: true,
  attention: 'high',
  initialSelected: sel,
}));

// 6 · Slots — start / end / start-end × icon / avatar / counter / indicator.
const SLOT_CELLS: readonly ChipSpec[] = SLOT_KINDS.flatMap((kind) =>
  (['start', 'end', 'start-end'] as const).map((position) => ({
    testID: `chip-slot-${position}-${kind}`,
    label: `${position} · ${kind}`,
    attention: 'high' as const,
    initialSelected: true,
    start: position !== 'end' ? slotNode(kind, 'm') : undefined,
    end: position !== 'start' ? slotNode(kind, 'm') : undefined,
  })),
);

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly ChipSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (S / M / L)', cells: SIZE_CELLS },
  { testID: 'section-selected', title: '3 · Selected (false / true)', cells: SELECTED_CELLS },
  { testID: 'section-attentions', title: '4 · Attentions (high / medium / low)', cells: ATTENTION_CELLS },
  { testID: 'section-disabled', title: '5 · Disabled × selected', cells: DISABLED_CELLS },
  { testID: 'section-slots', title: '6 · Slots (start / end / start-end)', cells: SLOT_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function ChipScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Chip'
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
  cells: readonly ChipSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.row}>
        {cells.map((cell) => (
          <StatefulChip key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

/**
 * Controlled Chip seeded from `initialSelected` so it shows the rule state yet
 * remains interactive. disabled cells naturally ignore taps.
 */
function StatefulChip({
  testID,
  label,
  initialSelected = false,
  size,
  appearance,
  attention,
  disabled,
  start,
  end,
}: ChipSpec): React.ReactElement {
  const [selected, setSelected] = useState(initialSelected);
  return (
    <Chip
      testID={testID}
      selected={selected}
      onSelectedChange={setSelected}
      size={size}
      appearance={appearance}
      attention={attention}
      disabled={disabled}
      start={start}
      end={end}
    >
      {label}
    </Chip>
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
