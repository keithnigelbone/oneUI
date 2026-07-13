/**
 * Tooltip interface (native)
 *
 * Semantic source: packages/ui/src/components/Tooltip/Tooltip.shared.ts
 * Cross-check: Layers jdstooltip-4 + jdstooltip/generated/interface.ts
 */

import { isValidElement, type ReactNode } from 'react';

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
  /**
   * Figma alias for `arrow`. When both are set, `arrow` takes precedence.
   * @deprecated Prefer `arrow`.
   */
  tip?: boolean;
  /** Maximum width of the tooltip; when set, copy wraps inside that width */
  maxWidth?: number | string;
  /** Whether the tooltip contents can be hovered without closing */
  hoverable?: boolean;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /**
   * Figma alias for `disabled`. When both are set, `disabled` takes precedence.
   * @deprecated Prefer `disabled`.
   */
  disable?: boolean;
  /**
   * Reserved for API compatibility. Native renders the popup as a trigger-relative
   * sibling inside the anchor container (no root Modal portal).
   *
   * @deprecated Accepted for API compatibility only.
   */
  portal?: boolean;
  /** Custom z-index for the tooltip */
  zIndex?: number;
  /**
   * Force subtle motion (Motion Foundations a11y level): faster Subtle
   * durations/easings and opacity-only animation — no transform/translate.
   */
  subtle?: boolean;
  /** React Native test identifier (mirrors Layers RN `testID`). */
  testID?: string;
  /** Minimum popup width in px — omit for content-driven width. */
  minWidth?: number;
  /**
   * Pointer events on the open popup. Default `'auto'` when visible so interactive
   * tooltip content remains tappable. Pass `'none'` when the popup must not
   * intercept gestures (e.g. Slider value label over a draggable track).
   */
  popupPointerEvents?: 'auto' | 'none' | 'box-none';
  accessibilityHint?: string;
  'aria-label'?: string;
}

export interface TooltipProviderProps {
  children: ReactNode;
  delay?: number;
  closeDelay?: number;
}

export interface TooltipLayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TooltipPopupPosition {
  top: number;
  left: number;
}

/**
 * Parses a Figma position string into side + align values.
 *
 * `position` names where the whole tooltip sits relative to the trigger
 * (same vocabulary as `side`):
 *
 *   position='bottom'  →  side='bottom'  (popup below trigger)
 *   position='top'     →  side='top'     (popup above trigger)
 */
export function parsePosition(position: TooltipPosition): {
  side: TooltipSide;
  align: TooltipAlign;
} {
  switch (position) {
    case 'top':
      return { side: 'top', align: 'center' };
    case 'topStart':
      return { side: 'top', align: 'start' };
    case 'topEnd':
      return { side: 'top', align: 'end' };
    case 'bottom':
      return { side: 'bottom', align: 'center' };
    case 'bottomStart':
      return { side: 'bottom', align: 'start' };
    case 'bottomEnd':
      return { side: 'bottom', align: 'end' };
    case 'left':
      return { side: 'left', align: 'center' };
    case 'leftStart':
      return { side: 'left', align: 'start' };
    case 'leftEnd':
      return { side: 'left', align: 'end' };
    case 'right':
      return { side: 'right', align: 'center' };
    case 'rightStart':
      return { side: 'right', align: 'start' };
    case 'rightEnd':
      return { side: 'right', align: 'end' };
  }
}

export function resolveTooltipSideAndAlign(
  props: Pick<TooltipProps, 'position' | 'side' | 'align'>
): { side: TooltipSide; align: TooltipAlign } {
  const resolved = props.position ? parsePosition(props.position) : undefined;
  return {
    side: props.side ?? resolved?.side ?? 'bottom',
    align: props.align ?? resolved?.align ?? 'center',
  };
}

export function resolveTooltipMaxWidth(maxWidth: number | string | undefined): number | undefined {
  if (maxWidth == null) return undefined;
  if (typeof maxWidth === 'number') return maxWidth;
  const trimmed = maxWidth.trim();
  const pxMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (pxMatch) return Number(pxMatch[1]);
  return undefined;
}

export function tooltipContentToAccessibilityLabel(content: ReactNode): string | undefined {
  if (typeof content === 'string' || typeof content === 'number') {
    return String(content);
  }
  if (isValidElement(content)) {
    const props = content.props as { 'aria-label'?: string; accessibilityLabel?: string };
    if (typeof props['aria-label'] === 'string' && props['aria-label'].trim()) {
      return props['aria-label'];
    }
    if (typeof props.accessibilityLabel === 'string' && props.accessibilityLabel.trim()) {
      return props.accessibilityLabel;
    }
  }
  return undefined;
}

export function useTooltipState(
  props: TooltipProps,
  providerDelay?: number,
  providerCloseDelay?: number
) {
  const { side, align } = resolveTooltipSideAndAlign(props);
  const trigger = props.trigger ?? 'hover';
  const delay = props.delay ?? providerDelay ?? 200;
  const closeDelay = props.closeDelay ?? providerCloseDelay;
  const sideOffset = props.sideOffset;
  const arrow = props.arrow ?? props.tip ?? true;
  const hoverable = props.hoverable ?? true;
  const disabled = Boolean(props.disabled ?? props.disable);
  const subtle = Boolean(props.subtle);
  const maxWidth = resolveTooltipMaxWidth(props.maxWidth);
  const multiline = maxWidth != null;

  return {
    side,
    align,
    trigger,
    delay,
    closeDelay,
    sideOffset,
    arrow,
    hoverable,
    disabled,
    subtle,
    maxWidth,
    multiline,
    contentLabel: tooltipContentToAccessibilityLabel(props.content),
  };
}

export interface TooltipEntranceOffset {
  x: number;
  y: number;
}

/**
 * Starting translate for the entrance animation (and ending translate on exit).
 *
 * Mirrors web `Tooltip.module.css` `[data-starting-style]` / `[data-ending-style]`:
 *   side top    → translateY(+distance)  — popup starts slightly below final pos
 *   side bottom → translateY(-distance) — popup starts slightly above final pos
 *   side left   → translateX(+distance) — popup starts slightly right of final pos
 *   side right  → translateX(-distance) — popup starts slightly left of final pos
 *
 * When `subtle` is true (or OS reduced motion), web holds `transform: none` and
 * only opacity animates — native returns `{ x: 0, y: 0 }` for the same path.
 */
export function resolveTooltipEntranceOffset(
  side: TooltipSide,
  distance: number,
  subtle: boolean
): TooltipEntranceOffset {
  if (subtle) return { x: 0, y: 0 };
  switch (side) {
    case 'top':
      return { x: 0, y: distance };
    case 'bottom':
      return { x: 0, y: -distance };
    case 'left':
      return { x: distance, y: 0 };
    case 'right':
      return { x: -distance, y: 0 };
  }
}

export function computeTooltipPopupPosition(
  trigger: TooltipLayoutRect,
  popup: Pick<TooltipLayoutRect, 'width' | 'height'>,
  side: TooltipSide,
  align: TooltipAlign,
  sideOffset: number,
  /** @deprecated Arrow sits inside the sideOffset gap — not added to placement math. */
  _arrowProtrusion = 0
): TooltipPopupPosition {
  // Base UI sideOffset = distance from trigger edge to popup edge; the arrow
  // protrudes into that gap (see arrowHost `top`/`bottom`: ±ARROW_PROTRUSION).
  const gap = sideOffset;
  let top = trigger.y;
  let left = trigger.x;

  switch (side) {
    case 'top':
      top = trigger.y - popup.height - gap;
      break;
    case 'bottom':
      top = trigger.y + trigger.height + gap;
      break;
    case 'left':
      left = trigger.x - popup.width - gap;
      break;
    case 'right':
      left = trigger.x + trigger.width + gap;
      break;
  }

  if (side === 'top' || side === 'bottom') {
    switch (align) {
      case 'start':
        left = trigger.x;
        break;
      case 'center':
        left = trigger.x + trigger.width / 2 - popup.width / 2;
        break;
      case 'end':
        left = trigger.x + trigger.width - popup.width;
        break;
    }
  } else {
    switch (align) {
      case 'start':
        top = trigger.y;
        break;
      case 'center':
        top = trigger.y + trigger.height / 2 - popup.height / 2;
        break;
      case 'end':
        top = trigger.y + trigger.height - popup.height;
        break;
    }
  }

  return { top, left };
}

export interface TooltipTriggerChildA11yProps {
  'aria-label'?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean; expanded?: boolean };
}

/** Layout-only wrapper — must not capture or hide the real trigger in the a11y tree. */
export function getTooltipTriggerWrapperAccessibilityProps(): {
  accessible: false;
  importantForAccessibility: 'no';
} {
  return {
    accessible: false,
    importantForAccessibility: 'no',
  };
}

/**
 * Layout anchor wrapping trigger + popup siblings.
 * Must never set `accessibilityElementsHidden` when open — the popup lives
 * inside this container and would be suppressed from VoiceOver / TalkBack.
 */
export function getTooltipAnchorAccessibilityProps(): Record<string, never> {
  return {};
}

/**
 * A11y props merged onto the trigger element (cloned child or fallback Pressable).
 * Preserves the child's own accessible name when tooltip content is a ReactNode.
 */
export function getTooltipTriggerChildAccessibilityProps(
  props: Pick<TooltipProps, 'aria-label' | 'accessibilityHint'>,
  state: { disabled: boolean; contentLabel?: string; isOpen: boolean },
  child?: TooltipTriggerChildA11yProps
): {
  accessible: true;
  importantForAccessibility: 'auto';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState: { disabled?: boolean; expanded?: boolean };
} {
  const childLabel = child?.['aria-label'] ?? child?.accessibilityLabel;
  const label = props['aria-label'] ?? childLabel ?? state.contentLabel;
  return {
    accessible: true,
    importantForAccessibility: 'auto',
    ...(label ? { accessibilityLabel: label } : {}),
    accessibilityHint: props.accessibilityHint ?? child?.accessibilityHint,
    accessibilityState: {
      ...child?.accessibilityState,
      disabled: state.disabled,
      expanded: state.isOpen,
    },
  };
}

/** @deprecated Prefer getTooltipTriggerWrapperAccessibilityProps + getTooltipTriggerChildAccessibilityProps */
export function getTooltipTriggerAccessibilityProps(
  props: Pick<TooltipProps, 'aria-label' | 'accessibilityHint'>,
  state: { disabled: boolean; contentLabel?: string; isOpen: boolean },
  child?: TooltipTriggerChildA11yProps
): ReturnType<typeof getTooltipTriggerChildAccessibilityProps> {
  return getTooltipTriggerChildAccessibilityProps(props, state, child);
}

export function getTooltipPopupAccessibilityProps(state: {
  contentLabel?: string;
  isOpen: boolean;
}): {
  accessible: boolean;
  accessibilityRole: 'text';
  accessibilityLabel?: string;
  accessibilityLiveRegion: 'polite';
  importantForAccessibility: 'yes';
} {
  return {
    accessible: state.isOpen && Boolean(state.contentLabel),
    accessibilityRole: 'text',
    accessibilityLabel: state.contentLabel,
    accessibilityLiveRegion: 'polite',
    importantForAccessibility: 'yes',
  };
}

/** Alias matching web export name for accessibility helpers. */
export function getTooltipAccessibilityProps(
  props: Pick<TooltipProps, 'aria-label' | 'accessibilityHint' | 'content'>,
  state: { disabled: boolean; isOpen: boolean },
  child?: TooltipTriggerChildA11yProps
): ReturnType<typeof getTooltipTriggerChildAccessibilityProps> {
  return getTooltipTriggerChildAccessibilityProps(
    props,
    {
      disabled: state.disabled,
      contentLabel: tooltipContentToAccessibilityLabel(props.content),
      isOpen: state.isOpen,
    },
    child
  );
}
