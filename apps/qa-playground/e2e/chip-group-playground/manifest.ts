/**
 * Anchors from `ChipGroupQaShowcase.tsx`.
 * Wrapper divs carry `data-testid`; ChipGroup root uses `data-wrap` / `data-orientation`.
 * `data-section` === band `id` from `QaStoryBand`.
 *
 * Component type: **interactive** (ToggleGroup — single/multi chip selection + roving focus).
 */

export const CHIP_GROUP_PLAYGROUND_ROUTE = '/c/chip-group';

export const CHIP_GROUP_COMPONENT_TYPE = 'interactive' as const;

export const CHIP_GROUP_SHOWCASE_AXE_SCOPE = '[data-section^="chip-group-qa"]';

export const CHIP_GROUP_DATA_SECTIONS = [
  'chip-group-qa-default',
  'chip-group-qa-size',
  'chip-group-qa-container-type',
  'chip-group-qa-events',
  'chip-group-qa-combos',
] as const;

export const CHIP_GROUP_SECTION_COUNT = CHIP_GROUP_DATA_SECTIONS.length;

export const CHIP_GROUP_SIZES = ['m', 's', 'l'] as const;

export const CHIP_GROUP_CONTAINER_TYPES = ['inline', 'wrap'] as const;

export const CHIP_GROUP_EVENT_CHIP_COUNT = 5;

export const CHIP_GROUP_ROOT_TESTIDS = {
  default: 'chip-group-default',
  events: 'chip-group-events',
  containerInline: 'chip-group-container-inline',
  containerWrap: 'chip-group-container-wrap',
} as const;

export function chipGroupSizeTestId(size: (typeof CHIP_GROUP_SIZES)[number]): string {
  return `chip-group-size-${size}`;
}

export function chipGroupComboTestId(
  size: (typeof CHIP_GROUP_SIZES)[number],
  container: (typeof CHIP_GROUP_CONTAINER_TYPES)[number],
): string {
  return `chip-group-combo-${size}-${container}`;
}

export function chipGroupEventChipTestId(index: number): string {
  return `chip-group-event-chip-${index}`;
}

/** Every `data-testid` in Test Scenarios (exact showcase values). */
export function allChipGroupPlaygroundTestIds(): string[] {
  const ids: string[] = [CHIP_GROUP_ROOT_TESTIDS.default];

  for (const size of CHIP_GROUP_SIZES) {
    ids.push(chipGroupSizeTestId(size));
  }

  ids.push(CHIP_GROUP_ROOT_TESTIDS.containerInline, CHIP_GROUP_ROOT_TESTIDS.containerWrap);
  ids.push(CHIP_GROUP_ROOT_TESTIDS.events);

  for (let i = 0; i < CHIP_GROUP_EVENT_CHIP_COUNT; i += 1) {
    ids.push(chipGroupEventChipTestId(i));
  }

  for (const size of CHIP_GROUP_SIZES) {
    for (const container of CHIP_GROUP_CONTAINER_TYPES) {
      ids.push(chipGroupComboTestId(size, container));
    }
  }

  return ids;
}

export const CHIP_GROUP_ALL_TESTIDS = allChipGroupPlaygroundTestIds();
