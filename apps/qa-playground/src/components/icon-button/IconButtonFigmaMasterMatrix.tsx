'use client';

import { IconButton } from '@oneui/ui/components/IconButton';
import {
  FIGMA_ATTENTION_LEVELS,
  FIGMA_MASTER_MATRIX_COLUMNS,
  FIGMA_MATRIX_SIZE_ROWS,
  figmaMasterMatrixTestId,
} from './icon-button-figma-matrix';
import styles from '../shared/qa-figma-validation.module.css';
import matrixStyles from './icon-button-figma-master-matrix.module.css';

const MATRIX_WIDTH = { width: 'var(--Spacing-40)' } as const;

interface MatrixBlockProps {
  condensed: boolean;
}

/**
 * Figma COMPONENT_SET master matrix (image 1):
 * condensed × size × (shape 1:1 | shape 2:3 | fullWidth | neutral) × attention.
 */
function MatrixBlock({ condensed }: MatrixBlockProps) {
  return (
    <div className={matrixStyles.block} data-condensed={condensed ? 'true' : 'false'}>
      <h4 className={matrixStyles.blockTitle}>
        condensed: {condensed ? 'true' : 'false'}
      </h4>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid={`figma-icon-button-master-c${condensed ? '1' : '0'}`}>
          <thead>
            <tr>
              {FIGMA_MASTER_MATRIX_COLUMNS.map((col) => (
                <th key={col.id} colSpan={3} scope="colgroup" className={matrixStyles.groupHeader}>
                  {col.figmaLabel}
                </th>
              ))}
              <th scope="col" className={styles.footerCorner} aria-hidden />
            </tr>
            <tr>
              {FIGMA_MASTER_MATRIX_COLUMNS.flatMap((col) =>
                FIGMA_ATTENTION_LEVELS.map(({ label }) => (
                  <th key={`${col.id}-${label}`} scope="col" className={styles.footerLabel}>
                    {label}
                  </th>
                )),
              )}
              <th scope="col" className={styles.footerCorner}>
                size
              </th>
            </tr>
          </thead>
          <tbody>
            {FIGMA_MATRIX_SIZE_ROWS.map(({ size, label: sizeLabel }) => (
              <tr key={size} data-testrow={`c${condensed ? '1' : '0'}-size-${size}`}>
                {FIGMA_MASTER_MATRIX_COLUMNS.flatMap((col) =>
                  FIGMA_ATTENTION_LEVELS.map(({ value: attention, label: attentionLabel }) => {
                    const figmaOmitted = condensed && col.unavailableWhenCondensed;
                    const cell = col.cellProps(attention);
                    return (
                      <td
                        key={`${col.id}-${attention}`}
                        className={figmaOmitted ? matrixStyles.cellFigmaOmitted : styles.cell}
                        title={
                          figmaOmitted
                            ? 'Figma omits neutral black/grey when condensed — shown for implementation QA'
                            : undefined
                        }
                      >
                        <div style={col.id === 'full-width' ? MATRIX_WIDTH : undefined}>
                          <IconButton
                            icon="heart"
                            size={size}
                            condensed={condensed}
                            layout={cell.layout}
                            fullWidth={cell.fullWidth}
                            appearance={cell.appearance}
                            attention={cell.attention}
                            aria-label={`${sizeLabel} ${col.id} ${attentionLabel}`}
                            data-testid={figmaMasterMatrixTestId(condensed, size, col.id, attention)}
                          />
                        </div>
                      </td>
                    );
                  }),
                )}
                <th scope="row" className={styles.rowLabelRight}>
                  size: {sizeLabel}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IconButtonFigmaMasterMatrix() {
  return (
    <section
      className={styles.subSection}
      aria-labelledby="icon-button-figma-master-title"
      data-testid="figma-icon-button-master-matrix"
    >
      <h3 id="icon-button-figma-master-title" className={styles.figmaCaption}>
        <span className={styles.figmaCaptionMark} aria-hidden>
          ❖
        </span>{' '}
        IconButton — full Figma COMPONENT_SET (image 1)
      </h3>
      <p className={styles.metaLine}>
        Heart icon matches Figma asset. <code>shape: 2:3</code> → <code>layout=&quot;3:2&quot;</code>. Neutral
        black/grey column uses <code>appearance=&quot;neutral&quot;</code> (dashed outline when Figma omits at{' '}
        <code>condensed: true</code>).
      </p>
      <MatrixBlock condensed={false} />
      <MatrixBlock condensed={true} />
    </section>
  );
}
