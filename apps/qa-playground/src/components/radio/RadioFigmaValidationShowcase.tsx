'use client';

import { useId } from 'react';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import type { RadioSize } from '@oneui/ui/components/Radio';
import figmaStyles from './RadioFigmaValidationShowcase.module.css';

/** Figma column order under each readOnly band: M, S, L (matches attached spec frame). */
const SIZE_COLUMNS = ['m', 's', 'l'] as const satisfies readonly RadioSize[];

const READ_ONLY_BANDS = [
  { readOnly: false as const, label: 'readOnly: false' },
  { readOnly: true as const, label: 'readOnly: true' },
] as const;

const SELECTED_ROWS = [
  {
    selected: false as const,
    label: 'selected: false',
    secondary: 'RadioGroup value="" + readOnly (pins unselected); Radio readOnly follows column',
  },
  {
    selected: true as const,
    label: 'selected: true',
    secondary: 'RadioGroup defaultValue="x"; RadioGroup + Radio readOnly follow column',
  },
] as const;

const COL_COUNT = READ_ONLY_BANDS.length * SIZE_COLUMNS.length;
const ROW_COUNT = SELECTED_ROWS.length;

function sizeFigmaLetter(size: (typeof SIZE_COLUMNS)[number]): string {
  return size === 's' ? 'S' : size === 'm' ? 'M' : 'L';
}

function colMeta(col: number): { readOnly: boolean; size: (typeof SIZE_COLUMNS)[number] } {
  const readOnly = col >= SIZE_COLUMNS.length;
  const size = SIZE_COLUMNS[col % SIZE_COLUMNS.length];
  return { readOnly, size };
}

function cellTestId(row: number, col: number): string {
  return `figma-radio-r${row}-c${col}`;
}

function FigmaRadioCell({
  readOnly,
  selected,
  size,
  name,
  testId,
  ariaLabel,
}: {
  readOnly: boolean;
  selected: boolean;
  size: (typeof SIZE_COLUMNS)[number];
  name: string;
  testId: string;
  ariaLabel: string;
}) {
  const radio = (
    <Radio
      value="x"
      size={size}
      readOnly={readOnly}
      data-testid={testId}
      aria-label={ariaLabel}
    />
  );

  if (selected) {
    return (
      <RadioGroup defaultValue="x" readOnly={readOnly} name={name} aria-label={ariaLabel}>
        {radio}
      </RadioGroup>
    );
  }

  return (
    <RadioGroup value="" readOnly name={name} aria-label={ariaLabel}>
      {radio}
    </RadioGroup>
  );
}

/**
 * Radio Figma validation — matrix from Figma: **selected** (rows) × **readOnly** (column bands) × **size M/S/L**.
 * Same table shell as {@link ../divider/DividerFigmaValidationShowcase.tsx} (sticky headers, bordered grid).
 * `data-section` is stable for future axe / Playwright; cells use `appearance="neutral"` + `accent="secondary"` like default QA.
 */
export function RadioFigmaValidationShowcase() {
  const reactId = useId().replace(/:/g, '');
  const pageTitleId = `radio-figma-validation__title-${reactId}`;
  const sectionId = 'radio-qa-figma-validation-matrix';
  const sectionHeadingId = `${sectionId}__heading-${reactId}`;

  return (
    <div className={figmaStyles.page}>
      <h2 id={pageTitleId} className={figmaStyles.title}>
        Radio — Figma Validation
      </h2>
      <p className={figmaStyles.metaLine}>
        packages/ui/src/components/Radio · Figma matrix: selected × readOnly × size (M, S, L per band) · {ROW_COUNT} ×{' '}
        {COL_COUNT} = {ROW_COUNT * COL_COUNT} cells · matches Figma Radio property grid (neutral / secondary accent).
      </p>

      <section
        id={sectionId}
        data-section={sectionId}
        aria-labelledby={sectionHeadingId}
        className={figmaStyles.matrixSection}
      >
        <h3 id={sectionHeadingId} className={figmaStyles.matrixSectionTitle}>
          readOnly × selected × size
        </h3>
        <div
          className={figmaStyles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="Radio Figma validation matrix"
        >
          <table className={figmaStyles.gridTable} data-testid="figma-radio-grid">
            <thead>
              <tr>
                <th scope="col" className={figmaStyles.cornerHeader} rowSpan={2}>
                  selected / readOnly · size
                </th>
                {READ_ONLY_BANDS.map((band) => (
                  <th key={band.label} scope="colgroup" colSpan={SIZE_COLUMNS.length} className={figmaStyles.columnHeaderGroup}>
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
              {SELECTED_ROWS.map((row, rowIndex) => (
                <tr key={row.label}>
                  <th scope="row" className={figmaStyles.rowHeader}>
                    <span className={figmaStyles.rowPrimary}>{row.label}</span>
                    <span className={figmaStyles.rowSecondary}>{row.secondary}</span>
                  </th>
                  {Array.from({ length: COL_COUNT }, (_, col) => {
                    const { readOnly, size } = colMeta(col);
                    const testId = cellTestId(rowIndex, col);
                    const name = `figma-radio-matrix-${reactId}-r${rowIndex}-c${col}`;
                    const ariaLabel = `${row.label}, ${readOnly ? 'readOnly' : 'interactive'}, size ${sizeFigmaLetter(size)}`;
                    return (
                      <td key={col} className={figmaStyles.cell}>
                        <div className={figmaStyles.cellInner}>
                          <FigmaRadioCell
                            readOnly={readOnly}
                            selected={row.selected}
                            size={size}
                            name={name}
                            testId={testId}
                            ariaLabel={ariaLabel}
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
