/**
 * Anchors from `IconContainedQaShowcase.tsx` (Test Scenarios tab).
 * `data-testid` is on the wrapper `<span>`; labelled icons use `[role="img"][data-size]`;
 * decorative icons (no `aria-label`) use `[data-size][aria-hidden="true"]`.
 *
 * Component type: **display** (non-interactive circular icon container).
 */

export const ICON_CONTAINED_PLAYGROUND_ROUTE = '/c/icon-contained';

export const ICON_CONTAINED_COMPONENT_TYPE = 'display' as const;

export const ICON_CONTAINED_SHOWCASE_AXE_SCOPE = '[data-section^="icon-contained-qa-"]';

export const ICON_CONTAINED_FIGMA_VALIDATION_TAB = 'Figma Validation';

export const ICON_CONTAINED_DATA_SECTIONS = [
  'icon-contained-qa-default',
  'icon-contained-qa-size',
  'icon-contained-qa-attention',
  'icon-contained-qa-appearance',
  'icon-contained-qa-a11y',
  'icon-contained-qa-bug-repro',
  'icon-contained-qa-disabled',
  'icon-contained-qa-surface',
] as const;

export const ICON_CONTAINED_SECTION_COUNT = ICON_CONTAINED_DATA_SECTIONS.length;

export const ICON_CONTAINED_FIGMA_SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;

export const ICON_CONTAINED_FIGMA_ATTENTION = ['medium', 'high'] as const;

export const ICON_CONTAINED_FIGMA_APPEARANCES = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const ICON_CONTAINED_ROOT_TESTIDS = {
  default: 'icon-contained-default',
  a11yLabelled: 'icon-contained-a11y-labelled',
  bugDecorative: 'icon-contained-bug-decorative',
  disabled: 'icon-contained-disabled',
  surfaceSubtle: 'icon-contained-surface-subtle',
} as const;

export function iconContainedSizeTestId(size: (typeof ICON_CONTAINED_FIGMA_SIZES)[number]): string {
  return `icon-contained-size-${size}`;
}

export function iconContainedAttentionTestId(
  attention: (typeof ICON_CONTAINED_FIGMA_ATTENTION)[number],
): string {
  return `icon-contained-attention-${attention}`;
}

export function iconContainedAppearanceTestId(
  appearance: (typeof ICON_CONTAINED_FIGMA_APPEARANCES)[number],
): string {
  return `icon-contained-appearance-${appearance}`;
}

/** Every `data-testid` in Test Scenarios tab. */
export function allIconContainedPlaygroundTestIds(): string[] {
  const ids: string[] = [ICON_CONTAINED_ROOT_TESTIDS.default];

  for (const size of ICON_CONTAINED_FIGMA_SIZES) {
    ids.push(iconContainedSizeTestId(size));
  }

  for (const attention of ICON_CONTAINED_FIGMA_ATTENTION) {
    ids.push(iconContainedAttentionTestId(attention));
  }

  for (const appearance of ICON_CONTAINED_FIGMA_APPEARANCES) {
    ids.push(iconContainedAppearanceTestId(appearance));
  }

  ids.push(
    ICON_CONTAINED_ROOT_TESTIDS.a11yLabelled,
    ICON_CONTAINED_ROOT_TESTIDS.bugDecorative,
    ICON_CONTAINED_ROOT_TESTIDS.disabled,
    ICON_CONTAINED_ROOT_TESTIDS.surfaceSubtle,
  );

  return ids;
}

export const ICON_CONTAINED_ALL_TESTIDS = allIconContainedPlaygroundTestIds();

export const ICON_CONTAINED_APPEARANCE_CONTRAST_TESTIDS = ICON_CONTAINED_FIGMA_APPEARANCES.map((a) =>
  iconContainedAppearanceTestId(a),
) as readonly string[];

/** Story band for decorative usage (no `aria-label`). Former BUG-ICONCONTAINED-001 repro — now fixed. */
export const ICON_CONTAINED_DECORATIVE_BAND = 'icon-contained-qa-bug-repro' as const;

/** @deprecated Use {@link ICON_CONTAINED_DECORATIVE_BAND}. */
export const ICON_CONTAINED_BUG_BAND = ICON_CONTAINED_DECORATIVE_BAND;

/** Wrapper testids whose IconContained omits `aria-label` (decorative / aria-hidden). */
export const ICON_CONTAINED_DECORATIVE_WRAPPER_TESTIDS = new Set<string>([
  ICON_CONTAINED_ROOT_TESTIDS.bugDecorative,
]);
