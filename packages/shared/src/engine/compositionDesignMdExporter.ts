/**
 * compositionDesignMdExporter.ts
 *
 * Emits a brand's design system as a Google-Labs `design.md` file
 * (https://github.com/google-labs-code/design.md).
 *
 * One file per brand. Framework-agnostic pure function — usable from client,
 * server, or a CLI. No I/O.
 *
 * Output structure:
 *   1. YAML front-matter (colors, typography, rounded, spacing, components)
 *   2. Canonical markdown sections in order (Overview → Colors → Typography
 *      → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts)
 *   3. OneUI extension sections (## Surfaces, ## Surface Context,
 *      ## Attention Hierarchy, ## Contexts, ## Skills) — the `design.md`
 *      spec explicitly preserves unknown headings.
 *
 * Rule-to-section mapping:
 *   surface-application     → ## Surfaces + ## Surface Context
 *   attention-flow          → ## Attention Hierarchy
 *   typography-hierarchy    → appended under ## Typography
 *   color-role-usage        → appended under ## Colors
 *   spacing-rhythm          → appended under ## Layout
 *   component-selection     → appended under ## Components
 *   accessibility-layout    → appended under ## Do's and Don'ts
 *   navigation-patterns     → appended under ## Do's and Don'ts
 *   responsive-adaptation   → appended under ## Layout
 *   motion-elevation        → appended under ## Elevation & Depth
 *   layout-structure        → appended under ## Layout
 *   vertical-specifics      → appended under ## Overview
 */

import { buildAvailableScales } from './buildAvailableScales';
import { oklchToHex } from '../utils/colorScale';
import {
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  FONT_WEIGHTS,
  type TypographyRole,
} from '../data/typography-roles';
import {
  getDimensionValue,
  type BreakpointId,
  type DensityId,
  type FStep,
} from '../data/dimension-scales';
import type {
  CompositionRule,
  ResolvedCompositionRule,
  CompositionSkill,
} from './compositionTypes';

// ============================================================================
// Types
// ============================================================================

export interface DesignMdExporterBrand {
  name: string;
  slug: string;
  description?: string;
  primaryHue: number;
  primaryChroma: number;
  secondaryHue?: number;
  secondaryChroma?: number;
}

/**
 * Opaque color-foundation shape — matches the internal `ColorFoundationConfig`
 * that `buildAvailableScales` accepts. We leave it loosely typed here so
 * callers can pass through whatever `brandOverviewData.color.config` returns.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DesignMdColorConfig = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DesignMdPresetSelection = any;

/**
 * Skill shape accepted by the exporter — structurally compatible with both
 * `CompositionSkill` (TS type, narrow `CompositionContext` union) and the
 * raw Convex row (string-typed `applicableContexts`). Callers pass either.
 *
 * `applicableContexts` is widened to `string[]` because the exporter only
 * uses it for prose; narrowing to `CompositionContext[]` would force every
 * caller to cast Convex rows.
 */
export type DesignMdSkill = Pick<
  CompositionSkill,
  'skillId' | 'name' | 'description' | 'category'
> & {
  applicableContexts: readonly string[];
  /**
   * Skill template body. When supplied, an excerpt is emitted under
   * `**Recipe:**` so external agents see the actual composition recipe, not
   * just metadata. Optional so test fixtures and partial inputs still
   * type-check.
   */
  systemPromptTemplate?: string;
  archetype?: string;
  vertical?: string;
  dosDonts?: string[];
  attentionPattern?: string;
};

export interface DesignMdExporterInput {
  brand: DesignMdExporterBrand;
  /**
   * Optional. If provided, scales are computed via `buildAvailableScales`
   * and flattened to hex. If omitted, a minimal primary scale is derived
   * from `brand.primaryHue` / `brand.primaryChroma` via direct OkLCH → hex.
   */
  colorConfig?: DesignMdColorConfig | null;
  presetSelection?: DesignMdPresetSelection | null;
  /**
   * Resolved rules (base + brand overrides merged). Pass the output of
   * `api.compositionRules.getResolved` directly. If empty, canonical sections
   * render with no rule content (YAML still lints clean).
   */
  rules?: Array<ResolvedCompositionRule | CompositionRule>;
  /**
   * Active skills for this brand. Skills are vertical-specific composition
   * recipes (e.g., `e-commerce-product-grid`). Each skill produces a
   * subsection under `## Skills` plus a manifest entry in front-matter.
   * Pass `api.compositionSkills.list({ brandId })` filtered to `isActive`.
   */
  skills?: DesignMdSkill[];
  /** Optional `## Contexts` section content. If omitted, section is skipped. */
  defaultContext?: string;
  /**
   * Brand vertical (entertainment / e-commerce / finance / …). When set, the
   * `vertical-specifics` rule's content is filtered to just the matching
   * line — otherwise the export carries every vertical's guidance, which
   * makes the file feel generic instead of brand-specific.
   */
  vertical?: string;
  /**
   * Brand layout personality (density + expressiveness, 0–100 each). When set,
   * a short personality paragraph is added to Overview so the file reads as
   * the brand's design system rather than as raw OneUI documentation.
   */
  layoutPersonality?: { density: number; expressiveness: number };
  /** Breakpoint to resolve f-step → px against. Defaults to `'S'`. */
  platform?: BreakpointId;
  /** Density to resolve f-step → px against. Defaults to `'default'`. */
  density?: DensityId;
  /**
   * Semantic version of THIS exporter's output shape. Bumped whenever the
   * structure of the emitted file changes. Emitted as an extension key so
   * downstream consumers can detect breaking changes.
   */
  oneuiVersion?: string;
  /** Brand primary font family. Defaults to 'Public Sans'. */
  fontFamilyPrimary?: string;
  /** Brand monospace/code font family. Defaults to 'JetBrains Mono'. */
  fontFamilyCode?: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Bumped when the emitted file structure changes shape. */
const EXPORTER_OUTPUT_VERSION = '1';

/**
 * Tone targets that drive the fallback hex generator. These are NOT canonical
 * OneUI scale-step indices — they're tone weights used to pick lightness via
 * `fallbackHexForStep`'s anchor table. The real palette path goes through
 * `buildAvailableScales(colorConfig, presetSelection)`, which uses canonical
 * scale steps directly (engine convention: step 100 = darkest, 2500 = lightest).
 */
const ROLE_STEPS = {
  subtle: 200,
  medium: 500,
  bold: 700,
  boldHover: 800,
  high: 1900,
  low: 1500,
} as const;

/**
 * Subset of f-steps that map to `rounded.*` tokens in design.md.
 * Picks steps that resolve to the conventional 4/8/16/24/32 px progression
 * on the default platform/density; don't match 1:1 with `--Shape-*` tokens.
 */
const ROUNDED_MAP: Array<{ key: string; fStep: FStep }> = [
  { key: 'sm', fStep: 'f-6' }, // 4px
  { key: 'md', fStep: 'f-4' }, // 8px
  { key: 'lg', fStep: 'f0' }, //  16px
  { key: 'xl', fStep: 'f3' }, //  24px
  { key: '2xl', fStep: 'f5' }, // 32px
];

/**
 * Subset of f-steps that map to numeric `spacing` tokens in design.md.
 * Picks the conventional 4/8/16/24/32/48 px progression so external agents
 * see familiar values while keeping the OneUI spacing vocabulary.
 */
const SPACING_MAP: Array<{ key: string; fStep: FStep }> = [
  { key: '1', fStep: 'f-6' }, // 4px
  { key: '2', fStep: 'f-4' }, // 8px
  { key: '4', fStep: 'f0' }, //  16px
  { key: '6', fStep: 'f3' }, //  24px
  { key: '8', fStep: 'f5' }, //  32px
  { key: '12', fStep: 'f8' }, // 48px
];

/** Typography keys we emit. Matches the audit doc's worked example. */
const TYPOGRAPHY_EMITS: Array<{ key: string; role: TypographyRole; size: string }> = [
  { key: 'display-l', role: 'display', size: 'L' },
  { key: 'display-m', role: 'display', size: 'M' },
  { key: 'headline-l', role: 'headline', size: 'L' },
  { key: 'headline-m', role: 'headline', size: 'M' },
  { key: 'title-m', role: 'title', size: 'M' },
  { key: 'title-s', role: 'title', size: 'S' },
  { key: 'body-m', role: 'body', size: 'M' },
  { key: 'body-s', role: 'body', size: 'S' },
  { key: 'label-m', role: 'label', size: 'M' },
  { key: 'label-s', role: 'label', size: 'S' },
  { key: 'code-m', role: 'code', size: 'M' },
];

// ============================================================================
// Helpers
// ============================================================================

function pxToRem(px: number): string {
  const rem = px / 16;
  // Keep 3 significant digits; drop trailing zeros.
  return `${parseFloat(rem.toFixed(3))}rem`;
}

function fStepToRem(fStep: FStep, platform: BreakpointId, density: DensityId): string {
  return pxToRem(getDimensionValue(platform, density, fStep));
}

function fStepToPx(fStep: FStep, platform: BreakpointId, density: DensityId): string {
  return `${getDimensionValue(platform, density, fStep)}px`;
}

/**
 * Resolves role weight for body/label/code (emphasis system) or display/headline/title
 * (fixed per-size). Returns 400 as a safe default for unknown combinations.
 */
function resolveFontWeight(role: TypographyRole, size: string): number {
  const weights = FONT_WEIGHTS[role];
  if (!weights) return 400;
  const direct = (weights as Record<string, number>)[size];
  if (typeof direct === 'number') return direct;
  // body/label/code use emphasis keys — default body to low (400), label to medium (500).
  if (role === 'label') return (weights as Record<string, number>).medium ?? 500;
  return (weights as Record<string, number>).low ?? 400;
}

function computeLineHeightRem(
  role: TypographyRole,
  fStep: FStep,
  platform: BreakpointId,
  density: DensityId,
): string {
  const offset = DEFAULT_LINE_HEIGHT_OFFSETS[role] ?? 0;
  const match = fStep.match(/^f(-?\d+)$/);
  if (!match) return fStepToRem(fStep, platform, density);
  const baseIndex = parseInt(match[1], 10);
  const targetIndex = baseIndex + offset;
  const targetStep = `f${targetIndex}` as FStep;
  try {
    return fStepToRem(targetStep, platform, density);
  } catch {
    return fStepToRem(fStep, platform, density);
  }
}

/**
 * Builds a minimal fallback hex for a role when no `colorConfig` is provided.
 * Uses fixed lightness values against the brand's OkLCH hue/chroma. The output
 * is a rough approximation of the full 25-step scale — accurate enough for a
 * `design.md` export but not a replacement for `buildAvailableScales`.
 *
 * Chroma tapers at lightness extremes (parabolic fade to zero at L=0 and
 * L=100) — without it, near-white and near-black steps push out of sRGB
 * gamut and the RGB clamp produces cyan / magenta artifacts.
 */
function fallbackHexForStep(hue: number, chroma: number, step: number): string {
  const anchors: Array<[number, number]> = [
    [100, 96],
    [200, 90],
    [300, 84],
    [500, 62],
    [700, 48],
    [800, 42],
    [900, 36],
    [1500, 28],
    [1900, 18],
    [2500, 5],
  ];
  let loIdx = 0;
  for (let i = 0; i < anchors.length - 1; i++) {
    if (step >= anchors[i][0] && step <= anchors[i + 1][0]) {
      loIdx = i;
      break;
    }
    if (step >= anchors[i + 1][0]) loIdx = i + 1;
  }
  const [loStep, loL] = anchors[Math.min(loIdx, anchors.length - 1)];
  const [hiStep, hiL] = anchors[Math.min(loIdx + 1, anchors.length - 1)];
  const span = hiStep - loStep || 1;
  const t = (step - loStep) / span;
  const L = loL + (hiL - loL) * t;

  // Chroma taper: peak at L=50, fade to 0 at L=0 and L=100 (parabolic).
  // Near-neutral steps (1900+) get additional compression so dark colors
  // stay perceptually "dark" rather than drifting to saturated navy.
  const distFrom50 = Math.abs(L - 50) / 50;
  const taper = Math.max(0, 1 - distFrom50 * distFrom50);
  const adjustedChroma = chroma * taper;

  return oklchToHex(L, adjustedChroma, hue);
}

function safeHex(hex: string | undefined, fallback: string): string {
  if (!hex) return fallback;
  if (!hex.startsWith('#') || hex.includes('NaN')) return fallback;
  return hex;
}

/**
 * Pull the bullet matching `vertical` from a `vertical-specifics` rule body
 * shaped like:
 *   E-commerce: ...
 *   Entertainment: ...
 * If no bullet matches, return the whole body so we don't drop content.
 */
function filterVerticalContent(content: string, vertical: string | undefined): string {
  if (!vertical || vertical === 'general') return content;
  const lines = content.split('\n');
  const target = vertical.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matching = lines.filter((line) => {
    const head = line.split(':')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
    return head === target || head.includes(target) || target.includes(head);
  });
  if (matching.length === 0) return content;
  // Keep the leading "Apply by ..." sentence if present, then the matching line.
  const intro = lines.find((l) => /^\s*Apply\b|^\s*Vertical\b/i.test(l));
  return [intro, ...matching].filter(Boolean).join('\n');
}

/**
 * Tone summary derived from the brand's layout-personality dials. Empty when
 * dials are absent or sit at the neutral midpoint.
 */
function personalityToneLine(
  personality: { density: number; expressiveness: number } | undefined,
): string {
  if (!personality) return '';
  const densityLabel =
    personality.density < 35 ? 'spacious' : personality.density >= 65 ? 'compact' : 'balanced';
  const expressivenessLabel =
    personality.expressiveness < 35
      ? 'minimal'
      : personality.expressiveness >= 65
        ? 'bold'
        : 'balanced';
  if (densityLabel === 'balanced' && expressivenessLabel === 'balanced') return '';
  return `Tone: ${densityLabel} layouts, ${expressivenessLabel} visual expression.`;
}

const SKILL_BODY_LIMIT = 600;

/** Truncate a skill template at `SKILL_BODY_LIMIT` chars on a sentence boundary. */
function truncateSkillBody(template: string): string {
  const trimmed = template.trim();
  if (trimmed.length <= SKILL_BODY_LIMIT) return trimmed;
  const slice = trimmed.slice(0, SKILL_BODY_LIMIT);
  // Prefer cutting at the last full sentence; fall back to the last newline.
  const sentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('.\n'));
  const lineEnd = slice.lastIndexOf('\n');
  const cut = sentenceEnd > 200 ? sentenceEnd + 1 : lineEnd > 200 ? lineEnd : SKILL_BODY_LIMIT;
  return `${trimmed.slice(0, cut).trimEnd()}\n\n_(truncated — full template lives in Convex.)_`;
}

// ============================================================================
// Palette flattening
// ============================================================================

interface FlatPalette {
  primary: string;
  primaryBold: string;
  primarySubtle: string;
  primaryBoldHover: string;
  onPrimaryBold: string;
  onPrimarySubtle: string;
  secondary: string;
  neutralPage: string;
  neutralBold: string;
  textHigh: string;
  textMedium: string;
  textLow: string;
}

function resolveScales(
  brand: DesignMdExporterBrand,
  colorConfig: DesignMdColorConfig | null | undefined,
  presetSelection: DesignMdPresetSelection | null | undefined,
): FlatPalette {
  // Try the full engine first.
  let scales: ReturnType<typeof buildAvailableScales> = [];
  if (colorConfig) {
    try {
      scales = buildAvailableScales(colorConfig, presetSelection ?? null);
    } catch {
      scales = [];
    }
  }

  const lookup = (scaleName: string, step: number): string | undefined => {
    const scale = scales.find((s) => s.name.toLowerCase() === scaleName.toLowerCase());
    return scale?.colors?.find((c) => c.step === step)?.hex;
  };

  const fallback = (hue: number, chroma: number, step: number) =>
    fallbackHexForStep(hue, chroma, step);

  // Primary (brand color)
  const primary = safeHex(
    lookup('primary', ROLE_STEPS.medium),
    fallback(brand.primaryHue, brand.primaryChroma, ROLE_STEPS.medium),
  );
  const primaryBold = safeHex(
    lookup('primary', ROLE_STEPS.bold),
    fallback(brand.primaryHue, brand.primaryChroma, ROLE_STEPS.bold),
  );
  const primarySubtle = safeHex(
    lookup('primary', ROLE_STEPS.subtle),
    fallback(brand.primaryHue, brand.primaryChroma, ROLE_STEPS.subtle),
  );
  const primaryBoldHover = safeHex(
    lookup('primary', ROLE_STEPS.boldHover),
    fallback(brand.primaryHue, brand.primaryChroma, ROLE_STEPS.boldHover),
  );

  // Secondary — fall back to neutral-grey if brand doesn't define one.
  const secHue = brand.secondaryHue ?? 240;
  const secChroma = brand.secondaryChroma ?? 0.02;
  const secondary = safeHex(
    lookup('secondary', ROLE_STEPS.medium),
    fallback(secHue, secChroma, ROLE_STEPS.medium),
  );

  // Neutral / text — emit light-mode values. OneUI engine convention:
  // step 100 = darkest, step 2500 = lightest (see CLAUDE.md § Surfaces).
  // Page background = step 2500 (light), bold/text = step 100 / low steps.
  const neutralPage = safeHex(lookup('neutral', 2500), '#FFFFFF');
  const neutralBold = safeHex(lookup('neutral', 100), '#0A0B0D');
  const textHigh = safeHex(lookup('neutral', 100), '#0A0B0D');
  const textMedium = safeHex(lookup('neutral', 500), '#3F4249');
  const textLow = safeHex(lookup('neutral', 1000), '#6B6F78');

  return {
    primary,
    primaryBold,
    primarySubtle,
    primaryBoldHover,
    onPrimaryBold: '#FFFFFF',
    onPrimarySubtle: primaryBold,
    secondary,
    neutralPage,
    neutralBold,
    textHigh,
    textMedium,
    textLow,
  };
}

// ============================================================================
// YAML serialization (minimal, hand-rolled — no dependency)
// ============================================================================

type YamlScalar = string | number;
type YamlMapValue = YamlScalar | Record<string, YamlScalar>;

function escapeYamlString(value: string): string {
  // Double-quote anything that looks like it could be parsed as a non-string.
  if (value === '') return '""';
  if (/[:#{}[\]|>&*!%@`\n\r]/.test(value) || /^[-?.,]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

function isYamlNestedMap(value: YamlMapValue): value is Record<string, YamlScalar> {
  return typeof value === 'object' && value !== null;
}

function emitScalarLine(key: string, value: YamlScalar, indent: number): string {
  const pad = ' '.repeat(indent);
  if (typeof value === 'number') return `${pad}${key}: ${value}\n`;
  return `${pad}${key}: ${escapeYamlString(value)}\n`;
}

function emitBlockMap(
  key: string,
  entries: Array<[string, YamlMapValue]>,
  indent: number,
): string {
  const pad = ' '.repeat(indent);
  let out = `${pad}${key}:\n`;
  for (const [k, v] of entries) {
    if (isYamlNestedMap(v)) {
      out += `${pad}  ${k}:\n`;
      for (const [sk, sv] of Object.entries(v)) {
        out += emitScalarLine(sk, sv, indent + 4);
      }
    } else {
      out += emitScalarLine(k, v, indent + 2);
    }
  }
  return out;
}

// ============================================================================
// Main export
// ============================================================================

export function serializeBrandToDesignMd(input: DesignMdExporterInput): string {
  // The S breakpoint (base 16) emits whole-pixel f-step values
  // (f-6=4, f0=16, f3=24, ...). Wider breakpoints use larger base sizes and
  // can yield fractional values. design.md is a HUMAN-readable spec for
  // external AI agents — fractional pixels confuse downstream readers and
  // contradict the prose body ("rounded.sm (4 px), rounded.lg (16 px)").
  // Callers can still override by passing `platform` explicitly when a
  // different baseline is desired.
  const platform = input.platform ?? 'S';
  const density = input.density ?? 'default';
  const fontFamilyPrimary = input.fontFamilyPrimary ?? 'Public Sans';
  const fontFamilyCode = input.fontFamilyCode ?? 'JetBrains Mono';
  const palette = resolveScales(input.brand, input.colorConfig, input.presetSelection);

  // ── Front-matter ────────────────────────────────────────────────────────
  let yaml = '---\n';
  yaml += 'version: alpha\n';
  yaml += `oneui-version: ${input.oneuiVersion ?? EXPORTER_OUTPUT_VERSION}\n`;
  yaml += emitScalarLine('name', input.brand.name, 0);
  if (input.brand.description) {
    yaml += emitScalarLine('description', input.brand.description, 0);
  }

  // Colors
  yaml += emitBlockMap(
    'colors',
    [
      ['primary', palette.primary],
      ['primary-bold', palette.primaryBold],
      ['primary-subtle', palette.primarySubtle],
      ['primary-bold-hover', palette.primaryBoldHover],
      ['on-primary-bold', palette.onPrimaryBold],
      ['on-primary-subtle', palette.onPrimarySubtle],
      ['secondary', palette.secondary],
      ['neutral-page', palette.neutralPage],
      ['neutral-bold', palette.neutralBold],
      ['text-high', palette.textHigh],
      ['text-medium', palette.textMedium],
      ['text-low', palette.textLow],
      ['text-on-bold-high', '{colors.on-primary-bold}'],
    ],
    0,
  );

  // Typography
  yaml += 'typography:\n';
  for (const { key, role, size } of TYPOGRAPHY_EMITS) {
    const fStepMap = DEFAULT_FSTEP_ASSIGNMENTS[role];
    const fStep = fStepMap?.[size];
    if (!fStep) continue;
    const fontSize = fStepToRem(fStep, platform, density);
    const lineHeight = computeLineHeightRem(role, fStep, platform, density);
    const fontWeight = resolveFontWeight(role, size);
    const fontFamily = role === 'code' ? fontFamilyCode : fontFamilyPrimary;
    yaml += `  ${key}:\n`;
    yaml += `    fontFamily: ${escapeYamlString(fontFamily)}\n`;
    yaml += `    fontSize: ${fontSize}\n`;
    yaml += `    fontWeight: ${fontWeight}\n`;
    yaml += `    lineHeight: ${lineHeight}\n`;
  }

  // Rounded
  yaml += 'rounded:\n';
  yaml += '  none: 0px\n';
  for (const { key, fStep } of ROUNDED_MAP) {
    yaml += `  ${key}: ${fStepToPx(fStep, platform, density)}\n`;
  }
  yaml += '  pill: 9999px\n';

  // Spacing
  yaml += 'spacing:\n';
  for (const { key, fStep } of SPACING_MAP) {
    yaml += `  ${key}: ${fStepToPx(fStep, platform, density)}\n`;
  }

  // Components — static pieces only. Context-aware behavior goes in prose.
  const buttonPad = fStepToPx('f-2', platform, density); // 12px on S/default
  const cardPad = fStepToPx('f0', platform, density); //   16px on S/default
  yaml += 'components:\n';
  yaml += '  button-bold:\n';
  yaml += '    backgroundColor: "{colors.primary-bold}"\n';
  yaml += '    textColor: "{colors.on-primary-bold}"\n';
  yaml += '    rounded: "{rounded.pill}"\n';
  yaml += `    padding: ${buttonPad}\n`;
  yaml += '    typography: "{typography.label-m}"\n';
  yaml += '  button-bold-hover:\n';
  yaml += '    backgroundColor: "{colors.primary-bold-hover}"\n';
  yaml += '  button-subtle:\n';
  yaml += '    backgroundColor: "{colors.primary-subtle}"\n';
  yaml += '    textColor: "{colors.on-primary-subtle}"\n';
  yaml += '    rounded: "{rounded.pill}"\n';
  yaml += `    padding: ${buttonPad}\n`;
  yaml += '    typography: "{typography.label-m}"\n';
  yaml += '  button-ghost:\n';
  yaml += '    backgroundColor: transparent\n';
  yaml += '    textColor: "{colors.on-primary-subtle}"\n';
  yaml += '    rounded: "{rounded.pill}"\n';
  yaml += `    padding: ${buttonPad}\n`;
  yaml += '  card-default:\n';
  yaml += '    backgroundColor: "{colors.neutral-page}"\n';
  yaml += '    rounded: "{rounded.lg}"\n';
  yaml += `    padding: ${cardPad}\n`;
  yaml += '---\n\n';

  // ── Markdown body ───────────────────────────────────────────────────────
  const rules = input.rules ?? [];
  const byId = new Map<string, CompositionRule | ResolvedCompositionRule>();
  for (const r of rules) {
    if (r.isActive !== false) byId.set(r.sectionId, r);
  }
  const sectionContent = (sectionId: string): string | null => {
    const rule = byId.get(sectionId);
    if (!rule || !rule.content) return null;
    return rule.content.trim();
  };

  const brandName = input.brand.name;

  let md = '';

  // ## Overview
  md += '## Overview\n\n';
  if (input.brand.description) {
    md += `${input.brand.description}\n\n`;
  } else {
    // Brand description isn't set in Convex — write a short narrative seeded
    // from the brand's primary colour, vertical, and personality so the file
    // still reads like *this brand's* spec rather than raw OneUI documentation.
    const driver = `\`${palette.primary}\` is the single interaction driver`;
    const verticalPhrase =
      input.vertical && input.vertical !== 'general'
        ? ` Built for the ${input.vertical} vertical.`
        : '';
    md += `${brandName}.${verticalPhrase} ${personalityToneLine(input.layoutPersonality) || 'Balanced layouts, balanced expression.'} ${driver}; the rest of the palette is chrome and status.\n\n`;
  }
  const verticalContent = sectionContent('vertical-specifics');
  if (verticalContent) {
    md += `${filterVerticalContent(verticalContent, input.vertical)}\n\n`;
  }

  // ## Colors
  md += '## Colors\n\n';
  md += `Primary (\`${palette.primary}\`) is the single interaction driver. Use \`primary-bold\` only on the top-attention element per viewport; \`primary-subtle\` is the medium-attention fill. \`secondary\` is chrome, not decoration. Positive / negative / warning / informative are reserved for status signalling only.\n\n`;
  const colorContent = sectionContent('color-role-usage');
  if (colorContent) md += `${colorContent}\n\n`;

  // ## Typography
  md += '## Typography\n\n';
  md += `${fontFamilyPrimary} carries the full hierarchy${fontFamilyCode !== fontFamilyPrimary ? `; ${fontFamilyCode} is reserved for code surfaces` : ''}. Weights follow the emphasis system: display/headline/title are always 800+; body defaults to 400 (low emphasis); label uses 500 (medium) for UI chrome. Line heights are relational — generated from dimension f-steps so platform and density can shift the whole scale at once. Always pair a size token with its matching line-height token.\n\n`;
  const typoContent = sectionContent('typography-hierarchy');
  if (typoContent) md += `${typoContent}\n\n`;

  // ## Layout
  md += '## Layout\n\n';
  md += `Mobile-first scale (4 / 8 / 16 / 24 / 32 / 48 px). Touch targets ≥ 44×44 on mobile, 24×24 on desktop. Use \`spacing['4']\` between related items, \`spacing['8']\`–\`spacing['12']\` between major sections. Never mix spacing scales within a single view.\n\n`;
  const layoutContent = sectionContent('layout-structure');
  if (layoutContent) md += `${layoutContent}\n\n`;
  const spacingContent = sectionContent('spacing-rhythm');
  if (spacingContent) md += `${spacingContent}\n\n`;
  const responsiveContent = sectionContent('responsive-adaptation');
  if (responsiveContent) md += `${responsiveContent}\n\n`;

  // ## Elevation & Depth
  md += '## Elevation & Depth\n\n';
  md += `Elevation is a two-shadow formula (levels 0–5). Dark mode uses a 1 px stroke in place of a shadow. Prefer elevation 0 on content cards — the surface tint already conveys grouping. Motion durations follow a discreet (quick) / expressive (emphatic) timing split; never hardcode ms values.\n\n`;
  const motionContent = sectionContent('motion-elevation');
  if (motionContent) md += `${motionContent}\n\n`;

  // ## Shapes
  md += '## Shapes\n\n';
  md += `Buttons are pill-shaped (\`rounded.pill\`). Inputs, chips, selects use \`rounded.sm\` (4 px). Cards use \`rounded.lg\` (16 px). Avatars are fully circular. Never mix shape scales on a single screen.\n\n`;

  // ## Components
  md += '## Components\n\n';
  md += `Buttons come in three attention levels that map directly to surface modes: \`bold\` (high), \`subtle\` (medium), \`ghost\` (low). Inside a \`<Surface mode="bold">\` container the same three tokens automatically remap for contrast — never swap colours manually.\n\n`;
  const componentContent = sectionContent('component-selection');
  if (componentContent) md += `${componentContent}\n\n`;

  // ## Do's and Don'ts
  md += "## Do's and Don'ts\n\n";
  md += "**Do:** wrap branded heroes in `<Surface mode=\"bold\">`. Let buttons inside inherit. Stay on the token scale.\n\n";
  md += "**Don't:** set `background` on a raw `<div>` and expect child colours to adapt — they won't. Don't add decorative strokes to tinted cards: the fill is the boundary. Don't skip typography tokens for \"just one\" micro-copy — the brand font-family cascade will silently drop.\n\n";
  const a11yContent = sectionContent('accessibility-layout');
  if (a11yContent) md += `${a11yContent}\n\n`;
  const navContent = sectionContent('navigation-patterns');
  if (navContent) md += `${navContent}\n\n`;

  // ── OneUI extension sections (preserved by the linter) ──────────────────

  // ## Surfaces
  md += '## Surfaces\n\n';
  md += `*(OneUI extension — not part of canonical \`design.md\`. Preserved by the linter.)*\n\n`;
  md += `Seven surface tokens, each resolved relative to the parent's step:\n\n`;
  md += `- \`default\` — page surface; step 2500 light / 100 dark.\n`;
  md += `- \`ghost\` — same step as parent (still triggers context remapping).\n`;
  md += `- \`minimal\` — parent + 1 step toward contrast.\n`;
  md += `- \`subtle\` — parent + 2 steps.\n`;
  md += `- \`moderate\` — parent + 3 steps.\n`;
  md += `- \`bold\` — role's baseStep; dramatic.\n`;
  md += `- \`elevated\` — parent + 1 step toward lighter; floating panels.\n\n`;

  // ## Surface Context
  md += '## Surface Context\n\n';
  md += `*(OneUI extension.)*\n\n`;
  md += `Components adapt automatically via CSS token remapping when placed inside \`<Surface mode="...">\`. A raw \`<div>\` with \`background:\` is outside this cascade and will leave child components with broken contrast (e.g. dark text on a dark bold surface). **Always use \`<Surface>\` for non-default backgrounds.**\n\n`;
  const surfaceContent = sectionContent('surface-application');
  if (surfaceContent) md += `${surfaceContent}\n\n`;

  // ## Attention Hierarchy
  md += '## Attention Hierarchy\n\n';
  md += `*(OneUI extension.)*\n\n`;
  md += `Per viewport, aim for: **5 %** high-attention (one bold element), **10 %** medium-attention (2–3 subtle tints), **25 %** low-attention (chrome, links), **60 %** no-attention (page, body, whitespace). If two elements compete for "high", the page is already broken — demote one.\n\n`;
  const attentionContent = sectionContent('attention-flow');
  if (attentionContent) md += `${attentionContent}\n\n`;

  // ## Contexts
  if (input.defaultContext) {
    md += '## Contexts\n\n';
    md += `*(OneUI extension.)*\n\n`;
    md += `Default output context for this brand: **${input.defaultContext}**. Other contexts (\`mobile-app\`, \`web-app\`, \`marketing-page\`, \`social-post\`, \`print\`, \`outdoor\`) apply different layout constraints, spacing, touch targets, and typography. When generating output, pick the context closest to the target surface.\n\n`;
  }

  // ## Skills
  // Vertical-flavoured composition recipes. Each skill is a subsection with:
  // metadata header (verticals, contexts, archetype), short description,
  // attention pattern (if set), and do/don't bullets (if set). The full
  // `systemPromptTemplate` is intentionally NOT emitted — it's OneUI-specific
  // and lives server-side; external agents get the prose summary instead.
  const activeSkills = (input.skills ?? []).filter(
    (s): s is DesignMdSkill => Boolean(s) && s.skillId !== '',
  );
  if (activeSkills.length > 0) {
    md += '## Skills\n\n';
    md += `*(OneUI extension.)*\n\n`;
    md += `Vertical-specific composition recipes. Each skill below describes when to use it, the attention pattern it implies, and the do/don't bullets that govern its application. When the user's request matches a skill's archetype or vertical, prefer composing through the skill's recipe rather than building from rules alone.\n\n`;

    for (const skill of activeSkills) {
      md += `### ${skill.name}\n\n`;
      const meta: string[] = [];
      meta.push(`**id:** \`${skill.skillId}\``);
      meta.push(`**category:** ${skill.category}`);
      if (skill.vertical) meta.push(`**vertical:** ${skill.vertical}`);
      if (skill.archetype) meta.push(`**archetype:** ${skill.archetype}`);
      if (skill.applicableContexts.length > 0) {
        meta.push(`**contexts:** ${skill.applicableContexts.join(', ')}`);
      }
      md += meta.join(' · ') + '\n\n';

      if (skill.description) md += `${skill.description}\n\n`;

      if (skill.attentionPattern) {
        md += `**Attention pattern:** ${skill.attentionPattern}\n\n`;
      }

      if (skill.dosDonts && skill.dosDonts.length > 0) {
        md += `**Do / Don't:**\n\n`;
        for (const bullet of skill.dosDonts) {
          md += `- ${bullet}\n`;
        }
        md += '\n';
      }

      if (skill.systemPromptTemplate && skill.systemPromptTemplate.trim().length > 0) {
        md += `**Recipe:**\n\n${truncateSkillBody(skill.systemPromptTemplate)}\n\n`;
      }
    }
  }

  return yaml + md;
}
