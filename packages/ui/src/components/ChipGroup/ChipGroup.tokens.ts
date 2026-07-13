/**
 * ChipGroup.tokens.ts
 *
 * Token manifest for the ChipGroup layout + selection wrapper.
 * ChipGroup has minimal direct styling — it sets the inter-chip gap and relies
 * on child Chips for colour/typography. Size/variant/appearance propagate to
 * children via the ChipGroupContext, so no Chip-level colour tokens are
 * duplicated here.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const CHIP_GROUP_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SPACING — inter-chip gap
  // ============================================

  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-2',
    description: 'Gap between child chips (both axes when wrap is enabled).',
    cssProperty: 'gap',
  },
};

export const CHIP_GROUP_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'ChipGroup',
  version: '1.0.0',
  description:
    'Wraps multiple Chip components with shared selection state, keyboard navigation, and layout. Propagates size, variant, and appearance to children via context; only exposes a single layout token (gap).',
  tokens: CHIP_GROUP_TOKENS,
  totalTokens: Object.keys(CHIP_GROUP_TOKENS).length,
  categories: {
    spacing: 1,
  },
};
