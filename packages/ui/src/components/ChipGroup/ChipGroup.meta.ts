/**
 * ChipGroup.meta.ts
 * Unified metadata for the ChipGroup component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CHIP_GROUP_TOKEN_MANIFEST } from './ChipGroup.tokens';
import { CHIP_GROUP_RECIPE_DEFINITION } from './ChipGroup.recipe';

export const CHIP_GROUP_META: ComponentMeta = {
  name: 'ChipGroup',
  slug: 'chip-group',
  displayName: 'Chip Group',
  description:
    'Groups multiple Chip components with shared selection state, keyboard navigation, and layout. Supports single-select (default) and multi-select modes. Propagates size, attention, and appearance to all child Chips.',
  category: 'actions',

  props: [
    {
      name: 'multiple',
      type: 'boolean',
      description: 'Allow multiple chips to be selected simultaneously',
      defaultValue: false,
    },
    {
      name: 'orientation',
      type: 'enum',
      description: 'Stack direction of the chip group',
      defaultValue: 'horizontal',
      options: ['horizontal', 'vertical'] as const,
    },
    {
      name: 'wrap',
      type: 'boolean',
      description: 'Whether chips wrap to the next line when they overflow',
      defaultValue: true,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Size propagated to all child Chips (chip-level prop wins if set)',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Emphasis level propagated to all child Chips — high (filled when selected), medium (tinted when selected), low (outlined).',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
      brandOverridable: true,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Appearance role propagated to all child Chips',
      defaultValue: 'secondary',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'maxSelections',
      type: 'number',
      description: 'Maximum number of chips that can be selected (multi-select only)',
    },
    {
      name: 'required',
      type: 'boolean',
      description: 'Prevent deselecting the last selected chip',
      defaultValue: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disable all chips in the group',
      defaultValue: false,
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      description: 'Loop keyboard focus from last chip back to first',
      defaultValue: true,
    },
  ],

  slots: [
    {
      name: 'children',
      description: 'Chip components to group',
      acceptedTypes: ['Chip'],
    },
  ],

  previewMatrix: {
    variants: ['ghost', 'subtle', 'bold'],
    variantLabels: { ghost: 'Low', subtle: 'Medium', bold: 'High' },
    sizes: ['s', 'm', 'l'],
    sizeLabels: { s: 'S', m: 'M', l: 'L' },
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: CHIP_GROUP_TOKEN_MANIFEST,
  recipeDefinition: CHIP_GROUP_RECIPE_DEFINITION,
};
