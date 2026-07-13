/**
 * releasedComponents.ts — canonical source of truth for which components in
 * `@oneui/ui` are part of the public (released) API surface.
 *
 * Consumed by:
 *   - `cdn-release-full-pipeline/build/componentAllowlist.ts` (re-export) —
 *     gates deep-path imports (`@jds4/oneui-react/components/*`) at publish time.
 *   - `scripts/generate-public-barrel.ts` — generates `src/index.public.ts`,
 *     the trimmed root barrel that the published tarball's `.` export points to,
 *     so WIP components cannot be imported from the package root either.
 *
 * This list gates COMPONENT exposure only. Providers, hooks, contexts, icons,
 * registry, engine, runtime, and utils exports are never filtered by it.
 *
 * Adding a new public component: add its directory name (case-sensitive,
 * matches the folder under `packages/ui/src/components/`) here, then run
 * `pnpm generate:public-barrel`.
 */

export const RELEASED_COMPONENTS: readonly string[] = [
  'Avatar',
  'Badge',
  'BottomNavigation',
  'Button',
  'Checkbox',
  'CheckboxField',
  'Chip',
  'ChipGroup',
  'CircularProgressIndicator',
  'LinearProgressIndicator',
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
  'Select',
  'SingleTextButton',
  'Slider',
  'Stepper',
  'Switch',
  'Tabs',
  'Text',
  'Tooltip',
  'TouchSlider',
];

/**
 * Modules that live under `src/components/` but are infrastructure, not UI
 * components — they stay importable from the public barrel even though they
 * are not on the released-component list.
 *
 * - BrandProvider: required by every consumer app to inject brand CSS.
 * - Surface: core of the design system's context-awareness contract; every
 *   consumer placing components on tinted/dark backgrounds must use it.
 */
export const PUBLIC_INFRA_COMPONENT_MODULES: readonly string[] = [
  'BrandProvider',
  'Surface',
];

const releasedSet = new Set<string>([
  ...RELEASED_COMPONENTS,
  ...PUBLIC_INFRA_COMPONENT_MODULES,
]);

/** True if the component folder name is part of the public API surface. */
export function isComponentReleased(name: string): boolean {
  return releasedSet.has(name);
}
