/**
 * ColourPaletteScreen.tsx
 *
 * Renders the 25-step OkLCH ramp for the active appearance role under the
 * active brand. The same scale `useScale` builds on web — but on native we
 * read it directly from `themeConfig.appearances[appearance].palette`,
 * which `buildNativeTheme` populated.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useOneUITheme, useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { usePageContext } from '../PageContext';

const STEPS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400,
  1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500,
] as const;

export function ColourPaletteScreen(): React.ReactElement {
  const { appearance, brandId, brands } = usePageContext();
  const theme = useOneUITheme();
  const roles = useSurfaceTokens('neutral');

  const brandName =
    brands?.find((b) => b._id === brandId)?.name ?? brandId ?? 'loading…';
  const scale =
    theme.themeConfig.appearances[appearance] ??
    theme.themeConfig.appearances.neutral;

  return (
    <ScreenScaffold
      title='Colour palette'
      description={`25-step OkLCH ramp for ${appearance} (brand: ${brandName}). The active scale powers every other token screen.`}
    >
      <Section
        title={`${scale.name} · base ${scale.baseStep}`}
        description='Tap a step header to see the resolved hex; the chip background is the live token value.'
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          contentContainerStyle={styles.row}
        >
          {STEPS.map((step) => {
            const hex = scale.palette[step];
            const isBase = scale.baseStep === step;
            return (
              <View key={step} style={styles.stepCol}>
                <Text
                  style={{
                    color: isBase ? roles.content.high : roles.content.medium,
                    fontSize: typography.size.xs,
                    fontWeight: isBase
                      ? typography.weight.high
                      : typography.weight.medium,
                  }}
                >
                  {step}
                  {isBase ? ' ★' : ''}
                </Text>
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: hex ?? 'transparent',
                      borderColor: roles.content.strokeMedium,
                    },
                  ]}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    color: roles.content.medium,
                    fontSize: typography.size['2xs'],
                  }}
                >
                  {hex ?? '—'}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </Section>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: tokens.spacing['3-5'],
    paddingVertical: tokens.spacing['3-5'],
  },
  stepCol: {
    alignItems: 'center',
    gap: tokens.spacing['2'],
    width: 64,
  },
  swatch: {
    width: 56,
    height: 56,
    borderWidth: tokens.borderWidth.hairline,
    borderRadius: tokens.shape.s,
  },
});
