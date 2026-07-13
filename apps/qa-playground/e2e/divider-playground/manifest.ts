/**
 * Anchors from `DividerQaShowcase.tsx` (Test Scenarios tab).
 * `data-testid` is forwarded on the root separator only.
 *
 * Component type: **display** (decorative separator — `role="separator"`, not tabbable).
 */

export const DIVIDER_PLAYGROUND_ROUTE = '/c/divider';

export const DIVIDER_COMPONENT_TYPE = 'display' as const;

export const DIVIDER_SHOWCASE_AXE_SCOPE = '[data-section^="divider-qa"]';

export const DIVIDER_FIGMA_VALIDATION_TAB = 'Divider - Figma Validation';

export const DIVIDER_FIGMA_MATRIX_SECTIONS = [
  'divider-qa-horizontal-full-matrix',
  'divider-qa-vertical-full-matrix',
] as const;

export const DIVIDER_DATA_SECTIONS = [
  'divider-qa-default',
  'divider-qa-orientation',
  'divider-qa-size',
  'divider-qa-slot',
  'divider-qa-content-align',
  'divider-qa-appearance',
  'divider-qa-attention',
  'divider-qa-round-caps',
  'divider-qa-vertical-slot',
  'divider-qa-combos',
] as const;

export const DIVIDER_SECTION_COUNT = DIVIDER_DATA_SECTIONS.length;

export const DIVIDER_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const DIVIDER_SIZE_TOKENS = ['s', 'm', 'l'] as const;

export const DIVIDER_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const DIVIDER_CONTENT_ALIGNS = ['center', 'start', 'end'] as const;

export const DIVIDER_FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const DIVIDER_COMBO_COUNT = 6;

export const DIVIDER_ROOT_TESTIDS = {
  default: 'divider-default',
  orientationHorizontal: 'divider-orientation-horizontal',
  orientationVertical: 'divider-orientation-vertical',
  slotNone: 'divider-slot-none',
  slotIcon: 'divider-slot-icon',
  slotLabel: 'divider-slot-label',
  roundCapsFalse: 'divider-roundCaps-false',
  roundCapsTrue: 'divider-roundCaps-true',
} as const;

export function dividerSizeTestId(
  attention: (typeof DIVIDER_ATTENTIONS)[number],
  figma: (typeof DIVIDER_FIGMA_SIZES)[number],
): string {
  return `divider-size-${attention}-${figma}`;
}

export function dividerAppearanceTestId(
  appearance: (typeof DIVIDER_FIGMA_APPEARANCES)[number],
): string {
  return `divider-appearance-${appearance}`;
}

export function dividerContentAlignTestId(align: (typeof DIVIDER_CONTENT_ALIGNS)[number]): string {
  return `divider-contentAlign-${align}`;
}

export function dividerAttentionLabelTestId(
  attention: (typeof DIVIDER_ATTENTIONS)[number],
): string {
  return `divider-attention-${attention}-label`;
}

export function dividerAttentionIconTestId(
  attention: (typeof DIVIDER_ATTENTIONS)[number],
): string {
  return `divider-attention-${attention}-icon`;
}

export function dividerVerticalIconAlignTestId(
  align: (typeof DIVIDER_CONTENT_ALIGNS)[number],
): string {
  return `divider-vertical-icon-${align}`;
}

export function dividerComboTestId(index: number): string {
  return `divider-combo-${index}`;
}

export function allDividerPlaygroundTestIds(): string[] {
  const ids: string[] = [DIVIDER_ROOT_TESTIDS.default];

  ids.push(DIVIDER_ROOT_TESTIDS.orientationHorizontal, DIVIDER_ROOT_TESTIDS.orientationVertical);

  for (const attention of DIVIDER_ATTENTIONS) {
    for (const figma of DIVIDER_FIGMA_SIZES) {
      ids.push(dividerSizeTestId(attention, figma));
    }
  }

  ids.push(
    DIVIDER_ROOT_TESTIDS.slotNone,
    DIVIDER_ROOT_TESTIDS.slotIcon,
    DIVIDER_ROOT_TESTIDS.slotLabel,
  );

  for (const align of DIVIDER_CONTENT_ALIGNS) {
    ids.push(dividerContentAlignTestId(align));
  }

  for (const appearance of DIVIDER_FIGMA_APPEARANCES) {
    ids.push(dividerAppearanceTestId(appearance));
  }

  for (const attention of DIVIDER_ATTENTIONS) {
    ids.push(dividerAttentionLabelTestId(attention), dividerAttentionIconTestId(attention));
  }

  ids.push(DIVIDER_ROOT_TESTIDS.roundCapsFalse, DIVIDER_ROOT_TESTIDS.roundCapsTrue);

  for (const align of DIVIDER_CONTENT_ALIGNS) {
    ids.push(dividerVerticalIconAlignTestId(align));
  }

  for (let i = 0; i < DIVIDER_COMBO_COUNT; i += 1) {
    ids.push(dividerComboTestId(i));
  }

  return ids;
}

export const DIVIDER_ALL_TESTIDS = allDividerPlaygroundTestIds();

export const DIVIDER_APPEARANCE_CONTRAST_TESTIDS = DIVIDER_FIGMA_APPEARANCES.map((a) =>
  dividerAppearanceTestId(a),
) as readonly string[];
export const FIGMA_TO_SIZE_TOKEN: Record<
  (typeof DIVIDER_FIGMA_SIZES)[number],
  (typeof DIVIDER_SIZE_TOKENS)[number]
> = {
  S: 's',
  M: 'm',
  L: 'l',
};
