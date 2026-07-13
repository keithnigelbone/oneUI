/**
 * Artboard surface helpers — align canvas frame surfaces with brand foundations
 * (appearance accents from getBrandOverviewData) and the unified surface-token
 * surface vocabulary.
 *
 * Brand-BG artboard fills use --Brand-Bg-* tokens. Child surface context uses the
 * same data-surface values as other roles so [data-surface] remapping matches
 * foundations tooling.
 */

import { applySubBrandAccentsToFoundation } from '@oneui/shared';
import { buildAvailableScales, type SurfaceToken } from '@oneui/shared/engine';
import { buildNewPaletteData, resolveNewTokenSets } from '@oneui/ui-internal/engine/computeNewStacking';
import type { FrameArtboardSurface } from './artboardFrameSurfaceStore';
import type { ArtboardSubBrandOption } from './FrameThemeContext';

/** Artboard surface modes for the Brand-Bg role (no `moderate`). */
export const BRAND_BG_SURFACE_MODES = ['default', 'minimal', 'subtle', 'bold', 'elevated', 'blend'] as const;

/** Artboard surface modes for non-brand-bg roles (full set, excluding `ghost`). */
export const ROLE_SURFACE_MODES = ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'] as const;

export type AppearanceConfigLike = {
  accents?: ReadonlyArray<{ role: string; label?: string; scaleName?: string; baseStep?: number }>;
} | null;

const ACCENT_ORDER = [
  'brand-bg',
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

export function accentRolesFromConfig(ac: AppearanceConfigLike): Set<string> {
  const roles = new Set<string>();
  if (ac?.accents) {
    for (const a of ac.accents) {
      if (a.role) roles.add(a.role);
    }
  }
  return roles;
}

/**
 * Ordered appearance values for the frame Surface dropdown (artboard).
 * When appearanceConfig is missing/empty, show the full authoring set (legacy behaviour).
 * When present, restrict to accents configured for the brand in foundations.
 *
 * **Brand BG** is always included so authors can pick the Brand-Bg surface accent on the
 * artboard even if the parent brand’s appearance config omits that role (sub-brand scoped
 * tokens still resolve when a frame sub-brand is selected).
 */
export function frameAppearanceOptionsFromFoundations(ac: AppearanceConfigLike): string[] {
  const roles = accentRolesFromConfig(ac);
  let list: string[];
  if (roles.size === 0) {
    list = [...ACCENT_ORDER];
  } else {
    list = ACCENT_ORDER.filter((r) => roles.has(r));
  }
  if (!list.includes('brand-bg')) {
    list = ['brand-bg', ...list];
  }
  return list;
}

export function frameModesForAppearance(appearance: string): readonly string[] {
  return appearance === 'brand-bg' ? BRAND_BG_SURFACE_MODES : ROLE_SURFACE_MODES;
}

function fgFillTokens(role: string): Record<string, string> {
  const R = role.charAt(0).toUpperCase() + role.slice(1);
  return {
    default:
      role === 'primary'
        ? 'var(--Surface-Fill-Default)'
        : `var(--${R}-Default)`,
    minimal: `var(--${R}-Fill-Minimal)`,
    subtle: `var(--${R}-Fill-Subtle)`,
    moderate: `var(--${R}-Fill-Moderate)`,
    bold: `var(--${R}-Fill-Bold)`,
    elevated: `var(--${R}-Fill-Elevated)`,
    blend: `var(--${R}-Fill-Blend)`,
  };
}

const BRAND_BG_FILL: Record<string, string> = {
  default: 'var(--Brand-Bg-Default)',
  'minimal': 'var(--Brand-Bg-Minimal)',
  'subtle': 'var(--Brand-Bg-Subtle)',
  'bold': 'var(--Brand-Bg-Bold)',
  elevated: 'var(--Brand-Bg-Elevated)',
  blend: 'var(--Brand-Bg-Blend)',
};

/**
 * Resolved CSS background for the artboard surface container (Fill / BG tokens at :root — not remapped by [data-surface]).
 */
export function resolveArtboardBackgroundCss(appearance: string, rawMode: string): string {
  if (appearance === 'brand-bg') {
    return BRAND_BG_FILL[rawMode] ?? BRAND_BG_FILL.default;
  }
  const fg = fgFillTokens(appearance);
  return fg[rawMode] ?? fg.default;
}

/**
 * Swatch colour for sidebar (same resolver).
 */
export function frameSurfaceSwatchCss(appearance: string, mode: string): string {
  return resolveArtboardBackgroundCss(appearance, mode);
}

function brandBgRawModeToSurfaceToken(rawMode: string): SurfaceToken {
  switch (rawMode) {
    case 'minimal':
      return 'minimal';
    case 'subtle':
      return 'subtle';
    case 'bold':
      return 'bold';
    case 'elevated':
      return 'elevated';
    case 'blend':
      return 'blend';
    default:
      return 'default';
  }
}

/**
 * Resolved hex for Brand-BG artboard fills when a sub-brand is selected — same pipeline as
 * `ArtboardSubBrandStyleTags` / `useBrandCSSNew` (merged accents + new stacking).
 *
 * Use this for inline canvas fills: tldraw’s HTML layer often does not inherit scoped
 * `[data-oneui-subbrand]` token overrides the way the sidebar swatch row does, so
 * `var(--Brand-Bg-Bold)` can incorrectly resolve from `:root` on the artboard.
 */
/**
 * Text colours for ContentBlock on Brand-BG artboard surfaces (same tokens as engine / components on bold fills).
 * `normalizedMode` matches `normalizeSurfaceModeForCanvas` (default | minimal | subtle | moderate | bold | elevated).
 * Explicit `textColor` on ContentBlock still wins over these.
 */
export function contentBlockBrandBgTextTokens(normalizedMode: string): {
  headline: string;
  context: string;
  body: string;
} {
  switch (normalizedMode) {
    case 'bold':
      return {
        headline: 'var(--Brand-Bg-Bold-High)',
        context: 'var(--Brand-Bg-Bold-High)',
        body: 'var(--Brand-Bg-Bold-Medium)',
      };
    case 'subtle':
      return {
        headline: 'var(--Brand-Bg-Subtle-High)',
        context: 'var(--Brand-Bg-Subtle-High)',
        body: 'var(--Brand-Bg-Medium-Text)',
      };
    case 'minimal':
    case 'moderate':
    case 'elevated':
      return {
        headline: 'var(--Brand-Bg-High)',
        context: 'var(--Brand-Bg-High)',
        body: 'var(--Brand-Bg-Medium-Text)',
      };
    default:
      return {
        headline: 'var(--Brand-Bg-High)',
        context: 'var(--Brand-Bg-High)',
        body: 'var(--Brand-Bg-Medium-Text)',
      };
  }
}

export function resolveArtboardBrandBgFillHex(
  baseFoundation: Record<string, unknown> | null | undefined,
  subBrand: ArtboardSubBrandOption | undefined,
  theme: 'light' | 'dark',
  rawMode: string,
): string | null {
  if (!baseFoundation || !subBrand) return null;
  const merged = applySubBrandAccentsToFoundation(baseFoundation, {
    primary: subBrand.primary,
    secondary: subBrand.secondary,
    sparkle: subBrand.sparkle,
    brandBg: subBrand.brandBg,
  });
  if (!merged) return null;

  const colorConfig = (merged as { color?: { config?: unknown } }).color?.config;
  const presetSelection = (merged as { presetSelection?: unknown }).presetSelection;
  const appearanceConfig = (merged as { appearanceConfig?: unknown }).appearanceConfig;

  const availableScales = buildAvailableScales(
    colorConfig as Parameters<typeof buildAvailableScales>[0],
    presetSelection as Parameters<typeof buildAvailableScales>[1],
  );
  const paletteData = buildNewPaletteData(availableScales, appearanceConfig as Parameters<typeof buildNewPaletteData>[1]);
  if (!paletteData) return null;

  const tokenSets = resolveNewTokenSets(paletteData, theme);
  const brandBg = tokenSets.roles['brand-bg'];
  if (!brandBg) return null;

  const surfaceToken = brandBgRawModeToSurfaceToken(rawMode);
  return brandBg.surfaces[surfaceToken]?.hex ?? null;
}

export type ArtboardFrameFillContext = {
  frameSubBrandByFrameId: Record<string, string | null>;
  baseFoundationData: Record<string, unknown> | null;
  theme: 'light' | 'dark';
  availableSubBrands: readonly ArtboardSubBrandOption[];
};

/**
 * Resolved fill for the tldraw frame (artboard) — same rules as the former full-bleed ContainerShape.
 */
export function resolveArtboardFrameFillCss(
  frameId: string,
  surface: FrameArtboardSurface,
  ctx: ArtboardFrameFillContext | null,
): string {
  const { appearance, rawMode } = surface;
  const subBrandId = ctx?.frameSubBrandByFrameId[frameId] ?? null;
  const subBrandConfig =
    subBrandId && ctx?.availableSubBrands?.length
      ? ctx.availableSubBrands.find((s) => s.id === subBrandId)
      : undefined;
  if (appearance === 'brand-bg' && subBrandConfig && ctx?.baseFoundationData) {
    const hex = resolveArtboardBrandBgFillHex(
      ctx.baseFoundationData,
      subBrandConfig,
      ctx.theme,
      rawMode,
    );
    if (hex) return hex;
  }
  return resolveArtboardBackgroundCss(appearance, rawMode);
}
