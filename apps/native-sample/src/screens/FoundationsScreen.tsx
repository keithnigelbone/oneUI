/**
 * FoundationsScreen.tsx
 *
 * Overview cards linking to the four sub-screens (Dimensions / Spacings /
 * Shape / Strokes). Mirrors the v4-sample web FoundationsPage hub.
 */

import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';

interface FoundationCard {
  title: string;
  description: string;
  route: 'Dimensions' | 'Spacings' | 'Shape' | 'Strokes';
}

const CARDS: readonly FoundationCard[] = [
  {
    title: 'Dimensions',
    description: 'f-step ramp, 26 multipliers anchored at the base size.',
    route: 'Dimensions',
  },
  {
    title: 'Spacings',
    description: 'Numeric aliases over dimensions: 0, 0.5, 1 ... 40.',
    route: 'Spacings',
  },
  {
    title: 'Shape',
    description: 'Border-radius scale (xs → pill) for cards, chips, FABs.',
    route: 'Shape',
  },
  {
    title: 'Strokes',
    description: 'Border widths (hairline / thin) used by inputs / cards / dividers.',
    route: 'Strokes',
  },
];

export function FoundationsScreen(): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const navigation = useNavigation<{ navigate: (route: string) => void }>();

  return (
    <ScreenScaffold
      title='Foundations'
      description='Sub-token systems the colour pipeline does not touch — pure spatial / structural tokens.'
    >
      <View style={styles.grid}>
        {CARDS.map((card) => (
          <Pressable
            key={card.route}
            onPress={() => navigation.navigate(card.route)}
            accessibilityRole='button'
            accessibilityLabel={`Open ${card.title}`}
            style={({ pressed }) => [
              styles.card,
              {
                borderColor: roles.content.strokeLow,
                backgroundColor: pressed ? roles.states.pressed : roles.surfaces.minimal,
              },
            ]}
          >
            <Text
              style={{
                color: roles.content.high,
                fontSize: typography.size.l,
                fontWeight: typography.weight.high,
              }}
            >
              {card.title}
            </Text>
            <Text
              style={{
                color: roles.content.medium,
                fontSize: typography.size.s,
                lineHeight: typography.size.s * 1.4,
              }}
            >
              {card.description}
            </Text>
            <Text
              style={{
                color: roles.content.tinted,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.medium,
              }}
            >
              Tap to open →
            </Text>
          </Pressable>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: tokens.spacing['4'],
  },
  card: {
    padding: tokens.spacing['4'],
    borderRadius: tokens.shape.l,
    borderWidth: tokens.borderWidth.hairline,
    gap: tokens.spacing['2-5'],
  },
});
