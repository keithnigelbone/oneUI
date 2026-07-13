/**
 * build-brand-css.ts — pure-Node brand CSS generator.
 *
 * Replaces the Playwright-driven harvest-brands.ts. Calls the same engine
 * functions useBrandCSS uses, in the same order, with no React or DOM.
 *
 *   pnpm cdn:build-brand-css                    # all real brands + their sub-brands
 *   pnpm cdn:build-brand-css --slug=jio         # one brand (and its sub-brands)
 *
 * Output structure (v2 layout):
 *   cdn-dist/brands/index.json                       ← { schemaVersion, brands: [...] }
 *   cdn-dist/brands/<slug>/index.json                ← versions + latest + subBrands
 *                          /latest.json /latest.css  ← byte copies of <latest>/brand.*
 *                          /<version>/brand.json     ← combined payload (BrandJsonV2)
 *                          /<version>/brand.css      ← parent brand CSS (full)
 *                          /subBrands/<sub>/index.json /latest.{json,css}
 *                          /subBrands/<sub>/<version>/brand.json   ← { themeConfig }
 *                          /subBrands/<sub>/<version>/brand.css    ← DELTA CSS
 *
 * Sub-brands only diverge on `themeConfig`. Their `brand.json` carries just
 * { schemaVersion, version, themeConfig } — BrandProvider inherits the rest
 * from the parent's cached files at runtime.
 *
 * Delta safety: every sub-brand build runs a parity assertion that compares
 * (parent CSS + delta CSS, resolved by CSS specificity) against a freshly
 * generated full sub-brand CSS. Any byte-level drift fails the build before
 * artifacts are published.
 *
 * Docs: `cdn-release-full-pipeline/docs/README.md`
 */

import {
  writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync, readFileSync,
} from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConvexHttpClient } from 'convex/browser';

import { api } from '../../convex/_generated/api';
import {
  buildAvailableScales, wrapCSSForInjection,
  generateMotionCSS, generateGridCSS,
  type ThemeConfig,
} from '@oneui/shared/engine';
import { generateDimensionCSS, generateFontRenderingCSS, generateOrnamentCSSProperties } from '@oneui/shared';
import { applySubBrandAccentsToFoundation, type SubBrandAccentFields } from '@oneui/shared';
import {
  buildNewPaletteData,
  generateNewRootCSS, generateNewContextCSS,
  generateNewAppearanceRedirectCSS, generateNewContextBoundaryCSS,
  generateNewTransparentCSS,
} from '@oneui/ui/engine/computeNewStacking';
import { generateNewStepLookupCSSSplit } from '@oneui/ui/engine/computeNewStacking';
import {
  generateTypographyFontCSS, generateTypographyFontCSSV2, generateGoogleFontImports,
} from '@oneui/ui/utils/foundationCSS';
// Component overrides are emitted by default. They require the CSS-stub
// loader (cdn-release-full-pipeline/build/loaders/register.mjs) to be active so that importing
// the @oneui/ui component registry — which transitively pulls every component
// module and its `.module.css` — does not crash with `Unknown file extension`.
// Opt out by setting ONEUI_SKIP_COMPONENT_OVERRIDES=1 (e.g. for a quick
// brand-only smoke test without the loader).
const SKIP_COMPONENT_OVERRIDES = process.env.ONEUI_SKIP_COMPONENT_OVERRIDES === '1';

import { scopeBrandCSS } from './scopeBrandCSS';

// ─── Env / paths ──────────────────────────────────────────────────────────────

// Minimal .env.local loader (no extra dep). tsx doesn't auto-load env files.
(function loadDotenv() {
  const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/i);
    if (!m) continue;
    if (process.env[m[1]] != null) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
})();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const OUT_DIR = join(ROOT, 'cdn-dist');
const VERSION = '1.0.0';

const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL
  || process.env.STORYBOOK_CONVEX_URL
  || process.env.CONVEX_URL;

// ─── CLI ──────────────────────────────────────────────────────────────────────
const args = new Map<string, string | boolean>();
for (const arg of process.argv.slice(2)) {
  const [k, v] = arg.replace(/^--/, '').split('=');
  args.set(k, v ?? true);
}
const FILTER_SLUG = typeof args.get('slug') === 'string' ? String(args.get('slug')) : null;

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Strip Convex fields; keep only the shape `buildAllComponentCSS` reads.
 */
function sanitizeComponentData(raw: unknown): {
  componentThemeSelections: Array<{ familyId: string; selections: Record<string, string> }>;
  recipeSelections: Array<{ componentName: string; selections: Record<string, string> }>;
  tokenOverrides: Array<{ componentName?: string; tokenName: string; value: string }>;
} {
  const empty = {
    componentThemeSelections: [] as Array<{ familyId: string; selections: Record<string, string> }>,
    recipeSelections: [] as Array<{ componentName: string; selections: Record<string, string> }>,
    tokenOverrides: [] as Array<{ componentName?: string; tokenName: string; value: string }>,
  };
  if (!raw || typeof raw !== 'object') return empty;

  const r = raw as Record<string, unknown>;
  const themeSel = Array.isArray(r.componentThemeSelections) ? r.componentThemeSelections : [];
  const recSel = Array.isArray(r.recipeSelections) ? r.recipeSelections : [];
  const tokOv = Array.isArray(r.tokenOverrides) ? r.tokenOverrides : [];

  return {
    componentThemeSelections: themeSel
      .map((row: any) => ({
        familyId: String(row.familyId ?? ''),
        selections:
          row.selections && typeof row.selections === 'object' && !Array.isArray(row.selections)
            ? (row.selections as Record<string, string>)
            : {},
      }))
      .filter((t) => t.familyId),
    recipeSelections: recSel
      .map((row: any) => ({
        componentName: String(row.componentName ?? ''),
        selections:
          row.selections && typeof row.selections === 'object' && !Array.isArray(row.selections)
            ? (row.selections as Record<string, string>)
            : {},
      }))
      .filter((x) => x.componentName),
    tokenOverrides: tokOv
      .map((row: any) => ({
        componentName: row.componentName != null ? String(row.componentName) : undefined,
        tokenName: String(row.tokenName ?? ''),
        value: String(row.value ?? ''),
      }))
      .filter((o) => o.tokenName),
  };
}

/** Subset of foundation data for `useBrandFonts` in CDN consumers. */
function buildFontsPayload(foundationData: unknown): Record<string, unknown> | null {
  if (!foundationData || typeof foundationData !== 'object') return null;
  const f = foundationData as Record<string, unknown>;
  const customFonts = f.customFonts;
  const typography = f.typography;
  const typographyV2 = f.typographyV2;
  const hasCustom = Array.isArray(customFonts) && customFonts.length > 0;
  const hasTypo = typography != null || typographyV2 != null;
  if (!hasCustom && !hasTypo) return null;
  return {
    customFonts: hasCustom ? customFonts : [],
    typography,
    typographyV2,
  };
}

// ─── Core: produce brand CSS for one (brand, theme) ───────────────────────────
/**
 * Mirrors the composition in `useBrandCSS.ts` lines 230–400. Same engine
 * functions, same order, same wrapping. No React, no DOM.
 *
 * Returns the wrapped `@layer brand { ... }` block (still rooted at `:root`).
 * Caller scopes it under `[data-brand][data-theme]` via `scopeBrandCSS`.
 */
function generateBrandCSSForTheme(
  foundationData: any,
  theme: 'light' | 'dark',
): { brandCSS: string; dimensionCSS: string; themeConfig: ThemeConfig | null } {
  const colorConfig = foundationData?.color?.config;
  const presetSelection = foundationData?.presetSelection;
  const appearanceConfig = foundationData?.appearanceConfig;
  const typographyConfig = foundationData?.typography?.config;
  const customFonts = foundationData?.customFonts;
  const motionConfig = foundationData?.motion?.config;
  const gridConfig = (foundationData as any)?.grid?.config;
  const platformsConfig = foundationData?.platforms?.config;
  const topLevelTypographyV2 = (foundationData as any)?.typographyV2;

  // 1. Build palette (theme-independent input → theme-dependent output)
  const availableScales = buildAvailableScales(colorConfig, presetSelection);
  const paletteData = buildNewPaletteData(availableScales, appearanceConfig);

  const dimBlocksBase = platformsConfig ? generateDimensionCSS(platformsConfig) : '';
  const dimensionCSSBase = dimBlocksBase ? `@layer brand {\n${dimBlocksBase}\n}` : '';

  if (!paletteData) {
    return { brandCSS: '', dimensionCSS: dimensionCSSBase, themeConfig: null };
  }

  const themeConfig = paletteData.themeConfig;

  // 2. Surface CSS (root)
  const surfaceCSS = generateNewRootCSS(paletteData, theme);

  // 3. Surface context (legacy depth-1)
  const surfaceContextCSS = generateNewContextCSS(paletteData, theme);

  // 4. Step lookup DYNAMIC slice only (static slice ships in foundation.css).
  const surfaceStepLookupCSS = generateNewStepLookupCSSSplit(paletteData).dynamicCSS;

  // 5. Context boundary + appearance redirect + transparent material
  const contextBoundaryCSS = generateNewContextBoundaryCSS(paletteData);
  const appearanceRedirectCSS = generateNewAppearanceRedirectCSS(paletteData);
  const transparentMaterialCSS = generateNewTransparentCSS(paletteData, theme);

  // 6. Typography (V2 takes precedence)
  const resolvedTypographyV2 = typographyConfig?.typographyV2 ?? topLevelTypographyV2;
  const mergedTypographyConfig: any = resolvedTypographyV2 || typographyConfig
    ? { ...(typographyConfig ?? {}), typographyV2: resolvedTypographyV2 }
    : null;
  const typographyCSS = resolvedTypographyV2
    ? generateTypographyFontCSSV2(mergedTypographyConfig, customFonts)
    : generateTypographyFontCSS(typographyConfig as any, customFonts);

  // 7. Ornament CSS (Button brackets, etc.) — same order as useBrandCSS.ts
  const decorations = (foundationData as { decorations?: Array<{
    componentName: string;
    svgContent: string;
    aspectRatio: number;
    mirror: boolean;
    placement: 'edges' | 'left' | 'right';
  }> }).decorations;
  let ornamentCSS = '';
  if (decorations?.length) {
    const declarations: string[] = [];
    for (const d of decorations) {
      const props = generateOrnamentCSSProperties(
        d.componentName,
        d.svgContent,
        d.aspectRatio,
        d.mirror,
        d.placement as 'edges' | 'left' | 'right' | undefined,
      );
      for (const [prop, value] of Object.entries(props)) {
        declarations.push(`${prop}: ${value};`);
      }
    }
    ornamentCSS = declarations.join('\n  ');
  }

  // 8. Motion + grid
  const motionCSS = generateMotionCSS(motionConfig ?? null);
  const gridCSS = generateGridCSS(gridConfig ?? null);

  // 9. Logo CSS (single declaration on paletteData)
  const logoCSS = (paletteData as any)?.logoCSS ?? '';

  // 10. Font rendering quality block (V2 only)
  const renderingCSS = resolvedTypographyV2 ? generateFontRenderingCSS(resolvedTypographyV2) : '';

  // 11. Compose rawCSS in the same order useBrandCSS does:
  //     [typographyCSS, surfaceCSS, ornamentCSS, motionCSS, logoCSS]
  const rawCSS = [typographyCSS, surfaceCSS, ornamentCSS, motionCSS, logoCSS]
    .filter(Boolean).join('\n  ');

  if (!rawCSS) {
    return { brandCSS: '', dimensionCSS: dimensionCSSBase, themeConfig };
  }

  // 11. Compose additionalBlocks in the same order useBrandCSS does:
  //     [surfaceContextCSS, surfaceStepLookupCSS, appearanceRedirectCSS,
  //      contextBoundaryCSS, transparentMaterialCSS, renderingCSS, gridCSS]
  const additionalBlocks = [
    surfaceContextCSS,
    surfaceStepLookupCSS,
    appearanceRedirectCSS,
    contextBoundaryCSS,
    transparentMaterialCSS,
    renderingCSS,
    gridCSS,
  ].filter(Boolean).join('\n');

  // 12. Wrap (mode='global' → produces @layer brand { :root { ... } additionalBlocks })
  const wrapped = wrapCSSForInjection(rawCSS, 'global', additionalBlocks || undefined);

  // 13. Prepend Google Font imports
  const googleFontImports = generateGoogleFontImports(mergedTypographyConfig);
  const brandCSS = googleFontImports ? `${googleFontImports}\n${wrapped}` : wrapped;

  // 14. Dimension CSS — already wrapped in @layer brand by harvester convention.
  const dimBlocks = platformsConfig ? generateDimensionCSS(platformsConfig) : '';
  const dimensionCSS = dimBlocks ? `@layer brand {\n${dimBlocks}\n}` : '';

  return { brandCSS, dimensionCSS, themeConfig };
}

/**
 * Build the sub-brand DELTA CSS for one theme by post-diffing the fully-
 * generated sub-brand CSS against the already-scoped parent CSS at the
 * (selector, property) level.
 *
 * Why post-diff (not engine surgery): the engine's per-role outputs are NOT
 * additive — removing a role from `appearanceConfig.accents` changes how
 * unrelated tokens compute (e.g. `--Neutral-Bold` derivation fallbacks,
 * `--Focus-Outline` chroma logic). An earlier approach that filtered the
 * foundation to 4 roles produced subtly wrong values that the parity check
 * caught. Post-diff sidesteps the issue entirely: we generate the full
 * sub-brand CSS the engine would naturally produce, then keep only the
 * (selector, prop, value) tuples that differ from parent. By construction,
 * `delta ?? parent === full` for every observable token.
 *
 * Inputs are SCOPED CSS strings (already passed through `scopeBrandCSS`).
 * Output is a fresh, @layer-wrapped block scoped to the sub-brand selector,
 * ready to write to disk.
 *
 * Skipped from the diff output: @import statements (fonts are loaded once
 * by the parent; sub-brand only overrides 4 accents and never differs in
 * fonts). Selectors outside the sub-brand's scope (defensive — should not
 * occur after scoping).
 */
function buildDeltaCSSFromDiff(args: {
  parentScopedCSS: string;
  fullSubScopedCSS: string;
  parentSlug: string;
  subSlug: string;
  theme: 'light' | 'dark';
}): string {
  const { parentScopedCSS, fullSubScopedCSS, parentSlug, subSlug, theme } = args;
  const parentSel = `[data-brand="${parentSlug}"][data-mode="${theme}"]`;
  const subSel = `[data-brand="${parentSlug}"][data-theme="${subSlug}"][data-mode="${theme}"]`;

  // Parse both into Map<normalizedSelector, Array<[prop, value]>>. Array
  // (not Map) preserves the engine's emission order for declarations, which
  // matters for visual review and minor cascade edge cases.
  const parsed = (css: string, ownSel: string): Map<string, Array<[string, string]>> => {
    const out = new Map<string, Array<[string, string]>>();
    const ruleRe = /([^{}@]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRe.exec(css)) !== null) {
      const selectors = m[1].trim();
      const body = m[2];
      if (!selectors) continue;
      for (const rawSel of selectors.split(',')) {
        const sel = rawSel.trim();
        if (!sel) continue;
        let normalized: string;
        if (sel === ownSel) {
          normalized = '__ROOT__';
        } else if (sel.startsWith(`${ownSel} `)) {
          normalized = sel.slice(ownSel.length + 1);
        } else {
          continue;
        }
        let decls = out.get(normalized);
        if (!decls) {
          decls = [];
          out.set(normalized, decls);
        }
        for (const raw of body.split(';')) {
          const trimmed = raw.trim();
          if (!trimmed) continue;
          const colon = trimmed.indexOf(':');
          if (colon === -1) continue;
          const prop = trimmed.slice(0, colon).trim();
          const value = trimmed.slice(colon + 1).trim();
          if (!prop.startsWith('--')) continue;
          decls.push([prop, value]);
        }
      }
    }
    return out;
  };

  const parentMap = parsed(parentScopedCSS, parentSel);
  const fullMap = parsed(fullSubScopedCSS, subSel);

  // For each (sel, prop) in full: include in delta iff its value differs from
  // parent's same (sel, prop) — or parent has no such (sel, prop) at all.
  // Last-write-wins within a rule (mirrors the engine's own duplicate
  // declaration semantics).
  const deltaRules: Array<{ sel: string; decls: Array<[string, string]> }> = [];
  for (const [sel, fullDecls] of fullMap) {
    const parentDecls = parentMap.get(sel);
    const parentLookup = new Map<string, string>();
    if (parentDecls) for (const [p, v] of parentDecls) parentLookup.set(p, v);
    const fullLookup = new Map<string, string>();
    for (const [p, v] of fullDecls) fullLookup.set(p, v);
    const kept: Array<[string, string]> = [];
    for (const [p, v] of fullLookup) {
      if (parentLookup.get(p) !== v) kept.push([p, v]);
    }
    if (kept.length > 0) deltaRules.push({ sel, decls: kept });
  }

  if (deltaRules.length === 0) {
    // Sub-brand identical to parent across all observable tokens — extremely
    // rare (would mean accents resolve to identical colors) but valid. Emit
    // an empty layer so consumers still get a file.
    return `/* OneUI sub-brand DELTA (empty — sub-brand resolves identically to parent) */\n@layer brand {}\n`;
  }

  // Emit. Selectors get the sub-brand prefix re-attached. Group by selector
  // to keep output compact. The whole payload sits inside @layer brand so it
  // joins the runtime cascade with the same precedence as parent CSS.
  const renderSel = (normalized: string): string =>
    normalized === '__ROOT__' ? subSel : `${subSel} ${normalized}`;

  const blocks = deltaRules.map(({ sel, decls }) => {
    const body = decls.map(([p, v]) => `  ${p}: ${v};`).join('\n');
    return `${renderSel(sel)} {\n${body}\n}`;
  });

  return `@layer brand {\n${blocks.join('\n\n')}\n}\n`;
}

/**
 * Inline parity check: assert that loading parent CSS + delta CSS on a
 * sub-brand wrapper produces the same observable token values as loading the
 * full sub-brand CSS.
 *
 * Implementation: parse all 3 CSS strings into a normalized form keyed by
 * "downstream selector" (the part after the brand/sub-brand/theme prefix),
 * then for each (selector, property) in the full CSS verify that:
 *   resolved = delta.get(sel)?.get(prop) ?? parent.get(sel)?.get(prop)
 * equals the full value. If any mismatch, throw — the build must fail
 * before publishing a delta that would render incorrectly at runtime.
 *
 * Why this catches drift: with the post-diff delta strategy the check is
 * trivially-true by construction (delta is built FROM the full vs parent
 * diff), so it acts as a regression guard for the diff routine itself. If
 * the diff logic ever silently drops a (selector, prop) or normalizes
 * selectors incorrectly, this check fails before publish.
 */
function runDeltaParityCheck(args: {
  parentCSS: string;
  deltaCSS: string;
  fullSubCSS: string;
  parentSlug: string;
  subSlug: string;
  theme: 'light' | 'dark';
}): void {
  const { parentCSS, deltaCSS, fullSubCSS, parentSlug, subSlug, theme } = args;
  const parentSel = `[data-brand="${parentSlug}"][data-mode="${theme}"]`;
  const subSel = `[data-brand="${parentSlug}"][data-theme="${subSlug}"][data-mode="${theme}"]`;

  type DeclMap = Map<string, Map<string, string>>;
  const parsed = (css: string, ownSel: string): DeclMap => {
    const out: DeclMap = new Map();
    // Strip @import + @layer wrapper noise so we can scan rules.
    // Rules look like: `<selectorList> { decl; decl; }`. Selectors may chain
    // (`A, B { ... }`). We extract each rule, then "normalize" the selector
    // by removing the brand prefix so cross-css comparison aligns.
    const ruleRe = /([^{}@]+)\{([^{}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = ruleRe.exec(css)) !== null) {
      const selectors = m[1].trim();
      const body = m[2];
      if (!selectors) continue;
      // Split selector list (commas) and normalize each.
      for (const rawSel of selectors.split(',')) {
        const sel = rawSel.trim();
        if (!sel) continue;
        let normalized = sel;
        if (sel === ownSel) {
          normalized = '__ROOT__';
        } else if (sel.startsWith(`${ownSel} `)) {
          normalized = sel.slice(ownSel.length + 1);
        } else {
          // Selector doesn't start with the expected brand prefix; ignore
          // (e.g. @layer-level declarations, comments-as-selectors).
          continue;
        }
        let decls = out.get(normalized);
        if (!decls) {
          decls = new Map();
          out.set(normalized, decls);
        }
        // Parse decls within this rule.
        for (const raw of body.split(';')) {
          const trimmed = raw.trim();
          if (!trimmed) continue;
          const colon = trimmed.indexOf(':');
          if (colon === -1) continue;
          const prop = trimmed.slice(0, colon).trim();
          const value = trimmed.slice(colon + 1).trim();
          if (!prop.startsWith('--')) continue;
          decls.set(prop, value);
        }
      }
    }
    return out;
  };

  const parentMap = parsed(parentCSS, parentSel);
  const deltaMap = parsed(deltaCSS, subSel);
  const fullMap = parsed(fullSubCSS, subSel);

  const mismatches: string[] = [];

  for (const [sel, fullDecls] of fullMap) {
    for (const [prop, fullValue] of fullDecls) {
      const deltaValue = deltaMap.get(sel)?.get(prop);
      const parentValue = parentMap.get(sel)?.get(prop);
      const resolved = deltaValue ?? parentValue;
      if (resolved !== fullValue) {
        mismatches.push(
          `  ${sel} { ${prop}: full="${fullValue}" vs resolved="${resolved ?? 'MISSING'}" `
          + `(delta=${deltaValue ?? 'absent'}, parent=${parentValue ?? 'absent'}) }`,
        );
        if (mismatches.length >= 20) break;
      }
    }
    if (mismatches.length >= 20) break;
  }

  // Also assert delta doesn't introduce stray declarations not present in full.
  for (const [sel, deltaDecls] of deltaMap) {
    for (const [prop, deltaValue] of deltaDecls) {
      const fullValue = fullMap.get(sel)?.get(prop);
      if (fullValue !== deltaValue) {
        mismatches.push(
          `  ${sel} { ${prop}: delta="${deltaValue}" not in full ("${fullValue ?? 'MISSING'}") }`,
        );
        if (mismatches.length >= 20) break;
      }
    }
    if (mismatches.length >= 20) break;
  }

  if (mismatches.length > 0) {
    throw new Error(
      `Delta parity check FAILED for ${parentSlug}/${subSlug} (theme=${theme}). `
      + `First ${mismatches.length} mismatches:\n${mismatches.join('\n')}\n`
      + `Build aborted — delta CSS would render incorrectly at runtime. `
      + `This indicates a regression in buildDeltaCSSFromDiff or scopeBrandCSS.`,
    );
  }
}

/**
 * Component overrides — brand-scoped (theme-independent). Returns CSS already
 * wrapped in `@layer brand { :root { ... } }`. Caller swaps `:root` for
 * `[data-brand="<slug>"]` (no theme suffix — overrides don't vary by theme).
 *
 * Lazily imports buildAllComponentCSS so the tsx CSS-stub loader is in place
 * before the component registry is traversed.
 */
async function generateComponentOverridesCSS(componentData: any, slug: string): Promise<string> {
  if (SKIP_COMPONENT_OVERRIDES) return '';
  if (!componentData) return '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import('@oneui/ui/utils/buildComponentOverrideCSS');
  const raw = mod.buildAllComponentCSS(componentData);
  if (!raw) return '';
  return raw.replace(/(^|\s)(:root)\s*\{/g, `$1[data-brand="${slug}"] {`);
}

// ─── Output writers ───────────────────────────────────────────────────────────

/** In-memory entry shape used by the main loop while building the brand list. */
interface GlobalBrandEntry {
  slug: string;
  name: string;
  versions: string[];
  latest: string;
  url: string;
  cssBytes: number;
  themes: Array<{
    slug: string;
    name: string;
    url: string;
    cssBytes: number;
  }>;
}

/**
 * Write parent-brand files in v2 layout:
 *
 *   brands/<slug>/<VERSION>/brand.json    ← combined payload (BrandJsonV2)
 *                          /brand.css
 *   brands/<slug>/latest.json   latest.css ← byte copies of <VERSION>/brand.*
 *   brands/<slug>/index.json              ← versions + latest + subBrands
 *
 * The brand-level `index.json` is written here with an empty `subBrands: []`
 * and rewritten by the main loop after sub-brands have been emitted.
 */
function writeBrandFiles(
  slug: string,
  name: string,
  css: string,
  /** Same shape as Convex `getBrandOverviewData.decorations` — consumed by `DecorationProvider` in apps. */
  decorations: unknown,
  /** Same object `useBrandCSS` exposes for `BrandFoundationProvider` / `<Surface>`. */
  themeConfig: ThemeConfig | null,
  /** Same shape as Convex `foundations.materials.config` — consumed by `MaterialFoundationProvider`. */
  materialsFoundation: unknown,
  /** `logoSvg` + display name for `BrandLogoContext`. */
  branding: { brandName: string; logoSvg?: string | null },
  /** Subset of foundation for `useBrandFonts`; omit file when null. */
  fontsPayload: Record<string, unknown> | null,
): { slug: string; name: string; versions: string[]; latest: string; url: string; cssBytes: number } {
  const brandDir = join(OUT_DIR, 'brands', slug);
  const versionDir = join(brandDir, VERSION);
  mkdirSync(versionDir, { recursive: true });

  const decoList = Array.isArray(decorations) ? decorations : [];
  const brandJson = {
    schemaVersion: 2 as const,
    version: VERSION,
    branding,
    decorations: decoList,
    themeConfig,
    materials: materialsFoundation ?? null,
    fonts: fontsPayload ?? null,
  };
  const brandJsonStr = `${JSON.stringify(brandJson, null, 2)}\n`;

  // Versioned, immutable artefacts.
  writeFileSync(join(versionDir, 'brand.css'), css);
  writeFileSync(join(versionDir, 'brand.json'), brandJsonStr);

  // latest.* mirrors at brand root (static file copies, not redirects).
  copyFileSync(join(versionDir, 'brand.css'), join(brandDir, 'latest.css'));
  copyFileSync(join(versionDir, 'brand.json'), join(brandDir, 'latest.json'));

  // index.json — list of versions + latest + sub-brands (filled in later).
  const brandIndex = {
    schemaVersion: 2 as const,
    versions: [VERSION],
    latest: VERSION,
    themes: [] as string[],
  };
  writeFileSync(join(brandDir, 'index.json'), `${JSON.stringify(brandIndex, null, 2)}\n`);

  const cssBytes = Buffer.byteLength(css, 'utf8');
  return {
    slug, name,
    versions: [VERSION],
    latest: VERSION,
    url: `/brands/${slug}/latest.css`,
    cssBytes,
  };
}

/**
 * Write sub-brand files into `brands/<parentSlug>/sub/<subSlug>/`.
 *
 * Sub-brands inherit `decorations` / `materials` / `branding` / `fonts` from
 * the parent — the per-sub-brand manifest links those URLs back to the parent
 * rather than duplicating bytes. Only `themeConfig.json` is sub-brand-specific
 * (palette differs).
 *
 * `css` is the sub-brand DELTA CSS (4 overridden roles only, scoped under
 * `[data-brand][data-sub-brand][data-theme]`). The BrandProvider loads the
 * parent CSS first, then this delta — CSS specificity ensures the 4 roles
 * win for sub-brand wrappers while inherited tokens cascade from the parent.
 *
 * NOTE (delta optimization deferred): for v1 this writer accepts the sub-
 * brand's FULL CSS. A follow-up will trim to the 4-role delta + add a parity
 * assertion against this full version. The folder layout is delta-ready.
 */
/**
 * Write sub-brand files in v2 layout:
 *
 *   brands/<parent>/subBrands/<sub>/<VERSION>/brand.json   ← { themeConfig }
 *                                            /brand.css    ← DELTA CSS
 *   brands/<parent>/subBrands/<sub>/latest.json   latest.css
 *   brands/<parent>/subBrands/<sub>/index.json
 *
 * Sub-brands only diverge on `themeConfig` — they inherit decorations /
 * materials / branding / fonts from the parent at runtime (BrandProvider
 * reads from the parent's cached files). The combined `brand.json` carries
 * just `{ schemaVersion, version, themeConfig }`.
 */
function writeThemeFiles(
  parentSlug: string,
  themeSlug: string,
  themeName: string,
  css: string,
  themeConfig: ThemeConfig | null,
): { slug: string; name: string; url: string; cssBytes: number } {
  const subDir = join(OUT_DIR, 'brands', parentSlug, 'themes', themeSlug);
  const versionDir = join(subDir, VERSION);
  mkdirSync(versionDir, { recursive: true });

  const subBrandJson = {
    schemaVersion: 2 as const,
    version: VERSION,
    themeConfig,
  };
  const subBrandJsonStr = `${JSON.stringify(subBrandJson, null, 2)}\n`;

  writeFileSync(join(versionDir, 'brand.css'), css);
  writeFileSync(join(versionDir, 'brand.json'), subBrandJsonStr);

  copyFileSync(join(versionDir, 'brand.css'), join(subDir, 'latest.css'));
  copyFileSync(join(versionDir, 'brand.json'), join(subDir, 'latest.json'));

  const subIndex = {
    schemaVersion: 2 as const,
    versions: [VERSION],
    latest: VERSION,
  };
  writeFileSync(join(subDir, 'index.json'), `${JSON.stringify(subIndex, null, 2)}\n`);

  const cssBytes = Buffer.byteLength(css, 'utf8');
  return {
    slug: themeSlug,
    name: themeName,
    url: `/brands/${parentSlug}/themes/${themeSlug}/latest.css`,
    cssBytes,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!CONVEX_URL) {
    throw new Error('CONVEX_URL not set. Need NEXT_PUBLIC_CONVEX_URL / STORYBOOK_CONVEX_URL / CONVEX_URL.');
  }

  if (existsSync(OUT_DIR)) {
    if (FILTER_SLUG) {
      const one = join(OUT_DIR, 'brands', FILTER_SLUG);
      if (existsSync(one)) rmSync(one, { recursive: true });
    } else {
      rmSync(OUT_DIR, { recursive: true });
    }
  }
  mkdirSync(join(OUT_DIR, 'brands'), { recursive: true });

  console.log('→ Connecting to Convex:', CONVEX_URL);
  const convex = new ConvexHttpClient(CONVEX_URL);
  const brands = await convex.query(api.brands.list, {});
  console.log(`→ Got ${brands.length} brand(s) from Convex.`);

  const realTargets = brands.filter((b: any) =>
    FILTER_SLUG ? slugify(b.name) === FILTER_SLUG : true,
  );

  type BrandTarget = {
    brandId: string;
    slug: string;
    name: string;
    foundationData: any;
    componentData: any;
    branding: { brandName: string; logoSvg?: string | null };
  };
  const targets: BrandTarget[] = [];

  for (const brand of realTargets) {
    try {
      const [foundation, componentData, brandRow] = await Promise.all([
        convex.query(api.foundations.getBrandOverviewData, { brandId: brand._id }),
        convex.query(api.componentTokenOverrides.getAllBrandComponentData, { brandId: brand._id }),
        convex.query(api.brands.get, { id: brand._id }),
      ]);
      targets.push({
        brandId: brand._id as string,
        slug: slugify(brand.name),
        name: brand.name,
        foundationData: foundation,
        componentData,
        branding: {
          brandName: (brandRow as { name?: string } | null)?.name ?? brand.name,
          logoSvg: (brandRow as { logoSvg?: string | null } | null)?.logoSvg ?? null,
        },
      });
    } catch (err) {
      console.warn(`  ⚠ skipping ${brand.name}: ${(err as Error).message}`);
    }
  }
  console.log(`→ ${targets.length} real brand(s) queued.`);

  if (targets.length === 0) {
    console.error('No targets. Exiting.');
    process.exit(1);
  }

  // ─── Generate ──────────────────────────────────────────────────────────────
  const globalEntries: GlobalBrandEntry[] = [];
  let okCount = 0;
  let failCount = 0;
  let subOkCount = 0;
  let subFailCount = 0;

  for (const target of targets) {
    try {
      const themes: Array<'light' | 'dark'> = ['light', 'dark'];
      const scopedParts: string[] = [];

      let themeConfigForWrite: ThemeConfig | null = null;
      for (const theme of themes) {
        const { brandCSS, dimensionCSS, themeConfig } = generateBrandCSSForTheme(
          target.foundationData,
          theme,
        );
        if (!brandCSS) {
          throw new Error(`empty brandCSS for theme=${theme}`);
        }
        if (themeConfigForWrite == null && themeConfig != null) {
          themeConfigForWrite = themeConfig;
        }
        scopedParts.push(scopeBrandCSS(brandCSS, dimensionCSS, target.slug, theme));
      }

      // Component overrides — emit once per brand (theme-independent). Sub-brands
      // inherit these via cascade (their wrapper still matches [data-brand="<parent>"]).
      const componentCSS = await generateComponentOverridesCSS(target.componentData, target.slug);
      if (componentCSS) scopedParts.push(componentCSS);

      const combinedCSS =
        `/* OneUI brand: ${target.name} (${target.slug}) · v${VERSION} · ${new Date().toISOString()} */\n`
        + scopedParts.join('\n');

      const fontsPayload = buildFontsPayload(target.foundationData);
      const parentEntry = writeBrandFiles(
        target.slug,
        target.name,
        combinedCSS,
        (target.foundationData as { decorations?: unknown })?.decorations,
        themeConfigForWrite,
        (target.foundationData as { materials?: { config?: unknown } })?.materials?.config ?? null,
        target.branding,
        fontsPayload,
      );
      okCount++;
      console.log(`  ✓ ${target.slug.padEnd(28)} ${(combinedCSS.length / 1024).toFixed(1)} KB`);

      // ─── Sub-brand pass ─────────────────────────────────────────────────────
      // Sub-brands override 4 accent roles (primary/secondary/sparkle/brand-bg)
      // while inheriting every other foundation from the parent. We build a
      // merged foundation via applySubBrandAccentsToFoundation, then emit a
      // sub-brand CSS scoped under [data-brand][data-sub-brand][data-theme]
      // into brands/<parent>/sub/<sub>/.
      const themeEntries: GlobalBrandEntry['themes'] = [];
      let subBrands: Array<{ _id: string; slug: string; name: string } & SubBrandAccentFields> = [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subBrands = await convex.query((api as any).subBrandConfigs.getByParentBrand, {
          parentBrandId: target.brandId,
        }) as typeof subBrands;
      } catch (err) {
        console.warn(`  ⚠ ${target.slug}: sub-brand query failed: ${(err as Error).message}`);
      }

      for (const sub of subBrands) {
        try {
          // 1. Merge sub-brand's 4 accents onto parent (keeps inherited roles).
          const mergedFoundation = applySubBrandAccentsToFoundation(
            target.foundationData,
            sub as unknown as SubBrandAccentFields,
          );
          if (!mergedFoundation) {
            throw new Error('applySubBrandAccentsToFoundation returned null');
          }

          // 2. Generate the FULL sub-brand CSS per theme (engine's natural
          //    output for the merged foundation), then post-diff it against
          //    the already-scoped parent CSS for that theme to derive a
          //    delta containing only the declarations that differ. Diffing
          //    sidesteps the "filtered foundation produces inconsistent
          //    fallbacks" problem we hit with the earlier role-filter
          //    approach — by construction delta ?? parent === full.
          const subScopedParts: string[] = [];
          const fullScopedParts: string[] = [];
          const parentScopedByTheme: string[] = [];
          let subThemeConfig: ThemeConfig | null = null;
          for (const theme of themes) {
            const full = generateBrandCSSForTheme(mergedFoundation, theme);
            if (!full.brandCSS) {
              throw new Error(`empty full brandCSS for theme=${theme}`);
            }
            if (subThemeConfig == null && full.themeConfig != null) {
              subThemeConfig = full.themeConfig;
            }
            // Parent scoped CSS for this theme: regenerate parent here too
            // so we diff against a clean, single-theme parent CSS (the
            // already-written `combinedCSS` contains both themes interleaved
            // and would confuse the diff scope).
            const parentSingleTheme = generateBrandCSSForTheme(target.foundationData, theme);
            const parentScoped = scopeBrandCSS(
              parentSingleTheme.brandCSS,
              parentSingleTheme.dimensionCSS,
              target.slug,
              theme,
            );
            parentScopedByTheme.push(parentScoped);
            const fullSubScoped = scopeBrandCSS(
              full.brandCSS, full.dimensionCSS, target.slug, theme, sub.slug,
            );
            fullScopedParts.push(fullSubScoped);
            subScopedParts.push(buildDeltaCSSFromDiff({
              parentScopedCSS: parentScoped,
              fullSubScopedCSS: fullSubScoped,
              parentSlug: target.slug,
              subSlug: sub.slug,
              theme,
            }));
          }

          const subCombinedCSS =
            `/* OneUI sub-brand: ${sub.name} (${target.slug}/${sub.slug}) · v${VERSION} · ${new Date().toISOString()} */\n`
            + subScopedParts.join('\n');

          // 4. PARITY CHECK — verify (parent CSS + delta CSS) is observationally
          //    equivalent to the full sub-brand CSS on a sub-brand wrapper.
          //    Throws (fails the build) on any drift. The parent CSS we compare
          //    against is the same `combinedCSS` we just wrote to brands/<slug>/.
          for (let i = 0; i < themes.length; i++) {
            runDeltaParityCheck({
              parentCSS: parentScopedByTheme[i],
              deltaCSS: subScopedParts[i],
              fullSubCSS: fullScopedParts[i],
              parentSlug: target.slug,
              subSlug: sub.slug,
              theme: themes[i],
            });
          }

          const subEntry = writeThemeFiles(
            target.slug,
            sub.slug,
            sub.name,
            subCombinedCSS,
            subThemeConfig,
          );
          themeEntries.push(subEntry);
          subOkCount++;
          const savings = ((1 - subCombinedCSS.length / fullScopedParts.join('\n').length) * 100).toFixed(0);
          console.log(`    ✓ ${target.slug}/${sub.slug.padEnd(20)} ${(subCombinedCSS.length / 1024).toFixed(1)} KB delta (saves ${savings}% vs full)`);
        } catch (err) {
          subFailCount++;
          console.error(`    ✗ ${target.slug}/${sub.slug}: ${(err as Error).message}`);
        }
      }

      // Rewrite the brand-level index.json with the populated subBrands list.
      const brandIndexPath = join(OUT_DIR, 'brands', target.slug, 'index.json');
      if (existsSync(brandIndexPath)) {
        const m = JSON.parse(readFileSync(brandIndexPath, 'utf8')) as Record<string, unknown>;
        m.themes = themeEntries.map((e) => e.slug);
        writeFileSync(brandIndexPath, `${JSON.stringify(m, null, 2)}\n`);
      }

      globalEntries.push({ ...parentEntry, themes: themeEntries });
    } catch (err) {
      failCount++;
      console.error(`  ✗ ${target.slug}: ${(err as Error).message}`);
    }
  }

  // Top-level index — list of brand slugs the plugin can discover.
  writeFileSync(
    join(OUT_DIR, 'brands', 'index.json'),
    `${JSON.stringify({
      schemaVersion: 2,
      generatedAt: new Date().toISOString(),
      brands: globalEntries.map((e) => e.slug),
    }, null, 2)}\n`,
  );

  console.log(`\n→ Done. brands: ${okCount} ok / ${failCount} failed. sub-brands: ${subOkCount} ok / ${subFailCount} failed.`);
  console.log(`→ Output: ${OUT_DIR}/brands/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
