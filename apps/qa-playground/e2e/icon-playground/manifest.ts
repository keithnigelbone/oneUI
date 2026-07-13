/**
 * Anchors from `IconQaShowcase.tsx` (Test Scenarios tab).
 * `data-testid` is forwarded on the root `<span>` wrapper.
 *
 * Component type: **display** (non-interactive glyph — `role="img"` when labelled,
 * `aria-hidden="true"` when decorative; not tabbable).
 */

export const ICON_PLAYGROUND_ROUTE = '/c/icon';

export const ICON_COMPONENT_TYPE = 'display' as const;

export const ICON_SHOWCASE_AXE_SCOPE = '[data-section^="icon-qa-"]';

export const ICON_DATA_SECTIONS = [
  'icon-qa-default',
  'icon-qa-size',
  'icon-qa-appearance',
  'icon-qa-emphasis',
  'icon-qa-a11y',
  'icon-qa-react-element',
  'icon-qa-surface-context',
  'icon-qa-icon-names',
  'icon-qa-combos',
] as const;

export const ICON_SECTION_COUNT = ICON_DATA_SECTIONS.length;

/** All 20 Figma size values in showcase order (matches `ICON_SIZES` in `@oneui/ui`). */
export const ICON_FIGMA_SIZES = [
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '4.5',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '32',
  '40',
] as const;

export const ICON_FIGMA_APPEARANCES = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const ICON_FIGMA_EMPHASIS = [
  'high',
  'medium',
  'low',
  'tinted',
  'tintedA11y',
] as const;

export const ICON_SURFACE_MODES = [
  'default',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
] as const;

export const ICON_SEMANTIC_NAMES = [
  'heart',
  'star',
  'check',
  'search',
  'settings',
  'home',
] as const;

export const ICON_COMBO_COUNT = 8;

export const ICON_ROOT_TESTIDS = {
  default: 'icon-default',
  a11yLabelled: 'icon-a11y-labelled',
  a11yDecorative: 'icon-a11y-decorative',
  a11yAriaHiddenFalse: 'icon-a11y-aria-hidden-false',
  reactElement: 'icon-react-element',
} as const;

export function iconSizeTestId(size: (typeof ICON_FIGMA_SIZES)[number]): string {
  return `icon-size-${size}`;
}

export function iconAppearanceTestId(
  appearance: (typeof ICON_FIGMA_APPEARANCES)[number],
  emphasis: (typeof ICON_FIGMA_EMPHASIS)[number],
): string {
  return `icon-appearance-${appearance}-${emphasis}`;
}

export function iconEmphasisTestId(emphasis: (typeof ICON_FIGMA_EMPHASIS)[number]): string {
  return `icon-emphasis-${emphasis}`;
}

export function iconSurfaceContainerTestId(mode: (typeof ICON_SURFACE_MODES)[number]): string {
  return `icon-surface-${mode}`;
}

export function iconSurfaceIconTestId(
  mode: (typeof ICON_SURFACE_MODES)[number],
  emphasis: (typeof ICON_FIGMA_EMPHASIS)[number],
): string {
  return `icon-surface-${mode}-${emphasis}`;
}

export function iconNameTestId(name: (typeof ICON_SEMANTIC_NAMES)[number]): string {
  return `icon-name-${name}`;
}

export function iconComboTestId(index: number): string {
  return `icon-combo-${index}`;
}

/** Icon root `data-testid` values in Test Scenarios (excludes Surface container wrappers). */
export function allIconRootTestIds(): string[] {
  const ids: string[] = [ICON_ROOT_TESTIDS.default];

  for (const size of ICON_FIGMA_SIZES) {
    ids.push(iconSizeTestId(size));
  }

  for (const appearance of ICON_FIGMA_APPEARANCES) {
    for (const emphasis of ICON_FIGMA_EMPHASIS) {
      ids.push(iconAppearanceTestId(appearance, emphasis));
    }
  }

  for (const emphasis of ICON_FIGMA_EMPHASIS) {
    ids.push(iconEmphasisTestId(emphasis));
  }

  ids.push(
    ICON_ROOT_TESTIDS.a11yLabelled,
    ICON_ROOT_TESTIDS.a11yDecorative,
    ICON_ROOT_TESTIDS.a11yAriaHiddenFalse,
    ICON_ROOT_TESTIDS.reactElement,
  );

  for (const mode of ICON_SURFACE_MODES) {
    for (const emphasis of ICON_FIGMA_EMPHASIS) {
      ids.push(iconSurfaceIconTestId(mode, emphasis));
    }
  }

  for (const name of ICON_SEMANTIC_NAMES) {
    ids.push(iconNameTestId(name));
  }

  for (let i = 0; i < ICON_COMBO_COUNT; i += 1) {
    ids.push(iconComboTestId(i));
  }

  return ids;
}

/** Surface `<Surface>` container testids in the surface-context band. */
export function allIconSurfaceContainerTestIds(): string[] {
  return ICON_SURFACE_MODES.map((mode) => iconSurfaceContainerTestId(mode));
}

/** Every `data-testid` in Test Scenarios tab (icon roots + surface containers). */
export function allIconPlaygroundTestIds(): string[] {
  return [...allIconRootTestIds(), ...allIconSurfaceContainerTestIds()];
}

export const ICON_ALL_ROOT_TESTIDS = allIconRootTestIds();

export const ICON_ALL_TESTIDS = allIconPlaygroundTestIds();

export const ICON_APPEARANCE_CONTRAST_TESTIDS = ICON_FIGMA_APPEARANCES.map((a) =>
  iconAppearanceTestId(a, 'high'),
) as readonly string[];

/** Representative sizes for spot-check legacy tests. */
export const ICON_SIZE_SPOT_CHECK = ['2', '5', '8', '16', '24', '40'] as const;

export const ICON_APPEARANCE_SPOT_CHECK = [
  'neutral',
  'primary',
  'secondary',
  'positive',
  'warning',
] as const;
