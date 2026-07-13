/**
 * InputField.meta.ts
 *
 * Unified metadata for the `InputField` aggregator.
 * Composes **Input** (integrated label + description + 4-slot shell + `Field.Control` in field mode) +
 * `Input/internals/` (`InputFeedback`, `InputDynamicText`) and optional custom `labelSlot`.
 */

import type { ComponentMeta } from '@oneui/shared';
import { INPUT_TOKEN_MANIFEST } from '../Input/Input.tokens';
import { INPUT_RECIPE_DEFINITION } from '../Input/Input.recipe';

export const INPUT_META: ComponentMeta = {
  name: 'InputField',
  slug: 'input-field',
  displayName: 'Input Field',
  description:
    'Text input field: `Field.Root` + **Input** (`Field.Label` / `Field.Description` for label-stack copy, `Field.Control` for the `<input>`, 4-slot shell), then `InputFeedback` (including native `Field.Error` when there is no string `error` / custom `feedback`), and DynamicText. Default info uses `IconButton` + `Tooltip` (override with `infoIconSlot`). Optional `labelSlot` replaces string `label` / `description`.',
  category: 'inputs',
  tags: ['input', 'field', 'text', 'form', 'text-field', 'validation'],

  props: [
    {
      name: 'size',
      type: 'enum',
      description: 'Component size — XS, S, M, L.',
      defaultValue: 'm',
      options: ['xs', 's', 'm', 'l'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent appearance role',
      defaultValue: 'secondary',
      options: [
        'auto', 'secondary', 'primary',
        'neutral', 'sparkle',
        'positive', 'negative', 'warning', 'informative',
      ] as const,
    },
    {
      name: 'shape',
      type: 'enum',
      description: 'Shape of the input container — default (rounded) or pill (fully rounded)',
      defaultValue: 'default',
      options: ['default', 'pill'] as const,
    },
    {
      name: 'invalid',
      type: 'boolean',
      description: 'Marks the field invalid for `Field.Root` and error border on the control (pair with `error` or `feedback` for messaging).',
      defaultValue: false,
    },
    {
      name: 'infoIcon',
      type: 'boolean',
      description: 'When true with a string `label`, shows the default info `IconButton` + tooltip unless `infoIconSlot` is set.',
      defaultValue: false,
    },
    {
      name: 'infoIconSlot',
      type: 'ReactNode',
      description: 'Replaces the default info control when `infoIcon` is true.',
    },
    {
      name: 'infoTooltipContent',
      type: 'ReactNode',
      description: 'Tooltip content for the default info control. Ignored when `infoIconSlot` is set.',
    },
    {
      name: 'infoIconAriaLabel',
      type: 'string',
      description: 'Accessible name for the default info `IconButton`. Ignored when `infoIconSlot` is set.',
      defaultValue: 'More information',
    },
    {
      name: 'dynamicTextSlot',
      type: 'ReactNode',
      description: 'Dynamic text row slot — pass `<InputDynamicText … />`. When set, `dynamicText` and `helperButton` are ignored.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text for the field (ignored when `labelSlot` is set)',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Description text below the label row (ignored when `labelSlot` is set)',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text displayed when the input is empty',
    },
    {
      name: 'type',
      type: 'enum',
      description: 'HTML input type',
      defaultValue: 'text',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] as const,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disabled state',
      defaultValue: false,
    },
    {
      name: 'readOnly',
      type: 'boolean',
      description: 'Read-only state',
      defaultValue: false,
    },
    {
      name: 'required',
      type: 'boolean',
      description: 'Whether the field is required (adds * to label)',
      defaultValue: false,
    },
    {
      name: 'error',
      type: 'string',
      description: 'Error message (renders InputFeedback variant="negative")',
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      description: 'Stretch to fill container width',
      defaultValue: false,
    },
  ],

  slots: [
    {
      name: 'labelSlot',
      description: 'Optional custom label row (`ReactNode`, same `Field.Root`); replaces string `label` / `description`',
      acceptedTypes: ['Field.Label', 'Text'],
    },
    {
      name: 'start',
      description: 'Leading content — Icon, IconButton, Avatar, Image, ChipGroup, or Text',
      acceptedTypes: ['Icon', 'IconButton', 'Avatar', 'Image', 'ChipGroup', 'Text'],
    },
    {
      name: 'start2',
      description: 'Second leading content — Text only (prefix, currency symbol)',
      acceptedTypes: ['Text'],
    },
    {
      name: 'end',
      description: 'Trailing content — IconButton, Icon, Button, or Text',
      acceptedTypes: ['IconButton', 'Icon', 'Button', 'Text'],
    },
    {
      name: 'end2',
      description: 'Second trailing content — Text, Icon, or IconButton',
      acceptedTypes: ['Text', 'Icon', 'IconButton'],
    },
    {
      name: 'feedback',
      description: 'Feedback slot — pass `<InputFeedback />` or rely on `error` string',
      acceptedTypes: ['InputFeedback'],
    },
    {
      name: 'dynamicTextSlot',
      description: 'Optional `<InputDynamicText />` replacing `dynamicText` / `helperButton` strings',
      acceptedTypes: ['InputDynamicText'],
    },
    {
      name: 'dynamicText',
      description: 'Leading DynamicText copy (non-empty trimmed string)',
      acceptedTypes: ['Text'],
    },
    {
      name: 'helperButton',
      description: 'Trailing action label (non-empty trimmed string); renders as `Button` attention low + condensed inside `InputDynamicText`',
      acceptedTypes: ['Text'],
    },
  ],

  previewMatrix: {
    variants: ['default'],
    variantLabels: {
      default: 'Default',
    },
    sizes: [6, 8, 10, 12],
    sizeLabels: {
      '6': 'XS',
      '8': 'S',
      '10': 'M',
      '12': 'L',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: INPUT_TOKEN_MANIFEST,
  recipeDefinition: INPUT_RECIPE_DEFINITION,
};
