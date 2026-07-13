/**
 * SelectableIconButton.meta.ts
 *
 * Unified metadata for the SelectableIconButton component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST } from './SelectableIconButton.tokens';
import { SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION } from './SelectableIconButton.recipe';

export const SELECTABLE_ICON_BUTTON_META: ComponentMeta = {
  name: 'SelectableIconButton',
  slug: 'selectable-icon-button',
  displayName: 'Selectable Icon Button',
  description:
    'Icon-only toggle button that stays selected after click. Unselected state is always muted ghost. Selected appearance is driven by attention level: high=bold fill, medium=subtle fill, low=ghost with accent border. 6 sizes (2XS-XL), condensed mode, 1:1/2:3 shape proportions.',
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
      description: 'Icon button size (f-step). Default: 10 (M).',
      defaultValue: 10,
      options: [4, 6, 8, 10, 12, 14, '2xs', 'xs', 's', 'm', 'l', 'xl'] as const,
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
      name: 'shape',
      type: 'enum',
      description: 'Shape proportion — square (1:1) or wide rectangle (2:3)',
      defaultValue: '1:1',
      options: ['1:1', '2:3'] as const,
    },
    {
      name: 'contained',
      type: 'boolean',
      description: 'When true (default), renders contained icon button. When false, icon only — no background, border, or fixed size.',
      defaultValue: true,
    },
    {
      name: 'condensed',
      type: 'boolean',
      description: 'Reduces container while keeping icon size. Only applies when contained=true.',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      description: 'Stretch to fill container width. Only applies when contained=true.',
      defaultValue: false,
    },
    {
      name: 'icon',
      type: 'string',
      description: 'Semantic icon name or React element',
      defaultValue: 'star',
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
      description: 'Loading state — shows spinner, disables interaction',
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
    sizes: ['4', '6', '8', '10', '12', '14'],
    sizeLabels: {
      '4': '2XS',
      '6': 'XS',
      '8': 'S',
      '10': 'M',
      '12': 'L',
      '14': 'XL',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: SELECTABLE_ICON_BUTTON_TOKEN_MANIFEST,
  recipeDefinition: SELECTABLE_ICON_BUTTON_RECIPE_DEFINITION,
};
