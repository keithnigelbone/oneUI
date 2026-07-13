'use client';

/**
 * Platform preset wrappers — thin shells over `Carousel.Root` with Figma defaults.
 */

import React from 'react';
import { CarouselRoot } from '../core/CarouselRoot';
import { CarouselViewport } from '../core/CarouselViewport';
import { CarouselTrack } from '../core/CarouselTrack';
import { CarouselControls } from '../controls/CarouselControls';
import { CarouselPagination } from '../controls/CarouselPagination';
import { CarouselPrevButton } from '../controls/CarouselPrevButton';
import { CarouselNextButton } from '../controls/CarouselNextButton';
import { CarouselSelectionRailList } from '../controls/CarouselSelectionRail';
import type { CarouselSelectionRailItemData } from '../controls/CarouselSelectionRail';
import {
  CAROUSEL_DESKTOP_PRESET,
  CAROUSEL_MOBILE_PRESET,
  CAROUSEL_TABLET_PRESET,
  resolveCarouselControlsPlacement,
  resolveCarouselPresetAspectRatio,
  resolveCarouselWrapperControlsType,
  usesCarouselSelectionRail,
  type CarouselPlatformPreset,
} from '../carousel.presets';
import type { CarouselRootProps } from '../core/CarouselRoot';
import type { CarouselControlsType, CarouselImageAspectRatio } from '../Carousel.shared';

export interface CarouselPlatformWrapperProps<T = unknown>
  extends Omit<CarouselRootProps, 'children'> {
  items?: readonly T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  children?: React.ReactNode;
  /** Figma `controls` — default `false`; `controlsType` applies only when `true`. */
  controls?: boolean;
  controlsType?: CarouselControlsType;
  selectionRailItems?: CarouselSelectionRailItemData[];
  showNav?: boolean;
  splitControls?: boolean;
  /** Figma pagination `autoplay` — show play/pause beside dots when root autoplay is enabled. */
  paginationAutoplay?: boolean;
}

function renderCarouselControls(
  controlsType: CarouselControlsType,
  placement: NonNullable<ReturnType<typeof resolveCarouselControlsPlacement>>,
  selectionRailItems: CarouselSelectionRailItemData[] | undefined,
  showNav: boolean,
  splitControls: boolean,
  paginationAutoplay?: boolean,
) {
  const layout = splitControls ? 'split' : 'center';
  const nav = showNav ? (
    <>
      <CarouselPrevButton />
      <CarouselNextButton />
    </>
  ) : null;

  if (usesCarouselSelectionRail(controlsType)) {
    return (
      <CarouselControls placement={placement} layout={layout}>
        <CarouselSelectionRailList items={selectionRailItems ?? []} />
        {nav}
      </CarouselControls>
    );
  }

  return (
    <CarouselControls placement={placement} layout={layout}>
      <CarouselPagination autoplay={paginationAutoplay} />
      {nav}
    </CarouselControls>
  );
}

function CarouselPlatformWrapper<T>({
  preset,
  items,
  renderItem,
  children,
  controls,
  controlsType,
  selectionRailItems,
  showNav = true,
  splitControls = true,
  paginationAutoplay,
  fullWidth,
  aspectRatio,
  ...rootProps
}: CarouselPlatformWrapperProps<T> & { preset: CarouselPlatformPreset }) {
  const resolvedControlsType = resolveCarouselWrapperControlsType(
    controls,
    controlsType,
    fullWidth,
    preset,
  );
  const resolvedAspectRatio = resolveCarouselPresetAspectRatio(aspectRatio, preset);
  const controlsPlacement = resolvedControlsType
    ? resolveCarouselControlsPlacement(resolvedControlsType)
    : null;

  const slides =
    children ??
    (items && renderItem
      ? items.map((item, index) => (
          <React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
        ))
      : null);

  const controlsChrome =
    resolvedControlsType && controlsPlacement
      ? renderCarouselControls(
          resolvedControlsType,
          controlsPlacement,
          selectionRailItems,
          showNav,
          splitControls,
          paginationAutoplay,
        )
      : null;

  return (
    <CarouselRoot aspectRatio={resolvedAspectRatio} fullWidth={fullWidth} {...rootProps}>
      <CarouselViewport>
        <CarouselTrack>{slides}</CarouselTrack>
        {controlsPlacement === 'onMedia' ? controlsChrome : null}
      </CarouselViewport>
      {controlsPlacement === 'below' ? controlsChrome : null}
    </CarouselRoot>
  );
}

export type CarouselDesktopProps<T = unknown> = CarouselPlatformWrapperProps<T>;

export function CarouselDesktop<T = unknown>(props: CarouselDesktopProps<T>) {
  return <CarouselPlatformWrapper {...props} preset={CAROUSEL_DESKTOP_PRESET} />;
}

export type CarouselTabletProps<T = unknown> = CarouselPlatformWrapperProps<T>;

export function CarouselTablet<T = unknown>(props: CarouselTabletProps<T>) {
  return <CarouselPlatformWrapper {...props} preset={CAROUSEL_TABLET_PRESET} />;
}

export type CarouselMobileProps<T = unknown> = CarouselPlatformWrapperProps<T>;

export function CarouselMobile<T = unknown>(props: CarouselMobileProps<T>) {
  return <CarouselPlatformWrapper {...props} preset={CAROUSEL_MOBILE_PRESET} />;
}

export type { CarouselImageAspectRatio };
