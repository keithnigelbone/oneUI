'use client';

import type { ReactNode } from 'react';
import { TabGroup, TabItem } from '@oneui/ui/components/Tabs';
import type { TabsOrientation, TabsSize } from '@oneui/ui/components/Tabs';
import styles from '../pagination/pagination-figma-validation.module.css';

/** Figma rows: size M · S · L. Code `size`: `m` · `s` · `l`. */
const SIZE_ROWS = [
  { size: 'm' as const, rowLabel: 'M' },
  { size: 's' as const, rowLabel: 'S' },
  { size: 'l' as const, rowLabel: 'L' },
] as const;

/** Figma columns: orientation horizontal · vertical. */
const ORIENTATION_COLS = [
  { orientation: 'horizontal' as const, footer: 'orientation: horizontal' },
  { orientation: 'vertical' as const, footer: 'orientation: vertical' },
] as const;

const FIGMA_TAB_VALUES = ['a', 'b', 'c', 'd'] as const;

function FigmaPreviewWrap({ children }: { children: ReactNode }) {
  return <div className={styles.previewWrap}>{children}</div>;
}

function figmaTabLabels() {
  return FIGMA_TAB_VALUES.map((value) => (
    <TabItem key={value} value={value}>
      Label
    </TabItem>
  ));
}

function figmaTabGroupCell(size: TabsSize, orientation: TabsOrientation) {
  const testId = `tg-figma-sz-${size}-ori-${orientation}`;
  return (
    <FigmaPreviewWrap>
      {/* TODO: pass data-testid={testId} on TabGroup → BaseTabs.Root when TabGroupProps supports it */}
      <div data-testid={testId}>
        <TabGroup size={size} orientation={orientation} defaultValue="a" appearance="primary">
          {figmaTabLabels()}
        </TabGroup>
      </div>
    </FigmaPreviewWrap>
  );
}

/**
 * Figma TabGroup COMPONENT_SET: rows = `size` (M · S · L), columns = `orientation` (horizontal · vertical).
 * First tab selected (`defaultValue="a"`). `interactionState` is a Figma variable mode — not a TabGroup prop ⚠️.
 */
export function TabsFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix from the Figma sheet: <strong>TabGroup</strong> varies <code>size</code> (<code>S</code>, <code>M</code>,{' '}
        <code>L</code> → code <code>s</code>, <code>m</code>, <code>l</code>) and <code>orientation</code> (
        <code>horizontal</code>, <code>vertical</code>). <code>interactionState</code> (idle · hover · pressed · focus) is
        a variable mode in Figma — use CSS / <code>data-force-state="focus"</code> on TabItem for focus QA ⚠️.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-tabs-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            TabGroup
          </caption>
          <tbody>
            {SIZE_ROWS.map(({ size, rowLabel }) => (
              <tr key={rowLabel} data-testrow={`size-${rowLabel}`}>
                {ORIENTATION_COLS.map(({ orientation }) => (
                  <td
                    key={`${rowLabel}-${orientation}`}
                    className={`${styles.cell} ${orientation === 'vertical' ? styles.cellPagination : ''}`}
                  >
                    {figmaTabGroupCell(size, orientation)}
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  {rowLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {ORIENTATION_COLS.map(({ footer }) => (
                <td key={footer} className={styles.footerAxis}>
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
