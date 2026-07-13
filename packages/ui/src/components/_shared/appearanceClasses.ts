import type { ComponentAppearance } from '@oneui/shared';

/** Build the standard 9-role appearance → CSS class map. */
export function makeAppearanceClassMap(
  styles: Record<string, string>,
): Record<Exclude<ComponentAppearance, 'auto'>, string | undefined> {
  return {
    primary: styles.appearancePrimary,
    neutral: styles.appearanceNeutral,
    secondary: styles.appearanceSecondary,
    sparkle: styles.appearanceSparkle,
    'brand-bg': styles.appearanceBrandBg,
    positive: styles.appearancePositive,
    negative: styles.appearanceNegative,
    warning: styles.appearanceWarning,
    informative: styles.appearanceInformative,
  };
}

/**
 * Return an appearance class for CSS role remapping.
 *
 * - Explicit role (`appearance="secondary"` etc.) → always map.
 * - `auto` / unset at page root → no class; `.button` defaults + brand
 *   `--Button-role*` overrides stay in control.
 * - `auto` / unset inside a `<Surface>` → map `resolvedAppearance` so
 *   inherited roles (e.g. secondary from a ghost parent) reach CSS,
 *   UNLESS the inherited role equals the component's default role —
 *   in that case stay off so the brand `--Component-role*` override
 *   layer keeps working inside primary (or secondary, for Chip) Surfaces.
 *
 * `defaultRole` is the role the component resolves to at page root with
 * `auto` (Button-family = 'primary', Chip = 'secondary'). Defaults to
 * `'primary'` for backward compatibility.
 *
 * Generic over `T` so components with extended appearance unions (e.g.
 * SingleTextButton adds `tertiary` / `quaternary`) can route through the
 * same helper instead of duplicating the gate inline.
 */
export function explicitAppearanceClass<T extends string = Exclude<ComponentAppearance, 'auto'>>(
  appearance: T | 'auto' | undefined,
  resolvedAppearance: T | undefined,
  classMap: Record<T, string | undefined>,
  inheritedFromSurface = false,
  defaultRole: T = 'primary' as T,
): string | undefined {
  if (!resolvedAppearance || resolvedAppearance === 'auto') {
    return undefined;
  }
  if (appearance && appearance !== 'auto') {
    return classMap[resolvedAppearance];
  }
  if (inheritedFromSurface && resolvedAppearance !== defaultRole) {
    return classMap[resolvedAppearance];
  }
  return undefined;
}

/** Form-control accent factory — only the 3 accent roles. */
export function makeAccentClassMap(
  styles: Record<string, string>,
): Record<'primary' | 'secondary' | 'sparkle', string | undefined> {
  return {
    primary: styles.accentPrimary,
    secondary: styles.accentSecondary,
    sparkle: styles.accentSparkle,
  };
}
