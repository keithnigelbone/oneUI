/**
 * brand/overview/page.tsx
 *
 * Brand Overview Dashboard
 *
 * Single-glance view of the brand's selections:
 * - Brand header (logo, identity, kebab actions)
 * - Foundation Selections list (one row per foundation)
 * - Agents list (Design Composition, Tone of Voice — per-brand config status)
 */

'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import {
  getFontById,
  type TypographyFoundationConfig,
} from '@/design-tools/Foundations/Typography';
import { resolveBrandFontName, resolveTextFontId } from '@oneui/shared';
import { buildAvailableScales } from '@oneui/shared/engine';
import { useGoogleFonts } from '@oneui/ui/hooks/useGoogleFonts';
import { OverviewSkeleton } from '@/components/PageSkeleton';
import { Progress } from '@oneui/ui/components/Progress';
import styles from './page.module.css';
import tileStyles from './FoundationTiles.module.css';
import { recolorSvgToCurrentColor } from './helpers';
import { BrandHeader } from './BrandHeader';
import { FoundationSelectionsSection } from './FoundationSelections';
import { AgentsSection } from './AgentsSection';

function BrandOverviewContent() {
  const { currentBrand, setBrand } = usePlatformContext();

  // Brand ID for queries
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  // Read foundation data from shared context (avoids duplicate subscription)
  const brandOverviewData = useFoundationData();

  // Appearance config exposes the optional per-brand logo color override.
  // When set, the SVG is recoloured to inherit --Logo-color via CSS `color`.
  const appearanceConfig = brandOverviewData?.appearanceConfig ?? undefined;
  const hasLogoColorOverride = !!appearanceConfig?.logo;

  // Resolve the editing brand's logo color to a literal hex.
  //
  // We do this locally rather than relying solely on the injected --Logo-color
  // CSS variable because the brand CSS pipeline is keyed on `injectionBrandId`
  // — in Default Theme mode that's the One UI Theme brand, NOT the brand being
  // edited. Resolving here guarantees the overview always shows the editing
  // brand's true logo colour, regardless of theme scope.
  const logoColorHex = React.useMemo<string | null>(() => {
    if (!hasLogoColorOverride) return null;
    const colorConfig = brandOverviewData?.color?.config;
    const presetSelection = brandOverviewData?.presetSelection;
    if (!colorConfig) return null;
    const scales = buildAvailableScales(colorConfig, presetSelection);
    const scale = scales.find(
      (s) => s.name.toLowerCase() === appearanceConfig!.logo!.scaleName.toLowerCase(),
    );
    const hex = scale?.colors?.find((c) => c.step === appearanceConfig!.logo!.baseStep)?.hex;
    return hex ?? null;
  }, [hasLogoColorOverride, appearanceConfig, brandOverviewData?.color?.config, brandOverviewData?.presetSelection]);

  // Memoize the recoloured SVG so the regex work only runs when the logo
  // or the override state actually changes.
  const logoSvgForRender = React.useMemo(() => {
    if (!currentBrand?.logoSvg) return null;
    return hasLogoColorOverride
      ? recolorSvgToCurrentColor(currentBrand.logoSvg)
      : currentBrand.logoSvg;
  }, [currentBrand?.logoSvg, hasLogoColorOverride]);

  // Fetch all brands for the brand header's duplicate flow
  const allBrands = useQuery(api.brands.list);

  // Get typography config + primary font for the Typography tile preview.
  // Use the shared resolvers which handle:
  //   - canonical → legacy field fallback (textFontId → bodyFontId → primaryFontId)
  //   - built-in Google Fonts, uploaded fonts (uploaded-* IDs), and bare family
  //     strings — `resolveBrandFontName` reads `customFonts` from the overview
  //     data so uploaded fonts show their actual family name.
  const typographyConfig = brandOverviewData?.typography?.config as
    | TypographyFoundationConfig
    | undefined;
  const primaryFontId = resolveTextFontId(typographyConfig?.fontSelection);
  const customFonts = (brandOverviewData?.customFonts ?? []) as Parameters<
    typeof resolveBrandFontName
  >[1];
  const primaryFontName = resolveBrandFontName(primaryFontId, customFonts) ?? null;
  // Best-effort FontMetadata lookup so we can preview the font in its own face.
  // For uploaded fonts and bare family strings this returns undefined and we
  // fall back to inheriting the page font.
  const primaryFont = primaryFontId ? (getFontById(primaryFontId) ?? null) : null;

  // Load primary font for preview (Google-Fonts hook safely ignores
  // non-Google IDs).
  const { loadedFonts, loadFont } = useGoogleFonts(primaryFontId ? [primaryFontId] : []);
  React.useEffect(() => {
    if (primaryFont && !loadedFonts.has(primaryFont.id)) {
      loadFont(primaryFont);
    }
  }, [primaryFont, loadedFonts, loadFont]);

  // Per-brand agent config — existence determines "Configured"
  const compositionConfig = useQuery(
    api.compositionConfigs.get,
    brandId ? { brandId } : 'skip',
  );
  const voiceConfig = useQuery(
    api.voiceConfigs.get,
    brandId ? { brandId } : 'skip',
  );

  const isLoading =
    brandOverviewData === undefined ||
    compositionConfig === undefined ||
    voiceConfig === undefined;

  // Definition completeness: configured foundations (from stats) + the two
  // per-brand agents. Drives the meter strip under the brand header.
  const completeness = React.useMemo(() => {
    const configured = (brandOverviewData?.stats?.configured ?? {}) as Record<string, boolean>;
    const foundationEntries = Object.entries(configured);
    const items = [
      ...foundationEntries.map(([, done]) => done),
      !!compositionConfig,
      !!voiceConfig,
    ];
    const total = items.length;
    const done = items.filter(Boolean).length;
    return {
      total,
      done,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }, [brandOverviewData?.stats?.configured, compositionConfig, voiceConfig]);

  if (!currentBrand) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Select a brand from the header to view its overview.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className={styles.container}>
      <BrandHeader
        currentBrand={currentBrand}
        brandId={brandId!}
        logoSvgForRender={logoSvgForRender}
        hasLogoColorOverride={hasLogoColorOverride}
        logoColorHex={logoColorHex}
        allBrands={allBrands}
        setBrand={setBrand}
      />

      <div className={tileStyles.completeness}>
        <span className={tileStyles.completenessLabel}>
          Brand definition {completeness.percent}%
        </span>
        <Progress
          value={completeness.percent}
          aria-label="Brand definition completeness"
          className={tileStyles.completenessMeter}
        />
        <span className={tileStyles.completenessDetail}>
          {completeness.done} of {completeness.total} areas configured
        </span>
      </div>

      <FoundationSelectionsSection
        brandOverviewData={brandOverviewData}
        primaryFont={primaryFont}
        primaryFontName={primaryFontName}
        loadedFonts={loadedFonts}
      />

      <AgentsSection
        compositionConfigured={!!compositionConfig}
        voiceConfigured={!!voiceConfig}
      />
    </div>
  );
}

export default function OverviewContent() {
  return (
    <React.Suspense fallback={<OverviewSkeleton />}>
      <BrandOverviewContent />
    </React.Suspense>
  );
}
