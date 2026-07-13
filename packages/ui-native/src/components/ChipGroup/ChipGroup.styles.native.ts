/**
 * ChipGroup.styles.native.ts — layout peer of ChipGroup.module.css
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['2'],
    alignItems: 'flex-start',
  },
  groupVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  groupNoWrap: {
    flexWrap: 'nowrap',
  },
  scrollRow: {
    flexGrow: 0,
  },
  root: {
    width: '100%',
  },
  a11yGroupName: {
    position: 'absolute',
    width: tokens.spacing['0'],
    height: tokens.spacing['0'],
    opacity: 0,
    overflow: 'hidden',
  },
});
