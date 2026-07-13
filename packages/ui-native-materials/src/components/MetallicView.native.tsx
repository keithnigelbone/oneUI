/**
 * MetallicView.native.tsx
 * Gradient-based metallic surface using expo-linear-gradient
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@oneui/tokens';
import { useBrandMaterial } from '@oneui/ui-native';

export type MetallicType =
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'platinum'
  | 'roseGold';

export interface MetallicViewProps {
  /** Type of metallic finish */
  type?: MetallicType;
  /** Gradient angle in degrees (0 = top to bottom, 90 = left to right) */
  angle?: number;
  /** Additional styles for the container */
  style?: StyleProp<ViewStyle>;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * Convert angle to LinearGradient start/end points.
 * Exported for reuse in `initOneUIMaterials()`.
 */
export function angleToPoints(angle: number): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  const angleRad = ((angle - 90) * Math.PI) / 180;
  return {
    start: {
      x: 0.5 - Math.cos(angleRad) * 0.5,
      y: 0.5 - Math.sin(angleRad) * 0.5,
    },
    end: {
      x: 0.5 + Math.cos(angleRad) * 0.5,
      y: 0.5 + Math.sin(angleRad) * 0.5,
    },
  };
}

/**
 * MetallicView - Gradient-based metallic surface
 *
 * Creates premium metallic effects (gold, silver, bronze, etc.)
 * using multi-stop linear gradients.
 *
 * Usage:
 * ```tsx
 * <MetallicView type="gold">
 *   <Text style={{ color: tokens.material.metallic.gold.text }}>
 *     Premium Badge
 *   </Text>
 * </MetallicView>
 * ```
 */
export const MetallicView: React.FC<MetallicViewProps> = ({
  type = 'gold',
  angle = 135,
  style,
  children,
}) => {
  const staticMetallic = tokens.material.metallic[type];
  const brandMat = useBrandMaterial()?.metallic[type];

  const colors = (brandMat?.colors ?? staticMetallic.colors) as unknown as readonly [string, string, ...string[]];
  const locations = (brandMat?.locations ?? staticMetallic.locations) as unknown as readonly [number, number, ...number[]];
  const resolvedAngle = brandMat?.angle ?? angle;

  const { start, end } = angleToPoints(resolvedAngle);

  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      start={start}
      end={end}
      style={[styles.container, style]}
    >
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
};

/**
 * Get the recommended text color for a metallic type
 */
export function getMetallicTextColor(type: MetallicType): string {
  return tokens.material.metallic[type].text;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
