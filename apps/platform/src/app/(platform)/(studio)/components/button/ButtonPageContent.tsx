/**
 * components/button/page.tsx
 *
 * Button component showcase page with Advanced Mode token editor.
 * Displays variants, sizes, states, and allows token customization per brand.
 * Always shows buttons on different surface backgrounds (surface-context aware).
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Button,
  BUTTON_TOKEN_MANIFEST,
  BUTTON_RECIPE_DEFINITION,
  ButtonAttentionLevels,
  ButtonSizes,
  ButtonCondensed,
  ButtonStates,
  ButtonWithSlots,
  ButtonFullWidth,
  ButtonSurfaceShowcase,
} from '@oneui/ui/components/Button';
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

import type {
  ComponentThemeFamilyId,
  ComponentThemeSelections,
  PlatformsFoundationConfig,
  PlatformEntry,
  PlatformBreakpoint,
  RecipeSelections,
} from '@oneui/shared';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import styles from '../component.module.css';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import buttonMachineDocsJson from '@/generated/component-docs/button.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const buttonMachineDocs = buttonMachineDocsJson as ComponentDocumentationSpec;

// Lazy load PropertyPanel for performance
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/**
 * Button preview component for the token editor
 * Applies token overrides as CSS custom properties for live preview
 * Note: Button doesn't accept a style prop, so we show all variants for reference
 */
function ButtonPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', ...tokens }}>
      <Button attention="high">Bold</Button>
      <Button attention="medium">Subtle</Button>
      <Button attention="low">Ghost</Button>
    </div>
  );
}

/**
 * Props for ButtonPageContent
 */
interface ButtonPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  /** All role surface tokens (--Primary-Bold, --Secondary-Bold, etc.) */
  allRoleSurfaceVars: Record<string, string>;
  /** Configured appearance roles for this brand */
  configuredRoles: string[];
  /** Full token sets data for per-role button var computation */
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content with access to editor context
 */
function ButtonPageContent({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: ButtonPageContentProps) {
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

  // Inline only live/local overrides; saved defaults and family themes are injected by the scoped brand CSS layer.
  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Button', draftOverrides, BUTTON_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  // Color-filtered preview styles for Appearance Roles card.
  // Color tokens (backgroundColor, textColor, borderColor) rely on the intermediate
  // variable architecture (--_btn-fg-bold etc.) which remaps per appearance role.
  // Setting --Button-backgroundColor-bold via inline styles short-circuits role
  // remapping and forces all roles to Primary. Same pattern as Avatar page.
  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--Button-backgroundColor', '--Button-textColor', '--Button-borderColor'];
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
          <h1 className={styles.title}>Button</h1>
          <p className={styles.description}>
            Primary interactive element for triggering actions. Supports multi-accent
            appearance roles and condensed mode for dense layouts.
          </p>
        </div>

        {/* Content - Platform dimension overrides only; brand vars are scoped to button previews */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Appearance Preview */}
          <FoundationCard
            title="Variants on Appearance"
            description="High, medium, and low attention levels."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <ButtonAttentionLevels />
            </div>
          </FoundationCard>

          {/* Surface Preview - Buttons on all V4 surface modes with inline surface-aware vars */}
          <FoundationCard
            title="Variants on Surfaces"
            description="Button variants adapt to different surface backgrounds for proper contrast."
          >
            {!tokenSetsBg ? (
              <div className={styles.showcase}>
                <p
                  style={{
                    color: 'var(--Text-Medium)',
                    fontFamily: 'var(--Typography-Font-Primary)',
                    fontSize: 'var(--Body-S-FontSize)',
                    lineHeight: 'var(--Body-S-LineHeight)',
                  }}
                >
                  Surface data unavailable — configure colors and surfaces in Foundations.
                </p>
              </div>
            ) : (
              // Shared surface-ladder primitive — the same section Storybook renders,
              // so docs and stories never drift. Live editor draft overrides overlay
              // via the wrapping custom-property vars; the saved theme comes from the
              // global #oneui-component-overrides injection. Color tokens are stripped
              // (previewTokenStylesNoColors) so each bold/elevated row keeps remapping
              // per surface — inline --Button-*Color-* vars would pin the color at the
              // root-resolved value and flatten the ladder to a single appearance.
              <div className={styles.showcase} style={previewTokenStylesNoColors}>
                <ButtonSurfaceShowcase />
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
                // Compute per-role button vars so each row shows its own accent color.
                // Uses the role's own token set (if available) to generate correct
                // bold/subtle/ghost fills, rather than defaulting to primary.
                const roleTokenSet = tokenSetsBg?.roles?.[role];
                // Reference the role's --{Role}-Bold / --{Role}-Bold-High CSS variables so
                // surface-context remapping (including [data-material="transparent"]) applies.
                // Fallback to the resolved hex covers the FOUC window before brand CSS injects
                // AND preserves the override's priority in the --Button-backgroundColor-bold chain.
                const roleTokenCasing = role === 'brand-bg' ? 'Brand-Bg' : role.charAt(0).toUpperCase() + role.slice(1);
                const roleButtonVars = roleTokenSet
                  ? {
                      '--Button-backgroundColor-bold': `var(--${roleTokenCasing}-Bold, ${roleTokenSet.surfaces.bold.hex})`,
                      '--Button-textColor-bold': `var(--${roleTokenCasing}-Bold-High, ${roleTokenSet.onBoldContent.high.blendedHex})`,
                    }
                  : {};
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
                      ...roleButtonVars,
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
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap' }}>
                      <Button appearance={role as any} attention="high">Bold</Button>
                      <Button appearance={role as any} attention="medium">Subtle</Button>
                      <Button appearance={role as any} attention="low">Ghost</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </FoundationCard>

          {/* Condensed */}
          <FoundationCard
            title="Condensed"
            description="Reduced padding and height for dense layouts and inline actions."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <ButtonCondensed />
            </div>
          </FoundationCard>

          {/* Full Width */}
          <FoundationCard
            title="Full Width"
            description="Stretch to fill the container width for forms and full-width layouts."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <ButtonFullWidth />
            </div>
          </FoundationCard>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three size options for different contexts."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <ButtonSizes />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="Interactive states for feedback and loading."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <ButtonStates />
            </div>
          </FoundationCard>

          {/* With Icons */}
          <FoundationCard
            title="With Icons"
            description="Icons can be placed in the start slot, end slot, or both."
          >
            <div style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <ButtonWithSlots />
            </div>
          </FoundationCard>

          {/* Props & Usage — minimal mode hides narrative doc sections */}
          <FoundationCard
            title="Props & Usage"
            collapsible
          >
            <ComponentDocumentation
              componentName="Button"
              baselineSpec={buttonMachineDocs}
              tokenManifest={BUTTON_TOKEN_MANIFEST}
              recipeDefinition={BUTTON_RECIPE_DEFINITION}
              minimal
            />
          </FoundationCard>
        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Button"
            manifest={BUTTON_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <ButtonPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Button Component Page
 */
export default function ButtonPage() {
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

  // Fetch saved token overrides for button component
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'button' }
      : 'skip'
  );

  // Transform Convex data to SavedTokenOverride format
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

  // Fetch recipe selections for button component
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'button' }
      : 'skip'
  );

  const upsertRecipeSelections = useMutation(api.componentRecipeSelections.upsertRecipeSelections);
  const savedComponentThemeSelectionsData = useQuery(
    api.componentTokenOverrides.getComponentThemeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'> }
      : 'skip'
  );
  const upsertComponentThemeSelections = useMutation(
    api.componentTokenOverrides.upsertComponentThemeSelections
  );

  const savedRecipeSelections: RecipeSelections | null = useMemo(() => {
    if (!savedRecipeSelectionsData) return null;
    return {
      selections: (savedRecipeSelectionsData.selections || {}) as Record<string, string>,
    };
  }, [savedRecipeSelectionsData]);

  const savedComponentThemeSelections: ComponentThemeSelections[] | null = useMemo(() => {
    if (!savedComponentThemeSelectionsData) return null;
    return savedComponentThemeSelectionsData.map((selection) => ({
      familyId: selection.familyId as ComponentThemeFamilyId,
      selections: (selection.selections || {}) as Record<string, string>,
    }));
  }, [savedComponentThemeSelectionsData]);

  const handleSaveRecipeSelections = useCallback(
    async (selections: RecipeSelections) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await upsertRecipeSelections({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: 'button',
        selections: selections.selections,
      });
    },
    [upsertRecipeSelections, currentBrand?.id]
  );

  const handleSaveComponentThemeSelections = useCallback(
    async (
      familyId: ComponentThemeFamilyId,
      selections: ComponentThemeSelections
    ) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await upsertComponentThemeSelections({
        brandId: currentBrand.id as Id<'brands'>,
        familyId,
        selections: selections.selections,
      });
    },
    [upsertComponentThemeSelections, currentBrand?.id]
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
        componentName: 'button',
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

  // Handle clearing all overrides from Convex
  const handleClearOverrides = useCallback(async () => {
    if (!currentBrand?.id) {
      throw new Error('No brand selected');
    }

    await removeAllForComponent({
      brandId: currentBrand.id as Id<'brands'>,
      componentName: 'button',
    });
  }, [removeAllForComponent, currentBrand?.id]);

  // Gate rendering until foundation data is loaded.
  // This prevents the flash of wrong colors (e.g., red fallback from primitives.css)
  // before brand-specific V4 tokens (--Primary-Bold, etc.) are ready.
  if (foundationData === undefined) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName="button"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={BUTTON_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
      savedComponentThemeSelections={savedComponentThemeSelections}
      onSaveComponentThemeSelections={handleSaveComponentThemeSelections}
    >
      <ButtonPageContent
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
