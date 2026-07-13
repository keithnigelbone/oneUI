/**
 * Select.meta.ts
 */

import type { ComponentMeta } from '@oneui/shared';
import { SELECT_TOKEN_MANIFEST } from './Select.tokens';
import { SELECT_RECIPE_DEFINITION } from './Select.recipe';

export const SELECT_META: ComponentMeta = {
  name: 'Select',
  slug: 'select',
  displayName: 'Select',
  description:
    'Micropattern for picking one or many values or firing actions. Input, button, or icon-button trigger; single, multi, or actions menu.',
  category: 'inputs',
  tags: ['select', 'dropdown', 'combobox', 'menu', 'micropattern'],
  props: [
    {
      name: 'trigger',
      type: 'enum',
      defaultValue: 'selectableInput',
      options: ['selectableInput', 'selectableButton', 'selectableIconButton'] as const,
      description: 'Trigger surface (Figma axis).',
    },
    {
      name: 'menu',
      type: 'enum',
      defaultValue: 'singleSelect',
      options: ['singleSelect', 'multiSelect', 'actions'] as const,
      description: 'Menu behaviour.',
    },
    {
      name: 'appearance',
      type: 'enum',
      defaultValue: 'auto',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'positive',
        'negative',
        'warning',
        'informative',
      ] as const,
    },
    { name: 'size', type: 'enum', defaultValue: 'm', options: ['s', 'm', 'l'] as const },
    { name: 'searchable', type: 'boolean', defaultValue: false },
    { name: 'label', type: 'string', description: 'Input trigger label.' },
    { name: 'aria-label', type: 'string', description: 'Accessible name when no visible label.' },
  ],
  slots: [
    { name: 'start', description: 'Leading slot on input/button trigger', acceptedTypes: ['Icon', 'Avatar', 'Image', 'Text'] },
    { name: 'triggerIcon', description: 'Icon for icon-button trigger', acceptedTypes: ['Icon'] },
  ],
  previewMatrix: {
    variants: ['selectableInput', 'selectableButton', 'selectableIconButton'],
    variantLabels: {
      selectableInput: 'Input',
      selectableButton: 'Button',
      selectableIconButton: 'Icon button',
    },
    sizes: ['s', 'm', 'l'],
  },
  surfaceAware: true,
  multiAccent: true,
  tokenManifest: SELECT_TOKEN_MANIFEST,
  recipeDefinition: SELECT_RECIPE_DEFINITION,
};
