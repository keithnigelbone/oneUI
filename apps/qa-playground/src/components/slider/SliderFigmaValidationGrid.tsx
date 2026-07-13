'use client';

import { Slider } from '@oneui/ui/components/Slider';
import type { SliderKnobStyle } from '@oneui/ui/components/Slider';
import { IconButton } from '@oneui/ui/components/IconButton';
import styles from './slider-figma-validation.module.css';

/** Row order matches attached Figma art: continuous then range. */
const TYPE_ROWS = [
  { typeLabel: 'continuous', defaultValue: 50 as number | number[], ariaLabel: 'Continuous slider' },
  { typeLabel: 'range', defaultValue: [25, 75] as number | number[], ariaLabel: 'Range slider' },
] as const;

/** Column order: inside then outside (matches Figma grid left-to-right). */
const KNOB_COLS: { knobStyle: SliderKnobStyle; footerShort: string }[] = [
  { knobStyle: 'inside', footerShort: 'inside' },
  { knobStyle: 'outside', footerShort: 'outside' },
];

/**
 * Figma COMPONENT_SET–style matrix for Slider: rows = `type` (continuous | range),
 * columns = `knobStyle` (inside | outside). Start/end IconButtons mirror the reference art (− / +).
 */
export function SliderFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix matches the attached Figma sheet: columns are <strong>knobStyle</strong> (<code>inside</code>,{' '}
        <code>outside</code>); rows are <strong>type</strong> (<code>continuous</code>, <code>range</code>). Each cell
        includes <code>start</code>/<code>end</code> IconButtons like the spec examples.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-slider-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Slider
          </caption>
          <tbody>
            {TYPE_ROWS.map((row) => (
              <tr key={row.typeLabel} data-testrow={`type-${row.typeLabel}`}>
                {KNOB_COLS.map(({ knobStyle }) => {
                  const testId = `sl-figma-val-type-${row.typeLabel}-knob-${knobStyle}`;
                  const isRange = Array.isArray(row.defaultValue);
                  return (
                    <td key={knobStyle} className={styles.cell}>
                      <div className={styles.trackWrap} style={{ width: '100%', maxWidth: 328 }}>
                        <Slider
                          defaultValue={row.defaultValue}
                          knobStyle={knobStyle}
                          appearance="secondary"
                          aria-label={row.ariaLabel}
                          {...(isRange ? { ariaLabels: ['Minimum', 'Maximum'] } : {})}
                          start={
                            <IconButton
                              icon="remove"
                              size="xs"
                              attention="low"
                              aria-label="Decrease"
                            />
                          }
                          end={
                            <IconButton
                              icon="add"
                              size="xs"
                              attention="low"
                              aria-label="Increase"
                            />
                          }
                          data-testid={testId}
                        />
                      </div>
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  type: {row.typeLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {KNOB_COLS.map(({ footerShort }) => (
                <td key={footerShort} className={styles.footerKnob}>
                  knobStyle: {footerShort}
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
