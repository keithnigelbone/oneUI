/**
 * BottomNavigation.styles.native.ts — layout peer of BottomNavigation.module.css (.root)
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const styles = StyleSheet.create({
  root: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: tokens.spacing['0'],
    paddingHorizontal: tokens.spacing['4'],
  },
  itemList: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  dividerBleed: {
    marginHorizontal: -tokens.spacing['4'],
  },
});
