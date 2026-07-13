/**
 * Container.tokens.ts
 *
 * Token manifest for the Container layout primitive.
 * Container caps page-level width and applies horizontal margin using Grid
 * tokens that vary per platform breakpoint.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const CONTAINER_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SPACING — horizontal margin per platform
  // ============================================

  horizontalMargin: {
    category: 'spacing',
    subcategory: 'margin',
    defaultToken: 'Grid-Margin',
    description:
      'Horizontal margin applied to fluid and fixed containers. Resolves per-platform via the Grid-Margin token.',
    cssProperty: 'padding-inline',
  },

  // ============================================
  // LAYOUT — max-width cap for fixed variant
  // ============================================

  maxWidth: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Grid-MaxWidth',
    description:
      'Max-width cap for the fixed variant. Resolves per-platform via the Grid-MaxWidth token. Overridable inline via the `maxWidth` prop.',
    cssProperty: 'max-width',
  },
};

export const CONTAINER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Container',
  version: '1.0.0',
  description:
    'Layout primitive capping horizontal width. Three variants: fluid (default), fixed (centered, capped), and full-bleed (no margin/cap).',
  tokens: CONTAINER_TOKENS,
  totalTokens: Object.keys(CONTAINER_TOKENS).length,
  categories: {
    spacing: 2,
  },
};
