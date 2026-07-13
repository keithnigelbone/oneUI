/**
 * JDSCarouselSlideImage — RN knowledge entry for Carousel.Item.Image (flat
 * export: CarouselSlideImage).
 *
 * Mirrors `packages/ui-native/src/components/Carousel/interface.ts`
 * (`CarouselSlideImageProps`). Leaf — no children. `scrim=true` renders the
 * default bottom/XL/high/gradient Scrim for text legibility over the image.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarouselSlideImage = defineComponent({
  schemaVersion: '5.0.0',
  name: 'CarouselSlideImage',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description: 'A slide\'s media. `scrim=true` overlays the default bottom-fade Scrim; pass a ScrimProps object to customize.',

  propsSchema: {
    $id: 'jds.kb.rn.CarouselSlideImage',
    type: 'object',
    required: ['src', 'alt'],
    properties: {
      src: { type: 'string', description: 'Remote URL or bundled require() asset.' },
      alt: { type: 'string' },
      aspectRatio: { enum: ['1:2', '9:16', '3:4', '1:1', '4:3', '5:3', '16:9', '2:1', '21:9', 'flexible'], description: 'Overrides the Carousel root aspectRatio for this slide.' },
      scrim: { description: 'true → default bottom/XL/high/gradient Scrim; or a ScrimProps object for a custom one.' },
    },
  },

  tokens: { spacing: [] },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'image',
    accessibleNameSource: 'children',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: { componentKey: 'jds-carousel-slide-image-v1', keyHistory: [] },

  renderHints: { baseElement: 'Image', animatedOn: [], honorsReduceMotion: false, readsFromSurfaceContext: false },

  tags: ['carousel', 'media'],
} as const);
