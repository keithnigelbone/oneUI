'use client';

import type { SpacingParityMatrix as SpacingParityMatrixType } from '@oneui/shared';
import { ParityStatusBadge } from './ParityStatusBadge';
import styles from './SpacingParityMatrix.module.css';

export interface SpacingParityMatrixProps {
  matrix: SpacingParityMatrixType;
}

const SIZE_LABELS: Record<string, string> = {
  '6': '2XS',
  '7': 'XS',
  '8': 'S',
  '10': 'M',
  '12': 'L',
  '14': 'XL',
  '16': '2XL',
};

function getSizeColumns(matrix: SpacingParityMatrixType): string[] {
  const sizeSet = new Set<string>();
  for (const row of matrix.rows) {
    for (const size of Object.keys(row.sizes)) {
      sizeSet.add(size);
    }
  }
  const sizes = Array.from(sizeSet);
  sizes.sort((a, b) => Number(a) - Number(b));
  return sizes;
}

export function SpacingParityMatrix({ matrix }: SpacingParityMatrixProps) {
  const sizeColumns = getSizeColumns(matrix);

  if (matrix.rows.length === 0) {
    return (
      <div className={styles.emptyState}>
        No spacing parity data available.
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th className={styles.cornerHeader}>Property</th>
            <th className={styles.cornerHeader}>Slot</th>
            {sizeColumns.map((size) => (
              <th key={size} className={styles.columnHeader}>
                {SIZE_LABELS[size] ?? size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row, rowIndex) => (
            <tr key={`${row.tokenProperty}-${row.slot ?? 'none'}-${rowIndex}`}>
              <td className={styles.rowHeader}>{row.tokenProperty}</td>
              <td className={styles.slotCell}>{row.slot ?? '\u2014'}</td>
              {sizeColumns.map((size) => {
                const cellData = row.sizes[size];
                if (!cellData) {
                  return <td key={size} className={styles.cell} data-empty="true">\u2014</td>;
                }
                return (
                  <td key={size} className={styles.cell} data-status={cellData.status}>
                    <div className={styles.cellContent}>
                      <ParityStatusBadge status={cellData.status} showLabel={false} />
                      <div className={styles.cellValues}>
                        {cellData.figmaValue != null && (
                          <span className={styles.figmaValue}>{cellData.figmaValue}</span>
                        )}
                        <span className={styles.toolValue}>{cellData.toolValue}</span>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
