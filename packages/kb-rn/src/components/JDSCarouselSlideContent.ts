/**
 * JDSCarouselSlideContent — RN knowledge entry for Carousel.Item.Content
 * (flat export: CarouselSlideContent).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts`
 * (`CarouselSlideContentProps`). The text/CTA overlay block on a slide.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselSlideContent = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselSlideContent',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'Slide text/CTA overlay block — headline/body copy and an optional CarouselSlideButtonGroup.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselSlideContent',
    type: 'object',
    required: ['children'],
    properties: {
      alignment: { enum: ['startBottom', 'startMiddle', 'middleBottom', 'middleMiddle', 'middleTop'], default: 'startBottom' },
      width: { enum: ['fill', 's', 'm', 'l'], default: 'fill' },
      children: { description: 'Headline/body Text + an optional CarouselSlideButtonGroup.' },
    },
  },

  tokens: { spacing: [], typography: ['headline.L', 'label.S'] },

  composition: {
    childKind: 'fixed-slots',
    slots: { children: { accepts: ['Text', 'CarouselSlideButtonGroup'], cardinality: 'multiple', description: 'Copy + CTA.' } },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-slide-content-v1', keyHistory: [] },

  renderHints: { baseElement: 'View', animatedOn: [], honorsReduceMotion: false, readsFromSurfaceContext: true },

  tags: ['carousel', 'compound', 'surface-aware'],
} as const);
