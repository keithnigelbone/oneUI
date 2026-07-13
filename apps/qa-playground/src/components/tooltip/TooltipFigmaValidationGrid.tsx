'use client';

import type { CSSProperties } from 'react';
import { Tooltip } from '@oneui/ui/components/Tooltip';
import type { TooltipFigmaPosition } from './tooltip-api-mismatches';
import styles from './tooltip-figma-validation.module.css';

/** Column order matches Figma footer: middle → start → end. */
const ALIGN_COLS = [
  { suffix: '' as const, footer: 'Position : middle' },
  { suffix: 'Start' as const, footer: 'Position : start' },
  { suffix: 'End' as const, footer: 'Position : end' },
] as const;

type SideKey = 'bottom' | 'top' | 'left' | 'right';

/** Row order matches Figma: bottom → top → left → right. */
const ROWS: { side: SideKey; rowLabel: string }[] = [
  { side: 'bottom', rowLabel: 'position: bottom' },
  { side: 'top', rowLabel: 'position: top' },
  { side: 'left', rowLabel: 'position: left' },
  { side: 'right', rowLabel: 'position: right' },
];

/**
 * Figma's `position` prop names the side the ANCHOR sits on (where the arrow
 * points), which is the OPPOSITE of the side the tooltip floats to.
 *
 *   Figma "position: bottom" → anchor at bottom, arrow ↓, tooltip floats UP   → component side="top"
 *   Figma "position: top"    → anchor at top,    arrow ↑, tooltip floats DOWN → component side="bottom"
 *   Figma "position: left"   → anchor at left,   arrow ←, tooltip floats RIGHT → component side="right"
 *   Figma "position: right"  → anchor at right,  arrow →, tooltip floats LEFT  → component side="left"
 *
 * The data-testid is always derived from the Figma label (e.g. `tt-figma-val-pos-bottom`)
 * so tests remain stable; only the prop passed to <Tooltip> is inverted.
 */
const FIGMA_TO_COMPONENT_SIDE: Record<SideKey, SideKey> = {
  bottom: 'top',
  top:    'bottom',
  left:   'right',
  right:  'left',
};

/**
 * `data-testid` position — always matches the Figma label (e.g. "bottom").
 */
function figmaTestIdPosition(side: SideKey, suffix: '' | 'Start' | 'End'): TooltipFigmaPosition {
  if (suffix === '') return side as TooltipFigmaPosition;
  return `${side}${suffix}` as TooltipFigmaPosition;
}

/**
 * Actual position prop passed to `<Tooltip>` — inverted so the tooltip floats
 * in the direction Figma shows for the given label.
 */
function componentPosition(side: SideKey, suffix: '' | 'Start' | 'End'): TooltipFigmaPosition {
  const cs = FIGMA_TO_COMPONENT_SIDE[side];
  if (suffix === '') return cs as TooltipFigmaPosition;
  return `${cs}${suffix}` as TooltipFigmaPosition;
}

function figmaCellTestId(position: TooltipFigmaPosition): string {
  return `tt-figma-val-pos-${position}`;
}

/**
 * Anchor offset per Figma label side.
 * The anchor sits near the edge matching the Figma label (e.g. for "bottom"
 * the anchor is near the bottom of the cell); the tooltip floats to the
 * opposite side, giving it room within the cell boundary.
 */
const ANCHOR_ALIGN: Record<SideKey, CSSProperties> = {
  // "position: bottom" → anchor at bottom, tooltip floats above
  bottom: { alignItems: 'flex-end',       paddingBottom: '28px' },
  // "position: top"    → anchor at top,    tooltip floats below
  top:    { alignItems: 'flex-start',     paddingTop:    '28px' },
  // "position: left"   → anchor at left,   tooltip floats right
  left:   { justifyContent: 'flex-start', paddingLeft:   '28px' },
  // "position: right"  → anchor at right,  tooltip floats left
  right:  { justifyContent: 'flex-end',   paddingRight:  '28px' },
};

/**
 * Figma COMPONENT_SET–style matrix: rows = primary `position` (bottom | top | left | right),
 * columns = secondary alignment (middle | start | end). Cells use `defaultOpen` + `trigger="manual"`
 * so the bubble matches the static Figma art; `tip` / `arrow` defaults to true.
 */
export function TooltipFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrix matches Figma: columns are alignment (<strong>middle</strong>, <strong>start</strong>,{' '}
        <strong>end</strong>); rows are primary <strong>position</strong> (bottom, top, left, right). Each cell
        uses <code>position</code> with <code>defaultOpen</code> and <code>trigger=&quot;manual&quot;</code> for
        static parity. Row labels on the right; column labels in the footer.
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-tooltip-grid">
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>
              ❖
            </span>{' '}
            Tooltip
          </caption>
          <tbody>
            {ROWS.map(({ side, rowLabel }) => (
              <tr key={side} data-testrow={rowLabel}>
                {ALIGN_COLS.map(({ suffix, footer }) => {
                  const testId = figmaCellTestId(figmaTestIdPosition(side, suffix));
                  return (
                    <td key={footer} className={styles.cell}>
                      <div
                        className={styles.cellInner}
                        data-testid={testId}
                        style={ANCHOR_ALIGN[side]}
                      >
                        <Tooltip
                          content="Tooltip"
                          position={componentPosition(side, suffix)}
                          defaultOpen
                          trigger="manual"
                          arrow
                        >
                          <span className={styles.anchor} aria-hidden="true" />
                        </Tooltip>
                      </div>
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  {rowLabel}
                </th>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.footerRow}>
              {ALIGN_COLS.map(({ footer }) => (
                <td key={footer} className={styles.footerAlign}>
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
