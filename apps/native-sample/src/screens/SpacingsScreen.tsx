/**
 * SpacingsScreen.tsx
 *
 * Mirrors DimensionsScreen but renders the spacing scale (which currently
 * aliases dimensions 1:1) as labelled boxes. Useful for designers comparing
 * gap / padding choices.
 */

import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import {
  DEFAULT_DIMENSION_SCALE,
  DEFAULT_SPACING_SCALE,
} from '../foundations-core';
import { resolveAllSpacings } from '../foundations-core/spacingLogic';
import { usePageContext } from '../PageContext';

export function SpacingsScreen(): React.ReactElement {
  const { density } = usePageContext();
  const { width } = useWindowDimensions();
  const roles = useSurfaceTokens('primary');
  const neutral = useSurfaceTokens('neutral');

  const resolved = resolveAllSpacings(
    width,
    DEFAULT_DIMENSION_SCALE,
    DEFAULT_SPACING_SCALE,
    density,
  );

  return (
    <ScreenScaffold
      title='Spacings'
      description={`Spacing tokens at viewport ${width.toFixed(0)}dp · density ${density}. Each tile shows the resolved gap between the two dots.`}
    >
      <Section title='Tile preview'>
        <View style={styles.grid}>
          {resolved.map(({ token, px }) => (
            <View
              key={token}
              style={[
                styles.tile,
                { borderColor: neutral.content.strokeLow },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: roles.surfaces.bold },
                ]}
              />
              <View style={{ width: px, height: 4 }} />
              <View
                style={[
                  styles.dot,
                  { backgroundColor: roles.surfaces.bold },
                ]}
              />
              <Text
                style={{
                  marginLeft: tokens.spacing['3-5'],
                  color: neutral.content.high,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                }}
              >
                f{token}
              </Text>
              <Text
                style={{
                  marginLeft: tokens.spacing['2-5'],
                  color: neutral.content.medium,
                  fontSize: typography.size['2xs'],
                }}
              >
                {px.toFixed(1)}dp
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: tokens.spacing['2-5'],
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing['3-5'],
    paddingVertical: tokens.spacing['2-5'],
    borderWidth: tokens.borderWidth.hairline,
    borderRadius: tokens.shape.s,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: tokens.shape.pill,
  },
});
