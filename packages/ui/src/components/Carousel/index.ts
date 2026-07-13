export { Carousel } from './Carousel';
export type {
  CarouselRootProps,
  CarouselViewportProps,
  CarouselTrackProps,
  CarouselSlideProps,
  CarouselSlideImageProps,
  CarouselSlideContentProps,
  CarouselSlideCornerProps,
  CarouselSlideButtonGroupProps,
  CarouselControlsProps,
  CarouselIndicatorListProps,
  CarouselPaginationProps,
  CarouselPaginationOnMediaProps,
  CarouselSelectionRailProps,
  CarouselSelectionRailListProps,
  CarouselSelectionRailItemData,
  CarouselSelectionRailOnMediaProps,
  CarouselPrevButtonProps,
  CarouselNextButtonProps,
  CarouselPlayButtonProps,
  CarouselDesktopProps,
  CarouselTabletProps,
  CarouselMobileProps,
} from './Carousel';

export type {
  CarouselOpts,
  CarouselAlign,
  CarouselAlignment,
  CarouselAspectRatio,
  CarouselImageAspectRatio,
  CarouselHeightMode,
  CarouselFollowAspectRatio,
  CarouselFollowsAspectRatio,
  CarouselSlideScrim,
  CarouselContentWidth,
  CarouselButtonOrientation,
  CarouselButtonWidth,
  CarouselCornerPlacement,
  CarouselControlsPlacement,
  CarouselControlsLayout,
  CarouselControlsType,
  CarouselPaginationAlign,
  CarouselPlatform,
  CarouselSurface,
  CarouselAppearance,
  ComponentAppearance,
} from './Carousel.shared';

export {
  CAROUSEL_IMAGE_ASPECT_RATIOS,
  CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO,
  CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT,
  CAROUSEL_FLEXIBLE_HEIGHT_MIN,
  CAROUSEL_SLIDE_SCRIM_PROPS,
  resolveCarouselSlideScrimProps,
  carouselPageToIndex,
  carouselIndexToPage,
  resolveCarouselControlsGate,
} from './Carousel.shared';

export {
  CAROUSEL_DESKTOP_PRESET,
  CAROUSEL_TABLET_PRESET,
  CAROUSEL_MOBILE_PRESET,
  CAROUSEL_DESKTOP_ASPECT_RATIOS,
  CAROUSEL_TABLET_ASPECT_RATIOS,
  CAROUSEL_MOBILE_ASPECT_RATIOS,
  CAROUSEL_PLATFORM_PRESETS,
} from './carousel.presets';

export type { CarouselPlatformPreset } from './carousel.presets';

export { useCarousel } from './core/Carousel.context';
export type { CarouselContextValue } from './core/Carousel.context';

export {
  CAROUSEL_TOKENS,
  CAROUSEL_TOKEN_MANIFEST,
  getCarouselTokensByCategory,
} from './Carousel.tokens';

export { CAROUSEL_META } from './Carousel.meta';
export { CAROUSEL_RECIPE_DEFINITION } from './Carousel.recipe';

export { CarouselDesktop, CarouselTablet, CarouselMobile } from './variants/CarouselPlatformWrappers';
export { CarouselSelectionRail } from './controls/CarouselSelectionRail';
