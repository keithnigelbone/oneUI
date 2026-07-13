import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { OneUIBrandProvider, type BrandData, type ThemeData } from '@oneui/ui-native';
import { SAMPLE_JIOTYPE_FONT_OVERRIDES } from './fonts/bundledFontFamilies';
import { tokens, typography } from '@oneui/tokens';
import * as OfflineBrandModule from './brand-data/offlineBrandData.generated';
import { usePageContext } from './PageContext';
import { ComponentsStack } from './screens/components/ComponentsStack';

// Guard: if the generated module fails to load (e.g. one JSON is broken during dev),
// these will be undefined — every call site uses ?. to handle that gracefully.
const getOfflineBrandData = OfflineBrandModule.getOfflineBrandData;
const getOfflineThemeData = OfflineBrandModule.getOfflineThemeData;

/** Priority list of brand names to try when the requested brand fails. */
const BRAND_FALLBACK_ORDER = ['jio', 'one-ui-theme', 'reliance', 'swadesh', 'tira'];

/**
 * A brand is usable when it has a non-null appearanceConfig — the engine needs
 * it to derive palette + surface tokens. Brands with null/missing configs
 * (e.g. stub test brands) render with no colors.
 */
function isBrandDataValid(data: BrandData | undefined): data is BrandData {
  if (!data) return false;
  const f = data.foundation as Record<string, unknown> | null | undefined;
  return f != null && f.appearanceConfig != null;
}

/**
 * Returns the first valid BrandData from the fallback priority list,
 * excluding the brand that already failed.
 */
function getOfflineFallback(excludeName: string): BrandData | undefined {
  for (const name of BRAND_FALLBACK_ORDER) {
    if (name.toLowerCase() === excludeName.toLowerCase()) continue;
    const data = getOfflineBrandData?.(name);
    if (isBrandDataValid(data)) return data;
  }
  return undefined;
}

export function ThemedShell(): React.ReactElement {
  const { theme, brandId, brands, subBrands, subBrandId, language, brandDataSource } =
    usePageContext();

  const activeBrandName = brands?.find((b) => b._id === brandId)?.name;
  // activeSubBrand doubles as ThemeData for the Convex path — the SubBrandConfig
  // record has the same 4 accent fields (primary/secondary/sparkle/brandBg) that
  // OneUIBrandProvider's theme prop expects.
  const activeSubBrand = subBrandId ? (subBrands?.find((s) => s._id === subBrandId) ?? null) : null;
  const variantName = activeSubBrand?.name;

  const useConvexBrandData = brandDataSource === 'convex';

  // Convex queries — skipped in offline mode.
  const foundationData = useQuery(
    api.foundations.getBrandOverviewData,
    useConvexBrandData && brandId ? { brandId: brandId as Id<'brands'> } : 'skip',
  );

  const componentData = useQuery(
    api.componentTokenOverrides.getAllBrandComponentData,
    useConvexBrandData && brandId ? { brandId: brandId as Id<'brands'> } : 'skip',
  );

  // Base brand data — foundation + components (no sub-brand accents applied here).
  // Sub-brand accent merging is handled inside OneUIBrandProvider via themeData.
  //
  // Offline path: if the requested brand's snapshot is missing or has invalid
  // data (e.g. null appearanceConfig), we fall back to the first available
  // valid brand rather than showing an error screen.
  const { brandData, usingFallback } = useMemo<{
    brandData: BrandData | undefined;
    usingFallback: boolean;
  }>(() => {
    if (!activeBrandName) return { brandData: undefined, usingFallback: false };

    if (brandDataSource === 'offline') {
      const requested = getOfflineBrandData?.(activeBrandName);
      if (isBrandDataValid(requested)) return { brandData: requested, usingFallback: false };

      // Log the reason before falling back
      const reason = getOfflineBrandData == null
        ? `Offline brand data module failed to load (a JSON file may be broken). Brand "${activeBrandName}" cannot be resolved.`
        : requested === undefined
          ? `No offline snapshot found for brand "${activeBrandName}". Run \`pnpm export:brands\` to generate one.`
          : `Brand "${activeBrandName}" has invalid data (appearanceConfig is null/missing). The brand engine requires a non-null appearanceConfig to build palette and surface tokens.`;
      console.warn(`[OneUI] Brand load failed — switching to fallback.\nReason: ${reason}`);

      const fallback = getOfflineFallback(activeBrandName);
      if (fallback) {
        const fallbackName = BRAND_FALLBACK_ORDER.find((n) => {
          if (n.toLowerCase() === activeBrandName.toLowerCase()) return false;
          const d = getOfflineBrandData?.(n);
          return isBrandDataValid(d);
        }) ?? 'unknown';
        console.warn(`[OneUI] Rendering with fallback brand: "${fallbackName}"`);
      } else {
        console.error(`[OneUI] All fallback brands exhausted — no valid offline snapshot found. Brand list tried: ${BRAND_FALLBACK_ORDER.join(', ')}.`);
      }
      return { brandData: fallback, usingFallback: fallback != null };
    }

    // Convex path: gate on both queries to prevent rendering with incomplete
    // component overrides (shapeLanguage / emphasisStyle / tokenRefs).
    if (foundationData === undefined || componentData === undefined) {
      return { brandData: undefined, usingFallback: false };
    }
    return { brandData: { foundation: foundationData, components: componentData }, usingFallback: false };
  }, [activeBrandName, brandDataSource, foundationData, componentData]);

  // Sub-brand theme delta — passed to OneUIBrandProvider which merges it internally.
  const themeDelta = useMemo<ThemeData | null>(() => {
    if (!variantName) return null;

    if (brandDataSource === 'offline') {
      // getOfflineThemeData returns undefined when no theme file exists for the
      // variant — fall back to null so base brand renders without sub-brand accents.
      return getOfflineThemeData?.(activeBrandName ?? '', variantName) ?? null;
    }

    // Convex path: raw SubBrandConfig already has the 4 required accent fields.
    return activeSubBrand as ThemeData | null;
  }, [variantName, brandDataSource, activeBrandName, activeSubBrand]);

  // All fallbacks exhausted — show error only as last resort
  if (brandDataSource === 'offline' && activeBrandName && brandData === undefined) {
    return (
      <MissingSnapshotFallback
        brandName={activeBrandName}
        variantName={variantName ?? 'base'}
      />
    );
  }

  return (
    <OneUIBrandProvider
      brand={brandData}
      theme={themeDelta}
      mode={theme}
      language={language}
      fontFamilyOverrides={SAMPLE_JIOTYPE_FONT_OVERRIDES}
      loadingFallback={
        <LoadingFallback
          brandName={activeBrandName}
          brandDataSource={brandDataSource}
          usingFallback={usingFallback}
        />
      }
    >
      <NavigationContainer>
        <ComponentsStack />
      </NavigationContainer>
    </OneUIBrandProvider>
  );
}

function MissingSnapshotFallback({
  brandName,
  variantName,
}: {
  brandName: string;
  variantName: string;
}): React.ReactElement {
  return (
    <View style={styles.loadingFallback}>
      <Text style={styles.loadingText}>
        No offline snapshot for {brandName}
        {variantName !== 'base' ? ` / ${variantName}` : ''}.
      </Text>
      <Text style={styles.loadingHint}>
        Run `pnpm --filter @oneui/native-components-sample export:brands`, or switch Brand data to
        Convex (live) in the header.
      </Text>
    </View>
  );
}

function LoadingFallback({
  brandName,
  brandDataSource,
  usingFallback = false,
}: {
  brandName?: string;
  brandDataSource: 'offline' | 'convex';
  usingFallback?: boolean;
}): React.ReactElement {
  const sourceLabel = brandDataSource === 'offline' ? 'offline snapshot' : 'Convex';

  return (
    <View style={styles.loadingFallback}>
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>
        {brandName
          ? `Loading ${brandName} theme (${sourceLabel})…`
          : `Loading brand theme (${sourceLabel})…`}
      </Text>
      {usingFallback && brandName ? (
        <Text style={styles.loadingHint}>
          {brandName} has no valid snapshot — using default brand instead.
        </Text>
      ) : !brandName && brandDataSource === 'offline' ? (
        <Text style={styles.loadingHint}>
          Run `pnpm --filter @oneui/native-components-sample export:brands` if brand snapshots are
          missing.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing['4'],
    paddingHorizontal: tokens.spacing['6'],
  },
  loadingText: {
    fontSize: typography.size.m,
    textAlign: 'center',
  },
  loadingHint: {
    fontSize: typography.size.s,
    textAlign: 'center',
    opacity: 0.7,
  },
});
