/**
 * Carousel.meta.ts
 * Catalog metadata for the Carousel micropattern.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CAROUSEL_TOKEN_MANIFEST } from './Carousel.tokens';
import { CAROUSEL_IMAGE_ASPECT_RATIOS } from './Carousel.shared';

export const CAROUSEL_META: ComponentMeta = {
  name: 'Carousel',
  slug: 'carousel',
  displayName: 'Carousel',
  description:
    'Multi-brand carousel micropattern. Compound API (`Carousel.Root` / `Viewport` / `Track` / `Slide` / controls) with thin design-variant presets (`Carousel.Desktop`, `Carousel.Tablet`, `Carousel.Mobile`). Slides layer image, scrim, content (badge / headline / body / actions), and corner slots. Surface-context-aware. Web engine: Embla Carousel. Figma-aligned API: `followsAspectRatio`, 1-based `activePage` / `pageCount`. See MIGRATION.md for intentional React deviations.',
  category: 'navigation',

  props: [
    {
      name: 'aria-label',
      type: 'string',
      description: 'Required region label for assistive tech (set on Carousel.Root).',
    },
    {
      name: 'loop',
      type: 'boolean',
      description: 'Wrap navigation from last slide to first. Wins over `opts.loop`.',
      defaultValue: false,
    },
    {
      name: 'autoPlay',
      type: 'number',
      description: 'Autoplay delay in ms; pass `false` to disable.',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      description:
        'Render edge-to-edge, dropping container padding. Required for `selectionRailOnMedia`.',
      defaultValue: false,
    },
    {
      name: 'followsAspectRatio',
      type: 'boolean',
      description:
        'Figma `followsAspectRatio`. When true (default), slides size via aspectRatio. When false, use `height`. `followAspectRatio` is a deprecated alias.',
      defaultValue: true,
    },
    {
      name: 'aspectRatio',
      type: 'enum',
      description: 'Shared slide aspect ratio — Figma `.CarouselImage/*`.',
      defaultValue: '16:9',
      options: [...CAROUSEL_IMAGE_ASPECT_RATIOS],
    },
    {
      name: 'height',
      type: 'number',
      description:
        'Fixed slide height (px) when followsAspectRatio=false or aspectRatio=flexible. Default 480, min 300.',
      defaultValue: 480,
    },
    {
      name: 'activePage',
      type: 'number',
      description:
        'Controlled visible page — 1-based (min 1). Figma default is 5; React defaults to first slide when uncontrolled.',
      defaultValue: 1,
    },
    {
      name: 'pageCount',
      type: 'number',
      description:
        'Total pages — exposed on `useCarousel()` as alias for slide count. Figma default is 5; React derives from items/slides at runtime.',
    },
    {
      name: 'defaultActivePage',
      type: 'number',
      description:
        'Uncontrolled initial page — 1-based (min 1). Figma default is 5; React defaults to first slide (`1`).',
      defaultValue: 1,
    },
    {
      name: 'controls',
      type: 'boolean',
      description:
        'Platform wrappers — when `false` (default), hides all control chrome. `controlsType` applies only when `true`.',
      defaultValue: false,
    },
    {
      name: 'controlsType',
      type: 'enum',
      description:
        'Preset control chrome on Desktop/Tablet/Mobile wrappers. Only applies when `controls={true}`.',
      defaultValue: 'pagination',
      options: [
        'none',
        'pagination',
        'paginationOnMedia',
        'selectionRail',
        'selectionRailOnMedia',
      ] as const,
    },
    {
      name: 'contentAlignment',
      type: 'enum',
      description:
        'Slide.Content placement within the slide. Platform defaults in carousel.presets.ts (desktop/tablet: startBottom; mobile: middleBottom).',
      defaultValue: 'startBottom',
      options: [
        'startBottom',
        'startMiddle',
        'middleBottom',
        'middleMiddle',
        'middleTop',
      ] as const,
    },
    {
      name: 'contentWidth',
      type: 'enum',
      description: 'Slide.Content max width — Figma `fill | s | m | l` only.',
      defaultValue: 's',
      options: ['fill', 's', 'm', 'l'] as const,
    },
    {
      name: 'buttonWidth',
      type: 'enum',
      description:
        'Slide.ButtonGroup width — `fill` is mobile alias for `wide`. Platform default: desktop/tablet `hug`, mobile `wide`.',
      defaultValue: 'hug',
      options: ['hug', 'wide', 'fill'] as const,
    },
    {
      name: 'scrim',
      type: 'boolean',
      description:
        'Slide.Image scrim — `true` for content-alignment-aware gradient preset (`buildCarouselDefaultScrimProps`), or full ScrimProps for overlay/gradient variants.',
      defaultValue: false,
    },
    {
      name: 'badgesStart',
      type: 'boolean',
      description: 'Slide — show start-corner badges.',
      defaultValue: false,
    },
    {
      name: 'badgesEnd',
      type: 'boolean',
      description: 'Slide — show end-corner badges.',
      defaultValue: false,
    },
    {
      name: 'badgesMiddle',
      type: 'boolean',
      description: 'Slide.Content — show middle badge row.',
      defaultValue: false,
    },
    {
      name: 'playButton',
      type: 'boolean',
      description: 'Slide — show play control in end corner.',
      defaultValue: false,
    },
    {
      name: 'autoplay',
      type: 'boolean',
      description: 'Carousel.Pagination — show play/pause when root `autoPlay` is enabled.',
      defaultValue: false,
    },
    {
      name: 'controlsPlacement',
      type: 'enum',
      description: 'Carousel.Controls placement (omit Controls or use controls=false for hidden)',
      defaultValue: 'below',
      options: ['below', 'onMedia'] as const,
    },
  ],

  slots: [
    {
      name: 'image',
      description:
        'Slide.Image — primary media. `scrim` adds alignment-aware gradient; use Scrim component for overlay variant.',
      acceptedTypes: ['Image', 'Video', 'Scrim'],
    },
    {
      name: 'content',
      description: 'Slide.Content — overlay block for badge / headline / body / actions.',
      acceptedTypes: ['Badge', 'Headline', 'Body', 'ButtonGroup'],
    },
    {
      name: 'cornerStart',
      description: 'Top-start slot for badges, icon buttons, etc.',
      acceptedTypes: ['Badge', 'IconButton', 'CounterBadge'],
    },
    {
      name: 'cornerEnd',
      description: 'Top-end slot — common host for Carousel.PlayButton.',
      acceptedTypes: ['Badge', 'IconButton', 'PlayButton'],
    },
    {
      name: 'controls',
      description:
        'Carousel.Controls children — Pagination, SelectionRail, Prev, Next, Play.',
      acceptedTypes: [
        'Pagination',
        'PaginationOnMedia',
        'SelectionRail',
        'SelectionRailOnMedia',
        'PrevButton',
        'NextButton',
        'PlayButton',
      ],
    },
  ],

  previewMatrix: {
    variants: ['pagination', 'paginationOnMedia', 'selectionRail', 'selectionRailOnMedia'],
    variantLabels: {
      pagination: 'Pagination below',
      paginationOnMedia: 'Pagination on media',
      selectionRail: 'Selection rail below',
      selectionRailOnMedia: 'Selection rail on media',
    },
    sizes: ['9:16', '3:4', '1:1', '4:3', '5:3', '16:9', '2:1', '21:9'] as const,
    sizeLabels: {
      '9:16': '9:16',
      '3:4': '3:4',
      '1:1': '1:1',
      '4:3': '4:3',
      '5:3': '5:3',
      '16:9': '16:9',
      '2:1': '2:1',
      '21:9': '21:9',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: CAROUSEL_TOKEN_MANIFEST,
};
