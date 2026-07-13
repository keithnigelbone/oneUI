/**
 * Tooltip.shared.ts
 * Shared types and utilities for Tooltip component
 *
 * Supports both Figma position API (e.g. 'bottomStart') and
 * Base UI side+align API for maximum flexibility.
 */

import { ReactNode } from 'react';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

/**
 * Figma convenience position — maps to side + align internally.
 * Matches the Figma component property names exactly.
 */
export type TooltipPosition =
  | 'top'
  | 'topStart'
  | 'topEnd'
  | 'bottom'
  | 'bottomStart'
  | 'bottomEnd'
  | 'left'
  | 'leftStart'
  | 'leftEnd'
  | 'right'
  | 'rightStart'
  | 'rightEnd';

export interface TooltipProps {
  /** The trigger element the tooltip attaches to */
  children: ReactNode;
  /** Text or content displayed inside the tooltip */
  content: ReactNode;
  /**
   * Convenience position prop matching Figma API.
   * Maps to side+align internally. If both `position` and `side` are provided,
   * `side`/`align` take precedence.
   */
  position?: TooltipPosition;
  /** Which side of the trigger to position against */
  side?: TooltipSide;
  /** Alignment along the side axis */
  align?: TooltipAlign;
  /** Distance from the trigger in pixels */
  sideOffset?: number;
  /** Whether the tooltip is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the tooltip opens or closes */
  onOpenChange?: (open: boolean) => void;
  /** How the tooltip is triggered */
  trigger?: TooltipTrigger;
  /** Delay before showing (ms) */
  delay?: number;
  /** Delay before hiding (ms) */
  closeDelay?: number;
  /** Whether to show the arrow/tip pointing to the trigger */
  arrow?: boolean;
  /** Maximum width of the tooltip; when set, copy wraps inside that width (default popup is single-line nowrap). */
  maxWidth?: number | string;
  /** Whether the tooltip contents can be hovered without closing */
  hoverable?: boolean;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /**
   * Reserved for API compatibility. The popup always uses Base UI’s default
   * `Tooltip.Portal` target (`document.body`). Custom portal containers were
   * removed because they reliably clip inside overflow/transform ancestors.
   *
   * @deprecated Reserved for API compatibility. Always portals to `document.body` to prevent ancestor clipping.
   */
  portal?: boolean;
  /** Custom z-index for the tooltip */
  zIndex?: number;
  /**
   * Force subtle motion (Motion Foundations a11y level): faster Subtle
   * durations/easings and opacity-only animation — no transform/translate.
   * Use this to preview reduced motion without changing OS settings.
   * `prefers-reduced-motion: reduce` triggers the same path automatically.
   */
  subtle?: boolean;
}

export interface TooltipProviderProps {
  /** Content wrapped by the provider */
  children: ReactNode;
  /** Shared delay for all tooltips in the group */
  delay?: number;
  /** Shared close delay */
  closeDelay?: number;
}

/**
 * Parses a Figma position string into Base UI side + align values.
 *
 * Figma's `position` names where the TIP sits on the popup (e.g.
 * `position=bottom` = tip at the bottom edge of the popup, which means the
 * popup is rendered ABOVE the trigger). Base UI's `side` names where the
 * POPUP sits relative to the trigger. The two are inverses on each axis:
 *
 *   Figma bottom  →  side='top'     (popup above trigger, tip at popup bottom)
 *   Figma top     →  side='bottom'  (popup below trigger, tip at popup top)
 *   Figma left    →  side='right'   (popup right of trigger, tip at popup left)
 *   Figma right   →  side='left'    (popup left of trigger, tip at popup right)
 *
 * Cross-axis align is uninverted: Figma `start` is always toward the
 * top/left of the popup, `end` toward the bottom/right.
 */
export function parsePosition(position: TooltipPosition): {
  side: TooltipSide;
  align: TooltipAlign;
} {
  switch (position) {
    case 'top':
      return { side: 'bottom', align: 'center' };
    case 'topStart':
      return { side: 'bottom', align: 'start' };
    case 'topEnd':
      return { side: 'bottom', align: 'end' };
    case 'bottom':
      return { side: 'top', align: 'center' };
    case 'bottomStart':
      return { side: 'top', align: 'start' };
    case 'bottomEnd':
      return { side: 'top', align: 'end' };
    case 'left':
      return { side: 'right', align: 'center' };
    case 'leftStart':
      return { side: 'right', align: 'start' };
    case 'leftEnd':
      return { side: 'right', align: 'end' };
    case 'right':
      return { side: 'left', align: 'center' };
    case 'rightStart':
      return { side: 'left', align: 'start' };
    case 'rightEnd':
      return { side: 'left', align: 'end' };
  }
}

/** Figma API default — tip on the bottom edge of the popup (popup above trigger). */
export const TOOLTIP_DEFAULT_POSITION: TooltipPosition = 'bottom';

/** Base UI side + align equivalent of {@link TOOLTIP_DEFAULT_POSITION}. */
export const TOOLTIP_DEFAULT_SIDE_AND_ALIGN = parsePosition(TOOLTIP_DEFAULT_POSITION);

/**
 * Resolves Base UI `side` / `align` from optional Figma `position` and/or explicit overrides.
 * When `position` is omitted, uses {@link TOOLTIP_DEFAULT_POSITION} (Figma `bottom`).
 */
export function resolveTooltipSideAndAlign(
  props: Pick<TooltipProps, 'position' | 'side' | 'align'>,
): { side: TooltipSide; align: TooltipAlign } {
  const resolved = props.position
    ? parsePosition(props.position)
    : TOOLTIP_DEFAULT_SIDE_AND_ALIGN;
  return {
    side: props.side ?? resolved.side,
    align: props.align ?? resolved.align,
  };
}
