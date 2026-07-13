/**
 * Modal.styles.native.ts — structural StyleSheet.
 * Per-size geometry: tokens.spacing numeric keys.
 */

import { StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { ModalSize } from './interface';

export const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: tokens.spacing['4'],
    minHeight: tokens.spacing['14'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: tokens.spacing['2'],
  },
  headerContentCenter: {
    justifyContent: 'center',
  },
  headerText: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens.spacing['1'],
    flex: 1,
    minHeight: tokens.spacing['6'],
  },
  headerTextCenter: {
    alignItems: 'center',
  },
  headerStartSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: tokens.spacing['4'],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: tokens.spacing['4'],
    gap: tokens.spacing['2'],
  },
  footerVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  footerStart: {
    marginRight: 'auto',
  },
  footerStartVertical: {
    marginRight: 0,
    marginBottom: tokens.spacing['2'],
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  footerActionsVertical: {
    flexDirection: 'column',
    width: '100%',
  },
});

export const POPUP_SIZE: Record<ModalSize, ViewStyle> = {
  s: {
    width: 360,
    maxHeight: '50%',
  },
  m: {
    width: 540,
    maxHeight: '70%',
  },
  l: {
    width: 720,
    maxHeight: '85%',
  },
  fullWidth: {
    width: '80%', // Approximating 100vw - 2*margin
    height: '80%',
  },
};

export const TITLE_STYLE: TextStyle = {
  textAlign: 'left',
};

export const TITLE_CENTER_STYLE: TextStyle = {
  textAlign: 'center',
};
