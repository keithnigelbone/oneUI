/**
 * RadioField.tokens.ts
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const RADIO_FIELD_TOKENS: Record<string, TokenDefinition> = {
  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1-5',
    description: 'Vertical stack gap (matches InputField).',
    cssProperty: 'gap',
  },
};

export const RADIO_FIELD_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'RadioField',
  version: '1.0.0',
  description: 'Radio group with InputField-aligned shell: label stack, feedback, optional dynamic text.',
  tokens: RADIO_FIELD_TOKENS,
  totalTokens: Object.keys(RADIO_FIELD_TOKENS).length,
  categories: { spacing: 1 },
};

export function getRadioFieldTokensByCategory(category: string): [string, TokenDefinition][] {
  return Object.entries(RADIO_FIELD_TOKENS).filter(([, def]) => def.category === category);
}

export function getRadioFieldTokenDefault(tokenName: keyof typeof RADIO_FIELD_TOKENS): string {
  const d = RADIO_FIELD_TOKENS[tokenName];
  return d?.defaultToken ?? '';
}
