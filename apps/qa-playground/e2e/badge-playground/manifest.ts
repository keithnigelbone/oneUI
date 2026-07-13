/**
 * Single source of truth for Badge QA playground selectors.
 *
 * **Sync with:** `src/components/badge/BadgeQaShowcase.tsx`
 * (`QaStoryBand` `id` → `data-section`; `Badge` `data-testid` on root span only.)
 */
export const BADGE_PLAYGROUND_ROUTE = '/c/badge';

export const BADGE_COMPONENT_TYPE = 'display' as const;

/** CSS scope for axe — story bands only (excludes QA catalog chrome on `/c/badge`). */
export const BADGE_SHOWCASE_AXE_SCOPE = '[data-section^="badge-qa"]';

/** `QaStoryBand` `id` values — rendered as `data-section` on `<section>`. */
export const BADGE_PLAYGROUND_SECTION_IDS = [
  'badge-qa-default',
  'badge-qa-size',
  'badge-qa-attention',
  'badge-qa-attention-both-slots',
  'badge-qa-appearance',
  'badge-qa-start-slot',
  'badge-qa-end-slot',
  'badge-qa-start-end-combo',
  'badge-qa-accent',
  'badge-qa-content',
  'badge-qa-combos',
] as const;

export const BADGE_DATA_SECTIONS = BADGE_PLAYGROUND_SECTION_IDS;

/** Every `data-testid` on the root `<Badge>` span in `BadgeQaShowcase`. */
export const BADGE_PLAYGROUND_DATA_TESTIDS = [
  'badge-default',
  'badge-size-XS',
  'badge-size-S',
  'badge-size-M',
  'badge-size-L',
  'badge-size-XL',
  'badge-attention-high',
  'badge-attention-medium',
  'badge-attention-low',
  'badge-attention-both-icon-high',
  'badge-attention-both-icon-medium',
  'badge-attention-both-icon-low',
  'badge-attention-both-avatar-high',
  'badge-attention-both-avatar-medium',
  'badge-attention-both-avatar-low',
  'badge-attention-both-counterbadge-high',
  'badge-attention-both-counterbadge-medium',
  'badge-attention-both-counterbadge-low',
  'badge-attention-both-indicatorbadge-high',
  'badge-attention-both-indicatorbadge-medium',
  'badge-attention-both-indicatorbadge-low',
  'badge-appearance-auto',
  'badge-appearance-neutral',
  'badge-appearance-primary',
  'badge-appearance-secondary',
  'badge-appearance-sparkle',
  'badge-appearance-negative',
  'badge-appearance-positive',
  'badge-appearance-warning',
  'badge-appearance-informative',
  'badge-start-none',
  'badge-start-Icon',
  'badge-start-Avatar',
  'badge-start-CounterBadge',
  'badge-start-IndicatorBadge',
  'badge-end-none',
  'badge-end-Icon',
  'badge-end-Avatar',
  'badge-end-CounterBadge',
  'badge-end-IndicatorBadge',
  'badge-start-icon-end-none',
  'badge-start-none-end-icon',
  'badge-start-icon-end-icon',
  'badge-start-avatar-end-none',
  'badge-start-counterbadge-end-none',
  'badge-start-indicatorbadge-end-none',
  'badge-start-avatar-end-counterbadge',
  'badge-accent-primary',
  'badge-accent-secondary',
  'badge-accent-sparkle',
  'badge-content-text',
  'badge-combo-0',
  'badge-combo-1',
  'badge-combo-2',
  'badge-combo-3',
  'badge-combo-4',
  'badge-combo-5',
  'badge-combo-6',
  'badge-combo-7',
  'badge-combo-8',
  'badge-combo-9',
  'badge-combo-10',
  'badge-combo-11',
  'badge-combo-12',
  'badge-combo-13',
  'badge-combo-14',
  'badge-combo-15',
  'badge-combo-16',
  'badge-combo-17',
  'badge-combo-18',
  'badge-combo-19',
] as const;

export const BADGE_ALL_TESTIDS = BADGE_PLAYGROUND_DATA_TESTIDS;

export const BADGE_SIZE_ORDER_FIGMA = ['XS', 'S', 'M', 'L', 'XL'] as const;

export const BADGE_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const BADGE_APPEARANCE_KEYS = [
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

export const BADGE_COMBO_COUNT = 20;

export const BADGE_ROOT_TESTIDS = {
  default: 'badge-default',
  contentText: 'badge-content-text',
} as const;

/** Figma size labels on the playground → code `data-size` values. */
export const FIGMA_TO_CODE_SIZE: Record<(typeof BADGE_SIZE_ORDER_FIGMA)[number], string> = {
  XS: 'xs',
  S: 's',
  M: 'm',
  L: 'l',
  XL: 'xl',
};

export function badgeSizeTestId(figma: (typeof BADGE_SIZE_ORDER_FIGMA)[number]): string {
  return `badge-size-${figma}`;
}

export function badgeAttentionTestId(attention: (typeof BADGE_ATTENTIONS)[number]): string {
  return `badge-attention-${attention}`;
}

export function badgeAppearanceTestId(appearance: (typeof BADGE_APPEARANCE_KEYS)[number]): string {
  return `badge-appearance-${appearance}`;
}

export function badgeComboTestId(index: number): string {
  return `badge-combo-${index}`;
}

export const BADGE_ATTENTION_BOTH_SLOT_PREFIXES = [
  'badge-attention-both-icon',
  'badge-attention-both-avatar',
  'badge-attention-both-counterbadge',
  'badge-attention-both-indicatorbadge',
] as const;

export function badgeAttentionBothSlotsTestId(
  prefix: (typeof BADGE_ATTENTION_BOTH_SLOT_PREFIXES)[number],
  attention: (typeof BADGE_ATTENTIONS)[number],
): string {
  return `${prefix}-${attention}`;
}

export const BADGE_APPEARANCE_A11Y_TESTIDS = BADGE_APPEARANCE_KEYS.map(
  (a) => `badge-appearance-${a}`,
) as readonly string[];
