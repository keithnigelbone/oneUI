/**
 * Select.recipe.ts
 */

import type { ComponentRecipeDefinition } from '@oneui/shared';

export const SELECT_RECIPE_DEFINITION: ComponentRecipeDefinition = {
  componentName: 'Select',
  decisions: [
    {
      id: 'trigger',
      label: 'Trigger',
      rationale: 'Figma micropattern trigger surface.',
      category: 'behavior',
      options: [
        { value: 'selectableInput', label: 'SelectableInput', description: 'Form field combobox' },
        { value: 'selectableButton', label: 'SelectableButton', description: 'Button with chevron' },
        { value: 'selectableIconButton', label: 'SelectableIconButton', description: 'Icon-only trigger' },
      ],
      defaultOption: 'selectableInput',
    },
    {
      id: 'menu',
      label: 'Menu type',
      rationale: 'Selection vs action menu behaviour.',
      category: 'behavior',
      options: [
        { value: 'singleSelect', label: 'Single select', description: 'One value, check indicator' },
        { value: 'multiSelect', label: 'Multi select', description: 'Checkbox rows' },
        { value: 'actions', label: 'Actions', description: 'Fire onAction, no selection' },
      ],
      defaultOption: 'singleSelect',
    },
  ],
  resolutionMap: {
    trigger: {
      selectableInput: [],
      selectableButton: [],
      selectableIconButton: [],
    },
    menu: {
      singleSelect: [],
      multiSelect: [],
      actions: [],
    },
  },
};
