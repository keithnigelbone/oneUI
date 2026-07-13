/**
 * JDSCarouselItemBadgeRow — RN knowledge entry for Carousel.Item.BadgeRow
 * (flat export: CarouselItemBadgeRow).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts`
 * (`CarouselItemBadgeRowProps`). Pins a Badge (or CarouselPlayButton) to a
 * corner of the slide.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselItemBadgeRow = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselItemBadgeRow',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'Corner-pinned badge/action row on a slide.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselItemBadgeRow',
    type: 'object',
    required: ['placement', 'children'],
    properties: {
      placement: { enum: ['start', 'end'] },
      children: { description: 'Badge or CarouselPlayButton.' },
    },
  },

  tokens: { spacing: [] },

  composition: {
    childKind: 'fixed-slots',
    slots: { children: { accepts: ['Badge', 'CarouselPlayButton'], cardinality: 'multiple', description: 'Corner content.' } },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-item-badgerow-v1', keyHistory: [] },

  renderHints: { baseElement: 'View', animatedOn: [], honorsReduceMotion: false, readsFromSurfaceContext: true },

  tags: ['carousel', 'compound'],
} as const);
