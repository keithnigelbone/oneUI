/**
 * components/input/InputPageContent.tsx
 *
 * Input component showcase page with Advanced Mode token editor.
 * Displays sizes, states, appearance roles, slot system, shapes,
 * feedback, DynamicText row, full composition, and surface context.
 * Allows token customization per brand.
 *
 * Architecture:
 *   - InputField: label slot or strings + input + feedback + DynamicText row (Figma 4298:6330)
 *   - 4-slot system: start, start2, end2, end
 *   - Feedback row: InputFeedback (4 variants × 3 attention × 3 sizes)
 *   - Dynamic text row: InputDynamicText (Figma DynamicText)
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  InputField,
  INPUT_TOKEN_MANIFEST,
  INPUT_RECIPE_DEFINITION,
  InputPreview,
  InputFieldSizes,
  InputFieldStates,
  InputFieldWithSlots,
  InputFeedbackShowcase,
  InputDynamicTextShowcase,
  InputFieldFullComposition,
  InputFieldShapes,
  InputFieldSurfaceContext,
} from '@oneui/ui/components/Input';
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
import inputMachineDocsJson from '@/generated/component-docs/input.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const inputMachineDocs = inputMachineDocsJson as ComponentDocumentationSpec;

// Lazy load PropertyPanel for performance
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

// ─── Shared table/label styles ────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-XS)',
  color: 'var(--Text-Low)',
  fontWeight: 'var(--Typography-Weight-Medium)',
  textAlign: 'left',
  padding: 'var(--Spacing-3)',
};

/**
 * Props passed from the outer data-fetching shell to the inner content
 */
interface InputPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  /** Editing brand's role-specific surface tokens (--Primary-Bold, etc.) */
  allRoleSurfaceVars: Record<string, string>;
  /** Configured appearance roles for this brand */
  configuredRoles: string[];
  /** Full stacking data for per-role input var computation */
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content — has access to the ComponentTokenEditor context
 */
function InputPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg: _tokenSetsBg,
}: InputPageContentProps) {
  const { isOpen, closePanel, draftOverrides } = useComponentTokenEditor();
  const { breakpointId } = usePlatformContext();

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

  // Density-isolated dimension overrides — uses preview density (TopBar), NOT global density
  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  // Inline only live/local overrides; saved defaults and family themes are injected by scoped brand CSS.
  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Input', draftOverrides, INPUT_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Input</h1>
          <p className={styles.description}>
            Text input field with label, 4-slot system, validation feedback, and optional DynamicText row.
            Composes field label stack + Input + InputFeedback + InputDynamicText via the InputField aggregator.
          </p>
        </div>

        {/* Content - Platform dimension overrides only; brand vars are scoped to input previews */}
        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three sizes: S (f8), M (f10), L (f12) — driven by the f-step dimension scale."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <InputFieldSizes />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="All visual states: idle, filled, disabled, read-only, error, description, and required."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <InputFieldStates />
            </div>
          </FoundationCard>

          {/* Appearance Roles */}
          <FoundationCard
            title="Appearance Roles"
            description={`${configuredRoles.length} appearance role${configuredRoles.length !== 1 ? 's' : ''} configured for this brand.`}
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--Spacing-4)',
                width: '100%',
              }}>
                {configuredRoles.map((role) => (
                  <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                    <span style={{ ...thStyle, textTransform: 'capitalize' }}>{role}</span>
                    <InputField
                      appearance={role as any}
                      label="Label"
                      placeholder={role}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FoundationCard>

          {/* With Slots */}
          <FoundationCard
            title="Slot System"
            description="4-slot system: start (icon), start2 (prefix text), end2 (suffix text), end (icon)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles, maxWidth: 400 }}>
              <InputFieldWithSlots />
            </div>
          </FoundationCard>

          {/* Shapes */}
          <FoundationCard
            title="Shapes"
            description="Default (Shape-3XS rounded corners) vs pill (fully rounded). Override via --Input-borderRadius."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles, maxWidth: 400 }}>
              <InputFieldShapes />
            </div>
          </FoundationCard>

          {/* Feedback */}
          <FoundationCard
            title="Feedback"
            description="InputFeedback: 4 semantic variants × 3 attention levels × 3 sizes (S/M/L). Uses `feedback_message` and optional `customIcon` (semantic icon name)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <InputFeedbackShowcase />
            </div>
          </FoundationCard>

          {/* Dynamic text row */}
          <FoundationCard
            title="Dynamic text row"
            description="InputDynamicText: leading copy (character count, status) and optional trailing ghost button (Figma DynamicText)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles, maxWidth: 400 }}>
              <InputDynamicTextShowcase />
            </div>
          </FoundationCard>

          {/* Full Composition */}
          <FoundationCard
            title="Full Composition"
            description="Label, optional description, feedback, and DynamicText row — order and gap match Figma `.DNA/InputField` (4298:6330)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles, maxWidth: 400 }}>
              <InputFieldFullComposition />
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Input automatically adapts when placed on different surface backgrounds. Uses secondary appearance with secondary fill overrides."
          >
            <InputFieldSurfaceContext />
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard
            title="Props & Usage"
            collapsible
          >
            <ComponentDocumentation
              componentName="Input"
              baselineSpec={inputMachineDocs}
              tokenManifest={INPUT_TOKEN_MANIFEST}
              recipeDefinition={INPUT_RECIPE_DEFINITION}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Input"
            manifest={INPUT_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <InputPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Input Component Page — data-fetching shell
 */
export default function InputPage() {
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

  // Fetch saved token overrides for input component
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'input' }
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

  // Fetch recipe selections for input component
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'input' }
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
        componentName: 'input',
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
        componentName: 'input',
        overrides: overrides.map((o) => ({
          tokenName: o.tokenName,
          value: o.value,
        })),
      });
    },
    [batchUpsertOverrides, currentBrand?.id]
  );

  const handleClearOverrides = useCallback(async () => {
    if (!currentBrand?.id) throw new Error('No brand selected');
    await removeAllForComponent({
      brandId: currentBrand.id as Id<'brands'>,
      componentName: 'input',
    });
  }, [removeAllForComponent, currentBrand?.id]);

  // Gate rendering until foundation data is loaded (prevents flash of wrong colors)
  if (foundationData === undefined) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName="input"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={INPUT_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <InputPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
