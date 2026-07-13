/**
 * StrokesScreen.tsx
 *
 * Renders the foundations-core stroke scale: fixed widths (S → 2XL) plus
 * dimension-referenced widths (3XL → 9XL) that scale with viewport / density.
 */

import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import {
  DEFAULT_DIMENSION_SCALE,
  DEFAULT_STROKE_SCALE,
} from '../foundations-core';
import { resolveAllStrokes } from '../foundations-core/strokeLogic';
import { usePageContext } from '../PageContext';

export function StrokesScreen(): React.ReactElement {
  const { density } = usePageContext();
  const { width } = useWindowDimensions();
  const roles = useSurfaceTokens('primary');
  const neutral = useSurfaceTokens('neutral');

  const resolved = resolveAllStrokes(
    width,
    DEFAULT_DIMENSION_SCALE,
    DEFAULT_STROKE_SCALE,
    density,
  );

  return (
    <ScreenScaffold
      title='Strokes'
      description={`Stroke widths at viewport ${width.toFixed(0)}dp · density ${density}. Fixed strokes ignore density; dimension-referenced strokes scale with both density and viewport.`}
    >
      <Section title='Fixed widths'>
        <View style={styles.grid}>
          {resolved
            .filter((s) => s.kind === 'fixed')
            .map(({ token, px }) => (
              <StrokeCell key={token} label={token} px={px} kind='fixed' />
            ))}
        </View>
      </Section>
      <Section title='Dimension-referenced widths' description='These respond to the density selector.'>
        <View style={styles.grid}>
          {resolved
            .filter((s) => s.kind === 'dimension')
            .map(({ token, px, ref }) => (
              <StrokeCell key={token} label={token} px={px} kind='dimension' refToken={ref} />
            ))}
        </View>
      </Section>
    </ScreenScaffold>
  );

  function StrokeCell({
    label,
    px,
    kind,
    refToken,
  }: {
    label: string;
    px: number;
    kind: 'fixed' | 'dimension';
    refToken?: string | null;
  }): React.ReactElement {
    return (
      <View
        style={[
          styles.cell,
          { borderColor: neutral.content.strokeLow },
        ]}
      >
        <View
          style={[
            styles.preview,
            {
              borderTopColor: roles.surfaces.bold,
              borderTopWidth: Math.max(px, 0.5),
            },
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
          {px.toFixed(1)}dp · {kind === 'dimension' ? `→ f${refToken}` : 'fixed'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  cell: {
    width: 130,
    padding: tokens.spacing['2-5'],
    borderWidth: tokens.borderWidth.hairline,
    borderRadius: tokens.shape.s,
    gap: tokens.spacing['2'],
  },
  preview: {
    height: 16,
  },
});
