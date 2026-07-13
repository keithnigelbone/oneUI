/**
 * Switch.meta.ts
 * Unified metadata for the Switch component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SWITCH_TOKEN_MANIFEST } from './Switch.tokens';
import { SWITCH_RECIPE_DEFINITION } from './Switch.recipe';

export const SWITCH_META: ComponentMeta = {
  name: 'Switch',
  slug: 'switch',
  displayName: 'Switch',
  description: 'Toggle control for on/off states, with pill shape default and multi-accent support.',
  category: 'inputs',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Switch size',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description:
        'Multi-accent appearance role. `auto` or omit → secondary. Sets checked fill, context tokens, and unchecked rail tint (`--{Role}-Subtle`).',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary',
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'checked',
      type: 'boolean',
      description: 'Controlled checked state',
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Label text',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Forwarded to the root switch element for QA / e2e',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['selected', 'unselected'],
    variantLabels: {
      selected: 'Selected',
      unselected: 'Unselected',
    },
    sizes: ['s', 'm', 'l'],
    sizeLabels: {
      s: 'S',
      m: 'M',
      l: 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: SWITCH_TOKEN_MANIFEST,
  recipeDefinition: SWITCH_RECIPE_DEFINITION,
};
