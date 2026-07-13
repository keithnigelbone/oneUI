'use client';

import { IconButton } from '@oneui/ui/components/IconButton';
import { IconButtonFigmaMasterMatrix } from './IconButtonFigmaMasterMatrix';
import {
  FIGMA_ATTENTION_LEVELS,
  FIGMA_SIZE_ATTENTION_SIZES,
  figmaSizeAttentionTestId,
} from './icon-button-figma-matrix';
import styles from '../shared/qa-figma-validation.module.css';

/**
 * Image 2 — Figma matrix: rows = size (2XS–XL), columns = attention (high / medium / low).
 * Fixed appearance=primary, layout=1:1, icon=star.
 */
function IconButtonSizeAttentionGrid() {
  return (
    <section aria-labelledby="icon-button-figma-size-attention-title">
      <h3 id="icon-button-figma-size-attention-title" className={styles.figmaCaption}>
        <span className={styles.figmaCaptionMark} aria-hidden>
          ❖
        </span>{' '}
        IconButton — size × attention (Figma image 2)
      </h3>
      <p className={styles.metaLine}>
        Current baseline grid: <strong>size</strong> × <strong>attention</strong> at{' '}
        <code>appearance=&quot;primary&quot;</code>, <code>shape 1:1</code> (
        <code>layout=&quot;1:1&quot;</code>).
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-icon-button-grid">
          <caption className={styles.figmaCaption}>
            18 variants — 6 sizes × 3 attention levels
          </caption>
          <tbody>
            {FIGMA_SIZE_ATTENTION_SIZES.map(({ size, label }) => (
              <tr key={size} data-testrow={`size-${size}`}>
                {FIGMA_ATTENTION_LEVELS.map(({ value: attention }) => (
                  <td key={attention} className={styles.cell}>
                    <IconButton
                      icon="star"
                      size={size}
                      attention={attention}
                      appearance="primary"
                      layout="1:1"
                      aria-label={`${label} ${attention}`}
                      data-testid={figmaSizeAttentionTestId(size, attention)}
                    />
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
              {FIGMA_ATTENTION_LEVELS.map(({ label }) => (
                <td key={label} className={styles.footerLabel}>
                  attention: {label}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export function IconButtonFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <IconButtonSizeAttentionGrid />

      <IconButtonFigmaMasterMatrix />

      <section className={styles.subSection} aria-labelledby="icon-button-figma-shape-title">
        <h3 id="icon-button-figma-shape-title" className={styles.figmaCaption}>
          <span className={styles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          Shape reference — 1:1 vs 2:3 (code layout)
        </h3>
        <p className={styles.metaLine}>
          Figma <code>shape: 1:1</code> and <code>2:3</code> map to{' '}
          <code>layout: &apos;1:1&apos; | &apos;3:2&apos;</code>.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid="figma-icon-button-shape-grid">
            <tbody>
              <tr>
                <td className={styles.cell}>
                  <IconButton
                    icon="star"
                    layout="1:1"
                    attention="high"
                    aria-label="Shape 1:1"
                    data-testid="icon-button-figma-val-shape-1-1"
                  />
                </td>
                <td className={styles.cell}>
                  <IconButton
                    icon="star"
                    layout="3:2"
                    attention="high"
                    aria-label="Shape 2:3"
                    data-testid="icon-button-figma-val-shape-3-2"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.footerLabel}>shape: 1:1</td>
                <td className={styles.footerLabel}>shape: 2:3 → layout 3:2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
