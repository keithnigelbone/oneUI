/**
 * components/icon-contained/IconContainedPageContent.tsx
 *
 * IconContained component showcase page with Advanced Mode token editor.
 * Displays attention levels, sizes, appearance roles, states, surface context,
 * and allows token customization per brand.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  IconContained,
  ICON_CONTAINED_TOKEN_MANIFEST,
  ICON_CONTAINED_RECIPE_DEFINITION,
  IconContainedPreview,
  IconContainedAttentionLevels,
  IconContainedSizes,
  IconContainedStates,
} from '@oneui/ui/components/IconContained';
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
import iconContainedMachineDocsJson from '@/generated/component-docs/iconcontained.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const iconContainedMachineDocs = iconContainedMachineDocsJson as ComponentDocumentationSpec;

/** Lazy load PropertyPanel for performance */
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/**
 * Props for IconContainedPageInner
 */
interface IconContainedPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  /** Editing brand's role-specific surface tokens (--Primary-Bold, --Secondary-Bold, etc.) */
  allRoleSurfaceVars: Record<string, string>;
  /** Default surface vars for primary appearance previews */
  defaultSurfaceVars: Record<string, string>;
  /** Configured appearance roles for this brand */
  configuredRoles: string[];
  /** Full stacking data for per-role computation */
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content with access to editor context
 */
function IconContainedPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  defaultSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: IconContainedPageContentProps) {
  const { isOpen, closePanel, draftOverrides } = useComponentTokenEditor();
  const { breakpointId } = usePlatformContext();

  // Read component controls from shared context (TopBar controls)
  const {
    previewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setPlatformsConfig,
  } = useComponentControls();

  // Sync platforms config to context when foundation data loads
  useEffect(() => {
    setPlatformsConfig(platformsConfig);
  }, [platformsConfig, setPlatformsConfig]);

  // Resolve PlatformEntry and breakpoint viewport from context selection
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

  // Density-isolated dimension overrides — uses preview density (TopBar), NOT global density (Settings)
  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  // Inline only live/local overrides; saved defaults and family themes are injected by scoped brand CSS.
  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('IconContained', draftOverrides, ICON_CONTAINED_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  // Color-filtered preview styles for Appearance Roles card.
  // Color tokens (backgroundColor, iconColor) rely on the intermediate
  // variable architecture which remaps per appearance role.
  // Setting --IconContained-backgroundColor-high via inline styles short-circuits role
  // remapping and forces all roles to Primary.
  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--IconContained-backgroundColor', '--IconContained-iconColor'];
    return Object.fromEntries(
      Object.entries(previewTokenStyles).filter(
        ([key]) => !colorPrefixes.some(prefix => key.startsWith(prefix))
      )
    );
  }, [previewTokenStyles]);

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>IconContained</h1>
          <p className={styles.description}>
            Icon rendered inside a circular pill-shaped container. Supports two
            attention levels and multi-accent appearance roles.
          </p>
        </div>

        {/* Content - Platform dimension overrides only; brand vars are scoped to previews */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>

          {/* 1. Attention Levels — High vs Medium */}
          <FoundationCard
            title="Attention Levels"
            description="High (solid bold fill) and Medium (subtle tinted fill)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...defaultSurfaceVars, ...previewTokenStylesNoColors }}>
              <IconContainedAttentionLevels />
            </div>
          </FoundationCard>

          {/* 2. Sizes — All 5 sizes at both attention levels */}
          <FoundationCard
            title="Sizes"
            description="Five size presets from XS to XL, shown at both attention levels."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...defaultSurfaceVars, ...previewTokenStylesNoColors }}>
              <IconContainedSizes />
            </div>
          </FoundationCard>

          {/* 3. Appearance Roles — High and Medium for each configured role */}
          <FoundationCard
            title="Appearance Roles"
            description={`${configuredRoles.length} appearance role${configuredRoles.length !== 1 ? 's' : ''} configured for this brand.`}
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'start', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', paddingBottom: 'var(--Spacing-3)' }}>Role</th>
                    <th style={{ textAlign: 'center', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', paddingBottom: 'var(--Spacing-3)' }}>High</th>
                    <th style={{ textAlign: 'center', color: 'var(--Text-Medium)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', paddingBottom: 'var(--Spacing-3)' }}>Medium</th>
                  </tr>
                </thead>
                <tbody>
                  {configuredRoles.map((role) => {
                    const roleVars = {};
                    return (
                      <tr key={role} style={{ ...roleVars }}>
                        <td style={{ color: 'var(--Text-High)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)', textTransform: 'capitalize' }}>
                          {role}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <IconContained icon="heart" appearance={role as any} attention="high" size="m" aria-label={`${role} high`} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <IconContained icon="heart" appearance={role as any} attention="medium" size="m" aria-label={`${role} medium`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* 4. Disabled State — Enabled vs disabled at both attention levels */}
          <FoundationCard
            title="Disabled State"
            description="Comparison of enabled and disabled states at both attention levels."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...defaultSurfaceVars, ...previewTokenStylesNoColors }}>
              <IconContainedStates />
            </div>
          </FoundationCard>

          {/* 5. Surface Context — IconContained on different surface modes */}
          <FoundationCard
            title="Surface Context"
            description="IconContained adapts automatically on different surface backgrounds."
          >
            {tokenSetsBg ? (
              <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)', ...previewTokenStylesNoColors }}>
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
                        // Override Surface CSS background with editing brand's surface color
                        // (Surface CSS reads --Surface-Subtle from platform brand, not editing brand)
                        }}
                    >
                      <span style={{ color: 'var(--Text-High)', minWidth: 'var(--Spacing-10)', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                        {label}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <IconContained icon="star" attention="high" size="m" aria-label={`High on ${label}`} />
                        <IconContained icon="star" attention="medium" size="m" aria-label={`Medium on ${label}`} />
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
              componentName="IconContained"
              tokenManifest={ICON_CONTAINED_TOKEN_MANIFEST}
              recipeDefinition={ICON_CONTAINED_RECIPE_DEFINITION}
              baselineSpec={iconContainedMachineDocs}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="IconContained"
            manifest={ICON_CONTAINED_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <IconContainedPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * IconContained Component Page — outer wrapper with full Convex pipeline
 */
export default function IconContainedPage() {
  const { theme, currentBrand } = usePlatformContext();

  // Read foundation data from shared context (avoids duplicate subscription)
  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  // Centralized surface token computation — same pipeline as useBrandCSS
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars, tokenSets: tokenSetsBg, configuredRoles } = useSurfaceTokenVars({
    foundationData, theme: themeKey, includeTokenSets: true,
  });

  const defaultSurfaceVars = useMemo<Record<string, string>>(() => {
    return {};
  }, []);

  // Fetch saved token overrides for iconContained component
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'iconContained' }
      : 'skip'
  );

  // Transform Convex data to SavedTokenOverride format
  const savedOverrides: SavedTokenOverride[] | null = useMemo(() => {
    if (!savedOverridesData) return null;
    return savedOverridesData.map((override) => ({
      tokenName: override.tokenName,
      mode: override.mode,
      value: override.value,
    }));
  }, [savedOverridesData]);

  // Fetch recipe selections for iconContained component
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'iconContained' }
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
        componentName: 'iconContained',
        selections: selections.selections,
      });
    },
    [upsertRecipeSelections, currentBrand?.id]
  );

  // Mutations for saving/clearing overrides
  const batchUpsertOverrides = useMutation(api.componentTokenOverrides.batchUpsertOverrides);
  const removeAllForComponent = useMutation(api.componentTokenOverrides.removeAllForComponent);

  // Handle saving overrides to Convex
  const handleSaveOverrides = useCallback(
    async (overrides: SavedTokenOverride[]) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }

      await batchUpsertOverrides({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: 'iconContained',
        overrides: overrides.map((o) => ({
          tokenName: o.tokenName,
          value: o.value,
        })),
      });
    },
    [batchUpsertOverrides, currentBrand?.id]
  );

  // Handle clearing all overrides from Convex
  const handleClearOverrides = useCallback(async () => {
    if (!currentBrand?.id) {
      throw new Error('No brand selected');
    }

    await removeAllForComponent({
      brandId: currentBrand.id as Id<'brands'>,
      componentName: 'iconContained',
    });
  }, [removeAllForComponent, currentBrand?.id]);

  // Gate rendering until foundation data is loaded.
  if (foundationData === undefined) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName="iconContained"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={ICON_CONTAINED_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <IconContainedPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        defaultSurfaceVars={defaultSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
