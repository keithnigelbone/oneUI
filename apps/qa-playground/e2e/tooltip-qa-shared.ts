import type { ComponentMeta } from '@oneui/shared';
import { TOOLTIP_FIGMA_POSITIONS } from '../src/components/tooltip/tooltip-api-mismatches';

export { TOOLTIP_FIGMA_POSITIONS };

/**
 * Runtime defaults from Tooltip.tsx destructuring — source of truth for API alignment tests.
 * Keep in sync with packages/ui/src/components/Tooltip/Tooltip.tsx (read-only reference for QA).
 */
export const TOOLTIP_RUNTIME_DEFAULTS = {
  trigger: 'hover',
  arrow: true,
  hoverable: true,
  sideOffset: 8,
  defaultOpen: false,
  disabled: false,
  side: 'top',
  align: 'center',
  /** Figma alias when `position` is omitted — see `TOOLTIP_DEFAULT_POSITION` in Tooltip.shared.ts */
  position: 'bottom',
} as const;

/** Public Tooltip props that must have QA coverage (band and/or Figma grid). */
export const TOOLTIP_PUBLIC_PROPS = [
  'children',
  'content',
  'position',
  'side',
  'align',
  'sideOffset',
  'open',
  'defaultOpen',
  'onOpenChange',
  'trigger',
  'delay',
  'closeDelay',
  'arrow',
  'maxWidth',
  'hoverable',
  'disabled',
  'zIndex',
] as const;

export type TooltipPublicProp = (typeof TOOLTIP_PUBLIC_PROPS)[number];

/** Meta props that declare `defaultValue` and must match {@link TOOLTIP_RUNTIME_DEFAULTS}. */
export const TOOLTIP_META_DEFAULT_PROPS = [
  'trigger',
  'arrow',
  'hoverable',
  'defaultOpen',
  'disabled',
  'position',
] as const satisfies readonly (keyof typeof TOOLTIP_RUNTIME_DEFAULTS)[];

/** QA story bands on the Test Scenarios tab — maps band id → props exercised. */
export const TOOLTIP_QA_BANDS: ReadonlyArray<{
  id: string;
  label: string;
  props: readonly TooltipPublicProp[];
}> = [
  { id: 'tooltip-figma-tip-true', label: 'arrow=true (default)', props: ['arrow', 'defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-figma-tip-false', label: 'arrow=false', props: ['arrow', 'defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-figma-disabled-false', label: 'disabled=false', props: ['disabled', 'trigger', 'children', 'content'] },
  { id: 'tooltip-figma-disabled-true', label: 'disabled=true', props: ['disabled', 'children', 'content'] },
  { id: 'tooltip-trigger-hover', label: 'trigger=hover (default)', props: ['trigger', 'children', 'content'] },
  { id: 'tooltip-trigger-click', label: 'trigger=click', props: ['trigger', 'children', 'content'] },
  { id: 'tooltip-trigger-focus', label: 'trigger=focus', props: ['trigger', 'children', 'content'] },
  {
    id: 'tooltip-controlled-manual',
    label: 'open + onOpenChange + trigger=manual',
    props: ['open', 'onOpenChange', 'trigger', 'children', 'content'],
  },
  { id: 'tooltip-default-open', label: 'defaultOpen=true', props: ['defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-side-align', label: 'side + align', props: ['side', 'align', 'defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-sideOffset', label: 'sideOffset=32', props: ['sideOffset', 'defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-delay', label: 'delay=800ms', props: ['delay', 'trigger', 'children', 'content'] },
  { id: 'tooltip-closeDelay', label: 'closeDelay=800ms', props: ['closeDelay', 'trigger', 'children', 'content'] },
  { id: 'tooltip-hoverable-false', label: 'hoverable=false', props: ['hoverable', 'trigger', 'children', 'content'] },
  { id: 'tooltip-zIndex', label: 'zIndex=9999', props: ['zIndex', 'defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-maxWidth', label: 'maxWidth=120', props: ['maxWidth', 'defaultOpen', 'trigger', 'children', 'content'] },
  { id: 'tooltip-registry-scenarios', label: 'registry scenario grid', props: ['children', 'content'] },
] as const;

/** Props covered only on the Figma Validation position matrix (not a Test Scenarios band). */
export const TOOLTIP_FIGMA_GRID_PROPS: readonly TooltipPublicProp[] = ['position', 'children', 'content'];

export const TOOLTIP_QA_SECTIONS = [
  ...TOOLTIP_QA_BANDS.map((b) => b.id),
] as const;

/**
 * Mount smoke targets: band anchor + data-testid + short label for Playwright titles.
 */
export const TOOLTIP_QA_CONTROL_MOUNTS = [
  { bandId: 'tooltip-figma-tip-true', testId: 'tt-figma-tip-true', label: 'arrow=true (default)' },
  { bandId: 'tooltip-figma-tip-false', testId: 'tt-figma-tip-false', label: 'arrow=false' },
  { bandId: 'tooltip-figma-disabled-false', testId: 'tt-figma-disabled-false-trigger', label: 'disabled=false' },
  { bandId: 'tooltip-figma-disabled-true', testId: 'tt-figma-disabled-true-trigger', label: 'disabled=true' },
  { bandId: 'tooltip-trigger-hover', testId: 'tt-figma-trigger-hover', label: 'trigger=hover (default)' },
  { bandId: 'tooltip-trigger-click', testId: 'tt-figma-trigger-click', label: 'trigger=click' },
  { bandId: 'tooltip-trigger-focus', testId: 'tt-figma-trigger-focus', label: 'trigger=focus' },
  { bandId: 'tooltip-controlled-manual', testId: 'tt-figma-manual-anchor', label: 'open + trigger=manual (anchor)' },
  { bandId: 'tooltip-controlled-manual', testId: 'tt-figma-manual-toggle', label: 'open + trigger=manual (toggle)' },
  { bandId: 'tooltip-default-open', testId: 'tt-figma-default-open', label: 'defaultOpen=true' },
  { bandId: 'tooltip-side-align', testId: 'tt-side-align-anchor', label: 'side=right align=start' },
  { bandId: 'tooltip-sideOffset', testId: 'tt-sideOffset-anchor', label: 'sideOffset=32' },
  { bandId: 'tooltip-delay', testId: 'tt-delay-trigger', label: 'delay=800ms' },
  { bandId: 'tooltip-closeDelay', testId: 'tt-closeDelay-trigger', label: 'closeDelay=800ms' },
  { bandId: 'tooltip-hoverable-false', testId: 'tt-hoverable-false-trigger', label: 'hoverable=false (trigger)' },
  { bandId: 'tooltip-hoverable-false', testId: 'tt-hoverable-false-wrap', label: 'hoverable=false (band wrap)' },
  { bandId: 'tooltip-zIndex', testId: 'tt-zIndex-anchor', label: 'zIndex=9999' },
  { bandId: 'tooltip-maxWidth', testId: 'tt-maxWidth-anchor', label: 'maxWidth=120' },
] as const;

/** @deprecated Use TOOLTIP_QA_CONTROL_MOUNTS — kept for imports that only need ids. */
export const TOOLTIP_QA_DATA_TESTIDS = TOOLTIP_QA_CONTROL_MOUNTS.map((c) => c.testId);

export function figmaPositionTestId(position: string): string {
  return `tt-figma-val-pos-${position}`;
}

export function figmaPositionToDataAttrs(position: string): { side: string; align: string } {
  const figmaToComponentSide: Record<string, string> = {
    bottom: 'top',
    top: 'bottom',
    left: 'right',
    right: 'left',
  };
  const match = position.match(/^(bottom|top|left|right)(Start|End)?$/);
  if (!match) throw new Error(`Unexpected figma position: ${position}`);
  const figmaSide = match[1];
  const suffix = match[2] ?? '';
  const side = figmaToComponentSide[figmaSide];
  const align = suffix === 'Start' ? 'start' : suffix === 'End' ? 'end' : 'center';
  return { side, align };
}

export function tooltipQaCoveredProps(): Set<TooltipPublicProp> {
  const covered = new Set<TooltipPublicProp>();
  for (const band of TOOLTIP_QA_BANDS) {
    for (const prop of band.props) {
      covered.add(prop);
    }
  }
  for (const prop of TOOLTIP_FIGMA_GRID_PROPS) {
    covered.add(prop);
  }
  return covered;
}

export function metaDefaultValue(
  meta: ComponentMeta,
  propName: string,
): unknown {
  return meta.props.find((p) => p.name === propName)?.defaultValue;
}

export function collectTooltipDefaultMismatches(
  meta: ComponentMeta,
): Array<{ prop: string; meta: unknown; runtime: unknown }> {
  const mismatches: Array<{ prop: string; meta: unknown; runtime: unknown }> = [];
  for (const prop of TOOLTIP_META_DEFAULT_PROPS) {
    const metaVal = metaDefaultValue(meta, prop);
    if (metaVal === undefined) continue;
    const runtimeVal = TOOLTIP_RUNTIME_DEFAULTS[prop];
    if (metaVal !== runtimeVal) {
      mismatches.push({ prop, meta: metaVal, runtime: runtimeVal });
    }
  }
  return mismatches;
}

export function formatDefaultMismatches(
  mismatches: Array<{ prop: string; meta: unknown; runtime: unknown }>,
): string {
  return mismatches
    .map((m) => `${m.prop}: meta=${JSON.stringify(m.meta)} vs runtime=${JSON.stringify(m.runtime)}`)
    .join('; ');
}
