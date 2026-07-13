/**
 * RadioScreen — focused test surface for `<Radio>` from
 * `@oneui/ui-native/components/Radio`, per CombinationsRules/RadioRules.txt.
 *
 * Sections:
 *   1. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative (shown checked)
 *   2. Sizes           — S / M / L, each checked=true and =false
 *   3. Checked         — checked=true and =false
 *   4. ReadOnly        — readOnly=true
 *   5. Disabled        — disabled=true, checked=true and =false
 *
 * Each Radio is wrapped in StatefulRadio so it shows its initial state AND
 * stays interactive (controlled `checked` + `onChange`). The Radio renders its
 * own `label`, so no extra caption is needed.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Radio } from '@oneui/ui-native/components/Radio';
import type {
  RadioAppearance,
  RadioSize,
} from '@oneui/ui-native/components/Radio';
import { tokens, typography } from '@oneui/tokens';

const APPEARANCES: readonly RadioAppearance[] = [
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

const SIZES: readonly RadioSize[] = ['s', 'm', 'l'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface RadioSpec {
  readonly testID: string;
  readonly label: string;
  readonly initialChecked?: boolean;
  readonly size?: RadioSize;
  readonly appearance?: RadioAppearance;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
}

// 1 · All appearances — shown checked so the selected fill colour is visible.
const APPEARANCE_CELLS: readonly RadioSpec[] = APPEARANCES.map((appearance) => ({
  testID: `radio-appearance-${appearance}`,
  label: appearance,
  appearance,
  initialChecked: true,
}));

// 2 · Sizes S / M / L, each checked=true and =false.
const SIZE_CELLS: readonly RadioSpec[] = SIZES.flatMap((size) =>
  [true, false].map((chk) => ({
    testID: `radio-size-${size}-${chk ? 'checked' : 'unchecked'}`,
    label: `size ${size} · ${chk ? 'checked' : 'unchecked'}`,
    size,
    initialChecked: chk,
  })),
);

// 3 · Checked true / false.
const CHECKED_CELLS: readonly RadioSpec[] = [true, false].map((chk) => ({
  testID: `radio-checked-${chk}`,
  label: `checked ${chk}`,
  initialChecked: chk,
}));

// 4 · ReadOnly.
const READONLY_CELLS: readonly RadioSpec[] = [true, false].map((chk) => ({
  testID: `radio-readonly-${chk ? 'checked' : 'unchecked'}`,
  label: `readOnly · ${chk ? 'checked' : 'unchecked'}`,
  readOnly: true,
  initialChecked: chk,
}));

// 5 · Disabled, checked=true and =false.
const DISABLED_CELLS: readonly RadioSpec[] = [true, false].map((chk) => ({
  testID: `radio-disabled-${chk ? 'checked' : 'unchecked'}`,
  label: `disabled · ${chk ? 'checked' : 'unchecked'}`,
  disabled: true,
  initialChecked: chk,
}));

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly RadioSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (S / M / L) × checked', cells: SIZE_CELLS },
  { testID: 'section-checked', title: '3 · Checked (true / false)', cells: CHECKED_CELLS },
  { testID: 'section-readonly', title: '4 · ReadOnly', cells: READONLY_CELLS },
  { testID: 'section-disabled', title: '5 · Disabled × checked', cells: DISABLED_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function RadioScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Radio'
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
  cells: readonly RadioSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.column}>
        {cells.map((cell) => (
          <StatefulRadio key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

/**
 * Controlled Radio seeded from `initialChecked` so it shows the rule state yet
 * remains interactive. disabled / readOnly cells naturally ignore taps.
 */
function StatefulRadio({
  testID,
  label,
  initialChecked = false,
  size,
  appearance,
  disabled,
  readOnly,
}: RadioSpec): React.ReactElement {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <Radio
      testID={testID}
      label={label}
      checked={checked}
      onChange={setChecked}
      size={size}
      appearance={appearance}
      disabled={disabled}
      readOnly={readOnly}
    />
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
  column: {
    gap: tokens.spacing['3'],
    alignItems: 'flex-start',
  },
});
