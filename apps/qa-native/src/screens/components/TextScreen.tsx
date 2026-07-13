/**
 * TextScreen — focused test surface for `<Text>` from
 * `@oneui/ui-native/components/Text`, per CombinationsRules/TextRules.txt.
 *
 * Sections:
 *   1. Variants     — display / headline / title / body / label / code
 *   2. Sizes        — each variant rendered at its valid sizes (the rule's
 *                     3XS…L list, intersected with what each variant supports:
 *                     display/headline/title = S/M/L, body = 2XS…L,
 *                     label = 3XS…L, code = XS/S/M)
 *   3. Decorations  — italic / underline / strikethrough
 *   4. Attentions   — high / medium / low
 *   5. Max lines    — maxLines=2 truncation
 *
 * Variants/sizes are written with literal-typed arrays because `variant` and
 * `size` form a discriminated union on TextProps (size narrows per variant).
 */

import React from 'react';
import { ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { useSurfaceTokens } from '@oneui/ui-native';
import { Text } from '@oneui/ui-native/components/Text';
import { tokens, typography } from '@oneui/tokens';

const SAMPLE = 'The quick brown fox';
const LONG = 'The quick brown fox jumps over the lazy dog, then circles back around the meadow to do it all over again and again.';

/* ─── Screen ─────────────────────────────────────────────────────────────── */

export function TextScreen(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <ScrollView
      testID='screen-Text'
      style={{ backgroundColor: role.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      {/* 1 · Variants */}
      <Section testID='section-variants' title='1 · Variants'>
        <Cell label='display'>
          <Text testID='text-variant-display' variant='display'>{SAMPLE}</Text>
        </Cell>
        <Cell label='headline'>
          <Text testID='text-variant-headline' variant='headline'>{SAMPLE}</Text>
        </Cell>
        <Cell label='title'>
          <Text testID='text-variant-title' variant='title'>{SAMPLE}</Text>
        </Cell>
        <Cell label='body'>
          <Text testID='text-variant-body' variant='body'>{SAMPLE}</Text>
        </Cell>
        <Cell label='label'>
          <Text testID='text-variant-label' variant='label'>{SAMPLE}</Text>
        </Cell>
        <Cell label='code'>
          <Text testID='text-variant-code' variant='code'>{SAMPLE}</Text>
        </Cell>
      </Section>

      {/* 2 · Sizes (per variant, valid subset of 3XS…L) */}
      <Section testID='section-sizes' title='2 · Sizes (per variant)'>
        <SubLabel>display</SubLabel>
        {(['S', 'M', 'L'] as const).map((size) => (
          <Cell key={`display-${size}`} label={`display ${size}`}>
            <Text testID={`text-size-display-${size}`} variant='display' size={size}>{SAMPLE}</Text>
          </Cell>
        ))}
        <SubLabel>headline</SubLabel>
        {(['S', 'M', 'L'] as const).map((size) => (
          <Cell key={`headline-${size}`} label={`headline ${size}`}>
            <Text testID={`text-size-headline-${size}`} variant='headline' size={size}>{SAMPLE}</Text>
          </Cell>
        ))}
        <SubLabel>title</SubLabel>
        {(['S', 'M', 'L'] as const).map((size) => (
          <Cell key={`title-${size}`} label={`title ${size}`}>
            <Text testID={`text-size-title-${size}`} variant='title' size={size}>{SAMPLE}</Text>
          </Cell>
        ))}
        <SubLabel>body</SubLabel>
        {(['2XS', 'XS', 'S', 'M', 'L'] as const).map((size) => (
          <Cell key={`body-${size}`} label={`body ${size}`}>
            <Text testID={`text-size-body-${size}`} variant='body' size={size}>{SAMPLE}</Text>
          </Cell>
        ))}
        <SubLabel>label</SubLabel>
        {(['3XS', '2XS', 'XS', 'S', 'M', 'L'] as const).map((size) => (
          <Cell key={`label-${size}`} label={`label ${size}`}>
            <Text testID={`text-size-label-${size}`} variant='label' size={size}>{SAMPLE}</Text>
          </Cell>
        ))}
        <SubLabel>code</SubLabel>
        {(['XS', 'S', 'M'] as const).map((size) => (
          <Cell key={`code-${size}`} label={`code ${size}`}>
            <Text testID={`text-size-code-${size}`} variant='code' size={size}>{SAMPLE}</Text>
          </Cell>
        ))}
      </Section>

      {/* 3 · Decorations */}
      <Section testID='section-decorations' title='3 · Decorations'>
        <Cell label='italic'>
          <Text testID='text-decoration-italic' variant='body' italic>{SAMPLE}</Text>
        </Cell>
        <Cell label='underline'>
          <Text testID='text-decoration-underline' variant='body' underline>{SAMPLE}</Text>
        </Cell>
        <Cell label='strikethrough'>
          <Text testID='text-decoration-strikethrough' variant='body' strikethrough>{SAMPLE}</Text>
        </Cell>
      </Section>

      {/* 4 · Attentions */}
      <Section testID='section-attentions' title='4 · Attentions'>
        {(['high', 'medium', 'low'] as const).map((attention) => (
          <Cell key={attention} label={attention}>
            <Text testID={`text-attention-${attention}`} variant='body' attention={attention}>
              {SAMPLE}
            </Text>
          </Cell>
        ))}
      </Section>

      {/* 5 · Max lines */}
      <Section testID='section-maxlines' title='5 · Max lines (2)'>
        <Cell label='maxLines=2'>
          <Text testID='text-maxlines-2' variant='body' maxLines={2}>{LONG}</Text>
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
      <RNText style={[styles.sectionTitle, { color: role.content.high }]}>{title}</RNText>
      {children}
    </View>
  );
}

function SubLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <RNText style={[styles.subLabel, { color: role.content.medium }]}>{children}</RNText>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={styles.cell}>
      <RNText style={[styles.caption, { color: role.content.low }]}>{label}</RNText>
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
  subLabel: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  cell: {
    gap: tokens.spacing['2'],
  },
  caption: {
    fontSize: typography.size.xs,
  },
});
