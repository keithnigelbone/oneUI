/**
 * Image.tokens.ts
 *
 * Token manifest for the Image component.
 * Figma properties: aspectRatio, interactive, altText.
 * Shape default: Shape-0 (no border radius by default).
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

/**
 * All tokens used by the Image component, organized by property
 */
export const IMAGE_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-0',
    description: 'Border radius — images have no radius by default, overridable per brand',
    cssProperty: 'border-radius',
  },

  // ============================================
  // COLOR TOKENS
  // ============================================

  stateLayerHover: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Hover',
    description: 'State layer color on hover (interactive mode)',
    cssProperty: 'background-color',
  },

  stateLayerPressed: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Pressed',
    description: 'State layer color on press (interactive mode)',
    cssProperty: 'background-color',
  },

  fallbackBackground: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Minimal',
    description: 'Background color of fallback placeholder when image fails to load',
    cssProperty: 'background-color',
  },

  fallbackColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-Low',
    description: 'Icon/text color of fallback placeholder',
    cssProperty: 'color',
  },

  // ============================================
  // ACCESSIBILITY TOKENS
  // ============================================

  focusOutlineColor: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline',
    description: 'Focus ring color (interactive mode)',
    cssProperty: 'outline-color',
  },

  focusOutlineWidth: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline-Width',
    description: 'Focus ring width (interactive mode)',
    cssProperty: 'outline-width',
  },

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    states: {
      disabled: 'Disabled-Opacity',
    },
    description: 'Opacity when image is disabled',
    cssProperty: 'opacity',
  },

  // ============================================
  // MOTION TOKENS
  // ============================================

  transitionDuration: {
    category: 'motion',
    defaultToken: 'Motion-Duration-Discreet-Medium',
    description: 'Transition duration for state layer and border-radius changes',
    cssProperty: 'transition-duration',
  },

  transitionEasing: {
    category: 'motion',
    defaultToken: 'Motion-Easing-Standard',
    description: 'Transition easing curve',
    cssProperty: 'transition-timing-function',
  },
};

/**
 * Complete Image token manifest
 */
export const IMAGE_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Image',
  version: '1.0.0',
  description:
    'Displays visual content with optional interactivity (clickable/focusable) and 10 aspect ratio presets. Shape default: no border radius.',
  tokens: IMAGE_TOKENS,
  totalTokens: Object.keys(IMAGE_TOKENS).length,
  categories: {
    shape: 1,
    color: 4,
    accessibility: 3,
    motion: 2,
  },
};

/**
 * Get all tokens for a specific category
 */
export function getImageTokensByCategory(
  category: string
): [string, TokenDefinition][] {
  return Object.entries(IMAGE_TOKENS).filter(
    ([, def]) => def.category === category
  );
}

/**
 * Get the default token value for a specific token and context
 */
export function getImageTokenDefault(
  tokenName: keyof typeof IMAGE_TOKENS,
  options?: { variant?: string; size?: string; state?: string }
): string {
  const definition = IMAGE_TOKENS[tokenName];
  if (!definition) return '';

  if (options?.state && definition.states) {
    const stateValues = definition.states[options.state as keyof typeof definition.states];
    if (stateValues) {
      if (typeof stateValues === 'string') return stateValues;
    }
  }

  return definition.defaultToken;
}
