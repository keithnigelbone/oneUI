/**
 * CircularProgressIndicatorScreen — focused test surface for
 * `<CircularProgressIndicator>` (CPI) from
 * `@oneui/ui-native/components/CircularProgressIndicator`, per
 * CombinationsRules/CircularProgressIndicatorRules.txt.
 *
 * Sections:
 *   1. Variants     — determinate / indeterminate
 *   2. Sizes        — 2XS … 5XL (full 10-step scale)
 *   3. Appearances  — auto + 9 roles
 *   4. Content      — icon / text, on a large size so it fits
 *   5. Min & max    — min=10, max=80 (value shown relative to that range)
 *
 * Determinate cells carry a `value` so the arc is visible; the text-content
 * cells render the auto percentage label.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { CircularProgressIndicator } from '@oneui/ui-native/components/CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorSize,
} from '@oneui/ui-native/components/CircularProgressIndicator';
import { Icon } from '@oneui/ui-native/components/Icon';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const GLYPH = JdsIcons.IcDownload;
const VALUE = 65;

const SIZES: readonly CircularProgressIndicatorSize[] = [
  '2XS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
];

const APPEARANCES: readonly CircularProgressIndicatorAppearance[] = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
  'brand-bg',
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function CircularProgressIndicatorScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-CircularProgressIndicator'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Variants */}
      <Section testID='section-variants' title='1 · Variants (determinate / indeterminate)'>
        <View style={styles.row}>
          <Cell label='determinate'>
            <CircularProgressIndicator
              testID='cpi-variant-determinate'
              variant='determinate'
              value={VALUE}
              size='XL'
              aria-label='determinate progress'
            />
          </Cell>
          <Cell label='indeterminate'>
            <CircularProgressIndicator
              testID='cpi-variant-indeterminate'
              variant='indeterminate'
              size='XL'
              aria-label='indeterminate progress'
            />
          </Cell>
        </View>
      </Section>

      {/* 2 · Sizes 2XS … 5XL */}
      <Section testID='section-sizes' title='2 · Sizes (2XS … 5XL)'>
        <View style={styles.row}>
          {SIZES.map((size) => (
            <Cell key={size} label={size}>
              <CircularProgressIndicator
                testID={`cpi-size-${size}`}
                value={VALUE}
                size={size}
                aria-label={`${size} progress`}
              />
            </Cell>
          ))}
        </View>
      </Section>

      {/* 3 · Appearances */}
      <Section testID='section-appearances' title='3 · Appearances'>
        <View style={styles.row}>
          {APPEARANCES.map((appearance) => (
            <Cell key={appearance} label={appearance}>
              <CircularProgressIndicator
                testID={`cpi-appearance-${appearance}`}
                value={VALUE}
                size='XL'
                appearance={appearance}
                aria-label={`${appearance} progress`}
              />
            </Cell>
          ))}
        </View>
      </Section>

      {/* 4 · Content — icon / text (large size) */}
      <Section testID='section-content' title='4 · Content (icon / text)'>
        <View style={styles.row}>
          <Cell label='icon'>
            <CircularProgressIndicator
              testID='cpi-content-icon'
              value={50}
              size='4XL'
              content='icon'
              aria-label='icon content progress'
            >
              <Icon icon={GLYPH} size='8' appearance='primary' aria-hidden />
            </CircularProgressIndicator>
          </Cell>
          <Cell label='text'>
            <CircularProgressIndicator
              testID='cpi-content-text'
              value={50}
              size='4XL'
              content='text'
              aria-label='text content progress'
            />
          </Cell>
        </View>
      </Section>

      {/* 5 · Min & max */}
      <Section testID='section-min-max' title='5 · Min 10 / Max 80'>
        <View style={styles.row}>
          <Cell label='min=10 max=80 value=45'>
            <CircularProgressIndicator
              testID='cpi-min-max'
              variant='determinate'
              value={45}
              min={10}
              max={80}
              size='4XL'
              content='text'
              aria-label='progress with min 10 max 80'
            />
          </Cell>
        </View>
      </Section>
    </ScrollView>
  );
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */

function Section({
  testID,
  title,
  children,
}: {
  testID: string;
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      {children}
    </View>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={styles.cell}>
      {children}
      <Text style={[styles.caption, { color: role.content.low }]}>{label}</Text>
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
