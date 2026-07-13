/**
 * Chip.meta.ts
 *
 * Unified metadata for the Chip component.
 * References existing token manifest and recipe definition
 * rather than duplicating their data.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CHIP_TOKEN_MANIFEST } from './Chip.tokens';
import { CHIP_RECIPE_DEFINITION } from './Chip.recipe';

export const CHIP_META: ComponentMeta = {
  name: 'Chip',
  slug: 'chip',
  displayName: 'Chip',
  description: 'Interactive toggleable pill element for filtering, selection, and categorization. Uses Base UI Toggle for full accessibility (aria-pressed, keyboard nav). Supports start/end slots for icons, avatars, and badges.',
  category: 'actions',

  props: [
    {
      name: 'attention',
      type: 'enum',
      description: 'Emphasis level — high (filled when selected), medium (tinted when selected), low (outlined).',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
      brandOverridable: true,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Chip size. Default: m.',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'secondary',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'selected',
      type: 'boolean',
      description: 'Whether the chip is selected (controlled)',
      defaultValue: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Whether the chip is disabled',
      defaultValue: false,
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Content before the label (Icon, Avatar, CounterBadge, IndicatorBadge)',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
    },
    {
      name: 'end',
      description: 'Content after the label (Icon, Avatar, CounterBadge, IndicatorBadge)',
      acceptedTypes: ['Icon', 'Avatar', 'CounterBadge', 'IndicatorBadge'],
    },
  ],

  previewMatrix: {
    variants: ['bold', 'subtle', 'ghost'],
    variantLabels: {
      bold: 'High',
      subtle: 'Medium',
      ghost: 'Low',
    },
    sizes: ['s', 'm', 'l'],
    sizeLabels: {
      's': 'S',
      'm': 'M',
      'l': 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: CHIP_TOKEN_MANIFEST,
  recipeDefinition: CHIP_RECIPE_DEFINITION,
};
