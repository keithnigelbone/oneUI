/**
 * Pure projections for snapshot-brands. Extracted so unit tests can import
 * them without triggering Convex client construction (the CLI entry-point
 * does that on module load).
 */

import type { BrandFonts, BrandFoundation, ColorScale } from '../packages/kb-core/src/types/brand';

export interface ConvexBrandRow {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'draft' | 'deprecated';
  primaryHue: number;
  primaryChroma: number;
  secondaryHue: number;
  secondaryChroma: number;
}

export interface ConvexColorScaleRow {
  name: string;
  baseStep?: number;
  steps?: Array<{ step: number; hex: string; oklch: { L: number; C: number; h: number } }>;
  anchorBoldToBaseStep?: boolean;
}

export interface ConvexFoundationOverview {
  appearance?: { config?: { accents?: Array<{ role: string }> } };
  typography?: {
    config?: {
      fontFamily?: string;
      codeFont?: string;
      fontSelection?: { primaryFontId?: string; secondaryFontId?: string };
    };
  };
  recipes?: Record<string, Record<string, string>>;
}

export function projectScale(s: ConvexColorScaleRow): ColorScale {
  return {
    name: s.name,
    baseStep: s.baseStep ?? 1300,
    steps: s.steps ?? [],
    anchorBoldToBaseStep: s.anchorBoldToBaseStep,
  };
}

export function extractActiveRoles(overview: ConvexFoundationOverview | null | undefined): readonly string[] {
  const accents = overview?.appearance?.config?.accents ?? [];
  if (accents.length === 0) return ['primary', 'neutral'];
  return accents.map((a) => a.role);
}

export function extractFonts(overview: ConvexFoundationOverview | null | undefined): BrandFonts {
  const t = overview?.typography?.config ?? {};
  const primaryFamily = t.fontSelection?.primaryFontId ?? t.fontFamily ?? 'System';
  return {
    primary: { family: primaryFamily, source: 'system' as const },
    secondary: t.fontSelection?.secondaryFontId
      ? { family: t.fontSelection.secondaryFontId, source: 'system' as const }
      : undefined,
    code: t.codeFont ? { family: t.codeFont, source: 'system' as const } : undefined,
  };
}

export function projectBrand(args: {
  row: ConvexBrandRow;
  overview: ConvexFoundationOverview | null;
  scales: ConvexColorScaleRow[];
  brandSetVersion: string;
  snapshottedAt: string;
}): BrandFoundation {
  const { row, overview, scales, brandSetVersion, snapshottedAt } = args;
  return {
    brandId: row.slug,
    displayName: row.name,
    status: row.status,
    primary: { L: 0.5, C: row.primaryChroma, h: row.primaryHue },
    secondary: { L: 0.5, C: row.secondaryChroma, h: row.secondaryHue },
    scales: scales.map(projectScale),
    activeRoles: extractActiveRoles(overview) as BrandFoundation['activeRoles'],
    fonts: extractFonts(overview),
    recipes: overview?.recipes ?? {},
    defaultModifiers: { dark: false, rtl: false, highContrast: false },
    brandSetVersion: brandSetVersion as BrandFoundation['brandSetVersion'],
    snapshottedAt,
  };
}
