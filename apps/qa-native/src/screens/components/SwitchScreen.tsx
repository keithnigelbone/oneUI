/**
 * SwitchScreen — focused test surface for `<Switch>` from
 * `@oneui/ui-native/components/Switch`, per CombinationsRules/SwitchRules.txt.
 *
 * Sections:
 *   1. appearances   — auto + 9 named roles, each shown checked
 *   2. sizes         — S / M / L × checked=true/false
 *   3. checked       — checked=true and checked=false (default size M)
 *   4. readOnly      — readOnly=true, checked=true and =false
 *   5. disabled      — disabled=true, checked=true and =false
 *   6. accent        — primary / secondary / sparkle × checked=true, plus no-accent baseline
 *   7. with-label    — children label, S/M/L each checked=true and =false
 *
 * Each Switch is wrapped in StatefulSwitch for interactive behaviour.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Switch } from '@oneui/ui-native/components/Switch';
import type { SwitchAppearance, SwitchAccent, SwitchSize } from '@oneui/ui-native/components/Switch';
import { tokens, typography } from '@oneui/tokens';

const APPEARANCES: readonly SwitchAppearance[] = [
  'auto',
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'brand-bg',
  'positive',
  'negative',
  'warning',
  'informative',
];

const SIZES: readonly SwitchSize[] = ['s', 'm', 'l'];
const ACCENTS: readonly SwitchAccent[] = ['primary', 'secondary', 'sparkle'];

/* ─── Cell spec ──────────────────────────────────────────────────────────── */

interface SwSpec {
  readonly testID: string;
  readonly label?: string;
  readonly ariaLabel?: string;
  readonly initialChecked?: boolean;
  readonly size?: SwitchSize;
  readonly appearance?: SwitchAppearance;
  readonly accent?: SwitchAccent;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
}

// 1 · All appearances — checked so fill colour is visible.
const APPEARANCE_CELLS: readonly SwSpec[] = APPEARANCES.map((appearance) => ({
  testID: `sw-appearance-${appearance}`,
  ariaLabel: appearance,
  appearance,
  initialChecked: true,
}));

// 2 · Sizes × checked.
const SIZE_CELLS: readonly SwSpec[] = SIZES.flatMap((size) =>
  [true, false].map((checked) => ({
    testID: `sw-size-${size}-${checked ? 'on' : 'off'}`,
    ariaLabel: `size ${size} ${checked ? 'on' : 'off'}`,
    size,
    initialChecked: checked,
  })),
);

// 3 · Checked / unchecked.
const CHECKED_CELLS: readonly SwSpec[] = [true, false].map((checked) => ({
  testID: `sw-checked-${checked ? 'on' : 'off'}`,
  ariaLabel: checked ? 'on' : 'off',
  initialChecked: checked,
}));

// 4 · ReadOnly × checked.
const READONLY_CELLS: readonly SwSpec[] = [true, false].map((checked) => ({
  testID: `sw-readonly-${checked ? 'on' : 'off'}`,
  ariaLabel: `readOnly ${checked ? 'on' : 'off'}`,
  readOnly: true,
  initialChecked: checked,
}));

// 5 · Disabled × checked.
const DISABLED_CELLS: readonly SwSpec[] = [true, false].map((checked) => ({
  testID: `sw-disabled-${checked ? 'on' : 'off'}`,
  ariaLabel: `disabled ${checked ? 'on' : 'off'}`,
  disabled: true,
  initialChecked: checked,
}));

// 6 · Accent × checked=true, plus no-accent baseline.
const ACCENT_CELLS: readonly SwSpec[] = [
  { testID: 'sw-accent-none', ariaLabel: 'no accent (auto)', initialChecked: true },
  ...ACCENTS.map((accent) => ({
    testID: `sw-accent-${accent}`,
    ariaLabel: `accent ${accent}`,
    accent,
    initialChecked: true as const,
  })),
];

// 7 · With label — S/M/L × checked=true/false.
const LABEL_CELLS: readonly SwSpec[] = SIZES.flatMap((size) =>
  [true, false].map((checked) => ({
    testID: `sw-label-${size}-${checked ? 'on' : 'off'}`,
    label: `${size.toUpperCase()} · ${checked ? 'On' : 'Off'}`,
    size,
    initialChecked: checked,
  })),
);

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly SwSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (S / M / L) × checked', cells: SIZE_CELLS },
  { testID: 'section-checked', title: '3 · Checked / unchecked', cells: CHECKED_CELLS },
  { testID: 'section-readonly', title: '4 · ReadOnly × checked', cells: READONLY_CELLS },
  { testID: 'section-disabled', title: '5 · Disabled × checked', cells: DISABLED_CELLS },
  { testID: 'section-accent', title: '6 · Accent × checked', cells: ACCENT_CELLS },
  { testID: 'section-with-label', title: '7 · With label', cells: LABEL_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function SwitchScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Switch'
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
  cells: readonly SwSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.column}>
        {cells.map((cell) => (
          <StatefulSwitch key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

function StatefulSwitch({
  testID,
  label,
  ariaLabel,
  initialChecked = false,
  size,
  appearance,
  accent,
  disabled,
  readOnly,
}: SwSpec): React.ReactElement {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <Switch
      testID={testID}
      checked={checked}
      onCheckedChange={setChecked}
      size={size}
      appearance={appearance}
      accent={accent}
      disabled={disabled}
      readOnly={readOnly}
      aria-label={label === undefined ? ariaLabel : undefined}
    >
      {label}
    </Switch>
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
