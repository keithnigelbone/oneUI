/**
 * cssGenNew.ts
 *
 * CSS generation for the next-gen surface system.
 * Transforms ResolvedTokenSet → CSS custom property declarations.
 *
 * Outputs:
 * 1. :root { --{Role}-Bold: hex; ... } — per-role tokens (20 per role)
 * 2. [data-surface="bold"] { ... } — context remapping blocks
 * 3. Backward-compat aliases (--Surface-*, --Text-*, --Border-*)
 *
 * Pure functions, framework-agnostic. Usable from browser, Convex, or CLI.
 */

import type {
  ResolvedTokenSet,
  ResolvedContent,
  MultiRoleTokenSets,
  ThemeConfig,
  ScaleDefinition,
  SurfaceToken,
  ContentToken,
  MediaContext,
  MaterialVariant,
} from './surfaceNew';
import {
  CONTEXT_SURFACE_TOKENS,
  MEDIA_CONTEXTS,
  STEPS,
  resolveMultiRoleTokenSets,
  resolveTokenSet,
  resolveSurface,
  resolveFocusRing,
  computeContrastDir,
  resolveMediaSurface,
  resolveMediaContent,
  resolveMediaInteraction,
  resolveMediaFocusRing,
  opacityFromStep,
  getTransparentBaseHex,
} from './surfaceNew';
import type { ColorPalette } from './colorMath';
import { hexToRgbTuple, normalizeSolidCssHex, preParseRGBPalette } from './colorMath';

/** Palette / ResolvedSurface.hex → canonical `#rrggbb` for CSS (avoids `#AARRGGBB` vs `#RRGGBBAA` ambiguity in browsers). */
function solidSurfaceHex(hex: string): string {
  return normalizeSolidCssHex(hex);
}

// ============================================================================
// Token Naming
// ============================================================================

/**
 * Capitalize a role name for CSS token prefixes.
 * 'primary' → 'Primary', 'brand-bg' → 'Brand-Bg'
 */
export function roleLabel(role: string): string {
  return role
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');
}

/**
 * CSS token name for a surface fill.
 * e.g., roleLabel='Primary', surfaceToken='bold' → '--Primary-Bold'
 */
function surfaceTokenName(label: string, token: string): string {
  const suffix = token.charAt(0).toUpperCase() + token.slice(1);
  return `--${label}-${suffix}`;
}

/**
 * CSS token name for a content value.
 * Maps camelCase to PascalCase-Hyphenated:
 *   'tintedA11y' → 'TintedA11y'
 *   'strokeMedium' → 'Stroke-Medium'
 *   'strokeLow' → 'Stroke-Low'
 */
function contentTokenName(label: string, token: string): string {
  const map: Record<string, string> = {
    high: 'High',
    medium: 'Medium-Text',
    low: 'Low',
    tinted: 'Tinted',
    tintedA11y: 'TintedA11y',
    strokeMedium: 'Stroke-Medium',
    strokeLow: 'Stroke-Low',
  };
  return `--${label}-${map[token] ?? token}`;
}

/**
 * CSS token name for a state value.
 * Maps camelCase to PascalCase-Hyphenated:
 *   'boldHover' → 'Bold-Hover'
 *   'subtlePressed' → 'Subtle-Pressed'
 */
function stateTokenName(label: string, token: string): string {
  const map: Record<string, string> = {
    hover: 'Hover',
    pressed: 'Pressed',
    boldHover: 'Bold-Hover',
    boldPressed: 'Bold-Pressed',
    subtleHover: 'Subtle-Hover',
    subtlePressed: 'Subtle-Pressed',
  };
  return `--${label}-${map[token] ?? token}`;
}

// ============================================================================
// Content Value Formatting
// ============================================================================

/**
 * Format a resolved content token as a CSS value.
 * Solid tokens (opacity=1) → hex. Alpha tokens → rgba.
 */
function formatContentValue(content: ResolvedContent): string {
  if (content.opacity >= 1) {
    return normalizeSolidCssHex(content.hex);
  }
  // Use blendedHex for the pre-composited value (what the user sees)
  return content.blendedHex;
}

// ============================================================================
// Per-Role CSS Generation
// ============================================================================

/**
 * Generate CSS declarations for a single appearance role.
 *
 * Outputs 20 declarations:
 * - 8 surface fills (Default, Ghost, Minimal, Subtle, Moderate, Bold, Elevated, Blend)
 * - 7 content values (High, Medium, Low, Tinted, TintedA11y, Stroke-Medium, Stroke-Low)
 * - 6 state values (Hover, Pressed, Bold-Hover, Bold-Pressed, Subtle-Hover, Subtle-Pressed)
 */
export function generateRoleCSS(label: string, tokenSet: ResolvedTokenSet): string[] {
  const d: string[] = [];

  // New token names (20 declarations)
  // Surface fills
  for (const [token, resolved] of Object.entries(tokenSet.surfaces)) {
    d.push(`${surfaceTokenName(label, token)}: ${solidSurfaceHex(resolved.hex)};`);
  }

  // Content values (resolved at parent step — for text on page surface)
  for (const [token, resolved] of Object.entries(tokenSet.content)) {
    d.push(`${contentTokenName(label, token)}: ${formatContentValue(resolved)};`);
  }

  // On-bold content (resolved at bold step — for text/icons on bold fills).
  // Tinted / TintedA11y are the branded on-colours (scale walked from base
  // against the bold fill until 3.0 / 4.5 contrast). They're what the Avatar,
  // Chip, Badge etc. should read for HIGH attention, NOT Bold-High — Bold-High
  // is the achromatic fallback (pure-white/black on saturated brand scales).
  d.push(`--${label}-Bold-High: ${formatContentValue(tokenSet.onBoldContent.high)};`);
  d.push(`--${label}-Bold-Medium: ${formatContentValue(tokenSet.onBoldContent.medium)};`);
  d.push(`--${label}-Bold-Low: ${formatContentValue(tokenSet.onBoldContent.low)};`);
  d.push(`--${label}-Bold-Tinted: ${formatContentValue(tokenSet.onBoldContent.tinted)};`);
  d.push(`--${label}-Bold-TintedA11y: ${formatContentValue(tokenSet.onBoldContent.tintedA11y)};`);

  // On-subtle content (resolved at subtle step — for text/icons on subtle fills)
  d.push(`--${label}-Subtle-High: ${formatContentValue(tokenSet.onSubtleContent.high)};`);
  d.push(`--${label}-Subtle-Medium: ${formatContentValue(tokenSet.onSubtleContent.medium)};`);
  d.push(`--${label}-Subtle-Tinted: ${formatContentValue(tokenSet.onSubtleContent.tinted)};`);
  d.push(
    `--${label}-Subtle-TintedA11y: ${formatContentValue(tokenSet.onSubtleContent.tintedA11y)};`
  );

  // State values
  for (const [token, resolved] of Object.entries(tokenSet.states)) {
    d.push(`${stateTokenName(label, token)}: ${solidSurfaceHex(resolved.hex)};`);
  }

  return d;
}

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

/**
 * Generate backward-compat aliases mapping legacy token names to the new system.
 * Maps --Surface-*, --Text-* to the Primary (or Neutral fallback) role's tokens.
 */
export function generateBackwardCompatAliases(tokenSet: ResolvedTokenSet): string[] {
  const d: string[] = [];
  d.push('/* Backward compat: legacy tokens → new Primary */');
  d.push(...generateLegacySurfaceAliases(tokenSet));
  d.push(...generateLegacyTextAliases(tokenSet));
  return d;
}

function generateLegacySurfaceAliases(tokenSet: ResolvedTokenSet): string[] {
  const d: string[] = [];
  // Surface fill aliases
  d.push(`--Surface-Default: ${solidSurfaceHex(tokenSet.surfaces.default.hex)};`);
  d.push(`--Surface-Main: ${solidSurfaceHex(tokenSet.surfaces.default.hex)};`);
  // Halo gap — used by interactive components for the inner ring of focus halos.
  // Defaults to page background; remapped inside [data-surface] context blocks
  // so the halo gap matches the actual container surface fill (not the page bg).
  d.push(`--Surface-Halo-Gap: ${solidSurfaceHex(tokenSet.surfaces.default.hex)};`);
  d.push(`--Surface-Minimal: ${solidSurfaceHex(tokenSet.surfaces.minimal.hex)};`);
  d.push(`--Surface-Ghost: ${solidSurfaceHex(tokenSet.surfaces.ghost.hex)};`);
  d.push(`--Surface-Subtle: ${solidSurfaceHex(tokenSet.surfaces.subtle.hex)};`);
  d.push(`--Surface-Bold: ${solidSurfaceHex(tokenSet.surfaces.bold.hex)};`);
  d.push(`--Surface-Elevated: ${solidSurfaceHex(tokenSet.surfaces.elevated.hex)};`);
  d.push(`--Surface-Blend: ${solidSurfaceHex(tokenSet.surfaces.blend.hex)};`);

  // State aliases
  d.push(`--Surface-Bold-Hover: ${solidSurfaceHex(tokenSet.states.boldHover.hex)};`);
  d.push(`--Surface-Bold-Pressed: ${solidSurfaceHex(tokenSet.states.boldPressed.hex)};`);
  d.push(`--Surface-Subtle-Hover: ${solidSurfaceHex(tokenSet.states.subtleHover.hex)};`);
  d.push(`--Surface-Subtle-Pressed: ${solidSurfaceHex(tokenSet.states.subtlePressed.hex)};`);
  d.push(`--Surface-Minimal-Hover: ${solidSurfaceHex(tokenSet.states.hover.hex)};`);
  d.push(`--Surface-Minimal-Pressed: ${solidSurfaceHex(tokenSet.states.pressed.hex)};`);
  d.push(`--Surface-Ghost-Hover: ${solidSurfaceHex(tokenSet.states.hover.hex)};`);
  return d;
}

function generateLegacyTextAliases(tokenSet: ResolvedTokenSet): string[] {
  const d: string[] = [];
  // Text token aliases (from content)
  d.push(`--Text-High: ${formatContentValue(tokenSet.content.high)};`);
  d.push(`--Text-Medium: ${formatContentValue(tokenSet.content.medium)};`);
  d.push(`--Text-Low: ${formatContentValue(tokenSet.content.low)};`);
  d.push(`--Text-Medium-Stroke: ${formatContentValue(tokenSet.content.strokeMedium)};`);
  d.push(`--Text-Low-Stroke: ${formatContentValue(tokenSet.content.strokeLow)};`);

  // Text on bold — content.high resolved at the bold surface step
  d.push(`--Text-OnBold-High: ${formatContentValue(tokenSet.onBoldContent.high)};`);

  return d;
}

/**
 * Generate backward-compat aliases remapped for a surface context.
 * Used inside [data-surface] blocks to keep legacy tokens working.
 */
function generateContextBackwardCompatAliases(contextTokenSet: ResolvedTokenSet): string[] {
  const d: string[] = [];
  d.push('/* Backward compat remapped for surface context */');

  d.push(`--Surface-Bold: ${solidSurfaceHex(contextTokenSet.surfaces.bold.hex)};`);
  d.push(`--Surface-Subtle: ${solidSurfaceHex(contextTokenSet.surfaces.subtle.hex)};`);
  d.push(`--Surface-Minimal: ${solidSurfaceHex(contextTokenSet.surfaces.minimal.hex)};`);
  d.push(`--Surface-Elevated: ${solidSurfaceHex(contextTokenSet.surfaces.elevated.hex)};`);
  d.push(`--Surface-Bold-Hover: ${solidSurfaceHex(contextTokenSet.states.boldHover.hex)};`);
  d.push(`--Surface-Bold-Pressed: ${solidSurfaceHex(contextTokenSet.states.boldPressed.hex)};`);
  d.push(`--Surface-Subtle-Hover: ${solidSurfaceHex(contextTokenSet.states.subtleHover.hex)};`);
  d.push(`--Surface-Subtle-Pressed: ${solidSurfaceHex(contextTokenSet.states.subtlePressed.hex)};`);
  d.push(`--Surface-Blend: ${solidSurfaceHex(contextTokenSet.surfaces.blend.hex)};`);

  d.push(`--Text-High: ${formatContentValue(contextTokenSet.content.high)};`);
  d.push(`--Text-Medium: ${formatContentValue(contextTokenSet.content.medium)};`);
  d.push(`--Text-Low: ${formatContentValue(contextTokenSet.content.low)};`);
  d.push(`--Text-OnBold-High: ${formatContentValue(contextTokenSet.onBoldContent.high)};`);

  return d;
}

// ============================================================================
// Declaration de-duplication
// ============================================================================

/**
 * Collapse duplicate custom-property declarations within a single selector
 * body, keeping the LAST occurrence (CSS cascade order). Comment and blank
 * lines are preserved in place.
 *
 * Several generators intentionally emit a default and then override it later in
 * the same `:root` block — e.g. `--Surface-Elevated` (default → neutral pin),
 * `--Display-FontFamily` (text slot → heading slot), and the script-font
 * fallbacks (shared `var()` fallback → resolved family). The browser already
 * resolves these last-wins, so collapsing them is value-preserving; it makes
 * the emitted CSS canonical, shrinks the payload, and stops the duplicate-token
 * validator from flagging the redundant earlier declaration.
 *
 * Only valid for a FLAT declaration body (no nested selector blocks).
 */
export function dedupeDeclarationsKeepLast(lines: string[]): string[] {
  const propRe = /^\s*(--[A-Za-z0-9-]+)\s*:/;
  const lastIndex = new Map<string, number>();
  lines.forEach((line, index) => {
    const match = propRe.exec(line);
    if (match) lastIndex.set(match[1], index);
  });
  return lines.filter((line, index) => {
    const match = propRe.exec(line);
    return !match || lastIndex.get(match[1]) === index;
  });
}

// ============================================================================
// Multi-Role CSS Generation
// ============================================================================

/**
 * Generate root CSS for multiple appearance roles.
 * Returns the declarations to go inside :root { ... }.
 *
 * @param multiRole - Resolved multi-role token sets
 * @param theme - 'light' or 'dark' (used for border token theme-adaptation)
 */
export function generateMultiRoleRootCSS(
  multiRole: MultiRoleTokenSets,
  theme: 'light' | 'dark'
): string {
  const declarations: string[] = [];

  // Per-role CSS (20 new tokens + ~25 V4 aliases each)
  for (const [role, tokenSet] of Object.entries(multiRole.roles)) {
    const label = roleLabel(role);
    declarations.push(...generateRoleCSS(label, tokenSet));
  }

  // Backward-compat Surface-* / Text-* aliases from neutral (or primary
  // fallback). Neutral defines generic page/app backgrounds and the default
  // content colors that sit on those backgrounds.
  const surfaceAliasTokens = multiRole.roles['neutral'] ?? multiRole.roles['primary'];
  if (surfaceAliasTokens) {
    declarations.push('/* Backward compat: legacy surface/text tokens from neutral */');
    declarations.push(...generateLegacySurfaceAliases(surfaceAliasTokens));
    declarations.push(...generateLegacyTextAliases(surfaceAliasTokens));
  }

  // When no explicit primary, generate Primary-* aliases from neutral
  if (!multiRole.roles['primary'] && multiRole.roles['neutral']) {
    declarations.push(...generateRoleCSS('Primary', multiRole.roles['neutral']));
  }

  // Surface container fill tokens — ONLY defined at :root, NEVER remapped in context blocks.
  // The Surface component reads these for its own background-color so it doesn't
  // pick up the self-referential remapped value from [data-surface] context blocks.
  // Generated for ALL roles so stories can override fills for non-primary appearances.
  //
  // The -High / -Tinted / -TintedA11y siblings let components that set their own
  // data-surface="bold"|"subtle" (Badge, Chip, Button…) read an on-colour for
  // their own fill — without the `[data-surface]` cascade remapping it to a
  // nested-bold value under the component's own label/icon children.
  declarations.push('/* Surface container fills (root-only, not remapped in context) */');
  for (const [role, tokenSet] of Object.entries(multiRole.roles)) {
    const label = roleLabel(role);
    const s = tokenSet.surfaces;
    declarations.push(`--${label}-Fill-Minimal: ${solidSurfaceHex(s.minimal.hex)};`);
    declarations.push(`--${label}-Fill-Subtle: ${solidSurfaceHex(s.subtle.hex)};`);
    declarations.push(`--${label}-Fill-Moderate: ${solidSurfaceHex(s.moderate.hex)};`);
    declarations.push(`--${label}-Fill-Bold: ${solidSurfaceHex(s.bold.hex)};`);
    declarations.push(`--${label}-Fill-Elevated: ${solidSurfaceHex(s.elevated.hex)};`);
    declarations.push(`--${label}-Fill-Blend: ${solidSurfaceHex(s.blend.hex)};`);
    // On-bold on-colours, root-pinned. Use the same onBoldContent values already
    // computed for `--{Role}-Bold-*` at :root; difference is these are NOT
    // re-emitted inside `[data-surface]` blocks, so they survive remapping.
    declarations.push(
      `--${label}-Fill-Bold-High: ${formatContentValue(tokenSet.onBoldContent.high)};`
    );
    declarations.push(
      `--${label}-Fill-Bold-Tinted: ${formatContentValue(tokenSet.onBoldContent.tinted)};`
    );
    declarations.push(
      `--${label}-Fill-Bold-TintedA11y: ${formatContentValue(tokenSet.onBoldContent.tintedA11y)};`
    );
    declarations.push(
      `--${label}-Fill-Subtle-High: ${formatContentValue(tokenSet.onSubtleContent.high)};`
    );
    declarations.push(
      `--${label}-Fill-Subtle-Tinted: ${formatContentValue(tokenSet.onSubtleContent.tinted)};`
    );
    declarations.push(
      `--${label}-Fill-Subtle-TintedA11y: ${formatContentValue(tokenSet.onSubtleContent.tintedA11y)};`
    );
  }
  // Default Surface-Fill-* aliases from Neutral (or Primary fallback). These
  // feed generic <Surface> containers and app shell backgrounds.
  const fillSource = multiRole.roles['neutral'] ?? multiRole.roles['primary'];
  if (fillSource) {
    const s = fillSource.surfaces;
    declarations.push(`--Surface-Fill-Default: ${solidSurfaceHex(s.default.hex)};`);
    declarations.push(`--Surface-Fill-Minimal: ${solidSurfaceHex(s.minimal.hex)};`);
    declarations.push(`--Surface-Fill-Subtle: ${solidSurfaceHex(s.subtle.hex)};`);
    declarations.push(`--Surface-Fill-Moderate: ${solidSurfaceHex(s.moderate.hex)};`);
    declarations.push(`--Surface-Fill-Bold: ${solidSurfaceHex(s.bold.hex)};`);
    declarations.push(`--Surface-Fill-Elevated: ${solidSurfaceHex(s.elevated.hex)};`);
    declarations.push(`--Surface-Fill-Blend: ${solidSurfaceHex(s.blend.hex)};`);
  }

  // Border tokens — derived from neutral strokes (achromatic)
  const neutralTokens = multiRole.roles['neutral'];
  if (neutralTokens) {
    const subtleStroke =
      theme === 'dark' ? neutralTokens.content.strokeMedium : neutralTokens.content.strokeLow;
    const defaultStroke =
      theme === 'dark' ? neutralTokens.content.strokeLow : neutralTokens.content.strokeMedium;
    declarations.push(`--Border-Subtle: ${formatContentValue(subtleStroke)};`);
    declarations.push(`--Border-Default: ${formatContentValue(defaultStroke)};`);

    // Keep --Surface-Elevated pinned to the Neutral role. Floating panels —
    // Popover, ChatComposer, Dialog — must stay neutral, not primary-tinted.
    // --Primary-Elevated remains available for components that intentionally
    // want the tinted fill.
    declarations.push(
      `--Surface-Elevated: ${solidSurfaceHex(neutralTokens.surfaces.elevated.hex)};`
    );
  }

  // Focus outline — per reference spec, always the informative scale's
  // tintedA11y token (base/darkerBase walked until ≥ 4.5:1 contrast against
  // the parent surface). Falls back to primary/neutral high if informative
  // isn't in this theme config.
  const focusSource =
    multiRole.roles['informative'] ?? multiRole.roles['primary'] ?? multiRole.roles['neutral'];
  if (focusSource) {
    declarations.push(`--Focus-Outline: ${formatContentValue(focusSource.content.tintedA11y)};`);
  }

  return declarations.join('\n  ');
}

// ============================================================================
// Surface Context CSS Generation
// ============================================================================

/** Map surface token to the data-surface attribute value */
function surfaceAttrValue(token: SurfaceToken): string {
  return token; // Direct 1:1 mapping: 'bold' → data-surface="bold"
}

/**
 * Generate surface context CSS blocks for [data-surface] attribute remapping.
 *
 * Emits only the two tokens that genuinely need mode-keyed remapping:
 *   --Surface-Halo-Gap : points at the matching root-only --Surface-Fill-{Mode}
 *   --Focus-Outline    : focus-ring color picked against the visible surface fill
 *
 * Every other role/content/state/legacy alias previously emitted here is
 * redundantly covered by `generateSurfaceStepLookupCSS` at the same step the
 * mode resolves to (verified by scripts/audit-legacy-context-redundancy.ts:
 * 319 of 321 tokens were duplicates). Dropping them shrinks this slice from
 * ~58 KB to ~1 KB per brand.
 *
 * @param themeConfig - Maps appearance role names → scale definitions
 * @param outerParentStep - Step of the default page surface (2500 light, 200 dark)
 * @param darkMode - Whether dark mode is active
 */
export function generateSurfaceContextCSS(
  themeConfig: ThemeConfig,
  outerParentStep: number,
  darkMode = false
): string {
  const allBlocks: string[] = [];

  // Hoisted across the surface-context loop: only depends on themeConfig + outerParentStep.
  const primaryScale = themeConfig.appearances['primary'] ?? themeConfig.appearances['neutral'];
  const focusContextScale =
    themeConfig.appearances['informative'] ??
    themeConfig.appearances['primary'] ??
    themeConfig.appearances['neutral'];
  const primaryRgbPalette = primaryScale ? preParseRGBPalette(primaryScale.palette) : null;
  const outerParentRgb = primaryScale
    ? hexToRgbTuple(primaryScale.palette[outerParentStep] ?? '#FFFFFF')
    : null;
  const outerDir =
    primaryScale && primaryRgbPalette && outerParentRgb
      ? computeContrastDir(outerParentRgb, primaryRgbPalette)
      : null;

  for (const contextSurface of CONTEXT_SURFACE_TOKENS) {
    const declarations: string[] = [];

    // Focus outline — walk informative against the ACTUAL visible surface fill.
    // Direction comes from the surface role's palette so focus moves the same
    // way as Bold-High / Subtle-TintedA11y at this step (avoids divergence when
    // informative's palette extremes differ from primary's). Walking a separate
    // scale also avoids the same-scale tintedA11y collapse to pure white/black.
    if (focusContextScale && primaryScale && primaryRgbPalette && outerDir) {
      const visualParentStep = resolveSurface(
        contextSurface,
        outerParentStep,
        primaryScale,
        outerDir,
        darkMode
      );
      const visualParentHex = primaryScale.palette[visualParentStep] ?? '#808080';
      const visualParentRgb = hexToRgbTuple(visualParentHex);
      const surfaceDir = computeContrastDir(visualParentRgb, primaryRgbPalette);
      const ring = resolveFocusRing(
        'focusRing',
        visualParentStep,
        visualParentRgb,
        focusContextScale,
        surfaceDir
      );
      const focusHex = focusContextScale.palette[ring.step] ?? '#808080';
      declarations.push(`--Focus-Outline: ${solidSurfaceHex(focusHex)};`);
    }

    // Halo gap — points to the root-only --Surface-Fill-* token for this surface,
    // which holds the actual container fill color (never remapped in context blocks).
    // Components that draw a focus halo gap read this so the inner ring matches
    // the parent container background instead of the page background.
    const fillModeName = contextSurface.charAt(0).toUpperCase() + contextSurface.slice(1);
    declarations.push(`--Surface-Halo-Gap: var(--Surface-Fill-${fillModeName});`);

    if (declarations.length > 0) {
      const attrValue = surfaceAttrValue(contextSurface);
      const inner = declarations.join('\n    ');
      allBlocks.push(`  [data-surface="${attrValue}"] {\n    ${inner}\n  }`);
    }
  }

  return allBlocks.join('\n');
}

// ============================================================================
// Surface Step Lookup CSS Generation (RFC-0003)
// ============================================================================

/**
 * Canonical bold step. Surface JSX writes this for `mode="bold"` regardless
 * of brand baseStep so the JSX-side approximation agrees with the lookup
 * table. Engine emits a block at this step computed from the brand's actual
 * baseStep — children read tokens "as if their parent were at this step",
 * which is close enough for cascade purposes (the actual surface paints from
 * `--Surface-Fill-Bold` at the brand's baseStep, which is set at :root).
 *
 * Phase-2 work: replace this canonical pin with a per-brand
 * BrandFoundationContext so JSX can call resolveSurface() with the real
 * scale.
 */
export const SURFACE_STEP_BOLD_LIGHT = 700;
export const SURFACE_STEP_BOLD_DARK = 1900;

/**
 * Steps the lookup table emits blocks for. Currently: every step in the
 * 25-step scale. Walking minimal repeatedly from either root reaches every
 * scale slot, so any nesting chain in either theme can land here.
 *
 * Slight over-emission is acceptable — selectors that never match are
 * inert. A future optimisation can prune unreachable steps per role using
 * a graph walk over (start, mode) pairs.
 */
function getOccupiedSteps(): readonly number[] {
  return STEPS;
}

/**
 * Generate the step-keyed lookup table that drives depth-N surface
 * adaptation.
 *
 * Replaces the depth-1 ceiling in `generateSurfaceContextCSS`: instead of
 * one block per surface mode (computed against the page root), emit one
 * block per scale step containing every role's tokens resolved as if its
 * parent were at that step. A `<Surface>` writes its own resolved step as
 * `data-surface-step="N"`, and every descendant reads role tokens from the
 * matching block via cascade — no matter how deep the nesting goes.
 *
 * Block shape:
 *   [data-surface-step="N"] {
 *     --Primary-Bold:        ...;  // fill for child whose parent is at step N
 *     --Primary-Subtle:      ...;
 *     --Primary-High:        ...;  // content on a surface AT step N
 *     --Primary-TintedA11y:  ...;
 *     // …all roles, plus --Text-* / --Surface-* legacy aliases
 *   }
 *
 * Mode-specific bits (`--Surface-Halo-Gap`, `--Focus-Outline`) stay in
 * `generateSurfaceContextCSS` — those are functions of the surface's own
 * mode (which fill it shows), not of its resolved step.
 *
 * Cascade ordering: this block must be emitted AFTER the legacy
 * [data-surface="<mode>"] block in the stylesheet. Both target the same
 * custom properties at equal specificity; the later wins. At depth 1 both
 * agree (the engine resolves to the same step from the same parent); at
 * depth ≥ 2 only the step-keyed block produces correct values.
 *
 * Root-only fills (--Surface-Fill-* / --{Role}-Fill-*) are intentionally
 * absent here so a Surface element can read its own background colour from
 * `:root` without self-referential remap.
 *
 * @param themeConfig - Maps appearance role names → scale definitions
 * @param darkMode - Whether dark mode is active. Affects only the `default`
 *   surface, which is keyed at root not in this table — so passing this
 *   along is mostly defensive (resolveTokenSet branches on it for
 *   `default`, which we ignore here).
 */
// Memoizes the rendered step-lookup string per ThemeConfig. WeakMap keys on
// themeConfig identity so stale brands GC naturally. The output is now
// theme-agnostic — both light and dark are baked into the same string,
// with only `--{Role}-Default` declarations scoped under [data-mode]
// overlays. Theme toggle becomes a CSS attribute flip with zero JS pipeline
// work. (Verified across 8 brand fixtures: only `*-Default` declarations
// differ across themes, ~3.3% of the payload — see scripts/verify-theme-
// redundancy.ts for the proof.)
const stepLookupCache = new WeakMap<ThemeConfig, string>();

// Approach B (RFC `surface_lookup_css_optimization_architecture.md`): grouped
// emission collapses identical (token, value) pairs across step blocks into
// one rule with a multi-step selector list. Default ON; set
// `ONEUI_STEP_LOOKUP_GROUPING=0` to fall back to the legacy per-step emitter
// for A/B comparison or revert.
const STEP_LOOKUP_GROUPING_DISABLED =
  typeof process !== 'undefined' && process.env?.ONEUI_STEP_LOOKUP_GROUPING === '0';

/**
 * Token prefixes whose palettes are brand-invariant. These derive from
 * hardcoded hue/chroma constants in `presets.ts` and have no per-brand input
 * flowing into them in production (Convex schema only exposes baseStep for
 * the 4 user-configurable accents). The grouped step-lookup output for these
 * prefixes is therefore byte-identical across brands and can be hoisted into
 * a shared, build-time-emittable stylesheet that survives brand switches.
 *
 * NOTE: fixture generators (e.g. verify-theme-redundancy.ts) that apply a
 * non-default baseStep to ALL 9 roles will break invariance synthetically —
 * production code paths cannot.
 */
const STATIC_TOKEN_PREFIXES = [
  '--Neutral-',
  '--Positive-',
  '--Negative-',
  '--Warning-',
  '--Informative-',
  '--Border-',
] as const;

function isStaticToken(token: string): boolean {
  for (const p of STATIC_TOKEN_PREFIXES) if (token.startsWith(p)) return true;
  return false;
}

/**
 * Backwards-compatible combined emitter. Returns static + dynamic slices
 * concatenated. Callers wanting to hoist the static slice to a shared sheet
 * should use `generateSurfaceStepLookupCSSSplit` instead.
 */
export function generateSurfaceStepLookupCSS(themeConfig: ThemeConfig): string {
  const cached = stepLookupCache.get(themeConfig);
  if (cached !== undefined) return cached;

  const result = STEP_LOOKUP_GROUPING_DISABLED
    ? computeStepLookupCSSLegacy(themeConfig)
    : computeStepLookupCSSGrouped(themeConfig);
  stepLookupCache.set(themeConfig, result);
  return result;
}

/**
 * Split emitter: returns the step-lookup CSS partitioned by brand-invariance.
 * The `staticCSS` slice depends only on hardcoded role presets and is safe to
 * emit once at build time / cache across brand switches. The `dynamicCSS`
 * slice is the per-brand portion that must be re-injected on brand change.
 *
 * Always uses the grouped emitter — the legacy emitter doesn't support
 * splitting (env flag is ignored here). Callers that need the legacy path
 * for A/B comparison should fall back to `generateSurfaceStepLookupCSS`.
 */
export function generateSurfaceStepLookupCSSSplit(themeConfig: ThemeConfig): {
  staticCSS: string;
  dynamicCSS: string;
} {
  const cached = stepLookupSplitCache.get(themeConfig);
  if (cached !== undefined) return cached;
  const result = computeStepLookupCSSGroupedSplit(themeConfig);
  stepLookupSplitCache.set(themeConfig, result);
  return result;
}

const stepLookupSplitCache = new WeakMap<ThemeConfig, { staticCSS: string; dynamicCSS: string }>();

/**
 * Returns true if a single declaration line targets a `*-Default` token —
 * i.e. the page-surface anchor that flips with theme. Everything else in
 * the step-lookup payload resolves to the same hex at the same step number
 * for both themes.
 */
function isDefaultDecl(line: string): boolean {
  // Lines look like `--Primary-Default: #abc123;` after trimming.
  return /^--[A-Za-z][\w-]*-Default:/.test(line);
}

/**
 * Compress `#RRGGBB` to `#RGB` when each channel's two nibbles are equal.
 * Case-sensitive on the hex digits but match-insensitive (so `#ABCABC` is
 * NOT compressible because the nibbles differ).
 */
function shortenHex(value: string): string {
  const m = /^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/i.exec(value);
  return m ? `#${m[1]}${m[2]}${m[3]}` : value;
}

/**
 * Parse a declaration line of the form `--Token-Name: <value>;` into its
 * (token, value) parts. Returns null for lines that don't match (defensive).
 */
function parseDecl(line: string): { token: string; value: string } | null {
  const m = /^(--[A-Za-z][\w-]+):\s*([^;]+);$/.exec(line.trim());
  if (!m) return null;
  return { token: m[1], value: m[2].trim() };
}

type DeclMap = Map<string, Map<string, Set<number>>>; // token → value → steps
type RuleGroup = { steps: number[]; pairs: Array<[string, string]> };

function addToDeclMap(map: DeclMap, token: string, value: string, step: number): void {
  let byValue = map.get(token);
  if (!byValue) {
    byValue = new Map();
    map.set(token, byValue);
  }
  let stepSet = byValue.get(value);
  if (!stepSet) {
    stepSet = new Set();
    byValue.set(value, stepSet);
  }
  stepSet.add(step);
}

/**
 * Group `(token, value)` pairs by their stepSet, emit one rule per group with
 * a canonically-sorted multi-step selector list.
 *
 * @param context     Per-context decl map (token → value → step set).
 * @param universeSize  Total number of occupied steps. A stepSet whose size
 *                    equals this is "universe" — emitted at `rootSelector`
 *                    if provided (B.1, theme-agnostic context only).
 * @param buildPerStepSelector  Builds the LHS for a single step. For the
 *                    agnostic context this is `[data-surface-step="N"]`; for
 *                    overlays it is `[data-mode="X"] [data-surface-step="N"]`.
 * @param rootSelector  When non-null, universe-stepSet groups collapse to
 *                    this single selector instead of a 25-element list.
 *                    Pass `:root` for the agnostic context, `null` for
 *                    overlays (where collapsing to `[data-mode="X"]`
 *                    changes specificity and risks override-order surprises).
 */
function emitGroupedContext(
  context: DeclMap,
  universeSize: number,
  buildPerStepSelector: (step: number) => string,
  rootSelector: string | null
): string {
  const groups = new Map<string, RuleGroup>();

  for (const [token, byValue] of context) {
    for (const [value, stepSet] of byValue) {
      const stepsArr = [...stepSet].sort((a, b) => a - b);
      const key = stepsArr.join(',');
      let g = groups.get(key);
      if (!g) {
        g = { steps: stepsArr, pairs: [] };
        groups.set(key, g);
      }
      g.pairs.push([token, value]);
    }
  }

  // Determinism: descending stepSet size, then ascending min step, then key.
  const sorted = [...groups.entries()].sort(([ka, a], [kb, b]) => {
    if (a.steps.length !== b.steps.length) return b.steps.length - a.steps.length;
    if (a.steps[0] !== b.steps[0]) return a.steps[0] - b.steps[0];
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

  const blocks: string[] = [];
  for (const [, g] of sorted) {
    g.pairs.sort(([ta], [tb]) => (ta < tb ? -1 : ta > tb ? 1 : 0));
    const body = g.pairs.map(([t, v]) => `${t}: ${v};`).join('\n    ');

    let selector: string;
    if (rootSelector !== null && g.steps.length === universeSize) {
      selector = rootSelector;
    } else {
      selector = g.steps.map(buildPerStepSelector).join(',\n  ');
    }

    blocks.push(`  ${selector} {\n    ${body}\n  }`);
  }

  return blocks.join('\n');
}

/**
 * Build all per-context DeclMaps for a theme. Each context is partitioned
 * into a static slice (brand-invariant token prefixes) and a dynamic slice
 * (everything else) so callers can emit them to separate stylesheets.
 */
function buildStepLookupDeclMaps(themeConfig: ThemeConfig): {
  agnosticStatic: DeclMap;
  agnosticDynamic: DeclMap;
  lightOvStatic: DeclMap;
  lightOvDynamic: DeclMap;
  darkOvStatic: DeclMap;
  darkOvDynamic: DeclMap;
  universe: number;
} {
  const primaryScale = themeConfig.appearances['primary'] ?? themeConfig.appearances['neutral'];

  const roleEntries = Object.entries(themeConfig.appearances).map(([role, scale]) => ({
    role,
    label: roleLabel(role),
    scale,
    ctxScale: scale.anchorBoldToBaseStep ? { ...scale, anchorBoldToBaseStep: undefined } : scale,
  }));
  const primaryCtxScale = primaryScale
    ? primaryScale.anchorBoldToBaseStep
      ? { ...primaryScale, anchorBoldToBaseStep: undefined }
      : primaryScale
    : null;
  const mirrorPrimary = !themeConfig.appearances['primary'] && !!themeConfig.appearances['neutral'];

  const DARK_DEFAULT_STEP = 200;

  const agnosticStatic: DeclMap = new Map();
  const agnosticDynamic: DeclMap = new Map();
  const lightOvStatic: DeclMap = new Map();
  const lightOvDynamic: DeclMap = new Map();
  const darkOvStatic: DeclMap = new Map();
  const darkOvDynamic: DeclMap = new Map();

  const pickContext = (isOverlay: boolean, isDark: boolean, token: string): DeclMap => {
    const isStat = isStaticToken(token);
    if (!isOverlay) return isStat ? agnosticStatic : agnosticDynamic;
    if (isDark) return isStat ? darkOvStatic : darkOvDynamic;
    return isStat ? lightOvStatic : lightOvDynamic;
  };

  const occupied = getOccupiedSteps();

  for (const step of occupied) {
    const lightDecls = renderStepDecls(
      step,
      false,
      roleEntries,
      primaryScale,
      primaryCtxScale,
      mirrorPrimary
    );

    for (const line of lightDecls) {
      const parsed = parseDecl(line);
      if (!parsed) continue;
      const value = shortenHex(parsed.value);
      const target = pickContext(isDefaultDecl(line), false, parsed.token);
      addToDeclMap(target, parsed.token, value, step);
    }

    for (const entry of roleEntries) {
      const token = `--${entry.label}-Default`;
      const hex = shortenHex(solidSurfaceHex(entry.scale.palette[DARK_DEFAULT_STEP] ?? '#808080'));
      addToDeclMap(pickContext(true, true, token), token, hex, step);
    }
    if (mirrorPrimary && primaryScale) {
      const token = '--Primary-Default';
      const hex = shortenHex(solidSurfaceHex(primaryScale.palette[DARK_DEFAULT_STEP] ?? '#808080'));
      addToDeclMap(pickContext(true, true, token), token, hex, step);
    }
  }

  return {
    agnosticStatic,
    agnosticDynamic,
    lightOvStatic,
    lightOvDynamic,
    darkOvStatic,
    darkOvDynamic,
    universe: occupied.length,
  };
}

function emitSlice(
  agnostic: DeclMap,
  lightOv: DeclMap,
  darkOv: DeclMap,
  universe: number,
): string {
  // Step-lookup blocks are the SOLID surface system's per-step content
  // emitter. Transparent surfaces have their own `[data-material="transparent"]`
  // pipeline (root [ctx] block + per-establishing-surface compound blocks)
  // that uses CSS inheritance for "nearest establishing ancestor wins".
  // Excluding transparent here is critical: if step-lookup fired on a
  // transparent ghost/minimal/elevated descendant, it would set --Text-*
  // / --{Role}-* on that element directly, blocking inheritance from the
  // establishing ancestor (bold/moderate/etc.) and rendering text at the
  // wrong contrast direction. Specificity bumps from 0,1,0 to 0,2,0 due
  // to the :not() — still inert against transparent material rules (0,2,0
  // root + 0,3,0 per-surface), and still wins against unset.
  const NON_TRANSPARENT = `:not([data-material="transparent"])`;
  const agnosticBlock = emitGroupedContext(
    agnostic,
    universe,
    (s) => `[data-surface-step="${s}"]${NON_TRANSPARENT}`,
    ':root',
  );
  const lightBlock = emitGroupedContext(
    lightOv,
    universe,
    (s) => `[data-mode="light"] [data-surface-step="${s}"]${NON_TRANSPARENT}`,
    null,
  );
  const darkBlock = emitGroupedContext(
    darkOv,
    universe,
    (s) => `[data-mode="dark"] [data-surface-step="${s}"]${NON_TRANSPARENT}`,
    null,
  );
  return [agnosticBlock, lightBlock, darkBlock].filter(Boolean).join('\n');
}

function computeStepLookupCSSGroupedSplit(themeConfig: ThemeConfig): {
  staticCSS: string;
  dynamicCSS: string;
} {
  const maps = buildStepLookupDeclMaps(themeConfig);
  const staticCSS = emitSlice(
    maps.agnosticStatic,
    maps.lightOvStatic,
    maps.darkOvStatic,
    maps.universe
  );
  const dynamicCSS = emitSlice(
    maps.agnosticDynamic,
    maps.lightOvDynamic,
    maps.darkOvDynamic,
    maps.universe
  );
  return { staticCSS, dynamicCSS };
}

function computeStepLookupCSSGrouped(themeConfig: ThemeConfig): string {
  const { staticCSS, dynamicCSS } = computeStepLookupCSSGroupedSplit(themeConfig);
  return [staticCSS, dynamicCSS].filter(Boolean).join('\n');
}

function computeStepLookupCSSLegacy(themeConfig: ThemeConfig): string {
  const primaryScale = themeConfig.appearances['primary'] ?? themeConfig.appearances['neutral'];

  // Hoist invariants out of the per-step loop. These are functions of
  // themeConfig only — no point recomputing per step. The mirror condition
  // (no primary, only neutral) is also evaluated once.
  const roleEntries = Object.entries(themeConfig.appearances).map(([role, scale]) => ({
    role,
    label: roleLabel(role),
    scale,
    // Strip `anchorBoldToBaseStep` for context resolution. At root the
    // anchor pins --Primary-Bold to baseStep; inside any non-root surface
    // we want bold to contrast against the container, not repeat the
    // brand's authored bold step. Mirrors `resolveContextTokenSet`.
    ctxScale: scale.anchorBoldToBaseStep ? { ...scale, anchorBoldToBaseStep: undefined } : scale,
  }));
  const primaryCtxScale = primaryScale
    ? primaryScale.anchorBoldToBaseStep
      ? { ...primaryScale, anchorBoldToBaseStep: undefined }
      : primaryScale
    : null;
  const mirrorPrimary = !themeConfig.appearances['primary'] && !!themeConfig.appearances['neutral'];

  // Per-step buckets. We render only the light pass fully — every non-`*-Default`
  // declaration is theme-agnostic (verified across 8 brand fixtures). For the
  // dark overlay we skip the expensive tokenSet computation and just look up
  // `palette[200]` for each role's default value, which is what
  // `resolveSurface('default', _, _, _, true)` returns.
  const themeAgnosticBlocks: string[] = [];
  const lightOverlayBlocks: string[] = [];
  const darkOverlayBlocks: string[] = [];

  // The `default` surface step is the page-anchor: 2500 in light, 200 in dark
  // (matches `resolveSurface('default', ...)` in surfaceNew.ts).
  const LIGHT_DEFAULT_STEP = 2500;
  const DARK_DEFAULT_STEP = 200;

  for (const step of getOccupiedSteps()) {
    const lightDecls = renderStepDecls(
      step,
      false,
      roleEntries,
      primaryScale,
      primaryCtxScale,
      mirrorPrimary
    );

    const themeAgnostic: string[] = [];
    const lightOverlay: string[] = [];

    for (const line of lightDecls) {
      if (isDefaultDecl(line)) lightOverlay.push(line);
      else themeAgnostic.push(line);
    }

    // Dark overlay: only `--{Role}-Default` decls, computed directly from
    // each role's palette[200]. Mirrors what renderStepDecls would emit
    // for the dark pass without paying the full tokenSet cost.
    const darkOverlay: string[] = [];
    for (const entry of roleEntries) {
      const hex = entry.scale.palette[DARK_DEFAULT_STEP] ?? '#808080';
      darkOverlay.push(`--${entry.label}-Default: ${solidSurfaceHex(hex)};`);
    }
    if (mirrorPrimary && primaryScale) {
      const hex = primaryScale.palette[DARK_DEFAULT_STEP] ?? '#808080';
      darkOverlay.push(`--Primary-Default: ${solidSurfaceHex(hex)};`);
    }
    // Sanity: light overlay used `palette[2500]` via the full pass, so the
    // shape (count + role coverage) is identical between overlays.
    void LIGHT_DEFAULT_STEP;

    // See computeStepLookupCSSGroupedSplit for why `:not([data-material="transparent"])`
    // — keeps step-lookup confined to solid surfaces so transparent
    // descendants can inherit content tokens from their establishing
    // ancestor instead of having them overwritten per-step.
    if (themeAgnostic.length > 0) {
      themeAgnosticBlocks.push(
        `  [data-surface-step="${step}"]:not([data-material="transparent"]) {\n    ${themeAgnostic.join('\n    ')}\n  }`,
      );
    }
    if (lightOverlay.length > 0) {
      lightOverlayBlocks.push(
        `  [data-mode="light"] [data-surface-step="${step}"]:not([data-material="transparent"]) {\n    ${lightOverlay.join('\n    ')}\n  }`,
      );
    }
    if (darkOverlay.length > 0) {
      darkOverlayBlocks.push(
        `  [data-mode="dark"] [data-surface-step="${step}"]:not([data-material="transparent"]) {\n    ${darkOverlay.join('\n    ')}\n  }`,
      );
    }
  }

  return [...themeAgnosticBlocks, ...lightOverlayBlocks, ...darkOverlayBlocks].join('\n');
}

function renderStepDecls(
  step: number,
  darkMode: boolean,
  roleEntries: Array<{
    role: string;
    label: string;
    scale: ScaleDefinition;
    ctxScale: ScaleDefinition;
  }>,
  primaryScale: ScaleDefinition | undefined,
  primaryCtxScale: ScaleDefinition | null | undefined,
  mirrorPrimary: boolean
): string[] {
  const declarations: string[] = [];
  let primaryTokens: ResolvedTokenSet | null = null;

  for (const entry of roleEntries) {
    const tokens = resolveTokenSet(entry.ctxScale, step, darkMode);
    if (entry.scale === primaryScale) primaryTokens = tokens;
    declarations.push(...generateRoleCSS(entry.label, tokens));

    // Per-role self-color: palette[step], theme-independent.
    const selfHex = entry.scale.palette[step] ?? '#808080';
    declarations.push(`--${entry.label}-Self-Color: ${solidSurfaceHex(selfHex)};`);
  }

  if (primaryScale) {
    const selfHex = primaryScale.palette[step] ?? '#808080';
    declarations.push(`--Surface-Self-Color: ${solidSurfaceHex(selfHex)};`);
  }

  if (primaryScale && primaryCtxScale) {
    const tokens = primaryTokens ?? resolveTokenSet(primaryCtxScale, step, darkMode);
    declarations.push(...generateContextBackwardCompatAliases(tokens));
    if (mirrorPrimary) {
      declarations.push(...generateRoleCSS('Primary', tokens));
    }
  }

  return declarations;
}

// ============================================================================
// Per-Appearance Content-Token Redirect (RFC-0003 Item D)
// ============================================================================

/**
 * Generate `[data-surface][data-appearance="<role>"]` blocks that redirect the
 * surface-aware `--Text-*` aliases to the active role's content tokens.
 *
 * Scoped to Surface only (`Surface.tsx` emits both attributes on the same
 * element). An unscoped `[data-appearance]` selector would also match
 * components that self-emit `data-appearance` (Switch, TouchSlider, etc.),
 * causing `var(--Text-*)` on those elements to resolve from their own
 * appearance prop instead of the parent Surface — the wrong tint for
 * surface-following chrome (rail, idle stroke).
 *
 * Without this, `--Text-High` (etc.) inside a `<Surface appearance="
 * secondary">` resolves to *primary's* content at the surface step —
 * because the step block emits Text-* aliases off the primary scale.
 * Result: visually wrong contrast on non-primary surfaces (e.g. purple
 * "low" text on an orange secondary fill).
 *
 * The redirect runs once per role at root scope. Each block re-points
 * `--Text-*` to `--{Role}-*`, both of which are emitted per step inside
 * `[data-surface-step="N"]` blocks. So at depth-N inside a
 * `[data-surface][data-appearance="secondary"]` element, `--Text-High`
 * reads `var(--Secondary-High)` which the nearest step block defines for
 * step N — depth-N safe, no per-step duplication.
 *
 * Cost: 8 roles × 8 declarations ≈ 64 declarations total,
 * theme-independent. ~3 KB. Cheap.
 *
 * @param themeConfig - Roles to emit redirects for. Includes primary so a
 *   primary descendant of a non-primary ancestor breaks the inheritance
 *   chain — without a primary block, `--Text-*` set by an outer
 *   `[data-surface][data-appearance="secondary"]` ancestor leaks through
 *   descendant primary surfaces (CSS custom-property inheritance has no
 *   auto-revert).
 */
export function generateAppearanceRedirectCSS(themeConfig: ThemeConfig): string {
  const blocks: string[] = [];
  for (const role of Object.keys(themeConfig.appearances)) {
    const label = roleLabel(role);
    const decls = [
      `--Text-High: var(--${label}-High);`,
      `--Text-Medium: var(--${label}-Medium-Text);`,
      `--Text-Low: var(--${label}-Low);`,
      `--Text-Medium-Stroke: var(--${label}-Stroke-Medium);`,
      `--Text-Low-Stroke: var(--${label}-Stroke-Low);`,
      `--Text-OnBold-High: var(--${label}-Bold-High);`,
      // Surface-appearance-following chrome aliases: idle stroke/hover/filled
      // tints follow the PARENT surface's role, not a child's appearance prop.
      `--Text-Hover: var(--${label}-Hover);`,
      `--Text-Minimal: var(--${label}-Minimal);`,
    ].join('\n    ');
    blocks.push(`  [data-surface][data-appearance="${role}"] {\n    ${decls}\n  }`);
  }
  return blocks.join('\n');
}

// ============================================================================
// Context Boundary CSS Generation
// ============================================================================

/**
 * Generate the `[data-context-boundary]` reset block.
 *
 * This is the inverse of the `[data-surface="<mode>"]` cascade: an element
 * marked with `data-context-boundary` re-pins every role's surface-context
 * tokens to their root-only `Fill-*` equivalents, so the element renders
 * as if it were at the page root regardless of the outer surface context.
 *
 * Use case: a child component placed inside a `<Surface mode="bold">` that
 * must keep its own appearance role colour rather than adapting (e.g.
 * CounterBadge / IndicatorBadge inside a Badge slot). The component author
 * wraps the immune child in `<span data-context-boundary>`.
 *
 * What this block emits per role:
 *   --{Role}-Bold:        var(--{Role}-Fill-Bold);
 *   --{Role}-Bold-High:   var(--{Role}-Fill-Bold-High);
 *   --{Role}-Subtle:      var(--{Role}-Fill-Subtle);
 *   --{Role}-TintedA11y:  var(--{Role}-Fill-Subtle-TintedA11y);
 *
 * Plus, for the slot-level `-High` icon remap pattern (see how Badge sets
 * `--Primary-High` inside its bold slot):
 *   --{Role}-High:  revert-layer;
 *   --Text-High:    revert-layer;
 *   --Text-Medium:  revert-layer;
 *
 * The `Fill-*` tokens are emitted at `:root` only by `generateMultiRoleRootCSS`
 * and never touched by `[data-surface]` blocks, so they're a safe "original
 * value" reference. `revert-layer` reverts a custom property to whatever the
 * previous cascade layer set, undoing any component-level slot remap.
 *
 * @param themeConfig - Maps appearance role names → scale definitions
 * @returns A single `[data-context-boundary] { ... }` CSS block, or empty
 *   string if no roles are configured.
 */
export function generateContextBoundaryCSS(themeConfig: ThemeConfig): string {
  const declarations: string[] = [];

  for (const role of Object.keys(themeConfig.appearances)) {
    const label = roleLabel(role);
    declarations.push(`--${label}-Bold: var(--${label}-Fill-Bold);`);
    declarations.push(`--${label}-Bold-High: var(--${label}-Fill-Bold-High);`);
    declarations.push(`--${label}-Subtle: var(--${label}-Fill-Subtle);`);
    declarations.push(`--${label}-TintedA11y: var(--${label}-Fill-Subtle-TintedA11y);`);
  }

  if (declarations.length === 0) return '';

  // Revert the slot-level `-High` and `Text-*` remaps that components apply
  // for icon coloring. `revert-layer` falls back to the prior cascade layer's
  // value, undoing any component CSS-Module-level override.
  for (const role of Object.keys(themeConfig.appearances)) {
    const label = roleLabel(role);
    declarations.push(`--${label}-High: revert-layer;`);
  }
  declarations.push(`--Text-High: revert-layer;`);
  declarations.push(`--Text-Medium: revert-layer;`);

  const inner = declarations.join('\n    ');
  return `  [data-context-boundary] {\n    ${inner}\n  }`;
}

// ============================================================================
// Transparent Material CSS Generation
// ============================================================================

/** All 8 surface tokens (iteration order for transparent material blocks). */
const ALL_SURFACE_TOKENS: SurfaceToken[] = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'blend',
];

/** All content tokens — drive the content-token emission for each transparent surface. */
const ALL_CONTENT_TOKENS: ContentToken[] = [
  'high',
  'medium',
  'low',
  'tinted',
  'tintedA11y',
  'strokeMedium',
  'strokeLow',
];

/** Format an `r, g, b` string for `rgba()` composition. */
function rgbTripleFromHex(hex: string): string {
  const [r, g, b] = hexToRgbTuple(hex);
  return `${r}, ${g}, ${b}`;
}

/** Format a CSS `rgba(...)` value from a variant + opacityStep. */
function formatRgba(
  variant: MaterialVariant,
  opacityStep: number,
  neutralPalette: ColorPalette
): string {
  const baseHex = getTransparentBaseHex(variant, neutralPalette);
  const rgb = rgbTripleFromHex(baseHex);
  const alpha = opacityFromStep(opacityStep);
  if (alpha === 0) return 'transparent';
  if (alpha === 1) return normalizeSolidCssHex(baseHex);
  return `rgba(${rgb}, ${alpha.toFixed(3).replace(/\.?0+$/, '')})`;
}

/** Role labels whose surface + content tokens get remapped inside a transparent block. */
const TRANSPARENT_ROLE_LABELS = [
  'Primary',
  'Neutral',
  'Secondary',
  'Sparkle',
  'Brand-Bg',
  'Positive',
  'Negative',
  'Warning',
  'Informative',
] as const;

/**
 * Generate transparent-material CSS blocks.
 *
 * Emits three `[data-material="transparent"][data-media="<ctx>"]` selectors
 * (dynamic / dark / light). Inside each, remaps the **existing** role + legacy
 * tokens (`--Surface-Fill-*`, `--Surface-*`, `--Text-*`, `--{Role}-{Mode}`,
 * `--{Role}-High`, etc.) to rgba-composited transparent values.
 *
 * Remap-in-place (rather than emitting new namespaced tokens) means every
 * existing component — Button, Chip, Switch, Input, etc. — automatically
 * adapts to transparent material via the same CSS-custom-property cascade
 * that drives `[data-surface]` remapping. No component code changes.
 *
 * Scoped emission: tokens only take effect when a component is inside a
 * `<Surface material="transparent" mediaContext="...">` wrapper. Zero cost
 * when no transparent material is used on the page.
 *
 * Specificity note: transparent blocks use a 2-attribute selector
 * `[data-material][data-media]` (specificity 0,2,0), which wins over the
 * 1-attribute `[data-surface="..."]` blocks (0,1,0). So if an element is
 * both inside a solid bold surface AND a transparent Surface, the
 * transparent remap wins — as intended.
 *
 * @param themeConfig - full theme config (used to resolve informative scale for focus)
 * @param darkMode - global colour mode (affects focus ring base/darkerBase selection)
 */
export function generateTransparentMaterialCSS(
  themeConfig: ThemeConfig,
  darkMode: boolean
): string {
  // Neutral palette drives transparent base colours (light = step 2500, dark = step 200).
  const neutralScale = themeConfig.appearances['neutral'] ?? themeConfig.appearances['primary'];
  if (!neutralScale) return '';
  const neutralPalette = neutralScale.palette;

  // Informative scale drives focus ring.
  const informativeScale =
    themeConfig.appearances['informative'] ?? themeConfig.appearances['primary'] ?? neutralScale;

  const blocks: string[] = [];

  for (const context of MEDIA_CONTEXTS) {
    const inner: string[] = [];

    // Resolve each mode's transparent fill + pick content variant from the
    // default surface for page-level text and from the bold surface for
    // on-bold text (matches reference semantics).
    const resolved: Record<
      SurfaceToken,
      { fill: string; surface: ReturnType<typeof resolveMediaSurface> }
    > = {} as Record<
      SurfaceToken,
      { fill: string; surface: ReturnType<typeof resolveMediaSurface> }
    >;
    for (const token of ALL_SURFACE_TOKENS) {
      const surface = resolveMediaSurface(context, token);
      resolved[token] = {
        surface,
        fill: formatRgba(surface.variant, surface.opacityStep, neutralPalette),
      };
    }

    // Content — always uses the default surface's contentVariant since text
    // inside a transparent Surface sits on the translucent base, not the
    // solid underlying media. On-bold text uses the bold surface's variant.
    const defaultContentVariant = resolved.default.surface.contentVariant;
    const boldContentVariant = resolved.bold.surface.contentVariant;
    const subtleContentVariant = resolved.subtle.surface.contentVariant;

    const contentRgba = (ct: ContentToken, variant: MaterialVariant) =>
      formatRgba(variant, resolveMediaContent(ct), neutralPalette);

    const highVal = contentRgba('high', defaultContentVariant);
    const mediumVal = contentRgba('medium', defaultContentVariant);
    const lowVal = contentRgba('low', defaultContentVariant);
    const tintedVal = contentRgba('tinted', defaultContentVariant);
    const tintedA11yVal = contentRgba('tintedA11y', defaultContentVariant);
    const strokeMediumVal = contentRgba('strokeMedium', defaultContentVariant);
    const strokeLowVal = contentRgba('strokeLow', defaultContentVariant);

    const onBoldHighVal = contentRgba('high', boldContentVariant);
    const onBoldMediumVal = contentRgba('medium', boldContentVariant);
    const onBoldLowVal = contentRgba('low', boldContentVariant);
    const onBoldTintedVal = contentRgba('tinted', boldContentVariant);
    const onBoldTintedA11yVal = contentRgba('tintedA11y', boldContentVariant);

    const onSubtleHighVal = contentRgba('high', subtleContentVariant);
    const onSubtleMediumVal = contentRgba('medium', subtleContentVariant);
    const onSubtleTintedVal = contentRgba('tinted', subtleContentVariant);
    const onSubtleTintedA11yVal = contentRgba('tintedA11y', subtleContentVariant);

    // --- Surface-Fill-* (root-only tokens that Surface.module.css reads) ---
    inner.push('/* Surface fills — Surface component reads these */');
    inner.push(`--Surface-Fill-Default: ${resolved.default.fill};`);
    inner.push(`--Surface-Fill-Ghost: ${resolved.ghost.fill};`);
    inner.push(`--Surface-Fill-Minimal: ${resolved.minimal.fill};`);
    inner.push(`--Surface-Fill-Subtle: ${resolved.subtle.fill};`);
    inner.push(`--Surface-Fill-Moderate: ${resolved.moderate.fill};`);
    inner.push(`--Surface-Fill-Bold: ${resolved.bold.fill};`);
    inner.push(`--Surface-Fill-Elevated: ${resolved.elevated.fill};`);
    inner.push(`--Surface-Fill-Blend: ${resolved.blend.fill};`);

    // --- Legacy --Surface-* aliases (widely used in component fallback chains) ---
    inner.push('/* Legacy Surface-* aliases */');
    inner.push(`--Surface-Default: ${resolved.default.fill};`);
    inner.push(`--Surface-Main: ${resolved.default.fill};`);
    inner.push(`--Surface-Halo-Gap: ${resolved.default.fill};`);
    inner.push(`--Surface-Ghost: ${resolved.ghost.fill};`);
    inner.push(`--Surface-Minimal: ${resolved.minimal.fill};`);
    inner.push(`--Surface-Subtle: ${resolved.subtle.fill};`);
    inner.push(`--Surface-Bold: ${resolved.bold.fill};`);
    inner.push(`--Surface-Elevated: ${resolved.elevated.fill};`);
    inner.push(`--Surface-Blend: ${resolved.blend.fill};`);

    // --- Surface-context-INDEPENDENT tokens (root [ctx] block) ---
    //
    // These tokens depend on the *transparent material context itself*, not
    // on which surface mode an element happens to be — so they're safe to
    // emit on every transparent element. Plain role content tokens
    // (--{Role}-High/TintedA11y/etc.) are emitted as aliases through
    // inherited --Text-Material-* carriers rather than direct values: this
    // keeps transparent material role-agnostic at the top level while still
    // allowing non-establishing descendants to inherit the nearest
    // establishing ancestor's contrast direction.
    //
    // On-bold / on-subtle content tokens (`--{Role}-Bold-High`, `--{Role}-
    // Subtle-Tinted`) belong here too: they describe text rendered on a
    // *fixed-variant* fill (a Button with `variant="bold"`), independent
    // of the surface context above it.
    inner.push('/* Legacy Text-OnBold alias */');
    inner.push(`--Text-OnBold-High: ${onBoldHighVal};`);

    // --- Per-role remaps (all roles collapse to the same transparent values
    //     — intentional; transparent material is role-agnostic by spec). ---
    for (const role of TRANSPARENT_ROLE_LABELS) {
      inner.push(`/* ${role} role */`);
      // Surface fills — what an element renders when it adopts this role's
      // variant background. Independent of surface context.
      inner.push(`--${role}-Default: ${resolved.default.fill};`);
      inner.push(`--${role}-Ghost: ${resolved.ghost.fill};`);
      inner.push(`--${role}-Minimal: ${resolved.minimal.fill};`);
      inner.push(`--${role}-Subtle: ${resolved.subtle.fill};`);
      inner.push(`--${role}-Moderate: ${resolved.moderate.fill};`);
      inner.push(`--${role}-Bold: ${resolved.bold.fill};`);
      inner.push(`--${role}-Elevated: ${resolved.elevated.fill};`);
      inner.push(`--${role}-Blend: ${resolved.blend.fill};`);
      // Role content aliases — neutral fallbacks at the material root,
      // inherited carrier values inside establishing transparent surfaces.
      inner.push(`--${role}-High: var(--Text-Material-High, ${highVal});`);
      inner.push(`--${role}-Medium-Text: var(--Text-Material-Medium, ${mediumVal});`);
      inner.push(`--${role}-Low: var(--Text-Material-Low, ${lowVal});`);
      inner.push(`--${role}-Tinted: var(--Text-Material-Tinted, ${tintedVal});`);
      inner.push(`--${role}-TintedA11y: var(--Text-Material-TintedA11y, ${tintedA11yVal});`);
      inner.push(`--${role}-Stroke-Medium: var(--Text-Material-Stroke-Medium, ${strokeMediumVal});`);
      inner.push(`--${role}-Stroke-Low: var(--Text-Material-Stroke-Low, ${strokeLowVal});`);
      // On-bold content — text on a {role}-bold variant fill. Surface-
      // context-independent (depends on the *own* variant, not the parent).
      inner.push(`--${role}-Bold-High: ${onBoldHighVal};`);
      inner.push(`--${role}-Bold-Medium: ${onBoldMediumVal};`);
      inner.push(`--${role}-Bold-Low: ${onBoldLowVal};`);
      inner.push(`--${role}-Bold-Tinted: ${onBoldTintedVal};`);
      inner.push(`--${role}-Bold-TintedA11y: ${onBoldTintedA11yVal};`);
      // On-subtle content — same: text on a {role}-subtle variant fill.
      inner.push(`--${role}-Subtle-High: ${onSubtleHighVal};`);
      inner.push(`--${role}-Subtle-Medium: ${onSubtleMediumVal};`);
      inner.push(`--${role}-Subtle-Tinted: ${onSubtleTintedVal};`);
      inner.push(`--${role}-Subtle-TintedA11y: ${onSubtleTintedA11yVal};`);
      // Interaction overlays per surface token (own-variant, not surface-context).
      const hoverDefault = resolveMediaInteraction('hover', 'default', context);
      const pressedDefault = resolveMediaInteraction('pressed', 'default', context);
      const hoverBold = resolveMediaInteraction('hover', 'bold', context);
      const pressedBold = resolveMediaInteraction('pressed', 'bold', context);
      const hoverSubtle = resolveMediaInteraction('hover', 'subtle', context);
      const pressedSubtle = resolveMediaInteraction('pressed', 'subtle', context);
      inner.push(
        `--${role}-Hover: ${formatRgba(hoverDefault.variant, hoverDefault.opacityStep, neutralPalette)};`
      );
      inner.push(
        `--${role}-Pressed: ${formatRgba(pressedDefault.variant, pressedDefault.opacityStep, neutralPalette)};`
      );
      inner.push(
        `--${role}-Bold-Hover: ${formatRgba(hoverBold.variant, hoverBold.opacityStep, neutralPalette)};`
      );
      inner.push(
        `--${role}-Bold-Pressed: ${formatRgba(pressedBold.variant, pressedBold.opacityStep, neutralPalette)};`
      );
      inner.push(
        `--${role}-Subtle-Hover: ${formatRgba(hoverSubtle.variant, hoverSubtle.opacityStep, neutralPalette)};`
      );
      inner.push(
        `--${role}-Subtle-Pressed: ${formatRgba(pressedSubtle.variant, pressedSubtle.opacityStep, neutralPalette)};`
      );
    }

    // --- Focus ring (solid colour from informative scale — no opacity) ---
    inner.push('/* Focus ring — always informative scale, solid */');
    const focus = resolveMediaFocusRing(context, informativeScale, darkMode);
    const ringHex = informativeScale.palette[focus.ring.step] ?? '#0066ff';
    inner.push(`--Focus-Outline: ${solidSurfaceHex(ringHex)};`);

    blocks.push(
      `  [data-material="transparent"][data-media="${context}"] {\n    ${inner.join('\n    ')}\n  }`
    );

    // --- Per-establishing-surface content tokens ---
    //
    // The root [ctx] block above intentionally OMITS direct
    // surface-context-dependent text carriers (--Text-*, --Text-Material-*).
    // Role content tokens on that root block are only aliases with neutral
    // fallbacks. We emit the concrete carriers here per surface mode so CSS
    // custom-property inheritance does the "nearest establishing ancestor
    // wins" work for us — no descendant-combinator propagation rules,
    // no source-order tiebreaks, no combinatorial reset chains.
    //
    // A surface "establishes" iff its own fill alpha is high enough that
    // the visible backdrop is dominated by the surface itself rather than
    // by ancestors. Threshold: alpha ≥ ~0.4. Below that, the surface is
    // largely see-through and the nearest establishing ancestor's content
    // variant remains the right answer; the surface gets no rule and
    // inherits.
    //
    //   bold     α 1.00  always establishes  → boldContentVariant
    //   blend    α 1.00  always establishes  → defaultContentVariant
    //                                          (blend's own contentVariant
    //                                          matches default in every media)
    //   moderate α 0.62  always establishes  → defaultContentVariant
    //   subtle   α 0.46 (dynamic) / 0.21 (dark, light)
    //                    establishes in dynamic only → defaultContentVariant
    //   minimal  α 0.21 / 0.13                       inherits
    //   elevated α 0.21                              inherits
    //   ghost    α 0                                 inherits
    //   default  α 0                                 inherits
    //
    // Default is *not* in the establishing set even though MEDIA_SURFACE
    // assigns it a contentVariant. Reason: default's fill is fully
    // transparent (alpha 0) — it never dominates a visible backdrop. When
    // default sits inside a bold/moderate ancestor, the ancestor's
    // backdrop shows through, so the ancestor's content variant is what's
    // visually correct. At the page root (no transparent ancestor), the
    // page's solid :root --Text-* / --{Role}-* tokens take over via
    // standard custom-property inheritance — those carry the theme's
    // correct page-level text colour.
    //
    // Selector specificity: `[data-surface="X"][data-material][data-media]`
    // (0,3,0) beats the root [ctx] block (0,2,0), so the per-surface
    // values override whatever the root would otherwise contribute. Each
    // establishing element sets the inheritance anchor for its subtree.
    type EstablishingMode = 'bold' | 'blend' | 'moderate' | 'subtle';
    const ESTABLISHING_BY_CONTEXT: Record<MediaContext, readonly EstablishingMode[]> = {
      dynamic: ['bold', 'blend', 'moderate', 'subtle'],
      dark:    ['bold', 'blend', 'moderate'],
      light:   ['bold', 'blend', 'moderate'],
    };
    const establishingModes = ESTABLISHING_BY_CONTEXT[context];
    const variantFor = (mode: EstablishingMode): MaterialVariant =>
      mode === 'bold' ? boldContentVariant : defaultContentVariant;

    for (const mode of establishingModes) {
      const variant = variantFor(mode);
      const hi = contentRgba('high', variant);
      const med = contentRgba('medium', variant);
      const lo = contentRgba('low', variant);
      const tinted = contentRgba('tinted', variant);
      const tintedA11y = contentRgba('tintedA11y', variant);
      const sMed = contentRgba('strokeMedium', variant);
      const sLow = contentRgba('strokeLow', variant);

      const modeInner: string[] = [];
      modeInner.push(`/* Legacy Text-* aliases (${mode}-scoped) */`);
      modeInner.push(`--Text-High: ${hi};`);
      modeInner.push(`--Text-Medium: ${med};`);
      modeInner.push(`--Text-Low: ${lo};`);
      modeInner.push(`--Text-Medium-Stroke: ${sMed};`);
      modeInner.push(`--Text-Low-Stroke: ${sLow};`);
      modeInner.push(`--Text-Material-High: ${hi};`);
      modeInner.push(`--Text-Material-Medium: ${med};`);
      modeInner.push(`--Text-Material-Low: ${lo};`);
      modeInner.push(`--Text-Material-Tinted: ${tinted};`);
      modeInner.push(`--Text-Material-TintedA11y: ${tintedA11y};`);
      modeInner.push(`--Text-Material-Stroke-Medium: ${sMed};`);
      modeInner.push(`--Text-Material-Stroke-Low: ${sLow};`);
      for (const role of TRANSPARENT_ROLE_LABELS) {
        modeInner.push(`/* ${role} content (${mode}-scoped) */`);
        modeInner.push(`--${role}-High: ${hi};`);
        modeInner.push(`--${role}-Medium-Text: ${med};`);
        modeInner.push(`--${role}-Low: ${lo};`);
        modeInner.push(`--${role}-Tinted: ${tinted};`);
        modeInner.push(`--${role}-TintedA11y: ${tintedA11y};`);
        modeInner.push(`--${role}-Stroke-Medium: ${sMed};`);
        modeInner.push(`--${role}-Stroke-Low: ${sLow};`);
      }

      // Two selector forms: compound (Surface emits all three attrs on one
      // element — the normal case) and descendant (raw-DOM consumers that
      // mount the material wrapper as a separate node from the surface
      // marker). Same payload either way.
      const ctxAttrs = `[data-material="transparent"][data-media="${context}"]`;
      const compoundSel = `${ctxAttrs}[data-surface="${mode}"]`;
      const descendantSel = `${ctxAttrs} [data-surface="${mode}"]`;
      blocks.push(
        `  ${compoundSel},\n  ${descendantSel} {\n    ${modeInner.join('\n    ')}\n  }`,
      );
    }
  }

  return blocks.join('\n');
}

// ============================================================================
// Complete Pipeline
// ============================================================================

/**
 * Generate the complete CSS output for a theme — root tokens + context blocks +
 * context-boundary reset block + transparent material blocks.
 *
 * @param themeConfig - Maps appearance role names → scale definitions
 * @param theme - 'light' or 'dark'
 * @returns rootCSS for :root, contextCSS for [data-surface] blocks,
 *          boundaryCSS for the [data-context-boundary] reset block,
 *          transparentCSS for [data-material="transparent"] blocks
 */
export function generateFullCSS(
  themeConfig: ThemeConfig,
  theme: 'light' | 'dark'
): {
  rootCSS: string;
  contextCSS: string;
  boundaryCSS: string;
  transparentCSS: string;
  tokenCount: number;
  contextTokenCount: number;
  boundaryTokenCount: number;
  transparentTokenCount: number;
} {
  const darkMode = theme === 'dark';
  const outerParentStep = darkMode ? 200 : 2500;

  // Root CSS — multi-role tokens for the default page surface
  const multiRole = resolveMultiRoleTokenSets(themeConfig, outerParentStep, darkMode);
  const rootCSS = generateMultiRoleRootCSS(multiRole, theme);

  // Context CSS — [data-surface] remapping blocks
  const contextCSS = generateSurfaceContextCSS(themeConfig, outerParentStep, darkMode);

  // Context boundary CSS — [data-context-boundary] reset block. Inverse of
  // the [data-surface] cascade for surface-immune children.
  const boundaryCSS = generateContextBoundaryCSS(themeConfig);

  // Transparent material CSS — [data-material="transparent"][data-media="..."] blocks
  const transparentCSS = generateTransparentMaterialCSS(themeConfig, darkMode);

  // Count declarations (lines containing ':')
  const tokenCount = (rootCSS.match(/:/g) || []).length;
  const contextTokenCount = (contextCSS.match(/:/g) || []).length;
  const boundaryTokenCount = (boundaryCSS.match(/:/g) || []).length;
  const transparentTokenCount = (transparentCSS.match(/:/g) || []).length;

  return {
    rootCSS,
    contextCSS,
    boundaryCSS,
    transparentCSS,
    tokenCount,
    contextTokenCount,
    boundaryTokenCount,
    transparentTokenCount,
  };
}
