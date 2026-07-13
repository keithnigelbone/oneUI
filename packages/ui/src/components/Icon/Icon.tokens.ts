/**
 * Icon.tokens.ts
 *
 * Token manifest for the Icon component.
 * 20 sizes mapped directly to numeric spacing tokens.
 * 5 emphasis levels × 8 appearance roles.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Icon component
 */
export const ICON_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOUR TOKENS — per emphasis level
  // ============================================

  color: {
    category: 'color',
    subcategory: 'icon',
    defaultToken: 'Neutral-High',
    variants: {
      high: 'Neutral-High',
      medium: 'Neutral-Medium-Text',
      low: 'Neutral-Low',
      tinted: 'Neutral-Tinted',
      tintedA11y: 'Neutral-TintedA11y',
    },
    description: 'Icon colour, varies by emphasis level and appearance role',
    cssProperty: 'color',
  },

  // ============================================
  // SIZE TOKENS — 20 sizes (spacing index → token)
  // ============================================

  'size-2': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-2', description: 'Icon at index 2 (f-4)', cssProperty: 'width' },
  'size-2-5': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-2-5', description: 'Icon at index 2.5 (f-3)', cssProperty: 'width' },
  'size-3': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-3', description: 'Icon at index 3 (f-2)', cssProperty: 'width' },
  'size-3-5': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-3-5', description: 'Icon at index 3.5 (f-1)', cssProperty: 'width' },
  'size-4': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-4', description: 'Icon at index 4 (f0)', cssProperty: 'width' },
  'size-4-5': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-4-5', description: 'Icon at index 4.5 (f1)', cssProperty: 'width' },
  'size-5': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-5', description: 'Icon at index 5 (f2, default)', cssProperty: 'width' },
  'size-6': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-6', description: 'Icon at index 6 (f3)', cssProperty: 'width' },
  'size-7': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-7', description: 'Icon at index 7 (f4)', cssProperty: 'width' },
  'size-8': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-8', description: 'Icon at index 8 (f5)', cssProperty: 'width' },
  'size-9': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-9', description: 'Icon at index 9 (f6)', cssProperty: 'width' },
  'size-10': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-10', description: 'Icon at index 10 (f7)', cssProperty: 'width' },
  'size-12': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-12', description: 'Icon at index 12 (f8)', cssProperty: 'width' },
  'size-14': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-14', description: 'Icon at index 14 (f9)', cssProperty: 'width' },
  'size-16': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-16', description: 'Icon at index 16 (f10)', cssProperty: 'width' },
  'size-18': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-18', description: 'Icon at index 18 (f11)', cssProperty: 'width' },
  'size-20': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-20', description: 'Icon at index 20 (f12)', cssProperty: 'width' },
  'size-24': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-24', description: 'Icon at index 24 (f13)', cssProperty: 'width' },
  'size-32': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-32', description: 'Icon at index 32', cssProperty: 'width' },
  'size-40': { category: 'spacing', subcategory: 'size', defaultToken: 'Spacing-40', description: 'Icon at index 40', cssProperty: 'width' },
};

/**
 * Complete Icon token manifest
 */
export const ICON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Icon',
  version: '2.0.0',
  description:
    'Bare icon display. 20 sizes from spacing scale, 8 appearance roles, 5 emphasis levels. Colour derived from V4 on-colour tokens.',
  tokens: ICON_TOKENS,
  totalTokens: Object.keys(ICON_TOKENS).length,
  categories: {
    color: 1,
    spacing: 20,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getIconTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(ICON_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}
