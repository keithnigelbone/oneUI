/**
 * Route and anchors from `InputDynamicTextQaShowcase.tsx`.
 * Component type: interactive helper row (leading copy + optional trailing Button) — not a native `<input>`.
 */

export const INPUT_DYNAMIC_TEXT_PLAYGROUND_ROUTE = '/c/input-dynamic-text';

export const IDT_COMPONENT_TYPE = 'interactive' as const;

export const IDT_SHOWCASE_AXE_SCOPE = '[data-section^="idt-qa-"]';

/** Figma size keys on `data-testid` (`idt-size-${figma}`). */
export const IDT_FIGMA_SIZES = ['S', 'M', 'L'] as const;

/** Content × end slot presets in playground band 2. */
export const IDT_CONTENT_END_PRESETS = ['both', 'content', 'end', 'none'] as const;

export type IdtContentEndPreset = (typeof IDT_CONTENT_END_PRESETS)[number];

export const IDT_ROOT_TESTIDS = {
  default: 'idt-default',
  disabled: 'idt-disabled',
  ariaLivePolite: 'idt-aria-live-polite',
  endAriaLabel: 'idt-end-aria-label',
  endClick: 'idt-end-click',
} as const;

export function idtSizeTestId(figma: (typeof IDT_FIGMA_SIZES)[number]): string {
  return `idt-size-${figma}`;
}

export function idtSlotTestId(preset: IdtContentEndPreset): string {
  return `idt-slot-${preset}`;
}

export function idtComboTestId(size: 's' | 'm' | 'l', preset: 'both' | 'content' | 'end'): string {
  return `idt-combo-${size}-${preset}`;
}

export const IDT_COMBO_KEYS = (['s', 'm', 'l'] as const).flatMap((size) =>
  (['both', 'content', 'end'] as const).map((preset) => ({ size, preset, testId: idtComboTestId(size, preset) })),
);

/** `QaStoryBand` `id` → rendered as `data-section`. */
export const IDT_DATA_SECTIONS = [
  'idt-qa-default',
  'idt-qa-size',
  'idt-qa-content-end',
  'idt-qa-states',
  'idt-qa-combos',
] as const;

export const IDT_SECTION_COUNT = IDT_DATA_SECTIONS.length;

/** Every `data-testid` that must be visible on the scenarios tab (from showcase source). */
export const IDT_ALL_RENDERED_TESTIDS = [
  IDT_ROOT_TESTIDS.default,
  idtSizeTestId('S'),
  idtSizeTestId('M'),
  idtSizeTestId('L'),
  idtSlotTestId('both'),
  idtSlotTestId('content'),
  idtSlotTestId('end'),
  IDT_ROOT_TESTIDS.disabled,
  IDT_ROOT_TESTIDS.ariaLivePolite,
  IDT_ROOT_TESTIDS.endAriaLabel,
  IDT_ROOT_TESTIDS.endClick,
  ...IDT_COMBO_KEYS.map((row) => row.testId),
] as const;

/** Alias for Group 1 inventory loops (excludes `idt-slot-none` — renders null). */
export const IDT_ALL_TESTIDS = IDT_ALL_RENDERED_TESTIDS;

export const IDT_AXE_TARGET_TESTIDS = [
  'idt-default',
  'idt-size-M',
  'idt-slot-both',
  'idt-slot-content',
  'idt-slot-end',
  'idt-disabled',
  'idt-aria-live-polite',
  'idt-end-aria-label',
  'idt-end-click',
  'idt-combo-m-both',
] as const;
