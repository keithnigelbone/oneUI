/**
 * Tooltip.styles.native.ts
 *
 * RN peer of `packages/ui/src/components/Tooltip/Tooltip.module.css`.
 * Geometry only — brand paint lives inline in `Tooltip.native.tsx`.
 *
 * Popup is positioned absolutely inside `styles.anchor` (trigger-relative),
 * not in a root Modal.
 */

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';

/** Default popup corner radius — Shape-1-5 (Spacing-1-5) at mobile baseline. */
export const DEFAULT_BORDER_RADIUS = tokens.spacing['1-5'];

/** Default distance between trigger and popup (Spacing-2). */
export const DEFAULT_SIDE_OFFSET = tokens.spacing['2'];

/** Arrow tip protrusion — matches Figma 6px SVG height (Spacing-1-5). */
export const ARROW_PROTRUSION = tokens.spacing['1-5'];

/**
 * Tuck the arrow SVG into the popup by one hairline so the fill meets the body
 * with no visible seam (RN SVG rasterization leaves a gap at exact -6px flush).
 */
export const ARROW_EDGE_OVERLAP = tokens.borderWidth.hairline;

/** Horizontal arrow width — 18px (Spacing-4-5). */
export const ARROW_WIDTH_HORIZONTAL = tokens.spacing['4-5'];

/** Vertical arrow height — 6px (Spacing-1-5). */
export const ARROW_HEIGHT_HORIZONTAL = tokens.spacing['1-5'];

/** Vertical arrow height — 18px (Spacing-4-5). */
export const ARROW_HEIGHT_VERTICAL = tokens.spacing['4-5'];

/** Vertical arrow width — 6px (Spacing-1-5). */
export const ARROW_WIDTH_VERTICAL = tokens.spacing['1-5'];

/** Tip anchor inset from popup corner for start/end align (Spacing-1-5). */
export const ARROW_CORNER_INSET = tokens.spacing['1-5'];

/** Half horizontal arrow width for center alignment math. */
export const ARROW_HALF_WIDTH_HORIZONTAL = tokens.spacing['2'] + tokens.spacing['0-5'];

/** Half vertical arrow height for center alignment math. */
export const ARROW_HALF_HEIGHT_VERTICAL = tokens.spacing['2'] + tokens.spacing['0-5'];

/**
 * Popup entrance/exit slide distance — web `Tooltip.module.css` uses 5px
 * (`translateY(5px)` / `translateX(5px)`). Midpoint of Spacing-1 (4px) and
 * Spacing-1-5 (6px) at the mobile baseline.
 */
export const ENTRANCE_SLIDE_DISTANCE = (tokens.spacing['1'] + tokens.spacing['1-5']) / 2;

export const POPUP_PADDING: ViewStyle = {
  paddingVertical: tokens.spacing['1-5'],
  paddingHorizontal: tokens.spacing['3'],
};

export const POPUP_PADDING_DENSITY: Record<'tight' | 'default' | 'roomy', ViewStyle> = {
  tight: {
    paddingVertical: tokens.spacing['1'],
    paddingHorizontal: tokens.spacing['2'],
  },
  default: POPUP_PADDING,
  roomy: {
    paddingVertical: tokens.spacing['2'],
    paddingHorizontal: tokens.spacing['3-5'],
  },
};

export const styles = StyleSheet.create({
  anchor: {
    position: 'relative',
    alignSelf: 'flex-start',
    overflow: 'visible',
  },
  triggerWrap: {
    alignSelf: 'flex-start',
  },
  popup: {
    position: 'absolute',
    overflow: 'visible',
  },
  popupMeasuring: {
    opacity: 0,
    pointerEvents: 'none',
    // Keep the pre-layout pass off-screen so a (0,0) measure pass cannot
    // reflow siblings/centering before side=left/right placement settles.
    top: -tokens.spacing['40'],
    left: -tokens.spacing['40'],
  },
  popupBody: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    overflow: 'visible',
    maxWidth: tokens.spacing['40'],
  },
  popupText: {
    flexShrink: 1,
  },
  popupTextNowrap: {
    flexShrink: 0,
  },
  arrowHost: {
    position: 'absolute',
    flexDirection: 'column',
  },
});

export const POPUP_TEXT_NOWRAP: TextStyle = {
  flexShrink: 0,
};

export const POPUP_TEXT_WRAP: TextStyle = {
  flexShrink: 1,
};
