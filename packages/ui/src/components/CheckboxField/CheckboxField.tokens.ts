/**
 * CheckboxField.tokens.ts
 *
 * Token manifest for layout around the inner `Checkbox`.
 * Stack gap aligns with **InputField** (`--InputField-gap`); colours/typography follow `InputField.module.css`.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const CHECKBOX_FIELD_TOKENS: Record<string, TokenDefinition> = {
  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    description: 'Vertical stack gap between control row, feedback, and dynamic text (matches InputField).',
    cssProperty: 'gap',
  },
};

export const CHECKBOX_FIELD_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'CheckboxField',
  version: '1.0.0',
  description:
    'Checkbox with **InputField**-aligned shell: label stack, validation feedback, and optional dynamic text row.',
  tokens: CHECKBOX_FIELD_TOKENS,
  totalTokens: Object.keys(CHECKBOX_FIELD_TOKENS).length,
  categories: {
    spacing: 1,
  },
};

export function getCheckboxFieldTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(CHECKBOX_FIELD_TOKENS).filter(([, def]) => def.category === category);
}

export function getCheckboxFieldTokenDefault(tokenName: keyof typeof CHECKBOX_FIELD_TOKENS): string {
  const definition = CHECKBOX_FIELD_TOKENS[tokenName];
  if (!definition) return '';
  return definition.defaultToken;
}
