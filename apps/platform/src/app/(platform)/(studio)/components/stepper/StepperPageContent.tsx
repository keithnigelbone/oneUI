/**
 * components/stepper/StepperPageContent.tsx
 *
 * Stepper component showcase page with Advanced Mode token editor.
 * Displays attention levels, sizes, states, surfaces, and allows token customization per brand.
 * Mirrors the Button page structure with Stepper-specific sections.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Stepper,
  STEPPER_TOKEN_MANIFEST,
  STEPPER_RECIPE_DEFINITION,
  StepperAttentionLevels,
  StepperSizes,
  StepperStates,
  StepperCondensed,
} from '@oneui/ui/components/Stepper';
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
import stepperMachineDocsJson from '@/generated/component-docs/stepper.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const stepperMachineDocs = stepperMachineDocsJson as ComponentDocumentationSpec;

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
 * Stepper preview component for the token editor
 */
function StepperPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', ...tokens }}>
      <Stepper attention="high" defaultValue={5} />
      <Stepper attention="medium" defaultValue={5} />
      <Stepper attention="low" defaultValue={5} />
    </div>
  );
}

/**
 * Props for StepperPageContent
 */
interface StepperPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  configuredRoles: string[];
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content with access to editor context
 */
function StepperPageContent({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: StepperPageContentProps) {
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

  // Inline only live/local overrides; saved defaults and family themes are injected by scoped brand CSS.
  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Stepper', draftOverrides, STEPPER_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--Stepper-backgroundColor', '--Stepper-textColor', '--Stepper-borderColor', '--Stepper-iconColor', '--Stepper-trackColor'];
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
          <h1 className={styles.title}>Stepper</h1>
          <p className={styles.description}>
            Numeric stepper for increasing or decreasing values in small increments.
            Supports 3 attention levels, 3 sizes, multi-accent appearance roles,
            condensed mode, and surface-context awareness.
          </p>
        </div>

        {/* Content */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Attention Levels */}
          <FoundationCard
            title="Attention Levels"
            description="Three attention levels control visual weight: High, Medium, Low."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <StepperAttentionLevels />
            </div>
          </FoundationCard>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three size options for different contexts."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <StepperSizes />
            </div>
          </FoundationCard>

          {/* Condensed */}
          <FoundationCard
            title="Condensed"
            description="Reduced height for dense layouts and inline actions."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <StepperCondensed />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="Interactive states for feedback and constraints."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <StepperStates />
            </div>
          </FoundationCard>

          {/* Surface Preview — Steppers on all V4 surface modes */}
          <FoundationCard
            title="Attention on Surfaces"
            description="Stepper attention levels adapt to different surface backgrounds for proper contrast."
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
                      ...previewTokenStylesNoColors,
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
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Stepper appearance="secondary" attention="high" defaultValue={5} />
                      <Stepper appearance="secondary" attention="medium" defaultValue={5} />
                      <Stepper appearance="secondary" attention="low" defaultValue={5} />
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
            <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-4)', ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              {configuredRoles.map((role) => {
                const roleVars = {};
                return (
                  <div
                    key={role}
                    className={styles.showcaseItem}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 'var(--Spacing-4)',
                      width: '100%',
                      ...roleVars,
                    }}
                  >
                    <span
                      className={styles.showcaseLabel}
                      style={{
                        minWidth: 'var(--Spacing-16)',
                        margin: 0,
                        fontWeight: 'var(--Typography-Weight-Medium)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {role}
                    </span>
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Stepper appearance={role as any} attention="high" defaultValue={5} />
                      <Stepper appearance={role as any} attention="medium" defaultValue={5} />
                      <Stepper appearance={role as any} attention="low" defaultValue={5} />
                    </div>
                  </div>
                );
              })}
            </div>
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard
            title="Props & Usage"
            collapsible
          >
            <ComponentDocumentation
              componentName="Stepper"
              tokenManifest={STEPPER_TOKEN_MANIFEST}
              recipeDefinition={STEPPER_RECIPE_DEFINITION}
              baselineSpec={stepperMachineDocs}
              minimal
            />
          </FoundationCard>
        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Stepper"
            manifest={STEPPER_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <StepperPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Stepper Component Page
 */
export default function StepperPage() {
  const { theme, currentBrand } = usePlatformContext();

  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars, tokenSets: tokenSetsBg, configuredRoles } = useSurfaceTokenVars({
    foundationData, theme: themeKey, includeTokenSets: true,
  });

  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'stepper' }
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'stepper' }
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
        componentName: 'stepper',
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
        componentName: 'stepper',
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
      componentName: 'stepper',
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
      componentName="stepper"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={STEPPER_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <StepperPageContent
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
