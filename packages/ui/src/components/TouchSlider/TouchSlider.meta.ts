/**
 * TouchSlider.meta.ts — single size per Figma spec.
 */

import type { ComponentMeta } from '@oneui/shared';
import { TOUCH_SLIDER_TOKEN_MANIFEST } from './TouchSlider.tokens';
import { TOUCH_SLIDER_RECIPE_DEFINITION } from './TouchSlider.recipe';

export const TOUCH_SLIDER_META: ComponentMeta = {
  name: 'TouchSlider',
  slug: 'touch-slider',
  displayName: 'Touch Slider',
  description:
    'Chunky fingertip-friendly slider. The track is the tap target; the fill represents the value. Ideal for touch devices, TV remotes, and large-target contexts.',
  category: 'inputs',

  props: [
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'auto',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'orientation',
      type: 'enum',
      description: 'Slider orientation',
      defaultValue: 'horizontal',
      options: ['horizontal', 'vertical'] as const,
    },
    {
      name: 'progressStyle',
      type: 'enum',
      description: 'Fill corner style',
      defaultValue: 'rounded',
      options: ['rounded', 'sharp'] as const,
    },
    { name: 'min', type: 'number', defaultValue: 0 },
    { name: 'max', type: 'number', defaultValue: 100 },
    { name: 'step', type: 'number', defaultValue: 1 },
    { name: 'disabled', type: 'boolean', defaultValue: false },
    { name: 'readOnly', type: 'boolean', defaultValue: false },
  ],

  slots: [
    {
      name: 'start',
      description: 'Node rendered at the start of the slider (e.g. an IconButton).',
      cardinality: 'single',
    },
  ],

  previewMatrix: {
    variants: ['rounded', 'sharp'],
    variantLabels: {
      rounded: 'Rounded',
      sharp: 'Sharp',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: TOUCH_SLIDER_TOKEN_MANIFEST,
  recipeDefinition: TOUCH_SLIDER_RECIPE_DEFINITION,
};
