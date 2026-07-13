/**
 * Carousel.tokens.ts
 *
 * Token manifest for the Carousel micropattern.
 * Tokens are emitted as `--Carousel-*` CSS custom properties; the CSS module
 * consumes them with sensible design-token fallbacks (Shape-3, Spacing-3-5, …).
 */

import type {
  ComponentTokenManifest,
  ComponentSlotDefinition,
  TokenDefinition,
} from '@oneui/shared';

export const CAROUSEL_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // SHAPE
  // ============================================
  slideRadius: {
    category: 'shape',
    defaultToken: 'Shape-3',
    description: 'Slide corner radius',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING
  // ============================================
  slideGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    description: 'Gap between adjacent slides on the track',
    cssProperty: 'gap',
  },
  contentPaddingBlockStart: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4-5',
    description: 'Top padding inside Slide.Content (Figma: Spacing-6/24px)',
    cssProperty: 'padding-block-start',
  },
  contentPaddingBlockEnd: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-6',
    description: 'Bottom padding inside Slide.Content (Figma: Spacing-9/36px)',
    cssProperty: 'padding-block-end',
  },
  contentPaddingInline: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4-5',
    description: 'Inline padding inside Slide.Content (Figma: Spacing-6/24px)',
    cssProperty: 'padding-inline',
  },
  contentGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-2-5',
    description: 'Inner gap between badge / headline / body inside the title cluster (Figma Spacing-2 / 8px)',
    cssProperty: 'gap',
  },
  contentOuterGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    description: 'Outer gap between the title cluster and the button group (Figma Spacing-3 + pt — visually ~20px)',
    cssProperty: 'gap',
  },
  cornerPadding: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3-5',
    description: 'Outer padding for Slide.Corner slots',
    cssProperty: 'padding',
  },
  controlsGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3-5',
    description: 'Gap between prev / next / indicators / play in Controls',
    cssProperty: 'gap',
  },
  controlsPaddingBlock: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    description: 'Top + bottom padding inside the below-controls container (one f-step up from Spacing-2-5 for comfortable separation)',
    cssProperty: 'padding-block',
  },

  // ============================================
  // SLIDE CONTENT (image overlay)
  // ============================================
  slideOnImageColor: {
    category: 'color',
    defaultToken: 'Text-On-Bold-High',
    description: 'Headline + body text colour for content overlaid on a slide image. Anchored to a root-only token so it does not re-cascade when the carousel is nested inside another <Surface>.',
    cssProperty: 'color',
  },

  // ============================================
  // COLOR (scrim)
  // ============================================
  scrimDirection: {
    category: 'color',
    defaultToken: 'to top',
    description: 'Gradient direction for the slide scrim',
    cssProperty: 'background-image',
  },
  scrimFromColor: {
    category: 'color',
    defaultToken: 'Surface-Default',
    description: 'Scrim "from" colour (mixed with 70% alpha by default)',
    cssProperty: 'background-image',
  },
  scrimToColor: {
    category: 'color',
    defaultToken: 'transparent',
    description: 'Scrim "to" colour',
    cssProperty: 'background-image',
  },

  // ============================================
  // MOTION
  // ============================================
  motionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Expressive-M',
    description: 'Slide transition + indicator state-change duration',
    cssProperty: 'transition-duration',
  },
  motionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Transition-Expressive',
    description: 'Slide transition easing curve',
    cssProperty: 'transition-timing-function',
  },
};

const CAROUSEL_SLOTS: Record<string, ComponentSlotDefinition> = {
  image: {
    name: 'image',
    types: ['image', 'video'],
    tokens: ['slideRadius'],
  },
  content: {
    name: 'content',
    types: ['headline', 'body', 'badge', 'buttonGroup'],
    tokens: [
      'contentPaddingBlockStart',
      'contentPaddingBlockEnd',
      'contentPaddingInline',
      'contentGap',
      'contentOuterGap',
    ],
  },
  cornerStart: {
    name: 'cornerStart',
    types: ['badge', 'iconButton', 'custom'],
    tokens: ['cornerPadding'],
  },
  cornerEnd: {
    name: 'cornerEnd',
    types: ['badge', 'iconButton', 'playButton', 'custom'],
    tokens: ['cornerPadding'],
  },
};

export const CAROUSEL_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Carousel',
  version: '1.0.0',
  description:
    'Compound carousel micropattern wrapping Embla Carousel. Slides are layered compositions of image, scrim, content, corner badges and a button group. Surface-context-aware: each slide sets `data-surface` so children remap tokens automatically.',
  tokens: CAROUSEL_TOKENS,
  totalTokens: Object.keys(CAROUSEL_TOKENS).length,
  categories: {
    shape: 1,
    spacing: 9,
    color: 4,
    motion: 2,
  },
  slots: CAROUSEL_SLOTS,
};

export function getCarouselTokensByCategory(
  category: string,
): [string, TokenDefinition][] {
  return Object.entries(CAROUSEL_TOKENS).filter(([, def]) => def.category === category);
}
