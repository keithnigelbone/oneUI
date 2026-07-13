/**
 * JDSCarouselItem — RN knowledge entry for Carousel.Item (flat export: CarouselItem).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts` (`CarouselSlideProps`).
 * A single slide — composes CarouselSlideImage, an optional CarouselItemBadgeRow,
 * and an optional CarouselSlideContent.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselItem = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselItem',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A single carousel slide. `surface` (e.g. "bold") sets the slide-level Surface context for its content.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselItem',
    type: 'object',
    required: ['children'],
    properties: {
      height: { type: 'number', description: 'Per-slide height override — falls back to Carousel root height.' },
      surface: { enum: ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] },
      'aria-label': { type: 'string' },
      children: { description: 'CarouselSlideImage (+ optional CarouselItemBadgeRow / CarouselSlideContent).' },
    },
  },

  tokens: { surface: ['default', 'bold'] },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['CarouselSlideImage', 'CarouselItemBadgeRow', 'CarouselSlideContent'],
        cardinality: 'multiple',
        description: 'One CarouselSlideImage, plus optional badge row and content overlay.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'image',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-item-v1', keyHistory: [] },

  renderHints: { baseElement: 'View', animatedOn: [], honorsReduceMotion: false, readsFromSurfaceContext: true },

  tags: ['carousel', 'compound', 'surface-aware'],
} as const);
