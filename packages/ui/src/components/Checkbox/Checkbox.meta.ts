/**
 * Checkbox.meta.ts
 * Unified metadata for the Checkbox component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CHECKBOX_TOKEN_MANIFEST } from './Checkbox.tokens';
import { CHECKBOX_RECIPE_DEFINITION } from './Checkbox.recipe';

export const CHECKBOX_META: ComponentMeta = {
  name: 'Checkbox',
  slug: 'checkbox',
  displayName: 'Checkbox',
  description: 'Selection control with checked, unchecked, and indeterminate states; colour comes from the appearance role.',
  category: 'inputs',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Checkbox size',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Appearance role (border, hover, and fill including checked)',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Visible label beside the control',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Supplementary copy below the label row',
    },
    {
      name: 'checked',
      type: 'boolean',
      description: 'Controlled checked state',
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      description: 'Indeterminate (mixed) state',
      defaultValue: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['selected', 'unselected'],
    variantLabels: {
      selected: 'Checked',
      unselected: 'Unchecked',
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

  tokenManifest: CHECKBOX_TOKEN_MANIFEST,
  recipeDefinition: CHECKBOX_RECIPE_DEFINITION,
};
