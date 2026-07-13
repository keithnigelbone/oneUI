/**
 * ImageScreen — focused test surface for `<Image>` from
 * `@oneui/ui-native/components/Image`, per CombinationsRules/ImageRules.txt.
 *
 * Sections:
 *   1. Aspect ratios          — auto / 1:1 / 1:2 / 2:1 / 2:3 / 3:2 / 3:4 / 4:3 /
 *                               9:16 / 16:9 / 9:21 / 21:9
 *   2. Interactive × ratios   — interactive=true across the same ratio set
 *
 * Image requires a `src` URL and `alt` text; a bundled local asset is resolved
 * to a URI so the screen works offline (same pattern as AvatarScreen). Each
 * cell is given a fixed container width so the rendered height derives from the
 * aspect ratio. `auto` has no intrinsic box, so it also gets a height to remain
 * visible in the harness.
 */

import React from 'react';
import { Image as RNImage, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Image } from '@oneui/ui-native/components/Image';
import type { ImageAspectRatio } from '@oneui/ui-native/components/Image';
import { tokens, typography } from '@oneui/tokens';

// Bundled asset → URI string for the design-system Image's `src`. Resolving a
// `require()` keeps it offline (no network dependency); mirrors AvatarScreen.
const SAMPLE = RNImage.resolveAssetSource(
  require('../../../assets/images/profile_men.jpeg'),
).uri;

// Fixed container width per cell; height derives from the aspect ratio.
// INTENTIONAL-LITERAL: layout dimensions for the QA harness (mirrors the
// Image component showcase, which sizes cells with raw px widths).
const CELL_WIDTH = 120;
const AUTO_HEIGHT = 90;

const ASPECT_RATIOS: readonly ImageAspectRatio[] = [
  'auto',
  '1:1',
  '1:2',
  '2:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '9:21',
  '21:9',
];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface ImageSpec {
  readonly testID: string;
  readonly label: string;
  readonly aspectRatio: ImageAspectRatio;
  readonly interactive?: boolean;
}

// 1 · All aspect ratios.
const RATIO_CELLS: readonly ImageSpec[] = ASPECT_RATIOS.map((aspectRatio) => ({
  testID: `image-ratio-${aspectRatio}`,
  label: aspectRatio,
  aspectRatio,
}));

// 2 · interactive=true across the same ratio set.
const INTERACTIVE_CELLS: readonly ImageSpec[] = ASPECT_RATIOS.map((aspectRatio) => ({
  testID: `image-interactive-${aspectRatio}`,
  label: aspectRatio,
  aspectRatio,
  interactive: true,
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly ImageSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-aspect-ratios', title: '1 · Aspect ratios', cells: RATIO_CELLS },
  { testID: 'section-interactive', title: '2 · Interactive × aspect ratios', cells: INTERACTIVE_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function ImageScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Image'
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
  cells: readonly ImageSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.row}>
        {cells.map((cell) => (
          <View key={cell.testID} style={styles.cell}>
            <Image
              testID={cell.testID}
              src={SAMPLE}
              alt={`${cell.label}${cell.interactive ? ' interactive' : ''}`}
              aspectRatio={cell.aspectRatio}
              interactive={cell.interactive}
              onPress={cell.interactive ? () => {} : undefined}
              width={CELL_WIDTH}
              height={cell.aspectRatio === 'auto' ? AUTO_HEIGHT : undefined}
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
    alignItems: 'flex-start',
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
