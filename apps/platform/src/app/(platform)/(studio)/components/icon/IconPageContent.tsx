/**
 * components/icon/IconPageContent.tsx
 *
 * Icon component showcase page with Advanced Mode token editor.
 * Displays sizes, emphasis levels, appearance roles, surface context,
 * and allows token customization per brand.
 *
 * Icon is a decorative component — no recipe queries/mutations.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Icon as DesignIcon, ICON_TOKEN_MANIFEST, IconSizesTable, IconEmphasisLevelsTable } from '@oneui/ui/components/Icon';
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

import type { PlatformsFoundationConfig, PlatformEntry, PlatformBreakpoint } from '@oneui/shared';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import styles from '../component.module.css';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import iconMachineDocsJson from '@/generated/component-docs/icon.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const iconMachineDocs = iconMachineDocsJson as ComponentDocumentationSpec;

/** Surface modes for context showcase */
const SURFACE_MODES: Array<{ mode: 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated'; label: string }> = [
  { mode: 'default', label: 'Default' },
  { mode: 'minimal', label: 'Minimal' },
  { mode: 'subtle', label: 'Subtle' },
  { mode: 'moderate', label: 'Moderate' },
  { mode: 'bold', label: 'Bold' },
  { mode: 'elevated', label: 'Elevated' },
];

// Lazy load PropertyPanel for performance
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/**
 * Props for IconPageContent
 */
interface IconPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  /** Editing brand's role-specific surface tokens */
  allRoleSurfaceVars: Record<string, string>;
  /** Configured appearance roles for this brand */
  configuredRoles: string[];
  /** Full stacking data for per-role icon colour computation */
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content with access to editor context
 */
function IconPageContent({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: IconPageContentProps) {
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
    () => buildComponentPreviewStyles('Icon', draftOverrides, ICON_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  // Color-filtered preview styles for all showcase cards.
  // Color tokens (Icon-color) rely on the intermediate variable architecture
  // which remaps per appearance role and emphasis level. Setting --Icon-color
  // via inline styles short-circuits role/emphasis remapping and forces all
  // variants to the same colour.
  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--Icon-color'];
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
          <h1 className={styles.title}>Icon</h1>
          <p className={styles.description}>
            Decorative icon display with 20 sizes from the spacing scale,
            8 appearance roles, and 5 emphasis levels for colour prominence.
          </p>
        </div>

        {/* Content - Platform dimension overrides only; brand vars are scoped to icon previews */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Representative subset of the 20 available sizes, each mapped to a spacing token from the f-step dimension scale."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <IconSizesTable />
            </div>
          </FoundationCard>

          {/* Emphasis Levels */}
          <FoundationCard
            title="Emphasis Levels"
            description="Five emphasis levels determine icon colour prominence within the selected appearance role."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <IconEmphasisLevelsTable />
            </div>
          </FoundationCard>

          {/* Appearance Roles */}
          <FoundationCard
            title="Appearance Roles"
            description={`${configuredRoles.length} appearance role${configuredRoles.length !== 1 ? 's' : ''} configured for this brand.`}
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4-5) var(--Spacing-3-5)' }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'left', padding: 'var(--Spacing-3)' }}>Role</th>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'center', padding: 'var(--Spacing-3)' }}>High</th>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'center', padding: 'var(--Spacing-3)' }}>Medium</th>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'center', padding: 'var(--Spacing-3)' }}>Low</th>
                  </tr>
                </thead>
                <tbody>
                  {configuredRoles.map((role) => {
                    const roleIconVars = {};
                    return (
                      <tr key={role} style={{ ...roleIconVars } as React.CSSProperties}>
                        <td style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)', padding: 'var(--Spacing-3)', verticalAlign: 'middle', textTransform: 'capitalize' }}>{role}</td>
                        <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle', textAlign: 'center' }}><DesignIcon icon="heart" size="8" appearance={role as any} emphasis="high" /></td>
                        <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle', textAlign: 'center' }}><DesignIcon icon="heart" size="8" appearance={role as any} emphasis="medium" /></td>
                        <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle', textAlign: 'center' }}><DesignIcon icon="heart" size="8" appearance={role as any} emphasis="low" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Icons automatically adapt colour when placed inside Surface containers."
          >
            {tokenSetsBg ? (
              <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)', ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
                {SURFACE_MODES.map(({ mode, label }) => {
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
                      <span
                        style={{
                          color: 'var(--Text-High)',
                          minWidth: 'var(--Spacing-10)',
                          margin: 0,
                          fontWeight: 'var(--Typography-Weight-Medium)',
                          fontSize: 'var(--Typography-Size-S)',
                        }}
                      >
                        {label}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' }}>
                        <DesignIcon icon="star" size="6" emphasis="high" />
                        <DesignIcon icon="star" size="6" emphasis="medium" />
                        <DesignIcon icon="star" size="6" emphasis="low" />
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
              componentName="Icon"
              tokenManifest={ICON_TOKEN_MANIFEST}
              baselineSpec={iconMachineDocs}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Icon"
            manifest={ICON_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', ...tokens }}>
                <DesignIcon icon="home" size="4" />
                <DesignIcon icon="home" size="6" />
                <DesignIcon icon="home" size="8" />
                <DesignIcon icon="home" size="10" />
              </div>
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Icon Component Page — outer wrapper
 */
export default function IconPage() {
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

  // Fetch saved token overrides for icon component
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'icon' }
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
        componentName: 'icon',
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
      componentName: 'icon',
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
      componentName="icon"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
    >
      <IconPageContent
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
