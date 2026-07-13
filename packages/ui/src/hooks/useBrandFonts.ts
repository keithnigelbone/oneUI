/**
 * useBrandFonts.ts
 *
 * Shared hook that loads brand typography fonts from foundation data.
 * Extracts font IDs from the typography config and loads them via
 * Google Fonts / FontFace API using useGoogleFonts.
 *
 * Used by both FoundationStyleProvider (platform app) and
 * BrandStyleInjector (Storybook) to ensure fonts are always available
 * when typography CSS tokens reference them.
 *
 * Handles three font sources:
 * 1. Static FONT_COLLECTION entries (Google Fonts, custom bundled)
 * 2. Uploaded fonts from Convex customFonts table (resolved by getBrandOverviewData)
 * 3. Plain fontFamily string fallback (name lookup)
 */

'use client';

import { useEffect } from 'react';
import { useGoogleFonts } from './useGoogleFonts';
import {
  getFontById,
  getFontByName,
  getUploadedFontId,
  resolveTextFontId,
  resolveHeadingFontId,
  resolveTypographyScriptSupport,
} from '@oneui/shared';
import type { FontMetadata } from '@oneui/shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FoundationData = Record<string, any> | undefined | null;

/**
 * Loads brand fonts from foundation data. Pure side-effect hook.
 * Initializes with Inter as the default font, then loads any
 * brand-specific fonts from the typography config.
 */
export function useBrandFonts(foundationData: FoundationData): void {
  const { loadedFonts, loadingFonts, loadFont } = useGoogleFonts(['inter']);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = foundationData as Record<string, any> | undefined;
    const typographyConfig = data?.typography?.config;
    // V2 config may live nested under typography.config or top-level on foundationData.
    const typographyV2 = typographyConfig?.typographyV2 ?? data?.typographyV2;
    if (!typographyConfig && !typographyV2) return;

    // Build a lookup map for uploaded custom fonts resolved by getBrandOverviewData
    const customFontsMap = new Map<string, FontMetadata>();
    const customFonts = data?.customFonts as Array<{
      _id: string;
      name: string;
      familyName: string;
      fileUrl: string;
      category: string;
      weights: number[];
      isVariable: boolean;
      fallback: string;
      files?: Array<{ fileUrl: string; weight: number; fileFormat?: string }>;
    }> | undefined;

    if (customFonts) {
      for (const cf of customFonts) {
        const fontId = getUploadedFontId(cf._id);
        // Prefer per-weight files (multi-weight families) so every uploaded
        // weight loads app-wide, not just the primary file.
        const weightFiles =
          cf.files && cf.files.length > 0
            ? cf.files
                .map((f) => ({ weight: f.weight, url: f.fileUrl, format: f.fileFormat }))
                .sort((a, b) => a.weight - b.weight)
            : [{ weight: cf.weights[0] ?? 400, url: cf.fileUrl }];
        customFontsMap.set(fontId, {
          id: fontId,
          name: cf.name,
          category: cf.category as FontMetadata['category'],
          source: 'uploaded',
          customFontPath: cf.fileUrl,
          weightFiles,
          weights: cf.weights,
          isVariable: cf.isVariable,
          fallback: cf.fallback,
        });
      }
    }

    const fontsToLoad: FontMetadata[] = [];
    const seenIds = new Set<string>();

    // Path 1: Structured fontSelection with font IDs (V1 + V2 — V2 takes
    // priority for brands edited in the platform's typography editor).
    // resolveTextFontId / resolveHeadingFontId walk the canonical → legacy
    // alias chain so brand documents on either side of the rename migration
    // still load fonts.
    const v1sel = typographyConfig?.fontSelection;
    const v2sel = typographyV2?.fontSelection;
    const enabledScriptFonts = typographyV2
      ? resolveTypographyScriptSupport(typographyV2.scriptSupport)
          .filter((script) => script.enabled)
          .flatMap((script) => [script.uiFontId, script.readingFontId])
      : [];
    const fontIds = [
      resolveTextFontId(v2sel) ?? resolveTextFontId(v1sel),
      resolveHeadingFontId(v2sel) ?? resolveHeadingFontId(v1sel),
      ...(v2sel?.fallbackFontIds ?? v1sel?.fallbackFontIds ?? []),
      v2sel?.codeFontId,
      ...enabledScriptFonts,
    ].filter(Boolean) as string[];

    for (const fontId of fontIds) {
      if (seenIds.has(fontId)) continue;
      seenIds.add(fontId);
      // Check static collection first, then uploaded fonts
      const font = getFontById(fontId) ?? customFontsMap.get(fontId);
      if (font) fontsToLoad.push(font);
    }

    // Path 2: Plain fontFamily string from Convex (source of truth, legacy)
    if (typographyConfig?.fontFamily && fontsToLoad.length === 0) {
      const font = getFontByName(typographyConfig.fontFamily);
      if (font) fontsToLoad.push(font);
    }

    for (const font of fontsToLoad) {
      if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) {
        loadFont(font);
      }
    }
  }, [foundationData, loadedFonts, loadingFonts, loadFont]);
}
