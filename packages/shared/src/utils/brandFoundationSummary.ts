/**
 * brandFoundationSummary.ts
 *
 * Pure extractor that flattens a `foundationData` payload (as returned
 * by the platform's `getBrandOverviewData` query) plus an explicit brand
 * name + theme into a `BrandFoundationSummary` — the shape the global
 * agent API expects. Shared by every chat surface (home, create, future
 * agents) so the font-resolution logic lives in exactly one place.
 *
 * Kept framework-agnostic (no React, no Convex types) so it can be
 * unit-tested in Node and called from both client components and
 * server route handlers.
 */

import type { BrandFoundationSummary } from '../agent/types';

interface FoundationDataLike {
  typography?: {
    config?: {
      fontFamily?: string;
      fontSelection?: {
        primaryFontId?: string;
        secondaryFontId?: string;
      };
    } | null;
  } | null;
  customFonts?: ReadonlyArray<{ _id: string; name: string }> | null;
}

export interface ExtractBrandSummaryInput {
  brandName: string;
  theme: 'light' | 'dark';
  foundationData: FoundationDataLike | null | undefined;
}

export function extractBrandFoundationSummary(
  input: ExtractBrandSummaryInput,
): BrandFoundationSummary {
  const { brandName, theme, foundationData } = input;
  const typographyConfig = foundationData?.typography?.config ?? undefined;
  const customFonts = foundationData?.customFonts ?? undefined;

  const resolveFontName = (fontId: string): string => {
    if (fontId.startsWith('uploaded-') && customFonts) {
      const convexId = fontId.replace('uploaded-', '');
      const cf = customFonts.find((f) => f._id === convexId);
      if (cf) return cf.name;
    }
    return fontId;
  };

  let primaryFont: string | undefined;
  let secondaryFont: string | undefined;
  if (typographyConfig?.fontSelection?.primaryFontId) {
    primaryFont = resolveFontName(typographyConfig.fontSelection.primaryFontId);
  } else if (typographyConfig?.fontFamily) {
    primaryFont = typographyConfig.fontFamily;
  }
  if (typographyConfig?.fontSelection?.secondaryFontId) {
    secondaryFont = resolveFontName(typographyConfig.fontSelection.secondaryFontId);
  }

  return {
    brandName,
    theme,
    primaryFont,
    secondaryFont,
  };
}
