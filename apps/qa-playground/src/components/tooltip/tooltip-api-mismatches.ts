/**
 * tooltip-api-mismatches.ts
 *
 * Figma position types + documented gaps between Tooltip.meta.ts and Tooltip.tsx.
 * QA tests assert runtime defaults against meta; mismatches listed here are filed
 * with the component owner (see qa-bugs.md) — do not "fix" in QA by editing Tooltip.tsx.
 */

/** All positions surfaced in the Figma component-set matrix. */
export type TooltipFigmaPosition =
  | 'bottom'
  | 'bottomStart'
  | 'bottomEnd'
  | 'top'
  | 'topStart'
  | 'topEnd'
  | 'left'
  | 'leftStart'
  | 'leftEnd'
  | 'right'
  | 'rightStart'
  | 'rightEnd';

/** Ordered to match the Figma matrix: bottom → top → left → right, then alignments. */
export const TOOLTIP_FIGMA_POSITIONS: TooltipFigmaPosition[] = [
  'bottom', 'bottomStart', 'bottomEnd',
  'top',    'topStart',    'topEnd',
  'left',   'leftStart',   'leftEnd',
  'right',  'rightStart',  'rightEnd',
];

/**
 * Props where Tooltip.meta.ts `defaultValue` is known to disagree with Tooltip.tsx
 * destructuring defaults. Tests fail until these are cleared (component-owner fix).
 */
export const TOOLTIP_KNOWN_META_RUNTIME_MISMATCHES: ReadonlyArray<{
  prop: string;
  meta: unknown;
  runtime: unknown;
  note: string;
}> = [
  {
    prop: 'hoverable',
    meta: false,
    runtime: true,
    note: 'Tooltip.meta.ts documents false; Tooltip.tsx uses hoverable = true',
  },
];
