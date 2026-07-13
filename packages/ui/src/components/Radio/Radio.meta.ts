/**
 * Radio.meta.ts
 * Unified metadata for the Radio component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { RADIO_TOKEN_MANIFEST } from './Radio.tokens';
import { RADIO_RECIPE_DEFINITION } from './Radio.recipe';

export const RADIO_META: ComponentMeta = {
  name: 'Radio',
  slug: 'radio',
  displayName: 'Radio',
  description: 'Selection control for a single choice within a group; colour comes from the appearance role.',
  category: 'inputs',

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Radio size',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Appearance role (border, hover, and fill including checked state)',
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
      description:
        'Accepted for documentation/tooling only; selection is determined by RadioGroup value matching `value`.',
      defaultValue: false,
    },
    {
      name: 'value',
      type: 'string',
      description: 'Value for the radio option',
      required: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
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

  tokenManifest: RADIO_TOKEN_MANIFEST,
  recipeDefinition: RADIO_RECIPE_DEFINITION,
};
