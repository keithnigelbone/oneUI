/**
 * InputDynamicText.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Input/internals/InputDynamicText.module.css`.
 * Geometry-only StyleSheet — brand paint (content colour) merges inline in
 * `InputDynamicText.native.tsx` via `useSurfaceTokens`.
 *
 * Mapping ↔ InputDynamicText.module.css:
 *   .root                                 → styles.root
 *   .root[data-trailing-only]             → styles.rootTrailingOnly
 *   .content                              → styles.content
 *   .root[data-size='s'|'m'|'l'] .content → CONTENT_MIN_HEIGHT (size 'l' only)
 *   .end                                  → styles.end
 *   gap: var(--Spacing-1-5)                → tokens.spacing['1-5'] (f-3 = 6)
 *   min-height (size L): var(--Spacing-6)  → tokens.spacing['6'] (f1 = 24)
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { InputDynamicTextSize } from './interface';

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing['1-5'],
    width: '100%',
  },
  rootTrailingOnly: {
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    minWidth: 0,
    margin: 0,
  },
  end: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

/**
 * Per-size content minimum height — only size `l` has a min-height on web
 * (`var(--Spacing-6)`). Lookup returns `undefined` for S / M so the row
 * collapses to the text's natural height.
 */
export const CONTENT_MIN_HEIGHT: Record<InputDynamicTextSize, number | undefined> = {
  s: undefined,
  m: undefined,
  l: tokens.spacing['6'],
};
