import { describe, it, expect } from 'vitest';
import {
  roleLabel,
  generateRoleCSS,
  generateBackwardCompatAliases,
  dedupeDeclarationsKeepLast,
  generateMultiRoleRootCSS,
  generateSurfaceContextCSS,
  generateSurfaceStepLookupCSS,
  generateSurfaceStepLookupCSSSplit,
  generateAppearanceRedirectCSS,
  generateContextBoundaryCSS,
  generateTransparentMaterialCSS,
  generateFullCSS,
} from '../cssGenNew';
import {
  STEPS,
  resolveTokenSet,
  resolveMultiRoleTokenSets,
  resolveSurfaceStep,
  buildScaleDefinition,
  type ScaleDefinition,
  type ThemeConfig,
} from '../surfaceNew';
import type { ColorPalette } from '../colorMath';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Resolve a custom-property value at a given (step, theme) by walking the
 * generated CSS in source order and applying cascade rules. Shape-tolerant:
 * works against the legacy per-step emitter and the grouped-stepSet emitter
 * (Approach B).
 *
 * @param theme  When 'light' or 'dark', a rule prefixed with `[data-mode="X"]`
 *               only matches when X equals theme. When undefined, the resolver
 *               picks theme-agnostic rules only (no `[data-mode]` prefix).
 */
function resolveTokenAtStep(
  css: string,
  step: number,
  token: string,
  theme?: 'light' | 'dark',
): string | undefined {
  const ruleRe = /([^{}]+)\{([^}]*)\}/g;
  let resolved: string | undefined;
  for (const m of css.matchAll(ruleRe)) {
    const selectorList = m[1];
    const body = m[2];
    if (!ruleMatchesStepAndTheme(selectorList, step, theme)) continue;
    const declRe = new RegExp(
      `${token.replace(/[-]/g, '\\-')}:\\s*([^;]+);`,
    );
    const dm = body.match(declRe);
    if (dm) resolved = dm[1].trim();
  }
  return resolved;
}

function ruleMatchesStepAndTheme(
  selectorList: string,
  step: number,
  theme: 'light' | 'dark' | undefined,
): boolean {
  for (const raw of selectorList.split(',')) {
    const sel = raw.trim();
    if (sel === ':root') {
      // :root applies regardless of theme. Theme-resolved lookups still pick
      // it up because :root is a cascade base for everything.
      return true;
    }
    const stepM = /\[data-surface-step="(\d+)"\]/.exec(sel);
    if (!stepM) continue;
    if (parseInt(stepM[1], 10) !== step) continue;
    const themeM = /\[data-mode="(light|dark)"\]/.exec(sel);
    if (theme === undefined) {
      // Caller wants the theme-agnostic value — skip rules with [data-mode].
      if (themeM) continue;
      return true;
    }
    // Theme-resolved lookup: prefer matching-theme rule; fall through if not.
    if (!themeM) return true; // theme-agnostic rule applies under any theme
    if (themeM[1] === theme) return true;
  }
  return false;
}

function expandHex(value: string): string {
  // Normalize #RGB → #RRGGBB so palette-equality assertions still work after
  // Approach E hex shortening.
  const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  return m ? `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}` : value;
}

function buildGreyscalePalette(): ColorPalette {
  const palette: ColorPalette = {};
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const t = i / (STEPS.length - 1);
    const v = Math.round(t * 255);
    palette[step] = `#${v.toString(16).padStart(2, '0').repeat(3)}`;
  }
  return palette;
}

function buildColoredPalette(): ColorPalette {
  const palette: ColorPalette = {};
  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    const t = i / (STEPS.length - 1);
    const r = Math.round(Math.min(255, t * 300));
    const g = Math.round(t * 200);
    const b = Math.round(t * 150);
    palette[step] = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return palette;
}

function buildArgbPackedPalette(): ColorPalette {
  const source = buildColoredPalette();
  const palette: ColorPalette = {};
  for (const step of STEPS) {
    palette[step] = `#FF${source[step]!.slice(1)}`;
  }
  return palette;
}

function buildTestTheme(): ThemeConfig {
  const greyPalette = buildGreyscalePalette();
  const colorPalette = buildColoredPalette();
  return {
    appearances: {
      neutral: buildScaleDefinition('grey', greyPalette, 1300),
      primary: buildScaleDefinition('indigo', colorPalette, 1400),
    },
  };
}

function buildFullTheme(): ThemeConfig {
  const greyPalette = buildGreyscalePalette();
  const colorPalette = buildColoredPalette();
  return {
    appearances: {
      neutral: buildScaleDefinition('grey', greyPalette, 1300),
      primary: buildScaleDefinition('indigo', colorPalette, 1400),
      secondary: buildScaleDefinition('saffron', colorPalette, 1500),
      sparkle: buildScaleDefinition('green', colorPalette, 1400),
      positive: buildScaleDefinition('green', greyPalette, 1400),
      negative: buildScaleDefinition('red', colorPalette, 1200),
      warning: buildScaleDefinition('orange', colorPalette, 1500),
      informative: buildScaleDefinition('sky', greyPalette, 1400),
    },
  };
}

// ============================================================================
// roleLabel
// ============================================================================

describe('roleLabel', () => {
  it('capitalizes single-word roles', () => {
    expect(roleLabel('primary')).toBe('Primary');
    expect(roleLabel('neutral')).toBe('Neutral');
  });

  it('capitalizes hyphenated roles', () => {
    expect(roleLabel('brand-bg')).toBe('Brand-Bg');
  });
});

// ============================================================================
// generateRoleCSS
// ============================================================================

describe('generateRoleCSS', () => {
  const palette = buildGreyscalePalette();
  const scale = buildScaleDefinition('test', palette, 1400);
  const tokenSet = resolveTokenSet(scale, 2500, false);

  it('generates the unified token set (8 surface + 7 content + 5 on-bold + 4 on-subtle + 6 state = 30)', () => {
    const css = generateRoleCSS('Primary', tokenSet);
    expect(css.length).toBe(30);
  });

  it('emits both Bold-Tinted and Bold-TintedA11y (3.0:1 and 4.5:1 on-bold tinted variants)', () => {
    const css = generateRoleCSS('Primary', tokenSet);
    const names = css.map(d => d.split(':')[0]);
    expect(names).toContain('--Primary-Bold-Tinted');
    expect(names).toContain('--Primary-Bold-TintedA11y');
    expect(names).toContain('--Primary-Subtle-Tinted');
    expect(names).toContain('--Primary-Subtle-TintedA11y');
  });

  it('uses correct token naming for surfaces', () => {
    const css = generateRoleCSS('Primary', tokenSet);
    const tokenNames = css.map(d => d.split(':')[0]);
    expect(tokenNames).toContain('--Primary-Default');
    expect(tokenNames).toContain('--Primary-Ghost');
    expect(tokenNames).toContain('--Primary-Minimal');
    expect(tokenNames).toContain('--Primary-Subtle');
    expect(tokenNames).toContain('--Primary-Moderate');
    expect(tokenNames).toContain('--Primary-Bold');
    expect(tokenNames).toContain('--Primary-Elevated');
  });

  it('uses correct token naming for content', () => {
    const css = generateRoleCSS('Primary', tokenSet);
    const tokenNames = css.map(d => d.split(':')[0]);
    expect(tokenNames).toContain('--Primary-High');
    expect(tokenNames).toContain('--Primary-Medium-Text');
    expect(tokenNames).toContain('--Primary-Low');
    expect(tokenNames).toContain('--Primary-Tinted');
    expect(tokenNames).toContain('--Primary-TintedA11y');
    expect(tokenNames).toContain('--Primary-Stroke-Medium');
    expect(tokenNames).toContain('--Primary-Stroke-Low');
  });

  it('uses correct token naming for states', () => {
    const css = generateRoleCSS('Primary', tokenSet);
    const tokenNames = css.map(d => d.split(':')[0]);
    expect(tokenNames).toContain('--Primary-Hover');
    expect(tokenNames).toContain('--Primary-Pressed');
    expect(tokenNames).toContain('--Primary-Bold-Hover');
    expect(tokenNames).toContain('--Primary-Bold-Pressed');
    expect(tokenNames).toContain('--Primary-Subtle-Hover');
    expect(tokenNames).toContain('--Primary-Subtle-Pressed');
  });

  it('all values are valid hex colors', () => {
    const css = generateRoleCSS('Primary', tokenSet);
    for (const decl of css) {
      const value = decl.split(': ')[1]?.replace(';', '');
      expect(value).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('respects role label for different roles', () => {
    const css = generateRoleCSS('Neutral', tokenSet);
    const tokenNames = css.map(d => d.split(':')[0]);
    expect(tokenNames[0]).toContain('--Neutral-');
    expect(tokenNames).not.toContain('--Primary-Bold');
  });

  it('works with hyphenated role labels', () => {
    const css = generateRoleCSS('Brand-Bg', tokenSet);
    expect(css[0]).toMatch(/^--Brand-Bg-/);
  });
});

// ============================================================================
// generateBackwardCompatAliases
// ============================================================================

describe('generateBackwardCompatAliases', () => {
  const palette = buildGreyscalePalette();
  const scale = buildScaleDefinition('test', palette, 1400);
  const tokenSet = resolveTokenSet(scale, 2500, false);
  const aliases = generateBackwardCompatAliases(tokenSet);

  it('generates Surface-* aliases', () => {
    const names = aliases.filter(d => !d.startsWith('/*')).map(d => d.split(':')[0]);
    expect(names).toContain('--Surface-Default');
    expect(names).toContain('--Surface-Main');
    expect(names).toContain('--Surface-Minimal');
    expect(names).toContain('--Surface-Ghost');
    expect(names).toContain('--Surface-Subtle');
    expect(names).toContain('--Surface-Bold');
    expect(names).toContain('--Surface-Elevated');
  });

  it('emits --Surface-Halo-Gap defaulting to page background', () => {
    const haloGap = aliases.find(d => d.startsWith('--Surface-Halo-Gap:'));
    const surfaceMain = aliases.find(d => d.startsWith('--Surface-Main:'));
    expect(haloGap).toBeDefined();
    // Halo gap defaults to the page background colour at :root
    expect(haloGap?.split(':')[1]?.trim()).toBe(surfaceMain?.split(':')[1]?.trim());
  });

  it('does NOT emit legacy --Surface-FG-* / --Surface-BG-* aliases', () => {
    const names = aliases.filter(d => !d.startsWith('/*')).map(d => d.split(':')[0]);
    expect(names).not.toContain('--Surface-BG-Minimal');
    expect(names).not.toContain('--Surface-BG-Subtle');
    expect(names).not.toContain('--Surface-BG-Bold');
    expect(names).not.toContain('--Surface-FG-Minimal');
    expect(names).not.toContain('--Surface-FG-Subtle');
    expect(names).not.toContain('--Surface-FG-Bold');
  });

  it('generates Text-* aliases', () => {
    const names = aliases.filter(d => !d.startsWith('/*')).map(d => d.split(':')[0]);
    expect(names).toContain('--Text-High');
    expect(names).toContain('--Text-Medium');
    expect(names).toContain('--Text-Low');
    expect(names).toContain('--Text-OnBold-High');
  });

  it('generates state aliases', () => {
    const names = aliases.filter(d => !d.startsWith('/*')).map(d => d.split(':')[0]);
    expect(names).toContain('--Surface-Bold-Hover');
    expect(names).toContain('--Surface-Bold-Pressed');
    expect(names).toContain('--Surface-Subtle-Hover');
    expect(names).toContain('--Surface-Subtle-Pressed');
  });
});

// ============================================================================
// generateMultiRoleRootCSS
// ============================================================================

describe('generateMultiRoleRootCSS', () => {
  const theme = buildTestTheme();
  const multiRole = resolveMultiRoleTokenSets(theme, 2500, false);

  it('generates CSS for all configured roles', () => {
    const css = generateMultiRoleRootCSS(multiRole, 'light');
    expect(css).toContain('--Neutral-Bold:');
    expect(css).toContain('--Primary-Bold:');
  });

  it('includes backward-compat aliases', () => {
    const css = generateMultiRoleRootCSS(multiRole, 'light');
    expect(css).toContain('--Surface-Bold:');
    expect(css).toContain('--Text-High:');
  });

  it('uses neutral, not primary, for generic page surface and text aliases', () => {
    const darkMultiRole = resolveMultiRoleTokenSets(theme, 200, true);
    const css = generateMultiRoleRootCSS(darkMultiRole, 'dark');
    const neutral = darkMultiRole.roles['neutral']!;
    const primary = darkMultiRole.roles['primary']!;
    expect(css).toContain(`--Surface-Main: ${neutral.surfaces.default.hex};`);
    expect(css).toContain(`--Surface-Fill-Default: ${neutral.surfaces.default.hex};`);
    expect(css).not.toContain(`--Surface-Main: ${primary.surfaces.default.hex};`);
    expect(css).not.toContain(`--Surface-Fill-Default: ${primary.surfaces.default.hex};`);
    expect(css).toContain(`--Text-Medium: ${neutral.content.medium.blendedHex};`);
    expect(css).not.toContain(`--Text-Medium: ${primary.content.medium.blendedHex};`);
  });

  it('includes border tokens from neutral role', () => {
    const css = generateMultiRoleRootCSS(multiRole, 'light');
    expect(css).toContain('--Border-Subtle:');
    expect(css).toContain('--Border-Default:');
  });

  it('normalizes ARGB-packed role hex values before CSS emission', () => {
    const argbTheme: ThemeConfig = {
      appearances: {
        neutral: buildScaleDefinition('grey', buildArgbPackedPalette(), 1300),
        primary: buildScaleDefinition('blue', buildArgbPackedPalette(), 1400),
      },
    };
    const css = generateMultiRoleRootCSS(resolveMultiRoleTokenSets(argbTheme, 2500, false), 'light');

    expect(css).not.toMatch(/#[0-9a-fA-F]{8}\b/);
    expect(css.match(/--Surface-Bold:/g) ?? []).toHaveLength(1);
    expect(css.match(/--Primary-Fill-Bold:/g) ?? []).toHaveLength(1);
  });

  it('generates Primary-* aliases from neutral when no primary exists', () => {
    const neutralOnly: ThemeConfig = {
      appearances: {
        neutral: buildScaleDefinition('grey', buildGreyscalePalette(), 1300),
      },
    };
    const multiNeutral = resolveMultiRoleTokenSets(neutralOnly, 2500, false);
    const css = generateMultiRoleRootCSS(multiNeutral, 'light');
    expect(css).toContain('--Primary-Bold:');
  });

  it('emits --{Role}-Subtle-High/Medium/TintedA11y (on-subtle content)', () => {
    const css = generateMultiRoleRootCSS(multiRole, 'light');
    expect(css).toContain('--Primary-Subtle-High:');
    expect(css).toContain('--Primary-Subtle-Medium:');
    expect(css).toContain('--Primary-Subtle-TintedA11y:');
    expect(css).toContain('--Neutral-Subtle-High:');
  });

  it('emits --Focus-Outline from the informative role when present', () => {
    const fullTheme = buildFullTheme();
    const multi = resolveMultiRoleTokenSets(fullTheme, 2500, false);
    const css = generateMultiRoleRootCSS(multi, 'light');
    expect(css).toContain('--Focus-Outline:');
    // Focus outline should use the informative role's tintedA11y.
    const informative = multi.roles['informative']!;
    const expectedHex = informative.content.tintedA11y.opacity >= 1
      ? informative.content.tintedA11y.hex
      : informative.content.tintedA11y.blendedHex;
    expect(css).toContain(`--Focus-Outline: ${expectedHex};`);
  });

  it('--Focus-Outline falls back to primary or neutral when informative is missing', () => {
    const css = generateMultiRoleRootCSS(multiRole, 'light');
    // theme in this describe block has neutral + primary only (no informative)
    expect(css).toContain('--Focus-Outline:');
  });

  it('all declarations end with semicolons', () => {
    const css = generateMultiRoleRootCSS(multiRole, 'light');
    const lines = css.split('\n').filter(l => l.trim() && !l.trim().startsWith('/*'));
    for (const line of lines) {
      expect(line.trim()).toMatch(/;$/);
    }
  });
});

// ============================================================================
// generateSurfaceContextCSS
// ============================================================================

describe('generateSurfaceContextCSS', () => {
  const theme = buildTestTheme();

  it('generates blocks for 5 context surfaces', () => {
    const css = generateSurfaceContextCSS(theme, 2500, false);
    expect(css).toContain('[data-surface="minimal"]');
    expect(css).toContain('[data-surface="subtle"]');
    expect(css).toContain('[data-surface="moderate"]');
    expect(css).toContain('[data-surface="bold"]');
    expect(css).toContain('[data-surface="elevated"]');
  });

  it('does NOT generate blocks for default or ghost', () => {
    const css = generateSurfaceContextCSS(theme, 2500, false);
    expect(css).not.toContain('[data-surface="default"]');
    expect(css).not.toContain('[data-surface="ghost"]');
  });

  it('each context block contains only mode-specific tokens (role tokens come from step-lookup)', () => {
    const css = generateSurfaceContextCSS(theme, 2500, false);
    const boldBlock = css.split('[data-surface="bold"]')[1]?.split('[data-surface=')[0] ?? '';
    // The trimmed contract: only --Surface-Halo-Gap and --Focus-Outline are
    // emitted per mode. Role/content/state/alias tokens are covered by
    // [data-surface-step="N"] step-lookup blocks (verified by
    // scripts/audit-legacy-context-redundancy.ts).
    expect(boldBlock).toContain('--Surface-Halo-Gap:');
    expect(boldBlock).toContain('--Focus-Outline:');
    expect(boldBlock).not.toContain('--Primary-Bold:');
    expect(boldBlock).not.toContain('--Neutral-Bold:');
  });

  it('context blocks do NOT include legacy role-token aliases', () => {
    const css = generateSurfaceContextCSS(theme, 2500, false);
    // Backward-compat aliases (--Surface-*, --Text-*) and role tokens are
    // emitted in the step-keyed lookup instead. Keeping them out of the
    // legacy slice is the whole point of the Phase 2 trim.
    expect(css).not.toContain('--Surface-Bold:');
    expect(css).not.toContain('--Text-High:');
  });

  it('every context block remaps --Focus-Outline for the current surface', () => {
    const fullTheme = buildFullTheme();
    const css = generateSurfaceContextCSS(fullTheme, 2500, false);
    for (const surface of ['minimal', 'subtle', 'moderate', 'bold', 'elevated']) {
      const block = css.split(`[data-surface="${surface}"]`)[1]?.split('[data-surface=')[0] ?? '';
      expect(block).toContain('--Focus-Outline:');
    }
  });

  it('every context block remaps --Surface-Halo-Gap to its --Surface-Fill-* token', () => {
    const css = generateSurfaceContextCSS(theme, 2500, false);
    // Each [data-surface="<mode>"] block should set --Surface-Halo-Gap
    // pointing at var(--Surface-Fill-<Mode>) so the focus-halo gap matches
    // the actual container fill instead of the page background.
    const expectations: Array<[string, string]> = [
      ['minimal', 'var(--Surface-Fill-Minimal)'],
      ['subtle', 'var(--Surface-Fill-Subtle)'],
      ['moderate', 'var(--Surface-Fill-Moderate)'],
      ['bold', 'var(--Surface-Fill-Bold)'],
      ['elevated', 'var(--Surface-Fill-Elevated)'],
    ];
    for (const [mode, expected] of expectations) {
      const block = css.split(`[data-surface="${mode}"]`)[1]?.split('[data-surface=')[0] ?? '';
      expect(block).toContain(`--Surface-Halo-Gap: ${expected};`);
    }
  });

  it('focus-outline differs across context modes (computed against visible surface fill)', () => {
    const contextCSS = generateSurfaceContextCSS(theme, 2500, false);
    const grab = (mode: string) => {
      const block = contextCSS.split(`[data-surface="${mode}"]`)[1]?.split('[data-surface=')[0] ?? '';
      return block.match(/--Focus-Outline:\s*(#[0-9a-f]{3,6})/i)?.[1] ?? null;
    };
    const subtle = grab('subtle');
    const bold = grab('bold');
    expect(subtle).toBeTruthy();
    expect(bold).toBeTruthy();
    // The focus ring walks against the actual visible surface fill, so the
    // resolved color for a mid-tone bold surface differs from a near-page
    // subtle surface. If this ever collapses to equal, the focus-ring
    // computation has broken.
    expect(subtle).not.toBe(bold);
  });
});

// ============================================================================
// generateAppearanceRedirectCSS — RFC-0003 Item D
// ============================================================================

describe('generateAppearanceRedirectCSS', () => {
  it('emits one block per role, including primary (resets inheritance)', () => {
    const theme = buildFullTheme();
    const css = generateAppearanceRedirectCSS(theme);
    // 8 roles total (primary + 7 non-primary). Primary needs its own block
    // so a primary descendant of a non-primary ancestor breaks inheritance
    // of --Text-* set by the ancestor's redirect.
    const blocks = css.match(/\[data-surface\]\[data-appearance="[a-z-]+"\]/g) ?? [];
    expect(blocks.length).toBe(8);
    expect(css).toContain('[data-surface][data-appearance="primary"]');
    expect(css).toContain('[data-surface][data-appearance="secondary"]');
    expect(css).toContain('[data-surface][data-appearance="negative"]');
    // Must NOT match bare [data-appearance] — components self-emit that attr.
    expect(css).not.toMatch(/^\s*\[data-appearance="/m);
  });

  it('redirects --Text-* aliases to per-role tokens', () => {
    const theme = buildFullTheme();
    const css = generateAppearanceRedirectCSS(theme);
    // Spot-check the secondary block contains the expected redirects.
    expect(css).toContain('--Text-High: var(--Secondary-High);');
    expect(css).toContain('--Text-Medium: var(--Secondary-Medium-Text);');
    expect(css).toContain('--Text-Low: var(--Secondary-Low);');
    expect(css).toContain('--Text-Medium-Stroke: var(--Secondary-Stroke-Medium);');
    expect(css).toContain('--Text-Low-Stroke: var(--Secondary-Stroke-Low);');
    expect(css).toContain('--Text-OnBold-High: var(--Secondary-Bold-High);');
    expect(css).toContain('--Text-Hover: var(--Secondary-Hover);');
    expect(css).toContain('--Text-Minimal: var(--Secondary-Minimal);');
  });

  it('output stays small (~3 KB ceiling for full role set)', () => {
    const theme = buildFullTheme();
    const css = generateAppearanceRedirectCSS(theme);
    // 7 roles × 6 declarations × ~50 bytes ≈ 2.1 KB. Hard ceiling 4 KB.
    expect(Buffer.byteLength(css, 'utf8')).toBeLessThan(4 * 1024);
  });
});

// ============================================================================
// generateContextBoundaryCSS
// ============================================================================

describe('generateContextBoundaryCSS', () => {
  const theme = buildTestTheme();

  it('generates a single [data-context-boundary] block', () => {
    const css = generateContextBoundaryCSS(theme);
    // Single block, not per-role nested
    const matches = css.match(/\[data-context-boundary\]/g) ?? [];
    expect(matches.length).toBe(1);
    expect(css.startsWith('  [data-context-boundary] {')).toBe(true);
    expect(css.trimEnd().endsWith('}')).toBe(true);
  });

  it('emits Bold / Bold-High / Subtle / TintedA11y reset for every appearance role', () => {
    const css = generateContextBoundaryCSS(theme);
    for (const role of Object.keys(theme.appearances)) {
      const label = role.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('-');
      // The four context-remappable tokens are pinned to their root-only Fill-* equivalents
      expect(css).toContain(`--${label}-Bold: var(--${label}-Fill-Bold);`);
      expect(css).toContain(`--${label}-Bold-High: var(--${label}-Fill-Bold-High);`);
      expect(css).toContain(`--${label}-Subtle: var(--${label}-Fill-Subtle);`);
      expect(css).toContain(`--${label}-TintedA11y: var(--${label}-Fill-Subtle-TintedA11y);`);
    }
  });

  it('emits revert-layer for the slot-level -High icon remap pattern', () => {
    const css = generateContextBoundaryCSS(theme);
    for (const role of Object.keys(theme.appearances)) {
      const label = role.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('-');
      expect(css).toContain(`--${label}-High: revert-layer;`);
    }
    expect(css).toContain('--Text-High: revert-layer;');
    expect(css).toContain('--Text-Medium: revert-layer;');
  });

  it('does NOT redefine root-only Fill-* tokens (those must survive untouched)', () => {
    const css = generateContextBoundaryCSS(theme);
    // The block references Fill-* via var() but never reassigns them.
    // No declaration should look like `--Primary-Fill-Bold: <value>;`.
    expect(css).not.toMatch(/--Primary-Fill-Bold:\s*[^v]/);
    expect(css).not.toMatch(/--Primary-Fill-Bold-High:\s*[^v]/);
    expect(css).not.toMatch(/--Primary-Fill-Subtle:\s*[^v]/);
    expect(css).not.toMatch(/--Primary-Fill-Subtle-TintedA11y:\s*[^v]/);
  });

  it('returns empty string when themeConfig has no appearances', () => {
    const empty: ThemeConfig = { appearances: {} };
    expect(generateContextBoundaryCSS(empty)).toBe('');
  });

  it('block size scales linearly with role count (4 fill-pin + 1 revert per role + 2 Text reverts)', () => {
    const css = generateContextBoundaryCSS(theme);
    const roleCount = Object.keys(theme.appearances).length;
    const expectedDeclarations = roleCount * 4 + roleCount + 2; // fill pins + role-High reverts + 2 Text-* reverts
    const colonCount = (css.match(/:/g) ?? []).length;
    expect(colonCount).toBe(expectedDeclarations);
  });
});

// ============================================================================
// generateFullCSS
// ============================================================================

describe('generateFullCSS', () => {
  const theme = buildTestTheme();

  describe('light mode', () => {
    const result = generateFullCSS(theme, 'light');

    it('returns rootCSS and contextCSS', () => {
      expect(result.rootCSS).toBeTruthy();
      expect(result.contextCSS).toBeTruthy();
    });

    it('reports token counts', () => {
      expect(result.tokenCount).toBeGreaterThan(0);
      expect(result.contextTokenCount).toBeGreaterThan(0);
      expect(result.transparentTokenCount).toBeGreaterThan(0);
      expect(result.boundaryTokenCount).toBeGreaterThan(0);
    });

    it('returns transparentCSS alongside rootCSS + contextCSS', () => {
      expect(result.transparentCSS).toBeTruthy();
      expect(result.transparentCSS).toContain('[data-material="transparent"]');
    });

    it('returns boundaryCSS containing the [data-context-boundary] reset block', () => {
      expect(result.boundaryCSS).toBeTruthy();
      expect(result.boundaryCSS).toContain('[data-context-boundary]');
      expect(result.boundaryCSS).toContain('var(--Primary-Fill-Bold)');
    });

    it('root token count = roles × unified set + backward compat + border + focus', () => {
      // 2 roles × 29 (8 surface + 7 content + 4 on-bold + 4 on-subtle + 6 state)
      // + backward-compat (--Surface-*, --Text-*) + Fill tokens per role
      // + 2 border + --Focus-Outline. Total lands ~80-120 depending on roles configured.
      expect(result.tokenCount).toBeGreaterThanOrEqual(80);
      expect(result.tokenCount).toBeLessThan(200);
    });
  });

  describe('dark mode', () => {
    const result = generateFullCSS(theme, 'dark');

    it('generates valid CSS', () => {
      expect(result.rootCSS).toBeTruthy();
      expect(result.contextCSS).toBeTruthy();
    });

    it('root CSS contains dark-appropriate values', () => {
      // In dark mode, default surface should be step 200 (dark)
      // Primary-Default should be a dark hex
      expect(result.rootCSS).toContain('--Primary-Default:');
    });
  });

  describe('token count comparison with V4', () => {
    // V4: ~760 root tokens + ~1290 context tokens = ~2050 total
    // New: should be dramatically less
    const full = buildFullTheme();

    it('root tokens are under 500 (vs V4 ~760)', () => {
      // 8 roles × 45 (20 new + 25 V4 aliases) + backward compat = ~388
      const result = generateFullCSS(full, 'light');
      expect(result.tokenCount).toBeLessThan(500);
    });

    it('context tokens are under 2200 (vs V4 ~1290 — more per block due to V4 aliases)', () => {
      // 8 roles × 45 tokens × 5 contexts + backward-compat ≈ 1900
      const result = generateFullCSS(full, 'light');
      expect(result.contextTokenCount).toBeLessThan(2200);
    });

    it('total is under 2700 (vs V4 ~2050 — same ballpark with V4 compat aliases)', () => {
      const result = generateFullCSS(full, 'light');
      const total = result.tokenCount + result.contextTokenCount;
      expect(total).toBeLessThan(2700);
    });
  });

  describe('CSS output format', () => {
    const result = generateFullCSS(theme, 'light');

    it('context blocks use proper [data-surface] selectors', () => {
      expect(result.contextCSS).toMatch(/\[data-surface="bold"\]\s*\{/);
      expect(result.contextCSS).toMatch(/\[data-surface="subtle"\]\s*\{/);
    });

    it('all values are hex colors', () => {
      const allCSS = result.rootCSS + result.contextCSS;
      const values = allCSS.match(/:\s*(#[0-9a-f]+);/gi) || [];
      for (const v of values) {
        const hex = v.match(/#[0-9a-f]+/i)?.[0];
        if (hex) {
          expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
        }
      }
    });
  });
});

// ============================================================================
// generateTransparentMaterialCSS — remap emission
// ============================================================================

describe('generateTransparentMaterialCSS', () => {
  const theme = buildTestTheme();

  it('emits a block for every media context', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    expect(css).toContain('[data-material="transparent"][data-media="dynamic"]');
    expect(css).toContain('[data-material="transparent"][data-media="dark"]');
    expect(css).toContain('[data-material="transparent"][data-media="light"]');
  });

  it('remaps --Surface-Fill-* tokens (Surface.module.css reads these)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    // Each fill mode should be remapped inside every context block.
    for (const ctx of ['dynamic', 'dark', 'light']) {
      const block = css.split(`[data-material="transparent"][data-media="${ctx}"]`)[1]?.split('[data-material=')[0] ?? '';
      for (const mode of ['Default', 'Minimal', 'Subtle', 'Moderate', 'Bold', 'Elevated', 'Blend']) {
        expect(block).toMatch(new RegExp(`--Surface-Fill-${mode}:`));
      }
    }
  });

  it('emits surface-context-independent tokens on the root [ctx] block', () => {
    // Root [ctx] block holds tokens that do not directly depend on the
    // resolved surface mode an element happens to be: surface fills,
    // on-bold/on-subtle content (depends on own variant), interaction
    // overlays, on-bold legacy aliases, and role content aliases that point
    // through inherited --Text-Material-* carriers. Direct surface-context-
    // dependent text carriers live on per-establishing-surface blocks so CSS
    // inheritance handles nearest-ancestor-wins.
    const css = generateTransparentMaterialCSS(theme, false);
    const root = css
      .split('[data-material="transparent"][data-media="dynamic"] {')[1]
      ?.split('}')[0] ?? '';
    expect(root).toContain('--Surface-Bold:');
    expect(root).toContain('--Surface-Blend:');
    expect(root).toContain('--Surface-Subtle:');
    expect(root).toContain('--Text-OnBold-High:');
    // Per-role surface fills + role content aliases + on-bold/on-subtle
    // content (own-variant) live here.
    for (const role of ['Primary', 'Neutral', 'Secondary', 'Sparkle', 'Brand-Bg', 'Informative']) {
      expect(root).toContain(`--${role}-Bold:`);
      expect(root).toContain(`--${role}-Blend:`);
      expect(root).toContain(`--${role}-Subtle:`);
      expect(root).toContain(`--${role}-High: var(--Text-Material-High,`);
      expect(root).toContain(`--${role}-TintedA11y: var(--Text-Material-TintedA11y,`);
      expect(root).toContain(`--${role}-Bold-High:`);
      expect(root).toContain(`--${role}-Subtle-High:`);
    }
    // Direct surface-context-dependent text carriers must NOT appear on the
    // root block, otherwise non-establishing descendants would block
    // inheritance from the nearest establishing ancestor.
    expect(root).not.toContain('--Text-High:');
    expect(root).not.toContain('--Text-Medium:');
    expect(root).not.toContain('--Text-Low:');
    expect(root).not.toContain('--Text-Material-High:');
    expect(root).not.toContain('--Text-Material-TintedA11y:');
  });

  it('makes low-emphasis role fills see-through (default transparent, subtle translucent)', () => {
    // The real "transparent runs white" contract: the low-emphasis surfaces a
    // button can adopt must composite over the media rather than paint an opaque
    // fill. Per the MEDIA_SURFACE spec, default/ghost are fully transparent
    // (alpha 0) and subtle/minimal/moderate are translucent rgba. Bold/blend are
    // the intentional SOLID anchor (opaque) and are deliberately not asserted
    // here. Locking the values prevents a regression where transparent silently
    // re-opaques the see-through surfaces (which reads as "white").
    const css = generateTransparentMaterialCSS(theme, false);
    const root = css
      .split('[data-material="transparent"][data-media="dynamic"] {')[1]
      ?.split('}')[0] ?? '';
    const grab = (name: string) =>
      root.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim() ?? '';
    for (const role of ['Primary', 'Neutral', 'Secondary']) {
      // Default surface is fully see-through.
      expect(grab(`--${role}-Default`)).toBe('transparent');
      // Subtle surface is a translucent rgba composite (fractional alpha < 1).
      const subtle = grab(`--${role}-Subtle`);
      expect(subtle).toMatch(/^rgba\(/);
      expect(subtle).toMatch(/,\s*0?\.\d+\)$/);
    }
  });

  it('neutralizes role content aliases without blocking establishing-surface inheritance', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    const root = css
      .split('[data-material="transparent"][data-media="dynamic"] {')[1]
      ?.split('}')[0] ?? '';

    // The screenshot regression: a secondary subtle/ghost button reads
    // --Secondary-TintedA11y. At the transparent material root that token
    // must not fall through to the solid brand's orange secondary value; it
    // aliases through an inherited neutral material carrier instead.
    expect(root).toContain('--Secondary-TintedA11y: var(--Text-Material-TintedA11y,');
    expect(root).toContain('--Secondary-Stroke-Low: var(--Text-Material-Stroke-Low,');

    const boldSel = '[data-material="transparent"][data-media="dynamic"][data-surface="bold"]';
    const boldBody = css.split(boldSel)[1]?.split('}')[0] ?? '';
    expect(boldBody).toContain('--Text-Material-TintedA11y:');
    expect(boldBody).toContain('--Text-Material-Stroke-Low:');

    // Non-establishing surfaces still have no direct block; their root alias
    // values resolve through inherited --Text-Material-* carriers.
    expect(css).not.toContain('[data-material="transparent"][data-media="dynamic"][data-surface="ghost"] {');
  });

  it('emits per-establishing-surface blocks; non-establishing surfaces inherit via custom-property cascade', () => {
    // CSS inheritance does "nearest-ancestor-wins" automatically: each
    // establishing surface sets --Text-* / --{Role}-content on its
    // element, and non-establishing descendants inherit from the nearest
    // establishing ancestor. No descendant-combinator propagation rules.
    //
    // Establishing set is per-media-context. A surface establishes iff
    // its own fill alpha (from MEDIA_SURFACE.opacityStep) is high enough
    // that the visible backdrop is dominated by the surface itself
    // rather than by ancestors. Threshold ≈ alpha 0.4.
    const css = generateTransparentMaterialCSS(theme, false);
    const ESTABLISHING_BY_CTX = {
      dynamic: ['bold', 'blend', 'moderate', 'subtle'],
      dark:    ['bold', 'blend', 'moderate'],
      light:   ['bold', 'blend', 'moderate'],
    } as const;
    const ALL_SURFACES = ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'] as const;

    for (const ctx of ['dynamic', 'dark', 'light'] as const) {
      const ctxAttrs = `[data-material="transparent"][data-media="${ctx}"]`;
      const establishing = ESTABLISHING_BY_CTX[ctx];
      const nonEstablishing = ALL_SURFACES.filter((s) => !(establishing as readonly string[]).includes(s));

      for (const mode of establishing) {
        // Compound (same element — the normal Surface emission).
        expect(css).toContain(`${ctxAttrs}[data-surface="${mode}"]`);
        // Descendant (raw-DOM consumers mounting wrapper as a separate node).
        expect(css).toContain(`${ctxAttrs} [data-surface="${mode}"]`);
      }
      // Non-establishing surfaces have NO per-surface rule — they inherit
      // from the nearest establishing ancestor (or page :root at the top).
      for (const mode of nonEstablishing) {
        expect(css).not.toContain(`${ctxAttrs}[data-surface="${mode}"] {`);
      }
    }
  });

  it('remaps --Focus-Outline to a solid informative colour (no opacity)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    // One focus outline per context block. Must be a hex (solid), not rgba.
    const matches = [...css.matchAll(/--Focus-Outline:\s*([^;]+);/g)];
    expect(matches.length).toBe(3);
    for (const m of matches) {
      expect(m[1].trim()).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('transparent fill values are rgba() or transparent (not hex)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    // Every --Surface-Fill-* and --Surface-Bold value inside a transparent block
    // should be either rgba(), transparent, or a hex (when fully opaque — bold at step 100).
    const surfaceFills = [...css.matchAll(/--Surface-Fill-\w+:\s*([^;]+);/g)];
    for (const m of surfaceFills) {
      const val = m[1].trim();
      expect(val).toMatch(/^(rgba\([^)]+\)|#[0-9a-f]{6}|transparent)$/i);
    }
    expect(surfaceFills.length).toBeGreaterThan(0);
  });

  it('default surface resolves to `transparent` inside every context', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    for (const ctx of ['dynamic', 'dark', 'light']) {
      const block = css.split(`[data-material="transparent"][data-media="${ctx}"]`)[1]?.split('[data-material=')[0] ?? '';
      const m = block.match(/--Surface-Fill-Default:\s*([^;]+);/);
      expect(m?.[1].trim()).toBe('transparent');
    }
  });

  it('bold surface is a solid hex inside every context (opacityStep 100 → alpha 1)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    for (const ctx of ['dynamic', 'dark', 'light']) {
      const block = css.split(`[data-material="transparent"][data-media="${ctx}"]`)[1]?.split('[data-material=')[0] ?? '';
      const m = block.match(/--Surface-Fill-Bold:\s*([^;]+);/);
      expect(m?.[1].trim()).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('blend surface is a solid hex inside every context (opacityStep 100 → alpha 1)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    for (const ctx of ['dynamic', 'dark', 'light']) {
      const block = css.split(`[data-material="transparent"][data-media="${ctx}"]`)[1]?.split('[data-material=')[0] ?? '';
      const m = block.match(/--Surface-Fill-Blend:\s*([^;]+);/);
      expect(m?.[1].trim()).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('does NOT emit namespaced --Surface-Transparent-* tokens (dead vocabulary)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    expect(css).not.toContain('--Surface-Transparent-');
  });

  it('focus ring differs between light and dark modes (base vs darkerBase)', () => {
    const lightCss = generateTransparentMaterialCSS(theme, false);
    const darkCss = generateTransparentMaterialCSS(theme, true);
    const lightFocus = lightCss.match(/--Focus-Outline:\s*([^;]+);/)?.[1];
    const darkFocus = darkCss.match(/--Focus-Outline:\s*([^;]+);/)?.[1];
    expect(lightFocus).not.toBe(darkFocus);
  });

  it('returns empty string when theme has no neutral or primary scale', () => {
    const empty: ThemeConfig = { appearances: {} };
    expect(generateTransparentMaterialCSS(empty, false)).toBe('');
  });

  it('emits --Surface-Fill-Ghost inside every context (ghost is fully transparent in spec)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    for (const ctx of ['dynamic', 'dark', 'light']) {
      const block = css.split(`[data-material="transparent"][data-media="${ctx}"]`)[1]?.split('[data-material=')[0] ?? '';
      const m = block.match(/--Surface-Fill-Ghost:\s*([^;]+);/);
      expect(m?.[1].trim()).toBe('transparent');
    }
  });

  it('bold-scoped --Text-High differs from moderate-scoped --Text-High in every context (proves contentVariant flip)', () => {
    // Bold's contentVariant differs from default's in every media context.
    // Both establishing surfaces emit their own --Text-High; the bold value
    // must not equal the moderate value, which proves the per-surface
    // emission picks up the variant flip rather than collapsing to a single
    // value at the root.
    const css = generateTransparentMaterialCSS(theme, false);
    for (const ctx of ['dynamic', 'dark', 'light']) {
      const boldSel = `[data-material="transparent"][data-media="${ctx}"][data-surface="bold"]`;
      const moderateSel = `[data-material="transparent"][data-media="${ctx}"][data-surface="moderate"]`;
      const boldBody = css.split(boldSel)[1]?.split('}')[0] ?? '';
      const moderateBody = css.split(moderateSel)[1]?.split('}')[0] ?? '';
      const boldHigh = boldBody.match(/--Text-High:\s*([^;]+);/)?.[1]?.trim();
      const moderateHigh = moderateBody.match(/--Text-High:\s*([^;]+);/)?.[1]?.trim();
      expect(boldHigh).toBeTruthy();
      expect(moderateHigh).toBeTruthy();
      expect(boldHigh).not.toBe(moderateHigh);
    }
  });

  it('all roles in a block share the same bold-fill value (role-agnostic spec)', () => {
    const css = generateTransparentMaterialCSS(theme, false);
    const dyn = css.split('[data-material="transparent"][data-media="dynamic"]')[1]?.split('[data-material=')[0] ?? '';
    const primaryBold = dyn.match(/--Primary-Bold:\s*([^;]+);/)?.[1];
    const neutralBold = dyn.match(/--Neutral-Bold:\s*([^;]+);/)?.[1];
    const positiveBold = dyn.match(/--Positive-Bold:\s*([^;]+);/)?.[1];
    expect(primaryBold).toBeTruthy();
    expect(primaryBold).toBe(neutralBold);
    expect(primaryBold).toBe(positiveBold);
  });
});

// ============================================================================
// Token Naming Convention
// ============================================================================

describe('token naming convention', () => {
  const palette = buildGreyscalePalette();
  const scale = buildScaleDefinition('test', palette, 1400);
  const tokenSet = resolveTokenSet(scale, 2500, false);
  const css = generateRoleCSS('Primary', tokenSet);
  const tokenNames = css.map(d => d.split(':')[0]);

  it('new token names (first 20) have no BG/FG distinction', () => {
    // First 20 declarations are new-style tokens
    const newTokenNames = tokenNames.slice(0, 20);
    for (const name of newTokenNames) {
      expect(name).not.toContain('-FG-');
      expect(name).not.toContain('-BG-');
      expect(name).not.toContain('-Default-'); // No "Default-High", just "High"
    }
  });

  it('all token names follow --Role-Token pattern', () => {
    for (const name of tokenNames) {
      expect(name).toMatch(/^--[A-Z][a-zA-Z-]+-[A-Z]/);
    }
  });

  it('V4 token mapping is conceptually 1:1', () => {
    // Verify the key tokens that Button.module.css needs exist
    expect(tokenNames).toContain('--Primary-Bold');           // was --Primary-FG-Bold
    expect(tokenNames).toContain('--Primary-High');           // was --Primary-Default-High (or FG-Bold-High)
    expect(tokenNames).toContain('--Primary-Subtle');         // was --Primary-BG-Subtle
    expect(tokenNames).toContain('--Primary-TintedA11y');     // was --Primary-Default-Accent-A11y
    expect(tokenNames).toContain('--Primary-Stroke-Low');     // was --Primary-Default-Low-Stroke
    expect(tokenNames).toContain('--Primary-Hover');          // was --Primary-Default-Hover
    expect(tokenNames).toContain('--Primary-Pressed');        // was --Primary-Default-Pressed
    expect(tokenNames).toContain('--Primary-Bold-Hover');     // was --Primary-FG-Bold-Hover
    expect(tokenNames).toContain('--Primary-Bold-Pressed');   // was --Primary-FG-Bold-Pressed
    expect(tokenNames).toContain('--Primary-Subtle-Hover');   // was --Primary-BG-Subtle-Hover
    expect(tokenNames).toContain('--Primary-Subtle-Pressed'); // was --Primary-BG-Subtle-Pressed
  });
});

// ============================================================================
// generateSurfaceStepLookupCSS — RFC-0003 step-keyed cascade
// ============================================================================

describe('generateSurfaceStepLookupCSS', () => {
  it('emits one block per step in STEPS', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    for (const step of STEPS) {
      expect(css).toContain(`[data-surface-step="${step}"]`);
    }
  });

  it('every block contains all role tokens for primary', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    expect(css).toContain('--Primary-Bold');
    expect(css).toContain('--Primary-Subtle');
    expect(css).toContain('--Primary-Moderate');
    expect(css).toContain('--Primary-Elevated');
    expect(css).toContain('--Primary-High');
    expect(css).toContain('--Primary-Medium-Text');
    expect(css).toContain('--Primary-Low');
    expect(css).toContain('--Primary-TintedA11y');
    expect(css).toContain('--Primary-Stroke-Medium');
    expect(css).toContain('--Primary-Stroke-Low');
  });

  it('emits backward-compat aliases (Text-*, Surface-*) per block', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    expect(css).toContain('--Text-High');
    expect(css).toContain('--Text-Medium');
    expect(css).toContain('--Text-Low');
    expect(css).toContain('--Text-OnBold-High');
    expect(css).toContain('--Surface-Bold');
    expect(css).toContain('--Surface-Subtle');
  });

  it('different steps produce different values for the same token', () => {
    // --Primary-Bold at step 2500 vs step 600 MUST differ — that's the whole
    // point of the lookup. Shape-tolerant: under grouped emission the token
    // may live in a multi-step rule, so we resolve via cascade walk.
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    const v2500 = resolveTokenAtStep(css, 2500, '--Primary-Bold');
    const v600 = resolveTokenAtStep(css, 600, '--Primary-Bold');
    expect(v2500).toBeTruthy();
    expect(v600).toBeTruthy();
    expect(v2500).not.toEqual(v600);
  });

  it('CSS size stays within the 80KB SURFACE_CONTEXT limit', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    expect(css.length).toBeLessThan(80 * 1024);
  });

  it('emits --Surface-Self-Color resolvable at every step (Surface uses this for its own bg)', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    for (const step of STEPS) {
      expect(resolveTokenAtStep(css, step, '--Surface-Self-Color')).toBeTruthy();
    }
  });

  it('emits per-role --{Role}-Self-Color tokens in every block', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    expect(css).toContain('--Primary-Self-Color');
    expect(css).toContain('--Neutral-Self-Color');
  });

  it('Self-Color value at step N equals palette[N] (no offset)', () => {
    // The Surface element reads --Surface-Self-Color from its OWN block, so
    // the value must be the palette colour at the actual step — not an
    // offset, otherwise the Surface paints the wrong colour at depth ≥ 2.
    const theme = buildTestTheme();
    const css = generateSurfaceStepLookupCSS(theme);
    const primaryPalette = theme.appearances['primary'].palette;
    for (const step of [600, 1300, 2300]) {
      const resolved = resolveTokenAtStep(css, step, '--Surface-Self-Color');
      expect(resolved).toBeTruthy();
      // Compare ignoring case and accepting #RGB shortform (Approach E).
      expect(expandHex(resolved!).toLowerCase()).toBe(primaryPalette[step].toLowerCase());
    }
  });

  it('does NOT emit Fill-* root-only tokens (per RFC § 3 invariant)', () => {
    const css = generateSurfaceStepLookupCSS(buildTestTheme());
    // --Surface-Fill-* and --{Role}-Fill-* must stay :root-only so a Surface
    // can read its own background colour without self-referential remap.
    expect(css).not.toMatch(/--Surface-Fill-/);
    expect(css).not.toMatch(/--Primary-Fill-/);
  });

  // RFC-0003 Option C: theme-agnostic emission. The output bakes both
  // themes into one string; only `--{Role}-Default` declarations live
  // inside `[data-mode]`-scoped overlays. Theme toggle is then a CSS
  // attribute flip — no pipeline regen.
  describe('Option C: theme-agnostic emission', () => {
    it('emits theme-agnostic blocks plus [data-mode="light"] / [data-mode="dark"] overlays', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      expect(css).toContain('[data-mode="light"] [data-surface-step="2500"]');
      expect(css).toContain('[data-mode="dark"] [data-surface-step="2500"]');
      // Plain step block (theme-agnostic) still present.
      expect(css).toMatch(/(?<!\])\s+\[data-surface-step="2500"\]/);
    });

    it('theme-agnostic block contains NO *-Default decls (those live in overlays)', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      // Find the bare [data-surface-step="2500"] block (not the overlay).
      const bareBlock = css.match(/(?<!\])\n  \[data-surface-step="2500"\]\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(bareBlock).not.toMatch(/--[A-Za-z][\w-]*-Default:/);
    });

    it('overlay blocks contain ONLY *-Default decls (every other token is theme-agnostic)', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      const lightOverlay = css.match(/\[data-mode="light"\]\s+\[data-surface-step="2500"\]\s*\{([^}]*)\}/)?.[1] ?? '';
      const darkOverlay  = css.match(/\[data-mode="dark"\]\s+\[data-surface-step="2500"\]\s*\{([^}]*)\}/)?.[1] ?? '';
      for (const overlay of [lightOverlay, darkOverlay]) {
        for (const line of overlay.split(';')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('--')) {
            expect(trimmed).toMatch(/^--[A-Za-z][\w-]*-Default:/);
          }
        }
      }
    });

    it('light and dark overlays carry different values (overlays are meaningful)', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      const lightPrimary = resolveTokenAtStep(css, 1500, '--Primary-Default', 'light');
      const darkPrimary  = resolveTokenAtStep(css, 1500, '--Primary-Default', 'dark');
      expect(lightPrimary).toBeTruthy();
      expect(darkPrimary).toBeTruthy();
      expect(lightPrimary).not.toEqual(darkPrimary);
    });

    it('caches output by themeConfig identity (no theme arg means single cache slot)', () => {
      const theme = buildTestTheme();
      const a = generateSurfaceStepLookupCSS(theme);
      const b = generateSurfaceStepLookupCSS(theme);
      expect(a).toBe(b); // string identity — cache hit
    });
  });

  // RFC `surface_lookup_css_optimization_architecture.md` Approach B:
  // selector-list grouping by (token, value) with token co-location.
  describe('Approach B: grouped emission', () => {
    it('every (step, token) resolves to a value at every occupied step', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      // Sample a representative set of step-dependent tokens.
      const tokens = [
        '--Primary-Bold',
        '--Primary-Subtle',
        '--Primary-High',
        '--Primary-TintedA11y',
        '--Surface-Self-Color',
        '--Primary-Self-Color',
      ];
      for (const step of STEPS) {
        for (const token of tokens) {
          const v = resolveTokenAtStep(css, step, token);
          expect(v, `${token} @ step=${step}`).toBeTruthy();
        }
      }
    });

    it('overlay tokens resolve under both themes for every step', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      for (const step of STEPS) {
        const light = resolveTokenAtStep(css, step, '--Primary-Default', 'light');
        const dark  = resolveTokenAtStep(css, step, '--Primary-Default', 'dark');
        expect(light, `--Primary-Default light @ step=${step}`).toBeTruthy();
        expect(dark,  `--Primary-Default dark @ step=${step}`).toBeTruthy();
      }
    });

    it('output is deterministic — same input bytes-identical on repeat', () => {
      // Bypass the WeakMap cache by building two equivalent ThemeConfig
      // identities from the same palette data.
      const a = generateSurfaceStepLookupCSS(buildTestTheme());
      const b = generateSurfaceStepLookupCSS(buildTestTheme());
      // Different ThemeConfig objects → different cache entries → engine
      // re-computes both. Bytes must be identical.
      expect(a).toBe(b);
    });

    it('no two grouped rules cover the same (token, step) pair', () => {
      // Cascade-safety guarantee: under grouping, each (token, step) maps to
      // exactly one rule per context (agnostic / light overlay / dark
      // overlay). Two competing rules with same specificity would create
      // source-order dependence — forbidden by §3.1.
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      const ruleRe = /([^{}]+)\{([^}]*)\}/g;
      const seen = new Map<string, string>(); // key=ctx|token|step → first selector that declared it
      for (const m of css.matchAll(ruleRe)) {
        const selectorList = m[1];
        const body = m[2];
        // Determine context (agnostic / light / dark) from first selector.
        const themeM = /\[data-mode="(light|dark)"\]/.exec(selectorList);
        const ctx = themeM ? themeM[1] : 'agnostic';
        // Extract every step covered by this rule.
        const steps = new Set<number>();
        for (const sm of selectorList.matchAll(/\[data-surface-step="(\d+)"\]/g)) {
          steps.add(parseInt(sm[1], 10));
        }
        const isRoot = /^\s*:root\s*$/.test(selectorList) || /^\s*:root\s*,/.test(selectorList);
        if (isRoot) {
          for (const s of STEPS) steps.add(s);
        }
        // Extract every token declared in the body.
        for (const dm of body.matchAll(/(--[A-Za-z][\w-]+)\s*:/g)) {
          const token = dm[1];
          for (const step of steps) {
            const key = `${ctx}|${token}|${step}`;
            const prev = seen.get(key);
            if (prev !== undefined && prev !== selectorList) {
              throw new Error(
                `rule overlap: ${token} @ step=${step} ctx=${ctx} declared in two rules`,
              );
            }
            seen.set(key, selectorList);
          }
        }
      }
      // If we got here, no overlap was detected.
      expect(true).toBe(true);
    });

    it('rule count is materially smaller than declaration count (compression real)', () => {
      const css = generateSurfaceStepLookupCSS(buildTestTheme());
      const ruleCount = (css.match(/\{/g) ?? []).length;
      const declCount = (css.match(/--[A-Za-z][\w-]+\s*:/g) ?? []).length;
      // Pre-grouping: 75 rules × ~110 decls = ~8275 decls (ratio ~110:1).
      // Post-grouping fixture analysis: ~177 rules × ~29 decls (ratio ~29:1).
      // Test asserts the basic compression invariant: avg decls/rule ≥ 5
      // (well below pre-grouping but above 1) — defends against accidental
      // regression to per-token-per-rule output.
      expect(declCount / ruleCount).toBeGreaterThan(5);
    });
  });

  // Static/dynamic split: brand-invariant role tokens (Neutral, Positive,
  // Negative, Warning, Informative, Border) emit to a separate slice so the
  // shared sheet can be hoisted out of per-brand injection.
  describe('split static/dynamic emission', () => {
    const STATIC_PREFIXES = [
      '--Neutral-', '--Positive-', '--Negative-',
      '--Warning-', '--Informative-', '--Border-',
    ];
    const isStaticToken = (t: string) =>
      STATIC_PREFIXES.some((p) => t.startsWith(p));

    it('every token in staticCSS has a static prefix', () => {
      const { staticCSS } = generateSurfaceStepLookupCSSSplit(buildTestTheme());
      for (const m of staticCSS.matchAll(/(--[A-Za-z][\w-]+)\s*:/g)) {
        expect(isStaticToken(m[1]), m[1]).toBe(true);
      }
    });

    it('no token in dynamicCSS has a static prefix', () => {
      const { dynamicCSS } = generateSurfaceStepLookupCSSSplit(buildTestTheme());
      for (const m of dynamicCSS.matchAll(/(--[A-Za-z][\w-]+)\s*:/g)) {
        expect(isStaticToken(m[1]), m[1]).toBe(false);
      }
    });

    it('staticCSS + dynamicCSS is the combined emitter output', () => {
      const split = generateSurfaceStepLookupCSSSplit(buildTestTheme());
      const combined = generateSurfaceStepLookupCSS(buildTestTheme());
      const joined = [split.staticCSS, split.dynamicCSS].filter(Boolean).join('\n');
      expect(joined).toBe(combined);
    });

    it('cascade resolution unchanged: every (token, step) still resolves', () => {
      // Need a theme with at least one static role (Positive) to exercise the
      // static slice; buildTestTheme only includes primary + neutral.
      const split = generateSurfaceStepLookupCSSSplit(buildFullTheme());
      const joined = [split.staticCSS, split.dynamicCSS].filter(Boolean).join('\n');
      const tokens = [
        '--Primary-Bold',         // dynamic
        '--Neutral-Bold',         // static
        '--Positive-Subtle',      // static
        '--Surface-Self-Color',   // dynamic
      ];
      for (const step of STEPS) {
        for (const token of tokens) {
          expect(
            resolveTokenAtStep(joined, step, token),
            `${token} @ step=${step}`,
          ).toBeTruthy();
        }
      }
    });
  });
});

// ============================================================================
// resolveSurfaceStep — RFC-0003 Phase 1 helper for the JSX bridge
// ============================================================================

describe('resolveSurfaceStep', () => {
  it('returns root step for default mode in light', () => {
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 2500, 'default', false, true)).toBe(2500);
  });

  it('returns root step for default mode in dark', () => {
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 100, 'default', true, true)).toBe(200);
  });

  it('returns parent step for ghost', () => {
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 1700, 'ghost', false, false)).toBe(1700);
  });

  it('walks 1 step toward contrast for minimal at light root', () => {
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 2500, 'minimal', false, true)).toBe(2400);
  });

  it('walks 2 steps for subtle at light root', () => {
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 2500, 'subtle', false, true)).toBe(2300);
  });

  it('elevated walks toward light, capped at 2500', () => {
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 2400, 'elevated', false, false)).toBe(2500);
    expect(resolveSurfaceStep(scale, 2500, 'elevated', false, true)).toBe(2500);
  });

  it('bold returns scale.base when parent >= 1300 (no anchor)', () => {
    // baseStep = 1400 in buildTestTheme primary; from light root 2500
    // (>= 1300) the engine picks scale.base = 1400.
    const scale = buildTestTheme().appearances['primary'];
    expect(resolveSurfaceStep(scale, 2500, 'bold', false, false)).toBe(1400);
  });

  it('bold respects anchorBoldToBaseStep at root', () => {
    const palette = buildGreyscalePalette();
    const anchored: ScaleDefinition = {
      ...buildScaleDefinition('anchored', palette, 600),
      anchorBoldToBaseStep: true,
    };
    expect(resolveSurfaceStep(anchored, 2500, 'bold', false, true)).toBe(600);
  });

  it('bold strips anchorBoldToBaseStep below root', () => {
    // Below root, the anchor is dropped so bold contrasts against the
    // actual parent rather than re-pinning to baseStep.
    const palette = buildGreyscalePalette();
    const anchored: ScaleDefinition = {
      ...buildScaleDefinition('anchored', palette, 600),
      anchorBoldToBaseStep: true,
    };
    // Parent at 600 = anchor; with the anchor stripped, resolveSurface's
    // 7-step rescue activates (|600-600|/100 < 7) and produces a fallback.
    const result = resolveSurfaceStep(anchored, 600, 'bold', false, false);
    expect(result).not.toBe(600);
    expect(result).toBeGreaterThanOrEqual(100);
    expect(result).toBeLessThanOrEqual(2500);
  });
});

describe('dedupeDeclarationsKeepLast', () => {
  it('keeps the last declaration of a duplicated property', () => {
    const out = dedupeDeclarationsKeepLast([
      '--Surface-Elevated: #aaaaaa;',
      '--Border-Subtle: #cccccc;',
      '--Surface-Elevated: #bbbbbb;',
    ]);
    expect(out).toEqual([
      '--Border-Subtle: #cccccc;',
      '--Surface-Elevated: #bbbbbb;',
    ]);
  });

  it('preserves comments and non-declaration lines', () => {
    const out = dedupeDeclarationsKeepLast([
      '/* group A */',
      '--X: 1;',
      '--X: 2;',
      '',
    ]);
    expect(out).toEqual(['/* group A */', '--X: 2;', '']);
  });

  it('leaves a declaration-free / unique list unchanged', () => {
    const lines = ['--A: 1;', '--B: 2;', '--C: 3;'];
    expect(dedupeDeclarationsKeepLast(lines)).toEqual(lines);
  });
});
