/**
 * CheckboxField.meta.ts
 *
 * Unified metadata — **InputField**-aligned field shell around **Checkbox**.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CHECKBOX_FIELD_TOKEN_MANIFEST } from './CheckboxField.tokens';
import { CHECKBOX_FIELD_RECIPE_DEFINITION } from './CheckboxField.recipe';

export const CHECKBOX_FIELD_META: ComponentMeta = {
  name: 'CheckboxField',
  slug: 'checkbox-field',
  displayName: 'Checkbox Field',
  description:
    '`Field.Root` + **Checkbox** with integrated `Field.Label` / `Field.Description`, optional `infoIconSlot`, `error` / `feedback`, and native `Field.Error` slot — same composition contract as **InputField** (Figma `.DNA/InputField` stack; control DNA from Checkbox). Colour follows `appearance` on the inner Checkbox.',
  category: 'inputs',
  tags: ['checkbox', 'field', 'form', 'selection'],

  props: [
    { name: 'label', type: 'string', description: 'Label text (field header in multi-option mode; integrated label beside control when no children)' },
    { name: 'description', type: 'string', description: 'Description under the label row' },
    {
      name: 'size',
      type: 'enum',
      description: 'S / M / L — scales Checkbox, label stack, InputFeedback',
      defaultValue: 'm',
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Appearance role (forwarded to Checkbox)',
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
    { name: 'checked', type: 'boolean', description: 'Controlled checked' },
    { name: 'defaultChecked', type: 'boolean', description: 'Uncontrolled default checked' },
    { name: 'indeterminate', type: 'boolean', defaultValue: false },
    { name: 'readOnly', type: 'boolean', defaultValue: false },
    { name: 'disabled', type: 'boolean', defaultValue: false },
    { name: 'required', type: 'boolean', description: 'Required + asterisk when label is set' },
    { name: 'invalid', type: 'boolean', description: 'Invalid state for `Field.Root` + error chrome' },
    { name: 'error', type: 'string', description: 'Shorthand negative `InputFeedback` message' },
    { name: 'id', type: 'string', description: 'HTML id on the checkbox control' },
    { name: 'name', type: 'string', description: 'Form name' },
    { name: 'value', type: 'string', description: 'Checkbox value when grouped' },
    {
      name: 'groupValue',
      type: 'object',
      description: 'Multi-option controlled selected values (`string[]`). Use with `children`.',
    },
    {
      name: 'groupDefaultValue',
      type: 'object',
      description: 'Multi-option uncontrolled default values (`string[]`). Use with `children`.',
    },
    {
      name: 'onGroupValueChange',
      type: 'function',
      description: 'Multi-option change handler `(value: string[]) => void`. Use with `children`.',
    },
  ],

  slots: [
    { name: 'feedback', description: '`InputFeedback` or custom node', acceptedTypes: ['InputFeedback'] },
    { name: 'infoIconSlot', description: 'Trailing control beside the label (custom info trigger or `InputFieldDefaultInfo`)', acceptedTypes: ['IconButton'] },
  ],

  previewMatrix: {
    variants: ['checked', 'unchecked'],
    variantLabels: { checked: 'Checked', unchecked: 'Unchecked' },
    sizes: ['s', 'm', 'l'],
    sizeLabels: { s: 'S', m: 'M', l: 'L' },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: CHECKBOX_FIELD_TOKEN_MANIFEST,
  recipeDefinition: CHECKBOX_FIELD_RECIPE_DEFINITION,
};
