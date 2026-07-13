/**
 * Shared Storybook helpers for Carousel micropattern stories.
 */

import type { Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import React from 'react';
import { Badge } from '../../Badge/Badge';
import { Button } from '../../Button/Button';
import { Carousel } from '../Carousel';
import {
  CAROUSEL_DESKTOP_ASPECT_RATIOS,
  CAROUSEL_DESKTOP_PRESET,
  CAROUSEL_MOBILE_ASPECT_RATIOS,
  CAROUSEL_MOBILE_PRESET,
  CAROUSEL_TABLET_ASPECT_RATIOS,
  CAROUSEL_TABLET_PRESET,
} from '../carousel.presets';
import type {
  CarouselAlignment,
  CarouselButtonWidth,
  CarouselContentWidth,
  CarouselControlsType,
  CarouselImageAspectRatio,
} from '../Carousel.shared';
import {
  CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  CAROUSEL_IMAGE_ASPECT_RATIOS,
} from '../Carousel.shared';
import type { CarouselPlatformWrapperProps } from '../variants/CarouselPlatformWrappers';
import { DEMO_SLIDES } from './Carousel.showcase';

export { DEMO_SLIDES, DemoCarousel, DemoSlide, CarouselAdoptionMatrix } from './Carousel.showcase';

export const storyCaptionStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Low)',
  marginBlockEnd: 'var(--Spacing-3-5)',
};

export function StorySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={storyCaptionStyle}>{title}</h4>
      {children}
    </div>
  );
}

export const reducedMotionDemoCSS = `
  .carousel-story-reduced-motion [data-aspect] {
    transition: none !important;
  }
`;

export function demoRailItems(count = DEMO_SLIDES.length) {
  return DEMO_SLIDES.slice(0, count).map((slide) => ({ src: slide.src, alt: slide.alt }));
}

export function platformSlideRenderer(slide: (typeof DEMO_SLIDES)[number]) {
  return (
    <Carousel.Slide surface="bold">
      <Carousel.Slide.Image src={slide.src} alt={slide.alt} scrim contentAlignment="startBottom" />
      <Carousel.Slide.Content content contentAlignment="startBottom" contentWidth="s">
        <h3>{slide.title}</h3>
      </Carousel.Slide.Content>
    </Carousel.Slide>
  );
}

export function mobileSlideRenderer(slide: (typeof DEMO_SLIDES)[number]) {
  return (
    <Carousel.Slide surface="bold">
      <Carousel.Slide.Image src={slide.src} alt={slide.alt} scrim />
    </Carousel.Slide>
  );
}

type DesignPreset = 'desktop' | 'tablet' | 'mobile';
type VariantLabel = 'Root' | 'Desktop' | 'Tablet' | 'Mobile';

const PRESET_COMPONENT = {
  desktop: Carousel.Desktop,
  tablet: Carousel.Tablet,
  mobile: Carousel.Mobile,
} as const;

const PRESET_ASPECT_RATIOS = {
  desktop: CAROUSEL_DESKTOP_ASPECT_RATIOS,
  tablet: CAROUSEL_TABLET_ASPECT_RATIOS,
  mobile: CAROUSEL_MOBILE_ASPECT_RATIOS,
} as const;

const VARIANT_DOCS: Record<'Desktop' | 'Tablet' | 'Mobile', string> = {
  Desktop: `Desktop preset for 1440px reference frames. Default aspect \`16:9\`, default controls \`pagination\` (split below-media layout). Supported aspects: ${CAROUSEL_DESKTOP_ASPECT_RATIOS.join(', ')}.`,
  Tablet: `Tablet preset for 768px reference frames. Same control vocabulary and aspect set as desktop. Supported aspects: ${CAROUSEL_TABLET_ASPECT_RATIOS.join(', ')}.`,
  Mobile: `Mobile preset for 360px portrait-first frames. Default aspect \`3:4\`. Selection rail scrolls horizontally when thumbnails overflow. Supported aspects: ${CAROUSEL_MOBILE_ASPECT_RATIOS.join(', ')}.`,
};

const VARIANT_PRESET_META = {
  Desktop: CAROUSEL_DESKTOP_PRESET,
  Tablet: CAROUSEL_TABLET_PRESET,
  Mobile: CAROUSEL_MOBILE_PRESET,
} as const;

const DESIGN_TO_VARIANT: Record<DesignPreset, 'Desktop' | 'Tablet' | 'Mobile'> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

const CONTROLS_TYPE_OPTIONS: CarouselControlsType[] = [
  'none',
  'pagination',
  'paginationOnMedia',
  'selectionRail',
  'selectionRailOnMedia',
];

const CONTENT_ALIGNMENT_OPTIONS: CarouselAlignment[] = [
  'startBottom',
  'startMiddle',
  'middleBottom',
  'middleMiddle',
  'middleTop',
];

const CONTENT_WIDTH_OPTIONS: CarouselContentWidth[] = ['fill', 's', 'm', 'l'];

const AUTOPLAY_OPTIONS = [false, 2000, 3000, 5000] as const;

/** Docs + canvas: full-width wrapper so aspect-ratio carousels size naturally (no fixed iframe height). */
export function withCarouselDocsLayout(Story: React.ComponentType) {
  return (
    <div style={{ width: '100%' }}>
      <Story />
    </div>
  );
}

/** Story-only props layered on platform wrapper args for interactive docs. */
export interface PresetCarouselStoryExtras {
  preset: DesignPreset;
  itemCount?: number;
  selectionRailCount?: number;
  /** Figma `content` visibility on Slide.Content. */
  content?: boolean;
  contentAlignment?: CarouselAlignment;
  contentWidth?: CarouselContentWidth;
  buttonWidth?: CarouselButtonWidth;
  scrim?: boolean;
  showBadge?: boolean;
  badgesStart?: boolean;
  badgesEnd?: boolean;
  badgesMiddle?: boolean;
  playButton?: boolean;
}

export type PresetCarouselStoryProps = PresetCarouselStoryExtras &
  Omit<CarouselPlatformWrapperProps<(typeof DEMO_SLIDES)[number]>, 'children' | 'items' | 'renderItem'>;

/** Storybook-only overrides for visual demos — not Figma component defaults. */
export const CAROUSEL_DEMO_STORY_OVERRIDES: Partial<PresetCarouselStoryProps> = {
  controls: true,
  content: true,
  showBadge: true,
  badgesStart: false,
  badgesMiddle: true,
};

export function createCarouselPresetArgs(preset: DesignPreset): PresetCarouselStoryProps {
  const variant = DESIGN_TO_VARIANT[preset];
  const presetMeta = VARIANT_PRESET_META[variant];

  return {
    preset,
    'aria-label': `${preset} carousel`,
    controls: false,
    controlsType: presetMeta.defaultControlsType,
    aspectRatio: presetMeta.defaultAspectRatio,
    fullWidth: false,
    loop: false,
    followsAspectRatio: true,
    height: 480,
    autoPlay: false,
    defaultActivePage: 1,
    showNav: true,
    splitControls: true,
    itemCount: 4,
    selectionRailCount: 4,
    content: false,
    contentAlignment: presetMeta.content.contentAlignment,
    contentWidth: presetMeta.content.contentWidth,
    buttonWidth: presetMeta.content.buttonWidth,
    scrim: true,
    showBadge: false,
    badgesStart: false,
    badgesEnd: false,
    badgesMiddle: false,
    playButton: false,
    paginationAutoplay: false,
    onActivePageChange: fn(),
  };
}

/** Binds Storybook args → live preset carousel (required for Controls / Docs canvas). */
export function renderPresetCarouselStory(preset: DesignPreset) {
  return (args: PresetCarouselStoryProps) => <PresetCarousel {...args} preset={preset} />;
}

export function PresetCarousel({
  preset,
  'aria-label': ariaLabel,
  controls,
  controlsType,
  fullWidth,
  aspectRatio,
  itemCount = 4,
  selectionRailCount,
  loop,
  followsAspectRatio,
  followAspectRatio,
  height,
  autoPlay,
  defaultActivePage,
  activePage,
  onActivePageChange,
  showNav,
  splitControls,
  content = false,
  contentAlignment,
  contentWidth,
  buttonWidth,
  scrim = true,
  showBadge = false,
  badgesStart = false,
  badgesEnd = false,
  badgesMiddle = false,
  playButton = false,
  paginationAutoplay = false,
  className,
  style,
  opts,
}: PresetCarouselStoryProps) {
  const presetMeta = VARIANT_PRESET_META[DESIGN_TO_VARIANT[preset]];
  const Component = PRESET_COMPONENT[preset];
  const items = DEMO_SLIDES.slice(0, itemCount);
  const resolvedControlsType = controlsType ?? presetMeta.defaultControlsType;
  const usesRail =
    resolvedControlsType === 'selectionRail' || resolvedControlsType === 'selectionRailOnMedia';
  const minimalMobileRail = preset === 'mobile' && usesRail;
  const resolvedContentAlignment = contentAlignment ?? presetMeta.content.contentAlignment;
  const resolvedContentWidth = contentWidth ?? presetMeta.content.contentWidth;
  const resolvedButtonWidth = buttonWidth ?? presetMeta.content.buttonWidth;
  const resolvedAspectRatio = aspectRatio ?? presetMeta.defaultAspectRatio;
  const resolvedFollowsAspectRatio = followsAspectRatio ?? followAspectRatio ?? true;
  const showCornerBadge = showBadge && badgesStart;

  const renderItem = (slide: (typeof DEMO_SLIDES)[number]) => {
    if (minimalMobileRail) {
      return (
        <Carousel.Slide
          aspectRatio={resolvedAspectRatio}
          surface="bold"
          badgesStart={badgesStart}
          badgesEnd={badgesEnd}
          playButton={playButton}
        >
          <Carousel.Slide.Image
            src={slide.src}
            alt={slide.alt}
            scrim={scrim}
            contentAlignment={resolvedContentAlignment}
          />
        </Carousel.Slide>
      );
    }

    return (
      <Carousel.Slide
        aspectRatio={resolvedAspectRatio}
        surface="bold"
        badgesStart={showCornerBadge}
        badgesEnd={badgesEnd}
        playButton={playButton}
      >
        <Carousel.Slide.Image
          src={slide.src}
          alt={slide.alt}
          scrim={scrim}
          contentAlignment={resolvedContentAlignment}
        />
        {showCornerBadge ? (
          <Carousel.Slide.Corner placement="start">
            <Badge appearance="sparkle" aria-label={slide.badge}>
              {slide.badge}
            </Badge>
          </Carousel.Slide.Corner>
        ) : null}
        {content ? (
          <Carousel.Slide.Content
            content
            contentAlignment={resolvedContentAlignment}
            contentWidth={resolvedContentWidth}
            badgesMiddle={badgesMiddle && showBadge}
          >
            {badgesMiddle && showBadge ? (
              <div data-carousel-part="badges-middle">
                <Badge appearance="sparkle" aria-label={slide.badge}>
                  {slide.badge}
                </Badge>
              </div>
            ) : null}
            <h3>{slide.title}</h3>
            <p>{slide.body}</p>
            <Carousel.Slide.ButtonGroup buttonWidth={resolvedButtonWidth}>
              <Button attention="high">{slide.primaryAction}</Button>
            </Carousel.Slide.ButtonGroup>
          </Carousel.Slide.Content>
        ) : null}
      </Carousel.Slide>
    );
  };

  const rootProps = {
    'aria-label': ariaLabel,
    controls,
    controlsType: resolvedControlsType,
    fullWidth,
    aspectRatio,
    loop,
    followsAspectRatio: resolvedFollowsAspectRatio,
    height: resolvedFollowsAspectRatio === false ? height : undefined,
    autoPlay,
    defaultActivePage,
    activePage,
    onActivePageChange,
    showNav,
    splitControls,
    paginationAutoplay,
    className,
    style,
    opts,
    items,
    selectionRailItems: usesRail ? demoRailItems(selectionRailCount ?? itemCount) : undefined,
    renderItem,
  };

  return <Component {...rootProps} />;
}

export function PresetAspectRatiosGrid({ preset }: { preset: DesignPreset }) {
  const ratios = PRESET_ASPECT_RATIOS[preset];
  const Component = PRESET_COMPONENT[preset];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      {ratios.map((ratio) => (
        <StorySection key={ratio} title={`Aspect ${ratio}`}>
          <Component
            aria-label={`${preset} aspect ${ratio}`}
            aspectRatio={ratio}
            controls
            controlsType="pagination"
            items={DEMO_SLIDES.slice(0, 3)}
            renderItem={(slide) => (
              <Carousel.Slide aspectRatio={ratio} surface="bold">
                <Carousel.Slide.Image src={slide.src} alt={slide.alt} scrim contentAlignment="startBottom" />
                <Carousel.Slide.Content content contentAlignment="startBottom" contentWidth="s">
                  <h3>{slide.title}</h3>
                </Carousel.Slide.Content>
              </Carousel.Slide>
            )}
          />
        </StorySection>
      ))}
    </div>
  );
}

/** Storybook-only preview chrome — not part of the Carousel component API. */
function CarouselStoryViewport({
  preset,
  children,
}: {
  preset: 'tablet' | 'mobile';
  children: React.ReactNode;
}) {
  const referenceWidth =
    preset === 'tablet'
      ? CAROUSEL_TABLET_PRESET.referenceWidth
      : CAROUSEL_MOBILE_PRESET.referenceWidth;

  return (
    <div
      style={{
        width: `${referenceWidth}px`,
        maxWidth: '100%',
        marginInline: 'auto',
        border: 'var(--Stroke-M) solid var(--Border-Subtle)',
        borderRadius: 'var(--Shape-2)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

/** Storybook decorator — previews tablet/mobile at Figma reference widths. */
export function withCarouselStoryViewport(preset: 'tablet' | 'mobile') {
  return (Story: React.ComponentType) => (
    <CarouselStoryViewport preset={preset}>
      <Story />
    </CarouselStoryViewport>
  );
}

function buildCarouselArgTypes(
  variant: VariantLabel,
  aspectOptions: readonly CarouselImageAspectRatio[],
  defaultAspect: CarouselImageAspectRatio,
  defaultControlsType: CarouselControlsType,
) {
  return {
    preset: { table: { disable: true } },
    items: { table: { disable: true } },
    renderItem: { table: { disable: true } },
    children: { table: { disable: true } },
    onActivePageChange: { action: 'activePage changed' },
    activePage: { table: { disable: true } },
    opts: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    'aria-label': {
      control: 'text' as const,
      description: 'Required screen-reader label for the carousel region.',
      table: { category: 'Root' },
    },
    loop: {
      control: 'boolean' as const,
      description: 'Wrap prev/next and autoplay from last slide to first.',
      table: { category: 'Root', defaultValue: { summary: 'false' } },
    },
    autoPlay: {
      control: 'select' as const,
      options: AUTOPLAY_OPTIONS,
      description: 'Autoplay interval in ms; `false` disables autoplay.',
      table: { category: 'Root', defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean' as const,
      description: 'Edge-to-edge viewport; required for on-media selection rail in full-bleed layouts.',
      table: { category: 'Root', defaultValue: { summary: 'false' } },
    },
    followsAspectRatio: {
      control: 'boolean' as const,
      description: 'Figma `followsAspectRatio`. When false, slides use `height`.',
      table: { category: 'Root', defaultValue: { summary: 'true' } },
    },
    height: {
      control: 'number' as const,
      description: 'Fixed slide height (px) when `followsAspectRatio={false}`. Min 300.',
      table: { category: 'Root', defaultValue: { summary: '480' } },
      if: { arg: 'followsAspectRatio', eq: false },
    },
    aspectRatio: {
      control: 'select' as const,
      options: [...aspectOptions, 'flexible'] as CarouselImageAspectRatio[],
      description: 'Figma `.CarouselImage/*` shared slide aspect ratio.',
      table: { category: 'Root', defaultValue: { summary: defaultAspect } },
    },
    defaultActivePage: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: 'Initial visible page — Figma 1-based (min 1).',
      table: { category: 'Root', defaultValue: { summary: '1' } },
    },
    controls: {
      control: 'boolean' as const,
      description: 'Figma `controls` — when false, hides all control chrome.',
      table: { category: 'Preset wrapper', defaultValue: { summary: 'false' } },
    },
    controlsType: {
      control: 'select' as const,
      options: CONTROLS_TYPE_OPTIONS,
      description: 'Figma `controlsType` — applies only when `controls={true}`.',
      table: { category: 'Preset wrapper', defaultValue: { summary: defaultControlsType } },
      if: { arg: 'controls', eq: true },
    },
    showNav: {
      control: 'boolean' as const,
      description: 'Show prev/next buttons in preset control chrome.',
      table: { category: 'Preset wrapper', defaultValue: { summary: 'true' } },
    },
    splitControls: {
      control: 'boolean' as const,
      description: 'Split layout — indicators start, nav buttons end.',
      table: { category: 'Preset wrapper', defaultValue: { summary: 'true' } },
    },
    paginationAutoplay: {
      control: 'boolean' as const,
      description: 'Figma pagination `autoplay` — show play/pause beside dots when root autoplay is enabled.',
      table: { category: 'Controls', defaultValue: { summary: 'false' } },
    },
    itemCount: {
      control: { type: 'number', min: 1, max: DEMO_SLIDES.length, step: 1 },
      description: 'Story helper — number of demo slides to render.',
      table: { category: 'Story helpers', defaultValue: { summary: '4' } },
    },
    selectionRailCount: {
      control: { type: 'number', min: 1, max: DEMO_SLIDES.length, step: 1 },
      description: 'Story helper — thumbnail count for selection rail variants.',
      table: { category: 'Story helpers', defaultValue: { summary: '4' } },
    },
    content: {
      control: 'boolean' as const,
      description: 'Figma `content` visibility on Slide.Content.',
      table: { category: 'Slide composition', defaultValue: { summary: 'false' } },
    },
    contentAlignment: {
      control: 'select' as const,
      options: CONTENT_ALIGNMENT_OPTIONS,
      description: 'Figma `contentAlignment` on Slide.Content.',
      table: {
        category: 'Slide composition',
        defaultValue: {
          summary: variant === 'Mobile' ? 'middleBottom' : 'startBottom',
        },
      },
    },
    contentWidth: {
      control: 'select' as const,
      options: CONTENT_WIDTH_OPTIONS,
      description: 'Figma `contentWidth` (`fill | s | m | l`).',
      table: {
        category: 'Slide composition',
        defaultValue: { summary: variant === 'Mobile' ? 'fill' : 's' },
      },
    },
    buttonWidth: {
      control: 'select' as const,
      options: ['hug', 'wide'] as const,
      description: 'Figma `buttonWidth` on Slide.ButtonGroup.',
      table: {
        category: 'Slide composition',
        defaultValue: { summary: variant === 'Mobile' ? 'wide' : 'hug' },
      },
    },
    scrim: {
      control: 'boolean' as const,
      description: 'Slide.Image scrim — bottom gradient for text legibility.',
      table: { category: 'Slide composition', defaultValue: { summary: 'true' } },
    },
    showBadge: {
      control: 'boolean' as const,
      description: 'Story helper — render demo badge in slide chrome (not a Figma prop).',
      table: { category: 'Story helpers', defaultValue: { summary: 'false' } },
    },
    badgesStart: {
      control: 'boolean' as const,
      description: 'Figma `badgesStart` — show start-corner badge slot.',
      table: { category: 'Slide composition', defaultValue: { summary: 'false' } },
    },
    badgesEnd: {
      control: 'boolean' as const,
      description: 'Figma `badgesEnd` — show end-corner badge slot.',
      table: { category: 'Slide composition', defaultValue: { summary: 'false' } },
    },
    badgesMiddle: {
      control: 'boolean' as const,
      description: 'Figma `badgesMiddle` — show middle badge row in content.',
      table: { category: 'Slide composition', defaultValue: { summary: 'false' } },
    },
    playButton: {
      control: 'boolean' as const,
      description: 'Figma `playButton` — show play control in end corner.',
      table: { category: 'Slide composition', defaultValue: { summary: 'false' } },
    },
  };
}

/** Shared parameters/argTypes for root + Desktop / Tablet / Mobile autodocs. */
export function getCarouselStoryOptions(
  variant: VariantLabel,
): Pick<Meta<typeof Carousel.Desktop>, 'parameters' | 'argTypes' | 'args' | 'decorators'> {
  const backgrounds = {
    default: 'dark',
    values: [
      { name: 'dark', value: 'var(--Surface-Bold)' },
      { name: 'light', value: 'var(--Surface-Default)' },
    ],
  };

  const sharedArgs = { onActivePageChange: fn() };

  if (variant === 'Root') {
    return {
      args: sharedArgs,
      decorators: [withCarouselDocsLayout],
      parameters: {
        layout: 'padded',
        docs: {
          description: {
            component:
              'Multi-brand carousel micropattern. Use **Playground** for Figma-default props. Named variant stories apply `CAROUSEL_DEMO_STORY_OVERRIDES` for visual demos only. See MIGRATION.md for intentional React deviations (`pageCount`, `defaultActivePage`).',
          },
        },
        backgrounds,
      },
      argTypes: buildCarouselArgTypes(
        'Root',
        CAROUSEL_IMAGE_ASPECT_RATIOS,
        CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
        CAROUSEL_DESKTOP_PRESET.defaultControlsType,
      ),
    };
  }

  const presetMeta = VARIANT_PRESET_META[variant];

  return {
    args: sharedArgs,
    decorators: [withCarouselDocsLayout],
    parameters: {
      layout: 'padded',
      docs: {
        description: {
          component: `${VARIANT_DOCS[variant]} Use the **Default** story controls for Figma-default props. Named variant stories apply \`CAROUSEL_DEMO_STORY_OVERRIDES\` for visual demos only.`,
        },
      },
      backgrounds,
    },
    argTypes: buildCarouselArgTypes(
      variant,
      presetMeta.aspectRatios,
      presetMeta.defaultAspectRatio,
      presetMeta.defaultControlsType,
    ),
  };
}
