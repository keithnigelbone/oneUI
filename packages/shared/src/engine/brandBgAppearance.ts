/**
 * Brand-BG role bridging: `appearance.background` vs `accents[]` with `role: 'brand-bg'`.
 *
 * Some brands only define background scale + step on `appearanceConfig.background` and omit
 * a `brand-bg` accent row. Without synthesis, `--Brand-Bg-*` tokens never build and bold
 * fills drift. When `brand-bg` exists but `baseStep` is unset, we fall back to
 * `background.backgroundStep.light` then the scale anchor.
 */

import { buildPaletteFromScale } from './paletteUtils';
import { buildScaleDefinition, type ScaleDefinition } from './surfaceNew';
import type { EngineAvailableScale } from './types';

const DEFAULT_BRAND_BG_FALLBACK_ANCHOR = 1300;

/**
 * Appearance roles where the accent row’s `baseStep` is the pinned candidate for
 * palette resolution: `--{Role}-FG-Bold`, `--{Role}-Fill-Bold`, and JioRibbon
 * aliases (`--JioRibbon-color1..3` ← Primary/Secondary/Sparkle FG-Bold). The
 * pinned candidate still flows through the plugin's bold distance rule.
 */
export const APPEARANCE_ROLES_ANCHOR_BOLD = new Set([
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
]);

export function isAppearanceRoleAnchoringBold(role: string): boolean {
  return APPEARANCE_ROLES_ANCHOR_BOLD.has(role);
}

export function effectiveBrandBgBaseStep(
  accentBaseStep: number | null | undefined,
  backgroundLightStep: number | null | undefined,
  scaleBaseStep: number | null | undefined,
): number {
  return (
    accentBaseStep ??
    backgroundLightStep ??
    scaleBaseStep ??
    DEFAULT_BRAND_BG_FALLBACK_ANCHOR
  );
}

/** Minimal shape for synthesizing brand-bg from background-only config */
export interface BackgroundForBrandBgSynthesis {
  scaleName: string;
  backgroundStep?: { light: number; dark?: number; dim?: number };
}

export function synthesizeBrandBgIfMissing(
  appearances: Record<string, ScaleDefinition>,
  configuredRoles: string[],
  appearanceConfig:
    | { background?: BackgroundForBrandBgSynthesis | null }
    | null
    | undefined,
  availableScales: EngineAvailableScale[],
): void {
  if (appearances['brand-bg'] || !appearanceConfig?.background?.scaleName) return;
  const bg = appearanceConfig.background;
  const scale = availableScales.find(
    s => s.name.toLowerCase() === bg.scaleName.toLowerCase(),
  );
  if (!scale?.colors) return;
  const palette = buildPaletteFromScale(scale);
  const anchor = effectiveBrandBgBaseStep(
    undefined,
    bg.backgroundStep?.light,
    scale.baseStep,
  );
  appearances['brand-bg'] = buildScaleDefinition(bg.scaleName, palette, anchor, {
    anchorBoldToBaseStep: true,
  });
  configuredRoles.push('brand-bg');
}
