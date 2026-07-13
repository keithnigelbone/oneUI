/**
 * JDSCarouselControls — RN knowledge entry for Carousel.Controls (flat
 * export: CarouselControls).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts`
 * (`CarouselControlsProps`). Composes CarouselIndicatorList + optional
 * Prev/Next/Play buttons, either below the rail or floating onMedia.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselControls = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselControls',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'Carousel controls row — dots + optional prev/next/play buttons, placed below the rail or floating onMedia.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselControls',
    type: 'object',
    required: ['children'],
    properties: {
      placement: { enum: ['below', 'onMedia'], default: 'below' },
      layout: { enum: ['center', 'split'], default: 'center' },
      paginationAlign: { enum: ['start', 'middle', 'end'], description: 'onMedia only.' },
      children: { description: 'CarouselIndicatorList + optional CarouselPrevButton/CarouselNextButton/CarouselPlayButton.' },
    },
  },

  tokens: { spacing: [] },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: ['CarouselIndicatorList', 'CarouselPrevButton', 'CarouselNextButton', 'CarouselPlayButton', 'CarouselSelectionRail'],
        cardinality: 'multiple',
        description: 'Dots/rail + nav buttons.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-controls-v1', keyHistory: [] },

  renderHints: { baseElement: 'View', animatedOn: [], honorsReduceMotion: false, readsFromSurfaceContext: true },

  tags: ['carousel', 'compound'],
} as const);
