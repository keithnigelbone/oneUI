/**
 * SegmentedControl QA — Figma API matrix + visual scenario anchors.
 * Figma reference: node 10455:5802
 */

export const SC_CANONICAL = {
  root: 'segmented-control',
  itemDay: 'segment-item-day',
  itemWeek: 'segment-item-week',
  itemMonth: 'segment-item-month',
  noDefaultWrap: 'segmented-control-no-default',
} as const;

/** Figma API table properties (attached screenshot). */
export const SC_FIGMA_API_PROPS = {
  size: ['s', 'm', 'l'] as const,
  attention: ['high', 'medium', 'low'] as const,
  appearance: [
    'auto',
    'neutral',
    'primary',
    'secondary',
    'sparkle',
    'negative',
    'positive',
    'informative',
    'warning',
  ] as const,
  shape: ['pill', 'rectangular'] as const,
  type: ['text', 'icon'] as const,
  equalWidth: [true, false] as const,
  trackEmphasis: ['high', 'medium', 'low'] as const,
  itemSelected: ['true', 'false'] as const,
  start: ['none', 'Icon'] as const,
  end: ['none', 'CounterBadge'] as const,
} as const;

/** Code mapping notes for API parity tests. */
export const SC_CODE_API_NOTES = {
  itemSelected:
    'Figma itemSelected is per-item; React uses group value/defaultValue/onValueChange (single string).',
  equalWidthDefault: 'Text type defaults equalWidth=true; icon type defaults equalWidth=false (hug/fixed cells).',
  appearanceBrandBg: 'Code supports brand-bg; Figma API table in sheet omits brand-bg role.',
  typeIconEqualWidth:
    'type=icon with equalWidth=true keeps max-content track (fixed square cells) — not full-width stretch.',
} as const;

export type ScVisualScenario = {
  id: string;
  testId: string;
  sectionId: string;
  description: string;
  snapshot: string;
};

export const SC_VISUAL_SCENARIOS: readonly ScVisualScenario[] = [
  {
    id: 'default-text-pill',
    testId: 'segmented-control',
    sectionId: 'segmented-control-qa-automation',
    description: 'Canonical text pill · defaultValue day · high attention defaults',
    snapshot: 'sc-canonical-text-pill.png',
  },
  {
    id: 'shape-rectangular',
    testId: 'segmented-control-shape-rectangular',
    sectionId: 'segmented-control-qa-shape',
    description: 'Rectangular shape',
    snapshot: 'sc-shape-rectangular.png',
  },
  {
    id: 'shape-pill',
    testId: 'segmented-control-shape-pill',
    sectionId: 'segmented-control-qa-shape',
    description: 'Pill shape',
    snapshot: 'sc-shape-pill.png',
  },
  {
    id: 'type-icon',
    testId: 'segmented-control-basic-icon',
    sectionId: 'segmented-control-qa-basic',
    description: 'Icon-only type',
    snapshot: 'sc-type-icon.png',
  },
  {
    id: 'equal-width-true',
    testId: 'segmented-control-equal-true',
    sectionId: 'segmented-control-qa-equal-width',
    description: 'equalWidth true',
    snapshot: 'sc-equal-width-true.png',
  },
  {
    id: 'equal-width-false',
    testId: 'segmented-control-equal-false',
    sectionId: 'segmented-control-qa-equal-width',
    description: 'equalWidth false (hug)',
    snapshot: 'sc-equal-width-false.png',
  },
  {
    id: 'track-high',
    testId: 'segmented-control-track-high',
    sectionId: 'segmented-control-qa-track-emphasis',
    description: 'trackEmphasis high',
    snapshot: 'sc-track-high.png',
  },
  {
    id: 'track-medium',
    testId: 'segmented-control-track-medium',
    sectionId: 'segmented-control-qa-track-emphasis',
    description: 'trackEmphasis medium',
    snapshot: 'sc-track-medium.png',
  },
  {
    id: 'track-low',
    testId: 'segmented-control-track-low',
    sectionId: 'segmented-control-qa-track-emphasis',
    description: 'trackEmphasis low',
    snapshot: 'sc-track-low.png',
  },
  {
    id: 'appearance-primary',
    testId: 'segmented-control-appearance-primary',
    sectionId: 'segmented-control-qa-appearance',
    description: 'appearance primary',
    snapshot: 'sc-appearance-primary.png',
  },
  {
    id: 'slots-start-end',
    testId: 'segmented-control-slot-both',
    sectionId: 'segmented-control-qa-slots',
    description: 'start Icon + end CounterBadge',
    snapshot: 'sc-slots-both.png',
  },
] as const;

export const SC_ATTENTION_VISUAL_TESTIDS = [
  'segmented-control-attention-high',
  'segmented-control-attention-medium',
  'segmented-control-attention-low',
] as const;

export const SC_SIZE_VISUAL_TESTIDS = [
  'segmented-control-size-s',
  'segmented-control-size-m',
  'segmented-control-size-l',
] as const;
