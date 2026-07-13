/**
 * JDSCarouselRail — RN knowledge entry for Carousel.Rail (flat export: CarouselRail).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts` (`CarouselTrackProps`).
 * The scrollable track that composes CarouselItem slides — the only child kind it accepts.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselRail = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselRail',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'Carousel scroll track. Composes CarouselItem slides only.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselRail',
    type: 'object',
    required: ['children'],
    properties: {
      children: { description: 'CarouselItem elements.' },
    },
  },

  tokens: { spacing: [] },

  composition: {
    childKind: 'fixed-slots',
    slots: { children: { accepts: ['CarouselItem'], cardinality: 'multiple', description: 'One CarouselItem per slide.' } },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-rail-v1', keyHistory: [] },

  renderHints: { baseElement: 'View', animatedOn: [], honorsReduceMotion: true, readsFromSurfaceContext: false },

  tags: ['carousel', 'compound'],
} as const);
