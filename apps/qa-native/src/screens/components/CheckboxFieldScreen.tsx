/**
 * CheckboxFieldScreen — focused test surface for `<CheckboxField>` from
 * `@oneui/ui-native/components/CheckboxField`, per
 * CombinationsRules/CheckboxFieldRules.txt.
 *
 * CheckboxField (single mode) wraps a Checkbox with a field-level `label`,
 * `description`, a feedback row (`error` shorthand or `feedback` node), and a
 * `dynamicText` / `helperButton` helper row.
 *
 * Sections:
 *   1. All appearances — auto + 8 roles (shown selected)
 *   2. Sizes × selected — S/M/L × {true,false}, each WITH description,
 *      feedback and helper text (per the rule)
 *   3. Disabled × selected
 *   4. ReadOnly × selected
 *   5. Selected (true / false)
 *   6. Indeterminate
 *
 * Each field is wrapped in StatefulCheckboxField so it shows its initial state
 * yet stays interactive (controlled `selected` + `onSelectedChange`).
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { InputFeedback, useSurfaceTokens } from '@oneui/ui-native';
import { CheckboxField } from '@oneui/ui-native/components/CheckboxField';
import type {
  CheckboxAppearance,
  CheckboxFieldProps,
  CheckboxSize,
} from '@oneui/ui-native/components/CheckboxField';
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

// Per the rules, EVERY combination shows a description, a feedback row, and a
// helper-text row. These are applied as defaults in StatefulCheckboxField.
//
// Feedback uses the <InputFeedback> node (passed to CheckboxField's `feedback`
// slot) rather than the `error` string shorthand — this renders the proper
// variant icon + styled message (matching the Figma feedback row) and, unlike
// `error`, does NOT force invalid/error chrome on the checkbox.
const COMMON_DESCRIPTION = 'Supplementary description for this field.';
const COMMON_FEEDBACK_MESSAGE = 'Feedback message for this field.';
const COMMON_HELPER_TEXT = 'Helper text';
const COMMON_HELPER_BUTTON = 'Action';

const COMMON_FEEDBACK_NODE = (
  <InputFeedback variant='negative' feedback_message={COMMON_FEEDBACK_MESSAGE} size='s' />
);

/* ─── Cell specs ─────────────────────────────────────────────────────────── */

type CbfPassThrough = Pick<
  CheckboxFieldProps,
  | 'label'
  | 'description'
  | 'feedback'
  | 'dynamicText'
  | 'helperButton'
  | 'size'
  | 'appearance'
  | 'disabled'
  | 'readOnly'
  | 'indeterminate'
  | 'fullWidth'
>;

interface CbfSpec extends CbfPassThrough {
  readonly testID: string;
  readonly initialSelected?: boolean;
}

// 1 · All appearances — shown selected so the checked fill colour is visible.
const APPEARANCE_CELLS: readonly CbfSpec[] = APPEARANCES.map((appearance) => ({
  testID: `cbf-appearance-${appearance}`,
  label: appearance,
  appearance,
  initialSelected: true,
}));

// 2 · Sizes S/M/L × selected. (description / feedback / helper come from the
// common defaults applied to every field.)
const SIZE_CELLS: readonly CbfSpec[] = SIZES.flatMap((size) =>
  [true, false].map((sel) => ({
    testID: `cbf-size-${size}-${sel ? 'selected' : 'unselected'}`,
    label: `size ${size} · ${sel ? 'selected' : 'unselected'}`,
    size,
    initialSelected: sel,
  })),
);

// 3 · Disabled × selected.
const DISABLED_CELLS: readonly CbfSpec[] = [true, false].map((sel) => ({
  testID: `cbf-disabled-${sel ? 'selected' : 'unselected'}`,
  label: `disabled · ${sel ? 'selected' : 'unselected'}`,
  disabled: true,
  initialSelected: sel,
}));

// 4 · ReadOnly × selected.
const READONLY_CELLS: readonly CbfSpec[] = [true, false].map((sel) => ({
  testID: `cbf-readonly-${sel ? 'selected' : 'unselected'}`,
  label: `readOnly · ${sel ? 'selected' : 'unselected'}`,
  readOnly: true,
  initialSelected: sel,
}));

// 5 · Selected true / false.
const SELECTED_CELLS: readonly CbfSpec[] = [true, false].map((sel) => ({
  testID: `cbf-selected-${sel}`,
  label: `selected ${sel}`,
  initialSelected: sel,
}));

// 6 · Indeterminate.
const INDETERMINATE_CELLS: readonly CbfSpec[] = [
  { testID: 'cbf-indeterminate', label: 'indeterminate', indeterminate: true },
];

interface SectionSpec {
  readonly testID: string;
  readonly title: string;
  readonly cells: readonly CbfSpec[];
}

const SECTIONS: readonly SectionSpec[] = [
  { testID: 'section-appearances', title: '1 · All appearances', cells: APPEARANCE_CELLS },
  { testID: 'section-sizes', title: '2 · Sizes (S/M/L) × selected', cells: SIZE_CELLS },
  { testID: 'section-disabled', title: '3 · Disabled × selected', cells: DISABLED_CELLS },
  { testID: 'section-readonly', title: '4 · ReadOnly × selected', cells: READONLY_CELLS },
  { testID: 'section-selected', title: '5 · Selected (true / false)', cells: SELECTED_CELLS },
  { testID: 'section-indeterminate', title: '6 · Indeterminate', cells: INDETERMINATE_CELLS },
];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function CheckboxFieldScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-CheckboxField'
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
  cells: readonly CbfSpec[];
}): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View testID={testID} style={[styles.section, { borderColor: role.content.strokeLow }]}>
      <Text style={[styles.sectionTitle, { color: role.content.high }]}>{title}</Text>
      <View style={styles.column}>
        {cells.map((cell) => (
          <StatefulCheckboxField key={cell.testID} {...cell} />
        ))}
      </View>
    </View>
  );
}

/**
 * Controlled CheckboxField seeded from `initialSelected` so it shows the rule
 * state yet stays interactive. disabled / readOnly cells ignore taps.
 *
 * Every field renders the common description / feedback / helper-text rows
 * (defaults below); a cell can override any of them via its spec.
 */
function StatefulCheckboxField({
  testID,
  initialSelected = false,
  ...rest
}: CbfSpec): React.ReactElement {
  const [selected, setSelected] = useState(initialSelected);
  return (
    <CheckboxField
      testID={testID}
      selected={selected}
      onSelectedChange={setSelected}
      fullWidth
      description={COMMON_DESCRIPTION}
      feedback={COMMON_FEEDBACK_NODE}
      dynamicText={COMMON_HELPER_TEXT}
      // helperButton={COMMON_HELPER_BUTTON}
      {...rest}
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
    gap: tokens.spacing['5'],
    alignItems: 'stretch',
  },
});
