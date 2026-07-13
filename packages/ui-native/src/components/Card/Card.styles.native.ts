/**
 * Card styles (native)
 * Geometry-only StyleSheet. OneUI brand paint (fill, border, shadow)
 * is applied inline via useSurfaceTokens and useElevation.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const styles = StyleSheet.create({
  card: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    // Default tokens from Card.tokens.ts (web parity)
    gap: tokens.spacing['3-5'],
    padding: tokens.spacing['4-5'],
    borderRadius: 0,
    borderWidth: tokens.borderWidth.hairline,
    // borderStyle defaults to solid on RN
  },
  interactive: {
    // Native interactive cards often use Pressable feedback;
    // visual lift (shadow change) happens inline.
  },
});
