'use client';

import { Stepper } from '@oneui/ui/components/Stepper';
import styles from './stepper-figma-validation.module.css';

/** Row order matches Figma: `condensed: false` → M, S, L then `condensed: true` → M, S, L. */
const ROW_SPECS = [
  { condensed: false as const, size: 'm' as const, sizeLabel: 'M' },
  { condensed: false as const, size: 's' as const, sizeLabel: 'S' },
  { condensed: false as const, size: 'l' as const, sizeLabel: 'L' },
  { condensed: true as const, size: 'm' as const, sizeLabel: 'M' },
  { condensed: true as const, size: 's' as const, sizeLabel: 'S' },
  { condensed: true as const, size: 'l' as const, sizeLabel: 'L' },
] as const;

/** Column order matches Figma footer: medium → high → low. */
const ATTENTION_COLS = [
  { attention: 'medium' as const, footerShort: 'medium' },
  { attention: 'high' as const, footerShort: 'high' },
  { attention: 'low' as const, footerShort: 'low' },
] as const;

/**
 * Figma COMPONENT_SET–style matrix for Stepper: rows = `condensed` × `size` (M, S, L per group),
 * columns = `attention` (medium | high | low). Value fixed at **1** like the reference art.
 * Uses `appearance="positive"` for the orange / peach emphasis family shown in the file.
 */
export function StepperFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix matches Figma: columns are <strong>attention</strong> (<code>medium</code>, <code>high</code>,{' '}
        <code>low</code>); rows are <strong>condensed</strong> (<code>false</code> then <code>true</code>) with sizes{' '}
        <strong>M, S, L</strong> each. Every cell uses <code>defaultValue=&#123;1&#125;</code>. Implemented control order
        is decrement | value | increment (Base UI); if Figma art mirrors +/-, compare visually only.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-stepper-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Stepper
          </caption>
          <tbody>
            {ROW_SPECS.map((row) => (
              <tr
                key={`${row.condensed}-${row.size}`}
                data-testrow={`condensed-${row.condensed}-size-${row.size}`}
              >
                {ATTENTION_COLS.map(({ attention }) => {
                  const testId = `st-figma-val-cond-${row.condensed}-sz-${row.size}-att-${attention}`;
                  const rowLabel = `condensed: ${row.condensed} · size: ${row.sizeLabel}`;
                  return (
                    <td key={attention} className={styles.cell}>
                      <Stepper
                        appearance="secondary"
                        attention={attention}
                        condensed={row.condensed}
                        defaultValue={1}
                        size={row.size}
                        data-testid={testId}
                        partProps={{
                          input: {
                            'aria-label': `Quantity, ${rowLabel}, attention: ${attention}`,
                          },
                        }}
                      />
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  condensed: {String(row.condensed)} · size: {row.sizeLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {ATTENTION_COLS.map(({ footerShort }) => (
                <td key={footerShort} className={styles.footerAttention}>
                  attention: {footerShort}
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
