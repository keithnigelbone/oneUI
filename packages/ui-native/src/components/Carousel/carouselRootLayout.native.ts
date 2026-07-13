/**
 * carouselRootLayout.native.ts — Root viewport shell, below-chrome gap, peek
 * mode, and flexible slide height.
 *
 * Consolidates the Figma root/viewport sizing helpers:
 *   - below-chrome gap (`2775:10892` → `Spacing-2`; `2818:53153` → `Spacing-3`)
 *   - peek mode + child split from `fullWidth`
 *   - flexible frame height (`360×480` mobile, `2775:10379`)
 */

import { Children, isValidElement, type ReactNode } from 'react';
import { tokens } from '@oneui/tokens';
import { hasSelectionRailChild } from './carouselControlsParts.native';
import type { CarouselControlsProps, CarouselImageAspectRatio } from './interface';

type CarouselControlsComponent = (props: CarouselControlsProps) => React.ReactElement;

/* -------------------------------------------------------------------------- */
/* Below-chrome gap                                                           */
/* -------------------------------------------------------------------------- */

/** Figma `2775:10892` → `Spacing-2`; `2818:53153` → `Spacing-3`. */
export function resolveCarouselRootBelowGap(
  children: ReactNode,
  controlsType: CarouselControlsComponent,
): number {
  let gap = 0;
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== controlsType) return;
    const props = child.props as CarouselControlsProps;
    if ((props.placement ?? 'below') !== 'below') return;
    const chromeChildren = Children.toArray(props.children);
    // Placement is already known to be `below` here, so any rail present is a
    // below-media rail.
    gap = hasSelectionRailChild(chromeChildren)
      ? tokens.spacing['3']
      : tokens.spacing['2'];
  });
  return gap;
}

/* -------------------------------------------------------------------------- */
/* Root viewport shell + peek                                                 */
/* -------------------------------------------------------------------------- */

export type CarouselPeekMode = 'none' | 'both';

/** `fullWidth` carousels are edge-to-edge; inset carousels peek adjacent slides on both sides. */
export function resolveCarouselPeek(fullWidth?: boolean): CarouselPeekMode {
  return fullWidth ? 'none' : 'both';
}

export function splitCarouselRootChildren(
  children: ReactNode,
  trackType: unknown,
  controlsType: unknown,
): { viewportChildren: ReactNode[]; belowChildren: ReactNode[] } {
  const viewportChildren: ReactNode[] = [];
  const belowChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      viewportChildren.push(child);
      return;
    }
    if (child.type === trackType) {
      viewportChildren.push(child);
      return;
    }
    if (child.type === controlsType) {
      const props = child.props as CarouselControlsProps;
      if ((props.placement ?? 'below') === 'onMedia') {
        viewportChildren.push(child);
      } else {
        belowChildren.push(child);
      }
      return;
    }
    viewportChildren.push(child);
  });

  return { viewportChildren, belowChildren };
}

/* -------------------------------------------------------------------------- */
/* Flexible slide height                                                      */
/* -------------------------------------------------------------------------- */

// INTENTIONAL-LITERAL: Figma `2775:10379` mobile carousel frame height. A
// free-form content-area dimension, not a spacing/f-step token — authors pass
// their own pixel height and this is only the fallback default.
/** Default flexible slide height — Figma `2775:10379` mobile carousel frame. */
export const CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT = 480;

// INTENTIONAL-LITERAL: floor for author-supplied flexible heights. Not a
// spacing/f-step token — a guard rail against unusably short slides.
/** Minimum flexible slide height. */
export const CAROUSEL_FLEXIBLE_HEIGHT_MIN = 300;

/**
 * Resolves slide height when Root `aspectRatio` is `flexible`.
 * Positive integers only; truncates decimals; clamps to {@link CAROUSEL_FLEXIBLE_HEIGHT_MIN}.
 */
export function resolveCarouselFlexibleSlideHeight(height?: number): number {
  const raw = height ?? CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT;
  if (!Number.isFinite(raw)) {
    return CAROUSEL_FLEXIBLE_HEIGHT_DEFAULT;
  }
  const integer = Math.trunc(raw);
  if (integer <= 0) {
    return CAROUSEL_FLEXIBLE_HEIGHT_MIN;
  }
  return Math.max(CAROUSEL_FLEXIBLE_HEIGHT_MIN, integer);
}

/** Slide height wins over Root; flexible mode always resolves to a pixel height. */
export function resolveCarouselSlideHeight(
  aspectRatio: CarouselImageAspectRatio,
  rootHeight?: number,
  slideHeight?: number,
): number | undefined {
  const candidate = slideHeight ?? rootHeight;
  if (aspectRatio === 'flexible') {
    return resolveCarouselFlexibleSlideHeight(candidate);
  }
  return candidate;
}

export function usesCarouselCustomSlideHeight(
  aspectRatio: CarouselImageAspectRatio,
  rootHeight?: number,
  slideHeight?: number,
): boolean {
  return aspectRatio === 'flexible' || slideHeight != null || rootHeight != null;
}
