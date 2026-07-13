'use client';

import { SingleTextButton } from '@oneui/ui/components/SingleTextButton';
import type { SingleTextButtonAttention, SingleTextButtonSize } from '@oneui/ui/components/SingleTextButton';
import styles from '../shared/qa-figma-validation.module.css';

const SIZE_ROWS: readonly { size: SingleTextButtonSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

const ATTENTION_COLS: readonly { value: SingleTextButtonAttention; label: string }[] = [
  { value: 'high', label: 'high' },
  { value: 'medium', label: 'medium' },
  { value: 'low', label: 'low' },
];

/** Matches attached Figma matrix: size × attention with placeholder Ag. */
export function SingleTextButtonFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Figma matrix: <strong>size</strong> (S, M, L) × <strong>attention</strong> (high, medium, low),{' '}
        <code>condensed=false</code>, placeholder <code>Ag</code>.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-single-text-button-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            SingleTextButton — size × attention
          </caption>
          <tbody>
            {SIZE_ROWS.map(({ size, label }) => (
              <tr key={size} data-testrow={`size-${size}`}>
                {ATTENTION_COLS.map(({ value: attention }) => (
                  <td key={attention} className={styles.cell}>
                    <span data-testid={`single-text-button-figma-val-${size}-${attention}`}>
                      <SingleTextButton size={size} attention={attention}>
                        Ag
                      </SingleTextButton>
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

      <section className={styles.subSection} aria-labelledby="single-text-button-figma-condensed-title">
        <h3 id="single-text-button-figma-condensed-title" className={styles.figmaCaption}>
          <span className={styles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          SingleTextButton — condensed (Figma bottom rows)
        </h3>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid="figma-single-text-button-condensed-grid">
            <tbody>
              <tr>
                {SIZE_ROWS.map(({ size, label }) => (
                  <td key={size}>
                    <span data-testid={`single-text-button-figma-val-condensed-${size}`}>
                      <SingleTextButton size={size} condensed attention="high">
                        Ag
                      </SingleTextButton>
                    </span>
                    <div className={styles.footerLabel}>size: {label} · condensed</div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
