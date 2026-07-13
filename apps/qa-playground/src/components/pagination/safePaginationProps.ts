import type { PaginationProps } from '@oneui/ui/components/Pagination';

function toFiniteNonNegativeInt(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function clampPage(value: unknown, fallback: number, totalPages: number): number {
  const hi = Math.max(1, totalPages);
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return Math.min(Math.max(fallback, 1), hi);
  return Math.min(Math.max(Math.floor(n), 1), hi);
}

/**
 * QA-only guard: `Pagination` windowing uses `Math.max(0, n)` which propagates NaN when `n` is non-finite.
 * Sanitize counts here so the playground never crashes without patching `@oneui/ui`.
 */
export function sanitizePaginationProps(props: PaginationProps): PaginationProps {
  const totalPages = toFiniteNonNegativeInt(props.totalPages, 10);
  const safeTotal = totalPages > 0 ? totalPages : 10;
  const siblingCount = toFiniteNonNegativeInt(props.siblingCount, 1);
  const boundaryCount = toFiniteNonNegativeInt(props.boundaryCount, 1);

  return {
    ...props,
    totalPages: safeTotal,
    defaultPage:
      props.defaultPage !== undefined
        ? clampPage(props.defaultPage, 1, safeTotal)
        : props.defaultPage,
    page: props.page !== undefined ? clampPage(props.page, 1, safeTotal) : props.page,
    siblingCount,
    boundaryCount,
  };
}
