'use client';

import { CarouselRoot } from './core/CarouselRoot';
import { CarouselViewport } from './core/CarouselViewport';
import { CarouselTrack } from './core/CarouselTrack';
import { CarouselSlide } from './core/CarouselSlide';
import { CarouselControls } from './controls/CarouselControls';
import { CarouselIndicatorList } from './controls/CarouselIndicatorList';
import { CarouselPagination } from './controls/CarouselPagination';
import { CarouselPaginationOnMedia } from './controls/CarouselPaginationOnMedia';
import { CarouselSelectionRail, CarouselSelectionRailList } from './controls/CarouselSelectionRail';
import { CarouselSelectionRailOnMedia } from './controls/CarouselSelectionRailOnMedia';
import { CarouselPrevButton } from './controls/CarouselPrevButton';
import { CarouselNextButton } from './controls/CarouselNextButton';
import { CarouselPlayButton } from './controls/CarouselPlayButton';
import { CarouselDesktop, CarouselTablet, CarouselMobile } from './variants/CarouselPlatformWrappers';

export const Carousel = {
  Root: CarouselRoot,
  Viewport: CarouselViewport,
  Track: CarouselTrack,
  Slide: CarouselSlide,
  Controls: CarouselControls,
  IndicatorList: CarouselIndicatorList,
  Pagination: CarouselPagination,
  PaginationOnMedia: CarouselPaginationOnMedia,
  SelectionRail: CarouselSelectionRailList,
  SelectionRailOnMedia: CarouselSelectionRailOnMedia,
  PrevButton: CarouselPrevButton,
  NextButton: CarouselNextButton,
  PlayButton: CarouselPlayButton,
  Desktop: CarouselDesktop,
  Tablet: CarouselTablet,
  Mobile: CarouselMobile,
};

export { CarouselSelectionRail };

export type { CarouselRootProps } from './core/CarouselRoot';
export type { CarouselViewportProps } from './core/CarouselViewport';
export type { CarouselTrackProps } from './core/CarouselTrack';
export type {
  CarouselSlideProps,
  CarouselSlideImageProps,
  CarouselSlideContentProps,
  CarouselSlideCornerProps,
  CarouselSlideButtonGroupProps,
} from './core/CarouselSlide';
export type { CarouselControlsProps } from './controls/CarouselControls';
export type { CarouselIndicatorListProps } from './controls/CarouselIndicatorList';
export type { CarouselPaginationProps } from './controls/CarouselPagination';
export type { CarouselPaginationOnMediaProps } from './controls/CarouselPaginationOnMedia';
export type {
  CarouselSelectionRailProps,
  CarouselSelectionRailListProps,
  CarouselSelectionRailItemData,
} from './controls/CarouselSelectionRail';
export type { CarouselSelectionRailOnMediaProps } from './controls/CarouselSelectionRailOnMedia';
export type { CarouselPrevButtonProps } from './controls/CarouselPrevButton';
export type { CarouselNextButtonProps } from './controls/CarouselNextButton';
export type { CarouselPlayButtonProps } from './controls/CarouselPlayButton';
export type {
  CarouselDesktopProps,
  CarouselTabletProps,
  CarouselMobileProps,
} from './variants/CarouselPlatformWrappers';
