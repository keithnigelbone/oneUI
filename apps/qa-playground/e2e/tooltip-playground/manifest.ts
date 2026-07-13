/**
 * Anchors from `TooltipQaShowcase.tsx` + `TooltipFigmaValidationGrid.tsx`.
 * Component type: display (informational overlay; trigger is an interactive child).
 */

import { TOOLTIP_FIGMA_POSITIONS } from '../../src/components/tooltip/tooltip-api-mismatches';

export const TOOLTIP_COMPONENT_TYPE = 'display' as const;

export const TOOLTIP_PLAYGROUND_ROUTE = '/c/tooltip';

export const TOOLTIP_SHOWCASE_AXE_SCOPE = '[data-section^="tooltip-"]';

export const TOOLTIP_SMOKE_TESTID = 'tt-figma-tip-true';

export const FIGMA_VALIDATION_TAB = 'Figma Validation';
export const FIGMA_GRID_TESTID = 'figma-tooltip-grid';

/** `QaStoryBand` `id` → `data-section` (exact). */
export const TOOLTIP_DATA_SECTIONS = [
  'tooltip-figma-tip-true',
  'tooltip-figma-tip-false',
  'tooltip-figma-disabled-false',
  'tooltip-figma-disabled-true',
  'tooltip-trigger-hover',
  'tooltip-trigger-click',
  'tooltip-trigger-focus',
  'tooltip-controlled-manual',
  'tooltip-default-open',
  'tooltip-side-align',
  'tooltip-sideOffset',
  'tooltip-delay',
  'tooltip-closeDelay',
  'tooltip-hoverable-false',
  'tooltip-zIndex',
  'tooltip-maxWidth',
  'tooltip-registry-scenarios',
] as const;

export const TOOLTIP_SECTION_COUNT = TOOLTIP_DATA_SECTIONS.length;

/** Every showcase wrapper `data-testid` on Test Scenarios tab (exact). */
export const TOOLTIP_ALL_WRAPPER_TESTIDS = [
  'tt-figma-tip-true',
  'tt-figma-tip-false',
  'tt-figma-disabled-false-trigger',
  'tt-figma-disabled-true-trigger',
  'tt-figma-trigger-hover',
  'tt-figma-trigger-click',
  'tt-figma-trigger-focus',
  'tt-figma-manual-anchor',
  'tt-figma-manual-toggle',
  'tt-figma-default-open',
  'tt-side-align-anchor',
  'tt-sideOffset-anchor',
  'tt-delay-trigger',
  'tt-closeDelay-trigger',
  'tt-hoverable-false-wrap',
  'tt-hoverable-false-trigger',
  'tt-zIndex-anchor',
  'tt-maxWidth-anchor',
] as const;

export function figmaPositionTestId(position: string): string {
  return `tt-figma-val-pos-${position}`;
}

export const TOOLTIP_FIGMA_CELL_TESTIDS = TOOLTIP_FIGMA_POSITIONS.map((p) => figmaPositionTestId(p));

/** Primary axe targets — open bubbles + interactive triggers. */
export const TOOLTIP_AXE_TARGET_TESTIDS = [
  'tt-figma-tip-true',
  'tt-figma-tip-false',
  'tt-figma-disabled-false-trigger',
  'tt-figma-trigger-click',
  'tt-figma-default-open',
  'tt-maxWidth-anchor',
  'tt-figma-manual-anchor',
] as const;
