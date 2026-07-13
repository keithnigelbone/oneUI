'use client';

import { useId } from 'react';
import { RadioField } from '@oneui/ui/components/RadioField';
import type { RadioSize } from '@oneui/ui/components/Radio';
import figmaStyles from './RadioFieldFigmaValidationShowcase.module.css';

/** Figma column order under each readOnly band: M, S, L (matches attached spec frame). */
const SIZE_COLUMNS = ['m', 's', 'l'] as const satisfies readonly RadioSize[];

const READ_ONLY_BANDS = [
  { readOnly: false as const, label: 'readOnly: false' },
  { readOnly: true as const, label: 'readOnly: true' },
] as const;

const CHECKED_ROWS = [
  {
    checked: false as const,
    label: 'checked: false',
    secondary: 'Integrated single · off (no defaultChecked)',
  },
  {
    checked: true as const,
    label: 'checked: true',
    secondary: 'Integrated single · defaultChecked',
  },
] as const;

const COL_COUNT = READ_ONLY_BANDS.length * SIZE_COLUMNS.length;
const ROW_COUNT = CHECKED_ROWS.length;

const FIGMA_LABEL = 'Radio';
const FIGMA_DESCRIPTION = 'Description';

function sizeFigmaLetter(size: (typeof SIZE_COLUMNS)[number]): string {
  return size === 's' ? 'S' : size === 'm' ? 'M' : 'L';
}

function colMeta(col: number): { readOnly: boolean; size: (typeof SIZE_COLUMNS)[number] } {
  const readOnly = col >= SIZE_COLUMNS.length;
  const size = SIZE_COLUMNS[col % SIZE_COLUMNS.length];
  return { readOnly, size };
}

function cellTestId(row: number, col: number): string {
  return `figma-radio-field-r${row}-c${col}`;
}

function FigmaRadioFieldCell({
  readOnly,
  checked,
  size,
  name,
  testId,
}: {
  readOnly: boolean;
  checked: boolean;
  size: (typeof SIZE_COLUMNS)[number];
  name: string;
  testId: string;
}) {
  return (
    <div data-testid={testId} className={figmaStyles.fieldAnchor}>
      {/* TODO: forward data-testid to Field.Root when RadioField supports it */}
      <RadioField
        label={FIGMA_LABEL}
        description={FIGMA_DESCRIPTION}
        name={name}
        size={size}
        readOnly={readOnly}
        appearance="primary"
        {...(checked ? { defaultChecked: true } : {})}
      />
    </div>
  );
}

/**
 * RadioField Figma validation — single matrix: **checked** (rows) × **readOnly** (column bands) × **size M/S/L**.
 * Matches Figma ❖ RadioField COMPONENT_SET grid (label + description, integrated single).
 */
export function RadioFieldFigmaValidationShowcase() {
  const reactId = useId().replace(/:/g, '');
  const pageTitleId = `radio-field-figma-validation__title-${reactId}`;
  const sectionId = 'radio-field-qa-figma-validation-matrix';
  const sectionHeadingId = `${sectionId}__heading-${reactId}`;

  return (
    <div className={figmaStyles.page}>
      <h2 id={pageTitleId} className={figmaStyles.title}>
        RadioField — Figma Validation
      </h2>
      <p className={figmaStyles.metaLine}>
        packages/ui/src/components/RadioField · Figma matrix: checked × readOnly × size (M, S, L per band) · {ROW_COUNT} ×{' '}
        {COL_COUNT} = {ROW_COUNT * COL_COUNT} cells · integrated single (label + description, no Radio children).
      </p>

      <section
        id={sectionId}
        data-section={sectionId}
        aria-labelledby={sectionHeadingId}
        className={figmaStyles.matrixSection}
      >
        <h3 id={sectionHeadingId} className={figmaStyles.figmaCaption}>
          <span className={figmaStyles.figmaCaptionMark} aria-hidden>
            ❖
          </span>{' '}
          RadioField
        </h3>
        <div
          className={figmaStyles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="RadioField Figma validation matrix"
        >
          <table className={figmaStyles.gridTable} data-testid="figma-radio-field-grid">
            <thead>
              <tr>
                <th scope="col" className={figmaStyles.cornerHeader} rowSpan={2}>
                  checked / readOnly · size
                </th>
                {READ_ONLY_BANDS.map((band) => (
                  <th
                    key={band.label}
                    scope="colgroup"
                    colSpan={SIZE_COLUMNS.length}
                    className={figmaStyles.columnHeaderGroup}
                  >
                    {band.label}
                  </th>
                ))}
              </tr>
              <tr>
                {READ_ONLY_BANDS.flatMap((band) =>
                  SIZE_COLUMNS.map((size) => (
                    <th key={`${band.label}-${size}`} scope="col" className={figmaStyles.columnHeader}>
                      {sizeFigmaLetter(size)}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {CHECKED_ROWS.map((row, rowIndex) => (
                <tr key={row.label}>
                  <th scope="row" className={figmaStyles.rowHeader}>
                    <span className={figmaStyles.rowPrimary}>{row.label}</span>
                    <span className={figmaStyles.rowSecondary}>{row.secondary}</span>
                  </th>
                  {Array.from({ length: COL_COUNT }, (_, col) => {
                    const { readOnly, size } = colMeta(col);
                    const testId = cellTestId(rowIndex, col);
                    const name = `figma-radio-field-matrix-${reactId}-r${rowIndex}-c${col}`;
                    return (
                      <td key={col} className={figmaStyles.cell}>
                        <div className={figmaStyles.cellInner}>
                          <FigmaRadioFieldCell
                            readOnly={readOnly}
                            checked={row.checked}
                            size={size}
                            name={name}
                            testId={testId}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
