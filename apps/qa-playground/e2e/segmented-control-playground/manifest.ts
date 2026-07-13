/**
 * Anchors from `SegmentedControlQaShowcase.tsx` + `SegmentedControlControlsPanel.tsx`.
 * `data-section` === `QaStoryBand` `id`. `data-testid` on `QaSc` wrappers (group root does not forward testid).
 */

export const SEGMENTED_CONTROL_PLAYGROUND_ROUTE = '/c/segmented-control';

export const SEGMENTED_CONTROL_COMPONENT_TYPE = 'interactive' as const;

export const SEGMENTED_CONTROL_SHOWCASE_AXE_SCOPE = '[data-section^="segmented-control-qa-"]';

export const SEGMENTED_CONTROL_DATA_SECTIONS = [
  'segmented-control-qa-default',
  'segmented-control-qa-automation',
  'segmented-control-qa-basic',
  'segmented-control-qa-size',
  'segmented-control-qa-attention',
  'segmented-control-qa-appearance',
  'segmented-control-qa-shape',
  'segmented-control-qa-track-emphasis',
  'segmented-control-qa-equal-width',
  'segmented-control-qa-slots',
  'segmented-control-qa-selection',
  'segmented-control-qa-content-type',
  'segmented-control-qa-a11y',
  'segmented-control-qa-edge-cases',
  'segmented-control-qa-interaction',
  'segmented-control-qa-surface',
  'segmented-control-qa-controls',
  'segmented-control-qa-combos',
] as const;

export const SEGMENTED_CONTROL_SECTION_COUNT = SEGMENTED_CONTROL_DATA_SECTIONS.length;

export const SEGMENTED_CONTROL_FIGMA_SIZES = ['s', 'm', 'l'] as const;

export const SEGMENTED_CONTROL_FIGMA_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const SEGMENTED_CONTROL_FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'informative',
  'warning',
] as const;

export const SEGMENTED_CONTROL_FIGMA_SHAPES = ['pill', 'rectangular'] as const;

export const SEGMENTED_CONTROL_FIGMA_TRACK = ['high', 'medium', 'low'] as const;

export const SEGMENTED_CONTROL_COMBO_COUNT = 6;

export const SEGMENTED_CONTROL_ROOT_TESTIDS = {
  default: 'segmented-control-default',
  canonical: 'segmented-control',
  noDefault: 'segmented-control-no-default',
  controlled: 'segmented-control-controlled',
  uncontrolled: 'segmented-control-uncontrolled',
  controlsPanel: 'segmented-control-controls-panel',
  controlsLive: 'segmented-control-controls-live',
  controlsLiveInner: 'segmented-control-controls-live-inner',
} as const;

export function scSizeTestId(size: (typeof SEGMENTED_CONTROL_FIGMA_SIZES)[number]): string {
  return `segmented-control-size-${size}`;
}

export function scAttentionTestId(attention: (typeof SEGMENTED_CONTROL_FIGMA_ATTENTIONS)[number]): string {
  return `segmented-control-attention-${attention}`;
}

export function scAppearanceTestId(
  appearance: (typeof SEGMENTED_CONTROL_FIGMA_APPEARANCES)[number],
): string {
  return `segmented-control-appearance-${appearance}`;
}

export function scShapeTestId(shape: (typeof SEGMENTED_CONTROL_FIGMA_SHAPES)[number]): string {
  return `segmented-control-shape-${shape}`;
}

export function scTrackTestId(track: (typeof SEGMENTED_CONTROL_FIGMA_TRACK)[number]): string {
  return `segmented-control-track-${track}`;
}

export function scComboTestId(index: number): string {
  return `segmented-control-combo-${index}`;
}

/** Scenario-band `data-testid` values (Test Scenarios tab — excludes Brand/Theme toolbar). */
export function allSegmentedControlScenarioTestIds(): readonly string[] {
  const ids: string[] = [
    SEGMENTED_CONTROL_ROOT_TESTIDS.default,
    SEGMENTED_CONTROL_ROOT_TESTIDS.canonical,
    'segment-item-day',
    'segment-item-week',
    'segment-item-month',
    SEGMENTED_CONTROL_ROOT_TESTIDS.noDefault,
    SEGMENTED_CONTROL_ROOT_TESTIDS.controlled,
    'segmented-control-controlled-state',
    'segmented-control-controlled-log',
    SEGMENTED_CONTROL_ROOT_TESTIDS.uncontrolled,
    'segmented-control-dynamic-items',
    'segmented-control-dynamic-dec',
    'segmented-control-dynamic-count',
    'segmented-control-dynamic-inc',
    'segmented-control-basic-text',
    'segmented-control-basic-icon',
    'segmented-control-basic-mixed',
    'segmented-control-basic-equal',
    'segmented-control-basic-variable',
    'segmented-control-equal-true',
    'segmented-control-equal-false',
    'segmented-control-equal-long',
    'segmented-control-slot-start',
    'segmented-control-slot-end',
    'segmented-control-slot-both',
    'segmented-control-slot-none',
    'segmented-control-select-first',
    'segmented-control-select-middle',
    'segmented-control-select-last',
    'segmented-control-selection-dynamic',
    'segmented-control-selection-dynamic-state',
    'segmented-control-selection-dynamic-log',
    'segmented-control-content-text',
    'segmented-control-content-icon',
    'segmented-control-content-text-icon',
    'segmented-control-content-long',
    'segmented-control-content-emoji',
    'segmented-control-a11y-aria-label',
    'segmented-control-a11y-aria-labelledby',
    'segmented-control-a11y-icon-labels',
    'segmented-control-a11y-disabled-item',
    'segmented-control-edge-single',
    'segmented-control-edge-two',
    'segmented-control-edge-empty-label',
    'segmented-control-edge-special',
    'segmented-control-edge-unicode',
    'segmented-control-edge-rtl',
    'segmented-control-surface-bold',
    'segmented-control-surface-subtle',
    'segmented-control-on-bold',
    'segmented-control-on-subtle',
    SEGMENTED_CONTROL_ROOT_TESTIDS.controlsPanel,
    SEGMENTED_CONTROL_ROOT_TESTIDS.controlsLive,
    SEGMENTED_CONTROL_ROOT_TESTIDS.controlsLiveInner,
    'segmented-control-controls-state',
    'segmented-control-copy-jsx',
    'segmented-control-copy-json',
    'segmented-control-code-jsx',
    'segmented-control-code-json',
  ];

  for (const size of SEGMENTED_CONTROL_FIGMA_SIZES) ids.push(scSizeTestId(size));
  for (const attention of SEGMENTED_CONTROL_FIGMA_ATTENTIONS) ids.push(scAttentionTestId(attention));
  for (const appearance of SEGMENTED_CONTROL_FIGMA_APPEARANCES) ids.push(scAppearanceTestId(appearance));
  for (const shape of SEGMENTED_CONTROL_FIGMA_SHAPES) ids.push(scShapeTestId(shape));
  for (const track of SEGMENTED_CONTROL_FIGMA_TRACK) ids.push(scTrackTestId(track));
  for (let i = 0; i < SEGMENTED_CONTROL_COMBO_COUNT; i++) ids.push(scComboTestId(i));

  for (const size of SEGMENTED_CONTROL_FIGMA_SIZES) {
    ids.push(`segmented-control-ctrl-size-${size}`);
  }
  for (const attention of SEGMENTED_CONTROL_FIGMA_ATTENTIONS) {
    ids.push(`segmented-control-ctrl-attention-${attention}`);
  }
  for (const appearance of SEGMENTED_CONTROL_FIGMA_APPEARANCES) {
    ids.push(`segmented-control-ctrl-appearance-${appearance}`);
  }
  for (const shape of SEGMENTED_CONTROL_FIGMA_SHAPES) {
    ids.push(`segmented-control-ctrl-shape-${shape}`);
  }
  for (const track of SEGMENTED_CONTROL_FIGMA_TRACK) {
    ids.push(`segmented-control-ctrl-track-${track}`);
  }
  for (const type of ['text', 'icon'] as const) {
    ids.push(`segmented-control-ctrl-type-${type}`);
  }
  for (const slot of ['none', 'start', 'end', 'both'] as const) {
    ids.push(`segmented-control-ctrl-slots-${slot}`);
  }
  ids.push(
    'segmented-control-ctrl-equal-width',
    'segmented-control-ctrl-disabled',
    'segmented-control-ctrl-item-label',
    'segmented-control-ctrl-reset',
  );

  return ids;
}

export const SEGMENTED_CONTROL_ALL_TESTIDS = allSegmentedControlScenarioTestIds();

export const SEGMENTED_CONTROL_A11Y_BANDS = SEGMENTED_CONTROL_DATA_SECTIONS.map((id) => ({
  id,
  title: id.replace('segmented-control-qa-', ''),
}));
