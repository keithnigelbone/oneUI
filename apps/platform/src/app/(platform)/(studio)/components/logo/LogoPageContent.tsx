/**
 * components/logo/LogoPageContent.tsx
 *
 * Logo component showcase page with Advanced Mode token editor.
 * Displays the current brand's logo from Convex, sizes, variants,
 * surface context, and allows token customization per brand.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Logo,
  LOGO_TOKEN_MANIFEST,
  LOGO_RECIPE_DEFINITION,
  LogoPreview,
  LogoSizes,
  LogoVariants,
} from '@oneui/ui/components/Logo';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import type { MultiRoleTokenSets } from '@oneui/shared/engine';
import {
  ComponentTokenEditorProvider,
  useComponentTokenEditor,
  PropertyPanelSkeleton,
  type SavedTokenOverride,
} from '@/design-tools/ComponentTokenEditor';
import { buildComponentPreviewStyles } from '@/design-tools/ComponentTokenEditor/utils/buildPreviewStyles';
import { tintSvgToCurrentColor } from '@/app/(platform)/_layout/lib/tintSvgToCurrentColor';

import type { PlatformsFoundationConfig, PlatformEntry, PlatformBreakpoint, RecipeSelections } from '@oneui/shared';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import styles from '../component.module.css';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import logoMachineDocsJson from '@/generated/component-docs/logo.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const logoMachineDocs = logoMachineDocsJson as ComponentDocumentationSpec;

/** Lazy load PropertyPanel for performance */
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/** Logo sizes */
const SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;

/** Size labels for display */
const SIZE_LABELS: Record<string, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

/** Placeholder SVG for brands without a logo */
const PLACEHOLDER_SVG = `<svg viewBox="0 0 100 100" fill="currentColor">
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" font-family="sans-serif">?</text>
</svg>`;


interface LogoPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  defaultSurfaceVars: Record<string, string>;
  tokenSetsBg: MultiRoleTokenSets | null;
  /** Current brand's logoSvg from Convex (may be undefined) */
  brandLogoSvg?: string;
}

/**
 * Inner content with access to editor context
 */
function LogoPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  defaultSurfaceVars,
  tokenSetsBg,
  brandLogoSvg,
}: LogoPageContentProps) {
  const { isOpen, closePanel, draftOverrides } = useComponentTokenEditor();
  const { breakpointId } = usePlatformContext();

  const {
    previewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setPlatformsConfig,
  } = useComponentControls();

  useEffect(() => {
    setPlatformsConfig(platformsConfig);
  }, [platformsConfig, setPlatformsConfig]);

  const selectedPlatformEntry = useMemo<PlatformEntry | null>(() => {
    if (!selectedPlatformId) return null;
    return platformsConfig.platforms.find((p) => p.id === selectedPlatformId) ?? null;
  }, [selectedPlatformId, platformsConfig]);

  const breakpointViewport = useMemo<number | null>(() => {
    if (!selectedPlatformEntry || !selectedBreakpointId) return null;
    const bp = selectedPlatformEntry.breakpoints.find(
      (b: PlatformBreakpoint) => b.id === selectedBreakpointId
    );
    return bp?.viewportWidth ?? null;
  }, [selectedPlatformEntry, selectedBreakpointId]);

  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Logo', draftOverrides, LOGO_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  // Tint the SVG fills to currentColor so it picks up --Primary-Bold from CSS.
  // White fills are preserved (logo text/icons), all other fills become currentColor.
  const logoSvg = brandLogoSvg ? tintSvgToCurrentColor(brandLogoSvg) : PLACEHOLDER_SVG;
  const hasLogo = !!brandLogoSvg;

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Logo</h1>
          <p className={styles.description}>
            A visual mark that identifies and reinforces brand identity throughout the interface.
          </p>
        </div>

        {/* Content */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>

          {/* 1. Brand Logo — show the current brand's uploaded logo */}
          <FoundationCard
            title="Brand Logo"
            description={hasLogo
              ? 'Current brand logo from the database. Upload or change in Brand Overview.'
              : 'No logo uploaded for this brand. Upload one in Brand Overview to see it here.'
            }
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...defaultSurfaceVars, ...previewTokenStyles }}>
              <LogoSizes svgContent={logoSvg} />
            </div>
          </FoundationCard>

          {/* 2. Variants — mark vs full */}
          <FoundationCard
            title="Variants"
            description="Mark (circular container) and Full (rectangular wordmark)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...defaultSurfaceVars, ...previewTokenStyles }}>
              <LogoVariants svgContent={logoSvg} />
            </div>
          </FoundationCard>

          {/* 3. Surface Context — Logo on different surface modes */}
          <FoundationCard
            title="Surface Context"
            description="Logo adapts automatically on different surface backgrounds."
          >
            {tokenSetsBg ? (
              <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)', ...previewTokenStyles }}>
                {([
                  { mode: 'default' as const, label: 'Default' },
                  { mode: 'minimal' as const, label: 'Minimal' },
                  { mode: 'subtle' as const, label: 'Subtle' },
                  { mode: 'moderate' as const, label: 'Moderate' },
                  { mode: 'bold' as const, label: 'Bold' },
                  { mode: 'elevated' as const, label: 'Elevated' },
                ] as const).map(({ mode, label }) => {
                  return (
                    <Surface
                      key={mode}
                      mode={mode}
                      style={{
                        padding: 'var(--Spacing-4)',
                        borderRadius: 'var(--Shape-4)',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 'var(--Spacing-4)',
                        width: '100%',
                        }}
                    >
                      <span style={{ color: 'var(--Text-High)', minWidth: 'var(--Spacing-10)', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                        {label}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                        {SIZES.map((size) => (
                          <Logo key={size} size={size} svgContent={logoSvg} alt={`${label} ${SIZE_LABELS[size]}`} />
                        ))}
                      </div>
                    </Surface>
                  );
                })}
              </div>
            ) : (
              <div className={styles.showcase}>
                <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>Surface data unavailable.</p>
              </div>
            )}
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard title="Props & Usage" collapsible>
            <ComponentDocumentation
              componentName="Logo"
              tokenManifest={LOGO_TOKEN_MANIFEST}
              recipeDefinition={LOGO_RECIPE_DEFINITION}
              baselineSpec={logoMachineDocs}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Logo"
            manifest={LOGO_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <LogoPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Logo Component Page — outer wrapper with full Convex pipeline
 */
export default function LogoPage() {
  const { theme, currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars, tokenSets: tokenSetsBg } = useSurfaceTokenVars({
    foundationData, theme: themeKey, includeTokenSets: true,
  });

  const defaultSurfaceVars = useMemo<Record<string, string>>(() => {
    return {};
  }, []);

  // Fetch the current brand's logoSvg directly
  const brandData = useQuery(
    api.brands.get,
    currentBrand?.id ? { id: currentBrand.id as Id<'brands'> } : 'skip'
  );

  // Fetch saved token overrides for logo component
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'logo' }
      : 'skip'
  );

  const savedOverrides: SavedTokenOverride[] | null = useMemo(() => {
    if (!savedOverridesData) return null;
    return savedOverridesData.map((override) => ({
      tokenName: override.tokenName,
      mode: override.mode,
      value: override.value,
    }));
  }, [savedOverridesData]);

  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'logo' }
      : 'skip'
  );

  const upsertRecipeSelections = useMutation(api.componentRecipeSelections.upsertRecipeSelections);

  const savedRecipeSelections: RecipeSelections | null = useMemo(() => {
    if (!savedRecipeSelectionsData) return null;
    return {
      selections: (savedRecipeSelectionsData.selections || {}) as Record<string, string>,
    };
  }, [savedRecipeSelectionsData]);

  const handleSaveRecipeSelections = useCallback(
    async (selections: RecipeSelections) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await upsertRecipeSelections({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: 'logo',
        selections: selections.selections,
      });
    },
    [upsertRecipeSelections, currentBrand?.id]
  );

  const batchUpsertOverrides = useMutation(api.componentTokenOverrides.batchUpsertOverrides);
  const removeAllForComponent = useMutation(api.componentTokenOverrides.removeAllForComponent);

  const handleSaveOverrides = useCallback(
    async (overrides: SavedTokenOverride[]) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await batchUpsertOverrides({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: 'logo',
        overrides: overrides.map((o) => ({
          tokenName: o.tokenName,
          value: o.value,
        })),
      });
    },
    [batchUpsertOverrides, currentBrand?.id]
  );

  const handleClearOverrides = useCallback(async () => {
    if (!currentBrand?.id) {
      throw new Error('No brand selected');
    }
    await removeAllForComponent({
      brandId: currentBrand.id as Id<'brands'>,
      componentName: 'logo',
    });
  }, [removeAllForComponent, currentBrand?.id]);

  if (foundationData === undefined) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName="logo"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={LOGO_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <LogoPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        defaultSurfaceVars={defaultSurfaceVars}
        tokenSetsBg={tokenSetsBg}
        brandLogoSvg={brandData?.logoSvg}
      />
    </ComponentTokenEditorProvider>
  );
}
