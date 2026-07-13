/**
 * elevationCSS.ts
 *
 * Pure CSS generator for elevation tokens — part of the brand CSS injection pipeline.
 *
 * generateElevationCSS() takes a brand's elevation foundation config
 * (baseOpacity + darkModeMultiplier) and returns `--Elevation-0..5`
 * declarations ready to be included in the brand <style> injection block.
 * The two-shadow formula itself lives in `utils/elevation.ts`; this module
 * only applies the brand's configured opacity on top.
 *
 * Returns '' when config is null/undefined — the static primitives.css
 * fallbacks remain active and no brand override is injected (same contract
 * as motionCSS.ts).
 *
 * Framework-agnostic — no React, no Convex dependencies.
 */

import {
  ELEVATION_LEVELS,
  generateElevationLevel,
  type ElevationConfig,
  type ElevationLevel,
} from '../utils/elevation';

/** Shape of the `elevation` foundation config persisted by the editor page. */
export interface ElevationFoundationConfig {
  levels?: ElevationConfig[];
  baseOpacity: number;
  darkModeMultiplier: number;
}

/**
 * Resolve a single elevation level to its box-shadow value with the brand's
 * configured base opacity applied. Shared between the foundation editor
 * preview and the injected brand CSS so the two can never drift.
 *
 * The dark-mode inset stroke width references `var(--Stroke-M)` so it stays
 * responsive to the dimension cascade.
 */
export function elevationLevelToBoxShadow(
  level: ElevationConfig,
  options: {
    isDarkMode: boolean;
    baseOpacity: number;
    darkModeMultiplier: number;
  },
): string {
  if (level.level === 0) return 'none';

  const { isDarkMode, baseOpacity, darkModeMultiplier } = options;
  const opacityMultiplier = isDarkMode ? darkModeMultiplier : 1;
  const keyOpacity = baseOpacity * opacityMultiplier;
  const ambientOpacity = baseOpacity * opacityMultiplier;
  const darkStroke =
    isDarkMode && level.darkModeStroke
      ? `inset 0 0 0 var(--Stroke-M) ${level.darkModeStroke.color}, `
      : '';

  return (
    `${darkStroke}0 ${level.keyLight.yOffset.toFixed(1)}px ${level.keyLight.blur.toFixed(1)}px rgba(0, 0, 0, ${keyOpacity.toFixed(3)}), ` +
    `0 ${level.ambientLight.yOffset.toFixed(1)}px ${level.ambientLight.blur.toFixed(1)}px rgba(0, 0, 0, ${ambientOpacity.toFixed(3)})`
  );
}

/**
 * Generate CSS custom property declarations for the 6 elevation tokens
 * (`--Elevation-0` … `--Elevation-5`) from a brand's elevation foundation
 * config.
 *
 * Levels are derived from the canonical two-shadow formula for the active
 * theme (geometry is theme-independent; opacity and the inset edge stroke
 * are theme-dependent) — mirroring exactly what the elevation foundation
 * page previews.
 */
export function generateElevationCSS(
  config: ElevationFoundationConfig | null | undefined,
  theme: 'light' | 'dark',
): string {
  if (!config) return '';

  const isDarkMode = theme === 'dark';
  const surfaceBrightness = isDarkMode ? 'high' : 'low';
  const lines: string[] = ['/* Elevation — brand-configured two-shadow levels */'];

  for (const level of ELEVATION_LEVELS) {
    const levelConfig = generateElevationLevel(level as ElevationLevel, surfaceBrightness);
    const shadow = elevationLevelToBoxShadow(levelConfig, {
      isDarkMode,
      baseOpacity: config.baseOpacity,
      darkModeMultiplier: config.darkModeMultiplier,
    });
    lines.push(`--Elevation-${level}: ${shadow};`);
  }

  return lines.join('\n  ');
}
