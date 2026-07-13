/**
 * Separator.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Separator/Separator.module.css`.
 *
 * Mapping ↔ Separator.module.css:
 *   .separator[data-orientation='horizontal']  →  styles.horizontal
 *   .separator[data-orientation='vertical']    →  styles.vertical
 *   background-color: var(--Border-Subtle)     →  inline at render via
 *                                                  `useSurfaceTokens('neutral').content.strokeLow`
 *
 * Web's `--Stroke-M` resolves to `1px`, which is the same value as
 * `tokens.borderWidth.hairline` (1) on native — so the visible stroke
 * thickness matches across platforms.
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';

export const styles = StyleSheet.create({
  // [data-orientation='horizontal']
  horizontal: {
    width: '100%',
    height: tokens.borderWidth.hairline,
  },
  // [data-orientation='vertical'] — width: var(--Stroke-M); align-self: stretch
  vertical: {
    width: tokens.borderWidth.hairline,
    alignSelf: 'stretch',
  },
});
