/**
 * Pagination.tsx
 *
 * Composite numbered pagination navigator. Renders prev/next + first/last
 * navigation buttons, a windowed list of page numbers, and ellipses where
 * gaps exist — the standard pattern shipped by MUI / shadcn / Ant Design,
 * adapted to OneUI tokens, surface-context-awareness, and the `attention`
 * vocabulary used across the rest of the design system.
 *
 * Architecture:
 *   - Behaviour: `usePaginationState` (Pagination.shared.ts) — pure, testable.
 *   - Markup: `<nav>` wrapping a `<ul>` of `<li>`s: **nav + ellipsis** use
 *     `IconButton` here; each **numbered page** uses one `PaginationItem`.
 *     Prev/next use semantic `back` / `next` (Jio: `IcBack` / `IcNext`; chevrons
 *     stay separate under `chevronLeft` / `chevronRight`).
 *     This matches WAI-ARIA's recommended structure for a pagination
 *     navigation pattern (see https://www.w3.org/WAI/ARIA/apg/patterns/).
 *   - Keyboard: roving tabindex — only the current page is in the tab order.
 *     ArrowLeft/ArrowRight steps through the visible page numbers; Home/End
 *     jump to first/last. Navigation buttons (prev/next/first/last) are
 *     skipped by the roving model so they remain individually tabbable —
 *     consistent with how Tabs / Menu / Toolbar primitives expose nested
 *     interactive controls.
 *
 * @example Uncontrolled
 * ```tsx
 * <Pagination totalPages={20} defaultPage={1} onPageChange={(p) => console.log(p)} />
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [page, setPage] = useState(1);
 * <Pagination totalPages={20} page={page} onPageChange={setPage} />
 * ```
 *
 * @example All the trimmings
 * ```tsx
 * <Pagination
 *   totalPages={50}
 *   defaultPage={1}
 *   siblingCount={2}
 *   boundaryCount={1}
 *   showFirstLast
 *   showPrevNext
 *   size="L"
 *   attention="medium"
 *   appearance="positive"
 * />
 * ```
 */

'use client';

import React, { useCallback, useEffect, useId, useRef } from 'react';
import clsx from 'clsx';
import styles from './Pagination.module.css';
import {
  PaginationProps,
  resolvePaginationSize,
  resolvePaginationAppearance,
  usePaginationState,
  type PaginationSlot,
} from './Pagination.shared';
import { useSurfaceAppearance } from '../Surface';
import { PaginationItem } from './PaginationItem';
import { Icon } from '../../icons/Icon';
import { IconButton } from '../IconButton';
import type { IconButtonSize } from '../IconButton';
import type { IconSize } from '@oneui/shared';

const NAV_LABELS: Record<'first' | 'previous' | 'next' | 'last', string> = {
  first: 'Go to first page',
  previous: 'Go to previous page',
  next: 'Go to next page',
  last: 'Go to last page',
};

/** Pagination row `S` / `M` / `L` → IconButton size `xs` / `s` / `m` (nav + ellipsis). */
const PAGINATION_TO_ICONBUTTON_SIZE: Record<'S' | 'M' | 'L', IconButtonSize> = {
  S: 'xs',
  M: 's',
  L: 'm',
};

/** Icon size inside nav `IconButton` — stepped down with the smaller IconButton sizes. */
const PAGINATION_TO_NAV_ICON_SIZE: Record<'S' | 'M' | 'L', IconSize> = {
  S: 'xs',
  M: 'sm',
  L: 'md',
};

export function Pagination({
  totalPages,
  page,
  defaultPage,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showPrevNext = true,
  showFirstLast = false,
  disabled = false,
  attention = 'medium',
  size,
  appearance,
  'aria-label': ariaLabel = 'Pagination',
  className: classNameProp,
  style: styleProp,
  'data-testid': testId,
  ref,
}: PaginationProps) {
  const resolvedSize = resolvePaginationSize(size);
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = resolvePaginationAppearance(appearance, parentAppearance);

  const { currentPage, slots, visiblePages, setPage, step, canPrev, canNext } = usePaginationState({
    totalPages,
    page,
    defaultPage,
    onPageChange,
    siblingCount,
    boundaryCount,
    showFirstLast,
    showPrevNext,
    disabled,
  });

  // ─── Refs to each rendered numbered page button (keyed by page number) ───
  const pageButtonRefs = useRef(new Map<number, HTMLButtonElement | null>());

  // After a keyboard nav event we want to move focus to whichever page
  // button now represents `currentPage` — the windowed slot list may have
  // shuffled, so we re-query the ref map. Identical pattern to PaginationDots.
  const focusAfterKeyRef = useRef(false);

  useEffect(() => {
    if (!focusAfterKeyRef.current) return;
    focusAfterKeyRef.current = false;
    const btn = pageButtonRefs.current.get(currentPage);
    btn?.focus();
  }, [currentPage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (totalPages <= 0) return;

      // Only the numbered page buttons participate in roving-tabindex
      // navigation. Arrows on a prev/next button do nothing here (they
      // remain individually focusable and Enter/Space activates them).
      const target = e.target as HTMLElement | null;
      if (!target || target.getAttribute('data-type') !== 'page') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (canNext) focusAfterKeyRef.current = true;
          step(1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (canPrev) focusAfterKeyRef.current = true;
          step(-1);
          break;
        case 'Home':
          e.preventDefault();
          if (currentPage !== 1) focusAfterKeyRef.current = true;
          setPage(1);
          break;
        case 'End':
          e.preventDefault();
          if (currentPage !== totalPages) focusAfterKeyRef.current = true;
          setPage(totalPages);
          break;
        default:
          break;
      }
    },
    [disabled, totalPages, canPrev, canNext, currentPage, step, setPage]
  );

  const stableId = useId();

  if (totalPages <= 0) {
    // Render the navigation landmark even when empty so that consumers can
    // still pin layout / aria-label without conditional rendering. Mirrors
    // PaginationDots' empty-state behaviour.
    return (
      <nav
        ref={ref as React.Ref<HTMLElement>}
        aria-label={ariaLabel}
        className={clsx(styles.root, classNameProp)}
        style={styleProp}
        data-disabled={disabled ? '' : undefined}
        data-size={resolvedSize}
        data-testid={testId}
      />
    );
  }

  const className = clsx(styles.root, classNameProp);
  const ibSize = PAGINATION_TO_ICONBUTTON_SIZE[resolvedSize];
  const navIconSize = PAGINATION_TO_NAV_ICON_SIZE[resolvedSize];

  const navIcon = (name: 'back' | 'next' | 'firstPage' | 'lastPage') => (
    <Icon name={name} size={navIconSize} aria-hidden />
  );

  return (
    <nav
      ref={ref as React.Ref<HTMLElement>}
      aria-label={ariaLabel}
      className={className}
      style={styleProp}
      data-disabled={disabled ? '' : undefined}
      data-size={resolvedSize}
      data-testid={testId}
    >
      {/* Keyboard delegation for roving tabindex — events bubble from the focused page button. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <ul className={styles.list} onKeyDown={handleKeyDown}>
        {slots.map((slot, idx) => {
          // ─── Ellipsis ───
          if (slot.type === 'ellipsis') {
            return (
              <li key={`${slot.side}-ellipsis-${idx}`} style={{ display: 'inline-flex' }}>
                <span
                  className={styles.ellipsisDecorative}
                  aria-hidden="true"
                  data-testid={testId ? `${testId}-ellipsis-${slot.side}` : undefined}
                >
                  <IconButton
                    icon={<Icon name="moreHorizontal" size={navIconSize} aria-hidden />}
                    attention="low"
                    size={ibSize}
                    appearance="neutral"
                    disabled
                    aria-label="Collapsed pages"
                    className={styles.navItem}
                  />
                </span>
              </li>
            );
          }

          // ─── Numbered page ───
          if (slot.type === 'page') {
            const { page: pageNum, selected } = slot;
            const isCurrent = pageNum === currentPage;
            // Roving tabindex: only the active page is in the tab order;
            // the others are reachable via ArrowLeft/ArrowRight.
            const itemTabIndex = isCurrent ? 0 : -1;

            return (
              <li key={`page-${pageNum}`} style={{ display: 'inline-flex' }}>
                <PaginationItem
                  ref={(el) => {
                    if (el) pageButtonRefs.current.set(pageNum, el);
                    else pageButtonRefs.current.delete(pageNum);
                  }}
                  page={pageNum}
                  selected={selected}
                  attention={attention}
                  size={resolvedSize}
                  appearance={resolvedAppearance}
                  disabled={disabled}
                  tabIndex={itemTabIndex}
                  onSelect={(p) => setPage(p)}
                  data-testid={testId ? `${testId}-page-${pageNum}` : undefined}
                />
              </li>
            );
          }

          // ─── Navigation slot (first / previous / next / last) ───
          // These remain individually tabbable (no roving) and the
          // destination page is the obvious neighbour.
          const destinations: Record<
            Exclude<PaginationSlot['type'], 'page' | 'ellipsis'>,
            number
          > = {
            first: 1,
            previous: Math.max(1, currentPage - 1),
            next: Math.min(totalPages, currentPage + 1),
            last: totalPages,
          };

          const slotType = slot.type;
          const iconEl =
            slotType === 'previous'
              ? navIcon('back')
              : slotType === 'next'
                ? navIcon('next')
                : slotType === 'first'
                  ? navIcon('firstPage')
                  : navIcon('lastPage');

          return (
            <li key={`${slotType}-${stableId}`} style={{ display: 'inline-flex' }}>
              <IconButton
                icon={iconEl}
                attention="low"
                size={ibSize}
                appearance={resolvedAppearance}
                disabled={slot.disabled || disabled}
                onClick={() => {
                  if (slot.disabled || disabled) return;
                  setPage(destinations[slotType]);
                }}
                aria-label={NAV_LABELS[slotType]}
                className={styles.navItem}
                data-testid={testId ? `${testId}-${slotType}` : undefined}
              />
            </li>
          );
        })}
      </ul>

      {/* Off-screen live region — announces page changes to screen readers
          without dumping verbose text into the visual layout. */}
      <span aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {`Page ${currentPage} of ${totalPages}`}
      </span>

      {/* visible page numbers count is exposed for tests via data-attr */}
      <span hidden data-visible-pages={visiblePages.join(',')} />
    </nav>
  );
}

export default Pagination;
