/**
 * Text.tokens.ts
 *
 * Token manifest for the Text component.
 *
 * Exposes the role-specific font-size / line-height / font-weight /
 * font-family entries the Component Token Editor can override per brand.
 * Colour tokens are wired through the role-agnostic on-colour pattern
 * (--{Role}-High etc.) and are not redeclared here — appearance is the
 * authoring surface, not raw token names.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const TEXT_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOUR — per attention level
  // Resolved through the active appearance role's on-colour family.
  // ============================================

  color: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Neutral-High',
    variants: {
      high: 'Neutral-High',
      medium: 'Neutral-Medium-Text',
      low: 'Neutral-Low',
      tintedA11y: 'Neutral-TintedA11y',
    },
    description: 'Text colour, varies by attention level and appearance role',
    cssProperty: 'color',
  },

  // ============================================
  // FONT FAMILY — per role + script fallback
  // ============================================

  'font-family-display': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Display-FontFamily',
    description: 'Font family for display variant (latin)',
    cssProperty: 'font-family',
  },
  'font-family-headline': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Headline-FontFamily',
    description: 'Font family for headline variant (latin)',
    cssProperty: 'font-family',
  },
  'font-family-title': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Title-FontFamily',
    description: 'Font family for title variant (latin)',
    cssProperty: 'font-family',
  },
  'font-family-body': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Body-FontFamily',
    description: 'Font family for body variant (latin)',
    cssProperty: 'font-family',
  },
  'font-family-label': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Label-FontFamily',
    description: 'Font family for label variant (latin)',
    cssProperty: 'font-family',
  },
  'font-family-code': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Typography-Font-Code',
    description: 'Font family for code variant (always monospace)',
    cssProperty: 'font-family',
  },
  'font-family-others': {
    category: 'typography',
    subcategory: 'family',
    defaultToken: 'Typography-Font-Script',
    description: 'Font family for non-latin language fallback (Devanagari etc.)',
    cssProperty: 'font-family',
  },

  // ============================================
  // FONT SIZE / LINE HEIGHT — per (variant, size) pair
  // Only the combinations declared in typography.css are listed.
  // ============================================

  // Display (L / M / S)
  'display-L': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Display-L-FontSize',
    description: 'Display L',
    cssProperty: 'font-size',
  },
  'display-M': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Display-M-FontSize',
    description: 'Display M',
    cssProperty: 'font-size',
  },
  'display-S': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Display-S-FontSize',
    description: 'Display S',
    cssProperty: 'font-size',
  },

  // Headline (L / M / S)
  'headline-L': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Headline-L-FontSize',
    description: 'Headline L',
    cssProperty: 'font-size',
  },
  'headline-M': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Headline-M-FontSize',
    description: 'Headline M',
    cssProperty: 'font-size',
  },
  'headline-S': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Headline-S-FontSize',
    description: 'Headline S',
    cssProperty: 'font-size',
  },

  // Title (L / M / S)
  'title-L': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Title-L-FontSize',
    description: 'Title L',
    cssProperty: 'font-size',
  },
  'title-M': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Title-M-FontSize',
    description: 'Title M',
    cssProperty: 'font-size',
  },
  'title-S': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Title-S-FontSize',
    description: 'Title S',
    cssProperty: 'font-size',
  },

  // Body (L / M / S / XS / 2XS)
  'body-L': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-L-FontSize',
    description: 'Body L',
    cssProperty: 'font-size',
  },
  'body-M': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-M-FontSize',
    description: 'Body M (default)',
    cssProperty: 'font-size',
  },
  'body-S': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-S-FontSize',
    description: 'Body S',
    cssProperty: 'font-size',
  },
  'body-XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-XS-FontSize',
    description: 'Body XS',
    cssProperty: 'font-size',
  },
  'body-2XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-2XS-FontSize',
    description: 'Body 2XS',
    cssProperty: 'font-size',
  },

  // Label (L / M / S / XS / 2XS / 3XS)
  'label-L': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-L-FontSize',
    description: 'Label L',
    cssProperty: 'font-size',
  },
  'label-M': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-M-FontSize',
    description: 'Label M',
    cssProperty: 'font-size',
  },
  'label-S': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-S-FontSize',
    description: 'Label S',
    cssProperty: 'font-size',
  },
  'label-XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-XS-FontSize',
    description: 'Label XS',
    cssProperty: 'font-size',
  },
  'label-2XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-2XS-FontSize',
    description: 'Label 2XS',
    cssProperty: 'font-size',
  },
  'label-3XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-3XS-FontSize',
    description: 'Label 3XS',
    cssProperty: 'font-size',
  },

  // Code (M / S / XS / 2XS / 3XS)
  'code-M': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Code-M-FontSize',
    description: 'Code M',
    cssProperty: 'font-size',
  },
  'code-S': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Code-S-FontSize',
    description: 'Code S',
    cssProperty: 'font-size',
  },
  'code-XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Code-XS-FontSize',
    description: 'Code XS',
    cssProperty: 'font-size',
  },
  'code-2XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Code-2XS-FontSize',
    description: 'Code 2XS',
    cssProperty: 'font-size',
  },
  'code-3XS': {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Code-3XS-FontSize',
    description: 'Code 3XS',
    cssProperty: 'font-size',
  },

  // ============================================
  // FONT WEIGHT — emphasis-driven roles only
  // (title / headline / display use fixed per-size weights)
  // ============================================

  'weight-body': {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Body-FontWeight-High',
    variants: {
      high: 'Body-FontWeight-High',
      medium: 'Body-FontWeight-Medium',
      low: 'Body-FontWeight-Low',
    },
    description: 'Body weight by emphasis',
    cssProperty: 'font-weight',
  },
  'weight-label': {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-High',
    variants: {
      high: 'Label-FontWeight-High',
      medium: 'Label-FontWeight-Medium',
      low: 'Label-FontWeight-Low',
    },
    description: 'Label weight by emphasis',
    cssProperty: 'font-weight',
  },
  'weight-code': {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Code-FontWeight-High',
    variants: {
      high: 'Code-FontWeight-High',
      medium: 'Code-FontWeight-Medium',
      low: 'Code-FontWeight-Low',
    },
    description: 'Code weight by emphasis',
    cssProperty: 'font-weight',
  },
};

const totalTokens = Object.keys(TEXT_TOKENS).length;

export const TEXT_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Text',
  version: '1.0.0',
  description:
    'Inline / block text with six typography roles, role-specific size scales, ' +
    'multi-accent appearance, attention levels, italic / underline / strikethrough, ' +
    'and latin / multi-script font fallback. Surface-context aware via on-colour tokens.',
  tokens: TEXT_TOKENS,
  totalTokens,
  categories: {
    color: 1,
    typography: totalTokens - 1,
  },
};
