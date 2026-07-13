/**
 * ChatComposer.meta.ts
 *
 * Unified metadata for the controlled prompt composer.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CHAT_COMPOSER_RECIPE_DEFINITION } from './ChatComposer.recipe';
import { CHAT_COMPOSER_TOKEN_MANIFEST } from './ChatComposer.tokens';

export const CHAT_COMPOSER_META: ComponentMeta = {
  name: 'ChatComposer',
  slug: 'chat-composer',
  displayName: 'Chat Composer',
  description:
    'Controlled prompt composer with autosizing textarea, optional action slots, display-only model label, and suggestion actions. Enter submits; Shift+Enter inserts a newline.',
  category: 'inputs',
  tags: ['chat', 'composer', 'prompt', 'textarea', 'agent'],

  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Controlled textarea value.',
      required: true,
    },
    {
      name: 'onChange',
      type: 'function',
      description: 'Called on every textarea change with the next value.',
      required: true,
    },
    {
      name: 'onSubmit',
      type: 'function',
      description: 'Called with trimmed text when the user submits.',
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Textarea placeholder.',
      defaultValue: 'How can I help you today?',
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Disables the textarea and suggestion actions.',
      defaultValue: false,
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      description: 'Focuses the textarea on mount.',
      defaultValue: false,
    },
    {
      name: 'modelLabel',
      type: 'string',
      description: 'Display-only model label rendered in the action bar.',
    },
    {
      name: 'suggestions',
      type: 'object',
      description: 'Optional suggestion actions rendered below the composer.',
    },
  ],

  slots: [
    {
      name: 'leading',
      description: 'Left-most action bar content, typically an attach button.',
      acceptedTypes: ['Button', 'IconButton'],
    },
    {
      name: 'leadingInline',
      description: 'Inline content before the model label, such as a mode picker.',
      acceptedTypes: ['Button', 'Chip', 'custom'],
    },
    {
      name: 'trailing',
      description: 'Right-most action bar content, typically mic and send controls.',
      acceptedTypes: ['Button', 'IconButton'],
    },
  ],

  previewMatrix: {
    variants: ['default', 'suggestions', 'actions', 'disabled'],
    variantLabels: {
      default: 'Default',
      suggestions: 'Suggestions',
      actions: 'Action Bar',
      disabled: 'Disabled',
    },
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: CHAT_COMPOSER_TOKEN_MANIFEST,
  recipeDefinition: CHAT_COMPOSER_RECIPE_DEFINITION,
};
