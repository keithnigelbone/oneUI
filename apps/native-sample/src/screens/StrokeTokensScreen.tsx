/**
 * StrokeTokensScreen.tsx
 *
 * Visualises the two stroke widths (`borderWidth.hairline`,
 * `borderWidth.thin`) plus the two stroke colour tokens
 * (`content.strokeMedium`, `content.strokeLow`) for the active appearance.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { usePageContext } from '../PageContext';

export function StrokeTokensScreen(): React.ReactElement {
  const { appearance } = usePageContext();
  const roles = useSurfaceTokens(appearance);
  const neutral = useSurfaceTokens('neutral');

  return (
    <ScreenScaffold
      title='Stroke tokens'
      description='Two stroke widths × two stroke colours. tokens.borderWidth.{hairline,thin} are 1 / 2 device pixels.'
    >
      <Section title='Widths'>
        <View style={styles.row}>
          <StrokePreview
            label='hairline'
            sublabel={`${tokens.borderWidth.hairline}px`}
            width={tokens.borderWidth.hairline}
            color={roles.content.strokeMedium}
          />
          <StrokePreview
            label='thin'
            sublabel={`${tokens.borderWidth.thin}px`}
            width={tokens.borderWidth.thin}
            color={roles.content.strokeMedium}
          />
        </View>
      </Section>
      <Section title='Colours'>
        <View style={styles.row}>
          <ColourSwatch label='strokeMedium' hex={roles.content.strokeMedium} />
          <ColourSwatch label='strokeLow'    hex={roles.content.strokeLow} />
          <ColourSwatch label='neutral · strokeMedium' hex={neutral.content.strokeMedium} />
        </View>
      </Section>
    </ScreenScaffold>
  );
}

interface StrokePreviewProps {
  label: string;
  sublabel: string;
  width: number;
  color: string;
}

function StrokePreview({ label, sublabel, width, color }: StrokePreviewProps): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  return (
    <View style={styles.col}>
      <View
        style={[
          styles.strokeCard,
          { borderColor: color, borderWidth: width },
        ]}
      />
      <Text
        style={{
          color: neutral.content.high,
          fontSize: typography.size.s,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
      <Text style={{ color: neutral.content.medium, fontSize: typography.size['2xs'] }}>
        {sublabel}
      </Text>
    </View>
  );
}

interface ColourSwatchProps {
  label: string;
  hex: string;
}

function ColourSwatch({ label, hex }: ColourSwatchProps): React.ReactElement {
  const neutral = useSurfaceTokens('neutral');
  return (
    <View style={styles.col}>
      <View style={[styles.colourBox, { backgroundColor: hex, borderColor: neutral.content.strokeLow }]} />
      <Text
        style={{
          color: neutral.content.high,
          fontSize: typography.size.s,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
      <Text style={{ color: neutral.content.medium, fontSize: typography.size['2xs'] }}>
        {hex}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['4'],
  },
  col: {
    width: 120,
    gap: tokens.spacing['2'],
  },
  strokeCard: {
    height: 48,
    borderRadius: tokens.shape.s,
  },
  colourBox: {
    height: 40,
    borderRadius: tokens.shape.s,
    borderWidth: tokens.borderWidth.hairline,
  },
});
