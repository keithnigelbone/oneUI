'use client';

import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import type { CounterBadgeAttention, CounterBadgeSize } from '@oneui/ui/components/CounterBadge';
import styles from './counter-badge-figma-validation.module.css';

/** Row order matches the Figma COMPONENT_SET: **M**, **XS**, **S**, **L**. */
const ROW_SIZES: { size: CounterBadgeSize; sizeLabel: string }[] = [
  { size: 'm', sizeLabel: 'M' },
  { size: 'xs', sizeLabel: 'XS' },
  { size: 's', sizeLabel: 'S' },
  { size: 'l', sizeLabel: 'L' },
];

const ATTENTION_COLS = ['high', 'medium', 'low'] as const satisfies readonly CounterBadgeAttention[];

const MATRIX_VALUE = 8;

/**
 * Figma COMPONENT_SET matrix for Counter Badge: rows = **size** (M, XS, S, L), columns = **attention**
 * (high, medium, low). Uses <code>value=&#123;8&#125;</code> to match reference art; <code>appearance=&quot;auto&quot;</code>.
 *
 * Figma shows size **XS** + **high** as a dot without numerals; the web component still renders the digit — see TODO in {@link CounterBadgeQaShowcase}.
 */
export function CounterBadgeFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid="counter-badge-figma-validation-root">
      <p className={styles.metaLine}>
        Matrix matches the Figma file: rows are <strong>size</strong> (<strong>M</strong>, <strong>XS</strong>, <strong>S</strong>,{' '}
        <strong>L</strong>); columns are <strong>attention</strong> (<code>high</code>, <code>medium</code>, <code>low</code>).
        Each cell uses <code>value=&#123;{MATRIX_VALUE}&#125;</code> and <code>appearance=&quot;auto&quot;</code>.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-counter-badge-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Counter Badge
          </caption>
          <tbody>
            {ROW_SIZES.map(({ size, sizeLabel }) => (
              <tr key={size} data-testrow={`size-${sizeLabel}`}>
                {ATTENTION_COLS.map((attention) => {
                  const testId = `counter-badge-figma-sz-${sizeLabel}-att-${attention}`;
                  return (
                    <td key={attention} className={styles.cell}>
                      <CounterBadge
                        value={MATRIX_VALUE}
                        size={size}
                        attention={attention}
                        appearance="auto"
                        data-testid={testId}
                        aria-label={`Figma validation, size ${sizeLabel}, attention ${attention}, value ${MATRIX_VALUE}`}
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
              {ATTENTION_COLS.map((attention) => (
                <td key={attention} className={styles.footerAttention}>
                  attention: {attention}
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
