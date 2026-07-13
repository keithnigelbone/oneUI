/**
 * InputFieldScreen — focused test surface for `<InputField>` from
 * `@oneui/ui-native/components/InputField`, per
 * CombinationsRules/InputFieldRules.txt.
 *
 * Sections:
 *   1. Sizes        — S / M / L
 *   2. Label        — label present / absent
 *   3. Feedback     — feedback (error row) present / absent
 *   4. Dynamic text + helper button — dynamicText and helperButton both set
 *
 * InputField owns its inner value (uncontrolled), so cells render directly.
 * The dynamic-text row has a leading `dynamicText` copy and a trailing
 * `helperButton` action.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { InputField } from '@oneui/ui-native/components/InputField';
import type { InputSize } from '@oneui/ui-native/components/InputField';
import { tokens, typography } from '@oneui/tokens';

const SIZES: readonly InputSize[] = ['s', 'm', 'l'];

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function InputFieldScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-InputField'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Sizes */}
      <Section testID='section-sizes' title='1 · Sizes (S / M / L)'>
        {SIZES.map((size) => (
          <Cell key={String(size)} label={`size ${size}`}>
            <InputField
              testID={`inputfield-size-${size}`}
              size={size}
              label={`Size ${String(size).toUpperCase()}`}
              placeholder='Placeholder'
            />
          </Cell>
        ))}
      </Section>

      {/* 2 · Label present / absent */}
      <Section testID='section-label' title='2 · Label (true / false)'>
        <Cell label='label: true'>
          <InputField
            testID='inputfield-label-true'
            label='Email address'
            description='We never share your email.'
            placeholder='you@example.com'
          />
        </Cell>
        <Cell label='label: false'>
          <InputField
            testID='inputfield-label-false'
            placeholder='No label — placeholder only'
            accessibilityLabel='Unlabelled field'
          />
        </Cell>
      </Section>

      {/* 3 · Feedback present / absent */}
      <Section testID='section-feedback' title='3 · Feedback (true / false)'>
        <Cell label='feedback: true'>
          <InputField
            testID='inputfield-feedback-true'
            label='Email'
            defaultValue='not-an-email'
            error='Enter a valid email address'
            placeholder='you@example.com'
          />
        </Cell>
        <Cell label='feedback: false'>
          <InputField
            testID='inputfield-feedback-false'
            label='Email'
            placeholder='you@example.com'
          />
        </Cell>
      </Section>

      {/* 4 · Dynamic text + helper button */}
      <Section testID='section-dynamic-helper' title='4 · Dynamic text + helper button'>
        <Cell label='dynamic: true · helper: true'>
          <InputField
            testID='inputfield-dynamic-true-helper-true'
            label='Message'
            placeholder='Type here'
            dynamicText='0 / 240 characters'
            helperButton='Clear'
          />
        </Cell>
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
