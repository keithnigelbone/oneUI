/**
 * Surface.tokens.ts
 *
 * Token manifest for the Surface component.
 *
 * Surface is the container that triggers [data-surface] token remapping for
 * every descendant. It reads its own background from the root-only
 * --Surface-Fill-{Mode} tokens (which are intentionally NOT remapped inside
 * [data-surface] blocks) so a child Surface can always see its own fill.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const SURFACE_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // FILL — per mode
  // ============================================

  fill: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Fill-Default',
    variants: {
      default: 'Surface-Fill-Default',
      ghost: 'Surface-Fill-Ghost',
      minimal: 'Surface-Fill-Minimal',
      subtle: 'Surface-Fill-Subtle',
      moderate: 'Surface-Fill-Moderate',
      bold: 'Surface-Fill-Bold',
      elevated: 'Surface-Fill-Elevated',
      blend: 'Surface-Fill-Blend',
    },
    description:
      'Background fill for the Surface container. Reads from the root-only --Surface-Fill-{Mode} family so nested Surface containers can read their own fill without being remapped.',
    cssProperty: 'background-color',
  },

  // ============================================
  // COLOR — default content colour inherited by descendants
  // ============================================

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description:
      'Default text colour inherited by descendants. Remaps automatically when a parent Surface changes surface context.',
    cssProperty: 'color',
  },
};

/**
 * Complete Surface token manifest
 */
export const SURFACE_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Surface',
  version: '1.0.0',
  description:
    'Container primitive that opts descendants into the OneUI surface cascade via data-surface. Reads its own fill from the root-only --Surface-Fill-{Mode} tokens so nested surfaces always display the correct background.',
  tokens: SURFACE_TOKENS,
  totalTokens: Object.keys(SURFACE_TOKENS).length,
  categories: {
    color: 2,
  },
};
