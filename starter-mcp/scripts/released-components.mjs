/**
 * Vendored copy of the OneUI released-component allowlist.
 *
 * SOURCE OF TRUTH: packages/ui/src/registry/releasedComponents.ts
 * (RELEASED_COMPONENTS + PUBLIC_INFRA_COMPONENT_MODULES) on the OneUI monorepo.
 * Re-vendor this list whenever that file changes so the MCP only ever advertises
 * components that the published @jds4/oneui-react actually exports. WIP components
 * (e.g. SegmentedControl, WebHeader, Carousel, FAB, …) must NOT appear here.
 *
 * Used by build-snapshot.mjs and sync-released-components.mjs to filter the baked
 * component catalog. Self-contained: no monorepo import at MCP runtime.
 */
export const RELEASED_COMPONENTS = [
  // RELEASED_COMPONENTS
  'Avatar',
  'Badge',
  'BottomNavigation',
  'Button',
  'Checkbox',
  'CheckboxField',
  'Chip',
  'ChipGroup',
  'CircularProgressIndicator',
  'Container',
  'CounterBadge',
  'Divider',
  'Icon',
  'IconButton',
  'IconContained',
  'Image',
  'IndicatorBadge',
  'Input',
  'InputField',
  'Logo',
  'Modal',
  'Pagination',
  'PaginationDots',
  'Radio',
  'RadioField',
  'SelectableButton',
  'SelectableIconButton',
  'SelectableSingleTextButton',
  'SingleTextButton',
  'Slider',
  'Stepper',
  'Switch',
  'Tabs',
  'Text',
  'Tooltip',
  'TouchSlider',
  // PUBLIC_INFRA_COMPONENT_MODULES (infra, still public)
  'BrandProvider',
  'Surface',
];

/** Normalise a component name/slug for matching (lowercase, alphanumerics only). */
export function normalizeComponent(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Set of released component slugs (normalised), for membership checks. */
export const RELEASED_SLUGS = new Set(RELEASED_COMPONENTS.map(normalizeComponent));
