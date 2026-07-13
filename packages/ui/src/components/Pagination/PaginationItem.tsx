/**
 * PaginationItem.tsx
 *
 * Numbered page chip only (Base UI `Button`). Used inside `Pagination` list items
 * or standalone. Nav + ellipsis live on `Pagination`, not here.
 *
 *   - Unselected: ghost fill, **high-emphasis** neutral role text (`data-attention="high"`),
 *     label size one step below the Pagination row size (S→XS, M→S, L→M).
 *   - Selected: SelectableSingleTextButton-style chip derived from `attention`
 *     (the only public emphasis prop).
 *
 * See `PaginationItemPage.module.css`.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Button as BaseButton } from '@base-ui/react';
import clsx from 'clsx';
import styles from './Pagination.module.css';
import pageStyles from './PaginationItemPage.module.css';
import { makeAppearanceClassMap } from '../_shared/appearanceClasses';
import {
  PaginationItemProps,
  resolvePaginationSize,
  resolvePaginationVariant,
  resolvePaginationAppearance,
  type PaginationVariant,
} from './Pagination.shared';
import { useSurfaceAppearance } from '../Surface';

const appearanceClassMap = makeAppearanceClassMap(pageStyles);

const VARIANT_TO_ATTENTION: Record<PaginationVariant, 'high' | 'medium' | 'low'> = {
  bold: 'high',
  subtle: 'medium',
  ghost: 'low',
};

type PaginationItemPageChipSize = 's' | 'm' | 'l';

const PAGINATION_TO_PAGE_CHIP_SIZE: Record<'S' | 'M' | 'L', PaginationItemPageChipSize> = {
  S: 's',
  M: 'm',
  L: 'l',
};

export const PaginationItem = React.forwardRef<HTMLButtonElement, PaginationItemProps>(
  function PaginationItem(
    {
      page,
      selected = false,
      disabled = false,
      attention = 'medium',
      size,
      appearance,
      onSelect,
      onClick,
      'aria-label': ariaLabelProp,
      tabIndex,
      className: classNameProp,
      style: styleProp,
      'data-testid': testId,
    },
    ref,
  ) {
    const resolvedSize: 'S' | 'M' | 'L' = resolvePaginationSize(size);
    const parentAppearance = useSurfaceAppearance();
    const resolvedAppearance = resolvePaginationAppearance(appearance, parentAppearance);
    /** Inactive numerals + hover follow the parent surface (like Switch unchecked mode), falling back to neutral. */
    const chipAppearance = selected ? resolvedAppearance : (parentAppearance ?? 'neutral');
    const resolvedFromProps = resolvePaginationVariant(attention);

    if (process.env.NODE_ENV !== 'production' && (page === undefined || page < 1)) {
      // eslint-disable-next-line no-console
      console.warn('[PaginationItem] `page` is required and must be >= 1.');
    }

    const ariaLabel = ariaLabelProp ?? `Go to page ${page ?? ''}`.trim();
    const pageVariant = selected ? resolvedFromProps : 'ghost';
    const chipAttention = selected ? VARIANT_TO_ATTENTION[pageVariant] : 'high';
    const appearanceClass =
      chipAppearance === 'primary'
        ? pageStyles.appearancePrimary
        : appearanceClassMap[chipAppearance];

    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (tapTimeoutRef.current !== null) clearTimeout(tapTimeoutRef.current); }, []);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (disabled) return;
      // Delay the page change until the tap-scale transition settles.
      // transform is the 2nd property in: transition-property: box-shadow, transform
      const durations = getComputedStyle(e.currentTarget).transitionDuration.split(',');
      const raw = (durations[1] ?? durations[0] ?? '0s').trim();
      const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
      if (tapTimeoutRef.current !== null) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => {
        tapTimeoutRef.current = null;
        onSelect?.(page ?? 0);
      }, ms);
    };

    return (
      <BaseButton
        ref={ref}
        type="button"
        disabled={disabled}
        className={clsx(pageStyles.paginationPageChip, appearanceClass, styles.navItem, classNameProp)}
        style={styleProp}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-current={selected ? 'page' : undefined}
        aria-disabled={disabled || undefined}
        data-testid={testId}
        data-type="page"
        data-selected={selected ? 'true' : 'false'}
        data-attention={chipAttention}
        data-variant={selected ? pageVariant : 'ghost'}
        data-appearance={chipAppearance}
        data-size={PAGINATION_TO_PAGE_CHIP_SIZE[resolvedSize]}
        data-disabled={disabled ? '' : undefined}
        onClick={handleClick}
      >
        <span className={pageStyles.label}>{String(page ?? 1)}</span>
      </BaseButton>
    );
  },
);

export default PaginationItem;
