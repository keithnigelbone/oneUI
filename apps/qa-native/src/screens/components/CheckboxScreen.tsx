/**
 * CheckboxScreen — focused test surface for `<Checkbox>` from
 * `@oneui/ui-native/components/Checkbox`, per CombinationsRules/CheckboxRules.txt.
 *
 * Sections:
 *   1. All appearances — auto + neutral / primary / secondary / sparkle /
 *                        positive / negative / warning / informative (shown selected)
 *   2. Sizes           — S / M / L, each selected=true and =false
 *   3. Disabled        — disabled=true, selected=true and =false
 *   4. ReadOnly        — readOnly=true, selected=true and =false
 *   5. Selected        — selected=true and =false
 *   6. Indeterminate   — indeterminate=true
 *
 * Each Checkbox is wrapped in StatefulCheckbox so it shows its initial state
 * AND stays interactive (controlled `selected` + `onSelectedChange`). The
 * Checkbox renders its own `label`, so no extra caption is needed.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Checkbox } from '@oneui/ui-native/components/Checkbox';
import type {
  CheckboxAppearance,
  CheckboxSize,
} from '@oneui/ui-native/components/Checkbox';
import { tokens, typography } from '@oneui/tokens';

const APPEARANCES: readonly CheckboxAppearance[] = [
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

const SIZES: readonly CheckboxSize[] = ['s', 'm', 'l'];

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

interface CbSpec {
  readonly testID: string;
  readonly label: string;
  readonly initialSelected?: boolean;
  readonly size?: CheckboxSize;
  readonly appearance?: CheckboxAppearance;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly indeterminate?: boolean;
}

// 1 · All appearances — shown selected so the checked fill colour is visible.
const APPEARANCE_CELLS: readonly CbSpec[] = APPEARANCES.map((appearance) => ({
  testID: `cb-appearance-${appearance}`,
  label: appearance,
  appearance,
  initialSelected: true,
}));

// 2 · Sizes S / M / L, each selected=true and =false.
const SIZE_CELLS: readonly CbSpec[] = SIZES.flatMap((size) =>
  [true, false].map((sel) => ({
    testID: `cb-size-${size}-${sel ? 'selected' : 'unselected'}`,
    label: `size ${size} · ${sel ? 'selected' : 'unselected'}`,
    size,
    initialSelected: sel,
  })),
);

// 3 · Disabled, selected=true and =false.
const DISABLED_CELLS: readonly CbSpec[] = [true, false].map((sel) => ({
  testID: `cb-disabled-${sel ? 'selected' : 'unselected'}`,
  label: `disabled · ${sel ? 'selected' : 'unselected'}`,
  disabled: true,
  initialSelected: sel,
}));

// 4 · ReadOnly, selected=true and =false.
const READONLY_CELLS: readonly CbSpec[] = [true, false].map((sel) => ({
  testID: `cb-readonly-${sel ? 'selected' : 'unselected'}`,
  label: `readOnly · ${sel ? 'selected' : 'unselected'}`,
  readOnly: true,
  initialSelected: sel,
}));

// 5 · Selected true / false.
const SELECTED_CELLS: readonly CbSpec[] = [true, false].map((sel) => ({
  testID: `cb-selected-${sel}`,
  label: `selected ${sel}`,
  initialSelected: sel,
}));

// 6 · Indeterminate.
const INDETERMINATE_CELLS: readonly CbSpec[] = [
  { testID: 'cb-indeterminate', label: 'indeterminate', indeterminate: true },
];

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly CbSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (S / M / L) × selected', cells: SIZE_CELLS },
  { testID: 'section-disabled', title: '3 · Disabled × selected', cells: DISABLED_CELLS },
  { testID: 'section-readonly', title: '4 · ReadOnly × selected', cells: READONLY_CELLS },
  { testID: 'section-selected', title: '5 · Selected (true / false)', cells: SELECTED_CELLS },
  { testID: 'section-indeterminate', title: '6 · Indeterminate', cells: INDETERMINATE_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function CheckboxScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Checkbox'
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
  cells: readonly CbSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.column}>
        {cells.map((cell) => (
          <StatefulCheckbox key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

/**
 * Controlled Checkbox seeded from `initialSelected` so it shows the rule state
 * yet remains interactive. disabled / readOnly cells naturally ignore taps.
 */
function StatefulCheckbox({
  testID,
  label,
  initialSelected = false,
  size,
  appearance,
  disabled,
  readOnly,
  indeterminate,
}: CbSpec): React.ReactElement {
  const [selected, setSelected] = useState(initialSelected);
  return (
    <Checkbox
      testID={testID}
      label={label}
      selected={selected}
      onSelectedChange={setSelected}
      size={size}
      appearance={appearance}
      disabled={disabled}
      readOnly={readOnly}
      indeterminate={indeterminate}
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
