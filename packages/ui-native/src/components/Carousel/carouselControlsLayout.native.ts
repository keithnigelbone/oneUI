/**
 * carouselControlsLayout.native.ts — Figma `.CarouselControls/*` layout helpers.
 */

import type { ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import type {
  CarouselControlsLayout,
  CarouselControlsPlacement,
  CarouselPaginationAlign,
} from './interface';

/** On-media pagination / nav chrome height — also drives slide-content bottom reserve. */
export const ON_MEDIA_CONTROLS_HEIGHT = tokens.spacing['10'];

/** Extra `paddingBottom` so base content padding + inset clears {@link ON_MEDIA_CONTROLS_HEIGHT}. */
export function resolveOnMediaControlsContentInset(contentPaddingBottom: number): number {
  return Math.max(0, ON_MEDIA_CONTROLS_HEIGHT - contentPaddingBottom);
}

/** Below mobile (`2775:10878`) centres dots when no nav arrows are present. */
export function resolveCarouselControlsLayout(
  layout: CarouselControlsLayout,
  hasNavButtons: boolean,
): CarouselControlsLayout {
  if (layout === 'split' && !hasNavButtons) return 'center';
  return layout;
}

export function resolveCarouselPaginationAlign(
  placement: CarouselControlsPlacement,
  align: CarouselPaginationAlign | undefined,
): CarouselPaginationAlign {
  if (placement === 'onMedia') return align ?? 'middle';
  return align ?? 'start';
}

export function carouselControlsChromeStyle(
  placement: CarouselControlsPlacement,
  paginationAlign: CarouselPaginationAlign,
): ViewStyle {
  if (placement === 'onMedia') {
    return {
      minHeight: ON_MEDIA_CONTROLS_HEIGHT,
      paddingVertical: tokens.spacing['1'],
      justifyContent:
        paginationAlign === 'end'
          ? 'flex-end'
          : paginationAlign === 'start'
            ? 'flex-start'
            : 'center',
    };
  }
  return {
    minHeight: tokens.spacing['6'],
    justifyContent: 'center',
  };
}
