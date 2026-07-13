/**
 * Anchors from `ChipQaShowcase.tsx` + `ChipSizeFigmaMatrix.tsx`.
 * `data-testid` sits on wrapper divs/tds — Chip does not forward testid to the button root.
 * `data-section` === band `id` from `QaStoryBand`.
 *
 * Component type: **interactive** (toggle button / filter chip).
 */

export const CHIP_PLAYGROUND_ROUTE = '/c/chip';

export const CHIP_COMPONENT_TYPE = 'interactive' as const;

/** CSS scope for axe — story bands with `data-section`. */
export const CHIP_SHOWCASE_AXE_SCOPE = '[data-section^="chip-qa"]';

export const CHIP_DATA_SECTIONS = [
  'chip-qa-default',
  'chip-qa-size',
  'chip-qa-selected',
  'chip-qa-attention',
  'chip-qa-appearance',
  'chip-qa-disabled',
  'chip-qa-start',
  'chip-qa-end',
  'chip-qa-slots-combo',
  'chip-qa-extra',
  'chip-qa-events',
  'chip-qa-combos',
] as const;

export const CHIP_SECTION_COUNT = CHIP_DATA_SECTIONS.length;

export const CHIP_FIGMA_SIZES = ['M', 'S', 'L'] as const;

export const CHIP_SELECTED_ROWS = ['true', 'false'] as const;

export const CHIP_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const CHIP_FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const CHIP_SLOT_KINDS = ['none', 'icon', 'avatar', 'counter', 'indicator'] as const;

export const CHIP_VARIANTS = ['bold', 'subtle', 'ghost'] as const;

export const CHIP_COMBO_COUNT = 8;

export const CHIP_ROOT_TESTIDS = {
  default: 'chip-default',
  sizeMatrix: 'chip-size-figma-matrix',
  selectedTrue: 'chip-selected-true',
  selectedFalse: 'chip-selected-false',
  disabledFalse: 'chip-disabled-false',
  disabledTrueSelected: 'chip-disabled-true-selected',
  disabledTrueUnselected: 'chip-disabled-true-unselected',
  slotsBothIcons: 'chip-slots-both-icons',
  slotsIconDot: 'chip-slots-icon-dot',
  eventProbe: 'chip-event-probe',
  eventDisabled: 'chip-event-disabled',
} as const;

export function chipSizeCellTestId(selected: (typeof CHIP_SELECTED_ROWS)[number], figma: (typeof CHIP_FIGMA_SIZES)[number]): string {
  return `chip-size-sel-${selected}-sz-${figma}`;
}

export function chipAttentionTestId(attention: (typeof CHIP_ATTENTIONS)[number]): string {
  return `chip-attention-${attention}`;
}

export function chipAppearanceTestId(appearance: (typeof CHIP_FIGMA_APPEARANCES)[number]): string {
  return `chip-appearance-${appearance}`;
}

export function chipStartSlotTestId(slot: (typeof CHIP_SLOT_KINDS)[number]): string {
  return `chip-start-${slot}`;
}

export function chipEndSlotTestId(slot: (typeof CHIP_SLOT_KINDS)[number]): string {
  return `chip-end-${slot}`;
}

export function chipVariantTestId(variant: (typeof CHIP_VARIANTS)[number]): string {
  return `chip-variant-${variant}`;
}

export function chipComboTestId(index: number): string {
  return `chip-combo-${index}`;
}

/** Every `data-testid` in Test Scenarios (exact showcase values). */
export function allChipPlaygroundTestIds(): string[] {
  const ids: string[] = [CHIP_ROOT_TESTIDS.default, CHIP_ROOT_TESTIDS.sizeMatrix];

  for (const selected of CHIP_SELECTED_ROWS) {
    for (const figma of CHIP_FIGMA_SIZES) {
      ids.push(chipSizeCellTestId(selected, figma));
    }
  }

  ids.push(CHIP_ROOT_TESTIDS.selectedTrue, CHIP_ROOT_TESTIDS.selectedFalse);

  for (const attention of CHIP_ATTENTIONS) {
    ids.push(chipAttentionTestId(attention));
  }

  for (const appearance of CHIP_FIGMA_APPEARANCES) {
    ids.push(chipAppearanceTestId(appearance));
  }

  ids.push(
    CHIP_ROOT_TESTIDS.disabledFalse,
    CHIP_ROOT_TESTIDS.disabledTrueSelected,
    CHIP_ROOT_TESTIDS.disabledTrueUnselected,
  );

  for (const slot of CHIP_SLOT_KINDS) {
    ids.push(chipStartSlotTestId(slot));
    ids.push(chipEndSlotTestId(slot));
  }

  ids.push(CHIP_ROOT_TESTIDS.slotsBothIcons, CHIP_ROOT_TESTIDS.slotsIconDot);

  for (const variant of CHIP_VARIANTS) {
    ids.push(chipVariantTestId(variant));
  }

  ids.push(CHIP_ROOT_TESTIDS.eventProbe, CHIP_ROOT_TESTIDS.eventDisabled);

  for (let i = 0; i < CHIP_COMBO_COUNT; i += 1) {
    ids.push(chipComboTestId(i));
  }

  return ids;
}

export const CHIP_ALL_TESTIDS = allChipPlaygroundTestIds();
