'use client';

import type { ReactNode } from 'react';
import { Pagination, PaginationItem } from '@oneui/ui/components/Pagination';
import type { PaginationAttention, PaginationSize } from '@oneui/ui/components/Pagination';
import { sanitizePaginationProps } from './safePaginationProps';
import styles from './pagination-figma-validation.module.css';

/** Figma sheet: page 6 of 11 with boundary + sibling ellipsis window. */
const FIGMA_TOTAL_PAGES = 11;
const FIGMA_DEFAULT_PAGE = 6;
const FIGMA_SIBLING_COUNT = 1;
const FIGMA_BOUNDARY_COUNT = 1;

/** Column order matches attached Figma: M · S · L. */
const SIZE_COLS = [
  { size: 'M' as const, footer: 'M' },
  { size: 'S' as const, footer: 'S' },
  { size: 'L' as const, footer: 'L' },
] as const;

const ATTENTION_ROWS = [
  { attention: 'high' as const, rowLabel: 'attention: high' },
  { attention: 'medium' as const, rowLabel: 'attention: medium' },
  { attention: 'low' as const, rowLabel: 'attention: low' },
] as const;

/** PaginationItem matrix: rows = size; column groups = attention × active. */
const ITEM_SIZE_ROWS = [
  { size: 'M' as const, rowLabel: 'M' },
  { size: 'S' as const, rowLabel: 'S' },
  { size: 'L' as const, rowLabel: 'L' },
] as const;

const ITEM_ATTENTION_GROUPS = [
  { attention: 'low' as const, groupLabel: 'attention: low' },
  { attention: 'medium' as const, groupLabel: 'attention: medium' },
  { attention: 'high' as const, groupLabel: 'attention: high' },
] as const;

const ITEM_ACTIVE_COLS = [
  { selected: false as const, footer: 'active: false' },
  { selected: true as const, footer: 'active: true' },
] as const;

function FigmaPreviewWrap({ children }: { children: ReactNode }) {
  return <div className={styles.previewWrap}>{children}</div>;
}

function figmaPaginationCell(attention: PaginationAttention, size: PaginationSize, testId: string) {
  return (
    <FigmaPreviewWrap>
      <Pagination
        {...sanitizePaginationProps({
          totalPages: FIGMA_TOTAL_PAGES,
          defaultPage: FIGMA_DEFAULT_PAGE,
          attention,
          size,
          showFirstLast: true,
          showPrevNext: true,
          siblingCount: FIGMA_SIBLING_COUNT,
          boundaryCount: FIGMA_BOUNDARY_COUNT,
          'aria-label': `Figma Pagination ${attention} ${size}`,
          'data-testid': testId,
        })}
      />
    </FigmaPreviewWrap>
  );
}

function figmaPaginationItemCell(
  size: PaginationSize,
  attention: PaginationAttention,
  selected: boolean,
  testId: string,
) {
  return (
    <FigmaPreviewWrap>
      <PaginationItem
        page={1}
        size={size}
        attention={attention}
        selected={selected}
        aria-label={`Figma PaginationItem ${size} ${attention} active ${selected}`}
        data-testid={testId}
      />
    </FigmaPreviewWrap>
  );
}

/**
 * Figma COMPONENT_SET–style matrices on one tab:
 *
 * 1. **Pagination** — rows = `attention` (high · medium · low), columns = `size` (M · S · L).
 *    `firstPage` / `lastPage` true → `showFirstLast`; window at page 6 of 11.
 * 2. **PaginationItem** — rows = `size` (M · S · L); column groups = `attention` × `active` (false · true).
 *    Each cell is one chip with `page={1}`.
 */
export function PaginationFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Two matrices matching the Figma sheets: <strong>Pagination</strong> varies <code>attention</code> and{' '}
        <code>size</code> with <code>firstPage</code> and <code>lastPage</code> enabled (
        <code>showFirstLast</code>). <strong>PaginationItem</strong> follows the COMPONENT_SET: one chip per cell;
        columns are <code>active</code> false vs true within each <code>attention</code> group.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-pagination-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Pagination
          </caption>
          <tbody>
            {ATTENTION_ROWS.map(({ attention, rowLabel }) => (
              <tr key={attention} data-testrow={attention}>
                {SIZE_COLS.map(({ size }) => {
                  const testId = `pg-figma-nav-att-${attention}-sz-${size}`;
                  return (
                    <td key={size} className={`${styles.cell} ${styles.cellPagination}`}>
                      {figmaPaginationCell(attention, size, testId)}
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  {rowLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {SIZE_COLS.map(({ footer }) => (
                <td key={footer} className={styles.footerAxis}>
                  {footer}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
            <tr className={styles.footerRow}>
              <td colSpan={SIZE_COLS.length} className={styles.footerNote}>
                firstPage: true · lastPage: true
              </td>
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>

      <section className={styles.section} aria-label="PaginationItem Figma matrix">
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid="figma-pagination-item-grid">
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>
                ❖
              </span>{' '}
              PaginationItem
            </caption>
            <tbody>
              {ITEM_SIZE_ROWS.map(({ size, rowLabel }) => (
                <tr key={size} data-testrow={`size-${size}`}>
                  {ITEM_ATTENTION_GROUPS.flatMap(({ attention }) =>
                    ITEM_ACTIVE_COLS.map(({ selected, footer }) => {
                      const testId = `pg-figma-item-sz-${size}-att-${attention}-sel-${selected}`;
                      return (
                        <td key={`${attention}-${footer}`} className={`${styles.cell} ${styles.cellItem}`}>
                          {figmaPaginationItemCell(size, attention, selected, testId)}
                        </td>
                      );
                    }),
                  )}
                  <th scope="row" className={styles.rowLabelRight}>
                    {rowLabel}
                  </th>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                {ITEM_ATTENTION_GROUPS.flatMap(({ attention }) =>
                  ITEM_ACTIVE_COLS.map(({ footer }) => (
                    <td key={`${attention}-${footer}`} className={styles.footerAxis}>
                      {footer}
                    </td>
                  )),
                )}
                <td className={styles.footerCorner} aria-hidden />
              </tr>
              <tr className={styles.footerRow}>
                {ITEM_ATTENTION_GROUPS.map(({ groupLabel }) => (
                  <td key={groupLabel} colSpan={ITEM_ACTIVE_COLS.length} className={styles.footerGroup}>
                    {groupLabel}
                  </td>
                ))}
                <td className={styles.footerCorner} aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
