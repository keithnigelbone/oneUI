'use client';

import type { ReactNode } from 'react';
import { PaginationDots } from '@oneui/ui/components/PaginationDots';
import styles from '../pagination/pagination-figma-validation.module.css';

/** Figma COMPONENT_SET columns: pageCount 5+ · 2 · 3 · 4 · 5. */
const PAGE_COUNT_COLS = [
  { figmaLabel: '5+', pageCount: 12 },
  { figmaLabel: '2', pageCount: 2 },
  { figmaLabel: '3', pageCount: 3 },
  { figmaLabel: '4', pageCount: 4 },
  { figmaLabel: '5', pageCount: 5 },
] as const;

/** Figma rows: loop true (top) · loop false (bottom). */
const LOOP_ROWS = [
  { loop: true as const, rowLabel: 'loop: true' },
  { loop: false as const, rowLabel: 'loop: false' },
] as const;

/** Figma sheet shows first page active in every cell → `defaultActiveIndex: 0` (0-based). */
const FIGMA_ACTIVE_INDEX = 0;

function FigmaPreviewWrap({ children }: { children: ReactNode }) {
  return <div className={styles.previewWrap}>{children}</div>;
}

function figmaDotsCell(loop: boolean, pageCount: number, figmaLabel: string) {
  const testId = `pd-figma-loop-${loop}-pagecount-${figmaLabel.replace(/\+/g, 'plus')}`;
  return (
    <FigmaPreviewWrap>
      <PaginationDots
        data-testid={testId}
        pageCount={pageCount}
        defaultActiveIndex={FIGMA_ACTIVE_INDEX}
        loop={loop}
        appearance="primary"
        aria-label={`Figma pageCount ${figmaLabel} loop ${String(loop)}`}
      />
    </FigmaPreviewWrap>
  );
}

/**
 * Figma COMPONENT_SET matrix: rows = `loop`, columns = `pageCount` (5+ · 2 · 3 · 4 · 5).
 * `currentPage` is code-only → `activeIndex` / `defaultActiveIndex` ⚠️.
 */
export function PaginationDotsFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix from the Figma sheet: <strong>PaginationDots</strong> varies <code>pageCount</code> and{' '}
        <code>loop</code>. Each cell uses <code>defaultActiveIndex={FIGMA_ACTIVE_INDEX}</code> (Figma{' '}
        <code>currentPage: 1</code>) ⚠️. Column <code>5+</code> uses <code>pageCount={12}</code> (windowed dots).
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-pagination-dots-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            PaginationDots
          </caption>
          <tbody>
            {LOOP_ROWS.map(({ loop, rowLabel }) => (
              <tr key={rowLabel} data-testrow={rowLabel}>
                {PAGE_COUNT_COLS.map(({ figmaLabel, pageCount }) => (
                  <td key={`${rowLabel}-${figmaLabel}`} className={`${styles.cell} ${styles.cellPagination}`}>
                    {figmaDotsCell(loop, pageCount, figmaLabel)}
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  {rowLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {PAGE_COUNT_COLS.map(({ figmaLabel }) => (
                <td key={figmaLabel} className={styles.footerAxis}>
                  {`pageCount: ${figmaLabel}`}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
            <tr className={styles.footerRow}>
              <td colSpan={PAGE_COUNT_COLS.length} className={styles.footerNote}>
                currentPage: 1 — code defaultActiveIndex: 0 ⚠️
              </td>
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
