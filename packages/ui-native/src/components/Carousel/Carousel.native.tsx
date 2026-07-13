/**
 * Carousel.native.tsx
 *
 * RN peer of `packages/ui/src/components/Carousel/*`. Compound micropattern
 * with ScrollView paging instead of Embla; public API matches web.
 */

import React, {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  type ImageLoadEventData,
  type ImageSourcePropType,
  type ImageStyle,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { tokens } from '@oneui/tokens';
import { IconButton } from '../IconButton/IconButton.native';
import { PaginationDots } from '../PaginationDots/PaginationDots.native';
import { Badge } from '../Badge/Badge.native';
import { Scrim } from '../Scrim/Scrim.native';
import { CarouselRootSurfaceProvider } from './carouselRootSurface.native';
import {
  Surface,
  useComponentRecipe,
  useOneUITheme,
  useSurfaceTokens,
} from '../../theme';
import { resolveCarouselContentSpacing, resolveCarouselSlideRadius } from './carouselRecipe.native';
import {
  isCarouselBadgeRowCentered,
  isCarouselContentCentered,
  resolveCarouselContentBlockLayout,
  resolveCarouselSlideContentInnerStyle,
  resolveCarouselSlideContentShellStyle,
  usesCarouselFullHeightContentOverlay,
  usesCarouselTopBadgesRow,
} from './carouselContentLayout.native';
import {
  CarouselContext,
  CarouselViewportChromeContext,
  CarouselSlideIndexProvider,
  CarouselSlideLabelProvider,
  SlideContentAlignmentContext,
  useCarousel,
  useCarouselOnMediaControlsChromeHeight,
  useCarouselOnMediaRailInset,
  useCarouselSlideLabel,
  useCarouselViewportChrome,
} from './carouselContexts.native';
import { CarouselSelectionRailList } from './CarouselSelectionRail.native';
import {
  hasNavArrowChild,
  hasSelectionRailChild,
  isCarouselSelectionRailChild,
  tagCarouselControlPart,
  orderOnMediaControlChildren,
} from './carouselControlsParts.native';
import {
  ON_MEDIA_SELECTION_RAIL_HEIGHT,
} from './carouselSelectionRailLayout.native';
import {
  carouselControlsChromeStyle,
  ON_MEDIA_CONTROLS_HEIGHT,
  resolveCarouselControlsLayout,
  resolveCarouselPaginationAlign,
} from './carouselControlsLayout.native';
import {
  resolveCarouselRootBelowGap,
  resolveCarouselPeek,
  splitCarouselRootChildren,
  resolveCarouselSlideHeight,
  usesCarouselCustomSlideHeight,
} from './carouselRootLayout.native';
import {
  resolveCarouselTrackContentStyle,
  resolveCarouselSnapOffset,
  resolvePeekViewportInset,
} from './carouselPeekLayout.native';
import {
  CarouselSlideBody,
  CarouselSlideHeadline,
} from './carouselSlideContentText.native';
import {
  formatCarouselSlidePosition,
  getCarouselRootAccessibilityProps,
  getCarouselRootNameAccessibilityProps,
  getCarouselSlideAccessibilityProps,
  getCarouselTrackLiveRegionProps,
  resolveCarouselImageAspectRatio,
  resolveCarouselLoopClonePadding,
  resolveCarouselLoopSettle,
  resolveCarouselNearestSnapIndex,
  resolveCarouselSlideScrimProps,
  CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  useCarouselEngine,
  type CarouselControlsProps,
  type CarouselIndicatorListProps,
  type CarouselNavButtonProps,
  type CarouselRootProps,
  type CarouselSlideButtonGroupProps,
  type CarouselSlideContentProps,
  type CarouselItemBadgeRowProps,
  type CarouselSlideImageProps,
  type CarouselSlideProps,
  type CarouselSurface,
  type CarouselTrackProps,
} from './interface';
import {
  buttonGroupLayoutStyle,
  controlsPlacementStyle,
  cornerPlacementStyle,
  SLIDE_GAP,
  slideImageStyle,
  styles,
  surfaceOverlayStyle,
} from './Carousel.styles.native';

const SlideSurfaceContext = createContext<CarouselSurface>('bold');
const SlideCustomHeightContext = createContext(false);

function useCarouselRecipeSpacing() {
  const recipe = useComponentRecipe('carousel');
  return useMemo(() => resolveCarouselContentSpacing(recipe), [recipe]);
}

function useCarouselSlideRadius(): number {
  const { shape } = useOneUITheme();
  const recipe = useComponentRecipe('carousel');
  return useMemo(() => resolveCarouselSlideRadius(recipe, shape), [recipe, shape]);
}

function decorateCenteredContentChildren(children: ReactNode[], centered: boolean): ReactNode[] {
  if (!centered) return children;
  return children.map((child, index) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<{ style?: TextStyle }>, {
      key: child.key ?? `content-${index}`,
      style: StyleSheet.flatten([
        (child.props as { style?: TextStyle }).style,
        { textAlign: 'center', width: '100%' as const },
      ]),
    });
  });
}

function useCarouselSlideCornerRadius(): number | undefined {
  const { fullWidth } = useCarousel();
  const slideRadius = useCarouselSlideRadius();
  return fullWidth ? undefined : slideRadius;
}

function CarouselViewportShell({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const { setViewportWidth } = useCarousel();
  const [onMediaRailInset, setOnMediaRailInset] = useState(0);
  const [onMediaControlsChromeHeight, setOnMediaControlsChromeHeight] = useState(0);
  const chromeContext = useMemo(
    () => ({
      onMediaRailInset,
      onMediaControlsChromeHeight,
      setOnMediaRailInset,
      setOnMediaControlsChromeHeight,
    }),
    [onMediaControlsChromeHeight, onMediaRailInset],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setViewportWidth(event.nativeEvent.layout.width);
  };

  return (
    <CarouselViewportChromeContext.Provider value={chromeContext}>
      <View style={styles.viewport} onLayout={onLayout}>
        {children}
      </View>
    </CarouselViewportChromeContext.Provider>
  );
}

export function CarouselRoot({
  'aria-label': ariaLabel,
  opts,
  loop,
  autoPlay = false,
  fullWidth = false,
  aspectRatio = CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  height,
  style: styleProp,
  testID,
  accessibilityHint,
  children,
}: CarouselRootProps): React.ReactElement {
  const peek = resolveCarouselPeek(fullWidth);
  const engine = useCarouselEngine({
    opts,
    loop,
    autoPlay,
    slideGap: SLIDE_GAP,
    peek,
    peekOffset: resolvePeekViewportInset(peek),
  });

  const ctxValue = useMemo(
    () => ({ ...engine, ariaLabel, fullWidth, aspectRatio, height }),
    [engine, ariaLabel, fullWidth, aspectRatio, height],
  );

  const containerA11y = getCarouselRootAccessibilityProps();
  const nameA11y = getCarouselRootNameAccessibilityProps({
    'aria-label': ariaLabel,
    accessibilityHint,
  });
  const belowChromeGap = useMemo(
    () => resolveCarouselRootBelowGap(children, CarouselControls),
    [children],
  );
  const { viewportChildren, belowChildren } = useMemo(
    () => splitCarouselRootChildren(children, CarouselRail, CarouselControls),
    [children],
  );
  const rootStyle: ViewStyle[] = [
    styles.root,
    belowChromeGap > 0 ? styles.rootWithBelowChrome : null,
    belowChromeGap > 0 ? { gap: belowChromeGap } : null,
    styleProp as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  // The root container is excluded from the a11y tree (accessible={false}) so the
  // slides, nav buttons, and play button stay independently reachable. The region
  // name is announced on the SR-only node below.
  return (
    <CarouselContext.Provider value={ctxValue}>
      <View {...containerA11y} style={rootStyle} testID={testID}>
        {nameA11y ? <View {...nameA11y} style={styles.a11yRegionName} /> : null}
        <CarouselViewportShell>{viewportChildren}</CarouselViewportShell>
        {belowChildren}
      </View>
    </CarouselContext.Provider>
  );
}

export function CarouselRail({
  style: styleProp,
  testID,
  children,
}: CarouselTrackProps): React.ReactElement {
  const {
    scrollRef,
    slideWidth,
    slideStride,
    slideCount,
    selectedIndex,
    isPlaying,
    peek,
    loop,
    setSlideCount,
    syncSelectedIndex,
    restartAutoPlay,
  } = useCarousel();

  const realSlides = Children.toArray(children).filter(isValidElement);
  const totalSlides = realSlides.length;
  const total = slideCount || totalSlides;

  useLayoutEffect(() => {
    if (totalSlides !== slideCount) {
      setSlideCount(totalSlides);
    }
  }, [totalSlides, slideCount, setSlideCount]);

  // Loop uses a circular buffer: render clones of the trailing/leading slides on
  // either end so a wrap animates continuously into a clone, then realigns
  // instantly. Peek mode needs 2 clones per side so the peek sliver never pops.
  const clonePad = resolveCarouselLoopClonePadding(loop, totalSlides, peek !== 'none');

  const decorated = realSlides.map((child, slideIndex) => {
    const existing = (child.props as { 'aria-label'?: string })['aria-label'];
    return (
      <CarouselSlideIndexProvider key={child.key ?? `slide-${slideIndex}`} value={slideIndex}>
        {cloneElement(child as ReactElement<{ 'aria-label'?: string }>, {
          'aria-label': existing ?? formatCarouselSlidePosition(slideIndex + 1, total),
        })}
      </CarouselSlideIndexProvider>
    );
  });

  // Clones are transient visual duplicates — hide them from the a11y tree and
  // make them non-interactive so they never double-announce or steal a tap.
  const renderClone = (slide: ReactElement, key: string): React.ReactElement => (
    <View
      key={key}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.slideClone}
    >
      {cloneElement(slide as ReactElement<{ 'aria-label'?: string }>, { 'aria-label': '' })}
    </View>
  );

  // Leading clones = the LAST `clonePad` real slides (in order); trailing clones
  // = the FIRST `clonePad` real slides. This keeps every clone's neighbours
  // identical to its real counterpart's, so the realign jump is invisible.
  const displayChildren =
    clonePad > 0
      ? [
          ...Array.from({ length: clonePad }, (_, i) =>
            renderClone(realSlides[totalSlides - clonePad + i], `carousel-clone-lead-${i}`),
          ),
          ...decorated,
          ...Array.from({ length: clonePad }, (_, i) =>
            renderClone(realSlides[i], `carousel-clone-trail-${i}`),
          ),
        ]
      : decorated;

  const displayCount = totalSlides + clonePad * 2;

  const trackLive = getCarouselTrackLiveRegionProps(isPlaying);

  const snapOffsets = useMemo(() => {
    if (slideStride <= 0 || displayCount <= 0) return undefined;
    return Array.from({ length: displayCount }, (_, index) =>
      resolveCarouselSnapOffset(index, slideStride),
    );
  }, [slideStride, displayCount]);

  const resolveNearestSnapIndex = useCallback(
    (offsetX: number): number =>
      resolveCarouselNearestSnapIndex(offsetX, snapOffsets, slideStride),
    [slideStride, snapOffsets],
  );

  // Map the settled display index back to a logical slide; realign instantly
  // onto the real slide when the pager landed on a clone (invisible — the clone
  // shows identical content). `snapWhenReal` animates a slow drag to its nearest
  // real slide (no momentum event fires in that case).
  const settle = useCallback(
    (offsetX: number, snapWhenReal: boolean) => {
      const displayIndex = resolveNearestSnapIndex(offsetX);
      const { logicalIndex, realignOffsetIndex } = resolveCarouselLoopSettle(
        displayIndex,
        totalSlides,
        clonePad,
      );
      syncSelectedIndex(logicalIndex);
      if (slideStride <= 0) return;
      if (realignOffsetIndex != null) {
        scrollRef.current?.scrollTo({ x: realignOffsetIndex * slideStride, y: 0, animated: false });
      } else if (snapWhenReal) {
        scrollRef.current?.scrollTo({ x: displayIndex * slideStride, y: 0, animated: true });
      }
    },
    [resolveNearestSnapIndex, totalSlides, clonePad, syncSelectedIndex, slideStride, scrollRef],
  );

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    settle(event.nativeEvent.contentOffset.x, false);
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityX = event.nativeEvent.velocity?.x ?? 0;
    if (Math.abs(velocityX) > 0.05) return;
    settle(event.nativeEvent.contentOffset.x, true);
  };

  // Position the pager on the first REAL slide (past the leading clones). A
  // mount-time scrollTo races Android's content measurement and often doesn't
  // stick — leaving the pager at offset 0 (display 0). That surfaces as "no
  // cards to the left" statically, and under autoPlay the first tick then
  // animates a long 0 -> display(1+clonePad) scroll (looks like it flies to the
  // last slide but lands on the second). Anchoring from onContentSizeChange runs
  // AFTER measurement, so the jump reliably sticks.
  const positionedRef = useRef(false);

  // Re-anchor when the buffer geometry changes (viewport resize, slide count).
  useLayoutEffect(() => {
    positionedRef.current = false;
  }, [clonePad, slideStride, totalSlides]);

  const anchorToFirstRealSlide = useCallback(() => {
    if (positionedRef.current || clonePad <= 0 || slideStride <= 0) return;
    positionedRef.current = true;
    const x = (selectedIndex + clonePad) * slideStride;
    // Defer past the content-size layout pass — a synchronous scrollTo inside
    // onContentSizeChange is clamped to the pre-layout bounds on Android.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x, y: 0, animated: false });
    });
  }, [clonePad, slideStride, selectedIndex, scrollRef]);

  const trackContentStyle = useMemo(
    () => resolveCarouselTrackContentStyle(peek),
    [peek],
  );

  const trackReady = slideWidth > 0;

  // Do NOT mount the pager until the slide stride is measured. If the ScrollView
  // mounts while stride is 0, `contentOffset` is undefined and Android pins the
  // pager at offset 0 (a leading clone); the later re-render never re-applies
  // contentOffset, so autoplay's first tick animates a long scroll across the
  // whole clone buffer — it looks like it flies toward the last slide before
  // landing on slide 2. Mounting only when ready means the ScrollView's FIRST
  // Android layout already carries the correct anchor via contentOffset.
  if (!trackReady) {
    return <View style={[styles.trackScroll, styleProp as ViewStyle]} testID={testID} />;
  }

  const initialContentOffset =
    clonePad > 0 && slideStride > 0 ? { x: clonePad * slideStride, y: 0 } : undefined;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      nestedScrollEnabled
      pagingEnabled={false}
      decelerationRate="fast"
      disableIntervalMomentum
      snapToAlignment="start"
      snapToOffsets={snapOffsets}
      contentOffset={initialContentOffset}
      onContentSizeChange={anchorToFirstRealSlide}
      showsHorizontalScrollIndicator={false}
      onScrollBeginDrag={restartAutoPlay}
      onMomentumScrollEnd={onMomentumScrollEnd}
      onScrollEndDrag={onScrollEndDrag}
      style={[styles.trackScroll, styleProp as ViewStyle]}
      contentContainerStyle={trackContentStyle}
      testID={testID}
      {...trackLive}
    >
      {displayChildren}
    </ScrollView>
  );
}

function CarouselSlideRoot({
  height,
  surface = 'bold',
  'aria-label': ariaLabel,
  style: styleProp,
  testID,
  children,
}: CarouselSlideProps): React.ReactElement {
  const { slideWidth, aspectRatio, height: rootHeight } = useCarousel();
  const pageSurface = useSurfaceTokens('primary');
  const slideCornerRadius = useCarouselSlideCornerRadius();
  const resolvedHeight = resolveCarouselSlideHeight(aspectRatio, rootHeight, height);
  const usesCustomHeight = usesCarouselCustomSlideHeight(aspectRatio, rootHeight, height);

  const slideStyle: ViewStyle = {
    width: slideWidth,
    flexShrink: 0,
    flexGrow: 0,
    ...(slideCornerRadius != null ? { borderRadius: slideCornerRadius } : null),
    overflow: 'hidden',
    backgroundColor: pageSurface.surfaces.subtle,
    ...(resolvedHeight != null ? { height: resolvedHeight } : null),
    ...(styleProp as ViewStyle),
  };

  const slideBody = children;

  // The slide container is intentionally NOT an accessibility element:
  // `accessible` would collapse the headline, body, and CTA buttons into a
  // single node, making them unreachable to VoiceOver / TalkBack. The "N of M"
  // label is announced on the image node via CarouselSlideLabelContext instead.
  return (
    <SlideSurfaceContext.Provider value={surface}>
      <SlideCustomHeightContext.Provider value={usesCustomHeight}>
        <CarouselSlideLabelProvider value={ariaLabel ?? ''}>
          <View accessible={false} style={[styles.slide, slideStyle]} testID={testID}>
            {slideBody}
          </View>
        </CarouselSlideLabelProvider>
      </SlideCustomHeightContext.Provider>
    </SlideSurfaceContext.Provider>
  );
}

export function CarouselSlideImage({
  src,
  alt,
  aspectRatio: aspectRatioProp,
  scrim,
  style: styleProp,
  testID,
}: CarouselSlideImageProps): React.ReactElement {
  const { aspectRatio: rootAspectRatio } = useCarousel();
  const aspectRatio = aspectRatioProp ?? rootAspectRatio;
  const customHeight = useContext(SlideCustomHeightContext);
  const slideCornerRadius = useCarouselSlideCornerRadius();
  const slideLabel = useCarouselSlideLabel();
  const imageA11y = getCarouselSlideAccessibilityProps({ 'aria-label': slideLabel, alt });
  const imageClipStyle: ViewStyle = {
    ...(slideCornerRadius != null ? { borderRadius: slideCornerRadius } : null),
    overflow: 'hidden',
  };
  const scrimProps = resolveCarouselSlideScrimProps(scrim);
  const fixedRatio = customHeight ? undefined : resolveCarouselImageAspectRatio(aspectRatio);
  const isFlexible = !customHeight && fixedRatio == null;
  const [intrinsicRatio, setIntrinsicRatio] = useState<number | undefined>(undefined);
  const fallbackFlexibleRatio = resolveCarouselImageAspectRatio(
    CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  );
  const mediaAspectRatio = isFlexible
    ? (intrinsicRatio ?? fallbackFlexibleRatio)
    : fixedRatio;

  const onFlexibleImageLoad = useCallback(
    (event: NativeSyntheticEvent<ImageLoadEventData>) => {
      if (!isFlexible) return;
      const { width, height } = event.nativeEvent.source;
      if (width > 0 && height > 0) {
        setIntrinsicRatio(width / height);
      }
    },
    [isFlexible],
  );

  return (
    <View
      style={[
        styles.imageMedia,
        imageClipStyle,
        customHeight ? styles.imageMediaFill : null,
        isFlexible && intrinsicRatio == null ? styles.imageMediaFlexible : null,
        !customHeight && mediaAspectRatio != null ? { aspectRatio: mediaAspectRatio } : null,
      ]}
    >
      <Image
        source={typeof src === 'string' ? { uri: src } : (src as ImageSourcePropType)}
        {...imageA11y}
        style={[
          slideImageStyle,
          slideCornerRadius != null ? { borderRadius: slideCornerRadius } : null,
          styleProp as ImageStyle,
        ]}
        resizeMode="cover"
        onLoad={isFlexible ? onFlexibleImageLoad : undefined}
        testID={testID}
      />
      {scrimProps ? (
        <View style={[styles.scrim, imageClipStyle]} pointerEvents="none">
          <Scrim {...scrimProps} />
        </View>
      ) : null}
    </View>
  );
}

function splitContentChildren(children: ReactNode): {
  badges: ReactNode[];
  text: ReactNode[];
  buttonGroups: ReactNode[];
} {
  const badges: ReactNode[] = [];
  const text: ReactNode[] = [];
  const buttonGroups: ReactNode[] = [];
  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) {
      text.push(child);
      return;
    }
    if (child.type === CarouselSlideButtonGroup) {
      buttonGroups.push(cloneElement(child, { key: child.key ?? `bg-${index}` }));
      return;
    }
    if (child.type === Badge) {
      badges.push(cloneElement(child, { key: child.key ?? `badge-${index}` }));
      return;
    }
    text.push(child);
  });
  return { badges, text, buttonGroups };
}

export function CarouselSlideContent({
  alignment = 'startBottom',
  width = 'm',
  style: styleProp,
  testID,
  children,
}: CarouselSlideContentProps): React.ReactElement {
  const surface = useContext(SlideSurfaceContext);
  const spacing = useCarouselRecipeSpacing();
  const { badges, text, buttonGroups } = splitContentChildren(children);
  const centered = isCarouselContentCentered(alignment);
  const decoratedText = decorateCenteredContentChildren(text, centered);
  const topBadgesLayout = usesCarouselTopBadgesRow(alignment);
  const blockLayout = resolveCarouselContentBlockLayout(alignment);
  const badgeRowCentered = isCarouselBadgeRowCentered(alignment);
  const fullHeightOverlay = usesCarouselFullHeightContentOverlay(alignment);
  const onMediaRailInset = useCarouselOnMediaRailInset();
  const onMediaControlsChromeHeight = useCarouselOnMediaControlsChromeHeight();
  const shellStyle = resolveCarouselSlideContentShellStyle(alignment, width);
  const innerStyle = resolveCarouselSlideContentInnerStyle(alignment, width);
  const contentPaddingBottom =
    onMediaRailInset > 0
      ? onMediaRailInset
      : onMediaControlsChromeHeight > 0
        ? onMediaControlsChromeHeight
        : spacing.paddingBottom;

  const textCluster = (
    <Surface
      mode={surface}
      style={[
        styles.contentText,
        surfaceOverlayStyle,
        { gap: spacing.contentGap },
        centered ? styles.contentTextCentered : null,
      ]}
    >
      {decoratedText}
    </Surface>
  );

  return (
    <SlideContentAlignmentContext.Provider value={alignment}>
      <View style={[styles.content, shellStyle, styleProp as ViewStyle]} testID={testID}>
        <View
          style={[
            styles.contentColumn,
            innerStyle,
            {
              paddingTop: spacing.paddingTop,
              paddingBottom: contentPaddingBottom,
              paddingHorizontal: spacing.paddingHorizontal,
            },
            fullHeightOverlay ? { flex: 1 } : null,
          ]}
        >
        {topBadgesLayout ? (
          <View style={[styles.contentColumn, fullHeightOverlay ? { flex: 1 } : null]}>
            {badges.length > 0 || blockLayout.badgesRowFlex > 0 ? (
              <View
                style={[
                  styles.badgesRow,
                  badgeRowCentered ? styles.badgesRowCentered : null,
                  blockLayout.badgesRowFlex > 0 ? { flex: blockLayout.badgesRowFlex } : null,
                  badges.length > 0 && blockLayout.badgesRowFlex === 0
                    ? { marginBottom: spacing.badgesToContentGap }
                    : null,
                ]}
              >
                {badges}
              </View>
            ) : null}
            <View
              style={[
                styles.contentWrapper,
                blockLayout.contentWrapperFlex > 0
                  ? {
                      flex: blockLayout.contentWrapperFlex,
                      justifyContent: blockLayout.contentClusterJustify,
                    }
                  : null,
                { gap: spacing.contentOuterGap },
              ]}
            >
              {textCluster}
              {buttonGroups}
            </View>
            {blockLayout.trailingSpacerFlex > 0 ? (
              <View style={{ flex: blockLayout.trailingSpacerFlex }} />
            ) : null}
          </View>
        ) : (
          <View style={[styles.contentColumn, { gap: spacing.contentOuterGap }]}>
            <Surface
              mode={surface}
              style={[
                styles.contentText,
                surfaceOverlayStyle,
                { gap: spacing.contentGap },
                centered ? styles.contentTextCentered : null,
              ]}
            >
              {decoratedText}
              {badges}
            </Surface>
            {buttonGroups}
          </View>
        )}
        </View>
      </View>
    </SlideContentAlignmentContext.Provider>
  );
}

export function CarouselItemBadgeRow({
  placement,
  style: styleProp,
  testID,
  children,
}: CarouselItemBadgeRowProps): React.ReactElement {
  const surface = useContext(SlideSurfaceContext);
  const spacing = useCarouselRecipeSpacing();
  return (
    <Surface
      mode={surface}
      style={[
        cornerPlacementStyle(placement),
        surfaceOverlayStyle,
        { padding: spacing.cornerPadding },
        styleProp as ViewStyle,
      ]}
      testID={testID}
    >
      {children}
    </Surface>
  );
}

export function CarouselSlideButtonGroup({
  orientation = 'horizontal',
  width = 'hug',
  style: styleProp,
  testID,
  children,
}: CarouselSlideButtonGroupProps): React.ReactElement {
  const contentAlignment = useContext(SlideContentAlignmentContext);
  const spacing = useCarouselRecipeSpacing();
  const { container, wideChild } = buttonGroupLayoutStyle(orientation, width, contentAlignment);
  return (
    <CarouselRootSurfaceProvider>
      <View
        style={[
          container,
          { paddingTop: spacing.buttonGroupPaddingTop },
          styleProp as ViewStyle,
        ]}
        testID={testID}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child) || !wideChild) return child;
          return cloneElement(child as ReactElement<{ style?: ViewStyle }>, {
            style: StyleSheet.flatten([wideChild, (child.props as { style?: ViewStyle }).style]),
          });
        })}
      </View>
    </CarouselRootSurfaceProvider>
  );
}

export const CarouselItem = Object.assign(CarouselSlideRoot, {
  Image: CarouselSlideImage,
  Content: CarouselSlideContent,
  BadgeRow: CarouselItemBadgeRow,
  ButtonGroup: CarouselSlideButtonGroup,
  Headline: CarouselSlideHeadline,
  Body: CarouselSlideBody,
});

export function CarouselControls({
  placement = 'below',
  layout = 'center',
  paginationAlign,
  style: styleProp,
  testID,
  children,
}: CarouselControlsProps): React.ReactElement {
  const spacing = useCarouselRecipeSpacing();
  const viewportChrome = useCarouselViewportChrome();
  const controlChildren = Children.toArray(children);
  // Nav arrows are presence-driven: they render wherever `Carousel.PrevButton` /
  // `NextButton` are placed. A `split` layout only applies when arrows exist.
  const hasNavButtons = hasNavArrowChild(controlChildren);
  const effectiveLayout = resolveCarouselControlsLayout(layout, hasNavButtons);
  const resolvedPaginationAlign = resolveCarouselPaginationAlign(placement, paginationAlign);
  const isOnMedia = placement === 'onMedia';
  // The rail's presentation follows the Controls `placement` — no separate
  // `onMedia` prop on `Carousel.SelectionRail`. Detection is therefore just
  // "is a rail present" gated by placement; the prop is injected below.
  const hasRail = hasSelectionRailChild(controlChildren);
  const hasOnMediaRail = isOnMedia && hasRail;
  const hasBelowMediaRail = !isOnMedia && hasRail;
  const childArray = hasOnMediaRail
    ? orderOnMediaControlChildren(controlChildren)
    : controlChildren;

  useLayoutEffect(() => {
    if (!viewportChrome || !hasOnMediaRail) return;
    viewportChrome.setOnMediaRailInset(ON_MEDIA_SELECTION_RAIL_HEIGHT);
    return () => viewportChrome.setOnMediaRailInset(0);
  }, [hasOnMediaRail, viewportChrome]);

  useLayoutEffect(() => {
    if (!viewportChrome || !isOnMedia || hasOnMediaRail) return;
    viewportChrome.setOnMediaControlsChromeHeight(ON_MEDIA_CONTROLS_HEIGHT);
    return () => viewportChrome.setOnMediaControlsChromeHeight(0);
  }, [hasOnMediaRail, isOnMedia, viewportChrome]);

  const controlsStyle = [
    ...controlsPlacementStyle(placement, effectiveLayout),
    carouselControlsChromeStyle(placement, resolvedPaginationAlign),
    isOnMedia
      ? hasOnMediaRail
        ? styles.controlsOnMediaSelectionRail
        : {
            bottom: tokens.spacing['0'],
            left: tokens.spacing.Margin,
            right: tokens.spacing.Margin,
          }
      : hasBelowMediaRail
        ? hasNavButtons && effectiveLayout === 'split'
          ? styles.controlsBelowSelectionRailWithNav
          : styles.controlsBelowSelectionRail
        : {
            paddingVertical: spacing.controlsPaddingVertical,
            paddingHorizontal: tokens.spacing.Margin,
          },
    isOnMedia ? surfaceOverlayStyle : null,
    !isOnMedia && effectiveLayout === 'split' && hasNavButtons
      ? { gap: tokens.spacing['1'] }
      : !isOnMedia
        ? { gap: tokens.spacing['0'] }
        : effectiveLayout === 'center' && !hasOnMediaRail
          ? { gap: tokens.spacing['1'] }
          : null,
    styleProp as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const controlsBody = childArray.map((child: ReactNode, index: number) => {
    if (!isValidElement(child)) return child;
    const childStyle: ViewStyle[] = [];
    // Placement is the single source of truth for the rail's on-media vs
    // below-media presentation — inject it so callers never pass `onMedia` on
    // `Carousel.SelectionRail` themselves.
    const renderedChild = isCarouselSelectionRailChild(child)
      ? cloneElement(child as ReactElement<{ onMedia?: boolean }>, { onMedia: isOnMedia })
      : child;
    if (hasBelowMediaRail && isCarouselSelectionRailChild(child)) {
      childStyle.push(styles.controlsBelowSelectionRailChild);
    }
    if (effectiveLayout === 'split' && index === 0) {
      childStyle.push(isOnMedia ? styles.controlsOnMediaSplitFirst : styles.controlsSplitFirst);
    }
    return (
      <View key={child.key ?? `ctrl-${index}`} style={childStyle}>
        {renderedChild}
      </View>
    );
  });

  if (isOnMedia) {
    return (
      <Surface mode="bold" style={controlsStyle} testID={testID}>
        {controlsBody}
      </Surface>
    );
  }
  return (
    <View style={controlsStyle} testID={testID}>
      {controlsBody}
    </View>
  );
}

export function CarouselIndicatorList({
  appearance = 'auto',
  'aria-label': ariaLabel,
  style: styleProp,
  testID,
}: CarouselIndicatorListProps): React.ReactElement | null {
  // The dots' loop/windowing style follows the root carousel's `loop` — no
  // separate prop, so it stays in sync with navigation wrapping.
  const { slideCount, selectedIndex, scrollTo, loop } = useCarousel();
  if (slideCount === 0) return null;
  return (
    <PaginationDots
      count={slideCount}
      activeIndex={selectedIndex}
      onActiveIndexChange={scrollTo}
      appearance={appearance}
      loop={loop}
      aria-label={ariaLabel ?? 'Slide indicators'}
      style={styleProp}
      testID={testID}
    />
  );
}

function CarouselNavButton({
  direction,
  size = 'm',
  attention = 'low',
  appearance,
  'aria-label': ariaLabel,
  style: styleProp,
  testID,
}: CarouselNavButtonProps & { direction: 'prev' | 'next' }): React.ReactElement | null {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const isPrev = direction === 'prev';
  const disabled = isPrev ? !canScrollPrev : !canScrollNext;
  const defaultLabel = isPrev ? 'Previous slide' : 'Next slide';
  return (
    <IconButton
      icon={isPrev ? 'chevronLeft' : 'chevronRight'}
      size={size}
      appearance={appearance}
      attention={attention}
      aria-label={ariaLabel ?? defaultLabel}
      disabled={disabled}
      onPress={isPrev ? scrollPrev : scrollNext}
      style={styleProp}
      testID={testID}
    />
  );
}

export function CarouselPrevButton(props: CarouselNavButtonProps): React.ReactElement | null {
  return <CarouselNavButton direction="prev" {...props} />;
}

export function CarouselNextButton(props: CarouselNavButtonProps): React.ReactElement | null {
  return <CarouselNavButton direction="next" {...props} />;
}

tagCarouselControlPart(CarouselPrevButton, 'nav-prev');
tagCarouselControlPart(CarouselNextButton, 'nav-next');

export function CarouselPlayButton({
  size = 'm',
  attention = 'low',
  appearance,
  'aria-label': ariaLabel,
  style: styleProp,
  testID,
}: CarouselNavButtonProps): React.ReactElement | null {
  const { isPlaying, play, pause, autoPlayEnabled } = useCarousel();
  if (!autoPlayEnabled) return null;
  const label = ariaLabel ?? (isPlaying ? 'Pause autoplay' : 'Start autoplay');
  return (
    <IconButton
      icon={isPlaying ? 'pause' : 'play'}
      size={size}
      appearance={appearance}
      attention={attention}
      aria-label={label}
      onPress={() => (isPlaying ? pause() : play())}
      style={styleProp}
      testID={testID}
    />
  );
}

export const Carousel = Object.assign(CarouselRoot, {
  Rail: CarouselRail,
  Item: CarouselItem,
  Controls: CarouselControls,
  IndicatorList: CarouselIndicatorList,
  SelectionRail: CarouselSelectionRailList,
  PrevButton: CarouselPrevButton,
  NextButton: CarouselNextButton,
  PlayButton: CarouselPlayButton,
});
