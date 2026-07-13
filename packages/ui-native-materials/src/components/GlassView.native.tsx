/**
 * GlassView.native.tsx
 * Advanced glass effect with blur and tint (Liquid Glass inspired)
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { tokens } from '@oneui/tokens';

export type GlassVariant = 'regular' | 'clear';
export type GlassTint = 'light' | 'dark' | 'default';

export interface GlassViewProps {
  /** Glass variant - regular (more blur) or clear (less blur) */
  variant?: GlassVariant;
  /** Color tint of the glass */
  tint?: GlassTint;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * GlassView - Advanced glass effect with blur and tint
 *
 * Similar to Apple's Liquid Glass effect on iOS.
 * Performance note: Use sparingly, 1-2 per viewport max.
 *
 * Usage:
 * ```tsx
 * <GlassView variant="regular" tint="light">
 *   <Card>Premium content</Card>
 * </GlassView>
 * ```
 */
export const GlassView: React.FC<GlassViewProps> = ({
  variant = 'regular',
  tint = 'light',
  style,
  children,
}) => {
  const blurIntensity = tokens.material.glass.intensity[variant];

  return (
    <BlurView
      intensity={blurIntensity}
      tint={tint}
      style={[styles.container, style]}
    >
      <View style={styles.content}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
    // INTENTIONAL-LITERAL: tracked under native-rewrite TODO — RN StyleSheet
    // does not support CSS custom properties; border alpha must be a direct rgba value
    // until a native token system is implemented.
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
});
