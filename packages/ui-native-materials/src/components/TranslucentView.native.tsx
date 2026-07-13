/**
 * TranslucentView.native.tsx
 * Simple opacity-based overlay for React Native
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { tokens } from '@oneui/tokens';

export type TranslucentTint = 'light' | 'dark';
export type TranslucentIntensity = 'minimal' | 'subtle' | 'moderate' | 'heavy';

export interface TranslucentViewProps {
  /** Color tint - light (white) or dark (black) */
  tint?: TranslucentTint;
  /** Opacity intensity level */
  intensity?: TranslucentIntensity;
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * TranslucentView - Simple opacity overlay
 *
 * Usage:
 * ```tsx
 * <TranslucentView tint="dark" intensity="moderate">
 *   <Text>Content on media</Text>
 * </TranslucentView>
 * ```
 */
export const TranslucentView: React.FC<TranslucentViewProps> = ({
  tint = 'light',
  intensity = 'moderate',
  style,
  children,
}) => {
  const backgroundColor =
    tint === 'light'
      ? tokens.material.translucent.light[intensity]
      : tokens.material.translucent.dark[intensity];

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
