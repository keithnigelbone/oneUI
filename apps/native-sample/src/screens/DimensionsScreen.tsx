/**
 * DimensionsScreen.tsx
 *
 * Renders the f-step dimension ramp as a column of bars whose width = the
 * resolved px value at the active density. Viewport is the device width
 * (RN; no breakpoint slider).
 */

import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { DEFAULT_DIMENSION_SCALE } from '../foundations-core';
import { resolveAllDimensions } from '../foundations-core/dimensionLogic';
import { usePageContext } from '../PageContext';

export function DimensionsScreen(): React.ReactElement {
  const { density } = usePageContext();
  const { width } = useWindowDimensions();
  const roles = useSurfaceTokens('primary');
  const neutral = useSurfaceTokens('neutral');

  const resolved = resolveAllDimensions(width, DEFAULT_DIMENSION_SCALE, density);

  return (
    <ScreenScaffold
      title='Dimensions'
      description={`f-step scale resolved at viewport ${width.toFixed(0)}dp · density ${density}. Each bar's width = base × multiplier.`}
    >
      <Section
        title='Resolved values'
        description='Bars are clipped to the column width; very large multipliers (40 = 10×base) extend off-screen on small phones.'
      >
        <View style={styles.list}>
          {resolved.map(({ token, multiplier, px }) => (
            <View key={token} style={styles.row}>
              <Text
                style={{
                  width: 48,
                  color: neutral.content.high,
                  fontSize: typography.size.s,
                  fontWeight: typography.weight.medium,
                }}
              >
                f{token}
              </Text>
              <View style={styles.barWrap}>
                <View
                  style={{
                    width: Math.min(px, width - 200),
                    height: 14,
                    backgroundColor: roles.surfaces.bold,
                    borderRadius: tokens.shape.xs,
                  }}
                />
              </View>
              <Text
                style={{
                  width: 64,
                  textAlign: 'right',
                  color: neutral.content.medium,
                  fontSize: typography.size.xs,
                }}
              >
                {px.toFixed(1)}dp · ×{multiplier}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: tokens.spacing['2-5'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['3-5'],
  },
  barWrap: {
    flex: 1,
  },
});
