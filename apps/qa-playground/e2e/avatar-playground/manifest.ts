/**
 * Anchors from `AvatarQaShowcase.tsx` — `data-testid` on root `<Avatar>` span only.
 * `data-section` === `QaStoryBand` `id`.
 */

export const AVATAR_PLAYGROUND_ROUTE = '/c/avatar';
export const AVATAR_COMPONENT_TYPE = 'display' as const;

/** CSS scope for axe — story bands only (excludes QA catalog chrome on `/c/avatar`). */
export const AVATAR_SHOWCASE_AXE_SCOPE = '[data-section^="avatar-qa"]';

export const AVATAR_DATA_SECTIONS = [
  'avatar-qa-default',
  'avatar-qa-size',
  'avatar-qa-attention',
  'avatar-qa-appearance',
  'avatar-qa-content',
  'avatar-qa-accent',
  'avatar-qa-disabled',
  'avatar-qa-combos',
] as const;

/** Figma labels in size band (code `size` is lowercase). */
export const AVATAR_FIGMA_SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'] as const;

export const AVATAR_ATTENTIONS = ['high', 'medium', 'low'] as const;

export const AVATAR_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
  'brand-bg',
] as const;

export const AVATAR_CONTENT_MODES = ['image', 'icon', 'text'] as const;

export const AVATAR_COMBO_COUNT = 5;

export const AVATAR_ROOT_TESTIDS = {
  default: 'avatar-default',
  sizeCustom: 'avatar-size-custom',
  disabledFalse: 'avatar-disabled-false',
  disabledTrue: 'avatar-disabled-true',
} as const;

export function avatarSizeTestId(figma: (typeof AVATAR_FIGMA_SIZES)[number]): string {
  return `avatar-size-${figma}`;
}

export function avatarAttentionTestId(attention: (typeof AVATAR_ATTENTIONS)[number]): string {
  return `avatar-attention-${attention}`;
}

export function avatarAppearanceTestId(appearance: (typeof AVATAR_APPEARANCES)[number]): string {
  return `avatar-appearance-${appearance}`;
}

export function avatarContentTestId(content: (typeof AVATAR_CONTENT_MODES)[number]): string {
  return `avatar-content-${content}`;
}

export function avatarComboTestId(index: number): string {
  return `avatar-combo-${index}`;
}

export function buildAvatarAllTestIds(): string[] {
  const ids: string[] = [
    AVATAR_ROOT_TESTIDS.default,
    AVATAR_ROOT_TESTIDS.sizeCustom,
    AVATAR_ROOT_TESTIDS.disabledFalse,
    AVATAR_ROOT_TESTIDS.disabledTrue,
    'avatar-accent-standin-primary',
    'avatar-accent-standin-secondary',
    'avatar-accent-standin-sparkle',
  ];

  for (const figma of AVATAR_FIGMA_SIZES) {
    ids.push(avatarSizeTestId(figma));
  }
  for (const attention of AVATAR_ATTENTIONS) {
    ids.push(avatarAttentionTestId(attention));
  }
  for (const appearance of AVATAR_APPEARANCES) {
    ids.push(avatarAppearanceTestId(appearance));
  }
  for (const content of AVATAR_CONTENT_MODES) {
    ids.push(avatarContentTestId(content));
  }
  for (let i = 0; i < AVATAR_COMBO_COUNT; i++) {
    ids.push(avatarComboTestId(i));
  }

  return ids;
}

export const AVATAR_ALL_TESTIDS = buildAvatarAllTestIds() as readonly string[];
