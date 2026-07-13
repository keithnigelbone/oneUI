/**
 * Carousel.showcase.native.tsx — peer of Carousel.stories.tsx / Carousel.showcase.tsx
 *
 * Demo images are bundled under `apps/native-components-sample/assets/carousel-demo/`
 * and mirrored in `apps/storybook/public/carousel-demo/` for web Storybook.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@oneui/tokens';
import { Badge } from '../Badge/Badge.native';
import { Button } from '../Button/Button.native';
import { IconButton } from '../IconButton/IconButton.native';
import { Text as OneUIText } from '../Text/Text.native';
import { Surface, useSurfaceTokens, useTypographyTokens, typographyToTextStyle } from '../../theme';
import { CAROUSEL_DEMO_IMAGE_SOURCES } from './carouselDemoAssets.native';
import { Carousel } from './Carousel.native';
import { CarouselSlideBody, CarouselSlideHeadline } from './carouselSlideContentText.native';
import type {
  CarouselAlignment,
  CarouselContentWidth,
  CarouselImageAspectRatio,
  CarouselSlideScrim,
} from './interface';
import { CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO, CAROUSEL_IMAGE_ASPECT_RATIOS } from './interface';

/** Same slide copy as `Carousel.showcase.tsx`; `src` uses bundled assets on native. */
export const DEMO_SLIDES: Array<{
  src: ImageSourcePropType;
  alt: string;
  badge: string;
  title: string;
  body: string;
  primaryAction: string;
  secondaryAction: string;
}> = [
  {
    src: CAROUSEL_DEMO_IMAGE_SOURCES[0],
    alt: 'Bride at a celebration sharing the moment with family',
    badge: 'Featured',
    title: 'Live every moment',
    body: 'Capture and stream the day in crisp 4K with JioCloud.',
    primaryAction: 'Start free',
    secondaryAction: 'Learn more',
  },
  {
    src: CAROUSEL_DEMO_IMAGE_SOURCES[1],
    alt: 'Shopkeeper at a textile store on a phone call',
    badge: 'Stories',
    title: 'Powered by JioOne',
    body: 'Hear how local sellers reach more customers every day.',
    primaryAction: 'Watch story',
    secondaryAction: 'Add to list',
  },
  {
    src: CAROUSEL_DEMO_IMAGE_SOURCES[2],
    alt: 'JioBharat 4G phone held in hand against a yellow background',
    badge: 'New',
    title: 'JioBharat',
    body: '4G calling, voice apps, and unlimited data from ₹999.',
    primaryAction: 'Buy now',
    secondaryAction: 'Compare',
  },
  {
    src: CAROUSEL_DEMO_IMAGE_SOURCES[3],
    alt: 'Jio-branded device in red on a red background',
    badge: 'Limited',
    title: 'Meet the new Jio hub',
    body: 'Always-on connectivity for your home, on a single subscription.',
    primaryAction: 'Pre-order',
    secondaryAction: 'Specs',
  },
  {
    src: CAROUSEL_DEMO_IMAGE_SOURCES[4],
    alt: 'Two friends sharing photos on a phone in a colourful alley',
    badge: 'Trending',
    title: 'Share what matters',
    body: 'Send photos, videos, and voice notes — together, instantly.',
    primaryAction: 'Get the app',
    secondaryAction: 'Tour features',
  },
];

export type DemoCompositionVariant = 'minimal' | 'standard' | 'promo';
export type DemoBadgePosition = 'content' | 'corner' | 'none';
type DemoControls = 'below' | 'onMedia' | 'none';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['6'],
  width: '100%',
};

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const labelTypo = useTypographyTokens('label', 'S', { emphasis: 'medium' });
  return (
    <OneUIText
      style={StyleSheet.flatten([
        typographyToTextStyle(labelTypo),
        { color: role.content.low, marginBottom: tokens.spacing['3-5'] },
      ])}
    >
      {children}
    </OneUIText>
  );
}

function SlideTitle({ children }: { children: string }): React.ReactElement {
  return <CarouselSlideHeadline>{children}</CarouselSlideHeadline>;
}

function SlideBody({ children }: { children: string }): React.ReactElement {
  return <CarouselSlideBody>{children}</CarouselSlideBody>;
}

export interface DemoSlideProps {
  index: number;
  imageAspectRatio?: CarouselImageAspectRatio;
  alignment?: CarouselAlignment;
  width?: CarouselContentWidth;
  scrim?: CarouselSlideScrim;
  badgePosition?: DemoBadgePosition;
  withCornerEnd?: boolean;
  variant?: DemoCompositionVariant;
  buttonWidth?: 'hug' | 'wide';
}

export function DemoSlide({
  index,
  imageAspectRatio,
  alignment = 'startBottom',
  width = 'm',
  scrim = true,
  badgePosition = 'none',
  withCornerEnd = false,
  variant = 'standard',
  buttonWidth = 'hug',
}: DemoSlideProps): React.ReactElement {
  const slide = DEMO_SLIDES[index % DEMO_SLIDES.length];
  return (
    <Carousel.Item surface="bold">
      <Carousel.Item.Image
        src={slide.src}
        alt={slide.alt}
        {...(imageAspectRatio != null ? { aspectRatio: imageAspectRatio } : {})}
        scrim={scrim}
      />
      {badgePosition === 'corner' ? (
        <Carousel.Item.BadgeRow placement="start">
          <Badge appearance="sparkle">{slide.badge}</Badge>
        </Carousel.Item.BadgeRow>
      ) : null}
      {withCornerEnd ? (
        <Carousel.Item.BadgeRow placement="end">
          <Carousel.PlayButton />
        </Carousel.Item.BadgeRow>
      ) : null}
      <Carousel.Item.Content alignment={alignment} width={width}>
        {badgePosition === 'content' ? <Badge appearance="sparkle">{slide.badge}</Badge> : null}
        <SlideTitle>{slide.title}</SlideTitle>
        {variant !== 'minimal' ? <SlideBody>{slide.body}</SlideBody> : null}
        {variant === 'standard' ? (
          <Carousel.Item.ButtonGroup orientation="horizontal" width={buttonWidth}>
            <Button attention="high">{slide.primaryAction}</Button>
          </Carousel.Item.ButtonGroup>
        ) : null}
        {variant === 'promo' ? (
          <Carousel.Item.ButtonGroup orientation="horizontal" width="hug">
            <Button attention="high">{slide.primaryAction}</Button>
            <Button attention="medium">{slide.secondaryAction}</Button>
            <IconButton attention="low" icon="share" aria-label="Share" />
          </Carousel.Item.ButtonGroup>
        ) : null}
      </Carousel.Item.Content>
    </Carousel.Item>
  );
}

export interface DemoCarouselProps {
  ariaLabel?: string;
  count?: number;
  startAt?: number;
  imageAspectRatio?: CarouselImageAspectRatio;
  alignment?: CarouselAlignment;
  width?: CarouselContentWidth;
  scrim?: CarouselSlideScrim;
  badgePosition?: DemoBadgePosition;
  withCornerEnd?: boolean;
  variant?: DemoCompositionVariant;
  buttonWidth?: 'hug' | 'wide';
  controls?: DemoControls;
  loop?: boolean;
  autoPlay?: number | false;
  fullWidth?: boolean;
  height?: number;
  /** Showcase toggle: whether to compose nav arrows into the controls. */
  showNavButtons?: boolean;
}

export function DemoCarousel({
  ariaLabel = 'Carousel',
  count = DEMO_SLIDES.length,
  startAt = 0,
  imageAspectRatio = CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  alignment = 'startBottom',
  width = 'm',
  scrim = true,
  badgePosition = 'none',
  withCornerEnd = false,
  variant = 'standard',
  buttonWidth = 'hug',
  controls = 'below',
  loop = false,
  autoPlay = false,
  fullWidth = false,
  height,
  showNavButtons = false,
}: DemoCarouselProps): React.ReactElement {
  return (
    <Carousel
      aria-label={ariaLabel}
      loop={loop}
      autoPlay={autoPlay}
      fullWidth={fullWidth}
      aspectRatio={imageAspectRatio}
      height={height}
    >
      <Carousel.Rail>
        {Array.from({ length: count }).map((_, i) => (
          <DemoSlide
            key={i}
            index={i + startAt}
            alignment={alignment}
            width={width}
            scrim={scrim}
            badgePosition={badgePosition}
            withCornerEnd={withCornerEnd}
            variant={variant}
            buttonWidth={buttonWidth}
          />
        ))}
      </Carousel.Rail>
      {controls === 'onMedia' ? (
        <Carousel.Controls placement="onMedia" layout="center" paginationAlign="middle">
          <Carousel.IndicatorList />
          {showNavButtons ? <Carousel.PrevButton /> : null}
          {showNavButtons ? <Carousel.NextButton /> : null}
        </Carousel.Controls>
      ) : null}
      {controls === 'below' ? (
        <Carousel.Controls placement="below" layout="center">
          <Carousel.IndicatorList />
          {showNavButtons ? <Carousel.PrevButton /> : null}
          {showNavButtons ? <Carousel.NextButton /> : null}
        </Carousel.Controls>
      ) : null}
    </Carousel>
  );
}

export function CarouselDefault(): React.ReactElement {
  return (
    <DemoCarousel
      ariaLabel="Default carousel"
      alignment="startBottom"
      width="fill"
      controls="none"
      buttonWidth="wide"
      count={DEMO_SLIDES.length}
      startAt={0}
      loop
    />
  );
}

export function CarouselImageAspectRatios(): React.ReactElement {
  const ratios: CarouselImageAspectRatio[] = [...CAROUSEL_IMAGE_ASPECT_RATIOS];
  return (
    <View style={column}>
      {ratios.map((ratio) => (
        <View key={ratio}>
          <SectionLabel>Image {ratio}</SectionLabel>
          <DemoCarousel
            ariaLabel={`Image aspect ${ratio}`}
            imageAspectRatio={ratio}
            count={3}
            width="fill"
          />
        </View>
      ))}
    </View>
  );
}

/** @deprecated Use {@link CarouselImageAspectRatios}. */
export function CarouselAspectRatios(): React.ReactElement {
  return <CarouselImageAspectRatios />;
}

export function CarouselAlignments(): React.ReactElement {
  const alignments: CarouselAlignment[] = [
    'startBottom',
    'startMiddle',
    'middleBottom',
    'middleMiddle',
    'middleTop',
  ];
  return (
    <View style={column}>
      {alignments.map((alignment) => {
        // Top-aligned content darkens from the top; others keep the default
        // bottom scrim.
        const scrim: CarouselSlideScrim | undefined = alignment.endsWith('Top')
          ? { position: 'top', size: 'XL', attention: 'high', variant: 'gradient' }
          : undefined;
        return (
          <View key={alignment}>
            <SectionLabel>Alignment {alignment}</SectionLabel>
            <DemoCarousel
              ariaLabel={`Alignment ${alignment}`}
              alignment={alignment}
              {...(scrim != null ? { scrim } : {})}
              count={3}
              startAt={1}
            />
          </View>
        );
      })}
    </View>
  );
}

export function CarouselContentWidthsStartBottom(): React.ReactElement {
  return <CarouselContentWidthsForAlignment alignment="startBottom" />;
}

function CarouselContentWidthsForAlignment({
  alignment,
  scrim,
}: {
  alignment: CarouselAlignment;
  scrim?: CarouselSlideScrim;
}): React.ReactElement {
  const widths: CarouselContentWidth[] = ['fill', 'l', 'm', 's'];
  const alignmentLabel = alignment.replace(/([A-Z])/g, ' $1').trim();
  return (
    <View style={column}>
      {widths.map((contentWidth) => (
        <View key={contentWidth}>
          <SectionLabel>
            {alignmentLabel} · width {contentWidth}
          </SectionLabel>
          <DemoCarousel
            ariaLabel={`${alignmentLabel} width ${contentWidth}`}
            alignment={alignment}
            width={contentWidth}
            {...(scrim != null ? { scrim } : {})}
            buttonWidth={contentWidth === 'fill' ? 'wide' : 'hug'}
            count={1}
            startAt={0}
            controls="none"
          />
        </View>
      ))}
    </View>
  );
}

export function CarouselContentWidthsStartMiddle(): React.ReactElement {
  return <CarouselContentWidthsForAlignment alignment="startMiddle" />;
}

export function CarouselContentWidthsMiddleBottom(): React.ReactElement {
  return <CarouselContentWidthsForAlignment alignment="middleBottom" />;
}

export function CarouselContentWidthsMiddleMiddle(): React.ReactElement {
  return <CarouselContentWidthsForAlignment alignment="middleMiddle" />;
}

export function CarouselContentWidthsMiddleTop(): React.ReactElement {
  // Content sits at the top, so darken from the top for legibility.
  return (
    <CarouselContentWidthsForAlignment
      alignment="middleTop"
      scrim={{ position: 'top', size: 'XL', attention: 'high', variant: 'gradient' }}
    />
  );
}

export function CarouselControlsShowcase(): React.ReactElement {
  const placements: DemoControls[] = ['below', 'onMedia', 'none'];
  return (
    <View style={column}>
      {placements.map((placement) => (
        <View key={placement}>
          <SectionLabel>Controls: {placement}</SectionLabel>
          <DemoCarousel
            ariaLabel={`Controls ${placement}`}
            controls={placement}
            count={3}
            startAt={3}
          />
        </View>
      ))}
    </View>
  );
}

export function CarouselPeek(): React.ReactElement {
  return (
    <View style={column}>
      <SectionLabel>Inset carousel (peek both) — fullWidth=false</SectionLabel>
      <DemoCarousel ariaLabel="Inset carousel" startAt={4} />
      <SectionLabel>Full-width carousel — fullWidth=true</SectionLabel>
      <DemoCarousel ariaLabel="Full width carousel" fullWidth startAt={4} />
    </View>
  );
}

export function CarouselAutoPlay(): React.ReactElement {
  return (
    <Carousel aria-label="Autoplaying carousel" autoPlay={4000} loop>
      <Carousel.Rail>
        {DEMO_SLIDES.map((_, i) => (
          <DemoSlide key={i} index={i} />
        ))}
      </Carousel.Rail>
      <Carousel.Controls placement="onMedia" layout="center" paginationAlign="middle">
        <Carousel.IndicatorList />
        <Carousel.PlayButton />
      </Carousel.Controls>
    </Carousel>
  );
}

export function CarouselSurfaceContext(): React.ReactElement {
  const modes = ['default', 'subtle', 'bold'] as const;
  return (
    <View style={column}>
      {modes.map((mode, i) => (
        <Surface key={mode} mode={mode} style={{ padding: tokens.spacing['4-5'] }}>
          <SectionLabel>On {mode} surface</SectionLabel>
          <DemoCarousel ariaLabel={`On ${mode}`} count={3} startAt={i} />
        </Surface>
      ))}
    </View>
  );
}

export function CarouselCentered(): React.ReactElement {
  return (
    <DemoCarousel ariaLabel="Centred content" alignment="middleMiddle" width="m" startAt={2} />
  );
}

const SELECTION_RAIL_ITEMS = DEMO_SLIDES.map((slide) => ({
  src: slide.src,
  alt: slide.alt,
}));

function SelectionRailCarousel({
  onMedia,
  size = 's',
  ariaLabel,
  showNavButtons = false,
  controlsLayout = 'center',
  fullWidth = false,
  alignment = 'startBottom',
  width = 'm',
  imageAspectRatio = CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  buttonWidth = 'hug',
  count = 5,
  startAt = 0,
}: {
  onMedia: boolean;
  size?: 's' | 'm' | 'l' | 'xl' | '2xl';
  ariaLabel: string;
  showNavButtons?: boolean;
  controlsLayout?: 'center' | 'split';
  fullWidth?: boolean;
  alignment?: CarouselAlignment;
  width?: CarouselContentWidth;
  imageAspectRatio?: CarouselImageAspectRatio;
  buttonWidth?: 'hug' | 'wide';
  count?: number;
  startAt?: number;
}): React.ReactElement {
  const navButtons = showNavButtons ? (
    <>
      <Carousel.PrevButton />
      <Carousel.NextButton />
    </>
  ) : null;

  return (
    <Carousel aria-label={ariaLabel} fullWidth={fullWidth} aspectRatio={imageAspectRatio}>
      <Carousel.Rail>
        {Array.from({ length: count }).map((_, i) => (
          <DemoSlide
            key={i}
            index={i + startAt}
            alignment={alignment}
            width={width}
            buttonWidth={buttonWidth}
          />
        ))}
      </Carousel.Rail>
      {onMedia ? (
        <Carousel.Controls placement="onMedia" layout="center" paginationAlign="middle">
          <Carousel.SelectionRail size={size} items={SELECTION_RAIL_ITEMS.slice(0, count)} />
          {navButtons}
        </Carousel.Controls>
      ) : null}
      {!onMedia ? (
        <Carousel.Controls placement="below" layout={controlsLayout}>
          <Carousel.SelectionRail size={size} items={SELECTION_RAIL_ITEMS.slice(0, count)} />
          {navButtons}
        </Carousel.Controls>
      ) : null}
    </Carousel>
  );
}

export function CarouselSelectionRailShowcase(): React.ReactElement {
  return (
    <View style={column}>
      <SectionLabel>Selection rail · on media (transparent)</SectionLabel>
      <SelectionRailCarousel
        onMedia
        ariaLabel="Selection rail on media"
        size="m"
        imageAspectRatio="1:1"
      />
      <SectionLabel>Selection rail · below media (opaque)</SectionLabel>
      <SelectionRailCarousel
        onMedia={false}
        ariaLabel="Selection rail below media"
        size="2xl"
        imageAspectRatio="1:1"
      />
    </View>
  );
}

/** Default carousel layout + below-media selection rail (no arrows). */
export function CarouselSelectionRailDefaultShowcase(): React.ReactElement {
  return (
    <SelectionRailCarousel
      onMedia={false}
      ariaLabel="Default carousel with selection rail below"
      size="m"
      alignment="startBottom"
      width="fill"
      buttonWidth="wide"
      imageAspectRatio={CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO}
      count={DEMO_SLIDES.length}
      startAt={0}
    />
  );
}

const FIGMA_2818_50672_BODY = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

/**
 * Figma `.Rail/heightFollowsAspectRatio/selectionRailOnMediaTrue/mobileTrue`
 * `fullWidth=true` · `contentAlignment=startMiddle` · `2818:50672`.
 */
export function CarouselFigma281850672(): React.ReactElement {
  const railItems = SELECTION_RAIL_ITEMS.slice(0, 5);
  return (
    <View style={column}>
      <SectionLabel>
        Figma 2818:50672 · fullWidth · 3:4 image · startMiddle · fill · scrim · onMedia
        selectionRail size m
      </SectionLabel>
      <Carousel aria-label="Figma 2818:50672 selection rail on media" fullWidth aspectRatio="3:4">
        <Carousel.Rail>
          {DEMO_SLIDES.slice(0, 5).map((slide) => (
            <Carousel.Item key={slide.title} surface="bold">
              <Carousel.Item.Image src={slide.src} alt={slide.alt} />
              <Carousel.Item.Content alignment="startMiddle" width="fill">
                <SlideTitle>Title</SlideTitle>
                <SlideBody>{FIGMA_2818_50672_BODY}</SlideBody>
                <Carousel.Item.ButtonGroup orientation="horizontal" width="hug">
                  <Button attention="high">Button</Button>
                </Carousel.Item.ButtonGroup>
              </Carousel.Item.Content>
            </Carousel.Item>
          ))}
        </Carousel.Rail>
        <Carousel.Controls placement="onMedia" layout="center">
          <Carousel.SelectionRail size="m" items={railItems} />
        </Carousel.Controls>
      </Carousel>
    </View>
  );
}

function PaginationOnMediaCarousel({
  paginationAlign,
  ariaLabel,
}: {
  paginationAlign: 'middle' | 'end';
  ariaLabel: string;
}): React.ReactElement {
  return (
    <Carousel aria-label={ariaLabel} aspectRatio="16:9" loop>
      <Carousel.Rail>
        {DEMO_SLIDES.slice(0, 5).map((slide) => (
          <Carousel.Item key={slide.title} surface="bold">
            <Carousel.Item.Image src={slide.src} alt={slide.alt} scrim />
            <Carousel.Item.Content alignment="startBottom" width="m">
              <SlideTitle>{slide.title}</SlideTitle>
            </Carousel.Item.Content>
          </Carousel.Item>
        ))}
      </Carousel.Rail>
      <Carousel.Controls placement="onMedia" layout="center" paginationAlign={paginationAlign}>
        <Carousel.IndicatorList />
      </Carousel.Controls>
    </Carousel>
  );
}

/**
 * Figma pagination controls — below `2775:10878`, on-media `2775:10745`.
 */
export function CarouselFigmaPaginationParity(): React.ReactElement {
  return (
    <View style={column}>
      <SectionLabel>Figma 2775:10878 · below · pagination centred · 5+ loop</SectionLabel>
      <DemoCarousel
        ariaLabel="Figma below pagination"
        controls="below"
        count={5}
        loop
        imageAspectRatio="16:9"
      />
      <SectionLabel>Figma 2775:10878 · below · autoplay + pagination</SectionLabel>
      <Carousel
        aria-label="Figma below autoplay pagination"
        autoPlay={4000}
        loop
        aspectRatio="16:9"
      >
        <Carousel.Rail>
          {DEMO_SLIDES.slice(0, 5).map((slide, slideIndex) => (
            <DemoSlide key={slide.title} index={slideIndex} />
          ))}
        </Carousel.Rail>
        <Carousel.Controls placement="below" layout="center">
          <Carousel.PlayButton />
          <Carousel.IndicatorList />
        </Carousel.Controls>
      </Carousel>
      <SectionLabel>Figma 2775:10745 · on media · pagination middle</SectionLabel>
      <PaginationOnMediaCarousel
        paginationAlign="middle"
        ariaLabel="Figma on-media pagination middle"
      />
      <SectionLabel>Figma 2775:10745 · on media · pagination end</SectionLabel>
      <PaginationOnMediaCarousel paginationAlign="end" ariaLabel="Figma on-media pagination end" />
    </View>
  );
}

export function CarouselBadges(): React.ReactElement {
  const positions: Array<{ label: string; badgePosition: Exclude<DemoBadgePosition, 'none'> }> = [
    { label: 'in Slide.Content', badgePosition: 'content' },
    { label: 'in Item.BadgeRow (start)', badgePosition: 'corner' },
  ];
  return (
    <View style={column}>
      {positions.map(({ label, badgePosition }) => (
        <View key={badgePosition}>
          <SectionLabel>Badge {label}</SectionLabel>
          <DemoCarousel
            ariaLabel={`Badge ${badgePosition}`}
            badgePosition={badgePosition}
            count={3}
            startAt={0}
          />
        </View>
      ))}
      <View>
        <SectionLabel>Badge in content · middleMiddle alignment</SectionLabel>
        <DemoCarousel
          ariaLabel="Badge content centred"
          badgePosition="content"
          alignment="middleMiddle"
          count={1}
          startAt={1}
          controls="none"
        />
      </View>
    </View>
  );
}

export function CarouselContentCompositions(): React.ReactElement {
  return (
    <Carousel aria-label="Content compositions" aspectRatio="1:1" autoPlay={4000}>
      <Carousel.Rail>
        <Carousel.Item surface="bold">
          <Carousel.Item.Image src={DEMO_SLIDES[0].src} alt={DEMO_SLIDES[0].alt} scrim />
          <Carousel.Item.Content alignment="startBottom" width="m">
            <SlideTitle>{DEMO_SLIDES[0].title}</SlideTitle>
          </Carousel.Item.Content>
        </Carousel.Item>
        <Carousel.Item surface="bold">
          <Carousel.Item.Image src={DEMO_SLIDES[1].src} alt={DEMO_SLIDES[1].alt} scrim />
          <Carousel.Item.Content alignment="startBottom" width="m">
            <SlideTitle>{DEMO_SLIDES[1].title}</SlideTitle>
            <SlideBody>{DEMO_SLIDES[1].body}</SlideBody>
            <Carousel.Item.ButtonGroup orientation="horizontal" width="hug">
              <Button attention="high">{DEMO_SLIDES[1].primaryAction}</Button>
            </Carousel.Item.ButtonGroup>
          </Carousel.Item.Content>
        </Carousel.Item>
        <Carousel.Item surface="bold">
          <Carousel.Item.Image src={DEMO_SLIDES[2].src} alt={DEMO_SLIDES[2].alt} scrim />
          <Carousel.Item.BadgeRow placement="start">
            <Carousel.PlayButton />
          </Carousel.Item.BadgeRow>
          <Carousel.Item.Content alignment="startBottom" width="m">
            <SlideTitle>{DEMO_SLIDES[2].title}</SlideTitle>
            <SlideBody>{DEMO_SLIDES[2].body}</SlideBody>
            <Carousel.Item.ButtonGroup orientation="horizontal" width="hug">
              <Button attention="high">{DEMO_SLIDES[2].primaryAction}</Button>
              <Button attention="medium">{DEMO_SLIDES[2].secondaryAction}</Button>
              <IconButton attention="low" icon="share" aria-label="Share" />
            </Carousel.Item.ButtonGroup>
          </Carousel.Item.Content>
        </Carousel.Item>
      </Carousel.Rail>
      <Carousel.Controls placement="below" layout="split">
        <Carousel.IndicatorList />
        <Carousel.PrevButton />
        <Carousel.NextButton />
      </Carousel.Controls>
    </Carousel>
  );
}

export function CarouselAdoptionMatrix(): React.ReactElement {
  return (
    <View style={column}>
      <Surface mode="default" style={{ padding: tokens.spacing['4-5'] }}>
        <SectionLabel>On default surface · controls below</SectionLabel>
        <DemoCarousel ariaLabel="Default surface carousel" startAt={0} />
      </Surface>
      <Surface mode="subtle" style={{ padding: tokens.spacing['4-5'] }}>
        <SectionLabel>On subtle surface · controls on media</SectionLabel>
        <DemoCarousel ariaLabel="Subtle surface carousel" controls="onMedia" startAt={2} />
      </Surface>
      <Surface mode="bold" style={{ padding: tokens.spacing['4-5'] }}>
        <SectionLabel>On bold surface · inset carousel</SectionLabel>
        <DemoCarousel ariaLabel="Bold surface carousel" startAt={4} />
      </Surface>
    </View>
  );
}
