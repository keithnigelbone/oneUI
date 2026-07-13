/**
 * LogoScreen — focused test surface for `<Logo>` from
 * `@oneui/ui-native/components/Logo`, per CombinationsRules/LogoRules.txt.
 *
 * Sections:
 *   1. Sizes — XS / S / M / L / XL, plus a custom size of 100
 *
 * Logo requires content + `alt`; a small inline SVG string is used as
 * `svgContent` (mirrors the component showcase). The custom cell pairs
 * `size='custom'` with `customSize={100}`.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Logo } from '@oneui/ui-native/components/Logo';
import type { LogoSize } from '@oneui/ui-native/components/Logo';
import { tokens, typography } from '@oneui/tokens';

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';

const CUSTOM_SIZE = 100;

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface LogoSpec {
  readonly testID: string;
  readonly label: string;
  readonly size: LogoSize;
  readonly customSize?: number;
}

// 1 · Sizes XS / S / M / L / XL + custom 100.
const SIZE_CELLS: readonly LogoSpec[] = [
  { testID: 'logo-size-xs', label: 'XS', size: 'xs' },
  { testID: 'logo-size-s', label: 'S', size: 's' },
  { testID: 'logo-size-m', label: 'M', size: 'm' },
  { testID: 'logo-size-l', label: 'L', size: 'l' },
  { testID: 'logo-size-xl', label: 'XL', size: 'xl' },
  { testID: 'logo-size-custom', label: `custom (${CUSTOM_SIZE})`, size: 'custom', customSize: CUSTOM_SIZE },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function LogoScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Logo'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      <View
        testID='section-sizes'
        style={[styles.section, { borderColor: role.content.strokeLow }]}
      >
        <Text style={[styles.sectionTitle, { color: role.content.high }]}>1 · Sizes</Text>
        <View style={styles.row}>
          {SIZE_CELLS.map((cell) => (
            <View key={cell.testID} style={styles.cell}>
              <Logo
                testID={cell.testID}
                size={cell.size}
                customSize={cell.customSize}
                svgContent={SAMPLE_SVG}
                alt={`${cell.label} logo`}
              />
              <Text style={[styles.caption, { color: role.content.low }]}>{cell.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
    alignItems: 'flex-end',
    gap: tokens.spacing['5'],
  },
  cell: {
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  caption: {
    fontSize: typography.size.xs,
  },
});
