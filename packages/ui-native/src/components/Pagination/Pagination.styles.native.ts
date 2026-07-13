/**
 * Pagination.styles.native.ts — geometry only (peer of Pagination.module.css).
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { PaginationPageChipSize } from './interface';

export const DISABLED_OPACITY = 0.5;

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1'],
  },
  rootDisabled: {
    opacity: DISABLED_OPACITY,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageChipPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  pageChipLabel: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  srOnly: {
    position: 'absolute',
    width: tokens.spacing['0-5'],
    height: tokens.spacing['0-5'],
    overflow: 'hidden',
    opacity: 0,
  },
});

export const PAGE_CHIP_SIZE: Record<
  PaginationPageChipSize,
  Pick<ViewStyle, 'minWidth' | 'minHeight' | 'paddingHorizontal' | 'paddingVertical'>
> = {
  s: {
    minWidth: tokens.spacing['5'],
    minHeight: tokens.spacing['5'],
    paddingHorizontal: tokens.spacing['0'],
    paddingVertical: tokens.spacing['0'],
  },
  m: {
    minWidth: tokens.spacing['8'],
    minHeight: tokens.spacing['8'],
    paddingHorizontal: tokens.spacing['0'],
    paddingVertical: tokens.spacing['0'],
  },
  l: {
    minWidth: tokens.spacing['12'],
    minHeight: tokens.spacing['12'],
    paddingHorizontal: tokens.spacing['0'],
    paddingVertical: tokens.spacing['0'],
  },
};
