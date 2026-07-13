/**
 * Static per-weight font family maps for React Native.
 *
 * Stock RN does not reliably drive variable-font `wght` from `fontWeight`.
 * Host apps register one `.ttf` per weight under distinct `fontFamily` keys;
 * the theme maps numeric weight → that key via `staticWeightFamilies`.
 */

import type { TypographyRole } from '../data/typography-roles';
import type { FontWeightValue } from './buildNativeTypography';

export type TypographyFontSlot = 'primary' | 'secondary' | 'code';

/** Standard CSS weight stops used for static family keys. */
export const STANDARD_CSS_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export type StandardCssWeight = (typeof STANDARD_CSS_WEIGHTS)[number];

/** Suffix segment in `Prefix-Suffix` Expo registration keys. */
export const CSS_WEIGHT_FAMILY_SUFFIX: Record<StandardCssWeight, string> = {
  100: 'Thin',
  200: 'ExtraLight',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'SemiBold',
  700: 'Bold',
  800: 'ExtraBold',
  900: 'Black',
};

export type StaticWeightFamilyMap = Record<StandardCssWeight, string>;

export type StaticWeightFamiliesBySlot = Partial<
  Record<TypographyFontSlot, Partial<StaticWeightFamilyMap>>
>;

/**
 * Canonical Expo `useFonts` keys for bundled JioType static cuts.
 * Host apps register these names; native typography maps CSS weights here.
 */
export const JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES: StaticWeightFamilyMap = {
  100: 'JioType-Hairline',
  200: 'JioType-Hairline',
  300: 'JioType-Light',
  400: 'JioType',
  500: 'JioType-Medium',
  600: 'JioType-Bold',
  700: 'JioType-Bold',
  800: 'JioType-ExtraBlack',
  900: 'JioType-Black',
};

const JIO_TYPE_DEFAULT_STATIC_SLOTS: StaticWeightFamiliesBySlot = {
  primary: JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES,
  secondary: JIO_TYPE_BUNDLED_STATIC_WEIGHT_FAMILIES,
};

/** Merge theme/brand static maps on top of bundled Jio defaults (per weight key). */
export function mergeWithJioBundledStaticDefaults(
  maps?: StaticWeightFamiliesBySlot | null,
): StaticWeightFamiliesBySlot {
  return {
    primary: { ...JIO_TYPE_DEFAULT_STATIC_SLOTS.primary, ...maps?.primary },
    secondary: { ...JIO_TYPE_DEFAULT_STATIC_SLOTS.secondary, ...maps?.secondary },
    ...(maps?.code ? { code: maps.code } : {}),
  };
}

export interface StaticWeightFamilyPrefixConfig {
  primary?: string;
  secondary?: string;
  code?: string;
}

/**
 * Build `{ 100: 'JioTypeUI-Thin', …, 900: 'JioTypeUI-Black' }` from an Expo
 * `useFonts` key prefix (no space — matches sliced PostScript names).
 */
export function buildStaticWeightFamilyMap(prefix: string): StaticWeightFamilyMap {
  const out = {} as StaticWeightFamilyMap;
  for (const w of STANDARD_CSS_WEIGHTS) {
    // Bundled JioType registers the 400 cut as `JioType`, not `JioType-Regular`.
    if (prefix === 'JioType' && w === 400) {
      out[w] = prefix;
      continue;
    }
    out[w] = `${prefix}-${CSS_WEIGHT_FAMILY_SUFFIX[w]}`;
  }
  return out;
}

/** Snap arbitrary numeric weight to the nearest standard CSS stop (100–900). */
export function snapToStandardCssWeight(weight: number): StandardCssWeight {
  const clamped = Math.min(900, Math.max(100, Math.round(weight / 100) * 100));
  return clamped as StandardCssWeight;
}

/** Maps typography role → font slot for static weight family lookup. */
export function typographySlotForRole(role: TypographyRole): TypographyFontSlot {
  if (role === 'code') return 'code';
  if (role === 'display' || role === 'headline' || role === 'title') return 'secondary';
  return 'primary';
}

/** Resolve a static cut family name for a numeric weight, or undefined. */
export function resolveStaticWeightFamily(
  map: Partial<StaticWeightFamilyMap> | undefined,
  weight: number,
): string | undefined {
  if (!map) return undefined;
  const snapped = snapToStandardCssWeight(weight);
  return map[snapped];
}

/**
 * Merge optional per-slot prefixes with explicit per-weight overrides into the
 * theme's `staticWeightFamilies` table.
 */
export function mergeStaticWeightFamilyConfig(
  prefix?: StaticWeightFamilyPrefixConfig | null,
  explicit?: StaticWeightFamiliesBySlot | null,
): StaticWeightFamiliesBySlot | undefined {
  const merged: StaticWeightFamiliesBySlot = {};
  const slots: TypographyFontSlot[] = ['primary', 'secondary', 'code'];

  for (const slot of slots) {
    const slotPrefix = prefix?.[slot];
    const fromPrefix = slotPrefix ? buildStaticWeightFamilyMap(slotPrefix) : undefined;
    const fromExplicit = explicit?.[slot];
    if (!fromPrefix && !fromExplicit) continue;
    merged[slot] = { ...fromPrefix, ...fromExplicit };
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** Type guard: weight is a known standard stop with a map entry. */
export function isStandardCssWeight(weight: number): weight is StandardCssWeight {
  return (STANDARD_CSS_WEIGHTS as readonly number[]).includes(weight);
}

export function resolveStaticWeightFamilyForRole(
  staticFamilies: StaticWeightFamiliesBySlot | undefined,
  role: TypographyRole,
  weight: FontWeightValue | number,
): string | undefined {
  if (!staticFamilies) return undefined;
  const slot = typographySlotForRole(role);
  return resolveStaticWeightFamily(staticFamilies[slot], weight);
}
