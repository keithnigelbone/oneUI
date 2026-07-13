/**
 * Chip row for a single verifier dimension (brand, theme, etc.).
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens, touchTarget, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';

export interface SelectorClusterProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

export function SelectorCluster({
  label,
  value,
  options,
  onChange,
}: SelectorClusterProps): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const spacing = tokens.spacing;

  return (
    <View style={{ gap: spacing['2-5'] }}>
      <Text
        style={{
          color: roles.onBoldContent.medium,
          fontSize: typography.size['2xs'],
          fontWeight: typography.weight.medium,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          rowGap: spacing['2-5'],
          columnGap: spacing['2-5'],
        }}
      >
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              accessibilityRole='button'
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${label} ${opt}`}
              style={({ pressed }) => [
                styles.chip,
                {
                  paddingHorizontal: spacing['3-5'],
                  paddingVertical: spacing['2-5'],
                  borderRadius: tokens.shape.pill,
                  backgroundColor: active
                    ? primary.surfaces.bold
                    : pressed
                      ? roles.states.pressed
                      : 'transparent',
                  borderColor: active
                    ? primary.surfaces.bold
                    : roles.content.strokeMedium,
                  borderWidth: tokens.borderWidth.hairline,
                  minHeight: Math.max(32, touchTarget.min - 8),
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: active
                    ? primary.onBoldContent.high
                    : roles.onBoldContent.medium,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                }}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
});
