'use client';

import type { ReactNode } from 'react';
import { BottomNavigation, BottomNavItem } from '@oneui/ui/components/BottomNavigation';
import type { BottomNavigationLabelType } from '@oneui/ui/components/BottomNavigation';
import styles from './bottom-navigation-figma-validation.module.css';

function FigmaMobileFrame({ children }: { children: ReactNode }) {
  return <div className={styles.mobileFrame}>{children}</div>;
}

/** Stable values for up to five slots (Figma `items` 2–5). */
const SLOT_VALUES = ['bnv-a', 'bnv-b', 'bnv-c', 'bnv-d', 'bnv-e'] as const;

/** Figma BottomNav matrix: `label: 2line` copy varies with item count (truncation on 4). */
const TWO_LINE_LABEL_BY_COUNT: Record<2 | 3 | 4 | 5, string> = {
  2: 'Label can go into 2 lines if needed',
  3: 'Label can go into 2 lines',
  4: 'Label can go into 2 lines long text for ellipsis',
  5: 'Label in 2 lines',
};

const NAV_LABEL_COLS = [
  { labelType: '1line' as const, footer: 'label: 1line' },
  { labelType: '2line' as const, footer: 'label: 2line' },
  { labelType: 'none' as const, footer: 'label: none' },
] as const;

const NAV_ITEM_COUNTS = [2, 3, 4, 5] as const;

function bottomNavMatrixItems(
  itemCount: 2 | 3 | 4 | 5,
  labelType: BottomNavigationLabelType,
): ReactNode {
  const twoLineText = TWO_LINE_LABEL_BY_COUNT[itemCount];
  return Array.from({ length: itemCount }, (_, i) => {
    const isFirst = i === 0;
    const value = SLOT_VALUES[i];
    if (labelType === 'none') {
      return (
        <BottomNavItem
          key={value}
          value={value}
          icon={isFirst ? 'home' : 'heart'}
          aria-label={isFirst ? 'Home' : `Other ${i + 1}`}
        />
      );
    }
    const label =
      labelType === '1line'
        ? 'Label'
        : twoLineText;
    return (
      <BottomNavItem
        key={value}
        value={value}
        icon={isFirst ? 'home' : 'heart'}
        label={label}
      />
    );
  });
}

/** Figma BottomNav.Item matrix: rows = `type` (labelFalse / label1Line / label2Line), columns = `active`. */
const ITEM_TYPE_ROWS = [
  { key: 'labelFalse', labelType: 'none' as const, rowLabel: 'type: labelFalse' },
  { key: 'label1Line', labelType: '1line' as const, rowLabel: 'type: label1Line' },
  { key: 'label2Line', labelType: '2line' as const, rowLabel: 'type: label2Line' },
] as const;

/**
 * Figma COMPONENT_SET columns: each cell is **one** item in that visual `active` state (not a two-slot bar).
 * Icon matches the sheet (`heart` semantic — closest to the art’s hand-heart mark in the token set).
 */
const ITEM_ACTIVE_COLS = [
  { isActiveVisual: true as const, footer: 'active: true' },
  { isActiveVisual: false as const, footer: 'active: false' },
] as const;

const ITEM_MATRIX_VALUE = 'figma-item-specimen';

function bottomNavItemMatrixCell(labelType: 'none' | '1line' | '2line', isActiveVisual: boolean): ReactNode {
  if (labelType === 'none') {
    return (
      <BottomNavItem
        value={ITEM_MATRIX_VALUE}
        icon="heart"
        aria-label="Label"
        active={isActiveVisual}
      />
    );
  }
  const label = labelType === '1line' ? 'Label' : 'Label can go into 2 lines';
  return (
    <BottomNavItem value={ITEM_MATRIX_VALUE} icon="heart" label={label} active={isActiveVisual} />
  );
}

/**
 * Figma COMPONENT_SET–style matrices on one tab:
 *
 * 1. **BottomNav** — rows = `items` (2–5), columns = `label` (1line · 2line · none). First slot active
 *    (`defaultValue` = first value); first item `home`, others `heart`, `appearance="primary"`, divider on.
 * 2. **BottomNav.Item** — rows = `type` (labelFalse · label1Line · label2Line), columns = <code>active</code> (true ·
 *    false). Each cell is **one** item in that visual state (Figma COMPONENT_SET); <code>active</code> is forced with the
 *    item <code>active</code> prop so inactive cells stay grey even though the bar has a single child.
 */
export function BottomNavigationFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Two matrices on one tab, matching the Figma sheets: <strong>BottomNav</strong> varies <code>items</code> (child
        count) and parent <code>labelType</code> (<code>1line</code>, <code>2line</code>, <code>none</code>); the first
        item stays selected. <strong>BottomNav.Item</strong> follows the COMPONENT_SET: one item per cell, same copy as
        Figma (<code>Label</code> / <code>Label can go into 2 lines</code> / icon-only), columns are that item&apos;s
        visual <code>active</code> on vs off via the <code>active</code> prop.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-bottom-navigation-nav-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            BottomNav
          </caption>
          <tbody>
            {NAV_ITEM_COUNTS.map((n) => (
              <tr key={n} data-testrow={`items-${n}`}>
                {NAV_LABEL_COLS.map(({ labelType }) => {
                  const testId = `bn-figma-nav-items-${n}-lt-${labelType}`;
                  return (
                    <td key={labelType} className={`${styles.cell} ${styles.cellNav}`}>
                      <FigmaMobileFrame>
                        <BottomNavigation
                          aria-label={`Figma BottomNav items ${n} label ${labelType}`}
                          appearance="primary"
                          showDivider
                          labelType={labelType}
                          defaultValue={SLOT_VALUES[0]}
                          data-testid={testId}
                        >
                          {bottomNavMatrixItems(n, labelType)}
                        </BottomNavigation>
                      </FigmaMobileFrame>
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  items: {n}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {NAV_LABEL_COLS.map(({ footer }) => (
                <td key={footer} className={styles.footerAxis}>
                  {footer}
                </td>
              ))}
              <td className={styles.footerCorner} aria-hidden />
            </tr>
          </tfoot>
        </table>
      </div>

      <section className={styles.section} aria-label="BottomNav.Item Figma matrix">
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid="figma-bottom-navigation-item-grid">
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>
                ❖
              </span>{' '}
              BottomNav.Item
            </caption>
            <tbody>
              {ITEM_TYPE_ROWS.map((row) => (
                <tr key={row.key} data-testrow={row.key}>
                  {ITEM_ACTIVE_COLS.map(({ isActiveVisual, footer }) => {
                    const testId = `bn-figma-item-${row.key}-active-${isActiveVisual}`;
                    return (
                      <td key={footer} className={`${styles.cell} ${styles.cellNav}`}>
                        <FigmaMobileFrame>
                          <BottomNavigation
                            aria-label={`Figma BottomNav.Item ${row.key} ${footer}`}
                            appearance="primary"
                            showDivider
                            labelType={row.labelType}
                            defaultValue={ITEM_MATRIX_VALUE}
                            data-testid={testId}
                          >
                            {bottomNavItemMatrixCell(row.labelType, isActiveVisual)}
                          </BottomNavigation>
                        </FigmaMobileFrame>
                      </td>
                    );
                  })}
                  <th scope="row" className={styles.rowLabelRight}>
                    {row.rowLabel}
                  </th>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                {ITEM_ACTIVE_COLS.map(({ footer }) => (
                  <td key={footer} className={styles.footerAxis}>
                    {footer}
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
