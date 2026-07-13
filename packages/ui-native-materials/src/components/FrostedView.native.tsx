/**
 * FrostedView.native.tsx
 * Blur-based frosted glass effect using expo-blur
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { tokens } from '@oneui/tokens';

export type FrostedIntensity =
  | 'ultraThin'
  | 'thin'
  | 'regular'
  | 'thick'
  | 'ultraThick';

export type FrostedTint = 'light' | 'dark' | 'default';

export interface FrostedViewProps {
  /** Blur intensity level */
  intensity?: FrostedIntensity;
  /** Color tint of the blur */
  tint?: FrostedTint;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * FrostedView - Blur-based frosted glass effect
 *
 * Uses expo-blur BlurView for native blur implementation.
 * Performance note: Limit to 3 blur elements per viewport.
 *
 * Usage:
 * ```tsx
 * <FrostedView intensity="regular" tint="light">
 *   <Text>Navigation content</Text>
 * </FrostedView>
 * ```
 */
export const FrostedView: React.FC<FrostedViewProps> = ({
  intensity = 'regular',
  tint = 'light',
  style,
  children,
}) => {
  const blurIntensity = tokens.material.frosted.intensity[intensity];

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
  },
  content: {
    flex: 1,
  },
});
