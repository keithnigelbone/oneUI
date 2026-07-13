/**
 * Container.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Container/Container.module.css`.
 *
 * Mapping ↔ Container.module.css:
 *   .full-bleed → styles.fullBleed (no margin)
 *   .fluid      → styles.fluid (paddingHorizontal: Grid-Margin / Spacing-4)
 *   .fixed      → styles.fixed (width: 100%, maxWidth, centered)
 */

import { StyleSheet, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type { ContainerVariant } from './interface';

// INTENTIONAL-LITERAL: Web's `Container[variant="fixed"]` reads
// `var(--Grid-MaxWidth)` which is responsive (320 / 480 / 640 / 800 / 960).
// Native is mobile-first so we anchor at 600 px and let the consumer
// override via the `maxWidth` prop. Matches what most native layouts use.
export const FIXED_MAX_DEFAULT = 600;

export const styles = StyleSheet.create({
  fullBleed: {},
  fluid: {
    width: '100%',
    paddingHorizontal: tokens.spacing['4'],
  },
  fixed: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: FIXED_MAX_DEFAULT,
    paddingHorizontal: tokens.spacing['4'],
  },
});

export const VARIANT_STYLE: Record<ContainerVariant, ViewStyle> = {
  'full-bleed': styles.fullBleed,
  fluid: styles.fluid,
  fixed: styles.fixed,
};
