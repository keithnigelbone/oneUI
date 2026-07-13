/**
 * carouselContexts.native.ts — Carousel React contexts.
 *
 * Consolidates the compound carousel context, the on-media viewport chrome
 * context, the per-slide index context, and the slide-content alignment context.
 */

import { createContext, useContext } from 'react';
import type {
  CarouselAlignment,
  CarouselEngineState,
  CarouselImageAspectRatio,
} from './interface';

/* -------------------------------------------------------------------------- */
/* Compound carousel context                                                  */
/* -------------------------------------------------------------------------- */

export interface CarouselContextValue extends CarouselEngineState {
  ariaLabel: string;
  fullWidth: boolean;
  aspectRatio: CarouselImageAspectRatio;
  height?: number;
}

export const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error(
      'Carousel parts must be rendered inside <Carousel>. Wrap your Rail / Item / Controls in <Carousel aria-label="...">.',
    );
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/* Viewport chrome context — shares on-media control insets with slide content */
/* Selection rail: Figma `spacerOnMediaSelectionRail` (`2818:51906`).          */
/* Pagination / nav on media: content reserves `ON_MEDIA_CONTROLS_HEIGHT`.     */
/* -------------------------------------------------------------------------- */

export interface CarouselViewportChromeContextValue {
  onMediaRailInset: number;
  /** Slide-content `paddingBottom` when on-media pagination / nav controls are shown. */
  onMediaControlsChromeHeight: number;
  setOnMediaRailInset: (inset: number) => void;
  setOnMediaControlsChromeHeight: (height: number) => void;
}

export const CarouselViewportChromeContext =
  createContext<CarouselViewportChromeContextValue | null>(null);

export function useCarouselViewportChrome(): CarouselViewportChromeContextValue | null {
  return useContext(CarouselViewportChromeContext);
}

export function useCarouselOnMediaRailInset(): number {
  return useContext(CarouselViewportChromeContext)?.onMediaRailInset ?? 0;
}

export function useCarouselOnMediaControlsChromeHeight(): number {
  return useContext(CarouselViewportChromeContext)?.onMediaControlsChromeHeight ?? 0;
}

/* -------------------------------------------------------------------------- */
/* Per-slide index context                                                    */
/* -------------------------------------------------------------------------- */

const CarouselSlideIndexContext = createContext(0);

export const CarouselSlideIndexProvider = CarouselSlideIndexContext.Provider;

export function useCarouselSlideIndex(): number {
  return useContext(CarouselSlideIndexContext);
}

/**
 * Informational slide label ("N of M" or a per-slide override). Provided by the
 * slide container so the image node — not the slide container — can announce it.
 * Keeping it off the container prevents `accessible` collapsing the whole slide
 * into one node (which would hide the headline / body / CTA from screen readers).
 */
const CarouselSlideLabelContext = createContext<string>('');

export const CarouselSlideLabelProvider = CarouselSlideLabelContext.Provider;

export function useCarouselSlideLabel(): string {
  return useContext(CarouselSlideLabelContext);
}

/* -------------------------------------------------------------------------- */
/* Slide-content alignment context                                            */
/* -------------------------------------------------------------------------- */

export const SlideContentAlignmentContext = createContext<CarouselAlignment>('startBottom');

export function useCarouselSlideContentAlignment(): CarouselAlignment {
  return useContext(SlideContentAlignmentContext);
}
