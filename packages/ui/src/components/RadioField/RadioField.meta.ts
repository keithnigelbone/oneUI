/**
 * RadioField.meta.ts
 */

import type { ComponentMeta } from '@oneui/shared';
import { RADIO_FIELD_TOKEN_MANIFEST } from './RadioField.tokens';
import { RADIO_FIELD_RECIPE_DEFINITION } from './RadioField.recipe';

export const RADIO_FIELD_META: ComponentMeta = {
  name: 'RadioField',
  slug: 'radio-field',
  displayName: 'Radio Field',
  description:
    '`Field.Root` + **RadioGroup** with optional `Field.Label` / `Field.Description`, `infoIconSlot`, `error` / `feedback`, and native `Field.Error` slot — same shell as **InputField** / **CheckboxField**. Integrated single mode has no `Radio` children; colour follows **`appearance`** on inner radios.',
  category: 'inputs',
  tags: ['radio', 'field', 'form', 'selection'],

  props: [
    { name: 'label', type: 'string', description: 'Field label (integrated single) or group legend (multi-option)' },
    { name: 'description', type: 'string', description: 'Description under the label row' },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Appearance role (forwarded to each `Radio`)',
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
    { name: 'value', type: 'string', description: 'Controlled selected value (group or integrated single string)' },
    { name: 'defaultValue', type: 'string', description: 'Uncontrolled default value' },
    {
      name: 'checked',
      type: 'boolean',
      description: 'Integrated single only — controlled on/off (`true` = selected `singleOptionValue`)',
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      description: 'Integrated single only — uncontrolled default on/off (overrides `defaultValue` when `value` unset)',
    },
    {
      name: 'singleOptionValue',
      type: 'string',
      description: "Integrated single — submitted value when 'on' (default `on`)",
    },
    { name: 'name', type: 'string', description: 'Form name' },
    { name: 'orientation', type: 'enum', options: ['vertical', 'horizontal'] as const },
    { name: 'size', type: 'enum', options: ['s', 'm', 'l'] as const },
    { name: 'invalid', type: 'boolean' },
    { name: 'error', type: 'string' },
    { name: 'required', type: 'boolean' },
    {
      name: 'fullWidth',
      type: 'boolean',
      description: 'Stretch to fill container width.',
      defaultValue: false,
    },
    {
      name: 'validationMode',
      type: 'enum',
      description: 'Validation timing for `Field.Root`.',
      options: ['onBlur', 'onChange'] as const,
    },
    {
      name: 'validate',
      type: 'function',
      description: 'Custom validation — return a message, string array, or null.',
    },
  ],

  slots: [
    { name: 'children', description: '`Radio` options (omit for integrated single)', acceptedTypes: ['Radio'] },
    { name: 'feedback', description: '`InputFeedback`', acceptedTypes: ['InputFeedback'] },
    {
      name: 'infoIconSlot',
      description: 'Trailing control beside the label (custom info trigger or `InputFieldDefaultInfo`)',
      acceptedTypes: ['IconButton'],
    },
  ],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
    sizes: ['s', 'm', 'l'],
    sizeLabels: { s: 'S', m: 'M', l: 'L' },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: RADIO_FIELD_TOKEN_MANIFEST,
  recipeDefinition: RADIO_FIELD_RECIPE_DEFINITION,
};
