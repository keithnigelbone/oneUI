'use client';

import React, { Children, createContext, isValidElement, useContext } from 'react';
import clsx from 'clsx';
import styles from '../Carousel.module.css';
import { Scrim } from '../../Scrim/Scrim';
import { useCarousel } from './Carousel.context';
import {
  normalizeCarouselButtonWidth,
  resolveCarouselHeightCSSValue,
  resolveCarouselSlideScrimProps,
  type CarouselAlignment,
  type CarouselAspectRatio,
  type CarouselButtonOrientation,
  type CarouselButtonWidth,
  type CarouselButtonWidthAlias,
  type CarouselContentWidth,
  type CarouselCornerPlacement,
  type CarouselImageAspectRatio,
  type CarouselSlideScrim,
  type CarouselSurface,
} from '../Carousel.shared';

const SlideSurfaceContext = createContext<CarouselSurface>('bold');

interface SlideChromeState {
  badgesStart: boolean;
  badgesEnd: boolean;
  badgesMiddle: boolean;
  playButton: boolean;
  buttonSecondary: boolean;
  iconButtonSecondary: boolean;
  contentVisible: boolean;
}

const SlideChromeContext = createContext<SlideChromeState>({
  badgesStart: false,
  badgesEnd: false,
  badgesMiddle: false,
  playButton: false,
  buttonSecondary: false,
  iconButtonSecondary: false,
  contentVisible: false,
});

export interface CarouselSlideProps {
  aspectRatio?: CarouselAspectRatio;
  height?: number | string;
  surface?: CarouselSurface;
  /** Figma `badgesStart` visibility (default `false`). */
  badgesStart?: boolean;
  /** Figma `badgesEnd` visibility (default `false`). */
  badgesEnd?: boolean;
  /** Figma `playButton` visibility (default `false`). */
  playButton?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function SlideRoot({
  aspectRatio: aspectRatioProp,
  height: heightProp,
  surface = 'bold',
  badgesStart = false,
  badgesEnd = false,
  playButton = false,
  'aria-label': ariaLabel = 'Slide',
  className,
  style,
  children,
  ref,
}: CarouselSlideProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    aspectRatio: rootAspectRatio = '16:9',
    height: rootHeight,
    followsAspectRatio,
    slideWidth,
  } = useCarousel();

  const heightCss =
    heightProp !== undefined
      ? resolveCarouselHeightCSSValue(heightProp)
      : followsAspectRatio
        ? undefined
        : rootHeight;
  const aspectRatio = aspectRatioProp ?? rootAspectRatio;
  const usesCustomHeight =
    Boolean(heightCss) || followsAspectRatio === false || aspectRatio === 'flexible';

  const chrome = useContext(SlideChromeContext);
  const mergedChrome: SlideChromeState = {
    ...chrome,
    badgesStart,
    badgesEnd,
    playButton,
  };

  const styleResolved: React.CSSProperties = {
    ...style,
    ...(heightCss ? { height: heightCss } : {}),
    ...(slideWidth > 0
      ? {
          flexBasis: slideWidth,
          width: slideWidth,
          minWidth: slideWidth,
          maxWidth: slideWidth,
        }
      : {}),
  };

  return (
    <SlideChromeContext.Provider value={mergedChrome}>
      <SlideSurfaceContext.Provider value={surface}>
        <div
          ref={ref}
          role="group"
          aria-roledescription="slide"
          aria-label={ariaLabel}
          className={clsx(styles.slide, className)}
          style={styleResolved}
          data-aspect={usesCustomHeight ? 'custom' : aspectRatio}
          data-badges-start={badgesStart ? undefined : 'false'}
          data-badges-end={badgesEnd ? undefined : 'false'}
          data-play-button={playButton ? undefined : 'false'}
        >
          {children}
        </div>
      </SlideSurfaceContext.Provider>
    </SlideChromeContext.Provider>
  );
}

export interface CarouselSlideImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'children'> {
  src: string;
  alt: string;
  aspectRatio?: CarouselImageAspectRatio;
  /**
   * Figma scrim visibility (default `true`). Pass `false` to hide.
   * `true` uses gradient/medium defaults with position derived from `contentAlignment`.
   */
  scrim?: CarouselSlideScrim;
  /** Used to derive gradient scrim position when `scrim={true}`. */
  contentAlignment?: CarouselAlignment;
  className?: string;
}

function SlideImage({
  src,
  alt,
  scrim = true,
  contentAlignment,
  className,
  ref,
  ...rest
}: CarouselSlideImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  const scrimProps = resolveCarouselSlideScrimProps(scrim, contentAlignment);
  return (
    <>
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={clsx(styles.image, className)}
        loading="lazy"
        decoding="async"
        {...rest}
      />
      {scrimProps ? <Scrim className={styles.scrimOverlay} {...scrimProps} /> : null}
    </>
  );
}

export interface CarouselSlideContentProps {
  /** Figma `content` visibility (default `false`). */
  content?: boolean;
  contentAlignment?: CarouselAlignment;
  /** @deprecated Use {@link contentAlignment}. */
  alignment?: CarouselAlignment;
  contentWidth?: CarouselContentWidth;
  /** @deprecated Use {@link contentWidth}. */
  width?: CarouselContentWidth;
  badgesMiddle?: boolean;
  buttonSecondary?: boolean;
  iconButtonSecondary?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function SlideContent({
  content = false,
  contentAlignment,
  alignment,
  contentWidth,
  width,
  badgesMiddle = false,
  buttonSecondary = false,
  iconButtonSecondary = false,
  className,
  style,
  children,
  ref,
}: CarouselSlideContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  if (!content) return null;

  const resolvedAlignment = contentAlignment ?? alignment ?? 'startBottom';
  const resolvedWidth = contentWidth ?? width ?? 's';

  const parentChrome = useContext(SlideChromeContext);
  const chrome: SlideChromeState = {
    ...parentChrome,
    badgesMiddle,
    buttonSecondary,
    iconButtonSecondary,
    contentVisible: true,
  };

  const text: React.ReactNode[] = [];
  const buttonGroups: React.ReactNode[] = [];
  Children.forEach(children, (child, i) => {
    if (isValidElement(child) && child.type === SlideButtonGroup) {
      buttonGroups.push(React.cloneElement(child, { key: child.key ?? `bg-${i}` }));
    } else {
      text.push(child);
    }
  });

  const surface = useContext(SlideSurfaceContext);
  return (
    <SlideChromeContext.Provider value={chrome}>
      <div
        ref={ref}
        className={clsx(styles.content, className)}
        style={style}
        data-align={resolvedAlignment}
        data-width={resolvedWidth}
        data-badges-middle={badgesMiddle ? undefined : 'false'}
        data-button-secondary={buttonSecondary ? undefined : 'false'}
        data-icon-button-secondary={iconButtonSecondary ? undefined : 'false'}
      >
        <div className={styles.contentText} data-surface={surface}>
          {text}
        </div>
        {buttonGroups}
      </div>
    </SlideChromeContext.Provider>
  );
}

export interface CarouselSlideCornerProps {
  placement: CarouselCornerPlacement;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function SlideCorner({
  placement,
  className,
  style,
  children,
  ref,
}: CarouselSlideCornerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const chrome = useContext(SlideChromeContext);
  if (placement === 'start' && chrome.badgesStart === false) return null;
  if (placement === 'end' && chrome.badgesEnd === false) return null;

  const cls = clsx(
    placement === 'start' ? styles.cornerStart : styles.cornerEnd,
    className,
  );
  const surface = useContext(SlideSurfaceContext);
  return (
    <div
      ref={ref}
      className={cls}
      style={style}
      data-placement={placement}
      data-surface={surface}
    >
      {children}
    </div>
  );
}

export interface CarouselSlideButtonGroupProps {
  orientation?: CarouselButtonOrientation;
  buttonOrientation?: CarouselButtonOrientation;
  buttonWidth?: CarouselButtonWidth | CarouselButtonWidthAlias;
  /** @deprecated Use {@link buttonWidth}. */
  width?: CarouselButtonWidth | CarouselButtonWidthAlias;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

function SlideButtonGroup({
  orientation,
  buttonOrientation,
  buttonWidth,
  width,
  className,
  style,
  children,
  ref,
}: CarouselSlideButtonGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const resolvedOrientation = buttonOrientation ?? orientation ?? 'horizontal';
  const resolvedWidth = normalizeCarouselButtonWidth(buttonWidth ?? width ?? 'hug');
  return (
    <div
      ref={ref}
      className={clsx(styles.buttonGroup, className)}
      style={style}
      data-orientation={resolvedOrientation}
      data-width={resolvedWidth}
    >
      {children}
    </div>
  );
}

export const CarouselSlide = Object.assign(SlideRoot, {
  Image: SlideImage,
  Content: SlideContent,
  Corner: SlideCorner,
  ButtonGroup: SlideButtonGroup,
});
