/**
 * Tooltip.tsx
 * React (web) implementation using Base UI Tooltip
 *
 * Key features:
 * - Uses @base-ui/react Tooltip primitive (never fork)
 * - Token-only styling via CSS Modules (Shape-4XS, Body S Medium)
 * - Figma position API + Base UI side/align API
 * - Trigger modes: hover, click, focus, manual
 * - Popup is always portaled via Base UI `Tooltip.Portal` to the default target
 *   (`document.body`). The `portal` prop is accepted for API compatibility but
 *   does not change mount behaviour (custom containers clip inside transformed /
 *   overflow-hidden ancestors).
 *
 * Note: The trigger wraps children in a <span> so that Base UI's event
 * handlers always reach the DOM — this is necessary because some
 * components (e.g., Button) don't spread rest props to their root element.
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, CSSProperties } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import styles from './Tooltip.module.css';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';
import {
  TooltipProps,
  TooltipProviderProps,
  resolveTooltipSideAndAlign,
} from './Tooltip.shared';

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delay,
  closeDelay,
}) => {
  return (
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
      {children}
    </BaseTooltip.Provider>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position,
  side: sideProp,
  align: alignProp,
  sideOffset = 8,
  open: openProp,
  defaultOpen,
  onOpenChange,
  trigger = 'hover',
  // 200ms hover delay: a brief cursor pass-through (<200ms) does NOT trigger
  // the tooltip; sustained hover does. The entrance animation begins after
  // this delay completes, so no part of the slide/fade is hidden.
  // Overrides Base UI's 600ms default which was too long for the design system.
  delay = 200,
  closeDelay,
  arrow = true,
  maxWidth,
  hoverable = true,
  disabled,
  portal: _portal = true,
  zIndex,
  subtle = false,
}) => {
  // Resolve position: explicit side/align takes precedence over Figma position alias.
  // When both are omitted, default is Figma `bottom` → Base UI side `top`.
  const { side, align } = resolveTooltipSideAndAlign({
    position,
    side: sideProp,
    align: alignProp,
  });

  // Controlled state for click/focus/manual trigger modes
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const isControlled = openProp !== undefined;
  const isOpen = isControlled ? openProp : internalOpen;

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  // For hover mode, let Base UI handle everything natively
  const isHoverMode = trigger === 'hover';

  // Click trigger: toggle on click
  const handleTriggerClick = useCallback(() => {
    if (trigger === 'click') {
      handleOpenChange(!isOpen);
    }
  }, [trigger, isOpen, handleOpenChange]);

  // Focus trigger: open on focus, close on blur.
  //
  // Base UI's TooltipRoot wires up Floating UI's `useFocus`, which attaches its
  // own onFocus / onBlur to the trigger. Those handlers call `store.setOpen`,
  // which (even when we cancel it in our `onOpenChange` later) still emits
  // 'openchange' and mutates the openEvent dataRef *before* the cancel point —
  // and that side-effect dance is enough to disrupt the entrance keyframe
  // animation on Tab focus.
  //
  // `mergeEventHandlers` (Base UI's prop merger) calls our handler first and
  // exposes `event.preventBaseUIHandler()`, which short-circuits the chain so
  // Base UI's own focus handler never runs. We call it here so the animation
  // path stays exactly as it does in click mode (where `useFocus` no-ops
  // because mouse focus isn't `:focus-visible`).
  const handleTriggerFocus = useCallback(
    (event: React.FocusEvent) => {
      if (trigger === 'focus') {
        (event as React.FocusEvent & {
          preventBaseUIHandler?: () => void;
        }).preventBaseUIHandler?.();
        handleOpenChange(true);
      }
    },
    [trigger, handleOpenChange],
  );

  const handleTriggerBlur = useCallback(
    (event: React.FocusEvent) => {
      if (trigger === 'focus') {
        (event as React.FocusEvent & {
          preventBaseUIHandler?: () => void;
        }).preventBaseUIHandler?.();
        handleOpenChange(false);
      }
    },
    [trigger, handleOpenChange],
  );

  // Close on Escape for click/focus/manual modes (WCAG dismiss-on-request).
  useEffect(() => {
    if (trigger === 'hover' || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [trigger, isOpen, handleOpenChange]);

  // Close on outside pointer down for click/focus modes. Base UI's useDismiss
  // emits outside-press, but click/focus tooltips drive `open` from React state
  // and cancel internal trigger-press/focus events — add an explicit listener
  // (same pattern as Escape above) so dismiss-on-request works reliably.
  useEffect(() => {
    if (trigger === 'hover' || trigger === 'manual' || !isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (isPointerDownInsideTooltip(event, triggerRef.current, popupRef.current)) {
        return;
      }
      handleOpenChange(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [trigger, isOpen, handleOpenChange]);

  // Build custom style properties for positioner
  const positionerStyle: CSSProperties | undefined = zIndex
    ? { zIndex }
    : undefined;

  // Build custom style properties for popup
  const popupStyle: CSSProperties | undefined = maxWidth
    ? ({
        '--Tooltip-maxWidth':
          typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
      } as CSSProperties)
    : undefined;

  // Per-side retracted translate for the arrow tip, set via inline CSS custom
  // property on the <Arrow> element. This commits the variant's tip position
  // to the DOM in the same React render where `side` is known — so even on
  // the very first paint (before Base UI's `data-side` attribute has been
  // round-tripped through Floating UI's middleware), the arrow's translate
  // resolves to the correct per-variant value via `translate: var(--tip-translate)`
  // in the CSS. Using an attribute-selector rule for this (`.arrow[data-side='bottom']`)
  // had a race where the first hover got the wrong CSS rule, animating the tip
  // from a negative offset downward to 0 instead of from the retracted position
  // upward.
  //
  // BOTTOM gets +11px (= 6px intended slide + 5px compensation for the popup's
  // translateY(-5px) drag that pulls descendants down during the L entrance).
  // The other three sides keep 6px since they don't visibly need the
  // compensation — the wrong-direction-first there is too subtle to notice.
  const TIP_RETRACTED: Record<typeof side, string> = {
    top: '0 -6px',
    bottom: '0 11px',
    left: '-6px 0',
    right: '6px 0',
  };

  // Cross-axis arrow anchor, built inline so it's committed to the DOM in the
  // same React render as `side`/`align` — first paint is always correct.
  //
  // Why not a CSS [data-align='start'] selector? Same race we hit on the
  // bottom variant: Base UI's data-attributes are applied AFTER the popup
  // mounts, so an attribute-driven rule resolves to the wrong value on the
  // very first hover and the entrance animates from the wrong starting point.
  // Built inline → no race.
  //
  // Figma spec (node 2323:25): tip sits 6px from the popup corner for
  // start/end variants and centered for the default. Centering uses
  // `margin*: -9px` (half the 18px tip dimension) instead of
  // `transform: translateX(-50%)` so it composes cleanly with the entry
  // `translate` animation without interleaving transform stacks.
  const isVerticalSide = side === 'top' || side === 'bottom';
  let arrowAnchorStyle: CSSProperties;
  if (align === 'start') {
    arrowAnchorStyle = isVerticalSide
      ? { left: '6px', right: 'auto' }
      : { top: '6px', bottom: 'auto' };
  } else if (align === 'end') {
    arrowAnchorStyle = isVerticalSide
      ? { right: '6px', left: 'auto' }
      : { bottom: '6px', top: 'auto' };
  } else {
    arrowAnchorStyle = isVerticalSide
      ? { left: '50%', right: 'auto', marginLeft: '-9px' }
      : { top: '50%', bottom: 'auto', marginTop: '-9px' };
  }

  // In subtle mode, the arrow doesn't slide — only opacity animates with the
  // popup. Override the retracted translate inline so the value is committed
  // in the same render that sets `subtle`/`side` (no [data-motion] race).
  const arrowStyle: CSSProperties = {
    ...arrowAnchorStyle,
    '--tip-translate': subtle ? '0 0' : TIP_RETRACTED[side],
  } as CSSProperties;

  // keepMounted leaves the popup in the DOM when closed. Drop role="tooltip" and
  // mark aria-hidden so assistive tech / Playwright don't treat a faded-out popup
  // as an active tooltip (click/focus/manual modes only — hover uses Base UI open).
  const popupA11yProps = isHoverMode
    ? { role: 'tooltip' as const }
    : isOpen
      ? { role: 'tooltip' as const }
      : { 'aria-hidden': true as const };

  // Tooltip content (popup + arrow)
  const tooltipContent = (
    <BaseTooltip.Positioner
      className={styles.positioner}
      side={side}
      align={align}
      sideOffset={sideOffset}
      style={positionerStyle}
      // Disable Floating UI's cross-axis fallback: when there's no room on the
      // requested side, only allow the opposite main-axis side (bottom ↔ top,
      // left ↔ right) — never flip from a vertical side to a horizontal one
      // (or vice versa). A design-system tooltip configured as `bottom` should
      // never silently appear to the right of the trigger.
      collisionAvoidance={{ fallbackAxisSide: 'none' }}
    >
      <BaseTooltip.Popup
        ref={popupRef}
        className={maxWidth ? `${styles.popup} ${styles.popupMultiline}` : styles.popup}
        style={popupStyle}
        {...popupA11yProps}
        data-mode="light"
        data-motion={subtle ? 'subtle' : undefined}
      >
        {arrow && (
          <BaseTooltip.Arrow className={styles.arrow} style={arrowStyle}>
            <ArrowSvgTop className={styles.arrowSvgTop} />
            <ArrowSvgBottom className={styles.arrowSvgBottom} />
            <ArrowSvgLeft className={styles.arrowSvgLeft} />
            <ArrowSvgRight className={styles.arrowSvgRight} />
          </BaseTooltip.Arrow>
        )}
        {content}
      </BaseTooltip.Popup>
    </BaseTooltip.Positioner>
  );

  /* keepMounted keeps the popup in the DOM (hidden) between opens, so the
     browser has already computed the popup's CSS — including the entrance
     transition spec — before the first hover. Without it, the first open
     races against initial style resolution and the popup tends to skip
     its transform/opacity animation while the arrow (whose CSS is simpler)
     still animates.

     BrandScopePortal re-applies the brand/mode data-attributes inside the
     portal so scoped brand CSS reaches the popup mounted at document.body. */
  const portalContent = (
    <BaseTooltip.Portal keepMounted>
      <BrandScopePortal>{tooltipContent}</BrandScopePortal>
    </BaseTooltip.Portal>
  );

  // For hover mode, use Base UI's native behavior
  if (isHoverMode) {
    return (
      <BaseTooltip.Root
        open={openProp}
        defaultOpen={defaultOpen}
        onOpenChange={
          onOpenChange ? (open: boolean) => onOpenChange(open) : undefined
        }
        disableHoverablePopup={!hoverable}
        disabled={disabled}
      >
        <BaseTooltip.Trigger
          render={<span className={styles.trigger} />}
          delay={delay}
          closeDelay={closeDelay}
        >
          {children}
        </BaseTooltip.Trigger>
        {portalContent}
      </BaseTooltip.Root>
    );
  }

  // For click/focus/manual modes, use controlled state.
  return (
    <BaseTooltip.Root
      open={isOpen}
      onOpenChange={(open, eventDetails) => {
        // Base UI's TooltipRoot wires up Floating UI's useFocus + useDismiss
        // hooks internally. When the user clicks or tabs to the trigger, those
        // hooks fire setOpen with reason='trigger-focus' / 'trigger-press',
        // which sets `instantType` on the store ('focus' / 'dismiss'). That
        // becomes data-instant on the popup, and our CSS `.popup[data-instant]
        // { animation: none !important }` then suppresses the entrance and
        // exit animations.
        //
        // For non-hover trigger modes, cancel those internal interaction
        // events so instantType is never set — our own onClick / onFocus /
        // onBlur handlers (and the controlled `open` prop) drive state, and
        // animations run through the normal data-open lifecycle.
        const details = eventDetails as
          | { reason?: string; cancel?: () => void }
          | undefined;
        const reason = details?.reason;

        if (trigger === 'manual') {
          details?.cancel?.();
          return;
        }

        if (
          reason === 'trigger-hover' ||
          reason === 'trigger-focus' ||
          reason === 'trigger-press'
        ) {
          details?.cancel?.();
          return;
        }

        // Allow remaining events (outside-press, escape-key, imperative
        // close) through so the tooltip can dismiss naturally.
        handleOpenChange(open);
      }}
      disabled={disabled}
    >
      <BaseTooltip.Trigger
        ref={triggerRef as unknown as React.Ref<HTMLButtonElement>}
        render={<span className={styles.trigger} />}
        delay={0}
        closeDelay={0}
        onClick={trigger === 'click' ? handleTriggerClick : undefined}
        onFocus={trigger === 'focus' ? handleTriggerFocus : undefined}
        onBlur={trigger === 'focus' ? handleTriggerBlur : undefined}
      >
        {children}
      </BaseTooltip.Trigger>
      {portalContent}
    </BaseTooltip.Root>
  );
};

// Figma tip path — 18×6 viewBox, apex naturally points DOWN (apex bezier
// control points push the curve down to land at y=6, flush with viewBox bottom).
// Each side rotates this same path: no seam-hider base bar (the 2px overlap
// the previous 20×10 SVGs used to mask sub-pixel seams).
const FIGMA_TIP_PATH =
  'M7.18173 5.15746L4.3897 2.03407C3.22548 0.731678 1.64646 0 0 0H18C16.3535 0 14.7745 0.731676 13.6103 2.03407L10.8183 5.15746C9.81407 6.28085 8.18593 6.28085 7.18173 5.15746Z';

// Tip apex points DOWN — Figma path as-is. Used for the TOP variant
// (popup above trigger; tip on popup's bottom edge pointing down at trigger).
function ArrowSvgTop(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="18" height="6" viewBox="0 0 18 6" fill="none" {...props}>
      <path d={FIGMA_TIP_PATH} className={styles.arrowFill} />
    </svg>
  );
}

// Tip apex points UP — Figma path rotated 180° around viewBox center (9, 3).
// Used for the BOTTOM variant (popup below trigger; tip on popup's top edge
// pointing up at trigger).
function ArrowSvgBottom(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="18" height="6" viewBox="0 0 18 6" fill="none" {...props}>
      <path d={FIGMA_TIP_PATH} className={styles.arrowFill} transform="rotate(180 9 3)" />
    </svg>
  );
}

// Tip apex points RIGHT — Figma path rotated 90° CCW into a 6×18 viewBox.
// Used for the LEFT variant (popup left of trigger; tip on popup's right edge).
function ArrowSvgLeft(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="6" height="18" viewBox="0 0 6 18" fill="none" {...props}>
      <path d={FIGMA_TIP_PATH} className={styles.arrowFill} transform="translate(0 18) rotate(-90)" />
    </svg>
  );
}

// Tip apex points LEFT — Figma path rotated 90° CW into a 6×18 viewBox.
// Used for the RIGHT variant (popup right of trigger; tip on popup's left edge).
function ArrowSvgRight(props: React.ComponentProps<'svg'>) {
  return (
    <svg width="6" height="18" viewBox="0 0 6 18" fill="none" {...props}>
      <path d={FIGMA_TIP_PATH} className={styles.arrowFill} transform="translate(6 0) rotate(90)" />
    </svg>
  );
}

/** True when the pointer event target is inside this tooltip's trigger or portaled popup. */
function isPointerDownInsideTooltip(
  event: PointerEvent,
  triggerEl: HTMLElement | null,
  popupEl: HTMLDivElement | null,
): boolean {
  for (const node of event.composedPath()) {
    if (!(node instanceof Element)) continue;
    if (triggerEl && (node === triggerEl || triggerEl.contains(node))) {
      return true;
    }
    if (popupEl) {
      if (node === popupEl || popupEl.contains(node)) {
        return true;
      }
      const positioner = popupEl.parentElement;
      if (positioner && (node === positioner || positioner.contains(node))) {
        return true;
      }
    }
  }
  return false;
}