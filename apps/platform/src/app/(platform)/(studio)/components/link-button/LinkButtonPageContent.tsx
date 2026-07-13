/**
 * components/link-button/LinkButtonPageContent.tsx
 *
 * LinkButton component showcase page with Advanced Mode token editor.
 * Displays attention levels, sizes, states, appearance roles, slots,
 * surface context, and allows token customization per brand.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  LinkButton,
  LINKBUTTON_TOKEN_MANIFEST,
  LINKBUTTON_RECIPE_DEFINITION,
  LinkButtonAttentionLevels,
  LinkButtonSizes,
  LinkButtonStates,
  LinkButtonWithSlots,
} from '@oneui/ui/components/LinkButton';
import { Surface } from '@oneui/ui/components/Surface';
import {
  FoundationCard,
} from '@/design-tools/Foundations/shared';
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
import linkButtonMachineDocsJson from '@/generated/component-docs/linkbutton.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const linkButtonMachineDocs = linkButtonMachineDocsJson as ComponentDocumentationSpec;

/** Unified surface modes */
const SURFACE_MODE_LABELS: Array<{ mode: 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold' | 'elevated'; label: string }> = [
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
 * Preview component for the token editor panel
 */
function LinkButtonPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', ...tokens }}>
      <LinkButton attention="high">Bold</LinkButton>
      <LinkButton attention="medium">Subtle</LinkButton>
      <LinkButton attention="low">Ghost</LinkButton>
    </div>
  );
}

interface LinkButtonPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  configuredRoles: string[];
  tokenSetsBg: MultiRoleTokenSets | null;
}

function LinkButtonPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: LinkButtonPageContentProps) {
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
    () => buildComponentPreviewStyles('LinkButton', draftOverrides, LINKBUTTON_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--LinkButton-textColor', '--LinkButton-underlineColor'];
    return Object.fromEntries(
      Object.entries(previewTokenStyles).filter(
        ([key]) => !colorPrefixes.some(prefix => key.startsWith(prefix))
      )
    );
  }, [previewTokenStyles]);

  /** Shared table styles */
  const thStyle: React.CSSProperties = {
    fontSize: 'var(--Typography-Size-XS)',
    color: 'var(--Text-Low)',
    fontWeight: 'var(--Typography-Weight-Medium)',
    textAlign: 'left',
    padding: 'var(--Spacing-3)',
  };
  const thCenter: React.CSSProperties = { ...thStyle, textAlign: 'center' };
  const tdLabel: React.CSSProperties = {
    fontSize: 'var(--Typography-Size-S)',
    fontWeight: 'var(--Typography-Weight-Medium)',
    color: 'var(--Text-High)',
    padding: 'var(--Spacing-3)',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  };
  const tdCenter: React.CSSProperties = { textAlign: 'center', padding: 'var(--Spacing-3)', verticalAlign: 'middle' };
  const tableStyle: React.CSSProperties = { borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)' };

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        <div className={styles.header}>
          <h1 className={styles.title}>LinkButton</h1>
          <p className={styles.description}>
            Button with link-like styling for inline or contextual actions — transparent background,
            underline-based attention levels. Uses Label role typography.
            NOT a navigation element; use Link for {'<a>'} tags.
          </p>
        </div>

        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Attention Levels */}
          <FoundationCard
            title="Attention Levels"
            description="Three attention levels map to visual variants: high (bold — underline), medium (subtle — no underline), low (ghost — muted text, no underline)."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <LinkButtonAttentionLevels />
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Variants on Surfaces"
            description="LinkButton adapts to different surface backgrounds for proper contrast."
          >
            {!tokenSetsBg ? (
              <div className={styles.showcase}>
                <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                  Surface data unavailable — configure colors and surfaces in Foundations.
                </p>
              </div>
            ) : (
              <div
                className={styles.showcase}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-3-5)',
                }}
              >
                {SURFACE_MODE_LABELS.map(({ mode, label }) => (
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
                      ...previewTokenStyles,
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--Text-High)',
                        minWidth: '100px',
                        margin: 0,
                        fontWeight: 'var(--Typography-Weight-Medium)',
                        fontSize: 'var(--Typography-Size-S)',
                      }}
                    >
                      {label}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--Spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <LinkButton attention="high">Bold</LinkButton>
                      <LinkButton attention="medium">Subtle</LinkButton>
                      <LinkButton attention="low">Ghost</LinkButton>
                    </div>
                  </Surface>
                ))}
              </div>
            )}
          </FoundationCard>

          {/* Appearance Roles */}
          <FoundationCard
            title="Appearance Roles"
            description={`${configuredRoles.length} appearance role${configuredRoles.length !== 1 ? 's' : ''} configured for this brand.`}
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <table style={{ ...tableStyle, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Role</th>
                    <th style={thCenter}>Bold</th>
                    <th style={thCenter}>Subtle</th>
                    <th style={thCenter}>Ghost</th>
                  </tr>
                </thead>
                <tbody>
                  {configuredRoles.map((role) => {
                    const roleVars = {};
                    return (
                      <tr key={role} style={{ ...roleVars } as React.CSSProperties}>
                        <td style={{ ...tdLabel, textTransform: 'capitalize' }}>{role}</td>
                        <td style={tdCenter}><LinkButton appearance={role as any} attention="high">Link</LinkButton></td>
                        <td style={tdCenter}><LinkButton appearance={role as any} attention="medium">Link</LinkButton></td>
                        <td style={tdCenter}><LinkButton appearance={role as any} attention="low">Link</LinkButton></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three sizes: S (f8 / Label-S), M (f10 / Label-M), L (f12 / Label-L). Typography derives from the Label role."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <LinkButtonSizes />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="Interactive and accessibility states."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <LinkButtonStates />
            </div>
          </FoundationCard>

          {/* Slots */}
          <FoundationCard
            title="Slots"
            description="Start and end slots accept any inline element. Sizes scale with link button size."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <LinkButtonWithSlots />
            </div>
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard
            title="Props & Usage"
            collapsible
          >
            <ComponentDocumentation
              componentName="LinkButton"
              tokenManifest={LINKBUTTON_TOKEN_MANIFEST}
              recipeDefinition={LINKBUTTON_RECIPE_DEFINITION}
              baselineSpec={linkButtonMachineDocs}
              minimal
            />
          </FoundationCard>
        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="LinkButton"
            manifest={LINKBUTTON_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <LinkButtonPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * LinkButton Component Page — outer shell with Convex data
 */
export default function LinkButtonPage() {
  const { theme, currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars, tokenSets: tokenSetsBg, configuredRoles } = useSurfaceTokenVars({
    foundationData, theme: themeKey, includeTokenSets: true,
  });

  // Fetch saved token overrides
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'link-button' }
      : 'skip'
  );

  const savedOverrides: SavedTokenOverride[] | null = useMemo(() => {
    if (!savedOverridesData) return null;
    return savedOverridesData.map((override) => ({
      tokenName: override.tokenName,
      mode: override.mode,
      value: override.value,
      scope: override.scope as SavedTokenOverride['scope'],
      target: override.target as SavedTokenOverride['target'],
      channel: override.channel,
      valueKind: override.valueKind,
    }));
  }, [savedOverridesData]);

  // Fetch recipe selections
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'link-button' }
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
      if (!currentBrand?.id) throw new Error('No brand selected');
      await upsertRecipeSelections({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: 'link-button',
        selections: selections.selections,
      });
    },
    [upsertRecipeSelections, currentBrand?.id]
  );

  const batchUpsertOverrides = useMutation(api.componentTokenOverrides.batchUpsertOverrides);
  const removeAllForComponent = useMutation(api.componentTokenOverrides.removeAllForComponent);

  const handleSaveOverrides = useCallback(
    async (overrides: SavedTokenOverride[]) => {
      if (!currentBrand?.id) throw new Error('No brand selected');
      await batchUpsertOverrides({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: 'link-button',
        overrides: overrides.map((o) => ({
          tokenName: o.tokenName,
          value: o.value,
          scope: o.scope,
          target: o.target,
          channel: o.channel,
          valueKind: o.valueKind,
        })),
      });
    },
    [batchUpsertOverrides, currentBrand?.id]
  );

  const handleClearOverrides = useCallback(async () => {
    if (!currentBrand?.id) throw new Error('No brand selected');
    await removeAllForComponent({
      brandId: currentBrand.id as Id<'brands'>,
      componentName: 'link-button',
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
      componentName="link-button"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={LINKBUTTON_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <LinkButtonPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
