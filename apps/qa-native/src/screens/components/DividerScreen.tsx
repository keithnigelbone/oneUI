/**
 * DividerScreen — focused test surface for `<Divider>` from
 * `@oneui/ui-native/components/Divider`, per CombinationsRules/DividerRules.txt.
 *
 * Sections:
 *   1. Orientation         — horizontal and vertical
 *   2. Sizes               — S / M / L
 *   3. Attentions          — high / medium / low
 *   4. Rounded caps        — roundCaps true and false
 *   5. Content × align     — content (icon / label) × contentAlign
 *                            (center / start / end)
 *
 * Divider stretches to fill its container, so horizontal cells sit in a
 * full-width box and vertical cells sit in a fixed-height row (mirrors the
 * component showcase). The icon slot uses the design-system Icon; the label
 * slot uses plain text children.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Divider } from '@oneui/ui-native/components/Divider';
import type {
  DividerSize,
  DividerAttention,
  DividerContent,
  DividerContentAlign,
} from '@oneui/ui-native/components/Divider';
import { Icon } from '@oneui/ui-native/components/Icon';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcFavorite;

const SIZES: readonly DividerSize[] = ['s', 'm', 'l'];
const ATTENTIONS: readonly DividerAttention[] = ['high', 'medium', 'low'];
const CONTENTS: readonly Exclude<DividerContent, 'none'>[] = ['icon', 'label'];
const ALIGNS: readonly DividerContentAlign[] = ['center', 'start', 'end'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface DividerSpec {
  readonly testID: string;
  readonly label: string;
  readonly orientation?: 'horizontal' | 'vertical';
  readonly size?: DividerSize;
  readonly attention?: DividerAttention;
  readonly roundCaps?: boolean;
  readonly content?: DividerContent;
  readonly contentAlign?: DividerContentAlign;
}

// 1 · Orientation.
const ORIENTATION_CELLS: readonly DividerSpec[] = [
  { testID: 'divider-horizontal', label: 'horizontal', orientation: 'horizontal' },
  { testID: 'divider-vertical', label: 'vertical', orientation: 'vertical' },
];

// 2 · Sizes S / M / L.
const SIZE_CELLS: readonly DividerSpec[] = SIZES.map((size) => ({
  testID: `divider-size-${size}`,
  label: `size ${size}`,
  size,
}));

// 3 · Attentions high / medium / low.
const ATTENTION_CELLS: readonly DividerSpec[] = ATTENTIONS.map((attention) => ({
  testID: `divider-attention-${attention}`,
  label: attention,
  attention,
}));

// 4 · Rounded caps true / false (size L makes the caps visible).
const ROUNDCAP_CELLS: readonly DividerSpec[] = [true, false].map((rc) => ({
  testID: `divider-roundcaps-${rc}`,
  label: `roundCaps ${rc}`,
  size: 'l',
  attention: 'high',
  roundCaps: rc,
}));

// 5 · Content (icon / label) × align (center / start / end).
const CONTENT_CELLS: readonly DividerSpec[] = CONTENTS.flatMap((content) =>
  ALIGNS.map((contentAlign) => ({
    testID: `divider-content-${content}-${contentAlign}`,
    label: `${content} · ${contentAlign}`,
    content,
    contentAlign,
    attention: 'medium' as const,
  })),
);

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly DividerSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-orientation', title: '1 · Orientation', cells: ORIENTATION_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (S / M / L)', cells: SIZE_CELLS },
  { testID: 'section-attentions', title: '3 · Attentions (high / medium / low)', cells: ATTENTION_CELLS },
  { testID: 'section-roundcaps', title: '4 · Rounded caps (true / false)', cells: ROUNDCAP_CELLS },
  { testID: 'section-content', title: '5 · Content × align', cells: CONTENT_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function DividerScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Divider'
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
  cells: readonly DividerSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      {cells.map((cell) => (
        <DividerCell key={cell.testID} {...cell} />
      ))}
    </View>
  );
}

/** Renders one Divider with the axis its orientation needs, plus a caption. */
function DividerCell({
  testID,
  label,
  orientation = 'horizontal',
  size,
  attention,
  roundCaps,
  content,
  contentAlign,
}: DividerSpec): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const divider = (
    <Divider
      testID={testID}
      orientation={orientation}
      size={size}
      attention={attention}
      roundCaps={roundCaps}
      content={content}
      contentAlign={contentAlign}
    >
      {content === 'icon' ? (
        <Icon icon={GLYPH} size='4' appearance='neutral' aria-hidden />
      ) : content === 'label' ? (
        'Label'
      ) : undefined}
    </Divider>
  );
  return (
    <View style={styles.cell}>
      <Text style={[styles.caption, { color: role.content.low }]}>{label}</Text>
      <View style={orientation === 'vertical' ? styles.verticalBox : styles.horizontalBox}>
        {divider}
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
  cell: {
    gap: tokens.spacing['2'],
  },
  caption: {
    fontSize: typography.size.xs,
  },
  // Full-width box so the horizontal divider has an axis to fill.
  horizontalBox: {
    width: '100%',
  },
  // Fixed-height row so the vertical divider has an axis to fill.
  verticalBox: {
    flexDirection: 'row',
    height: tokens.spacing['18'],
  },
});
