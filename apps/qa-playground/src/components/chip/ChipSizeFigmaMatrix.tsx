'use client';

import { Chip } from '@oneui/ui/components/Chip';
import { FIGMA_SIZE_ORDER, figmaSizeRowSlots } from './chipFigmaMatrixShared';
import styles from './chip-figma-validation.module.css';

const SELECTED_ROWS = [
  { selected: true as const, label: 'selected: true' },
  { selected: false as const, label: 'selected: false' },
] as const;

/**
 * Figma size strip: rows = `selected`, columns = **M · S · L** (Figma order).
 * Each cell uses start Icon + Label + end IndicatorBadge — matches the attached API-table art.
 */
export function ChipSizeFigmaMatrix() {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.gridTable} data-testid="chip-size-figma-matrix">
        <caption className={styles.figmaCaption}>
          <span className={styles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          size — S / M / L
        </caption>
        <tbody>
          {SELECTED_ROWS.map((row) => (
            <tr key={row.label} data-testrow={row.label}>
              {FIGMA_SIZE_ORDER.map(({ figma, size }) => {
                const { start, end } = figmaSizeRowSlots(size);
                const testId = `chip-size-sel-${row.selected}-sz-${figma}`;
                // testid on <td> — Chip does not forward data-testid to the DOM
                return (
                  <td key={figma} className={styles.cell} data-testid={testId}>
                    <Chip
                      appearance="secondary"
                      attention="low"
                      size={size}
                      defaultSelected={row.selected ? true : undefined}
                      selected={row.selected ? undefined : false}
                      start={start}
                      end={end}
                      aria-label={`Label, size ${figma}, ${row.label}`}
                    >
                      Label
                    </Chip>
                  </td>
                );
              })}
              <th scope="row" className={styles.rowLabelRight}>
                {row.label}
              </th>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.footerRow}>
            {FIGMA_SIZE_ORDER.map(({ figma }) => (
              <td key={figma} className={styles.footerSize}>
                {figma}
              </td>
            ))}
            <td className={styles.footerCorner} aria-hidden />
          </tr>
        </tfoot>
      </table>
      <p className={styles.metaLine}>
        Slot scale per chip size (Figma metadata): <code>start</code> Icon uses size token aligned to the chip;{' '}
        <code>end</code> IndicatorBadge uses <strong>S</strong> on S/M chips and <strong>L</strong> on L — see{' '}
        <code>Chip.showcase.tsx</code> WithSlots.
      </p>
    </div>
  );
}
