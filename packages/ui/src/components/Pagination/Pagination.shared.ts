/**
 * Pagination.shared.ts
 *
 * Shared types + headless state hook for the Pagination component family.
 *
 * Two public components live in this folder:
 *   - `PaginationItem` — a single **numbered** page chip. Used standalone or
 *     inside `Pagination` list items. Nav arrows and ellipsis are rendered by
 *     `Pagination`, not `PaginationItem`.
 *   - `Pagination`     — the composite numbered navigator (prev / next /
 *     first / last + windowed page numbers + ellipses). Mirrors the API
 *     conventions of MUI / shadcn / Ant — `page` (controlled) /
 *     `defaultPage` (uncontrolled) / `onPageChange` / `totalPages` /
 *     `siblingCount` / `boundaryCount` / `showFirstLast` / `showPrevNext`.
 *
 * Pure — reusable between web (this package) and any future RN port. No DOM
 * imports, no Base UI imports.
 *
 * Vocabulary:
 *   - `page`          — 1-based page index (UI convention; matches Figma "Page 5 of 12")
 *   - `pageIndex`     — 0-based internal index used in array math
 *   - `attention`     — Figma prop: 'high' | 'medium' | 'low' → derives the
 *                       internal `variant` 'bold' | 'subtle' | 'ghost'
 *                       (mirrors IconButton's pattern exactly)
 *   - `appearance`    — multi-accent role from `ComponentAppearance`
 *   - `size`          — 'S' | 'M' | 'L' (Figma 1:1)
 *   - `slot`          — entry in the rendered window:
 *                         { type: 'page', page }
 *                         { type: 'ellipsis', side: 'start' | 'end' }
 *                         { type: 'first' | 'previous' | 'next' | 'last' }
 *
 * @example Composite
 * ```tsx
 * <Pagination
 *   totalPages={20}
 *   defaultPage={1}
 *   siblingCount={1}
 *   boundaryCount={1}
 *   onPageChange={(p) => setPage(p)}
 * />
 * ```
 *
 * @example Primitive
 * ```tsx
 * <PaginationItem page={3} selected attention="high" onSelect={(p) => setPage(p)} />
 * ```
 *
 * Emphasis is expressed via the public `attention` (`high` | `medium` | `low`)
 * prop only. The internal `*Variant` types remain for `data-variant` emission.
 */

'use client';

import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

// ─── Multi-accent appearance ─────────────────────────────────────────────────

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type PaginationAppearance = ComponentAppearance;
/** Multi-accent appearance roles for a single PaginationItem. */
export type PaginationItemAppearance = ComponentAppearance;

// ─── Size + attention/variant (mirrors IconButton convention) ───────────────

/** Pagination sizes — directly matches Figma S / M / L. */
export type PaginationSize = 'S' | 'M' | 'L' | 's' | 'm' | 'l';
export type PaginationItemSize = PaginationSize;

/**
 * Figma "attention" prop and the only public emphasis API. Mirrors IconButton —
 * `high` | `medium` | `low` levels derive the internal visual `variant`
 * (bold/subtle/ghost) used for `data-variant`. Both `PaginationItem` and the
 * composite `Pagination` expose `attention` only.
 */
export type PaginationAttention = 'high' | 'medium' | 'low';
export type PaginationItemAttention = PaginationAttention;

/**
 * Internal visual variant — what the CSS keys off of (`data-variant`). Derived
 * from `attention`; not part of the public component API.
 * @internal
 */
export type PaginationVariant = 'bold' | 'subtle' | 'ghost';
/** @internal */
export type PaginationItemVariant = PaginationVariant;

const ATTENTION_TO_VARIANT: Record<PaginationAttention, PaginationVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

const SIZE_NORMALISE: Record<string, 'S' | 'M' | 'L'> = {
  S: 'S', s: 'S',
  M: 'M', m: 'M',
  L: 'L', l: 'L',
};

/** Normalise a size prop into its canonical uppercase form. Defaults to `'M'`. */
export function resolvePaginationSize(size: PaginationSize | undefined): 'S' | 'M' | 'L' {
  if (!size) return 'M';
  return SIZE_NORMALISE[size] ?? 'M';
}

/**
 * Derive the internal visual variant (`data-variant`) from the public
 * `attention` level alone. Default = `'subtle'` (medium attention).
 */
export function resolvePaginationVariant(
  attention: PaginationAttention | undefined,
): PaginationVariant {
  return ATTENTION_TO_VARIANT[attention ?? 'medium'];
}

/** Resolve `appearance` (`'auto'` or unset → `parentAppearance ?? 'primary'`). */
export function resolvePaginationAppearance(
  appearance: PaginationAppearance | undefined,
  parentAppearance: Exclude<PaginationAppearance, 'auto'> | null = null,
): Exclude<PaginationAppearance, 'auto'> {
  if (appearance && appearance !== 'auto') return appearance;
  return parentAppearance ?? 'primary';
}

// ─── PaginationItem (primitive) ──────────────────────────────────────────────

export interface PaginationItemProps {
  /** 1-based page number this chip represents. */
  page?: number;

  /** Whether this chip is the current page. */
  selected?: boolean;

  /** Disabled state. */
  disabled?: boolean;

  /**
   * Emphasis level for the **selected** chip only — `high` (bold fill),
   * `medium` (tinted fill), `low` (ghost). Unselected chips use high-emphasis
   * typography (`data-attention="high"`) while staying ghost. Default `medium`.
   */
  attention?: PaginationItemAttention;

  /** T-shirt size. Default `'M'`. */
  size?: PaginationItemSize;

  /** Multi-accent appearance role for the **selected** chip only. `'auto'`
   * resolves to `'primary'`. Inactive chips always render with neutral role
   * tokens for numerals and hover (see `PaginationItem`). */
  appearance?: PaginationItemAppearance;

  /**
   * Fires when the chip is clicked or activated via keyboard. Receives the
   * 1-based `page` number from props.
   */
  onSelect?: (page: number) => void;

  /** Web-only alias for `onSelect` (matches Button's `onClick`). */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Accessible label override. By default we generate `"Go to page N"`. */
  'aria-label'?: string;

  /** Tabindex override for roving tabindex managed by `Pagination`. */
  tabIndex?: number;

  /** Additional class name applied to the root. */
  className?: string;

  /** Inline styles. */
  style?: CSSProperties;

  /** Test ID. */
  'data-testid'?: string;
}

// ─── Pagination (composite) ──────────────────────────────────────────────────

export interface PaginationProps {
  ref?: React.Ref<HTMLElement>;

  /** Total number of pages. Required. Values < 1 render nothing. */
  totalPages: number;

  /** Controlled current page (1-based). */
  page?: number;

  /** Default current page (1-based) when uncontrolled. Default `1`. */
  defaultPage?: number;

  /** Fires whenever the active page changes (click, keyboard, controlled update). */
  onPageChange?: (page: number) => void;

  /**
   * Number of always-visible page numbers immediately around the current page.
   * Default `1` (i.e. show one page on each side of `current`).
   */
  siblingCount?: number;

  /**
   * Number of always-visible page numbers at the very start AND the very end
   * of the sequence. Default `1` (i.e. always render page 1 and page N).
   * Set to `0` to hide them.
   */
  boundaryCount?: number;

  /** Show the "previous page" arrow button. Default `true`. */
  showPrevNext?: boolean;

  /** Show the "first page" / "last page" jump buttons. Default `false`. */
  showFirstLast?: boolean;

  /** Disable the entire control. */
  disabled?: boolean;

  /**
   * Emphasis level for the **selected** page chip only — `high` (bold fill),
   * `medium` (tinted fill), `low` (ghost). Inactive page chips stay ghost with
   * high-emphasis numeral colour; nav + ellipsis stay ghost + low attention.
   * Default `'medium'`.
   */
  attention?: PaginationAttention;

  /** T-shirt size for page chips, nav `IconButton`s, and ellipsis. Default `'M'`. */
  size?: PaginationSize;

  /**
   * Multi-accent appearance role for page chips and nav controls. `'auto'`
   * resolves to `'primary'`.
   */
  appearance?: PaginationAppearance;

  /** Accessible label for the navigation landmark. Default `"Pagination"`. */
  'aria-label'?: string;

  /** Additional class name applied to the root. */
  className?: string;

  /** Inline styles. */
  style?: CSSProperties;

  /** Test ID. */
  'data-testid'?: string;
}

// ─── Slot model (the windowed render plan) ───────────────────────────────────

export type PaginationSlot =
  | { type: 'first'; disabled: boolean }
  | { type: 'previous'; disabled: boolean }
  | { type: 'page'; page: number; selected: boolean }
  | { type: 'ellipsis'; side: 'start' | 'end' }
  | { type: 'next'; disabled: boolean }
  | { type: 'last'; disabled: boolean };

// ─── usePaginationState — windowed page-number math ─────────────────────────

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
  /** Clamped current page (1-based). */
  currentPage: number;
  /** The render plan, in left-to-right order. */
  slots: PaginationSlot[];
  /** All page numbers actually included in the window (no boundaries / ellipses). */
  visiblePages: number[];
  /** Set the current page (clamped + honours controlled-mode). */
  setPage: (page: number) => void;
  /** Step by ±1 with clamping (no wrap; consumers can wrap if they want). */
  step: (delta: number) => void;
  /** Whether the previous-page action is currently available. */
  canPrev: boolean;
  /** Whether the next-page action is currently available. */
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

/**
 * Build a strictly increasing range `[start, end]` (inclusive). Returns `[]`
 * when `start > end`, which lets the slot builder treat empty boundary or
 * sibling ranges uniformly without special-casing.
 */
function range(start: number, end: number): number[] {
  if (start > end) return [];
  const out: number[] = new Array(end - start + 1);
  for (let i = 0; i < out.length; i++) out[i] = start + i;
  return out;
}

/**
 * Compute the windowed page-number list for a Pagination component.
 *
 * Builds the visible page set as the **sorted union** of:
 * - the first `boundaryCount` pages (when `boundaryCount > 0`),
 * - the last `boundaryCount` pages (when `boundaryCount > 0`),
 * - the inclusive range `[currentPage − siblingCount, currentPage + siblingCount]`
 *   clamped to `[1, totalPages]`.
 *
 * When `totalPages <= 2 * boundaryCount + 2 * siblingCount + 1`, every page
 * is shown with no ellipses (compact list — avoids omitting middle pages on
 * small totals).
 *
 * Otherwise inserts `ellipsis-end` / `ellipsis-start` between visible numbers
 * when the gap is more than one page: **end** when the skipped block lies
 * entirely after the sibling window, **start** when it lies entirely before.
 */
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

  // Small totals: the union of boundary + sibling sets can omit interior pages
  // (e.g. 1,2,5 for total=5). When the full sequence fits in a tight band, show
  // every page — matches MUI / shadcn compact behaviour and keeps tests sane.
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
          // Rare: hidden range spans both sides of the sibling window — single ellipsis.
          out.push('ellipsis-end');
        }
      }
    }
    out.push(p);
  }

  return out;
}

/**
 * Resolve controlled/uncontrolled page state, clamp to range, build the
 * full slot render plan including navigation buttons.
 */
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
  }, [safeTotal, currentPage, siblingCount, boundaryCount, showFirstLast, showPrevNext, canPrev, canNext]);

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

/**
 * Internals exposed for testing only. Stable utility surface so unit tests
 * can exercise the windowing math without rendering React.
 * @internal
 */
export const _internal = { range, clamp, buildPaginationPages };
