/**
 * Button.meta.ts
 *
 * Unified metadata for the Button component.
 * Uses `attention` (high/medium/low) as the primary user-facing prop,
 * not `variant` (which is the internal code-level prop).
 */

import type { ComponentMeta } from '@oneui/shared';
import { BUTTON_GENERATED_PROPS } from '@oneui/shared/meta/generated/Button.generated';
import { BUTTON_TOKEN_MANIFEST } from './Button.tokens';
import { BUTTON_RECIPE_DEFINITION } from './Button.recipe';

export const BUTTON_META: ComponentMeta = {
  name: 'Button',
  slug: 'button',
  displayName: 'Button',
  description: 'Interactive button with high/medium/low attention levels, multi-accent support, and start/end content slots.',
  category: 'actions',
  tags: ['action', 'cta', 'interactive', 'click', 'submit'],

  props: BUTTON_GENERATED_PROPS,

  slots: [
    {
      name: 'start',
      description: 'Content rendered before the button label (icon, avatar, badge)',
      acceptedTypes: ['Icon', 'Avatar'],
    },
    {
      name: 'end',
      description: 'Content rendered after the button label (icon, avatar, badge)',
      acceptedTypes: ['Icon', 'Avatar'],
    },
  ],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    sizes: [6, 8, 10, 12],
    sizeLabels: {
      '6': 'XS',
      '8': 'S',
      '10': 'M',
      '12': 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: BUTTON_TOKEN_MANIFEST,
  recipeDefinition: BUTTON_RECIPE_DEFINITION,
};
