/**
 * foundationResolver.ts
 *
 * The REAL foundation resolver (FND-04 / FND-03 / D-09).
 *
 * `resolveFoundation(input)` returns the frozen `FoundationResolveResult`
 * discriminated union from `@oneui/experience-builder-core`:
 *
 *   - **Covered profile** (the output-profile table marks it `coverage: 'real'`
 *     — i.e. the web profiles) → it resolves the brand's REAL Jio foundations
 *     via the node-safe `@oneui/shared/engine` precompute chain
 *     (`buildAvailableScales` → `buildThemeConfig`) and returns
 *     `{ ok: true, theme }` where `theme` is the engine's real `ThemeConfig`.
 *     This is the FND-04 swap: same frozen shape, real data — NOT a migration.
 *
 *   - **Partially-configured brand** (D-09): a brand that configures only some
 *     foundations still resolves. `buildThemeConfig`'s `ensureNeutralRole` /
 *     `synthesizeBrandBgIfMissing` ARE the engine's system defaults — exactly
 *     as the live platform renders partial brands today. "Used a default" is
 *     NOT a gap.
 *
 *   - **Uncovered profile** (the table marks it `coverage: 'assumed'`) OR a
 *     genuinely unresolvable profile (`buildThemeConfig` returns `null`, e.g.
 *     empty/missing scales) → `{ ok: false, gap }`. The gap carries
 *     `artifactType` + `outputProfile` + a human-readable `reason` and
 *     ABSOLUTELY NO dimension numbers (FND-03 / Pitfall 6): a missing-coverage
 *     outcome is a first-class typed gap, never a fabricated round number.
 *
 * Why the precompute chain (not a hand-rolled adapter): `precompute.ts` is the
 * server-side equivalent of `useBrandCSS` with no React / `FoundationStyleProvider`
 * dependency. It sources foundations from the same `getBrandOverviewData`-shaped
 * record (`colorConfig` + `presetSelection` + `appearanceConfig`) and chains
 * `buildAvailableScales(colorConfig, presetSelection)` →
 * `buildThemeConfig(availableScales, appearanceConfig)`. We reuse that exact
 * chain verbatim. We NEVER import `FoundationStyleProvider` (forbidden file).
 *
 * Determinism: no randomness, no model. Same brand foundations → same theme.
 */

import {
  foundationResolved,
  foundationGap,
  getValidProfilesForType,
  getPlatformTargetForProfile,
  type FoundationResolveInputT,
  type FoundationResolveResult,
  type ResolvedDimensionsT,
} from '@oneui/experience-builder-core';
import {
  buildAvailableScales,
  buildThemeConfig,
  type ThemeConfigAppearanceInput,
} from '@oneui/shared/engine';
import {
  resolveBreakpointBaseSize,
  DIMENSION_TOKEN_MULTIPLIERS,
  type PlatformsFoundationConfig,
} from '@oneui/shared';

/**
 * The brand's Convex foundations, in the EXACT `PrecomputeInput` field-name
 * shape (`precompute.ts`): `colorConfig` + `presetSelection` feed
 * `buildAvailableScales`; `appearanceConfig` feeds `buildThemeConfig`. All
 * optional/nullable so partially-configured brands resolve via system defaults
 * (D-09) rather than being rejected at the boundary.
 */
export interface BrandFoundations {
  colorConfig?: Record<string, unknown> | null;
  presetSelection?: Record<string, unknown> | null;
  appearanceConfig?: ThemeConfigAppearanceInput | null;
}

/**
 * Lab-owned resolver input: the frozen `FoundationResolveInputT` (request
 * identity) PLUS the brand's real foundations. The frozen RESULT contract is
 * unchanged — only the input is extended (a superset), so existing callers and
 * the `FoundationResolveResultSchema` stay valid.
 */
export interface ResolveFoundationInput extends FoundationResolveInputT {
  /** The brand's real Convex foundations (PrecomputeInput-shaped). */
  brandFoundations?: BrandFoundations;
  /**
   * The brand's Platforms foundation. Required to resolve non-web profiles
   * (FND-02 / CAMP-05): the resolver matches the profile's mapped
   * platform/breakpoint against this config. Absent → non-web profiles gap.
   */
  brandPlatforms?: PlatformsFoundationConfig | null;
}

/**
 * Does the output-profile table mark this artifact-type + profile as a NON-WEB
 * (`coverage: 'assumed'`) profile? These route through the foundation-backed
 * non-web branch instead of the web `ThemeConfig`-only path.
 */
function isNonWebProfile(input: FoundationResolveInputT): boolean {
  const descriptor = getValidProfilesForType(input.artifactType).find(
    (p) => p.id === input.outputProfile,
  );
  return descriptor?.coverage === 'assumed';
}

/**
 * The Jio `Spacing-N` token used as the default canvas safe-area inset (D-03).
 * `Spacing-4` is the f0 anchor (multiplier 1.0) and is guaranteed present in
 * `DIMENSION_TOKEN_MULTIPLIERS`. We assert membership rather than hardcode a px
 * margin — a token, never a magic number.
 */
const DEFAULT_SAFE_AREA_SPACING_TOKEN = '4' as const;

/**
 * Resolve foundation-backed dimensions for a non-web profile, or a typed gap.
 *
 * Honesty rule (D-02 / FND-03): no map entry, or a mapped breakpoint absent
 * from the brand's Platforms foundation, returns the typed gap with NO numbers.
 * On a hit, width/height/units come straight from the foundation breakpoint;
 * `mm` units are NOT pre-converted (the export path converts with `mmToPx`);
 * the safe-area inset is a `Spacing-N` token name, never a raw px value.
 */
function resolveNonWebDimensions(
  input: ResolveFoundationInput,
): { ok: true; dims: ResolvedDimensionsT } | { ok: false; reason: string } {
  const target = getPlatformTargetForProfile(input.outputProfile);
  if (!target) {
    return {
      ok: false,
      reason:
        `No platform mapping for non-web output profile "${input.outputProfile}". ` +
        `The Lab profile→platform map (D-02) has no entry, so generation ` +
        `short-circuits to a gap rather than fabricating a canvas.`,
    };
  }

  const config = input.brandPlatforms;
  const platform = config?.platforms.find((p) => p.id === target.platformId);
  const breakpoint = platform?.breakpoints.find((bp) => bp.id === target.breakpointId);

  if (!platform || !breakpoint) {
    return {
      ok: false,
      reason:
        `The brand "${input.brandId}" has no canvas "${target.breakpointId}" on ` +
        `platform "${target.platformId}" in its Platforms foundation, so output ` +
        `profile "${input.outputProfile}" cannot be resolved. Add the canvas to ` +
        `the brand's Platforms foundation rather than hardcoding dimensions (D-02).`,
    };
  }

  // Foundation-backed geometry. mm canvases keep mm (export path converts).
  const units: 'px' | 'mm' = breakpoint.units ?? 'px';
  const width = breakpoint.viewportWidth;
  const height = breakpoint.viewportHeight ?? breakpoint.viewportWidth;
  // Two DISTINCT foundation values (never conflate them — a print canvas is
  // 300 ppi at 1× density): `ppi` (pixels-per-inch) drives `mmToPx` for mm
  // canvases; `pixelDensity` (device pixel ratio) drives the raster
  // deviceScaleFactor. A breakpoint din1450Override wins over the platform.
  const ppi = breakpoint.din1450Override?.ppi ?? platform.ppi;
  const pixelDensity =
    breakpoint.din1450Override?.pixelDensity ?? platform.pixelDensity;

  // Touch the DIN-1450 type-scale base via the existing helper (do NOT
  // hand-roll DIN-1450). The base feeds the relational f-scale downstream;
  // computing it here also validates the breakpoint resolves cleanly.
  resolveBreakpointBaseSize(platform, breakpoint);

  // Safe-area inset = a Jio Spacing-N token (D-03), asserted to exist in the
  // dimension multiplier table — never a raw px margin.
  const safeAreaInsetToken =
    DEFAULT_SAFE_AREA_SPACING_TOKEN in DIMENSION_TOKEN_MULTIPLIERS
      ? `Spacing-${DEFAULT_SAFE_AREA_SPACING_TOKEN}`
      : undefined;

  return {
    ok: true,
    dims: { width, height, units, ppi, pixelDensity, safeAreaInsetToken },
  };
}

/**
 * Is this artifact-type + output-profile pair backed by REAL foundation
 * coverage? Determined structurally from the plan-01 output-profile table: a
 * profile is covered iff its descriptor for that artifact type exists AND is
 * marked `coverage: 'real'`. Non-web (`coverage: 'assumed'`) profiles are NOT
 * covered → they short-circuit to a typed gap.
 */
function isCoveredProfile(input: FoundationResolveInputT): boolean {
  const descriptor = getValidProfilesForType(input.artifactType).find(
    (p) => p.id === input.outputProfile,
  );
  return descriptor?.coverage === 'real';
}

/**
 * Resolve foundations for a generation request. Returns the brand's real
 * `ThemeConfig` for covered (web) profiles that resolve, or a first-class typed
 * gap (NO dimension numbers) for uncovered/unresolvable profiles. Pure +
 * deterministic.
 */
export function resolveFoundation(
  input: ResolveFoundationInput,
): FoundationResolveResult {
  // Non-web (coverage: 'assumed') branch (FND-02 / CAMP-05). Runs BEFORE the
  // web-coverage gate: non-web profiles are never `coverage: 'real'`, so the
  // old gate would always gap them. Here they resolve against the brand's
  // Platforms foundation — real dims on a hit, typed gap on a miss.
  if (isNonWebProfile(input)) {
    const nonWeb = resolveNonWebDimensions(input);
    if (!nonWeb.ok) {
      // D-02 / FND-03: typed gap, NO dimension numbers.
      return foundationGap({
        artifactType: input.artifactType,
        outputProfile: input.outputProfile,
        reason: nonWeb.reason,
      });
    }

    // Hit: resolve the brand's real ThemeConfig (same precompute chain as web),
    // then attach the foundation-backed dimensions. A brand that resolves no
    // usable scales is still an honest gap (no theme → no artifact).
    const foundations = input.brandFoundations ?? {};
    const availableScales = buildAvailableScales(
      foundations.colorConfig ?? null,
      foundations.presetSelection ?? null,
    );
    const theme = buildThemeConfig(availableScales, foundations.appearanceConfig ?? null);
    if (!theme) {
      return foundationGap({
        artifactType: input.artifactType,
        outputProfile: input.outputProfile,
        reason:
          `The brand "${input.brandId}" does not resolve to any usable Jio ` +
          `foundation scales for output profile "${input.outputProfile}". ` +
          `Generation short-circuits to a gap report rather than fabricating ` +
          `foundations.`,
      });
    }
    return foundationResolved(theme, nonWeb.dims);
  }

  if (!isCoveredProfile(input)) {
    // Pitfall 6 / FND-03: typed gap, NEVER a fabricated dimension. The gap
    // payload (FoundationGap) has no width/height/aspect field by construction.
    return foundationGap({
      artifactType: input.artifactType,
      outputProfile: input.outputProfile,
      reason:
        `No verified Jio foundation coverage for output profile ` +
        `"${input.outputProfile}" (artifact type "${input.artifactType}"). ` +
        `This profile's foundation coverage is unverified — generation ` +
        `short-circuits to a gap report rather than fabricating dimensions.`,
    });
  }

  // Covered (web) profile → resolve the brand's REAL foundations (FND-04).
  // Reuse the node-safe precompute chain verbatim (Open Q1 / A2 resolution):
  //   buildAvailableScales(colorConfig, presetSelection)
  //     → buildThemeConfig(availableScales, appearanceConfig)
  const foundations = input.brandFoundations ?? {};
  const availableScales = buildAvailableScales(
    foundations.colorConfig ?? null,
    foundations.presetSelection ?? null,
  );
  const theme = buildThemeConfig(availableScales, foundations.appearanceConfig ?? null);

  if (!theme) {
    // Genuinely unresolvable profile (empty/missing scales → null). NOT a
    // "used a default" case (D-09): those resolve via ensureNeutralRole /
    // synthesizeBrandBgIfMissing. FND-03: no dimension numbers in the gap.
    return foundationGap({
      artifactType: input.artifactType,
      outputProfile: input.outputProfile,
      reason:
        `The brand "${input.brandId}" does not resolve to any usable Jio ` +
        `foundation scales for output profile "${input.outputProfile}". ` +
        `Generation short-circuits to a gap report rather than fabricating ` +
        `foundations.`,
    });
  }

  // D-09: a partially-configured brand resolves here — the engine's system
  // defaults (ensureNeutralRole / synthesizeBrandBgIfMissing) already filled
  // anything unconfigured, exactly as the live platform renders it.
  return foundationResolved(theme);
}
