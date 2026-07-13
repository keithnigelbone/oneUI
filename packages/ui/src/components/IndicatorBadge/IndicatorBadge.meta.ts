/**
 * IndicatorBadge.meta.ts
 *
 * Unified metadata for the IndicatorBadge component.
 * References existing token manifest and recipe definition
 * rather than duplicating their data.
 */

import type { ComponentMeta } from '@oneui/shared';
import { INDICATOR_BADGE_TOKEN_MANIFEST } from './IndicatorBadge.tokens';
import { INDICATOR_BADGE_RECIPE_DEFINITION } from './IndicatorBadge.recipe';

export const INDICATOR_BADGE_META: ComponentMeta = {
  name: 'IndicatorBadge',
  slug: 'indicator-badge',
  displayName: 'Indicator Badge',
  description:
    'Non-interactive status/presence indicator dot. Supports multi-accent appearance roles and five sizes.',
  category: 'display',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Indicator dot size. Default: m.',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l', 'xl'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'auto',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ] as const,
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Code-only (Figma N/A). Not implemented — IndicatorBadge is non-numeric; use CounterBadge for counts.',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['bold'],
    variantLabels: {
      bold: 'Default',
    },
    sizes: ['xs', 's', 'm', 'l', 'xl'],
    sizeLabels: {
      xs: 'XS',
      s: 'S',
      m: 'M',
      l: 'L',
      xl: 'XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: INDICATOR_BADGE_TOKEN_MANIFEST,
  recipeDefinition: INDICATOR_BADGE_RECIPE_DEFINITION,
};
