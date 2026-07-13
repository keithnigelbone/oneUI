'use client';

import { Icon } from '@oneui/ui/components/Icon';
import { ICON_SIZES } from '@oneui/ui/components/Icon';
import type { IconAppearance, IconEmphasis, IconSize } from '@oneui/ui/components/Icon/shared';
import styles from './icon-figma-validation.module.css';

/** Figma API table order — 8 colour roles. */
const APPEARANCE_ROWS: readonly IconAppearance[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

/** Figma emphasis colour tokens — column order. */
const EMPHASIS_COLS: readonly { value: IconEmphasis; footerShort: string }[] = [
  { value: 'high', footerShort: 'high' },
  { value: 'medium', footerShort: 'medium [text]' },
  { value: 'low', footerShort: 'low [text]' },
  { value: 'tinted', footerShort: 'tinted' },
  { value: 'tintedA11y', footerShort: 'tintedA11y' },
] as const;

/** Representative size subset for the size grid (all 20 in API table). */
const SIZE_ROW_SAMPLES: readonly IconSize[] = [
  '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32', '40',
] as const;

/**
 * Figma COMPONENT_SET–style matrix for Icon: rows = `appearance` (8 roles),
 * columns = `emphasis` (5 levels). Fixed `icon="heart"` and `size="8"` like the reference art.
 * Secondary grid: all size presets at `appearance="primary"`, `emphasis="high"`.
 */
export function IconFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix matches Figma API: columns are <strong>emphasis</strong> (<code>high</code>,{' '}
        <code>medium [text]</code>, <code>low [text]</code>, <code>tinted</code>, <code>tintedA11y</code>); rows
        are <strong>appearance</strong> (8 colour roles). Every cell uses <code>icon=&quot;heart&quot;</code> and{' '}
        <code>size=&quot;8&quot;</code>.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-icon-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Icon — appearance × emphasis
          </caption>
          <tbody>
            {APPEARANCE_ROWS.map((appearance) => (
              <tr key={appearance} data-testrow={`appearance-${appearance}`}>
                {EMPHASIS_COLS.map(({ value: emphasis }) => {
                  const testId = `icon-figma-val-app-${appearance}-emp-${emphasis}`;
                  return (
                    <td key={emphasis} className={styles.cell}>
                      <Icon
                        icon="heart"
                        appearance={appearance}
                        emphasis={emphasis}
                        size="8"
                        aria-label={`${appearance} ${emphasis}`}
                        data-testid={testId}
                      />
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  appearance: {appearance}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {EMPHASIS_COLS.map(({ footerShort }) => (
                <td key={footerShort} className={styles.footerEmphasis}>
                  emphasis: {footerShort}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>

      <section className={styles.sizeSection} aria-labelledby="icon-figma-size-grid-title">
        <h3 id="icon-figma-size-grid-title" className={styles.figmaCaption}>
          <span className={styles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          Icon — size (variable mode)
        </h3>
        <p className={styles.metaLine}>
          All {ICON_SIZES.length} Figma size values; grid shows representative subset at{' '}
          <code>appearance=&quot;primary&quot;</code>, <code>emphasis=&quot;high&quot;</code>,{' '}
          <code>icon=&quot;heart&quot;</code>.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.sizeGridTable} data-testid="figma-icon-size-grid">
            <tbody>
              <tr>
                {SIZE_ROW_SAMPLES.map((size) => (
                  <td key={size}>
                    <Icon
                      icon="heart"
                      size={size}
                      appearance="primary"
                      emphasis="high"
                      aria-label={`Size ${size}`}
                      data-testid={`icon-figma-val-size-${size}`}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                {SIZE_ROW_SAMPLES.map((size) => (
                  <td key={`label-${size}`} className={styles.sizeCellLabel}>
                    size: {size}
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
