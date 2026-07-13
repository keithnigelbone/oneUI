/**
 * SelectableButton.meta.ts
 *
 * Unified metadata for the SelectableButton component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SELECTABLE_BUTTON_TOKEN_MANIFEST } from './SelectableButton.tokens';
import { SELECTABLE_BUTTON_RECIPE_DEFINITION } from './SelectableButton.recipe';

export const SELECTABLE_BUTTON_META: ComponentMeta = {
  name: 'SelectableButton',
  slug: 'selectable-button',
  displayName: 'Selectable Button',
  description:
    'Toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost with accent border. Supports contained (pill) and uncontained (inline text) modes.',
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
      description: 'Button size. Default: m.',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l'] as const,
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
      name: 'contained',
      type: 'boolean',
      description:
        'When true (default), renders a pill container. When false, renders inline text/icon only — no background, border, or padding.',
      defaultValue: true,
    },
    {
      name: 'condensed',
      type: 'boolean',
      description: 'Condensed mode: reduces height and padding. Only applies when contained=true.',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      description: 'Stretch to fill container width. Only applies when contained=true.',
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
      description: 'Loading state — disables interaction',
      defaultValue: false,
    },
  ],

  slots: [
    {
      name: 'start',
      description: 'Content before the label (Icon)',
      acceptedTypes: ['Icon'],
    },
    {
      name: 'end',
      description: 'Content after the label (Icon)',
      acceptedTypes: ['Icon'],
    },
  ],

  previewMatrix: {
    variants: ['high', 'medium', 'low'],
    variantLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    sizes: ['xs', 's', 'm', 'l'],
    sizeLabels: {
      xs: 'XS',
      s: 'S',
      m: 'M',
      l: 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: SELECTABLE_BUTTON_TOKEN_MANIFEST,
  recipeDefinition: SELECTABLE_BUTTON_RECIPE_DEFINITION,
};
