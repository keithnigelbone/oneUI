'use client';

import { useId } from 'react';
import type { CSSProperties } from 'react';
import { Divider } from '@oneui/ui/components/Divider';
import { Icon } from '@oneui/ui/components/Icon';
import type {
  DividerAttention,
  DividerContent,
  DividerContentAlign,
  DividerProps,
  DividerSize,
} from '@oneui/ui/components/Divider';
import figmaStyles from './DividerFigmaValidationShowcase.module.css';
import { HORIZONTAL_FULL_MATRIX_COUNT, VERTICAL_FULL_MATRIX_COUNT } from './dividerQaConstants';

const dividerSlotIcon = <Icon icon="add" aria-hidden />;

const MATRIX_ATTENTIONS = ['low', 'medium', 'high'] as const satisfies readonly DividerAttention[];
const MATRIX_ALIGNS = ['center', 'start', 'end'] as const satisfies readonly DividerContentAlign[];
const MATRIX_SIZES = ['s', 'm', 'l'] as const satisfies readonly DividerSize[];
const MATRIX_CONTENTS = ['none', 'icon', 'label'] as const satisfies readonly DividerContent[];

const COL_COUNT = MATRIX_SIZES.length * MATRIX_CONTENTS.length;
const ROW_COUNT = MATRIX_ATTENTIONS.length * MATRIX_ALIGNS.length * 2;

if (HORIZONTAL_FULL_MATRIX_COUNT !== VERTICAL_FULL_MATRIX_COUNT) {
  throw new Error('Horizontal and vertical matrix counts must match');
}
if (ROW_COUNT * COL_COUNT !== HORIZONTAL_FULL_MATRIX_COUNT) {
  throw new Error(
    `ROW_COUNT * COL_COUNT (${ROW_COUNT * COL_COUNT}) !== HORIZONTAL_FULL_MATRIX_COUNT (${HORIZONTAL_FULL_MATRIX_COUNT})`,
  );
}

function indexFromRowCol(row: number, col: number): number {
  return row * COL_COUNT + col;
}

function rowAxis(row: number): { attention: DividerAttention; contentAlign: DividerContentAlign; roundCaps: boolean } {
  const attention = MATRIX_ATTENTIONS[Math.floor(row / 6)];
  const rem = row % 6;
  const contentAlign = MATRIX_ALIGNS[Math.floor(rem / 2)];
  const roundCaps = rem % 2 === 1;
  return { attention, contentAlign, roundCaps };
}

function colAxis(col: number): { size: DividerSize; content: DividerContent } {
  return {
    size: MATRIX_SIZES[Math.floor(col / 3)],
    content: MATRIX_CONTENTS[col % 3],
  };
}

function propsForCell(row: number, col: number, orientation: 'horizontal' | 'vertical'): DividerProps {
  const { attention, contentAlign, roundCaps } = rowAxis(row);
  const { size, content } = colAxis(col);
  return {
    orientation,
    appearance: 'neutral',
    attention,
    contentAlign,
    roundCaps,
    size,
    content,
  };
}

function rowPrimaryLabel(row: number): string {
  const { attention, contentAlign, roundCaps } = rowAxis(row);
  const caps = roundCaps ? 'caps' : 'flat';
  return `${attention} / ${contentAlign} / ${caps}`;
}

function rowSecondaryLabel(row: number, orientation: 'horizontal' | 'vertical'): string {
  const { attention, contentAlign, roundCaps } = rowAxis(row);
  return `appearance=neutral, orientation=${orientation}, attention=${attention}, contentAlign=${contentAlign}, roundCaps=${roundCaps}`;
}

function sizeFigmaLetter(size: DividerSize): string {
  return size === 's' ? 'S' : size === 'm' ? 'M' : 'L';
}

const MATRIX_BLOCKS = [
  {
    orientation: 'horizontal' as const,
    sectionId: 'divider-qa-horizontal-full-matrix',
    matrixTitle: 'Horizontal full matrix',
    tableWrapAriaLabel: 'Divider horizontal variant matrix',
    gridDataTestid: 'figma-divider-grid-horizontal',
    testIdPrefix: 'divider-hfull',
    cellInnerClassName: figmaStyles.cellInner,
  },
  {
    orientation: 'vertical' as const,
    sectionId: 'divider-qa-vertical-full-matrix',
    matrixTitle: 'Vertical full matrix',
    tableWrapAriaLabel: 'Divider vertical variant matrix',
    gridDataTestid: 'figma-divider-grid-vertical',
    testIdPrefix: 'divider-vfull',
    cellInnerClassName: figmaStyles.cellInnerVertical,
  },
] as const;

/**
 * Divider Figma validation — same matrix shell as {@link apps/button-figma-validation/src/FigmaButtonParityPage.tsx}
 * (title, meta line, bordered tables, sticky headers, two-line row labels) for horizontal and vertical orientation.
 * `data-section` ids are stable for axe / Playwright (`divider-accessibility.spec.ts`). Matrices use default Divider tokens only;
 * `attention="low"` + `content="label"` cells are a raised WCAG color-contrast gap (tracked in `@oneui/ui`, not overridden here).
 */
export function DividerFigmaValidationShowcase() {
  const reactId = useId();
  const pageTitleId = `divider-figma-validation__title-${reactId.replace(/:/g, '')}`;

  return (
    <div className={figmaStyles.page}>
      <h2 id={pageTitleId} className={figmaStyles.title}>
        Divider — Figma Validation
      </h2>
      <p className={figmaStyles.metaLine}>
        packages/ui/src/components/Divider · Storybook + QA matrix · COMPONENT · attention × align × roundCaps × size ×
        content · {HORIZONTAL_FULL_MATRIX_COUNT} horizontal + {VERTICAL_FULL_MATRIX_COUNT} vertical variants
      </p>

      {MATRIX_BLOCKS.map((block) => {
        const sectionHeadingId = `${block.sectionId}__heading-${reactId.replace(/:/g, '')}`;
        return (
          <section
            key={block.sectionId}
            id={block.sectionId}
            data-section={block.sectionId}
            aria-labelledby={sectionHeadingId}
            className={figmaStyles.matrixSection}
          >
            <h3 id={sectionHeadingId} className={figmaStyles.matrixSectionTitle}>
              {block.matrixTitle}
            </h3>
            <div
              className={figmaStyles.tableWrap}
              tabIndex={0}
              role="region"
              aria-label={block.tableWrapAriaLabel}
            >
              <table className={figmaStyles.gridTable} data-testid={block.gridDataTestid}>
                <thead>
                  <tr>
                    <th scope="col" className={figmaStyles.cornerHeader}>
                      attention / align / roundCaps
                    </th>
                    {Array.from({ length: COL_COUNT }, (_, col) => {
                      const { size, content } = colAxis(col);
                      return (
                        <th key={`${size}-${content}`} scope="col" className={figmaStyles.columnHeader}>
                          {`${sizeFigmaLetter(size)} / ${content}`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: ROW_COUNT }, (_, row) => (
                    <tr key={row}>
                      <th scope="row" className={figmaStyles.rowHeader}>
                        <span className={figmaStyles.rowPrimary}>{rowPrimaryLabel(row)}</span>
                        <span className={figmaStyles.rowSecondary}>{rowSecondaryLabel(row, block.orientation)}</span>
                      </th>
                      {Array.from({ length: COL_COUNT }, (_, col) => {
                        const props = propsForCell(row, col, block.orientation);
                        const idx = indexFromRowCol(row, col);
                        return (
                          <td key={col} className={figmaStyles.cell}>
                            <div className={block.cellInnerClassName}>
                              <Divider {...props}  data-testid={`${block.testIdPrefix}-${idx}`}>
                                {props.content === 'icon' ? dividerSlotIcon : props.content === 'label' ? 'Label' : null}
                              </Divider>
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
        );
      })}
    </div>
  );
}
