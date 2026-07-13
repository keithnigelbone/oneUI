/**
 * tokenGenerators.ts
 *
 * Per-foundation-type token generation functions.
 * Extracted from the monolithic `listFromFoundations` query for:
 * - Independent testability per foundation type
 * - Reusable by pages that need tokens for a single foundation
 * - Reduced Convex function bundle size
 *
 * Each function accepts a Convex query context and brand ID,
 * queries the relevant table, and returns generated tokens.
 */

import type { Id } from './_generated/dataModel';
import type { QueryCtx } from './_generated/server';
import {
  computeMotionScale,
  JIO_MOTION_BASE_DURATION,
  JIO_MOTION_EASINGS,
  NEGATIVE_SPACING_TOKENS,
  resolveColourToolDimensionTokenValue,
  SPACING_TOKENS,
  SPACING_TO_FSTEP,
  STROKE_SCALE_TOKENS,
  type DimensionSpacingToken,
  type SpacingFStep,
  type SpacingTokenName,
} from '@oneui/shared';
import {
  generateMaterialAssignmentTokenEntries,
  generateMetallicTokenEntries,
  mergeMaterialConfigWithFoundationConfig,
} from '@oneui/shared/engine';

/** Token mode type (dim kept for backward compat with existing DB data) */
type TokenMode = 'light' | 'dark' | 'dim';

export type GeneratedToken = {
  name: string;
  value: string;
  category: string;
  mode: TokenMode;
  description?: string;
};

type DefaultDimensionStep = SpacingFStep;

const DEFAULT_DIMENSION_STEPS = [
  'f-8',
  'f-7',
  'f-6',
  'f-5',
  'f-4',
  'f-3',
  'f-2',
  'f-1',
  'f0',
  'f1',
  'f2',
  'f2-5',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
  'f13',
  'f14',
  'f15',
  'f16',
] as const satisfies readonly DefaultDimensionStep[];

const DEFAULT_DIMENSION_TOKEN_BY_STEP: Record<DefaultDimensionStep, DimensionSpacingToken> = {
  'f-8': '0',
  'f-7': '0.5',
  'f-6': '1',
  'f-5': '1.5',
  'f-4': '2',
  'f-3': '2.5',
  'f-2': '3',
  'f-1': '3.5',
  f0: '4',
  f1: '4.5',
  f2: '5',
  'f2-5': '5.5',
  f3: '6',
  f4: '7',
  f5: '8',
  f6: '9',
  f7: '10',
  f8: '12',
  f9: '14',
  f10: '16',
  f11: '18',
  f12: '20',
  f13: '24',
  f14: '28',
  f15: '32',
  f16: '40',
};

const CANONICAL_SPACING_TOKENS = new Set<string>(SPACING_TOKENS);
const FSTEP_TO_NUMERIC_SPACING_TOKEN = Object.fromEntries(
  SPACING_TOKENS.map((token) => [SPACING_TO_FSTEP[token], token])
) as Record<string, SpacingTokenName>;

const LEGACY_SPACING_TOKEN_TO_NUMERIC: Record<string, SpacingTokenName> = {
  '5XS': '1',
  '4XS': '1-5',
  '3XS': '2',
  '2XS': '2-5',
  XS: '3',
  S: '3-5',
  M: '4',
  L: '4-5',
  XL: '5',
  '2XL': '6',
  '3XL': '7',
  '4XL': '8',
  '5XL': '9',
};

function normalizeSpacingTokenId(token: string, fStep?: string): string {
  const rawToken = token.startsWith('Spacing-') ? token.slice('Spacing-'.length) : token;
  const normalizedFStep = fStep?.replace(/^Dimension-/, '');
  const numericToken = normalizedFStep
    ? FSTEP_TO_NUMERIC_SPACING_TOKEN[normalizedFStep]
    : undefined;

  return numericToken
    ?? (CANONICAL_SPACING_TOKENS.has(rawToken) ? rawToken : LEGACY_SPACING_TOKEN_TO_NUMERIC[rawToken])
    ?? rawToken;
}

function formatDefaultDimensionValue(step: DefaultDimensionStep): string {
  return `${resolveColourToolDimensionTokenValue(DEFAULT_DIMENSION_TOKEN_BY_STEP[step], 'S', 'default')}px`;
}

function formatDefaultNegativeSpacingValue(token: DimensionSpacingToken): string {
  return `${-resolveColourToolDimensionTokenValue(token, 'S', 'default')}px`;
}

function formatCssTokenName(token: string): string {
  return token.replace('.', '-');
}

function negateCssLength(value: string): string {
  if (value === '0' || value === '0px') return '0px';
  if (value.startsWith('-')) return value;
  if (value.startsWith('clamp(') || value.startsWith('calc(') || value.startsWith('var(')) {
    return `calc(${value} * -1)`;
  }
  return `-${value}`;
}

// ============================================================================
// Color Scale Tokens
// ============================================================================

export async function generateColorTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  modes: TokenMode[]
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const colorScales = await ctx.db
    .query('colorScales')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  for (const scale of colorScales) {
    for (const step of scale.steps) {
      for (const mode of modes) {
        tokens.push({
          name: `Color-${scale.name}-${step.step}`,
          value: step.oklch,
          category: 'color/scale',
          mode,
          description: `${scale.name} color scale step ${step.step}${step.isBase ? ' (base)' : ''}`,
        });
      }
    }
  }
  return tokens;
}

// ============================================================================
// Surface Token Mappings
// ============================================================================

const DEFAULT_SURFACES_LIGHT = [
  { name: 'Surface-Default', value: 'oklch(100% 0 0)', description: 'Default surface' },
  { name: 'Surface-Minimal', value: 'oklch(97% 0.005 280)', description: 'Minimal emphasis surface' },
  { name: 'Surface-Subtle', value: 'oklch(94% 0.008 280)', description: 'Subtle emphasis surface' },
  { name: 'Surface-Moderate', value: 'oklch(90% 0.01 280)', description: 'Moderate emphasis surface' },
  { name: 'Surface-Bold', value: 'oklch(25% 0.02 280)', description: 'Bold emphasis surface' },
  { name: 'Surface-Elevated', value: 'oklch(100% 0 0)', description: 'Elevated surface' },
  { name: 'Surface-Ghost', value: 'oklch(96% 0.003 280)', description: 'Ghost surface' },
];

const DEFAULT_SURFACES_DARK = [
  { name: 'Surface-Default', value: 'oklch(12% 0.005 280)', description: 'Default surface' },
  { name: 'Surface-Minimal', value: 'oklch(15% 0.008 280)', description: 'Minimal emphasis surface' },
  { name: 'Surface-Subtle', value: 'oklch(18% 0.01 280)', description: 'Subtle emphasis surface' },
  { name: 'Surface-Moderate', value: 'oklch(22% 0.012 280)', description: 'Moderate emphasis surface' },
  { name: 'Surface-Bold', value: 'oklch(95% 0.02 280)', description: 'Bold emphasis surface' },
  { name: 'Surface-Elevated', value: 'oklch(15% 0.008 280)', description: 'Elevated surface' },
  { name: 'Surface-Ghost', value: 'oklch(16% 0.006 280)', description: 'Ghost surface' },
];

export async function generateSurfaceTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  modes: TokenMode[]
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const surfaceMappings = await ctx.db
    .query('surfaceTokenMappings')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  if (surfaceMappings.length > 0) {
    for (const mapping of surfaceMappings) {
      if (modes.includes('light')) {
        tokens.push({
          name: `Surface-${mapping.tokenName}`,
          value: mapping.lightModeStep,
          category: 'color/surface',
          mode: 'light',
          description: `Surface token: ${mapping.tokenName}`,
        });
      }
      if (modes.includes('dark')) {
        tokens.push({
          name: `Surface-${mapping.tokenName}`,
          value: mapping.darkModeStep,
          category: 'color/surface',
          mode: 'dark',
          description: `Surface token: ${mapping.tokenName}`,
        });
      }
      if (modes.includes('dim')) {
        tokens.push({
          name: `Surface-${mapping.tokenName}`,
          value: mapping.dimModeStep,
          category: 'color/surface',
          mode: 'dim',
          description: `Surface token: ${mapping.tokenName}`,
        });
      }
    }
  } else {
    if (modes.includes('light')) {
      for (const s of DEFAULT_SURFACES_LIGHT) {
        tokens.push({ name: s.name, value: s.value, category: 'color/surface', mode: 'light', description: s.description });
      }
    }
    if (modes.includes('dark')) {
      for (const s of DEFAULT_SURFACES_DARK) {
        tokens.push({ name: s.name, value: s.value, category: 'color/surface', mode: 'dark', description: s.description });
      }
    }
    if (modes.includes('dim')) {
      for (const s of DEFAULT_SURFACES_DARK) {
        tokens.push({ name: s.name, value: s.value, category: 'color/surface', mode: 'dim', description: s.description });
      }
    }
  }
  return tokens;
}

// ============================================================================
// Text Token Mappings
// ============================================================================

const DEFAULT_TEXT_LIGHT = [
  { name: 'Text-High', value: 'oklch(15% 0 0)', description: 'High emphasis text' },
  { name: 'Text-Medium', value: 'oklch(45% 0 0)', description: 'Medium emphasis text' },
  { name: 'Text-Low', value: 'oklch(65% 0 0)', description: 'Low emphasis text' },
  { name: 'Text-Disabled', value: 'oklch(75% 0 0)', description: 'Disabled text' },
  { name: 'Text-OnBold-High', value: 'oklch(98% 0 0)', description: 'High emphasis on bold' },
  { name: 'Text-OnBold-Medium', value: 'oklch(85% 0 0)', description: 'Medium emphasis on bold' },
  { name: 'Text-OnBold-Low', value: 'oklch(70% 0 0)', description: 'Low emphasis on bold' },
];

const DEFAULT_TEXT_DARK = [
  { name: 'Text-High', value: 'oklch(95% 0 0)', description: 'High emphasis text' },
  { name: 'Text-Medium', value: 'oklch(70% 0 0)', description: 'Medium emphasis text' },
  { name: 'Text-Low', value: 'oklch(50% 0 0)', description: 'Low emphasis text' },
  { name: 'Text-Disabled', value: 'oklch(40% 0 0)', description: 'Disabled text' },
  { name: 'Text-OnBold-High', value: 'oklch(12% 0 0)', description: 'High emphasis on bold' },
  { name: 'Text-OnBold-Medium', value: 'oklch(25% 0 0)', description: 'Medium emphasis on bold' },
  { name: 'Text-OnBold-Low', value: 'oklch(40% 0 0)', description: 'Low emphasis on bold' },
];

export async function generateTextTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  modes: TokenMode[]
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const textMappings = await ctx.db
    .query('textTokenMappings')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  if (textMappings.length > 0) {
    for (const mapping of textMappings) {
      if (modes.includes('light')) {
        tokens.push({ name: `Text-${mapping.tokenName}`, value: mapping.lightModeStep, category: 'color/text', mode: 'light', description: mapping.contrastRatio ? `Contrast ratio: ${mapping.contrastRatio}:1` : undefined });
      }
      if (modes.includes('dark')) {
        tokens.push({ name: `Text-${mapping.tokenName}`, value: mapping.darkModeStep, category: 'color/text', mode: 'dark', description: mapping.contrastRatio ? `Contrast ratio: ${mapping.contrastRatio}:1` : undefined });
      }
      if (modes.includes('dim')) {
        tokens.push({ name: `Text-${mapping.tokenName}`, value: mapping.dimModeStep, category: 'color/text', mode: 'dim', description: mapping.contrastRatio ? `Contrast ratio: ${mapping.contrastRatio}:1` : undefined });
      }
    }
  } else {
    if (modes.includes('light')) {
      for (const t of DEFAULT_TEXT_LIGHT) {
        tokens.push({ name: t.name, value: t.value, category: 'color/text', mode: 'light', description: t.description });
      }
    }
    if (modes.includes('dark')) {
      for (const t of DEFAULT_TEXT_DARK) {
        tokens.push({ name: t.name, value: t.value, category: 'color/text', mode: 'dark', description: t.description });
      }
    }
    if (modes.includes('dim')) {
      for (const t of DEFAULT_TEXT_DARK) {
        tokens.push({ name: t.name, value: t.value, category: 'color/text', mode: 'dim', description: t.description });
      }
    }
  }
  return tokens;
}

// ============================================================================
// Typography Tokens
// ============================================================================

const DEFAULT_TYPOGRAPHY = [
  { name: 'Typography-Font-Primary', value: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', category: 'typography/font', description: 'Primary font family' },
  { name: 'Typography-Weight-Regular', value: '400', category: 'typography/weight', description: 'Regular weight' },
  { name: 'Typography-Weight-Medium', value: '500', category: 'typography/weight', description: 'Medium weight' },
  { name: 'Typography-Weight-Semibold', value: '600', category: 'typography/weight', description: 'Semibold weight' },
  { name: 'Typography-Weight-Bold', value: '700', category: 'typography/weight', description: 'Bold weight' },
  { name: 'Typography-Size-XS', value: '0.6875rem', category: 'typography/size', description: 'Extra small size' },
  { name: 'Typography-Size-S', value: '0.75rem', category: 'typography/size', description: 'Small size' },
  { name: 'Typography-Size-M', value: '0.8125rem', category: 'typography/size', description: 'Medium size' },
  { name: 'Typography-Size-L', value: '0.875rem', category: 'typography/size', description: 'Large size' },
  { name: 'Typography-Size-XL', value: '1rem', category: 'typography/size', description: 'Extra large size' },
  { name: 'Typography-Size-2XL', value: '1.125rem', category: 'typography/size', description: '2X large size' },
  { name: 'Typography-LineHeight-Tight', value: '1.2', category: 'typography/lineHeight', description: 'Tight line height' },
  { name: 'Typography-LineHeight-Normal', value: '1.5', category: 'typography/lineHeight', description: 'Normal line height' },
  { name: 'Typography-LineHeight-Relaxed', value: '1.625', category: 'typography/lineHeight', description: 'Relaxed line height' },
];

export async function generateTypographyTokens(
  _ctx: QueryCtx,
  _brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  return DEFAULT_TYPOGRAPHY.map((typo) => ({
    name: typo.name,
    value: typo.value,
    category: typo.category,
    mode: 'light',
    description: typo.description,
  }));
}

// ============================================================================
// Dimension Tokens (f-scale)
// ============================================================================

const DEFAULT_DIMENSIONS = DEFAULT_DIMENSION_STEPS.map((step) => ({
  name: `Dimension-${step}`,
  value: formatDefaultDimensionValue(step),
  description: step === 'f2-5' ? 'Midpoint between f2 and f3' : `F-scale step ${step}`,
}));

export async function generateDimensionTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const dimensionConfigs = await ctx.db
    .query('dimensionConfigs')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  if (dimensionConfigs.length > 0) {
    for (const config of dimensionConfigs) {
      if (config.fScale) {
        for (const fStep of config.fScale) {
          const spacingToken = fStep.spacingToken
            ? normalizeSpacingTokenId(fStep.spacingToken, fStep.step)
            : undefined;

          tokens.push({
            name: `Dimension-${fStep.step}`,
            value: fStep.isResponsive ? `clamp(${fStep.mobileValue}px, calc(...), ${fStep.desktopValue}px)` : `${fStep.mobileValue}px`,
            category: 'dimension/fscale',
            mode: 'light',
            description: spacingToken ? `f-scale step (maps to ${spacingToken})` : `f-scale step ${fStep.step}`,
          });
          if (spacingToken) {
            tokens.push({
              name: `Spacing-${spacingToken}`,
              value: fStep.isResponsive ? `clamp(${fStep.mobileValue}px, calc(...), ${fStep.desktopValue}px)` : `${fStep.mobileValue}px`,
              category: 'spacing',
              mode: 'light',
              description: `Spacing token ${spacingToken}`,
            });
          }
        }
      }
    }
  } else {
    for (const dim of DEFAULT_DIMENSIONS) {
      tokens.push({ name: dim.name, value: dim.value, category: 'dimension/fscale', mode: 'light', description: dim.description });
    }
  }
  return tokens;
}

// ============================================================================
// Grid Spacing Alias Tokens
// ============================================================================

export async function generateGridTokens(
  _ctx: QueryCtx,
  _brandId: Id<'brands'>,
  category?: 'grid' | 'spacing',
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];

  if (!category || category === 'grid') {
    tokens.push(
      {
        name: 'Grid-Margin',
        value: 'platform and density derived',
        category: 'grid',
        mode: 'light',
        description: 'Horizontal container margin. Resolves at runtime via --Grid-Margin per platform and density.',
      },
      {
        name: 'Grid-Gutter',
        value: 'platform and density derived',
        category: 'grid',
        mode: 'light',
        description: 'Grid column gap. Resolves at runtime via --Grid-Gutter per platform and density.',
      },
    );
  }

  if (!category || category === 'spacing') {
    tokens.push(
      {
        name: 'Spacing-Margin',
        value: 'var(--Grid-Margin)',
        category: 'spacing',
        mode: 'light',
        description: 'Spacing alias for page/container margin.',
      },
      {
        name: 'Spacing-Gutter',
        value: 'var(--Grid-Gutter)',
        category: 'spacing',
        mode: 'light',
        description: 'Spacing alias for grid gutter.',
      },
    );
  }

  return tokens;
}

// ============================================================================
// Spacing Tokens
// ============================================================================

const DEFAULT_SPACING = SPACING_TOKENS.map((token) => {
  const value = formatDefaultDimensionValue(SPACING_TO_FSTEP[token]);
  return {
    name: `Spacing-${token}`,
    value,
    description: `Spacing ${token} (${value})`,
  };
});

function pushNegativeSpacingTokens(
  tokens: GeneratedToken[],
  positiveSpacingValues: Map<string, string>,
  density?: string,
  fallbackToDefault = true,
): void {
  for (const token of NEGATIVE_SPACING_TOKENS) {
    const cssToken = formatCssTokenName(token);
    const positiveValue = positiveSpacingValues.get(`Spacing-${cssToken}`);
    if (!positiveValue && !fallbackToDefault) continue;
    const value = positiveValue ? negateCssLength(positiveValue) : formatDefaultNegativeSpacingValue(token);
    tokens.push({
      name: `Spacing-Negative-${cssToken}`,
      value,
      category: 'spacing',
      mode: 'light',
      description: density
        ? `Negative spacing ${token} (${density} density, ${value})`
        : `Negative spacing ${token} (${value})`,
    });
  }
}

export async function generateSpacingTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const spacingConfigs = await ctx.db
    .query('spacingConfigs')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  if (spacingConfigs.length > 0) {
    for (const config of spacingConfigs) {
      const positiveSpacingValues = new Map<string, string>();
      for (const scale of config.scale) {
        const spacingToken = normalizeSpacingTokenId(scale.token);
        const value = scale.responsive ? `clamp(${scale.responsive.min}px, ..., ${scale.responsive.max}px)` : `${scale.value}px`;

        tokens.push({
          name: `Spacing-${spacingToken}`,
          value,
          category: 'spacing',
          mode: 'light',
          description: `Spacing ${spacingToken} (${config.density} density)`,
        });
        positiveSpacingValues.set(`Spacing-${spacingToken}`, value);
      }
      pushNegativeSpacingTokens(tokens, positiveSpacingValues, config.density, false);
    }
  } else {
    for (const space of DEFAULT_SPACING) {
      tokens.push({ name: space.name, value: space.value, category: 'spacing', mode: 'light', description: space.description });
    }
    pushNegativeSpacingTokens(
      tokens,
      new Map(DEFAULT_SPACING.map((space) => [space.name, space.value])),
    );
  }
  return tokens;
}

// ============================================================================
// Shape Tokens
// ============================================================================

const DEFAULT_SHAPES = [
  { name: 'Shape-Pill', value: '9999px' },
  { name: 'Shape-0-5', value: 'var(--Dimension-f-7)' },
  { name: 'Shape-1', value: 'var(--Dimension-f-6)' },
  { name: 'Shape-1-5', value: 'var(--Dimension-f-5)' },
  { name: 'Shape-2', value: 'var(--Dimension-f-4)' },
  { name: 'Shape-2-5', value: 'var(--Dimension-f-3)' },
  { name: 'Shape-3', value: 'var(--Dimension-f-2)' },
  { name: 'Shape-3-5', value: 'var(--Dimension-f-1)' },
  { name: 'Shape-4', value: 'var(--Dimension-f0)' },
  { name: 'Shape-4-5', value: 'var(--Dimension-f1)' },
  { name: 'Shape-5', value: 'var(--Dimension-f2)' },
  { name: 'Shape-6', value: 'var(--Dimension-f3)' },
  { name: 'Shape-7', value: 'var(--Dimension-f4)' },
  { name: 'Shape-8', value: 'var(--Dimension-f5)' },
  { name: 'Shape-9', value: 'var(--Dimension-f6)' },
  { name: 'Shape-10', value: 'var(--Dimension-f7)' },
];

export async function generateShapeTokens(
  _ctx: QueryCtx,
  _brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];

  // Shape tokens are system constants: the t-shirt scale derives from
  // dimension f-steps and Shape-Pill is a fixed 9999px standalone. Brand
  // shape intent lives in componentThemeSelections (shapeLanguage decisions),
  // not in shape token values. The deprecated `shapeConfigs` table is no
  // longer read — nothing has written to it since the shapes editor was
  // retired (table removal tracked for a later deploy cycle).
  tokens.push({ name: 'Shape-Pill', value: '9999px', category: 'shape', mode: 'light', description: 'Circular/pill shape for circular elements only' });
  for (const shape of DEFAULT_SHAPES) {
    if (shape.name === 'Shape-Pill') continue;
    tokens.push({ name: shape.name, value: shape.value, category: 'shape', mode: 'light', description: `${shape.name} — derived from dimension scale` });
  }
  return tokens;
}

// ============================================================================
// Stroke Tokens
// ============================================================================

export async function generateStrokeTokens(
  _ctx: QueryCtx,
  _brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  return STROKE_SCALE_TOKENS.map((stroke) => ({
    name: stroke.token,
    value: stroke.value,
    category: 'stroke',
    mode: 'light',
    description: stroke.description,
  }));
}

// ============================================================================
// Elevation Tokens
// ============================================================================

const DEFAULT_ELEVATIONS = [
  { name: 'Elevation-0', value: 'none' },
  { name: 'Elevation-1', value: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)' },
  { name: 'Elevation-2', value: '0 3px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)' },
  { name: 'Elevation-3', value: '0 10px 20px rgba(0, 0, 0, 0.12), 0 3px 6px rgba(0, 0, 0, 0.08)' },
  { name: 'Elevation-4', value: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.08)' },
  { name: 'Elevation-5', value: '0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.1)' },
];

export async function generateElevationTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const elevationConfigs = await ctx.db
    .query('elevationConfigs')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();

  if (elevationConfigs.length > 0) {
    for (const config of elevationConfigs) {
      for (const level of config.levels) {
        const k = level.keyLight;
        const a = level.ambientLight;
        tokens.push({
          name: `Elevation-${level.level}`,
          value: `0 ${k.yOffset}px ${k.blur}px rgba(0,0,0,${k.opacity}), 0 ${a.yOffset}px ${a.blur}px rgba(0,0,0,${a.opacity})`,
          category: 'elevation',
          mode: 'light',
          description: `Elevation level ${level.level} shadow`,
        });
      }
    }
  } else {
    for (const elev of DEFAULT_ELEVATIONS) {
      tokens.push({ name: elev.name, value: elev.value, category: 'elevation', mode: 'light', description: `Default ${elev.name}` });
    }
  }
  return tokens;
}

// ============================================================================
// Motion Tokens
// ============================================================================

export async function generateMotionTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const motionConfig = await ctx.db
    .query('motionConfigs')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .first();

  // Reuse the shared engine's computeMotionScale so client and server stay in sync.
  // This includes the round-to-5 step that eliminates awkward values like 59ms/133ms.
  const base = motionConfig?.baseDuration ?? JIO_MOTION_BASE_DURATION;
  const easings = motionConfig?.easings ?? JIO_MOTION_EASINGS;
  const scale = computeMotionScale(base, easings);

  // Durations — Moderate
  tokens.push({ name: 'Motion-Duration-2XS', value: `${scale.duration.moderate['2xs']}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate 2XS duration' });
  tokens.push({ name: 'Motion-Duration-XS', value: `${scale.duration.moderate.xs}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate XS duration' });
  tokens.push({ name: 'Motion-Duration-S', value: `${scale.duration.moderate.s}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate S duration' });
  tokens.push({ name: 'Motion-Duration-M', value: `${scale.duration.moderate.m}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate M duration' });
  tokens.push({ name: 'Motion-Duration-L', value: `${scale.duration.moderate.l}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate L duration (default)' });
  tokens.push({ name: 'Motion-Duration-XL', value: `${scale.duration.moderate.xl}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate XL duration' });
  tokens.push({ name: 'Motion-Duration-2XL', value: `${scale.duration.moderate['2xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate 2XL duration' });
  tokens.push({ name: 'Motion-Duration-3XL', value: `${scale.duration.moderate['3xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate 3XL duration' });
  // Durations — Subtle
  tokens.push({ name: 'Motion-Duration-Subtle-2XS', value: `${scale.duration.subtle['2xs']}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle 2XS duration' });
  tokens.push({ name: 'Motion-Duration-Subtle-XS', value: `${scale.duration.subtle.xs}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle XS duration' });
  tokens.push({ name: 'Motion-Duration-Subtle-S', value: `${scale.duration.subtle.s}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle S duration' });
  tokens.push({ name: 'Motion-Duration-Subtle-M', value: `${scale.duration.subtle.m}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle M duration' });
  tokens.push({ name: 'Motion-Duration-Subtle-L', value: `${scale.duration.subtle.l}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle L duration (default)' });
  tokens.push({ name: 'Motion-Duration-Subtle-XL', value: `${scale.duration.subtle.xl}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle XL duration' });
  tokens.push({ name: 'Motion-Duration-Subtle-2XL', value: `${scale.duration.subtle['2xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle 2XL duration' });
  tokens.push({ name: 'Motion-Duration-Subtle-3XL', value: `${scale.duration.subtle['3xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle 3XL duration' });
  // Offsets — Moderate
  tokens.push({ name: 'Motion-Offset-S', value: `${scale.offset.moderate.s}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate S stagger offset' });
  tokens.push({ name: 'Motion-Offset-M', value: `${scale.offset.moderate.m}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate M stagger offset' });
  tokens.push({ name: 'Motion-Offset-L', value: `${scale.offset.moderate.l}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate L stagger offset' });
  tokens.push({ name: 'Motion-Offset-XL', value: `${scale.offset.moderate.xl}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate XL stagger offset' });
  tokens.push({ name: 'Motion-Offset-2XL', value: `${scale.offset.moderate['2xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate 2XL stagger offset' });
  tokens.push({ name: 'Motion-Offset-3XL', value: `${scale.offset.moderate['3xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Moderate 3XL stagger offset' });
  // Offsets — Subtle
  tokens.push({ name: 'Motion-Offset-Subtle-S', value: `${scale.offset.subtle.s}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle S stagger offset' });
  tokens.push({ name: 'Motion-Offset-Subtle-M', value: `${scale.offset.subtle.m}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle M stagger offset' });
  tokens.push({ name: 'Motion-Offset-Subtle-L', value: `${scale.offset.subtle.l}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle L stagger offset' });
  tokens.push({ name: 'Motion-Offset-Subtle-XL', value: `${scale.offset.subtle.xl}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle XL stagger offset' });
  tokens.push({ name: 'Motion-Offset-Subtle-2XL', value: `${scale.offset.subtle['2xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle 2XL stagger offset' });
  tokens.push({ name: 'Motion-Offset-Subtle-3XL', value: `${scale.offset.subtle['3xl']}ms`, category: 'motion/duration', mode: 'light', description: 'Subtle 3XL stagger offset' });
  // Easings
  tokens.push({ name: 'Motion-Easing-Entrance-Moderate', value: scale.easings.entrance.moderate, category: 'motion/easing', mode: 'light', description: 'Entrance easing — Moderate' });
  tokens.push({ name: 'Motion-Easing-Entrance-Subtle', value: scale.easings.entrance.subtle, category: 'motion/easing', mode: 'light', description: 'Entrance easing — Subtle' });
  tokens.push({ name: 'Motion-Easing-Exit-Moderate', value: scale.easings.exit.moderate, category: 'motion/easing', mode: 'light', description: 'Exit easing — Moderate' });
  tokens.push({ name: 'Motion-Easing-Exit-Subtle', value: scale.easings.exit.subtle, category: 'motion/easing', mode: 'light', description: 'Exit easing — Subtle' });
  tokens.push({ name: 'Motion-Easing-Transition-Moderate', value: scale.easings.transition.moderate, category: 'motion/easing', mode: 'light', description: 'Transition easing — Moderate' });
  tokens.push({ name: 'Motion-Easing-Transition-Subtle', value: scale.easings.transition.subtle, category: 'motion/easing', mode: 'light', description: 'Transition easing — Subtle' });
  tokens.push({ name: 'Motion-Easing-Bounce-Moderate', value: scale.easings.bounce.moderate, category: 'motion/easing', mode: 'light', description: 'Bounce/overshoot easing — Moderate' });
  tokens.push({ name: 'Motion-Easing-Bounce-Subtle', value: scale.easings.bounce.subtle, category: 'motion/easing', mode: 'light', description: 'Bounce/overshoot easing — Subtle' });
  tokens.push({ name: 'Motion-Easing-Linear', value: scale.easings.linear, category: 'motion/easing', mode: 'light', description: 'Linear — continuous animations' });

  return tokens;
}

// ============================================================================
// Material Tokens
// ============================================================================

export async function generateMaterialTokens(
  ctx: QueryCtx,
  brandId: Id<'brands'>,
  modes: TokenMode[]
): Promise<GeneratedToken[]> {
  const tokens: GeneratedToken[] = [];
  const materialConfigs = await ctx.db
    .query('materialConfigs')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .collect();
  const materialsFoundation = await ctx.db
    .query('foundations')
    .withIndex('by_brand_type', (q) => q.eq('brandId', brandId).eq('type', 'materials'))
    .first();
  const appearanceConfig = await ctx.db
    .query('appearanceConfigs')
    .withIndex('by_brand', (q) => q.eq('brandId', brandId))
    .first();

  for (const config of materialConfigs) {
    // Translucent materials (mode-dependent)
    for (const mode of modes) {
      const values = mode === 'light' ? config.translucent.light : config.translucent.dark;
      const modeSuffix = mode === 'light' ? 'Light' : 'Dark';
      tokens.push({ name: `Material-Translucent-${modeSuffix}-Minimal`, value: String(values.minimal), category: 'material/translucent', mode, description: `${modeSuffix} minimal translucency` });
      tokens.push({ name: `Material-Translucent-${modeSuffix}-Subtle`, value: String(values.subtle), category: 'material/translucent', mode, description: `${modeSuffix} subtle translucency` });
      tokens.push({ name: `Material-Translucent-${modeSuffix}-Moderate`, value: String(values.moderate), category: 'material/translucent', mode, description: `${modeSuffix} moderate translucency` });
      tokens.push({ name: `Material-Translucent-${modeSuffix}-Heavy`, value: String(values.heavy), category: 'material/translucent', mode, description: `${modeSuffix} heavy translucency` });
    }

    // Frosted blur (mode-independent)
    for (const mode of modes) {
      tokens.push({ name: 'Material-Frosted-Blur-UltraThin', value: `${config.frosted.blur.ultraThin}px`, category: 'material/frosted', mode, description: 'Ultra thin frosted blur' });
      tokens.push({ name: 'Material-Frosted-Blur-Thin', value: `${config.frosted.blur.thin}px`, category: 'material/frosted', mode, description: 'Thin frosted blur' });
      tokens.push({ name: 'Material-Frosted-Blur-Regular', value: `${config.frosted.blur.regular}px`, category: 'material/frosted', mode, description: 'Regular frosted blur' });
      tokens.push({ name: 'Material-Frosted-Blur-Thick', value: `${config.frosted.blur.thick}px`, category: 'material/frosted', mode, description: 'Thick frosted blur' });
      tokens.push({ name: 'Material-Frosted-Blur-UltraThick', value: `${config.frosted.blur.ultraThick}px`, category: 'material/frosted', mode, description: 'Ultra thick frosted blur' });
    }

    // Frosted background opacity + borders + fallbacks (mode-dependent)
    const bgOp = config.frosted.backgroundOpacity;
    for (const mode of modes) {
      const isLight = mode === 'light';
      const rgb = isLight ? '255, 255, 255' : '0, 0, 0';
      const borderOp = isLight ? '0.20' : '0.10';
      const levels = ['UltraThin', 'Thin', 'Regular', 'Thick', 'UltraThick'] as const;
      const opKey = { UltraThin: 'ultraThin', Thin: 'thin', Regular: 'regular', Thick: 'thick', UltraThick: 'ultraThick' } as const;
      const fbOp = isLight ? ['0.80', '0.85', '0.92', '0.95', '0.97'] : ['0.80', '0.85', '0.92', '0.95', '0.97'];

      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        tokens.push({ name: `Material-Frosted-Background-${level}`, value: `rgba(${rgb}, ${bgOp[opKey[level]]})`, category: 'material/frosted', mode, description: `${level} frosted background` });
      }
      tokens.push({ name: 'Material-Frosted-Border', value: `rgba(255, 255, 255, ${borderOp})`, category: 'material/frosted', mode, description: 'Frosted edge definition border' });
      for (let i = 0; i < levels.length; i++) {
        tokens.push({ name: `Material-Frosted-Fallback-${levels[i]}`, value: `rgba(${rgb}, ${fbOp[i]})`, category: 'material/frosted', mode, description: `${levels[i]} frosted fallback` });
      }
    }

    // Glass (mode-independent blur/saturation/highlights)
    for (const mode of modes) {
      tokens.push({ name: 'Material-Glass-Blur-Regular', value: `${config.glass.blur.regular}px`, category: 'material/glass', mode, description: 'Regular glass blur' });
      tokens.push({ name: 'Material-Glass-Blur-Clear', value: `${config.glass.blur.clear}px`, category: 'material/glass', mode, description: 'Clear glass blur' });
      tokens.push({ name: 'Material-Glass-Saturation-Regular', value: `${config.glass.saturation.regular}%`, category: 'material/glass', mode, description: 'Regular glass saturation' });
      tokens.push({ name: 'Material-Glass-Saturation-Clear', value: `${config.glass.saturation.clear}%`, category: 'material/glass', mode, description: 'Clear glass saturation' });
      tokens.push({ name: 'Material-Glass-Highlight-Minimal', value: String(config.glass.highlightIntensity.minimal), category: 'material/glass', mode, description: 'Minimal glass highlight intensity' });
      tokens.push({ name: 'Material-Glass-Highlight-Moderate', value: String(config.glass.highlightIntensity.moderate), category: 'material/glass', mode, description: 'Moderate glass highlight intensity' });
      tokens.push({ name: 'Material-Glass-Highlight-Strong', value: String(config.glass.highlightIntensity.strong), category: 'material/glass', mode, description: 'Strong glass highlight intensity' });
    }

    // Glass tint + border (mode-dependent)
    for (const mode of modes) {
      const isLight = mode === 'light';
      const tintRGB = isLight ? '255, 255, 255' : '0, 0, 0';
      const tintOp = isLight ? config.glass.tintOpacity.light : config.glass.tintOpacity.dark;
      const borderOp = isLight ? '0.25' : '0.10';
      const modeSuffix = isLight ? 'Light' : 'Dark';

      tokens.push({ name: `Material-Glass-Tint-${modeSuffix}`, value: `rgba(${tintRGB}, ${tintOp})`, category: 'material/glass', mode, description: `${modeSuffix} mode glass tint` });
      tokens.push({ name: 'Material-Glass-Tint', value: `rgba(${tintRGB}, ${tintOp})`, category: 'material/glass', mode, description: 'Glass tint base background' });
      tokens.push({ name: `Material-Glass-Border-${modeSuffix}`, value: `rgba(255, 255, 255, ${borderOp})`, category: 'material/glass', mode, description: `${modeSuffix} mode glass border` });
      tokens.push({ name: 'Material-Glass-Border', value: `rgba(255, 255, 255, ${borderOp})`, category: 'material/glass', mode, description: 'Glass edge definition border' });
    }

    // Metallic presets
    const materialTokenInput = mergeMaterialConfigWithFoundationConfig(config, materialsFoundation?.config);
    const metallicTokens = generateMetallicTokenEntries(materialTokenInput);
    for (const token of metallicTokens) {
      for (const mode of modes) {
        tokens.push({
          name: token.name,
          value: token.value,
          category: 'material/metallic',
          mode,
          description: token.description,
        });
      }
    }

    const assignmentTokens = generateMaterialAssignmentTokenEntries(appearanceConfig, materialTokenInput);
    for (const token of assignmentTokens) {
      for (const mode of modes) {
        tokens.push({
          name: token.name,
          value: token.value,
          category: 'material/assignment',
          mode,
          description: token.description,
        });
      }
    }
  }
  return tokens;
}
