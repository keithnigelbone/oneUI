/**
 * Anchors from `SwitchQaShowcase.tsx` — keep in sync when the showcase changes.
 * Component type: interactive (toggle switch — role="switch", aria-checked).
 */

export const SWITCH_COMPONENT_TYPE = 'interactive' as const;

export const SWITCH_PLAYGROUND_ROUTE = '/c/switch';

export const SWITCH_SHOWCASE_AXE_SCOPE = '[data-section^="switch-figma-"]';

export const SWITCH_FIGMA_SIZES = ['s', 'm', 'l'] as const;

export const SWITCH_FIGMA_APPEARANCES = [
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

export const SWITCH_ACCENTS = ['primary', 'secondary', 'sparkle'] as const;

/** `data-section` values from `QaStoryBand` `id` props (exact). */
export const SWITCH_DATA_SECTIONS = [
  'switch-figma-default',
  'switch-figma-size-selected',
  'switch-figma-appearance',
  'switch-figma-accent',
  'switch-figma-disabled',
  'switch-figma-readonly',
  'switch-figma-selected-interactive',
] as const;

export const SWITCH_SECTION_COUNT = SWITCH_DATA_SECTIONS.length;

/** Preserved spot-check list from original `switch-qa.spec.ts` — do not remove. */
export const SWITCH_PRESERVED_SPOT_TESTIDS = [
  'sw-figma-default',
  'sw-figma-size-s-selected-false',
  'sw-figma-size-s-selected-true',
  'sw-figma-appearance-primary-off',
  'sw-figma-accent-primary-off',
  'sw-figma-disabled-false',
  'sw-figma-readonly-true-off',
  'sw-figma-selected-controlled',
] as const;

export function switchSizeTestId(size: (typeof SWITCH_FIGMA_SIZES)[number], selected: boolean): string {
  return `sw-figma-size-${size}-selected-${selected ? 'true' : 'false'}`;
}

export function switchAppearanceTestId(appearance: string, on: boolean): string {
  return `sw-figma-appearance-${appearance}-${on ? 'on' : 'off'}`;
}

export function switchAccentTestId(accent: (typeof SWITCH_ACCENTS)[number], on: boolean): string {
  return `sw-figma-accent-${accent}-${on ? 'on' : 'off'}`;
}

export function buildSwitchAllTestIds(): string[] {
  const out: string[] = ['sw-figma-default'];

  for (const size of SWITCH_FIGMA_SIZES) {
    out.push(switchSizeTestId(size, false));
    out.push(switchSizeTestId(size, true));
  }

  for (const appearance of SWITCH_FIGMA_APPEARANCES) {
    out.push(switchAppearanceTestId(appearance, false));
    out.push(switchAppearanceTestId(appearance, true));
  }
  out.push(switchAppearanceTestId('brand-bg', false));
  out.push(switchAppearanceTestId('brand-bg', true));

  for (const accent of SWITCH_ACCENTS) {
    out.push(switchAccentTestId(accent, false));
    out.push(switchAccentTestId(accent, true));
  }

  out.push('sw-figma-disabled-false');
  out.push('sw-figma-disabled-true-off');
  out.push('sw-figma-disabled-true-on');
  out.push('sw-figma-readonly-false');
  out.push('sw-figma-readonly-true-off');
  out.push('sw-figma-readonly-true-on');
  out.push('sw-figma-selected-controlled');

  return out;
}

export const SWITCH_ALL_TESTIDS = buildSwitchAllTestIds();

export const SWITCH_SMOKE_TESTID = 'sw-figma-default';

export const SWITCH_AXE_TARGET_TESTIDS = [
  'sw-figma-default',
  switchSizeTestId('m', false),
  switchAppearanceTestId('primary', true),
  switchAccentTestId('primary', true),
  'sw-figma-disabled-true-on',
  'sw-figma-readonly-true-on',
  'sw-figma-selected-controlled',
] as const;

export const SWITCH_APPEARANCE_CONTRAST_TESTIDS = [
  'sw-figma-appearance-primary-off',
  'sw-figma-appearance-primary-on',
  'sw-figma-appearance-negative-off',
  'sw-figma-appearance-negative-on',
  'sw-figma-appearance-brand-bg-off',
  'sw-figma-appearance-brand-bg-on',
] as const;
