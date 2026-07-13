/**
 * BottomNavigationItem.styles.native.ts — geometry peer of BottomNavigation.module.css (.item)
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { BottomNavigationLabelType } from '../BottomNavigation/BottomNavigationContext';

const ITEM_HEIGHT: Record<BottomNavigationLabelType, number> = {
  none: tokens.spacing['14'],
  '1line': tokens.spacing['16'],
  '2line': tokens.spacing['18'],
};

export const ICON_SIZE = {
  default: tokens.spacing['5'],
  large: tokens.spacing['6'],
} as const;

export const LABEL_TWO_LINE_HEIGHT = tokens.spacing['6'];

// INTENTIONAL-LITERAL: matches web `--Disabled-Opacity`
export const DISABLED_OPACITY = 0.5;

export const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing['1'],
  },
  inner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    gap: tokens.spacing['1-5'],
    paddingVertical: tokens.spacing['1'],
    borderRadius: tokens.shape['1'],
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  labelOneLine: {
    textAlign: 'center',
    maxWidth: '100%',
  },
  labelTwoLine: {
    textAlign: 'center',
    maxWidth: '100%',
    height: LABEL_TWO_LINE_HEIGHT,
  },
});

export function itemHeight(labelType: BottomNavigationLabelType): number {
  return ITEM_HEIGHT[labelType];
}
