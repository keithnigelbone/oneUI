/**
 * TouchSlider.styles.native.ts
 * Structural styles for TouchSlider.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const styles = StyleSheet.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootVertical: {
    flexDirection: 'column',
  },
  control: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  controlHorizontal: {
    height: tokens.spacing['9'],
    minWidth: tokens.spacing['28'],
  },
  controlVertical: {
    flexDirection: 'column',
    width: tokens.spacing['9'],
    minHeight: tokens.spacing['28'],
  },
  track: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    // Geometry (width/height %) is handled inline
  },
  slot: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: tokens.spacing['4-5'],
    height: tokens.spacing['4-5'],
  },
  slotHorizontal: {
    top: '50%',
    transform: [{ translateY: '-50%' }],
    justifyContent: 'center',
  },
  slotStartHorizontal: {
    left: tokens.spacing['2'],
  },
  slotVertical: {
    left: '50%',
    transform: [{ translateX: '-50%' }],
    alignItems: 'center',
  },
  slotStartVertical: {
    bottom: tokens.spacing['2'],
  },
});

export const DISABLED_OPACITY = 0.5;
