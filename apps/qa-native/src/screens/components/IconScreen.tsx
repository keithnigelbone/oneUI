/**
 * IconScreen — focused test surface for the design-system `<Icon>` from
 * `@oneui/ui-native/components/Icon`, per CombinationsRules/IconRules.txt.
 *
 * Sections:
 *   1. All emphasis     — high / medium / low / tinted / tintedA11y
 *   2. All appearances  — neutral / primary / secondary / sparkle / positive /
 *                         negative / warning / informative
 *   3. All sizes        — every spacing-index size in ICON_SIZES ('2' … '40')
 *
 * Icon renders a single glyph with no text and no onPress, so each cell pairs
 * the glyph with a caption and carries a stable `testID` for Maestro / Detox.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import {
  Icon,
  ICON_SIZES,
  type IconAppearance,
  type IconEmphasis,
  type IconSize,
} from '@oneui/ui-native/components/Icon';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

// Single glyph for every cell — colour + pixel size come from the Icon's own
// appearance / emphasis / size props.
const GLYPH = JdsIcons.IcFavorite;

const EMPHASES: readonly IconEmphasis[] = ['high', 'medium', 'low', 'tinted', 'tintedA11y'];

const APPEARANCES: readonly IconAppearance[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface IconCellSpec {
  readonly testID: string;
  readonly caption: string;
  readonly appearance?: IconAppearance;
  readonly emphasis?: IconEmphasis;
  readonly size?: IconSize;
}

// 1 · All emphasis. Rendered on the primary role so the colour prominence
// (incl. tinted / tintedA11y) is clearly visible.
const EMPHASIS_CELLS: readonly IconCellSpec[] = EMPHASES.map((emphasis) => ({
  testID: `icon-emphasis-${emphasis}`,
  caption: emphasis,
  appearance: 'primary',
  emphasis,
}));

// 2 · All appearances (default emphasis = high).
const APPEARANCE_CELLS: readonly IconCellSpec[] = APPEARANCES.map((appearance) => ({
  testID: `icon-appearance-${appearance}`,
  caption: appearance,
  appearance,
}));

// 3 · All sizes (default appearance/emphasis).
const SIZE_CELLS: readonly IconCellSpec[] = ICON_SIZES.map((size) => ({
  testID: `icon-size-${size}`,
  caption: size,
  size,
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly IconCellSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-emphasis', title: '1 · All emphasis', cells: EMPHASIS_CELLS },
  { testID: 'section-appearances', title: '2 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '3 · All sizes', cells: SIZE_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function IconScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Icon'
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
  cells: readonly IconCellSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.cellRow}>
        {cells.map((cell) => (
          <IconCell key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

function IconCell({
  testID,
  caption,
  appearance,
  emphasis,
  size,
}: IconCellSpec): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={styles.cell}>
      <Icon
        testID={testID}
        icon={GLYPH}
        appearance={appearance}
        emphasis={emphasis}
        size={size}
        aria-label={`${caption} icon`}
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
