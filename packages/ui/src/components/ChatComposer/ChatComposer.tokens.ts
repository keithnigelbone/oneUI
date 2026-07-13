/**
 * ChatComposer.tokens.ts
 *
 * Token manifest for the prompt-first chat composer. The component delegates
 * interactive controls to Button; these tokens cover the composer shell,
 * textarea, model chip, and layout spacing.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const CHAT_COMPOSER_TOKENS: Record<string, TokenDefinition> = {
  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Elevated',
    description: 'Composer shell background.',
    cssProperty: 'background',
  },
  borderColor: {
    category: 'stroke',
    subcategory: 'border',
    defaultToken: 'Border-Subtle',
    description: 'Composer shell border colour.',
    cssProperty: 'border-color',
  },
  focusBorderColor: {
    category: 'stroke',
    subcategory: 'border',
    defaultToken: 'Neutral-Stroke-Medium',
    description: 'Composer shell border colour while the textarea is focused.',
    cssProperty: 'border-color',
  },
  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-High',
    description: 'Textarea text colour.',
    cssProperty: 'color',
  },
  placeholderColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Low',
    description: 'Textarea placeholder colour.',
    cssProperty: 'color',
  },
  modelLabelColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Medium-Text',
    description: 'Display-only model chip text colour.',
    cssProperty: 'color',
  },
  shellRadius: {
    category: 'shape',
    subcategory: 'size',
    defaultToken: 'Shape-5',
    description: 'Outer composer shell radius.',
    cssProperty: 'border-radius',
  },
  chipRadius: {
    category: 'shape',
    subcategory: 'size',
    defaultToken: 'Shape-2',
    description: 'Display-only model chip radius.',
    cssProperty: 'border-radius',
  },
  textareaFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-M-FontSize',
    description: 'Textarea body font size.',
    cssProperty: 'font-size',
  },
  textareaLineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Body-M-LineHeight',
    description: 'Textarea body line height.',
    cssProperty: 'line-height',
  },
  textareaFontFamily: {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Typography-Font-Primary',
    description: 'Textarea font family.',
    cssProperty: 'font-family',
  },
  modelLabelFontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    description: 'Model chip label font size.',
    cssProperty: 'font-size',
  },
  modelLabelLineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Label-S-LineHeight',
    description: 'Model chip label line height.',
    cssProperty: 'line-height',
  },
  modelLabelFontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Model chip label weight.',
    cssProperty: 'font-weight',
  },
  rootGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    description: 'Gap between composer shell and suggestion row.',
    cssProperty: 'gap',
  },
  actionGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3',
    description: 'Gap between action bar groups.',
    cssProperty: 'gap',
  },
  suggestionGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-2',
    description: 'Gap between suggestion buttons.',
    cssProperty: 'gap',
  },
  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    description: 'Opacity applied when the composer is disabled.',
    cssProperty: 'opacity',
  },
  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Discreet-Short',
    description: 'Border and shadow transition duration.',
    cssProperty: 'transition-duration',
  },
  transitionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition',
    description: 'Border and shadow transition easing.',
    cssProperty: 'transition-timing-function',
  },
};

export const CHAT_COMPOSER_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'ChatComposer',
  version: '1.0.0',
  description:
    'Controlled prompt composer with autosizing textarea, optional action slots, display-only model label, and suggestion actions.',
  tokens: CHAT_COMPOSER_TOKENS,
  totalTokens: Object.keys(CHAT_COMPOSER_TOKENS).length,
  categories: {
    color: 4,
    stroke: 2,
    shape: 2,
    typography: 6,
    spacing: 3,
    accessibility: 1,
    motion: 2,
  },
  slots: {
    leading: { name: 'leading', types: ['Button', 'IconButton'], tokens: ['actionGap'] },
    leadingInline: {
      name: 'leadingInline',
      types: ['Button', 'Chip', 'custom'],
      tokens: ['actionGap'],
    },
    trailing: { name: 'trailing', types: ['Button', 'IconButton'], tokens: ['actionGap'] },
  },
};
