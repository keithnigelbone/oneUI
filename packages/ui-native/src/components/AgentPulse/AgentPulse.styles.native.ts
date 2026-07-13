/**
 * AgentPulse styles (native)
 * Geometry-only StyleSheet.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { AgentPulseSize } from './interface';

export const SIZE_MAP: Record<AgentPulseSize, number> = {
  sm: tokens.spacing['5'],
  md: tokens.spacing['7'],
  lg: tokens.spacing['9'],
  xl: tokens.spacing['12'],
};

export const styles = StyleSheet.create({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  player: {
    width: '100%',
    height: '100%',
  },
});
