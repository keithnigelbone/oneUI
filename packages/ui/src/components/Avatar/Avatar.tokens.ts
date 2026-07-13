/**
 * Avatar.tokens.ts
 *
 * Token manifest for the Avatar component.
 * All size/icon/text tokens verified against Figma MCP component data (node 31:119).
 *
 * Figma spacing index → f-step → Spacing token mapping:
 *   spacings/2=f-4=Spacing-2(8px)  spacings/3→f-2=Spacing-3(12px)
 *   spacings/4→f0=Spacing-4(16px)    spacings/5→f2=Spacing-5(20px)
 *   spacings/6→f3=Spacing-6(24px)  spacings/8→f5=Spacing-8(32px)
 *   spacings/10→f7=Spacing-10(40px)
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Avatar component, organized by property
 */
export const AVATAR_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS (V4 Surface System)
  // Figma: ALL attention levels use `on-colour/tinted-a11y`
  // → maps to TintedA11y (NOT Bold-High)
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    variants: {
      high: 'Primary-Bold',
      medium: 'Primary-Subtle',
      low: 'transparent',
    },
    description: 'Avatar background color, varies by attention level',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-TintedA11y',
    variants: {
      high: 'Primary-TintedA11y',
      medium: 'Primary-TintedA11y',
      low: 'Primary-TintedA11y',
    },
    description: 'Avatar text/icon color — Figma tinted-a11y for all attention levels',
    cssProperty: 'color',
  },

  // ============================================
  // SIZE TOKENS (verified against Figma MCP data)
  // ============================================

  'size-2xs': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-2',
    description: 'Avatar container at 2XS (Figma spacings/2 = 8px)',
    cssProperty: 'width',
  },

  'size-xs': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-3',
    description: 'Avatar container at XS (Figma spacings/3 = 12px)',
    cssProperty: 'width',
  },

  'size-s': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    description: 'Avatar container at S (Figma spacings/4 = 16px)',
    cssProperty: 'width',
  },

  'size-m': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Avatar container at M (Figma spacings/5 = 20px)',
    cssProperty: 'width',
  },

  'size-l': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-6',
    description: 'Avatar container at L (Figma spacings/6 = 24px)',
    cssProperty: 'width',
  },

  'size-xl': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-8',
    description: 'Avatar container at XL (Figma spacings/8 = 32px)',
    cssProperty: 'width',
  },

  'size-2xl': {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-10',
    description: 'Avatar container at 2XL (Figma spacings/10 = 40px)',
    cssProperty: 'width',
  },

  // ============================================
  // ICON SIZE TOKENS (from Figma: Icon child size per avatar size)
  // 2XS=8(fills) XS=10 S=12 M=16 L=20 XL=24 2XL=32 custom=40
  // ============================================

  iconSize: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-4',
    sizes: {
      '2xs': '100%',
      'xs': 'Spacing-2-5',
      's': 'Spacing-3',
      'm': 'Spacing-4',
      'l': 'Spacing-5',
      'xl': 'Spacing-6',
      '2xl': 'Spacing-8',
      'custom': 'Spacing-10',
    },
    description: 'Icon size within avatar (from Figma Icon child dimensions)',
    cssProperty: 'width',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (Label role — verified from Figma MCP styles)
  // Figma: Label/Label 3XS Medium, Label/Label 2XS Medium, etc.
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Label-2XS-FontSize',
    sizes: {
      's': 'Label-3XS-FontSize',
      'm': 'Label-2XS-FontSize',
      'l': 'Label-XS-FontSize',
      'xl': 'Label-S-FontSize',
      '2xl': 'Label-M-FontSize',
      'custom': 'Label-L-FontSize',
    },
    description: 'Text (initials) font size per avatar size (Label typography role)',
    cssProperty: 'font-size',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Label-FontWeight-Medium',
    description: 'Avatar text font weight (Figma: Label Medium weight)',
    cssProperty: 'font-weight',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Border radius (Figma: dimensions/shape/pill = 9999px)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // ACCESSIBILITY TOKENS
  // ============================================

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    states: {
      disabled: 'Disabled-Opacity',
    },
    description: 'Opacity when avatar is disabled (Figma: disabled-opacity)',
    cssProperty: 'opacity',
  },
};

/**
 * Complete Avatar token manifest
 */
export const AVATAR_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Avatar',
  version: '2.0.0',
  description:
    'Visual representation of a user or entity. Colors derived from V4 surface system (tinted-a11y). Sizes verified against Figma spacings. Text uses Label typography role.',
  tokens: AVATAR_TOKENS,
  totalTokens: Object.keys(AVATAR_TOKENS).length,
  categories: {
    color: 2,
    spacing: 8,
    typography: 2,
    shape: 1,
    accessibility: 1,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getAvatarTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(AVATAR_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getAvatarTokenDefault(
  tokenName: keyof typeof AVATAR_TOKENS,
  options?: { variant?: string; size?: string; state?: string }
): string {
  const definition = AVATAR_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.state && definition.states) {
    const stateValues = definition.states[options.state as keyof typeof definition.states];
    if (stateValues) {
      if (typeof stateValues === 'string') return stateValues;
      if (options?.variant && stateValues[options.variant]) {
        return stateValues[options.variant];
      }
    }
  }

  if (options?.size && definition.sizes?.[options.size]) {
    return definition.sizes[options.size];
  }

  if (options?.variant && definition.variants?.[options.variant]) {
    return definition.variants[options.variant];
  }

  return definition.defaultToken;
}
