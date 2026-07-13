/**
 * JDSCarouselIndicatorList — RN knowledge entry for Carousel.IndicatorList
 * (flat export: CarouselIndicatorList).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts`
 * (`CarouselIndicatorListProps`). Leaf — reads slide count/selection from
 * CarouselContext, so it takes no `loop`/`count` props (unlike the standalone
 * PaginationDots it renders internally).
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselIndicatorList = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselIndicatorList',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'Pagination dots for the enclosing Carousel — reads slide count/selection from context.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselIndicatorList',
    type: 'object',
    properties: {
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
      },
      'aria-label': { type: 'string' },
    },
  },

  tokens: { color: ['primary'] },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'tablist',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-indicatorlist-v1', keyHistory: [] },

  renderHints: { baseElement: 'View', animatedOn: [], honorsReduceMotion: false, readsFromSurfaceContext: true },

  tags: ['carousel', 'pagination'],
} as const);
