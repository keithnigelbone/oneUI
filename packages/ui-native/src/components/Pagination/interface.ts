/**
 * Pagination interface (native)
 *
 * Mirrors `packages/ui/src/components/Pagination/Pagination.shared.ts`.
 * Native-owned contract — do not import from `@oneui/ui`.
 */

import { useCallback, useMemo, useState } from 'react';
import type { AccessibilityRole, ViewStyle } from 'react-native';
import type { ComponentAppearance, IconSize } from '@oneui/shared';
import { buildButtonFamilyPressableAccessibility } from '../../utils/buttonFamilyA11y';

export type PaginationAppearance = ComponentAppearance;
export type PaginationItemAppearance = ComponentAppearance;

export type PaginationSize = 'S' | 'M' | 'L' | 's' | 'm' | 'l';
export type PaginationItemSize = PaginationSize;

export type PaginationAttention = 'high' | 'medium' | 'low';
export type PaginationItemAttention = PaginationAttention;

export type PaginationVariant = 'bold' | 'subtle' | 'ghost';
export type PaginationItemVariant = PaginationVariant;

export type PaginationPageChipSize = 's' | 'm' | 'l';

const ATTENTION_TO_VARIANT: Record<PaginationAttention, PaginationVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

const SIZE_NORMALISE: Record<string, 'S' | 'M' | 'L'> = {
  S: 'S',
  s: 'S',
  M: 'M',
  m: 'M',
  L: 'L',
  l: 'L',
};

export function resolvePaginationSize(size: PaginationSize | undefined): 'S' | 'M' | 'L' {
  if (!size) return 'M';
  return SIZE_NORMALISE[size] ?? 'M';
}

export function resolvePaginationVariant(
  attention: PaginationAttention | undefined,
): PaginationVariant {
  return ATTENTION_TO_VARIANT[attention ?? 'medium'];
}

export function resolvePaginationAppearance(
  appearance: PaginationAppearance | undefined,
  parentAppearance: Exclude<PaginationAppearance, 'auto'> | null = null,
): Exclude<PaginationAppearance, 'auto'> {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}

export const PAGINATION_TO_PAGE_CHIP_SIZE: Record<'S' | 'M' | 'L', PaginationPageChipSize> = {
  S: 's',
  M: 'm',
  L: 'l',
};

export const PAGINATION_TO_ICONBUTTON_SIZE = {
  S: 'xs',
  M: 's',
  L: 'm',
} as const;

export const PAGINATION_TO_NAV_ICON_SIZE: Record<'S' | 'M' | 'L', IconSize> = {
  S: 'xs',
  M: 'sm',
  L: 'md',
};

export const PAGINATION_TO_LABEL_ROLE_SIZE = {
  s: 'XS',
  m: 'S',
  l: 'M',
} as const satisfies Record<PaginationPageChipSize, 'XS' | 'S' | 'M'>;

export interface PaginationItemProps {
  page?: number;
  selected?: boolean;
  disabled?: boolean;
  attention?: PaginationItemAttention;
  size?: PaginationItemSize;
  appearance?: PaginationItemAppearance;
  onSelect?: (page: number) => void;
  onPress?: () => void;
  'aria-label'?: string;
  accessibilityHint?: string;
  focusable?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export interface PaginationProps {
  totalPages: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  showPrevNext?: boolean;
  showFirstLast?: boolean;
  disabled?: boolean;
  attention?: PaginationAttention;
  size?: PaginationSize;
  appearance?: PaginationAppearance;
  'aria-label'?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
}

export type PaginationSlot =
  | { type: 'first'; disabled: boolean }
  | { type: 'previous'; disabled: boolean }
  | { type: 'page'; page: number; selected: boolean }
  | { type: 'ellipsis'; side: 'start' | 'end' }
  | { type: 'next'; disabled: boolean }
  | { type: 'last'; disabled: boolean };

export type UsePaginationStateOptions = Pick<
  PaginationProps,
  | 'totalPages'
  | 'page'
  | 'defaultPage'
  | 'onPageChange'
  | 'siblingCount'
  | 'boundaryCount'
  | 'showFirstLast'
  | 'showPrevNext'
  | 'disabled'
>;

export interface UsePaginationStateResult {
  currentPage: number;
  slots: PaginationSlot[];
  visiblePages: number[];
  setPage: (page: number) => void;
  step: (delta: number) => void;
  canPrev: boolean;
  canNext: boolean;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function devWarn(message: string) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(`[Pagination] ${message}`);
  }
}

function range(start: number, end: number): number[] {
  if (start > end) return [];
  const out: number[] = new Array(end - start + 1);
  for (let i = 0; i < out.length; i++) out[i] = start + i;
  return out;
}

export function buildPaginationPages(opts: {
  totalPages: number;
  currentPage: number;
  siblingCount: number;
  boundaryCount: number;
}): Array<number | 'ellipsis-start' | 'ellipsis-end'> {
  const { totalPages, currentPage, siblingCount, boundaryCount } = opts;

  if (totalPages <= 0) return [];

  const s = Math.max(0, siblingCount);
  const b = Math.max(0, boundaryCount);
  const cur = clamp(currentPage, 1, totalPages);

  if (totalPages <= 2 * b + 2 * s + 1) {
    return range(1, totalPages);
  }

  const pages = new Set<number>();

  if (b > 0) {
    for (const p of range(1, Math.min(b, totalPages))) pages.add(p);
    const endStart = Math.max(1, totalPages - b + 1);
    for (const p of range(endStart, totalPages)) pages.add(p);
  }

  for (const p of range(cur - s, cur + s)) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, z) => a - z);
  if (sorted.length === 0) return [];

  const loSib = Math.max(1, cur - s);
  const hiSib = Math.min(totalPages, cur + s);

  const out: Array<number | 'ellipsis-start' | 'ellipsis-end'> = [];

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (i > 0) {
      const prev = sorted[i - 1];
      if (p - prev > 1) {
        const hiddenStart = prev + 1;
        const hiddenEnd = p - 1;
        const onlyAfterSiblings = hiddenStart > hiSib;
        const onlyBeforeSiblings = hiddenEnd < loSib;
        if (onlyAfterSiblings) {
          out.push('ellipsis-end');
        } else if (onlyBeforeSiblings) {
          out.push('ellipsis-start');
        } else {
          out.push('ellipsis-end');
        }
      }
    }
    out.push(p);
  }

  return out;
}

export function usePaginationState(
  opts: UsePaginationStateOptions,
): UsePaginationStateResult {
  const {
    totalPages,
    page,
    defaultPage = 1,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    showFirstLast = false,
    showPrevNext = true,
    disabled = false,
  } = opts;

  const isControlled = page !== undefined;
  const [internalPage, setInternalPage] = useState<number>(defaultPage);

  const safeTotal = Math.max(0, totalPages);
  const rawCurrent = isControlled ? page : internalPage;
  const currentPage = clamp(rawCurrent ?? 1, 1, Math.max(1, safeTotal));

  if (
    process.env.NODE_ENV !== 'production' &&
    rawCurrent !== undefined &&
    safeTotal > 0 &&
    (rawCurrent < 1 || rawCurrent > safeTotal)
  ) {
    devWarn(
      `page ${rawCurrent} is out of range [1, ${safeTotal}] — clamped to ${currentPage}.`,
    );
  }

  const setPage = useCallback(
    (next: number) => {
      if (disabled) return;
      if (safeTotal <= 0) return;
      const target = clamp(next, 1, safeTotal);
      if (!isControlled) setInternalPage(target);
      onPageChange?.(target);
    },
    [disabled, safeTotal, isControlled, onPageChange],
  );

  const step = useCallback(
    (delta: number) => setPage(currentPage + delta),
    [setPage, currentPage],
  );

  const canPrev = currentPage > 1;
  const canNext = currentPage < safeTotal;

  const visiblePages = useMemo(() => {
    return buildPaginationPages({
      totalPages: safeTotal,
      currentPage,
      siblingCount: Math.max(0, siblingCount),
      boundaryCount: Math.max(0, boundaryCount),
    }).filter((it): it is number => typeof it === 'number');
  }, [safeTotal, currentPage, siblingCount, boundaryCount]);

  const slots = useMemo<PaginationSlot[]>(() => {
    if (safeTotal <= 0) return [];

    const out: PaginationSlot[] = [];

    if (showFirstLast) out.push({ type: 'first', disabled: !canPrev });
    if (showPrevNext) out.push({ type: 'previous', disabled: !canPrev });

    const items = buildPaginationPages({
      totalPages: safeTotal,
      currentPage,
      siblingCount: Math.max(0, siblingCount),
      boundaryCount: Math.max(0, boundaryCount),
    });

    for (const item of items) {
      if (item === 'ellipsis-start') {
        out.push({ type: 'ellipsis', side: 'start' });
      } else if (item === 'ellipsis-end') {
        out.push({ type: 'ellipsis', side: 'end' });
      } else {
        out.push({ type: 'page', page: item, selected: item === currentPage });
      }
    }

    if (showPrevNext) out.push({ type: 'next', disabled: !canNext });
    if (showFirstLast) out.push({ type: 'last', disabled: !canNext });

    return out;
  }, [
    safeTotal,
    currentPage,
    siblingCount,
    boundaryCount,
    showFirstLast,
    showPrevNext,
    canPrev,
    canNext,
  ]);

  return {
    currentPage,
    slots,
    visiblePages,
    setPage,
    step,
    canPrev,
    canNext,
  };
}

export const _internal = { range, clamp, buildPaginationPages };

export const PAGINATION_NAV_LABELS: Record<'first' | 'previous' | 'next' | 'last', string> = {
  first: 'Go to first page',
  previous: 'Go to previous page',
  next: 'Go to next page',
  last: 'Go to last page',
};

export function getPaginationContainerAccessibilityProps(
  _props: Pick<PaginationProps, 'disabled'> = {},
): {
  accessible: false;
  importantForAccessibility: 'no';
} {
  return {
    accessible: false,
    importantForAccessibility: 'no',
  };
}

/** Screen-reader-only navigation landmark label — keeps child controls individually focusable. */
export function getPaginationNameAccessibilityProps(
  props: Pick<PaginationProps, 'aria-label' | 'accessibilityHint'>,
): {
  accessible: true;
  accessibilityRole: AccessibilityRole;
  accessibilityLabel: string;
  accessibilityHint?: string;
} {
  return {
    accessible: true,
    accessibilityRole: 'header' as AccessibilityRole,
    accessibilityLabel: props['aria-label'] ?? 'Pagination',
    ...(props.accessibilityHint ? { accessibilityHint: props.accessibilityHint } : {}),
  };
}

/** Container a11y — excluded from the tree without hiding descendants (ChipGroup pattern). */
export function getPaginationAccessibilityProps(
  props: Pick<PaginationProps, 'aria-label' | 'accessibilityHint' | 'disabled'>,
): ReturnType<typeof getPaginationContainerAccessibilityProps> {
  return getPaginationContainerAccessibilityProps(props);
}

export function getPaginationLiveRegionProps(
  currentPage: number,
  totalPages: number,
): {
  accessible: true;
  accessibilityRole: 'text';
  accessibilityLabel: string;
  accessibilityLiveRegion: 'polite';
} {
  return {
    accessible: true,
    accessibilityRole: 'text',
    accessibilityLabel: `Page ${currentPage} of ${totalPages}`,
    accessibilityLiveRegion: 'polite',
  };
}

export function getPaginationItemAccessibilityProps(
  props: Pick<PaginationItemProps, 'page' | 'selected' | 'disabled' | 'aria-label' | 'accessibilityHint'>,
): ReturnType<typeof buildButtonFamilyPressableAccessibility> & {
  accessibilityState: { disabled: boolean; selected?: boolean };
} {
  const label = props['aria-label'] ?? `Go to page ${props.page ?? ''}`.trim();
  const base = buildButtonFamilyPressableAccessibility({
    isDisabled: Boolean(props.disabled),
    accessibilityLabel: label,
    accessibilityHint: props.accessibilityHint,
  });
  return {
    ...base,
    accessibilityState: {
      ...base.accessibilityState,
      ...(props.selected ? { selected: true } : {}),
    },
  };
}

export function getPaginationEllipsisAccessibilityProps(): {
  accessible: false;
  importantForAccessibility: 'no-hide-descendants';
  accessibilityElementsHidden: true;
} {
  return {
    accessible: false,
    importantForAccessibility: 'no-hide-descendants',
    accessibilityElementsHidden: true,
  };
}
