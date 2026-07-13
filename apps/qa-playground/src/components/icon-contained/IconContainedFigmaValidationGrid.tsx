'use client';

import { IconContained } from '@oneui/ui/components/IconContained';
import type { IconContainedAttention, IconContainedSize } from '@oneui/ui/components/IconContained';
import styles from '../shared/qa-figma-validation.module.css';

const SIZE_ROWS: readonly { size: IconContainedSize; label: string }[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

const ATTENTION_COLS: readonly { value: IconContainedAttention; label: string }[] = [
  { value: 'medium', label: 'medium' },
  { value: 'high', label: 'high' },
];

/** Figma grid: rows = size, columns = attention (medium | high). */
export function IconContainedFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Attached Figma matrix: <strong>size</strong> (XS–XL) × <strong>attention</strong> (medium tint vs high solid).{' '}
        <code>appearance=&quot;secondary&quot;</code> matches Figma default highlight.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-icon-contained-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            IconContained — size × attention
          </caption>
          <tbody>
            {SIZE_ROWS.map(({ size, label }) => (
              <tr key={size} data-testrow={`size-${size}`}>
                {ATTENTION_COLS.map(({ value: attention }) => (
                  <td key={attention} className={styles.cell}>
                    <span data-testid={`icon-contained-figma-val-${size}-${attention}`}>
                      <IconContained
                        icon="heart"
                        size={size}
                        attention={attention}
                        appearance="secondary"
                        aria-label={`${label} ${attention}`}
                      />
                    </span>
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  size: {label}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {ATTENTION_COLS.map(({ label }) => (
                <td key={label} className={styles.footerLabel}>
                  attention: {label}
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
