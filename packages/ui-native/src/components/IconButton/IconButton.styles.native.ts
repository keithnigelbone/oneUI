/**
 * IconButton.styles.native.ts — structural StyleSheet peer of IconButton.module.css.
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pressableFullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

// INTENTIONAL-LITERAL: matches `--Disabled-Opacity` in IconButton.module.css.
// Only `disabled` dims — `loading` is a busy state and renders at full opacity.
export const DISABLED_OPACITY = 0.5;
