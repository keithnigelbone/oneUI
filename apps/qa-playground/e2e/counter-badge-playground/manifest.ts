/**
 * Anchors from `CounterBadgeQaShowcase.tsx`.
 * `data-testid` is forwarded on the root `<span role="status">`.
 *
 * Component type: **display** (non-interactive count badge).
 */

export const COUNTER_BADGE_PLAYGROUND_ROUTE = '/c/counter-badge';

export const COUNTER_BADGE_COMPONENT_TYPE = 'display' as const;

export const COUNTER_BADGE_SHOWCASE_AXE_SCOPE = '[data-section^="counter-qa"]';

export const COUNTER_BADGE_DATA_SECTIONS = [
  'counter-qa-default',
  'counter-qa-size',
  'counter-qa-attention',
  'counter-qa-appearance',
  'counter-qa-variant',
  'counter-qa-value-max-showzero',
  'counter-qa-combos',
] as const;

export const COUNTER_BADGE_SECTION_COUNT = COUNTER_BADGE_DATA_SECTIONS.length;

/** Figma labels in showcase order. */
export const COUNTER_BADGE_FIGMA_SIZES = ['M', 'XS', 'S', 'L'] as const;

/** Code size tokens. */
export const COUNTER_BADGE_SIZE_TOKENS = ['m', 'xs', 's', 'l'] as const;

export const COUNTER_BADGE_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const COUNTER_BADGE_FIGMA_APPEARANCES = [
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

export const COUNTER_BADGE_VARIANTS = ['bold', 'subtle', 'ghost'] as const;

export const COUNTER_BADGE_COMBO_COUNT = 6;

export const COUNTER_BADGE_ROOT_TESTIDS = {
  default: 'counter-badge-default',
  valueZeroShowZero: 'counter-badge-value-zero-showzero',
  maxOverflow: 'counter-badge-max-overflow',
} as const;

export function counterBadgeSizeTestId(figma: (typeof COUNTER_BADGE_FIGMA_SIZES)[number]): string {
  return `counter-badge-size-${figma}`;
}

export function counterBadgeAttentionTestId(
  attention: (typeof COUNTER_BADGE_ATTENTIONS)[number],
): string {
  return `counter-badge-attention-${attention}`;
}

export function counterBadgeAppearanceTestId(
  appearance: (typeof COUNTER_BADGE_FIGMA_APPEARANCES)[number] | 'brand-bg',
  attention: (typeof COUNTER_BADGE_ATTENTIONS)[number],
): string {
  return `counter-badge-appearance-${appearance}-${attention}`;
}

export function counterBadgeVariantTestId(variant: (typeof COUNTER_BADGE_VARIANTS)[number]): string {
  return `counter-badge-variant-${variant}`;
}

export function counterBadgeComboTestId(index: number): string {
  return `counter-badge-combo-${index}`;
}

export function allCounterBadgePlaygroundTestIds(): string[] {
  const ids: string[] = [COUNTER_BADGE_ROOT_TESTIDS.default];

  for (const figma of COUNTER_BADGE_FIGMA_SIZES) {
    ids.push(counterBadgeSizeTestId(figma));
  }

  for (const attention of COUNTER_BADGE_ATTENTIONS) {
    ids.push(counterBadgeAttentionTestId(attention));
  }

  for (const appearance of COUNTER_BADGE_FIGMA_APPEARANCES) {
    for (const attention of COUNTER_BADGE_ATTENTIONS) {
      ids.push(counterBadgeAppearanceTestId(appearance, attention));
    }
  }

  for (const attention of COUNTER_BADGE_ATTENTIONS) {
    ids.push(counterBadgeAppearanceTestId('brand-bg', attention));
  }

  for (const variant of COUNTER_BADGE_VARIANTS) {
    ids.push(counterBadgeVariantTestId(variant));
  }

  ids.push(COUNTER_BADGE_ROOT_TESTIDS.valueZeroShowZero, COUNTER_BADGE_ROOT_TESTIDS.maxOverflow);

  for (let i = 0; i < COUNTER_BADGE_COMBO_COUNT; i += 1) {
    ids.push(counterBadgeComboTestId(i));
  }

  return ids;
}

export const COUNTER_BADGE_ALL_TESTIDS = allCounterBadgePlaygroundTestIds();

export const COUNTER_BADGE_APPEARANCE_CONTRAST_TESTIDS = [
  ...COUNTER_BADGE_FIGMA_APPEARANCES.map((a) => counterBadgeAppearanceTestId(a, 'high')),
  counterBadgeAppearanceTestId('brand-bg', 'high'),
] as const;

/** Map Figma size label → code `data-size` token. */
export const FIGMA_TO_SIZE_TOKEN: Record<(typeof COUNTER_BADGE_FIGMA_SIZES)[number], (typeof COUNTER_BADGE_SIZE_TOKENS)[number]> = {
  M: 'm',
  XS: 'xs',
  S: 's',
  L: 'l',
};

/** Map attention → data-variant when variant prop is omitted. */
export const ATTENTION_TO_VARIANT = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
} as const;
