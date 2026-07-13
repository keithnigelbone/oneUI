/**
 * AvatarScreen — focused test surface for `<Avatar>` from
 * `@oneui/ui-native/components/Avatar`, per CombinationsRules/AvatarRules.txt.
 *
 * Sections:
 *   1. All attention   — high / medium
 *   2. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative
 *   3. All sizes       — 2XS / XS / S / M / L / XL / 2XL
 *   4. Content types   — image / icon / text
 *   5. Disabled        — disabled=true for all three content types
 *
 * Content types are fed per the component contract: `image` → `src`,
 * `icon` → the default person glyph, `text` → `fallback` initials. Avatar is
 * non-interactive, so each cell pairs the element with a caption + stable testID.
 */

import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Avatar } from '@oneui/ui-native/components/Avatar';
import type {
  AvatarAppearance,
  AvatarAttention,
  AvatarProps,
  AvatarSize,
} from '@oneui/ui-native/components/Avatar';
import { tokens, typography } from '@oneui/tokens';

// Bundled local portrait — resolved to a URI string because Avatar renders
// `source={{ uri: src }}`. Works offline (no network dependency).
const SAMPLE_IMAGE = Image.resolveAssetSource(
  require('../../../assets/images/profile_men.jpeg'),
).uri;

const ATTENTIONS: readonly AvatarAttention[] = ['high', 'medium', 'low'];

const APPEARANCES: readonly AvatarAppearance[] = [
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

const SIZES: readonly AvatarSize[] = ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

type AvatarCellProps = Omit<AvatarProps, 'testID'>;

interface CellSpec {
  readonly testID: string;
  readonly caption: string;
  readonly props: AvatarCellProps;
}

// 1 · All attention (high / medium) — icon content so the fill is visible.
const ATTENTION_CELLS: readonly CellSpec[] = ATTENTIONS.map((attention) => ({
  testID: `avatar-attn-${attention}`,
  caption: attention,
  props: { content: 'icon', attention, size: 'l', alt: `${attention} avatar` },
}));

// 2 · All appearances (default attention = high).
const APPEARANCE_CELLS: readonly CellSpec[] = APPEARANCES.map((appearance) => ({
  testID: `avatar-appearance-${appearance}`,
  caption: appearance,
  props: { content: 'icon', appearance, size: 'l', alt: `${appearance} avatar` },
}));

// 3 · All sizes (2XS–2XL).
const SIZE_CELLS: readonly CellSpec[] = SIZES.map((size) => ({
  testID: `avatar-size-${size}`,
  caption: size,
  props: { content: 'icon', size, alt: `size ${size}` },
}));

// 4 · Content types — image / icon / text.
const CONTENT_CELLS: readonly CellSpec[] = [
  { testID: 'avatar-content-image', caption: 'image', props: { content: 'image', src: SAMPLE_IMAGE, size: 'l', alt: 'image avatar' } },
  { testID: 'avatar-content-icon', caption: 'icon', props: { content: 'icon', size: 'l', alt: 'icon avatar' } },
  { testID: 'avatar-content-text', caption: 'text', props: { content: 'text', fallback: 'AB', size: 'l', alt: 'text avatar' } },
];

// 5 · Disabled — disabled=true for all three content types.
const DISABLED_CELLS: readonly CellSpec[] = [
  { testID: 'avatar-disabled-image', caption: 'image', props: { content: 'image', src: SAMPLE_IMAGE, size: 'l', alt: 'disabled image avatar', disabled: true } },
  { testID: 'avatar-disabled-icon', caption: 'icon', props: { content: 'icon', size: 'l', alt: 'disabled icon avatar', disabled: true } },
  { testID: 'avatar-disabled-text', caption: 'text', props: { content: 'text', fallback: 'AB', size: 'l', alt: 'disabled text avatar', disabled: true } },
];

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly CellSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-attention', title: '1 · All attention (high / medium / low)', cells: ATTENTION_CELLS },
  { testID: 'section-appearances', title: '2 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '3 · All sizes (2XS–2XL)', cells: SIZE_CELLS },
  { testID: 'section-content', title: '4 · Content types (image / icon / text)', cells: CONTENT_CELLS },
  { testID: 'section-disabled', title: '5 · Disabled (all content types)', cells: DISABLED_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function AvatarScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Avatar'
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
        {cells.map(({ testID: cellTestID, caption, props }) => (
          <View key={cellTestID} style={styles.cell}>
            <Avatar testID={cellTestID} {...props} />
            <Text style={[styles.caption, { color: role.content.medium }]}>{caption}</Text>
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
