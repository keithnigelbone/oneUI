'use client';

/**
 * ChipGroup Figma validation matrix.
 *
 * Layout mirrors the Figma COMPONENT_SET screenshot:
 * - Columns  = size (M, S, L) — matches Figma column order
 * - Rows     = containerType (inline, wrap)
 *
 * ⚠️ PROP MISMATCH FLAGGED IN TABLE:
 *   Figma `containerType: inline | wrap`  →  Code `wrap?: boolean`
 *   (inline = wrap=false, wrap = wrap=true)
 */

import { Chip } from '@oneui/ui/components/Chip';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import type { ChipSize } from '@oneui/ui/components/Chip';
import styles from './chip-group-figma-validation.module.css';

const SIZES: { size: ChipSize; label: string }[] = [
  { size: 'm', label: 'M' },
  { size: 's', label: 'S' },
  { size: 'l', label: 'L' },
];

const DEMO_CHIPS = [
  { value: 'c0', label: 'Label' },
  { value: 'c1', label: 'Label' },
  { value: 'c2', label: 'Label' },
  { value: 'c3', label: 'Label' },
  { value: 'c4', label: 'Label' },
] as const;

type ContainerRow = {
  /** Figma value */
  figmaLabel: string;
  /** Code prop value */
  wrap: boolean;
  /** Code representation for display */
  codeLabel: string;
  mismatch: boolean;
};

const CONTAINER_ROWS: ContainerRow[] = [
  {
    figmaLabel: 'inline',
    wrap: false,
    codeLabel: 'wrap={false}',
    mismatch: true,
  },
  {
    figmaLabel: 'wrap',
    wrap: true,
    codeLabel: 'wrap={true}',
    mismatch: true,
  },
];

/**
 * Figma COMPONENT_SET matrix for ChipGroup:
 * Rows = containerType (Figma) / wrap (code) — 2 rows
 * Columns = size — 3 columns (M, S, L)
 *
 * The header row flags the prop-name mismatch between Figma and code.
 */
export function ChipGroupFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid="chip-group-figma-validation-root">
      <p className={styles.metaLine}>
        Matrix matches the Figma COMPONENT_SET screenshot: columns are{' '}
        <strong>size</strong> (M, S, L); rows are <strong>containerType</strong> (inline, wrap).
        First chip in each cell is pre-selected to show the active state.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="chip-group-figma-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            ChipGroup
          </caption>

          <thead>
            <tr>
              {/* top-left corner */}
              <th className={styles.cornerCell} aria-label="containerType × size" />
              {SIZES.map(({ size, label }) => (
                <th key={size} className={styles.colHeader} scope="col">
                  size: {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {CONTAINER_ROWS.map((row) => (
              <tr key={row.figmaLabel} data-testrow={`container-${row.figmaLabel}`}>
                {/* Row header */}
                <th
                  scope="row"
                  className={[
                    styles.rowHeader,
                    row.mismatch ? styles.rowHeaderMismatch : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  containerType: {row.figmaLabel}
                  <br />
                  <small>({row.codeLabel})</small>
                  {row.mismatch ? ' ⚠️' : ''}
                </th>

                {/* Data cells — one per size */}
                {SIZES.map(({ size, label }) => {
                  const testId = `chip-group-figma-sz-${label}-ct-${row.figmaLabel}`;
                  return (
                    <td key={size} className={styles.cell}>
                      <div
                        data-testid={testId}
                        className={
                          row.wrap ? styles.cellInnerWrap : styles.cellInner
                        }
                      >
                        <ChipGroup
                          size={size}
                          wrap={row.wrap}
                          defaultValue={['c0']}
                          aria-label={`size ${label} containerType ${row.figmaLabel}`}
                        >
                          {DEMO_CHIPS.map(({ value, label: chipLabel }) => (
                            <Chip key={value} value={value}>
                              {chipLabel}
                            </Chip>
                          ))}
                        </ChipGroup>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
