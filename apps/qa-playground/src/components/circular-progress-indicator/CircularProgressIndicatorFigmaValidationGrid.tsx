'use client';

import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import type { CircularProgressIndicatorSize } from '@oneui/ui/components/CircularProgressIndicator';
import styles from './circular-progress-indicator-figma-validation.module.css';

/**
 * Row order matches Figma COMPONENT_SET: **M** first, then 2XS → 5XL (not numeric order).
 * Reference art uses primary-tint progress on a neutral track.
 */
const ROW_SIZES: { size: CircularProgressIndicatorSize; sizeLabel: string }[] = [
  { size: 'M', sizeLabel: 'M' },
  { size: '2XS', sizeLabel: '2XS' },
  { size: 'XS', sizeLabel: 'XS' },
  { size: 'S', sizeLabel: 'S' },
  { size: 'L', sizeLabel: 'L' },
  { size: 'XL', sizeLabel: 'XL' },
  { size: '2XL', sizeLabel: '2XL' },
  { size: '3XL', sizeLabel: '3XL' },
  { size: '4XL', sizeLabel: '4XL' },
  { size: '5XL', sizeLabel: '5XL' },
];

/** Column order matches Figma: determinate (fixed arc) then indeterminate (spinner). */
const VARIANT_COLS = [
  { variant: 'determinate' as const, footerShort: 'determinate' },
  { variant: 'indeterminate' as const, footerShort: 'indeterminate' },
] as const;

/**
 * Figma COMPONENT_SET–style matrix for Circular Progress Indicator: rows = `size` (M first, then 2XS…5XL),
 * columns = `variant` (determinate | indeterminate). Determinate cells use <code>value=&#123;25&#125;</code> like the reference art;
 * <code>appearance=&quot;primary&quot;</code> and <code>content=&quot;none&quot;</code> for a flat ring match to the file.
 */
export function CircularProgressIndicatorFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix matches Figma: columns are <strong>variant</strong> (<code>determinate</code> with <code>value=&#123;25&#125;</code>,{' '}
        <code>indeterminate</code>); rows are <strong>size</strong> in file order <strong>M</strong>, then{' '}
        <strong>2XS, XS, S, L, XL, 2XL, 3XL, 4XL, 5XL</strong>. Centre content <code>none</code>; <code>appearance=&quot;primary&quot;</code>{' '}
        for the accent ring tone shown in the design.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-circular-progress-indicator-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Circular Progress Indicator
          </caption>
          <tbody>
            {ROW_SIZES.map(({ size, sizeLabel }) => (
              <tr key={size} data-testrow={`size-${sizeLabel}`}>
                {VARIANT_COLS.map(({ variant }) => {
                  const testId = `cpi-figma-val-var-${variant}-sz-${sizeLabel}`;
                  const rowLabel = `size: ${sizeLabel}`;
                  return (
                    <td key={variant} className={styles.cell}>
                      <CircularProgressIndicator
                        variant={variant}
                        {...(variant === 'determinate' ? { value: 25 } : {})}
                        size={size}
                        appearance="primary"
                        content="none"
                        data-testid={testId}
                        aria-label={`Figma validation, ${rowLabel}, variant: ${variant}`}
                      />
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  size: {sizeLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {VARIANT_COLS.map(({ footerShort }) => (
                <td key={footerShort} className={styles.footerVariant}>
                  variant: {footerShort}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
