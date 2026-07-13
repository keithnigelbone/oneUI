'use client';

import type { ComponentProps } from 'react';
import { Switch } from '@oneui/ui/components/Switch';
import styles from './switch-figma-validation.module.css';

/** Column order matches Figma: `readOnly: false` → M, S, L then `readOnly: true` → M, S, L. */
const CELL_SPECS = [
  { readOnly: false as const, size: 'm' as const, sizeLabel: 'M' },
  { readOnly: false as const, size: 's' as const, sizeLabel: 'S' },
  { readOnly: false as const, size: 'l' as const, sizeLabel: 'L' },
  { readOnly: true as const, size: 'm' as const, sizeLabel: 'M' },
  { readOnly: true as const, size: 's' as const, sizeLabel: 'S' },
  { readOnly: true as const, size: 'l' as const, sizeLabel: 'L' },
] as const;

type SwitchProps = ComponentProps<typeof Switch>;

function cellSwitchProps(checked: boolean, spec: (typeof CELL_SPECS)[number]): Omit<SwitchProps, 'children'> {
  return {
    /** Orange / peach palette aligned with Figma Switch component set */
    appearance: 'positive',
    checked,
    readOnly: spec.readOnly,
    size: spec.size,
    disabled: false,
  };
}

/**
 * Figma COMPONENT_SET–style matrix: rows = `selected`, columns = `readOnly` × `size` (M, S, L),
 * row labels on the right, size + readOnly group labels in the footer (matches design QA layout).
 */
export function SwitchFigmaValidationGrid() {
  const selectedRows: { checked: boolean; label: string }[] = [
    { checked: false, label: 'selected: false' },
    { checked: true, label: 'selected: true' },
  ];

  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix matches Figma: horizontal groups are <strong>readOnly</strong> (false | true), sub-columns are
        size <strong>M, S, L</strong>; vertical rows are <strong>selected</strong> (false | true). Labels mirror the
        file: sizes and readOnly under the grid, selected on the right.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-switch-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Switch
          </caption>
          <tbody>
            {selectedRows.map(({ checked, label }) => (
              <tr key={label} data-testrow={label}>
                {CELL_SPECS.map((spec, colIndex) => {
                  const base = cellSwitchProps(checked, spec);
                  const testId = `sw-figma-val-sel-${checked}-ro-${spec.readOnly}-sz-${spec.size}`;
                  return (
                    <td key={`${label}-${colIndex}`} className={styles.cell}>
                      <Switch
                        {...base}
                        data-testid={testId}
                        aria-label={`${label}, readOnly: ${spec.readOnly}, size ${spec.sizeLabel}`}
                      />
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  {label}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {CELL_SPECS.map((spec, i) => (
                <td key={`size-${i}`} className={styles.footerSize}>
                  {spec.sizeLabel}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
            <tr className={styles.footerRow}>
              <td colSpan={3} className={styles.footerReadonlyGroup}>
                readOnly: false
              </td>
              <td colSpan={3} className={styles.footerReadonlyGroup}>
                readOnly: true
              </td>
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
