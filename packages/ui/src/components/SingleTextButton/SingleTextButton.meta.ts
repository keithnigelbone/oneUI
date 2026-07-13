/**
 * SingleTextButton.meta.ts
 *
 * Unified metadata for the SingleTextButton component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SINGLE_TEXT_BUTTON_TOKEN_MANIFEST } from './SingleTextButton.tokens';
import { SINGLE_TEXT_BUTTON_RECIPE_DEFINITION } from './SingleTextButton.recipe';

export const SINGLE_TEXT_BUTTON_META: ComponentMeta = {
  name: 'SingleTextButton',
  slug: 'single-text-button',
  displayName: 'Single Text Button',
  description:
    'Circular single-text action button (max 2 characters, e.g. "Ag", "En"). Attention level drives the visual: high=bold fill, medium=subtle fill, low=ghost. 3 sizes (S/M/L). Shape customisable per brand.',
  category: 'actions',

  props: [
    {
      name: 'attention',
      type: 'enum',
      description:
        'Attention level — drives the visual. high=bold fill, medium=subtle fill, low=ghost. Default: high.',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description: 'Button size. S/M/L only. Default: m.',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role. Default: primary.',
      defaultValue: 'auto',
      options: [
        'auto',
        'primary',
        'secondary',
        'tertiary',
        'quaternary',
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
      name: 'condensed',
      type: 'boolean',
      description:
        'Condensed mode: reduces height and padding while keeping same typography.',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      description: 'Stretch to fill container width (overrides circular shape).',
      defaultValue: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Whether the button is disabled',
      defaultValue: false,
    },
    {
      name: 'loading',
      type: 'boolean',
      description: 'Loading state — shows spinner and disables interaction',
      defaultValue: false,
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
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

  tokenManifest: SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
  recipeDefinition: SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
};
