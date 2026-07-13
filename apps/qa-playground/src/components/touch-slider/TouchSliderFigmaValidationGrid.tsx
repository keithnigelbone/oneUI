'use client';

import { TouchSlider } from '@oneui/ui/components/TouchSlider';
import type { TouchSliderOrientation, TouchSliderProgressStyle } from '@oneui/ui/components/TouchSlider';
import { TouchSliderVolumeIcon } from './TouchSliderVolumeIcon';
import styles from './touch-slider-figma-validation.module.css';

/** Figma demo values from attached TouchSlider art. */
const VALUE_ROWS = [
  { value: 0, label: 'value: 0' },
  { value: 50, label: 'value: 50' },
  { value: 100, label: 'value: 100' },
] as const;

/** Column order matches attached sheet: H rounded · H straight/sharp · V rounded · V sharp. */
const GRID_COLS: {
  orientation: TouchSliderOrientation;
  progressStyle: TouchSliderProgressStyle;
  footer: string;
}[] = [
  { orientation: 'horizontal', progressStyle: 'rounded', footer: 'horizontal · rounded' },
  { orientation: 'horizontal', progressStyle: 'sharp', footer: 'horizontal · straight (sharp)' },
  { orientation: 'vertical', progressStyle: 'rounded', footer: 'vertical · rounded' },
  { orientation: 'vertical', progressStyle: 'sharp', footer: 'vertical · straight (sharp)' },
];

/**
 * Figma COMPONENT_SET matrix: rows = `value` (0 | 50 | 100), columns = orientation × progressStyle.
 * Each cell uses `start` slot with volume icon like the reference art.
 */
export function TouchSliderFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <div className={styles.parityCallout} data-testid="touch-slider-figma-parity-callout">
        <strong>QA note — compare to Figma art, not pixel-perfect pass.</strong> This grid renders{' '}
        <strong>as-shipped</strong> <code>TouchSlider</code> (no component changes from QA). Known visual gaps vs
        Figma: <code>rounded</code> has no moving circular knob (icon stays in <code>start</code> slot);{' '}
        <code>sharp</code> keeps a pill outer track (only trailing fill edge is flat); vertical track/fill may not
        match Figma — see <code>touch-slider-figma-parity.spec.ts</code>.
      </div>
      <p className={styles.metaLine}>
        Matrix from the attached <strong>TouchSlider</strong> Figma sheet: rows are <code>value</code> (0, 50,
        100); columns are <code>orientation</code> × <code>progressStyle</code>. Visual label{' '}
        <code>straight</code> maps to code <code>sharp</code>. Developer note: any value in range is valid — not
        only 0/50/100.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-touch-slider-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            TouchSlider
          </caption>
          <tbody>
            {VALUE_ROWS.map((row) => (
              <tr key={row.value} data-testrow={`value-${row.value}`}>
                {GRID_COLS.map(({ orientation, progressStyle }) => {
                  const testId = `ts-figma-val-${row.value}-ori-${orientation}-prog-${progressStyle}`;
                  const isVertical = orientation === 'vertical';
                  return (
                    <td key={`${orientation}-${progressStyle}`} className={styles.cell}>
                      <div
                        className={isVertical ? styles.trackWrapV : styles.trackWrapH}
                        data-testid={testId}
                      >
                        <TouchSlider
                          defaultValue={row.value}
                          orientation={orientation}
                          progressStyle={progressStyle}
                          appearance="secondary"
                          start={<TouchSliderVolumeIcon />}
                          aria-label={`Touch slider ${row.value} ${orientation} ${progressStyle}`}
                        />
                      </div>
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
              {GRID_COLS.map(({ footer }) => (
                <td key={footer} className={styles.footerCol}>
                  {footer}
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
