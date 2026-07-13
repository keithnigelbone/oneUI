/**
 * Scrim.styles.native.ts — geometry only.
 *
 * Brand paint (gradient stops, overlay fill) resolves inline in
 * `Scrim.native.tsx` via `resolveScrimPaint` + `useOneUITheme`.
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
  },
  zone: {},
  band: {
    alignSelf: 'stretch',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
