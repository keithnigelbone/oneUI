/**
 * ShapeScreen.tsx
 *
 * Renders rounded `<View>` previews for each shape token. The pill token
 * uses a constant large radius; everything else resolves through
 * `resolveAllShapes` against the active dimension scale.
 */

import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import {
  DEFAULT_DIMENSION_SCALE,
  DEFAULT_SHAPE_SCALE,
} from '../foundations-core';
import { resolveAllShapes } from '../foundations-core/shapeLogic';
import { usePageContext } from '../PageContext';

export function ShapeScreen(): React.ReactElement {
  const { density } = usePageContext();
  const { width } = useWindowDimensions();
  const roles = useSurfaceTokens('primary');
  const neutral = useSurfaceTokens('neutral');

  const resolved = resolveAllShapes(
    width,
    DEFAULT_DIMENSION_SCALE,
    DEFAULT_SHAPE_SCALE,
    density,
  );

  return (
    <ScreenScaffold
      title='Shape'
      description={`Border radius scale resolved at ${width.toFixed(0)}dp · density ${density}.`}
    >
      <Section title='Radii'>
        <View style={styles.grid}>
          {resolved.map(({ token, px }) => (
            <View key={token} style={styles.cell}>
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: roles.surfaces.bold,
                    borderRadius: px,
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
                {token === 'pill' ? 'pill' : `r${token}`}
              </Text>
              <Text
                style={{
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  cell: {
    width: 84,
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  swatch: {
    width: 64,
    height: 64,
  },
});
