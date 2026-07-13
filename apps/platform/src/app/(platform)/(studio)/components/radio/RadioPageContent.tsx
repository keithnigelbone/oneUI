/**
 * components/radio/RadioPageContent.tsx
 *
 * Radio component showcase page with Advanced Mode token editor.
 * Displays sizes, states, appearance roles, appearance fill examples, surface context,
 * and allows token customization per brand.
 *
 * `appearance` controls border, hover, and fill tokens (including the checked state).
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Radio,
  RadioGroup,
  RADIO_TOKEN_MANIFEST,
  RADIO_RECIPE_DEFINITION,
  RadioPreview,
  RadioSizes,
  RadioStates,
  RadioAccentOverride,
  RadioSurfaceContext,
} from '@oneui/ui/components/Radio';
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
import radioMachineDocsJson from '@/generated/component-docs/radio.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const radioMachineDocs = radioMachineDocsJson as ComponentDocumentationSpec;

// Lazy load PropertyPanel for performance
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/**
 * Props for RadioPageInner
 */
interface RadioPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  /** Editing brand's role-specific surface tokens (--Primary-Bold, --Secondary-Bold, etc.) */
  allRoleSurfaceVars: Record<string, string>;
  /** Configured appearance roles for this brand */
  configuredRoles: string[];
  /** Full stacking data for per-role radio var computation */
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content with access to editor context
 */
function RadioPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: RadioPageContentProps) {
  const { isOpen, closePanel, draftOverrides } = useComponentTokenEditor();
  const { breakpointId } = usePlatformContext();

  // Read component controls from shared context (TopBar controls)
  const {
    previewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setPlatformsConfig,
  } = useComponentControls();

  // Interactive state for the Interactive card
  const [selected1, setSelected1] = useState('newsletter');
  const [selected2, setSelected2] = useState('standard');

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

  // Density-isolated dimension overrides
  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  // Inline only live/local overrides; saved defaults and family themes are injected by scoped brand CSS.
  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Radio', draftOverrides, RADIO_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  // Radio manifest has no color tokens (only spacing/typography),
  // so no color filtering is needed.
  const previewTokenStylesNoColors = previewTokenStyles;

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Radio</h1>
          <p className={styles.description}>
            Single selection within a group. The <code>appearance</code> role controls border, hover, and
            checked-state fill tokens.
          </p>
        </div>

        {/* Content - Platform dimension overrides only; brand vars are scoped to radio previews */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three size options for different UI density contexts."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <RadioSizes />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="All visual states including checked, disabled, and read-only."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <RadioStates />
            </div>
          </FoundationCard>

          {/* Appearance Roles */}
          <FoundationCard
            title="Appearance Roles"
            description={`${configuredRoles.length} appearance role${configuredRoles.length !== 1 ? 's' : ''} configured for this brand.`}
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'left', padding: 'var(--Spacing-3)' }}>Role</th>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'center', padding: 'var(--Spacing-3)' }}>Checked</th>
                    <th style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)', textAlign: 'center', padding: 'var(--Spacing-3)' }}>Unchecked</th>
                  </tr>
                </thead>
                <tbody>
                  {configuredRoles.map((role) => {
                    const roleTokenSet = tokenSetsBg?.roles?.[role];
                    const roleTokenCasing = role === 'brand-bg' ? 'Brand-Bg' : role.charAt(0).toUpperCase() + role.slice(1);
                    const roleVars = roleTokenSet
                      ? {
                          // Reference role CSS vars so surface-context remapping (including
                          // [data-material="transparent"]) applies; hex fallback covers FOUC.
                          '--_rd-fg-bold': `var(--${roleTokenCasing}-Bold, ${roleTokenSet.surfaces.bold.hex})`,
                          '--_rd-fg-bold-high': `var(--${roleTokenCasing}-Bold-High, ${roleTokenSet.onBoldContent.high.blendedHex})`,
                        }
                      : {};
                    return (
                      <tr key={role} style={{ ...roleVars } as React.CSSProperties}>
                        <td style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)', padding: 'var(--Spacing-3)', verticalAlign: 'middle', textTransform: 'capitalize' }}>{role}</td>
                        <td style={{ textAlign: 'center', padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>
                          <RadioGroup value="x" aria-label={`${role} checked`}>
                            <Radio appearance={role as any} value="x">{role}</Radio>
                          </RadioGroup>
                        </td>
                        <td style={{ textAlign: 'center', padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>
                          <RadioGroup value="" aria-label={`${role} unchecked`}>
                            <Radio appearance={role as any} value="x">{role}</Radio>
                          </RadioGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Appearance fill examples (primary / secondary / sparkle) */}
          <FoundationCard
            title="Appearance (fill roles)"
            description="Primary, secondary, and sparkle roles as the full appearance stack (border + checked fill)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <RadioAccentOverride />
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Radio automatically adapts when placed on different surface backgrounds."
          >
            <RadioSurfaceContext />
          </FoundationCard>

          {/* Interactive */}
          <FoundationCard
            title="Interactive"
            description="Functional radio groups with live state management."
          >
            <div className={styles.showcaseColumn} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
                  Notification preference
                </span>
                <RadioGroup value={selected1} onValueChange={setSelected1} aria-label="Notification preference">
                  <Radio value="newsletter">Subscribe to newsletter</Radio>
                  <Radio value="updates">Product updates only</Radio>
                  <Radio value="none">No notifications</Radio>
                </RadioGroup>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
                  Shipping speed
                </span>
                <RadioGroup value={selected2} onValueChange={setSelected2} aria-label="Shipping speed">
                  <Radio value="standard">Standard (5-7 days)</Radio>
                  <Radio value="express">Express (2-3 days)</Radio>
                  <Radio value="overnight">Overnight</Radio>
                </RadioGroup>
              </div>
            </div>
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard
            title="Props & Usage"
            collapsible
          >
            <ComponentDocumentation
              componentName="Radio"
              tokenManifest={RADIO_TOKEN_MANIFEST}
              recipeDefinition={RADIO_RECIPE_DEFINITION}
              baselineSpec={radioMachineDocs}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Radio"
            manifest={RADIO_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <RadioPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Radio Component Page
 */
export default function RadioPage() {
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

  // Fetch saved token overrides for radio component
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'radio' }
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

  // Fetch recipe selections for radio component
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'radio' }
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
        componentName: 'radio',
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
        componentName: 'radio',
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
      componentName: 'radio',
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
      componentName="radio"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={RADIO_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <RadioPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
