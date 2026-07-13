'use client';

import type { ReactNode } from 'react';
import { Chip } from '@oneui/ui/components/Chip';
import type { ChipAttention, ChipSize } from '@oneui/ui/components/Chip';
import { Icon } from '@oneui/ui/components/Icon';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import styles from './chip-figma-validation.module.css';

/** Column order matches Figma: `selected: true` → S, M, L then `selected: false` → S, M, L. */
const COL_SPECS = [
  { selected: true as const, size: 's' as const, sizeLabel: 'S' },
  { selected: true as const, size: 'm' as const, sizeLabel: 'M' },
  { selected: true as const, size: 'l' as const, sizeLabel: 'L' },
  { selected: false as const, size: 's' as const, sizeLabel: 'S' },
  { selected: false as const, size: 'm' as const, sizeLabel: 'M' },
  { selected: false as const, size: 'l' as const, sizeLabel: 'L' },
] as const;

const ATTENTION_GROUPS = ['high', 'medium', 'low'] as const satisfies readonly ChipAttention[];

function iconSizeForChip(size: ChipSize): '3' | '4' | '5' {
  if (size === 's') return '3';
  if (size === 'l') return '5';
  return '4';
}

function indicatorSizeForChip(size: ChipSize): 's' | 'l' {
  return size === 'l' ? 'l' : 's';
}

type SlotRow = {
  id: string;
  /** Right-hand Figma row label (start/end slot props). */
  label: string;
  start?: (size: ChipSize) => ReactNode;
  end?: (size: ChipSize) => ReactNode;
};

/** Slot rows repeated under each `attention` band — labels match the Figma file. */
const SLOT_ROWS: SlotRow[] = [
  { id: 'none-none', label: 'start: none · end: none' },
  {
    id: 'icon-none',
    label: 'start: Icon · end: none',
    start: (size) => <Icon icon="heart" size={iconSizeForChip(size)} aria-hidden />,
  },
  {
    id: 'none-icon',
    label: 'start: none · end: Icon',
    end: (size) => <Icon icon="heart" size={iconSizeForChip(size)} aria-hidden />,
  },
  {
    id: 'icon-icon',
    label: 'start: Icon · end: Icon',
    start: (size) => <Icon icon="heart" size={iconSizeForChip(size)} aria-hidden />,
    end: (size) => <Icon icon="heart" size={iconSizeForChip(size)} aria-hidden />,
  },
  {
    id: 'dot-none',
    label: 'start: IndicatorBadge · end: none',
    start: (size) => (
      <IndicatorBadge size={indicatorSizeForChip(size)} appearance="negative" aria-label="Status" />
    ),
  },
  {
    id: 'none-dot',
    label: 'start: none · end: IndicatorBadge',
    end: (size) => (
      <IndicatorBadge size={indicatorSizeForChip(size)} appearance="negative" aria-label="Status" />
    ),
  },
  {
    id: 'icon-dot',
    label: 'start: Icon · end: IndicatorBadge',
    start: (size) => <Icon icon="heart" size={iconSizeForChip(size)} aria-hidden />,
    end: (size) => (
      <IndicatorBadge size={indicatorSizeForChip(size)} appearance="negative" aria-label="Status" />
    ),
  },
];

const SLOT_ROW_COUNT = SLOT_ROWS.length;

/**
 * Figma COMPONENT_SET matrix for Chip:
 * - Vertical bands = `attention` (high → medium → low), each with the same slot rows.
 * - Columns = `selected` (false | true groups) × `size` (S, M, L).
 * - Row labels on the right: slot configuration + band `attention` (rowspan).
 */
export function ChipFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid="chip-figma-validation-root">
      <p className={styles.metaLine}>
        Matrix matches the Figma COMPONENT_SET: horizontal groups are <strong>selected</strong> (<code>true</code>{' '}
        then <code>false</code>), sub-columns are size <strong>S, M, L</strong>; vertical bands are{' '}
        <strong>attention</strong> (<code>high</code>, <code>medium</code>, <code>low</code>) with identical{' '}
        <code>start</code>/<code>end</code> slot rows in each band. All chips use <code>appearance=&quot;secondary&quot;</code>{' '}
        (orange emphasis in the default brand).
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-chip-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Chip
          </caption>
          <tbody>
            {ATTENTION_GROUPS.map((attention) =>
              SLOT_ROWS.map((row, rowIndex) => (
                <tr
                  key={`${attention}-${row.id}`}
                  data-testrow={`attention-${attention}-${row.id}`}
                >
                  {COL_SPECS.map((col) => {
                    const testId = `chip-figma-att-${attention}-row-${row.id}-sel-${col.selected}-sz-${col.sizeLabel}`;
                    return (
                      <td key={`${col.selected}-${col.sizeLabel}`} className={styles.cell}>
                        <Chip
                          appearance="secondary"
                          attention={attention}
                          size={col.size}
                          defaultSelected={col.selected ? true : undefined}
                          selected={col.selected ? undefined : false}
                          start={row.start?.(col.size)}
                          end={row.end?.(col.size)}
                          aria-label={`Label, ${row.label}, attention: ${attention}, selected: ${col.selected}, size: ${col.sizeLabel}`}
                          data-testid={testId}
                        >
                          Label
                        </Chip>
                      </td>
                    );
                  })}
                  {rowIndex === 0 ? (
                    <th scope="rowgroup" rowSpan={SLOT_ROW_COUNT} className={styles.rowAttentionBand}>
                      attention: {attention}
                    </th>
                  ) : null}
                  <th scope="row" className={styles.rowLabelRight}>
                    {row.label}
                  </th>
                </tr>
              )),
            )}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {COL_SPECS.map((col) => (
                <td key={`size-${col.sizeLabel}-${col.selected}`} className={styles.footerSize}>
                  {col.sizeLabel}
                </td>
              ))}
              <td className={styles.footerCornerBand} aria-hidden />
              <td className={styles.footerCorner} aria-hidden />
            </tr>
            <tr className={styles.footerRow}>
              <td colSpan={3} className={styles.footerSelectedGroup}>
                selected: true
              </td>
              <td colSpan={3} className={styles.footerSelectedGroup}>
                selected: false
              </td>
              <td className={styles.footerCornerBand} aria-hidden />
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
