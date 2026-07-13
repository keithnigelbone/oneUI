/**
 * Shared `ThemeConfig` builder.
 *
 * Same accent-loop + neutral-injection logic that `useBrandCSS` (web) and
 * `precomputeBrandCSSNew` (server) and `buildNativeTheme` (native) all need.
 * Lives in one place so a change to surface anchoring or neutral fallback
 * propagates to every emitter automatically.
 */

import { buildPaletteFromScale } from './paletteUtils';
import {
  buildScaleDefinition,
  type ScaleDefinition,
  type ThemeConfig,
} from './surfaceNew';
import {
  effectiveBrandBgBaseStep,
  isAppearanceRoleAnchoringBold,
  synthesizeBrandBgIfMissing,
} from './brandBgAppearance';
import type { EngineAvailableScale } from './types';
import { BUILT_IN_NEUTRAL_SCALE_NAME } from '../utils/colorScale';

const DEFAULT_NEUTRAL_BASE_STEP = 1300;

/**
 * Permissive shape that covers every caller's appearance config. Optional
 * fields only — callers may pass partial data while typing it more strictly
 * at their boundary.
 */
export interface ThemeConfigAppearanceInput {
  accentCount?: number;
  background?: {
    scaleName?: string;
    backgroundStep?: {
      light?: number;
      dark?: number;
      dim?: number;
    };
  };
  accents?: Array<{
    role: string;
    label?: string;
    scaleName: string;
    baseStep: number;
  }>;
  logo?: {
    scaleName: string;
    baseStep: number;
  };
}

/** Build a single accent's `ScaleDefinition`. Returns null if its scale is unavailable. */
function defineAccent(
  accent: NonNullable<ThemeConfigAppearanceInput['accents']>[number],
  appearanceConfig: ThemeConfigAppearanceInput,
  availableScales: EngineAvailableScale[],
): ScaleDefinition | null {
  const scale = availableScales.find(
    (s) => s.name.toLowerCase() === accent.scaleName.toLowerCase(),
  );
  if (!scale?.colors) return null;

  const palette = buildPaletteFromScale(scale);
  const effectiveBaseStep =
    accent.role === 'brand-bg'
      ? effectiveBrandBgBaseStep(
          accent.baseStep,
          appearanceConfig.background?.backgroundStep?.light,
          scale.baseStep,
        )
      : (accent.baseStep ?? scale.baseStep);

  return isAppearanceRoleAnchoringBold(accent.role)
    ? buildScaleDefinition(accent.scaleName, palette, effectiveBaseStep, {
        anchorBoldToBaseStep: true,
      })
    : buildScaleDefinition(accent.scaleName, palette, effectiveBaseStep);
}

/** Inject the built-in neutral scale into `appearances` if not already present. */
function ensureNeutralRole(
  appearances: Record<string, ScaleDefinition>,
  configuredRoles: string[],
  availableScales: EngineAvailableScale[],
): void {
  if (configuredRoles.includes('neutral')) return;
  const neutralScale = availableScales.find(
    (s) => s.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase(),
  );
  if (!neutralScale?.colors) return;

  const palette = buildPaletteFromScale(neutralScale);
  appearances['neutral'] = buildScaleDefinition(
    BUILT_IN_NEUTRAL_SCALE_NAME,
    palette,
    neutralScale.baseStep ?? DEFAULT_NEUTRAL_BASE_STEP,
  );
  configuredRoles.push('neutral');
}

export function buildThemeConfig(
  availableScales: EngineAvailableScale[],
  appearanceConfig: ThemeConfigAppearanceInput | null,
): ThemeConfig | null {
  if (!availableScales.length) return null;

  const appearances: Record<string, ScaleDefinition> = {};
  const configuredRoles: string[] = [];

  for (const accent of appearanceConfig?.accents ?? []) {
    const definition = defineAccent(accent, appearanceConfig!, availableScales);
    if (definition) {
      appearances[accent.role] = definition;
      configuredRoles.push(accent.role);
    }
  }

  synthesizeBrandBgIfMissing(
    appearances,
    configuredRoles,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appearanceConfig as any,
    availableScales,
  );

  ensureNeutralRole(appearances, configuredRoles, availableScales);

  if (Object.keys(appearances).length === 0) return null;
  return { appearances };
}
