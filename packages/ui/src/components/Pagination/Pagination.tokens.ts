/**
 * Pagination.tokens.ts
 *
 * Token manifest for the Pagination + PaginationItem components.
 * Used by the Component Token Editor to display available tokens, surface
 * defaults per size/variant, and generate per-brand CSS overrides written
 * by `useBrandCSS` into the brand layer.
 *
 * Row layout + nav chrome use `Pagination.module.css`. Numbered page chips use
 * `PaginationItemPage.module.css` and read `--Pagination-pageChip*` overrides
 * here (Figma PaginationItem set: S/M/L frame 20 / 32 / 48; label 12 / 14 / 16).
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const PAGINATION_TOKENS: Record<string, TokenDefinition> = {
  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1',
    description:
      'Visual gap between adjacent PaginationItems inside the Pagination root. Default Spacing-1 (~4px) matches the tight row in Jio Figma; increase per brand to space buttons further apart.',
    cssProperty: 'gap',
  },

  disabledOpacity: {
    category: 'color',
    defaultToken: 'Opacity-Disabled',
    description: 'Opacity applied to the entire navigator when `disabled` is true.',
    cssProperty: 'opacity',
  },

  pageChipMinS: {
    category: 'spacing',
    defaultToken: 'Spacing-5',
    description:
      'Minimum block size for a page chip when Pagination `size` is S (Figma 20×20; matches `SingleTextButton` small hit target vocabulary).',
    cssProperty: 'min-height',
  },

  pageChipMinM: {
    category: 'spacing',
    defaultToken: 'Spacing-8',
    description:
      'Minimum block size for a page chip when Pagination `size` is M (Figma 32×32; aligns with `Spacing-8` → `Spacing-8` chain).',
    cssProperty: 'min-height',
  },

  pageChipMinL: {
    category: 'spacing',
    defaultToken: 'Spacing-12',
    description:
      'Minimum block size for a page chip when Pagination `size` is L (Figma 48×48; matches `SingleTextButton` large min width token).',
    cssProperty: 'min-height',
  },

  pageChipPaddingInlineS: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0',
    description: 'Horizontal padding inside the page chip when `size` is S (default none — square hit target).',
    cssProperty: 'padding-inline',
  },

  pageChipPaddingInlineM: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0',
    description: 'Horizontal padding inside the page chip when `size` is M (default none — square hit target).',
    cssProperty: 'padding-inline',
  },

  pageChipPaddingInlineL: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0',
    description: 'Horizontal padding inside the page chip when `size` is L (default none — square hit target).',
    cssProperty: 'padding-inline',
  },

  pageChipPaddingBlockS: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0',
    description: 'Vertical padding inside the page chip when `size` is S.',
    cssProperty: 'padding-block',
  },

  pageChipPaddingBlockM: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0',
    description: 'Vertical padding inside the page chip when `size` is M.',
    cssProperty: 'padding-block',
  },

  pageChipPaddingBlockL: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-0',
    description: 'Vertical padding inside the page chip when `size` is L.',
    cssProperty: 'padding-block',
  },

  pageChipFontSizeS: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-XS-FontSize',
    description: 'Page numeral font size when `size` is S (Figma 12).',
    cssProperty: 'font-size',
  },

  pageChipLineHeightS: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-XS-LineHeight',
    description: 'Page numeral line height when `size` is S.',
    cssProperty: 'line-height',
  },

  pageChipFontSizeM: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    description: 'Page numeral font size when `size` is M (Figma 14).',
    cssProperty: 'font-size',
  },

  pageChipLineHeightM: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-S-LineHeight',
    description: 'Page numeral line height when `size` is M.',
    cssProperty: 'line-height',
  },

  pageChipFontSizeL: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    description: 'Page numeral font size when `size` is L (Figma 16).',
    cssProperty: 'font-size',
  },

  pageChipLineHeightL: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-M-LineHeight',
    description: 'Page numeral line height when `size` is L.',
    cssProperty: 'line-height',
  },

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description:
      'Corner radius for page chips and IconButton nav slots. Defaults to Shape-Pill.',
    cssProperty: 'border-radius',
  },
};

export const PAGINATION_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Pagination',
  version: '1.0.0',
  description:
    'Composite numbered pagination navigator: `Pagination` renders nav + ellipsis `IconButton`s; numbered chips use `PaginationItem`. Inactive numerals use high-emphasis colour + label one step below row size; selected chip uses row attention. Row gap and chip geometry are brand-overridable here.',
  tokens: PAGINATION_TOKENS,
  totalTokens: Object.keys(PAGINATION_TOKENS).length,
  categories: {
    color: 1,
    spacing: 9,
    typography: 6,
    shape: 1,
  },
};

export function getPaginationTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(PAGINATION_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

export function getPaginationTokenDefault(
  tokenName: keyof typeof PAGINATION_TOKENS,
): string {
  const definition = PAGINATION_TOKENS[tokenName];
  if (!definition) return '';
  return definition.defaultToken;
}
