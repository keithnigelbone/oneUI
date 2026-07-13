/**
 * ContentBlock.tokens.ts
 *
 * Token manifest for the Jio-style marketing content block on the canvas.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const CONTENT_BLOCK_TOKENS: Record<string, TokenDefinition> = {
  textHigh: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description: 'Primary text (context, headline) when no override is set.',
    cssProperty: 'color',
  },
  textMedium: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-Medium',
    description: 'Supporting body text colour.',
    cssProperty: 'color',
  },
  textOverride: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description:
      'Documented default for optional per-instance text colour override via props (e.g. var(--Text-OnBold-High)).',
    cssProperty: 'color',
  },
  contentMaxWidth: {
    category: 'spacing',
    subcategory: 'margin',
    defaultToken: '50',
    description: 'Max width of the text column as a percentage of canvas width.',
    cssProperty: 'max-width',
  },
  headlineTypography: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Headline-L',
    description:
      'Headline uses Display/Headline S/M/L role tokens (--Display-* / --Headline-*). Auto mode picks token from canvas size; platform/density on the root resolve --Dimension-f*.',
    cssProperty: 'font-size',
  },
  contextTypography: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M',
    description: 'Context line uses Label or Body role tokens via contextRole + contextSize.',
    cssProperty: 'font-size',
  },
  bodyTypography: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-M',
    description: 'Body copy uses Body XS–XL tokens (--Body-*-FontSize / LineHeight / FontWeight).',
    cssProperty: 'font-size',
  },
  dimensionPlatformScope: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'auto',
    description:
      'Scoped data-Breakpoint on the block drives dimension scale (typography f-step resolution). Auto maps artboard width to S … L.',
  },
  dimensionDensityScope: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'default',
    description: 'Scoped data-6-Density on the block pairs with platform for dimension scale in scale.css.',
  },
};

export const CONTENT_BLOCK_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'ContentBlock',
  version: '1.1.0',
  description:
    'Jio-style marketing content block: context label, headline, body, and OneUI Button CTAs. Layout uses dimension f-steps; headline typography uses Display/Headline tokens with artboard-scoped platform/density.',
  tokens: CONTENT_BLOCK_TOKENS,
  totalTokens: Object.keys(CONTENT_BLOCK_TOKENS).length,
  categories: {
    color: 3,
    spacing: 1,
    typography: 5,
  },
  slots: {},
};
