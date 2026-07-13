'use client';

import React from 'react';
import { Carousel } from '../Carousel';
import { Button } from '../../Button/Button';
import { IconButton } from '../../IconButton/IconButton';
import { Badge } from '../../Badge/Badge';
import { Surface } from '../../Surface/Surface';
import type {
  CarouselAlignment,
  CarouselAspectRatio,
  CarouselContentWidth,
} from '../Carousel.shared';

// Demo images live in `apps/storybook/public/carousel-demo/` and are served
// at the root by Storybook's static-asset pipeline. They're scoped to
// stories — adopters supply their own assets.
export const DEMO_SLIDES: Array<{
  src: string;
  alt: string;
  badge: string;
  title: string;
  body: string;
  primaryAction: string;
  secondaryAction: string;
}> = [
  {
    src: '/carousel-demo/slide-1.jpg',
    alt: 'Bride at a celebration sharing the moment with family',
    badge: 'Featured',
    title: 'Live every moment',
    body: 'Capture and stream the day in crisp 4K with JioCloud.',
    primaryAction: 'Start free',
    secondaryAction: 'Learn more',
  },
  {
    src: '/carousel-demo/slide-2.jpg',
    alt: 'Shopkeeper at a textile store on a phone call',
    badge: 'Stories',
    title: 'Powered by JioOne',
    body: 'Hear how local sellers reach more customers every day.',
    primaryAction: 'Watch story',
    secondaryAction: 'Add to list',
  },
  {
    src: '/carousel-demo/slide-3.jpg',
    alt: 'JioBharat 4G phone held in hand against a yellow background',
    badge: 'New',
    title: 'JioBharat',
    body: '4G calling, voice apps, and unlimited data from ₹999.',
    primaryAction: 'Buy now',
    secondaryAction: 'Compare',
  },
  {
    src: '/carousel-demo/slide-4.jpg',
    alt: 'Jio-branded device in red on a red background',
    badge: 'Limited',
    title: 'Meet the new Jio hub',
    body: 'Always-on connectivity for your home, on a single subscription.',
    primaryAction: 'Pre-order',
    secondaryAction: 'Specs',
  },
  {
    src: '/carousel-demo/slide-5.jpg',
    alt: 'Two friends sharing photos on a phone in a colourful alley',
    badge: 'Trending',
    title: 'Share what matters',
    body: 'Send photos, videos, and voice notes — together, instantly.',
    primaryAction: 'Get the app',
    secondaryAction: 'Tour features',
  },
];

/** Composition variant — keeps stories visually simple by default; the
 *  Watch + Add + Share full combo is only used in ContentCompositions/promo. */
export type DemoCompositionVariant = 'minimal' | 'standard' | 'promo';

/** Where to render the badge — never both at once. Default is 'content'
 *  (above the headline). 'corner' moves it to the top-left slot. */
export type DemoBadgePosition = 'content' | 'corner' | 'none';

export interface DemoSlideProps {
  index: number;
  aspectRatio?: CarouselAspectRatio;
  alignment?: CarouselAlignment;
  width?: CarouselContentWidth;
  scrim?: boolean;
  badgePosition?: DemoBadgePosition;
  withCornerEnd?: boolean;
  /** Default 'standard' = badge + headline + body + 1 button. */
  variant?: DemoCompositionVariant;
}

export function DemoSlide({
  index,
  aspectRatio = '16:9',
  alignment = 'startBottom',
  width = 'm',
  scrim = true,
  badgePosition = 'content',
  withCornerEnd = false,
  variant = 'standard',
}: DemoSlideProps) {
  const slide = DEMO_SLIDES[index % DEMO_SLIDES.length];
  return (
    <Carousel.Slide
      aspectRatio={aspectRatio}
      surface="bold"
      badgesStart={badgePosition === 'corner'}
      badgesEnd={withCornerEnd}
      playButton={withCornerEnd}
    >
      <Carousel.Slide.Image src={slide.src} alt={slide.alt} scrim={scrim} />
      {badgePosition === 'corner' && (
        <Carousel.Slide.Corner placement="start">
          <Badge appearance="sparkle" aria-label={slide.badge}>
            {slide.badge}
          </Badge>
        </Carousel.Slide.Corner>
      )}
      {withCornerEnd && (
        <Carousel.Slide.Corner placement="end">
          <Carousel.PlayButton />
        </Carousel.Slide.Corner>
      )}
      <Carousel.Slide.Content
        content
        contentAlignment={alignment}
        contentWidth={width}
        badgesMiddle={badgePosition === 'content'}
      >
        {badgePosition === 'content' && (
          <Badge appearance="sparkle" aria-label={slide.badge}>
            {slide.badge}
          </Badge>
        )}
        <h3>{slide.title}</h3>
        {variant !== 'minimal' && <p>{slide.body}</p>}
        {variant === 'standard' && (
          <Carousel.Slide.ButtonGroup orientation="horizontal" width="hug">
            <Button attention="high">{slide.primaryAction}</Button>
          </Carousel.Slide.ButtonGroup>
        )}
        {variant === 'promo' && (
          <Carousel.Slide.ButtonGroup orientation="horizontal" width="hug">
            <Button attention="high">{slide.primaryAction}</Button>
            <Button attention="medium">{slide.secondaryAction}</Button>
            <IconButton attention="low" icon="share" aria-label="Share" />
          </Carousel.Slide.ButtonGroup>
        )}
      </Carousel.Slide.Content>
    </Carousel.Slide>
  );
}

/**
 * Default demo carousel. Controls render in the split layout (indicators
 * left, prev/next clustered right) per the Figma source — we don't ship
 * the dots-between-arrows centered layout.
 */
export function DemoCarousel({
  ariaLabel = 'Featured content',
  count = DEMO_SLIDES.length,
  startAt = 0,
  aspectRatio = '16:9',
  alignment = 'startBottom',
  width = 'm',
  scrim = true,
  badgePosition = 'content',
  withCornerEnd = false,
  variant = 'standard',
  controls = 'below',
  loop = false,
  autoPlay = false as number | false,
  fullWidth = false,
  peek = 'none' as 'none' | 'prev' | 'next' | 'both',
}: {
  ariaLabel?: string;
  count?: number;
  /** Starting offset into DEMO_SLIDES — different stories pick different
   *  starting slides so the showcase doesn't always lead with the same image. */
  startAt?: number;
  aspectRatio?: CarouselAspectRatio;
  alignment?: CarouselAlignment;
  width?: CarouselContentWidth;
  scrim?: boolean;
  badgePosition?: DemoBadgePosition;
  withCornerEnd?: boolean;
  variant?: DemoCompositionVariant;
  controls?: 'below' | 'onMedia' | 'none';
  loop?: boolean;
  autoPlay?: number | false;
  fullWidth?: boolean;
  peek?: 'none' | 'prev' | 'next' | 'both';
}) {
  return (
    <Carousel.Root
      aria-label={ariaLabel}
      opts={{ loop, peek }}
      autoPlay={autoPlay}
      fullWidth={fullWidth}
    >
      <Carousel.Viewport peek={peek}>
        <Carousel.Track>
          {Array.from({ length: count }).map((_, i) => (
            <DemoSlide
              key={i}
              index={i + startAt}
              aspectRatio={aspectRatio}
              alignment={alignment}
              width={width}
              scrim={scrim}
              badgePosition={badgePosition}
              withCornerEnd={withCornerEnd}
              variant={variant}
            />
          ))}
        </Carousel.Track>
        {controls === 'onMedia' && (
          <Carousel.Controls placement="onMedia" layout="split">
            <Carousel.IndicatorList />
            <Carousel.PrevButton />
            <Carousel.NextButton />
          </Carousel.Controls>
        )}
      </Carousel.Viewport>
      {controls === 'below' && (
        <Carousel.Controls placement="below" layout="split">
          <Carousel.IndicatorList />
          <Carousel.PrevButton />
          <Carousel.NextButton />
        </Carousel.Controls>
      )}
    </Carousel.Root>
  );
}

export function CarouselAdoptionMatrix() {
  const captionStyle: React.CSSProperties = {
    fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
    color: 'var(--Text-Low)',
    fontSize: 'var(--Label-XS-FontSize)',
    lineHeight: 'var(--Label-XS-LineHeight)',
    marginBlockEnd: 'var(--Spacing-3-5)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <Surface mode="default">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={captionStyle}>On default surface · controls below</p>
          <DemoCarousel ariaLabel="Default surface carousel" startAt={0} />
        </div>
      </Surface>
      <Surface mode="subtle">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={captionStyle}>On subtle surface · controls on media</p>
          <DemoCarousel ariaLabel="Subtle surface carousel" controls="onMedia" startAt={2} />
        </div>
      </Surface>
      <Surface mode="bold">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={captionStyle}>On bold surface · peek both</p>
          <DemoCarousel ariaLabel="Bold surface carousel" peek="both" startAt={4} />
        </div>
      </Surface>
    </div>
  );
}
