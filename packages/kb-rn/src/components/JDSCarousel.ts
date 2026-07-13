/**
 * JDSCarousel — RN knowledge entry for the Carousel compound micropattern.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Carousel/interface.ts` (RN peer of
 * `packages/ui/src/components/Carousel/*`, ScrollView paging instead of
 * Embla — public API matches web).
 *
 * Compound API: `Carousel` (root) + `Carousel.Item` (slide) +
 * `Carousel.SlideImage` / `Carousel.SlideContent` + `Carousel.Controls`
 * (`PrevButton` / `NextButton` / `PlayButton` / `IndicatorList`) +
 * `Carousel.SelectionRail`. Slide surface (`bold`/`subtle`/etc.) is resolved
 * via `useSurfaceTokens`, so scrims/badges/text adapt automatically per slide.
 */

import { defineComponent } from '../defineComponent';

export const JDSCarousel = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Carousel',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Compound carousel micropattern. Root manages paging (ScrollView-based, mirrors web Embla API), optional loop, autoplay, and a shared image aspect ratio / height across slides. Slides (`Carousel.Item`) each resolve their own surface context and may host image, headline/body text, badges, and a button group. Controls (prev/next/play, pagination dots, selection rail) are presence-driven — they render wherever the matching subcomponent is placed as a child.',

  propsSchema: {
    $id: 'jds.kb.rn.Carousel',
    type: 'object',
    required: ['aria-label', 'children'],
    properties: {
      'aria-label': { type: 'string', description: 'Accessible name for the carousel landmark (required — no visual title implies one).' },
      opts: { description: 'Embla-style options object (advanced). `loop` prop takes precedence over `opts.loop` when both are set.' },
      loop: { type: 'boolean', description: 'Prev/next navigation and autoplay wrap from last slide to first.' },
      autoPlay: { description: 'Autoplay interval in ms, or `false` to disable. Default: false.' },
      fullWidth: { type: 'boolean', description: 'Slides stretch edge-to-edge instead of respecting content max-width.' },
      aspectRatio: {
        description: "Shared media aspect ratio for every slide (Figma `.CarouselImage/*`). 'flexible' uses `height` (or per-slide override) instead of a fixed ratio.",
      },
      height: { type: 'number', description: 'Shared slide height in px when `aspectRatio` is `flexible`. Per-slide `height` overrides. Must be a positive integer.' },
      style: { description: 'Root layout style.' },
      testID: { type: 'string' },
      accessibilityHint: { type: 'string' },
      children: { description: 'One or more `Carousel.Item` slides, plus optional `Carousel.Controls` / `Carousel.SelectionRail`.' },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['default', 'bold', 'subtle', 'minimal', 'elevated'],
    typography: ['headline.M', 'body.S', 'label.XS'],
    shape: ['S', 'M'],
    motion: ['motion.duration.expressive.long', 'motion.easing.transition'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      children: {
        accepts: [
          'Carousel.Item',
          'Carousel.Controls',
          'Carousel.SelectionRail',
          'Carousel.IndicatorList',
          'Carousel.PrevButton',
          'Carousel.NextButton',
          'Carousel.PlayButton',
        ],
        cardinality: 'multiple',
        description: 'At least one Carousel.Item slide is required; controls/rail/indicator subcomponents are optional and presence-driven.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'none',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-carousel-v1',
    keyHistory: [],
    variantProperties: { Component: 'Carousel' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['media', 'carousel', 'compound', 'surface-aware', 'paging'],
} as const);
