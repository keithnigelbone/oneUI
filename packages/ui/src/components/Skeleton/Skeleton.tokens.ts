/**
 * Skeleton.tokens.ts
 *
 * Brand-customizable skeleton surface + motion tokens.
 * Fallback dimensions are pending dedicated skeleton tokens (see PRD §8).
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const SKELETON_TOKENS: Record<string, TokenDefinition> = {
  baseColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Subtle',
    description: 'Skeleton fill base color.',
    cssProperty: 'background-color',
  },
  highlightColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Neutral-Minimal',
    description: 'Skeleton shimmer highlight color.',
    cssProperty: 'background-color',
  },
  borderRadius: {
    category: 'shape',
    subcategory: 'radius',
    defaultToken: 'Shape-3',
    description: 'Corner radius for skeleton placeholders.',
    cssProperty: 'border-radius',
  },
  shimmerDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-3XL',
    description: 'Shimmer cycle duration.',
    cssProperty: 'animation-duration',
  },
  shimmerEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition',
    description: 'Shimmer easing curve.',
    cssProperty: 'animation-timing-function',
  },
  staggerOffset: {
    category: 'motion',
    subcategory: 'offset',
    defaultToken: 'Motion-Offset-L',
    description: 'Per-item stagger delay multiplier (index × offset).',
    cssProperty: 'animation-delay',
  },
  fallbackWidth: {
    category: 'dimension',
    subcategory: 'size',
    defaultToken: 'Spacing-40',
    description: 'Default width when size cannot be inferred. Pending dedicated skeleton token.',
    cssProperty: 'width',
  },
  fallbackHeight: {
    category: 'dimension',
    subcategory: 'size',
    defaultToken: 'Spacing-5',
    description: 'Default height when size cannot be inferred. Pending dedicated skeleton token.',
    cssProperty: 'height',
  },
};

export const SKELETON_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Skeleton',
  version: '1.0.0',
  description:
    'Loading placeholder primitives — SkeletonItem (size inference) + SkeletonGroup (automatic stagger).',
  tokens: SKELETON_TOKENS,
  totalTokens: Object.keys(SKELETON_TOKENS).length,
  categories: {
    color: 2,
    shape: 1,
    motion: 3,
    dimension: 2,
  },
};
