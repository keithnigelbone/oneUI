/**
 * RadioFieldScreen — focused test surface for `<RadioField>` from
 * `@oneui/ui-native/components/RadioField`, per
 * CombinationsRules/RadioFieldRules.txt.
 *
 * Sections:
 *   1. Sizes        — S / M / L
 *   2. Appearances  — auto + 8 roles
 *   3. Checked      — checked true / false
 *   4. Info icon    — infoIconSlot present / absent
 *   5. Required     — required true / false
 *   6. All fields   — label + description + required + info icon + feedback + dynamic text
 *   7. Disabled     — disabled, with all fields
 *   8. ReadOnly     — readOnly, with all fields
 *
 * Each field uses integrated single mode (string `label`, no `<Radio>`
 * children) so a lone radio toggles via controlled `checked`. The fields stay
 * interactive through a StatefulRadioField wrapper.
 */

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { RadioField } from '@oneui/ui-native/components/RadioField';
import type { RadioFieldProps, RadioAppearance, RadioSize } from '@oneui/ui-native/components/RadioField';
import { IconButton } from '@oneui/ui-native/components/IconButton';
import { InputFeedback } from '@oneui/ui-native/components/InputFeedback';
import { tokens, typography } from '@oneui/tokens';
import * as JdsIcons from '@jds/core-icons--react-native';

const SIZES: readonly RadioSize[] = ['s', 'm', 'l'];

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

function infoNode(): React.ReactNode {
  return (
    <IconButton icon={JdsIcons.IcInfo} size='xs' attention='low' appearance='neutral' aria-label='More information' />
  );
}

function feedbackNode(): React.ReactNode {
  return <InputFeedback variant='informative'>Helpful feedback message</InputFeedback>;
}

// Props shared by the "all fields" sections (6 / 7 / 8).
const ALL_FIELDS: Partial<RadioFieldProps> = {
  label: 'Subscribe to updates',
  description: 'We send a short summary once a week.',
  required: true,
  dynamicText: 'Dynamic helper text',
  helperButton: 'Learn more',
};

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function RadioFieldScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-RadioField'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Sizes */}
      <Section testID='section-sizes' title='1 · Sizes (S / M / L)'>
        {SIZES.map((size) => (
          <Cell key={size} label={`size ${size}`}>
            <StatefulRadioField testID={`radiofield-size-${size}`} label={`Size ${size}`} size={size} initialChecked />
          </Cell>
        ))}
      </Section>

      {/* 2 · Appearances */}
      <Section testID='section-appearances' title='2 · Appearances'>
        {APPEARANCES.map((appearance) => (
          <Cell key={appearance} label={appearance}>
            <StatefulRadioField
              testID={`radiofield-appearance-${appearance}`}
              label={appearance}
              appearance={appearance}
              initialChecked
            />
          </Cell>
        ))}
      </Section>

      {/* 3 · Checked true / false */}
      <Section testID='section-checked' title='3 · Checked (true / false)'>
        {[true, false].map((chk) => (
          <Cell key={String(chk)} label={`checked ${chk}`}>
            <StatefulRadioField
              testID={`radiofield-checked-${chk}`}
              label={`checked ${chk}`}
              initialChecked={chk}
            />
          </Cell>
        ))}
      </Section>

      {/* 4 · Info icon present / absent */}
      <Section testID='section-info-icon' title='4 · Info icon (true / false)'>
        <Cell label='info icon: true'>
          <StatefulRadioField
            testID='radiofield-infoicon-true'
            label='With info icon'
            infoIconSlot={infoNode()}
            initialChecked
          />
        </Cell>
        <Cell label='info icon: false'>
          <StatefulRadioField testID='radiofield-infoicon-false' label='Without info icon' initialChecked />
        </Cell>
      </Section>

      {/* 5 · Required true / false */}
      <Section testID='section-required' title='5 · Required (true / false)'>
        {[true, false].map((req) => (
          <Cell key={String(req)} label={`required ${req}`}>
            <StatefulRadioField
              testID={`radiofield-required-${req}`}
              label={`required ${req}`}
              required={req}
              initialChecked
            />
          </Cell>
        ))}
      </Section>

      {/* 6 · All fields */}
      <Section testID='section-all-fields' title='6 · All fields'>
        <Cell label='label + description + required + info + feedback + dynamic text'>
          <StatefulRadioField
            testID='radiofield-all-fields'
            {...ALL_FIELDS}
            infoIconSlot={infoNode()}
            feedback={feedbackNode()}
            initialChecked
          />
        </Cell>
      </Section>

      {/* 7 · Disabled (with all fields) */}
      <Section testID='section-disabled' title='7 · Disabled (all fields)'>
        <Cell label='disabled'>
          <StatefulRadioField
            testID='radiofield-disabled'
            {...ALL_FIELDS}
            infoIconSlot={infoNode()}
            feedback={feedbackNode()}
            disabled
            initialChecked
          />
        </Cell>
      </Section>

      {/* 8 · ReadOnly (with all fields) */}
      <Section testID='section-readonly' title='8 · ReadOnly (all fields)'>
        <Cell label='readOnly'>
          <StatefulRadioField
            testID='radiofield-readonly'
            {...ALL_FIELDS}
            infoIconSlot={infoNode()}
            feedback={feedbackNode()}
            readOnly
            initialChecked
          />
        </Cell>
      </Section>
    </ScrollView>
  );
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */

/**
 * Controlled RadioField in integrated single mode, seeded from `initialChecked`
 * so it shows the rule state yet stays interactive (disabled / readOnly cells
 * naturally ignore taps).
 */
function StatefulRadioField({
  initialChecked = false,
  ...props
}: { initialChecked?: boolean } & RadioFieldProps): React.ReactElement {
  const [checked, setChecked] = useState(initialChecked);
  return <RadioField {...props} checked={checked} onCheckedChange={setChecked} />;
}

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
      <Text style={[styles.caption, { color: role.content.low }]}>{label}</Text>
      {children}
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
});
