/**
 * PaginationDots.tsx
 *
 * React (web) implementation of the PaginationDots component — a windowed
 * pagination indicator inspired by Instagram / Amazon Prime Video.
 *
 * - Loop vs non-loop window math in usePaginationDotsState
 * - Roving tabindex + arrow key navigation (Home / End supported)
 * - Slot-keyed buttons so loop wrap doesn't unmount — transforms animate in place
 * - All styling via tokens in PaginationDots.module.css
 *
 * @example
 * ```tsx
 * import { PaginationDots } from '@oneui/ui';
 *
 * <PaginationDots pageCount={20} defaultActiveIndex={0} aria-label="Gallery pages" />
 * <PaginationDots pageCount={5} loop activeIndex={idx} onActiveIndexChange={setIdx} />
 * <PaginationDots pageCount={10} readOnly activeIndex={currentSlide} aria-label="Slide progress" />
 * ```
 */

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './PaginationDots.module.css';
import {
  PaginationDotsProps,
  PaginationDotsAppearance,
  usePaginationDotsState,
} from './PaginationDots.shared';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import { useSurfaceAppearance } from '../Surface';

type ResolvedAppearance = Exclude<PaginationDotsAppearance, 'auto'>;

const appearanceClassMap = makeAppearanceClassMap(styles);

export function PaginationDots({
  pageCount,
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  loop = false,
  appearance = 'primary',
  readOnly = false,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  className: classNameProp,
  style: styleProp,
  ref,
}: PaginationDotsProps & { ref?: React.Ref<HTMLDivElement> }) {
    const {
      clampedActive,
      visibleDots,
      setActive,
      step,
    } = usePaginationDotsState({
      pageCount,
      activeIndex,
      defaultActiveIndex,
      onActiveIndexChange,
      loop,
      readOnly,
    });

    const parentAppearance = useSurfaceAppearance();
    const resolvedAppearance: ResolvedAppearance =
      appearance && appearance !== 'auto'
        ? appearance
        : (parentAppearance ?? 'primary');

    // Refs for each rendered button (indexed by absIdx), used to focus
    // the new active dot after a keyboard navigation.
    const buttonRefs = useRef(new Map<number, HTMLButtonElement | null>());
    const focusAfterKeyRef = useRef(false);

    useEffect(() => {
      if (!focusAfterKeyRef.current) return;
      focusAfterKeyRef.current = false;
      const btn = buttonRefs.current.get(clampedActive);
      btn?.focus();
    }, [clampedActive]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (readOnly || pageCount <= 0) return;
        const maxIdx = Math.max(0, pageCount - 1);
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            // Only flag focus-after-key when the index will actually change.
            // If we're already at the boundary (non-loop) the clamped value
            // stays the same, clampedActive won't change, and the useEffect
            // below would never fire — leaving the ref permanently true and
            // stealing focus on the next unrelated state update.
            if (loop || clampedActive < maxIdx) focusAfterKeyRef.current = true;
            step(1);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            if (loop || clampedActive > 0) focusAfterKeyRef.current = true;
            step(-1);
            break;
          case 'Home':
            e.preventDefault();
            if (clampedActive !== 0) focusAfterKeyRef.current = true;
            setActive(0);
            break;
          case 'End':
            e.preventDefault();
            if (clampedActive !== maxIdx) focusAfterKeyRef.current = true;
            setActive(maxIdx);
            break;
          default:
            break;
        }
      },
      [readOnly, pageCount, loop, clampedActive, step, setActive],
    );

    const className = clsx(
      styles.root,
      appearanceClassMap[resolvedAppearance],
      classNameProp,
    );

    const rootRole = readOnly ? 'status' : 'tablist';

    return (
      <div
        ref={ref}
        role={rootRole}
        aria-label={ariaLabel}
        data-testid={dataTestId}
        aria-live={readOnly ? 'polite' : undefined}
        data-appearance={resolvedAppearance}
        data-loop={loop ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        className={className}
        style={styleProp}
        onKeyDown={readOnly ? undefined : handleKeyDown}
      >
        {visibleDots.map(({ absIdx, isActive, state }) => (
          <button
            /*
              Key by absIdx (NOT slot). This is the critical choice that
              enables the shape-morph animation: when the window slides
              from active=5 to active=6, the button for absIdx=5 stays
              mounted and its `data-state` changes from 'active' to
              'regular' — CSS transitions on width/height smoothly morph
              the pill into a dot. Simultaneously absIdx=6 morphs from
              dot into pill. The pill appears to flow between positions,
              matching the Instagram / Prime Video pattern.
            */
            key={absIdx}
            ref={(el) => {
              if (el) {
                buttonRefs.current.set(absIdx, el);
              } else {
                buttonRefs.current.delete(absIdx);
              }
            }}
            /*
              In interactive mode: role="tab" inside role="tablist" — valid ARIA
              ownership. In readOnly mode: the root is role="status" (a live region),
              which has no owned-role requirements, so we drop role/aria-selected and
              use aria-current instead to mark the current position accessibly.
            */
            role={readOnly ? undefined : 'tab'}
            type="button"
            aria-selected={readOnly ? undefined : isActive}
            aria-current={readOnly && isActive ? 'true' : undefined}
            aria-label={`Page ${absIdx + 1} of ${pageCount}`}
            tabIndex={readOnly ? -1 : isActive ? 0 : -1}
            data-active={isActive ? '' : undefined}
            data-state={state}
            className={styles.tab}
            onClick={() => setActive(absIdx)}
            disabled={readOnly}
          >
            <span className={styles.dot} aria-hidden />
          </button>
        ))}
      </div>
    );
}
