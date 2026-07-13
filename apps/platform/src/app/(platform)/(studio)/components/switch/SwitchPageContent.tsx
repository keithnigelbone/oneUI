/**
 * components/switch/SwitchPageContent.tsx
 *
 * Switch component showcase page with Advanced Mode token editor.
 * Displays sizes, states, appearance roles, accent overrides, surface context,
 * readonly states, and allows token customization per brand.
 *
 * Dual variable system:
 *   - `appearance` controls checked fill tokens (Bold)
 *   - `accent` optionally overrides fill only (cross-role combinations)
 *   - Unchecked state always uses Neutral tokens
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Switch,
  SWITCH_TOKEN_MANIFEST,
  SWITCH_RECIPE_DEFINITION,
  SwitchSizes,
  SwitchStates,
  SwitchAccentOverride,
  SwitchReadOnly,
  SwitchSurfaceContext,
} from '@oneui/ui/components/Switch';
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
import switchMachineDocsJson from '@/generated/component-docs/switch.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const switchMachineDocs = switchMachineDocsJson as ComponentDocumentationSpec;

// Lazy load PropertyPanel for performance
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/**
 * Props for SwitchPageInner
 */
interface SwitchPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  configuredRoles: string[];
  tokenSetsBg: MultiRoleTokenSets | null;
}

/**
 * Inner content with access to editor context
 */
function SwitchPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: SwitchPageContentProps) {
  const { isOpen, closePanel, draftOverrides } = useComponentTokenEditor();
  const { breakpointId } = usePlatformContext();

  const {
    previewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setPlatformsConfig,
  } = useComponentControls();

  // Interactive state
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);

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
    () => buildComponentPreviewStyles('Switch', draftOverrides, SWITCH_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  const previewTokenStylesNoColors = previewTokenStyles;

  /** Shared table header cell styles */
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
  const tdDefault: React.CSSProperties = { padding: 'var(--Spacing-3)', verticalAlign: 'middle' };
  const tableStyle: React.CSSProperties = { borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4) var(--Spacing-3-5)' };

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        <div className={styles.header}>
          <h1 className={styles.title}>Switch</h1>
          <p className={styles.description}>
            Toggle switch for binary on/off states. Appearance controls checked fill,
            accent optionally overrides fill color. Unchecked state is always neutral.
          </p>
        </div>

        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three size options mapped to the dimension f-scale."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <SwitchSizes />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="All visual states including checked, disabled, and read-only."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <SwitchStates />
            </div>
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
                    <th style={thStyle}>Checked</th>
                    <th style={thStyle}>Unchecked</th>
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
                          '--_sw-fg-bold': `var(--${roleTokenCasing}-Bold, ${roleTokenSet.surfaces.bold.hex})`,
                          '--_sw-fg-bold-high': `var(--${roleTokenCasing}-Bold-High, ${roleTokenSet.onBoldContent.high.blendedHex})`,
                        }
                      : {};
                    return (
                      <tr key={role} style={{ ...roleVars } as React.CSSProperties}>
                        <td style={{ ...tdLabel, textTransform: 'capitalize' }}>{role}</td>
                        <td style={tdDefault}><Switch appearance={role as any} checked={true}>{role}</Switch></td>
                        <td style={tdDefault}><Switch appearance={role as any} checked={false}>{role}</Switch></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Accent Override */}
          <FoundationCard
            title="Accent Override"
            description="Dual system: appearance controls context, accent optionally overrides the checked fill color."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <SwitchAccentOverride />
            </div>
          </FoundationCard>

          {/* Read-only */}
          <FoundationCard
            title="Read-only"
            description="Read-only switches are visually distinct: smaller knob when unchecked, dark fill when checked."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <SwitchReadOnly />
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Switch automatically adapts when placed on different surface backgrounds."
          >
            <SwitchSurfaceContext />
          </FoundationCard>

          {/* Interactive */}
          <FoundationCard
            title="Interactive"
            description="Functional switches with live state management."
          >
            <div className={styles.showcaseColumn} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <Switch checked={switch1} onCheckedChange={setSwitch1}>Dark mode</Switch>
              <Switch checked={switch2} onCheckedChange={setSwitch2}>Auto-save</Switch>
              <Switch checked={switch3} onCheckedChange={setSwitch3}>Show tutorials</Switch>
            </div>
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard
            title="Props & Usage"
            collapsible
          >
            <ComponentDocumentation
              componentName="Switch"
              tokenManifest={SWITCH_TOKEN_MANIFEST}
              recipeDefinition={SWITCH_RECIPE_DEFINITION}
              baselineSpec={switchMachineDocs}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Switch"
            manifest={SWITCH_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)', ...tokens }}>
                <Switch checked={true}>Checked</Switch>
                <Switch checked={false}>Unchecked</Switch>
                <Switch readOnly checked={true}>Read-only</Switch>
              </div>
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Switch Component Page
 */
export default function SwitchPage() {
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'switch' }
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'switch' }
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
        componentName: 'switch',
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
        componentName: 'switch',
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
      componentName: 'switch',
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
      componentName="switch"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={SWITCH_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <SwitchPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
