/**
 * Grid.tokens.ts
 *
 * Token manifest for the Grid layout primitive.
 * Grid uses per-platform column counts and a gutter token from the Grid
 * foundation. Column children are spanned via responsive CSS vars.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const GRID_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // LAYOUT — per-platform column count
  // ============================================

  columns: {
    category: 'spacing',
    subcategory: 'layout',
    defaultToken: 'Grid-Columns',
    description:
      'Column count. Resolves per-platform via the --Grid-Columns token (4 / 8 / 8 / 12 / 12 across S/M/ML/L/XL).',
    cssProperty: 'grid-template-columns',
  },

  // ============================================
  // SPACING — gutter
  // ============================================

  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Grid-Gutter',
    description:
      'Horizontal and vertical gap between grid cells. Resolves per-platform via the --Grid-Gutter token.',
    cssProperty: 'gap',
  },
};

export const GRID_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Grid',
  version: '1.0.0',
  description:
    'Responsive CSS Grid primitive. Column count and gutter resolve per-platform via --Grid-Columns and --Grid-Gutter. Children use <Column> with responsive span/start props.',
  tokens: GRID_TOKENS,
  totalTokens: Object.keys(GRID_TOKENS).length,
  categories: {
    spacing: 2,
  },
};
