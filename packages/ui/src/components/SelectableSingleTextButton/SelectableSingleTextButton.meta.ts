/**
 * SelectableSingleTextButton.meta.ts
 *
 * Unified metadata for the SelectableSingleTextButton component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST } from './SelectableSingleTextButton.tokens';
import { SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION } from './SelectableSingleTextButton.recipe';

export const SELECTABLE_SINGLE_TEXT_BUTTON_META: ComponentMeta = {
  name: 'SelectableSingleTextButton',
  slug: 'selectable-single-text-button',
  displayName: 'Selectable Single Text Button',
  description:
    'Circular single-text toggle button (max 2 characters, e.g. "Ag", "En"). Stays selected after click. Unselected state is always muted ghost. Selected appearance driven by attention: high=bold fill, medium=subtle fill, low=ghost+accent border. 3 sizes (S/M/L). Shape customisable per brand.',
  category: 'actions',

  props: [
    {
      name: 'selected',
      type: 'boolean',
      description: 'Whether the button is selected (controlled)',
      defaultValue: false,
    },
    {
      name: 'attention',
      type: 'enum',
      description:
        'Attention level — drives the SELECTED visual. high=bold fill, medium=subtle fill, low=ghost+accent border. Default: high.',
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
      description: 'Condensed mode: reduces height and padding while keeping same typography.',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      description: 'Stretch to fill container width.',
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
      description: 'Loading state — shows circular spinner and disables interaction',
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

  tokenManifest: SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
  recipeDefinition: SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
};
