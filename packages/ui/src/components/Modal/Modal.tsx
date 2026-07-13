/**
 * Modal.tsx
 * React (web) implementation using Base UI Dialog
 *
 * Key features:
 * - Uses @base-ui/react Dialog primitive (never fork)
 * - Token-only styling in CSS Module
 * - 4 sizes (S/M/L/FullWidth) aligned with Figma spec
 * - Multi-accent appearance roles (all 9 V4 roles)
 * - Structured layout: header (title + close) / body (scrollable) / footer (actions)
 * - Dividers with onScroll / always visibility
 * - Max-height set per size in CSS (S=50vh, M=70vh, L=85vh, FullWidth=100vh−margin)
 * - WCAG AA accessible with proper focus management
 * - Surface-context-aware via elevated surface
 */

'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import clsx from 'clsx';
import styles from './Modal.module.css';
import type {
  ModalProps,
  ModalCloseReason,
  DividerScrollPosition,
  ModalOpenChangeDetails,
} from './Modal.shared';
import { useModalState } from './Modal.shared';
import { BrandScopePortal } from '../../contexts/BrandScopeContext';
import { IconButton } from '../IconButton/IconButton';
import { Divider } from '../Divider/Divider';

type BaseDialogOpenChangeDetails = Parameters<
  NonNullable<React.ComponentProps<typeof BaseDialog.Root>['onOpenChange']>
>[1];

const scrollPositionRank: Record<DividerScrollPosition, number> = {
  start: 0,
  middle: 1,
  end: 2,
};

export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  dismissible = true,
  size = 'M',
  header = true,
  headerAlign = 'left',
  headerStart,
  showTitle = true,
  title,
  showDescription = true,
  description,
  dividerTopVisibility = 'none',
  dividerTopScrollPosition = 'middle',
  children,
  dividerBottomVisibility = 'none',
  dividerBottomScrollPosition = 'middle',
  footer = true,
  footerOrientation = 'horizontal',
  footerStart,
  footerEnd,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'data-testid': dataTestId,
  className,
  style,
  ref,
}: ModalProps) {
  const {
    resolvedSize,
    dataAttrs,
    showHeader,
    showFooter,
    dividerTopVisibility: resolvedDividerTop,
    dividerBottomVisibility: resolvedDividerBottom,
    dividerTopScrollPosition: resolvedDividerTopScrollPosition,
    dividerBottomScrollPosition: resolvedDividerBottomScrollPosition,
  } = useModalState({
    open,
    size,
    header,
    headerAlign,
    showTitle,
    showDescription,
    dividerTopVisibility,
    dividerTopScrollPosition,
    dividerBottomVisibility,
    dividerBottomScrollPosition,
    footer,
    footerOrientation,
    children,
  });

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  // 'fits' means the body content doesn't overflow — no scroll possible, so
  // neither divider should show in onScroll mode (nothing hidden to indicate).
  const [scrollState, setScrollState] = useState<'start' | 'middle' | 'end' | 'fits'>('fits');

  const handleScroll = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasOverflow = scrollHeight > clientHeight + 1;
    const atTop = scrollTop <= 1;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if (!hasOverflow) setScrollState('fits');
    else if (atTop) setScrollState('start');
    else if (atBottom) setScrollState('end');
    else setScrollState('middle');
  }, []);

  // Callback ref: fires exactly when the body div mounts and unmounts inside
  // Base UI's portal. More reliable than useEffect + bodyRef.current, which
  // can miss the mount window for portalled popups. We also wire up two
  // observers so divider state stays correct without requiring a scroll:
  //   - ResizeObserver(body)     → catches body's own size changes (viewport
  //                                resize, size-prop change, density shift).
  //   - MutationObserver(body)   → catches subtree mutations from async data
  //                                fetch, lazy components, Suspense resolves,
  //                                expandable sections, etc. (the body's
  //                                bounding rect is bounded by max-height, so
  //                                ResizeObserver alone misses inner content
  //                                growth — only `scrollHeight` changes there).
  const setBodyRef = useCallback(
    (el: HTMLDivElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      bodyRef.current = el;
      if (!el) return;

      el.addEventListener('scroll', handleScroll, { passive: true });

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => handleScroll());
        ro.observe(el);
      }

      let mo: MutationObserver | null = null;
      if (typeof MutationObserver !== 'undefined') {
        mo = new MutationObserver(() => handleScroll());
        mo.observe(el, { childList: true, subtree: true, characterData: true });
      }

      handleScroll();

      cleanupRef.current = () => {
        el.removeEventListener('scroll', handleScroll);
        ro?.disconnect();
        mo?.disconnect();
      };
    },
    [handleScroll]
  );

  const scrollRank = scrollState === 'fits' ? null : scrollPositionRank[scrollState];
  const showTopDivider =
    resolvedDividerTop === 'always' ||
    (resolvedDividerTop === 'onScroll' &&
      scrollRank !== null &&
      scrollRank >= scrollPositionRank[resolvedDividerTopScrollPosition]);

  const showBottomDivider =
    resolvedDividerBottom === 'always' ||
    (resolvedDividerBottom === 'onScroll' &&
      scrollRank !== null &&
      scrollRank <= scrollPositionRank[resolvedDividerBottomScrollPosition]);

  const popupClassName = clsx(styles.popup, styles[`size${resolvedSize}`], className);
  const resolvedAriaLabel =
    ariaLabel ?? (!ariaLabelledBy && (!showHeader || !showTitle) && title ? title : undefined);

  const handleOpenChange = useCallback(
    (nextOpen: boolean, details: BaseDialogOpenChangeDetails) => {
      const reason = details.reason as ModalCloseReason;
      if (
        !dismissible &&
        !nextOpen &&
        (reason === 'outside-press' || reason === 'escape-key' || reason === 'focus-out')
      ) {
        details.cancel();
        return;
      }

      onOpenChange?.(nextOpen, details as unknown as ModalOpenChangeDetails);
    },
    [dismissible, onOpenChange],
  );

  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!dismissible}
    >
      <BaseDialog.Portal>
        <BrandScopePortal>
          <BaseDialog.Backdrop className={styles.backdrop} />
          <BaseDialog.Popup
            ref={ref}
            className={popupClassName}
            style={style}
            aria-label={resolvedAriaLabel}
            aria-labelledby={ariaLabelledBy}
            data-testid={dataTestId}
            data-surface="elevated"
            {...dataAttrs}
          >
            {showHeader && (
              <div className={styles.header} data-header-align={headerAlign}>
                <div className={styles.headerContent}>
                  {headerStart && <span className={styles.headerStartSlot}>{headerStart}</span>}
                  <div className={styles.headerText}>
                    {showTitle && title && (
                      <BaseDialog.Title className={styles.title}>{title}</BaseDialog.Title>
                    )}
                    {showDescription && description && (
                      <BaseDialog.Description className={styles.description}>
                        {description}
                      </BaseDialog.Description>
                    )}
                  </div>
                </div>
                <BaseDialog.Close
                  render={
                    <IconButton
                      icon="close"
                      size="s"
                      condensed={true}
                      attention="low"
                      layout="1:1"
                      fullWidth={false}
                      appearance="neutral"
                      aria-label="Close"
                    />
                  }
                />
              </div>
            )}

            {showTopDivider && (
              <Divider orientation="horizontal" size="m" attention="low" roundCaps />
            )}

            <div ref={setBodyRef} className={styles.body} tabIndex={0}>
              {children}
            </div>

            {showBottomDivider && (
              <Divider orientation="horizontal" size="m" attention="low" roundCaps />
            )}

            {showFooter && (
              <div className={styles.footer} data-footer-orientation={footerOrientation}>
                {footerStart && <span className={styles.footerStart}>{footerStart}</span>}
                {footerEnd && <div className={styles.footerActions}>{footerEnd}</div>}
              </div>
            )}
          </BaseDialog.Popup>
        </BrandScopePortal>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** Re-export Dialog sub-components for trigger usage */
export const ModalTrigger = BaseDialog.Trigger;
export const ModalClose = BaseDialog.Close;
