/**
 * PaginationDots.tokens.ts
 *
 * Token manifest for the PaginationDots component.
 * Used by the Component Token Editor to display available tokens,
 * surface their defaults per size, and generate CSS overrides.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const PAGINATION_DOTS_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR
  // ============================================

  colorActive: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    description: 'Fill colour for the active (current page) dot.',
    cssProperty: 'background-color',
  },

  colorInactive: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Stroke-Low',
    description: 'Fill colour for inactive dots. On the default (page background) surface this is always Neutral-grey regardless of appearance. On any other surface (minimal, subtle, moderate, bold, elevated) inactive dots switch to a tinted version of the active appearance role (--_pg-tinted-low → --{Role}-Stroke-Low) so they stay visually connected to the surface while remaining clearly distinct from the active pill.',
    cssProperty: 'background-color',
  },

  // ============================================
  // SPACING
  // ============================================

  dotSize: {
    category: 'spacing',
    defaultToken: 'Spacing-1-5',
    description: 'Diameter of each regular inactive dot (middle of the window). Figma M = Spacing-1-5 (6px). Active dot uses activeWidth, edge dots use edgeSize.',
    cssProperty: 'width',
  },

  edgeSize: {
    category: 'spacing',
    defaultToken: 'Spacing-1',
    description: 'Diameter of the smaller dot rendered at the outermost visible slots of a sliding window. Signals "more content this way". Figma M = Spacing-1 (4px), one f-step below dotSize.',
    cssProperty: 'width',
  },

  activeWidth: {
    category: 'spacing',
    defaultToken: 'Spacing-4',
    description: 'Width of the elongated active pill. Height stays at dot-size — this is what distinguishes the active dot from the inactive ones. Figma M = Spacing-4 (16px on web).',
    cssProperty: 'width',
  },

  hitArea: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    description: 'Absolute pseudo-element hit-area extension around each dot. Used only for touch target; does NOT affect visual gap between dots.',
    cssProperty: 'padding',
  },

  gap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-1',
    description: 'Visual gap between adjacent dots. Figma M = Spacing-1 (4px on web default density). Measured edge-to-edge between the dot shapes — the per-tab touch target is handled by an absolute pseudo-element so it does not inflate the gap.',
    cssProperty: 'gap',
  },


  // ============================================
  // SHAPE
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-Pill',
    description: 'Corner radius for each dot (pill by default — fully round).',
    cssProperty: 'border-radius',
  },

  // ============================================
  // MOTION
  // ============================================

  motionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-L',
    description: 'Duration of the shape-morph transition (width / height / fill). Longer duration = smoother pill-to-dot morph.',
    cssProperty: 'transition-duration',
  },

  motionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition-Moderate',
    description: 'Easing curve for non-geometric motion such as fill and opacity. Dot geometry uses non-overshooting transition easing so brand bounce curves cannot inflate width or height.',
    cssProperty: 'transition-timing-function',
  },
};

export const PAGINATION_DOTS_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'PaginationDots',
  version: '1.0.0',
  description:
    'Windowed pagination indicator (Instagram / Prime Video pattern). Active dot sits near the centre of a sliding window; edge dots shrink to signal more content. Two modes: loop (infinite wrap) and non-loop (end state, last dot grows).',
  tokens: PAGINATION_DOTS_TOKENS,
  totalTokens: Object.keys(PAGINATION_DOTS_TOKENS).length,
  categories: {
    color: 2,
    spacing: 5,
    shape: 1,
    motion: 2,
  },
};

export function getPaginationDotsTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(PAGINATION_DOTS_TOKENS).filter(
    ([, def]) => def.category === category,
  );
}

export function getPaginationDotsTokenDefault(
  tokenName: keyof typeof PAGINATION_DOTS_TOKENS,
): string {
  const definition = PAGINATION_DOTS_TOKENS[tokenName];
  if (!definition) return '';
  return definition.defaultToken;
}
