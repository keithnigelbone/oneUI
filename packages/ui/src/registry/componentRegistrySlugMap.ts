/**
 * URL / editor slugs → PascalCase registry keys.
 *
 * Shared by componentRegistry, componentTokenMapCore, and Convex consumers
 * that resolve Convex-stored component names without loading React components.
 *
 * Keep in sync when adding registered components.
 */

/** Map URL-safe slugs to PascalCase registry keys */
export const SLUG_TO_REGISTRY_NAME: Record<string, string> = {
  button: 'Button',
  avatar: 'Avatar',
  badge: 'Badge',
  'bottom-navigation': 'BottomNavigation',
  card: 'Card',
  carousel: 'Carousel',
  'chip-group': 'ChipGroup',
  container: 'Container',
  icon: 'Icon',
  'icon-button': 'IconButton',
  'icon-contained': 'IconContained',
  image: 'Image',
  checkbox: 'Checkbox',
  radio: 'Radio',
  'link-button': 'LinkButton',
  switch: 'Switch',
  stepper: 'Stepper',
  'counter-badge': 'CounterBadge',
  'indicator-badge': 'IndicatorBadge',
  divider: 'Divider',
  fab: 'FAB',
  grid: 'Grid',
  'list-item': 'ListItem',
  'list-item-group': 'ListItemGroup',
  logo: 'Logo',
  'linear-progress-indicator': 'LinearProgressIndicator',
  chip: 'Chip',
  'pagination-dots': 'PaginationDots',
  select: 'Select',
  'selectable-button': 'SelectableButton',
  'selectable-icon-button': 'SelectableIconButton',
  'selectable-single-text-button': 'SelectableSingleTextButton',
  surface: 'Surface',
  tabs: 'Tabs',
  tooltip: 'Tooltip',
  'input-field': 'InputField',
  input: 'InputField',
  spinner: 'Spinner',
  skeleton: 'Skeleton',
  slider: 'Slider',
  'touch-slider': 'TouchSlider',
  'web-header': 'WebHeader',
};

/** Resolve a URL slug to a PascalCase registry key */
export function resolveRegistrySlug(slug: string): string | null {
  return SLUG_TO_REGISTRY_NAME[slug] ?? null;
}

/** Normalize Convex/editor names that may be slug or PascalCase */
export function normalizeComponentRegistryKey(name: string): string {
  const asSlug = name.toLowerCase();
  return SLUG_TO_REGISTRY_NAME[asSlug] ?? name;
}
