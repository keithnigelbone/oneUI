'use client';

import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import type {
  SegmentedControlAttention,
  SegmentedControlShape,
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
  SegmentedControlType,
} from '@oneui/ui/components/SegmentedControl';
import { Icon } from '@oneui/ui/components/Icon';
import styles from './segmented-control-figma-validation.module.css';
import {
  SEGMENTED_CONTROL_SIZE_ATTENTION_MATRIX_COUNT,
  SEGMENTED_CONTROL_VARIANT_MATRIX_COUNT,
} from './segmentedControlQaConstants';

const HEART_ICON = <Icon icon="heart" size="m" aria-hidden />;

const SIZE_ROWS: readonly { size: SegmentedControlSize; label: string }[] = [
  { size: 'm', label: 'M' },
  { size: 's', label: 'S' },
  { size: 'l', label: 'L' },
];

const ATTENTION_COLS: readonly { value: SegmentedControlAttention; label: string }[] = [
  { value: 'high', label: 'high' },
  { value: 'medium', label: 'medium' },
  { value: 'low', label: 'low' },
];

const MATRIX_ATTENTIONS = ['high', 'medium', 'low'] as const satisfies readonly SegmentedControlAttention[];
const MATRIX_TRACK = ['high', 'medium', 'low'] as const satisfies readonly SegmentedControlTrackEmphasis[];
const MATRIX_SHAPES = ['pill', 'rectangular'] as const satisfies readonly SegmentedControlShape[];
const MATRIX_SIZES = ['s', 'm', 'l'] as const satisfies readonly SegmentedControlSize[];
const MATRIX_TYPES = ['text', 'icon'] as const satisfies readonly SegmentedControlType[];
const MATRIX_DISABLED = [false, true] as const;

const VARIANT_ROW_COUNT = MATRIX_ATTENTIONS.length * MATRIX_TRACK.length * MATRIX_SHAPES.length * MATRIX_DISABLED.length;
const VARIANT_COL_COUNT = MATRIX_SIZES.length * MATRIX_TYPES.length;

if (VARIANT_ROW_COUNT * VARIANT_COL_COUNT !== SEGMENTED_CONTROL_VARIANT_MATRIX_COUNT) {
  throw new Error('SegmentedControl variant matrix count mismatch');
}

function variantRowAxes(row: number): {
  attention: SegmentedControlAttention;
  trackEmphasis: SegmentedControlTrackEmphasis;
  shape: SegmentedControlShape;
  disabled: boolean;
} {
  const attention = MATRIX_ATTENTIONS[Math.floor(row / (MATRIX_TRACK.length * MATRIX_SHAPES.length * MATRIX_DISABLED.length))];
  const rem1 = row % (MATRIX_TRACK.length * MATRIX_SHAPES.length * MATRIX_DISABLED.length);
  const trackEmphasis = MATRIX_TRACK[Math.floor(rem1 / (MATRIX_SHAPES.length * MATRIX_DISABLED.length))];
  const rem2 = rem1 % (MATRIX_SHAPES.length * MATRIX_DISABLED.length);
  const shape = MATRIX_SHAPES[Math.floor(rem2 / MATRIX_DISABLED.length)];
  const disabled = MATRIX_DISABLED[rem2 % MATRIX_DISABLED.length];
  return { attention, trackEmphasis, shape, disabled };
}

function VariantSegments({ row, col }: { row: number; col: number }) {
  const { attention, trackEmphasis, shape, disabled } = variantRowAxes(row);
  const size = MATRIX_SIZES[Math.floor(col / MATRIX_TYPES.length)];
  const type = MATRIX_TYPES[col % MATRIX_TYPES.length];

  return (
    <SegmentedControl
      size={size}
      attention={attention}
      trackEmphasis={trackEmphasis}
      shape={shape}
      type={type}
      equalWidth={type === 'text'}
      disabled={disabled}
      defaultValue="a"
      aria-label={`Variant ${row}-${col}`}
    >
      {type === 'icon' ? (
        <>
          <SegmentedControl.Item value="a" start={HEART_ICON} aria-label="One" />
          <SegmentedControl.Item value="b" start={HEART_ICON} aria-label="Two" />
          <SegmentedControl.Item value="c" start={HEART_ICON} aria-label="Three" />
        </>
      ) : (
        <>
          <SegmentedControl.Item value="a">Button</SegmentedControl.Item>
          <SegmentedControl.Item value="b">Button</SegmentedControl.Item>
          <SegmentedControl.Item value="c">Button</SegmentedControl.Item>
        </>
      )}
    </SegmentedControl>
  );
}

function variantRowLabel(row: number): string {
  const { attention, trackEmphasis, shape, disabled } = variantRowAxes(row);
  return `attention: '${attention}', trackEmphasis: '${trackEmphasis}', shape: '${shape}', disabled: '${disabled}'`;
}

function variantColType(col: number): SegmentedControlType {
  return MATRIX_TYPES[col % MATRIX_TYPES.length];
}

function variantColLabel(col: number): string {
  const size = MATRIX_SIZES[Math.floor(col / MATRIX_TYPES.length)];
  const type = variantColType(col);
  return `${size} / ${type}`;
}

function VariantCell({ row, col }: { row: number; col: number }) {
  const type = variantColType(col);
  const stretch = type === 'text';

  return (
    <td className={styles.variantCell}>
      <div className={styles.variantCellInner} data-stretch={stretch ? 'true' : undefined}>
        <span data-testid={`segmented-control-figma-var-${row}-${col}`}>
          <VariantSegments row={row} col={col} />
        </span>
      </div>
    </td>
  );
}

/**
 * Figma COMPONENT_SET validation for SegmentedControl — full variant grid +
 * size × attention matrix (Divider-style shell).
 */
export function SegmentedControlFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid="segmented-control-figma-validation-root">
      <p className={styles.metaLine}>
        Full variant grid (<code>attention</code> × <code>trackEmphasis</code> × <code>shape</code> ×{' '}
        <code>disabled</code> | <code>size</code> × <code>type</code>). Labels use Figma API vocabulary; code props
        are lowercase.
      </p>

      <section className={styles.variantSection} aria-labelledby="segmented-control-figma-variant-title">
        <h3 id="segmented-control-figma-variant-title" className={styles.figmaCaption}>
          <span className={styles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          SegmentedControl — full variant matrix ({SEGMENTED_CONTROL_VARIANT_MATRIX_COUNT} cells)
        </h3>
        <div className={styles.variantTableWrap}>
          <table className={styles.variantGridTable} data-testid="figma-segmented-control-variant-grid">
            <colgroup>
              <col className={styles.variantRowHeaderCol} />
              {Array.from({ length: VARIANT_COL_COUNT }, (_, col) => (
                <col key={col} className={styles.variantDataCol} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={styles.cornerCell}>
                  attention / track / shape / disabled
                </th>
                {Array.from({ length: VARIANT_COL_COUNT }, (_, col) => (
                  <th key={col} scope="col" className={styles.colHeader}>
                    {variantColLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: VARIANT_ROW_COUNT }, (_, row) => (
                <tr key={row} data-testrow={`variant-row-${row}`}>
                  <th scope="row" className={styles.rowHeader}>
                    {variantRowLabel(row)}
                  </th>
                  {Array.from({ length: VARIANT_COL_COUNT }, (_, col) => (
                    <VariantCell key={col} row={row} col={col} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="segmented-control-figma-size-attention-title">
        <h3 id="segmented-control-figma-size-attention-title" className={styles.figmaCaption}>
          <span className={styles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          SegmentedControl — size × attention ({SEGMENTED_CONTROL_SIZE_ATTENTION_MATRIX_COUNT} cells)
        </h3>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid="figma-segmented-control-size-attention-grid">
            <caption className={styles.figmaCaption}>
              Three segments · pill · trackEmphasis high · appearance primary · first segment selected
            </caption>
            <tbody>
              {SIZE_ROWS.map(({ size, label }) => (
                <tr key={size} data-testrow={`size-${label}`}>
                  {ATTENTION_COLS.map(({ value: attention }) => (
                    <td key={attention} className={styles.cell}>
                      <span data-testid={`segmented-control-figma-sz-${label}-att-${attention}`}>
                        <SegmentedControl
                          size={size}
                          attention={attention}
                          defaultValue="a"
                          aria-label={`Size ${label} attention ${attention}`}
                        >
                          <SegmentedControl.Item value="a">Button</SegmentedControl.Item>
                          <SegmentedControl.Item value="b">Button</SegmentedControl.Item>
                          <SegmentedControl.Item value="c">Button</SegmentedControl.Item>
                        </SegmentedControl>
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
              <tr className={styles.footerRow}>
                {ATTENTION_COLS.map(({ label }) => (
                  <td key={label} className={styles.footerAxis}>
                    attention: {label}
                  </td>
                ))}
                <td className={styles.footerCorner} aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
