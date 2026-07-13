'use client';

import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import type { SelectableButtonAttention, SelectableButtonSize } from '@oneui/ui/components/SelectableButton';
import styles from '../shared/qa-figma-validation.module.css';

const SIZE_ROWS: readonly { size: SelectableButtonSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

/** Figma `elevation` → code `attention` for selected state. */
const ELEVATION_COLS: readonly { value: SelectableButtonAttention; label: string }[] = [
  { value: 'high', label: 'high' },
  { value: 'medium', label: 'medium' },
  { value: 'low', label: 'low' },
];

export function SelectableButtonFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix: Figma <strong>size</strong> (S–L) × <strong>elevation</strong> (high/medium/low) with{' '}
        <code>isSelected=true</code> (<code>selected</code> in code). Unselected row shown below for comparison.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-selectable-button-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            SelectableButton — size × elevation (selected)
          </caption>
          <tbody>
            {SIZE_ROWS.map(({ size, label }) => (
              <tr key={size} data-testrow={`size-${size}`}>
                {ELEVATION_COLS.map(({ value: attention }) => (
                  <td key={attention} className={styles.cell}>
                    <span data-testid={`selectable-button-figma-val-${size}-${attention}-selected`}>
                      <SelectableButton size={size} attention={attention} selected>
                        Button
                      </SelectableButton>
                    </span>
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  size: {label}
                </th>
              </tr>
            ))}
            <tr data-testrow="unselected">
              {ELEVATION_COLS.map(({ value: attention }) => (
                <td key={attention} className={styles.cell}>
                  <span data-testid={`selectable-button-figma-val-unselected-${attention}`}>
                    <SelectableButton size="m" attention={attention}>
                      Button
                    </SelectableButton>
                  </span>
                </td>
              ))}
              <th scope="row" className={styles.rowLabelRight}>
                isSelected: false
              </th>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              {ELEVATION_COLS.map(({ label }) => (
                <td key={label} className={styles.footerLabel}>
                  elevation: {label}
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
