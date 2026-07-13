/**
 * carousel.presets.ts — Figma platform defaults for CarouselDesktop / Tablet / Mobile.
 *
 * Source: `.Carousel/heightFollowsAspectRatio` variant matrix (`y4r5eCoZhqvPw1U1bm2qfw`).
 */

import type {
  CarouselAlignment,
  CarouselButtonWidth,
  CarouselContentWidth,
  CarouselControlsPlacement,
  CarouselControlsType,
  CarouselImageAspectRatio,
  CarouselPlatform,
} from './Carousel.shared';
import { CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO } from './Carousel.shared';

export interface CarouselPlatformContentPreset {
  contentAlignment: CarouselAlignment;
  contentWidth: CarouselContentWidth;
  buttonWidth: CarouselButtonWidth;
}

export interface CarouselPlatformPreset {
  platform: CarouselPlatform;
  aspectRatios: readonly CarouselImageAspectRatio[];
  defaultAspectRatio: CarouselImageAspectRatio;
  defaultControlsType: CarouselControlsType;
  defaultControlsPlacement: CarouselControlsPlacement;
  referenceWidth: number;
  content: CarouselPlatformContentPreset;
}

/** Desktop / large desktop — `1440` / `1920` frames. */
export const CAROUSEL_DESKTOP_ASPECT_RATIOS = [
  '1:1',
  '4:3',
  '5:3',
  '16:9',
  '2:1',
  '21:9',
] as const satisfies readonly CarouselImageAspectRatio[];

/** Tablet — `768` / `1024` frames (same image set as desktop). */
export const CAROUSEL_TABLET_ASPECT_RATIOS = CAROUSEL_DESKTOP_ASPECT_RATIOS;

/** Mobile — `360` frame. */
export const CAROUSEL_MOBILE_ASPECT_RATIOS = [
  '9:16',
  '3:4',
  '1:1',
  '4:3',
  '5:3',
  '16:9',
  '2:1',
] as const satisfies readonly CarouselImageAspectRatio[];

export const CAROUSEL_DESKTOP_CONTENT_PRESET = {
  contentAlignment: 'startBottom',
  contentWidth: 's',
  buttonWidth: 'hug',
} as const satisfies CarouselPlatformContentPreset;

export const CAROUSEL_TABLET_CONTENT_PRESET = CAROUSEL_DESKTOP_CONTENT_PRESET;

export const CAROUSEL_MOBILE_CONTENT_PRESET = {
  contentAlignment: 'middleBottom',
  contentWidth: 'fill',
  buttonWidth: 'wide',
} as const satisfies CarouselPlatformContentPreset;

export const CAROUSEL_DESKTOP_PRESET: CarouselPlatformPreset = {
  platform: 'desktop',
  aspectRatios: CAROUSEL_DESKTOP_ASPECT_RATIOS,
  defaultAspectRatio: '16:9',
  defaultControlsType: 'pagination',
  defaultControlsPlacement: 'below',
  referenceWidth: 1440,
  content: CAROUSEL_DESKTOP_CONTENT_PRESET,
};

export const CAROUSEL_TABLET_PRESET: CarouselPlatformPreset = {
  platform: 'tablet',
  aspectRatios: CAROUSEL_TABLET_ASPECT_RATIOS,
  defaultAspectRatio: '16:9',
  defaultControlsType: 'pagination',
  defaultControlsPlacement: 'below',
  referenceWidth: 768,
  content: CAROUSEL_TABLET_CONTENT_PRESET,
};

export const CAROUSEL_MOBILE_PRESET: CarouselPlatformPreset = {
  platform: 'mobile',
  aspectRatios: CAROUSEL_MOBILE_ASPECT_RATIOS,
  defaultAspectRatio: '3:4',
  defaultControlsType: 'pagination',
  defaultControlsPlacement: 'below',
  referenceWidth: 360,
  content: CAROUSEL_MOBILE_CONTENT_PRESET,
};

export const CAROUSEL_PLATFORM_PRESETS: Record<CarouselPlatform, CarouselPlatformPreset> = {
  desktop: CAROUSEL_DESKTOP_PRESET,
  tablet: CAROUSEL_TABLET_PRESET,
  mobile: CAROUSEL_MOBILE_PRESET,
};

/** Map Figma `controlsType` presets to `Carousel.Controls` placement. */
export function resolveCarouselControlsPlacement(
  controlsType: CarouselControlsType,
): CarouselControlsPlacement | null {
  switch (controlsType) {
    case 'pagination':
    case 'selectionRail':
      return 'below';
    case 'paginationOnMedia':
    case 'selectionRailOnMedia':
      return 'onMedia';
    case 'none':
      return null;
    default:
      return 'below';
  }
}

/** Whether a controls type renders thumbnail rail chrome instead of dots. */
export function usesCarouselSelectionRail(controlsType: CarouselControlsType): boolean {
  return controlsType === 'selectionRail' || controlsType === 'selectionRailOnMedia';
}

/** Normalise wrapper `controlsType` override; falls back to platform preset default. */
export function resolveCarouselControlsType(
  controlsType: CarouselControlsType | undefined,
  preset: CarouselPlatformPreset,
): CarouselControlsType {
  return controlsType ?? preset.defaultControlsType;
}

/** Default aspect ratio for a platform wrapper when the author omits `aspectRatio`. */
export function resolveCarouselPresetAspectRatio(
  aspectRatio: CarouselImageAspectRatio | undefined,
  preset: CarouselPlatformPreset,
): CarouselImageAspectRatio {
  return aspectRatio ?? preset.defaultAspectRatio ?? CAROUSEL_DEFAULT_IMAGE_ASPECT_RATIO;
}

/**
 * Resolve wrapper controls per Figma dependencies:
 * - `controlsType` only when `controls===true`
 * - `selectionRailOnMedia` only when `fullWidth===true` (falls back to `selectionRail` in dev)
 */
export function resolveCarouselWrapperControlsType(
  controls: boolean | undefined,
  controlsType: CarouselControlsType | undefined,
  fullWidth: boolean | undefined,
  preset: CarouselPlatformPreset,
): CarouselControlsType | null {
  if (controls !== true) return null;

  let resolved = resolveCarouselControlsType(controlsType, preset);

  if (resolved === 'selectionRailOnMedia' && !fullWidth) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Carousel] controlsType="selectionRailOnMedia" requires fullWidth={true}. Falling back to "selectionRail".',
      );
    }
    resolved = 'selectionRail';
  }

  return resolved;
}
