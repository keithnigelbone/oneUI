/**
 * computeNewStacking.ts
 *
 * Bridge from Convex foundation data (AvailableScale + AppearanceConfig)
 * to the new surface algorithm (ThemeConfig → generateFullCSS).
 *
 * Mirrors the role of computeV4Stacking.ts but uses the next-gen algorithm.
 * Coexists with the V4 bridge during migration.
 */

import {
  buildThemeConfig,
  dedupeDeclarationsKeepLast,
  generateFullCSS,
  generateMultiRoleRootCSS,
  generateSurfaceContextCSS,
  generateSurfaceStepLookupCSS,
  generateSurfaceStepLookupCSSSplit,
  generateAppearanceRedirectCSS,
  generateContextBoundaryCSS,
  generateTransparentMaterialCSS,
  resolveMultiRoleTokenSets,
  filterBrandDeclarations,
  type AvailableScale,
  type ThemeConfig,
  type MultiRoleTokenSets,
} from '@oneui/shared/engine';

// ============================================================================
// Types
// ============================================================================

interface AppearanceConfig {
  accentCount: number;
  background: {
    scaleName: string;
    backgroundStep: {
      light: number;
      dark: number;
      dim?: number;
    };
  };
  accents: Array<{
    role: string;
    label: string;
    scaleName: string;
    baseStep: number;
  }>;
  logo?: {
    scaleName: string;
    baseStep: number;
  };
}

/** Theme-independent palette data, ready for per-theme computation. */
export interface NewPaletteData {
  /** The theme config with all appearance→scale mappings */
  themeConfig: ThemeConfig;
  /** Background steps from appearance config */
  backgroundSteps: { light: number; dark: number };
  /** List of configured roles */
  configuredRoles: string[];
  /**
   * Optional logo color declaration (e.g. `--Logo-color: #112233;`).
   * Empty when the brand has no explicit logo override — `Logo` component
   * falls back to `--Primary-Bold` via its CSS.
   */
  logoCSS: string;
}

/**
 * Fixed root parent steps — the luminance anchors for surface resolution.
 * Light = step 2500 (white), Dark = step 200. Must match the
 * hardcoded returns in resolveSurface('default').
 */
const ROOT_PARENT_STEPS = { light: 2500, dark: 200 };

// ============================================================================
// Palette Data Building (theme-independent)
// ============================================================================

/**
 * Build NewPaletteData from AvailableScales and AppearanceConfig.
 *
 * Wraps the shared `buildThemeConfig` with web-specific extras
 * (backgroundSteps, configuredRoles list, brand-logo CSS declaration).
 *
 * Returns null if insufficient data.
 */
export function buildNewPaletteData(
  availableScales: AvailableScale[],
  appearanceConfig: AppearanceConfig | null | undefined,
): NewPaletteData | null {
  const themeConfig = buildThemeConfig(
    availableScales,
    appearanceConfig ?? null,
  );
  if (!themeConfig) return null;

  return {
    themeConfig,
    backgroundSteps: ROOT_PARENT_STEPS,
    configuredRoles: Object.keys(themeConfig.appearances),
    logoCSS: generateLogoCSS(availableScales, appearanceConfig),
  };
}

// ============================================================================
// CSS Generation (theme-dependent)
// ============================================================================

/**
 * Generate root surface CSS for a single theme using the new algorithm.
 * Returns filtered CSS declarations string (without selector wrapper).
 */
export function generateNewRootCSS(
  data: NewPaletteData,
  theme: 'light' | 'dark',
): string {
  const darkMode = theme === 'dark';
  const outerParentStep = darkMode
    ? data.backgroundSteps.dark
    : data.backgroundSteps.light;

  const multiRole = resolveMultiRoleTokenSets(
    data.themeConfig, outerParentStep, darkMode,
  );
  const rawCSS = generateMultiRoleRootCSS(multiRole, theme);
  if (!rawCSS) return '';

  // Apply token boundary filtering, then collapse intentional default→override
  // duplicate declarations (e.g. --Surface-Elevated default then neutral pin)
  // to their last-wins value so the root block is canonical.
  const declarations = rawCSS.split('\n').map(d => d.trim()).filter(Boolean);
  const filtered = dedupeDeclarationsKeepLast(filterBrandDeclarations(declarations));
  return filtered.join('\n  ');
}

/**
 * Generate surface context CSS for a single theme using the new algorithm.
 * Returns filtered `[data-surface]` CSS blocks.
 */
export function generateNewContextCSS(
  data: NewPaletteData,
  theme: 'light' | 'dark',
): string {
  const darkMode = theme === 'dark';
  const outerParentStep = darkMode
    ? data.backgroundSteps.dark
    : data.backgroundSteps.light;

  // Use generateSurfaceContextCSS directly with the brand's actual background step
  // (not the hardcoded 2500/200 in generateFullCSS)
  const contextCSS = generateSurfaceContextCSS(data.themeConfig, outerParentStep, darkMode);
  if (!contextCSS) return '';

  // Apply token boundary filtering to declarations inside context blocks
  const lines = contextCSS.split('\n');
  const declarations: string[] = [];
  const lineIndices: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) {
      declarations.push(trimmed);
      lineIndices.push(i);
    }
  }

  const allowed = new Set(filterBrandDeclarations(declarations));

  const filteredLines: string[] = [];
  let declIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (declIdx < lineIndices.length && i === lineIndices[declIdx]) {
      if (allowed.has(declarations[declIdx])) {
        filteredLines.push(lines[i]);
      }
      declIdx++;
    } else {
      filteredLines.push(lines[i]);
    }
  }

  return filteredLines.join('\n');
}

/**
 * Generate the step-keyed surface lookup table (RFC-0003).
 *
 * Emits one `[data-surface-step="<N>"] { ... }` block per scale step,
 * containing every role's tokens resolved as if its parent were at step N.
 * Surface JSX writes its own resolved step as `data-surface-step` and every
 * descendant reads role tokens via cascade — depth-N safe.
 *
 * Wired into useBrandCSS *after* the legacy [data-surface="<mode>"] context
 * blocks so step-keyed declarations win at equal specificity. At depth 1
 * both blocks agree on values; at depth ≥ 2 only this lookup is correct.
 */
export function generateNewStepLookupCSS(
  data: NewPaletteData,
): string {
  // Theme-agnostic: emits both light + dark in one string. The output
  // contains [data-mode="light"] / [data-mode="dark"] overlay blocks
  // for the per-role *-Default tokens — every other token resolves
  // identically across themes at the same step number.
  const rawCSS = generateSurfaceStepLookupCSS(data.themeConfig);
  return applyBrandDeclFilter(rawCSS);
}

/**
 * Split variant of `generateNewStepLookupCSS`. The static slice is brand-
 * invariant (Neutral/Positive/Negative/Warning/Informative/Border) and should
 * be injected once per session into a shared <style> element; the dynamic
 * slice is the per-brand portion that gets re-injected on every brand
 * switch. See `surface_lookup_css_optimization_architecture.md`.
 */
export function generateNewStepLookupCSSSplit(
  data: NewPaletteData,
): { staticCSS: string; dynamicCSS: string } {
  const { staticCSS, dynamicCSS } = generateSurfaceStepLookupCSSSplit(
    data.themeConfig,
  );
  return {
    staticCSS: applyBrandDeclFilter(staticCSS),
    dynamicCSS: applyBrandDeclFilter(dynamicCSS),
  };
}

function applyBrandDeclFilter(rawCSS: string): string {
  if (!rawCSS) return '';
  // Same line-by-line token-boundary filter as generateNewContextCSS.
  const lines = rawCSS.split('\n');
  const declarations: string[] = [];
  const lineIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) {
      declarations.push(trimmed);
      lineIndices.push(i);
    }
  }
  const allowed = new Set(filterBrandDeclarations(declarations));
  const filteredLines: string[] = [];
  let declIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (declIdx < lineIndices.length && i === lineIndices[declIdx]) {
      if (allowed.has(declarations[declIdx])) filteredLines.push(lines[i]);
      declIdx++;
    } else {
      filteredLines.push(lines[i]);
    }
  }
  return filteredLines.join('\n');
}

/**
 * Generate the `[data-appearance="<role>"]` redirect blocks (RFC-0003 Item D).
 *
 * Theme-independent — only references `--{Role}-*` tokens, which are themed
 * at `:root` / step blocks. Wired into useBrandCSS once per brand-load.
 */
export function generateNewAppearanceRedirectCSS(data: NewPaletteData): string {
  const rawCSS = generateAppearanceRedirectCSS(data.themeConfig);
  if (!rawCSS) return '';
  // Token-boundary filter (matches the pattern other generators use).
  const lines = rawCSS.split('\n');
  const declarations: string[] = [];
  const lineIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) {
      declarations.push(trimmed);
      lineIndices.push(i);
    }
  }
  const allowed = new Set(filterBrandDeclarations(declarations));
  const filteredLines: string[] = [];
  let declIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (declIdx < lineIndices.length && i === lineIndices[declIdx]) {
      if (allowed.has(declarations[declIdx])) filteredLines.push(lines[i]);
      declIdx++;
    } else {
      filteredLines.push(lines[i]);
    }
  }
  return filteredLines.join('\n');
}

/**
 * Generate the `[data-context-boundary]` reset block for the current brand.
 *
 * Inverse of the `[data-surface]` cascade: an element marked with
 * `data-context-boundary` re-pins every role's surface-context tokens to
 * their root-only `Fill-*` equivalents. Components use this for slotted
 * children that must keep their own appearance role colour (e.g.
 * CounterBadge / IndicatorBadge inside a Badge slot) — the
 * component author wraps the immune child rather than enumerating role
 * tokens privately in component CSS.
 *
 * Theme-independent — the same block is correct for light and dark because
 * it only references `--{Role}-Fill-*` tokens, which are themed at `:root`.
 */
export function generateNewContextBoundaryCSS(data: NewPaletteData): string {
  const rawCSS = generateContextBoundaryCSS(data.themeConfig);
  if (!rawCSS) return '';

  // Filter declarations through the brand-CSS token boundary so disallowed
  // prefixes never leak into the injected style. Same pattern as
  // generateNewContextCSS / generateNewTransparentCSS above.
  const lines = rawCSS.split('\n');
  const declarations: string[] = [];
  const lineIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) {
      declarations.push(trimmed);
      lineIndices.push(i);
    }
  }
  const allowed = new Set(filterBrandDeclarations(declarations));
  const filteredLines: string[] = [];
  let declIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (declIdx < lineIndices.length && i === lineIndices[declIdx]) {
      if (allowed.has(declarations[declIdx])) {
        filteredLines.push(lines[i]);
      }
      declIdx++;
    } else {
      filteredLines.push(lines[i]);
    }
  }

  return filteredLines.join('\n');
}

/**
 * Generate transparent-material CSS blocks for the current brand/theme.
 *
 * Emits `[data-material="transparent"][data-media="<ctx>"]` selectors with
 * rgba() composited values. Requires the theme's neutral role for the base
 * colour; falls back gracefully if missing.
 */
export function generateNewTransparentCSS(
  data: NewPaletteData,
  theme: 'light' | 'dark',
): string {
  const darkMode = theme === 'dark';
  const rawCSS = generateTransparentMaterialCSS(data.themeConfig, darkMode);
  if (!rawCSS) return '';

  // Apply token boundary filtering to declarations inside each block.
  // --Surface-Transparent-* all match the --Surface- allowlist prefix, so this
  // is a defensive pass rather than a bottleneck.
  const lines = rawCSS.split('\n');
  const declarations: string[] = [];
  const lineIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('--')) {
      declarations.push(trimmed);
      lineIndices.push(i);
    }
  }
  const allowed = new Set(filterBrandDeclarations(declarations));
  const filteredLines: string[] = [];
  let declIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (declIdx < lineIndices.length && i === lineIndices[declIdx]) {
      if (allowed.has(declarations[declIdx])) filteredLines.push(lines[i]);
      declIdx++;
    } else {
      filteredLines.push(lines[i]);
    }
  }
  return filteredLines.join('\n');
}

/**
 * Generate `--Logo-color` declaration when the brand has an explicit logo
 * color configured in its appearance config. Returns an empty string when
 * unset — the `Logo` component's CSS falls back to `--Primary-Bold`.
 *
 * Theme-independent: the logo color is a single foreground value, not a
 * surface that remaps per theme.
 */
export function generateLogoCSS(
  availableScales: AvailableScale[],
  appearanceConfig: AppearanceConfig | null | undefined,
): string {
  const logo = appearanceConfig?.logo;
  if (!logo) return '';

  const scale = availableScales.find(
    s => s.name.toLowerCase() === logo.scaleName.toLowerCase()
  );
  const hex = scale?.colors?.find(c => c.step === logo.baseStep)?.hex;
  if (!hex) return '';

  return `--Logo-color: ${hex};`;
}

/**
 * Resolve multi-role token sets for editor previews (inline styles).
 * Returns the full resolved data structure (not CSS strings).
 */
export function resolveNewTokenSets(
  data: NewPaletteData,
  theme: 'light' | 'dark',
): MultiRoleTokenSets {
  const darkMode = theme === 'dark';
  const outerParentStep = darkMode
    ? data.backgroundSteps.dark
    : data.backgroundSteps.light;

  return resolveMultiRoleTokenSets(
    data.themeConfig, outerParentStep, darkMode,
  );
}
