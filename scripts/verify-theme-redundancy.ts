#!/usr/bin/env tsx
/**
 * verify-theme-redundancy.ts
 *
 * RFC-0003 Option C regression check. Asserts the post-Option-C invariant:
 * the step-lookup CSS bakes both themes into a single string, where ONLY
 * per-role `*-Default` declarations live in `[data-theme]`-scoped overlay
 * blocks. Every other token resolves identically across themes at the
 * same step.
 *
 * The original purpose was to validate the eureka *precondition* across
 * 8 brand fixtures before landing Option C. After landing, we keep this
 * script as a structural regression check: if a future engine change
 * produces theme-dependent declarations beyond `*-Default`, this script
 * fails — and the pre-baking strategy needs revisiting.
 *
 * Run: pnpm tsx scripts/verify-theme-redundancy.ts
 */

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  buildAvailableScales,
  STEPS,
} from '@oneui/shared/engine';
import {
  buildNewPaletteData,
  generateNewStepLookupCSS,
} from '@oneui/ui/engine';

// ---------------------------------------------------------------------------
// Brand fixtures — covers the 4 seeded brands (jio-default, JioCinema,
// JioMart, JioHotStar) plus 4 additional combos that span the realistic
// range of primaryHue/Chroma/baseStep we expect from Convex foundations.
// ---------------------------------------------------------------------------

export type BrandFixture = {
  name: string;
  primary: string;     // hex
  secondary: string;   // hex
  baseStep: number;
};

/** Seeded + synthetic brand shapes for engine regression (also used by `dump-step-lookup-css.ts`). */
export const BRANDS: BrandFixture[] = [
  // 4 inspired by convex/seed.ts hue values, expressed as hex
  { name: 'jio-default',  primary: '#cc1f5e', secondary: '#c19a00', baseStep: 1500 },
  { name: 'jiocinema',    primary: '#e6005c', secondary: '#c19a00', baseStep: 1500 },
  { name: 'jiomart',      primary: '#0a8a3a', secondary: '#c19a00', baseStep: 1500 },
  { name: 'jiohotstar',   primary: '#d18900', secondary: '#cc1f5e', baseStep: 1500 },
  // 4 synthetic — span hue / chroma / baseStep variation
  { name: 'low-chroma',   primary: '#5a6a78', secondary: '#6a7a5a', baseStep: 1500 },
  { name: 'high-chroma',  primary: '#7a00c8', secondary: '#cc2a00', baseStep: 1500 },
  { name: 'shallow-base', primary: '#cc6a22', secondary: '#0066ff', baseStep: 1000 },
  { name: 'deep-base',    primary: '#a020c0', secondary: '#1aa05a', baseStep: 2000 },
];

export function buildFixturePalette(b: BrandFixture) {
  return buildConvexLikePalette({
    name: b.name,
    primary: b.primary,
    secondary: b.secondary,
    tertiary: '#00aa88',
    quaternary: '#aa00ff',
    sparkle: '#ff00aa',
    positive: '#00aa44',
    negative: '#cc0022',
    warning: '#ffaa00',
    informative: '#0088cc',
    baseStep: b.baseStep,
  });
}

/** Same shape as Convex color foundations: nine custom accent scales + shared baseStep for all roles. */
export type ConvexLikePaletteParams = {
  name: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  sparkle: string;
  positive: string;
  negative: string;
  warning: string;
  informative: string;
  baseStep: number;
};

export function buildConvexLikePalette(p: ConvexLikePaletteParams) {
  const colorConfig = {
    brandScales: [
      { name: 'Brand', source: 'custom' as const, baseColor: p.primary },
      { name: 'Secondary', source: 'custom' as const, baseColor: p.secondary },
      { name: 'Tertiary', source: 'custom' as const, baseColor: p.tertiary },
      { name: 'Quaternary', source: 'custom' as const, baseColor: p.quaternary },
      { name: 'Sparkle', source: 'custom' as const, baseColor: p.sparkle },
      { name: 'Positive', source: 'custom' as const, baseColor: p.positive },
      { name: 'Negative', source: 'custom' as const, baseColor: p.negative },
      { name: 'Warning', source: 'custom' as const, baseColor: p.warning },
      { name: 'Informative', source: 'custom' as const, baseColor: p.informative },
    ],
  };
  const appearanceConfig = {
    accentCount: 9,
    background: { scaleName: 'Neutral', backgroundStep: { light: 2500, dark: 100 } },
    accents: [
      { role: 'primary', label: 'Primary', scaleName: 'Brand', baseStep: p.baseStep },
      { role: 'secondary', label: 'Secondary', scaleName: 'Secondary', baseStep: p.baseStep },
      { role: 'tertiary', label: 'Tertiary', scaleName: 'Tertiary', baseStep: p.baseStep },
      { role: 'quaternary', label: 'Quaternary', scaleName: 'Quaternary', baseStep: p.baseStep },
      { role: 'sparkle', label: 'Sparkle', scaleName: 'Sparkle', baseStep: p.baseStep },
      { role: 'positive', label: 'Positive', scaleName: 'Positive', baseStep: p.baseStep },
      { role: 'negative', label: 'Negative', scaleName: 'Negative', baseStep: p.baseStep },
      { role: 'warning', label: 'Warning', scaleName: 'Warning', baseStep: p.baseStep },
      { role: 'informative', label: 'Informative', scaleName: 'Informative', baseStep: p.baseStep },
    ],
  };
  const scales = buildAvailableScales(colorConfig, null);
  const palette = buildNewPaletteData(scales, appearanceConfig);
  if (!palette) throw new Error(`palette failed for ${p.name}`);
  return palette;
}

/** Deterministic PRNG for reproducible sampling (`analyze-surface-step-lookup --sample`). */
export function mulberry32(seed: number): () => number {
  return function mulberry32Next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomHex6(rng: () => number): string {
  const n = Math.floor(rng() * 0xffffff);
  return `#${n.toString(16).padStart(6, '0')}`;
}

/** One random Convex-shaped palette (nine bases + anchor step on the 25-step ladder). */
export function randomConvexLikeParams(sampleIndex: number, seed: number): ConvexLikePaletteParams {
  const rng = mulberry32(seed ^ Math.imul(sampleIndex, 0x9e3779b1));
  const pickStep = () => STEPS[Math.floor(rng() * STEPS.length)]!;
  return {
    name: `random-${sampleIndex}`,
    primary: randomHex6(rng),
    secondary: randomHex6(rng),
    tertiary: randomHex6(rng),
    quaternary: randomHex6(rng),
    sparkle: randomHex6(rng),
    positive: randomHex6(rng),
    negative: randomHex6(rng),
    warning: randomHex6(rng),
    informative: randomHex6(rng),
    baseStep: pickStep(),
  };
}

// ---------------------------------------------------------------------------
// Parse the combined step-lookup output into three groups:
//  - theme-agnostic blocks: `[data-surface-step="N"] { ... }`
//  - light overlay blocks:  `[data-theme="light"] [data-surface-step="N"] { ... }`
//  - dark  overlay blocks:  `[data-theme="dark"]  [data-surface-step="N"] { ... }`
// ---------------------------------------------------------------------------

type ParsedBlocks = {
  agnostic: Map<string, Map<string, string>>;
  light: Map<string, Map<string, string>>;
  dark: Map<string, Map<string, string>>;
};

function parseDecls(body: string): Map<string, string> {
  const decls = new Map<string, string>();
  for (const line of body.split(';')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const prop = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (prop.startsWith('--')) decls.set(prop, val);
  }
  return decls;
}

function parseBlocks(css: string): ParsedBlocks {
  const out: ParsedBlocks = { agnostic: new Map(), light: new Map(), dark: new Map() };
  // Theme-overlay blocks first (matched before bare blocks to avoid ambiguity).
  const overlayRe = /\[data-theme="(light|dark)"\]\s+\[data-surface-step="(\d+)"\]\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = overlayRe.exec(css)) !== null) {
    const bucket = m[1] === 'light' ? out.light : out.dark;
    bucket.set(m[2], parseDecls(m[3]));
  }
  // Bare blocks: same regex but anchored to a non-overlay context. We strip
  // overlay blocks first, then match.
  const stripped = css.replace(overlayRe, '');
  const bareRe = /\[data-surface-step="(\d+)"\]\s*\{([^}]*)\}/g;
  while ((m = bareRe.exec(stripped)) !== null) {
    out.agnostic.set(m[1], parseDecls(m[2]));
  }
  return out;
}

function runVerificationCli(): void {
  const results: Array<{
    brand: string;
    agnosticDecls: number;
    agnosticHasDefault: boolean;
    lightOverlayDecls: number;
    darkOverlayDecls: number;
    overlayHasNonDefault: boolean;
    overlayValuesDiffer: boolean;
    totalBytes: number;
    pass: boolean;
  }> = [];

  let allPass = true;

    for (const b of BRANDS) {
    const palette = buildFixturePalette(b);
    const css = generateNewStepLookupCSS(palette);
    const parsed = parseBlocks(css);

    // Sum sizes
    let agnosticDecls = 0;
    let agnosticHasDefault = false;
    for (const decls of parsed.agnostic.values()) {
      agnosticDecls += decls.size;
      for (const prop of decls.keys()) {
        if (/^--[A-Za-z][\w-]*-Default$/.test(prop)) agnosticHasDefault = true;
      }
    }
    let lightOverlayDecls = 0;
    let darkOverlayDecls = 0;
    let overlayHasNonDefault = false;
    for (const decls of parsed.light.values()) {
      lightOverlayDecls += decls.size;
      for (const prop of decls.keys()) {
        if (!/^--[A-Za-z][\w-]*-Default$/.test(prop)) overlayHasNonDefault = true;
      }
    }
    for (const decls of parsed.dark.values()) {
      darkOverlayDecls += decls.size;
      for (const prop of decls.keys()) {
        if (!/^--[A-Za-z][\w-]*-Default$/.test(prop)) overlayHasNonDefault = true;
      }
    }

    // Sanity: light overlay value ≠ dark overlay value for at least one prop.
    let overlayValuesDiffer = false;
    for (const [step, lightDecls] of parsed.light) {
      const darkDecls = parsed.dark.get(step);
      if (!darkDecls) continue;
      for (const [prop, lv] of lightDecls) {
        if (darkDecls.get(prop) !== lv) { overlayValuesDiffer = true; break; }
      }
      if (overlayValuesDiffer) break;
    }

    const pass = !agnosticHasDefault && !overlayHasNonDefault && overlayValuesDiffer
      && lightOverlayDecls > 0 && darkOverlayDecls > 0;
    if (!pass) allPass = false;

    results.push({
      brand: b.name,
      agnosticDecls,
      agnosticHasDefault,
      lightOverlayDecls,
      darkOverlayDecls,
      overlayHasNonDefault,
      overlayValuesDiffer,
      totalBytes: css.length,
      pass,
    });
  }

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------

  console.log('\nTheme redundancy verification — RFC-0003 Option C structural check');
  console.log('====================================================================\n');
  console.log('Per-brand results:');
  console.log(
    ['Brand', 'Agnostic', 'L-Overlay', 'D-Overlay', 'Bytes', 'A-clean', 'O-clean', 'L≠D', 'Pass'].join('\t'),
  );
  for (const r of results) {
    console.log(
      [
        r.brand.padEnd(14),
        r.agnosticDecls,
        r.lightOverlayDecls,
        r.darkOverlayDecls,
        r.totalBytes,
        r.agnosticHasDefault ? 'NO' : 'yes',
        r.overlayHasNonDefault ? 'NO' : 'yes',
        r.overlayValuesDiffer ? 'yes' : 'NO',
        r.pass ? 'PASS' : 'FAIL',
      ].join('\t'),
    );
  }

  console.log('');
  console.log('Legend:');
  console.log('  A-clean: theme-agnostic block has NO *-Default decls');
  console.log('  O-clean: overlay blocks have ONLY *-Default decls');
  console.log('  L≠D:     light and dark overlay values differ (overlays are meaningful)');
  console.log('');

  if (allPass) {
    console.log('✔ Verification PASSED across all', results.length, 'brand fixtures.');
    console.log('  → Option C structure is intact: theme-toggle is a CSS attribute flip.');
    process.exit(0);
  } else {
    console.log('✘ Verification FAILED — Option C invariant broken for at least one brand.');
    console.log('  See the columns above (A-clean / O-clean / L≠D) for which check tripped.');
    process.exit(1);
  }
}

const invokedArg = process.argv[1];
const isVerifyMain =
  Boolean(invokedArg) &&
  pathToFileURL(resolve(invokedArg!)).href === import.meta.url;

if (isVerifyMain) {
  runVerificationCli();
}
