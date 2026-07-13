/**
 * ContentTokensScreen.tsx
 *
 * For each surface mode, render the 7 content tokens (high / medium / low
 * / tinted / tintedA11y / strokeMedium / strokeLow). Native equivalent of
 * the web ContentTokensPage which renders content tokens nested inside
 * each `<Surface mode>`.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens, type SurfaceToken } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { CONTENT_TOKENS, SURFACE_TOKENS } from '../tokens';
import { usePageContext } from '../PageContext';

export function ContentTokensScreen(): React.ReactElement {
  const { appearance } = usePageContext();

  return (
    <ScreenScaffold
      title='Content tokens'
      description='Foreground colour tokens — useSurfaceTokens(role).content. Each card mounts a Surface and reads tokens from the new boundary so the result matches what a real screen would render.'
    >
      {SURFACE_TOKENS.map((mode) => (
        <Section key={mode} title={`Surface · ${mode}`}>
          <Surface mode={mode as SurfaceToken} appearance={appearance} style={styles.surfaceCard}>
            <ContentSwatchRow appearance={appearance} />
          </Surface>
        </Section>
      ))}
    </ScreenScaffold>
  );
}

interface ContentSwatchRowProps {
  appearance: string;
}

function ContentSwatchRow({ appearance }: ContentSwatchRowProps): React.ReactElement {
  const roles = useSurfaceTokens(appearance);
  return (
    <View style={styles.row}>
      {CONTENT_TOKENS.map((tokenName) => {
        const hex = roles.content[tokenName];
        return (
          <View key={tokenName} style={styles.col}>
            <Text
              numberOfLines={1}
              style={{
                color: roles.content.high,
                fontSize: typography.size.s,
                fontWeight: typography.weight.medium,
              }}
            >
              {tokenName}
            </Text>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: hex,
                  borderColor: roles.content.strokeLow,
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
              {hex}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  surfaceCard: {
    padding: tokens.spacing['4'],
    borderRadius: tokens.shape.m,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['3-5'],
  },
  col: {
    width: 92,
    gap: tokens.spacing['2'],
  },
  dot: {
    height: 32,
    borderRadius: tokens.shape.xs,
    borderWidth: tokens.borderWidth.hairline,
  },
});
