'use client';

import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import type { IndicatorBadgeAppearance, IndicatorBadgeSize } from '@oneui/ui/components/IndicatorBadge';
import styles from './indicator-badge-figma-validation.module.css';

/** Row order matches the Figma size strip: **XS**, **S**, **M**, **L**, **XL**. */
const ROW_SIZES: { size: IndicatorBadgeSize; sizeLabel: string }[] = [
  { size: 'xs', sizeLabel: 'XS' },
  { size: 's', sizeLabel: 'S' },
  { size: 'm', sizeLabel: 'M' },
  { size: 'l', sizeLabel: 'L' },
  { size: 'xl', sizeLabel: 'XL' },
];

/** Figma variable-mode column set (no `brand-bg` in the spec screenshot). */
const COL_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly IndicatorBadgeAppearance[];

function appearanceTestSlug(appearance: string): string {
  return appearance.replace(/-/g, '');
}

/**
 * Figma COMPONENT_SET matrix for Indicator Badge: rows = **size** (XS … XL), columns = **appearance**
 * (Figma variable modes). Dots are empty; labels come from <code>aria-label</code> only.
 */
export function IndicatorBadgeFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid="indicator-badge-figma-validation-root">
      <p className={styles.metaLine}>
        Matrix matches the Figma file: rows are <strong>size</strong> (<strong>XS</strong> through <strong>XL</strong>); columns are{' '}
        <strong>appearance</strong> roles from the variable-mode table (<code>auto</code> … <code>informative</code>).{' '}
        <code>brand-bg</code> is supported in code but not listed in that Figma table — see Test Scenarios tab ⚠️.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-indicator-badge-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Indicator Badge
          </caption>
          <tbody>
            {ROW_SIZES.map(({ size, sizeLabel }) => (
              <tr key={size} data-testrow={`size-${sizeLabel}`}>
                {COL_APPEARANCES.map((appearance) => {
                  const slug = appearanceTestSlug(appearance);
                  const testId = `indicator-badge-figma-sz-${sizeLabel}-app-${slug}`;
                  return (
                    <td key={appearance} className={styles.cell}>
                      <IndicatorBadge
                        size={size}
                        appearance={appearance}
                        data-testid={testId}
                        aria-label={`Figma validation, size ${sizeLabel}, appearance ${appearance}`}
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
              {COL_APPEARANCES.map((appearance) => (
                <td key={appearance} className={styles.footerAppearance}>
                  appearance: {appearance}
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
