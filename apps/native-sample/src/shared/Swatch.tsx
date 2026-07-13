/**
 * Swatch.tsx
 *
 * Token-driven colour swatch with optional label. Used by the palette /
 * surface / content / state visualisation screens.
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { useSurfaceTokens } from '@oneui/ui-native';

interface SwatchProps {
  /** Hex color (or `transparent`). */
  color: string;
  /** Caption rendered under the swatch. */
  label: string;
  /** Optional secondary line (e.g. token name). */
  sublabel?: string;
  /** Override default swatch box dims. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Swatch({
  color,
  label,
  sublabel,
  size = 56,
  style,
}: SwatchProps): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.swatch,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderColor: roles.content.strokeLow,
            borderWidth: tokens.borderWidth.hairline,
            borderRadius: tokens.shape.s,
          },
        ]}
      />
      <Text
        numberOfLines={1}
        style={{
          color: roles.content.high,
          fontSize: typography.size.s,
          fontWeight: typography.weight.medium,
        }}
      >
        {label}
      </Text>
      {sublabel ? (
        <Text
          numberOfLines={1}
          style={{
            color: roles.content.medium,
            fontSize: typography.size.xs,
          }}
        >
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    gap: tokens.spacing['2-5'],
  },
  swatch: {
    overflow: 'hidden',
  },
});
