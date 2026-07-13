/**
 * components/selectable-single-text-button/SelectableSingleTextButtonPageContent.tsx
 *
 * SelectableSingleTextButton component showcase page with Advanced Mode token editor.
 * Displays attention levels, sizes, condensed mode, states, appearance roles,
 * and surface context. Allows token customization per brand.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  SelectableSingleTextButton,
  SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST,
  SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION,
} from '@oneui/ui/components/SelectableSingleTextButton';
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
import selectableSingleTextButtonMachineDocsJson from '@/generated/component-docs/selectablesingletextbutton.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const selectableSingleTextButtonMachineDocs = selectableSingleTextButtonMachineDocsJson as ComponentDocumentationSpec;

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
function SelectableSingleTextButtonPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', ...tokens }}>
      <SelectableSingleTextButton size="m" attention="high" defaultSelected>Selected</SelectableSingleTextButton>
      <SelectableSingleTextButton size="m" attention="high">Unselected</SelectableSingleTextButton>
    </div>
  );
}

interface SelectableSingleTextButtonPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  configuredRoles: string[];
  tokenSetsBg: MultiRoleTokenSets | null;
}

function SelectableSingleTextButtonPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: SelectableSingleTextButtonPageContentProps) {
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
    () => buildComponentPreviewStyles('SelectableSingleTextButton', draftOverrides, SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--SelectableSingleTextButton-backgroundColor', '--SelectableSingleTextButton-textColor', '--SelectableSingleTextButton-borderColor'];
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
          <h1 className={styles.title}>SelectableSingleTextButton</h1>
          <p className={styles.description}>
            Text-only toggle pill. Stays selected after click.
            No icon slots — text label only. Three sizes (S/M/L),
            condensed mode, and multi-accent appearance roles.
          </p>
        </div>

        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Attention Levels */}
          <FoundationCard
            title="Attention Levels"
            description="Three attention levels control visual prominence. Shown selected and unselected."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Attention</th>
                    <th style={thCenter}>Selected</th>
                    <th style={thCenter}>Unselected</th>
                  </tr>
                </thead>
                <tbody>
                  {(['high', 'medium', 'low'] as const).map((attention) => (
                    <tr key={attention}>
                      <td style={tdLabel}>{attention.charAt(0).toUpperCase() + attention.slice(1)}</td>
                      <td style={tdCenter}><SelectableSingleTextButton attention={attention} defaultSelected>{attention.charAt(0).toUpperCase() + attention.slice(1)}</SelectableSingleTextButton></td>
                      <td style={tdCenter}><SelectableSingleTextButton attention={attention}>{attention.charAt(0).toUpperCase() + attention.slice(1)}</SelectableSingleTextButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Three size options: S, M, L."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Size</th>
                    <th style={thCenter}>Selected</th>
                    <th style={thCenter}>Unselected</th>
                  </tr>
                </thead>
                <tbody>
                  {(['s', 'm', 'l'] as const).map((size) => (
                    <tr key={size}>
                      <td style={tdLabel}>{size.toUpperCase()}</td>
                      <td style={tdCenter}><SelectableSingleTextButton size={size} attention="high" defaultSelected>{size.toUpperCase()}</SelectableSingleTextButton></td>
                      <td style={tdCenter}><SelectableSingleTextButton size={size} attention="high">{size.toUpperCase()}</SelectableSingleTextButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Condensed */}
          <FoundationCard
            title="Condensed"
            description="Condensed mode reduces internal spacing for dense layouts."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Mode</th>
                    <th style={thCenter}>S</th>
                    <th style={thCenter}>M</th>
                    <th style={thCenter}>L</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdLabel}>Default</td>
                    {(['s', 'm', 'l'] as const).map((size) => (
                      <td key={size} style={tdCenter}><SelectableSingleTextButton size={size} attention="high" defaultSelected>{size.toUpperCase()}</SelectableSingleTextButton></td>
                    ))}
                  </tr>
                  <tr>
                    <td style={tdLabel}>Condensed</td>
                    {(['s', 'm', 'l'] as const).map((size) => (
                      <td key={size} style={tdCenter}><SelectableSingleTextButton size={size} attention="high" condensed defaultSelected>{size.toUpperCase()}</SelectableSingleTextButton></td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="Interactive and disabled states."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <table style={{ ...tableStyle, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>State</th>
                    <th style={thStyle}>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Default (unselected)', el: <SelectableSingleTextButton attention="high">Button</SelectableSingleTextButton> },
                    { label: 'Selected', el: <SelectableSingleTextButton attention="high" defaultSelected>Button</SelectableSingleTextButton> },
                    { label: 'Disabled (unselected)', el: <SelectableSingleTextButton attention="high" disabled>Button</SelectableSingleTextButton> },
                    { label: 'Disabled (selected)', el: <SelectableSingleTextButton attention="high" disabled defaultSelected>Button</SelectableSingleTextButton> },
                    { label: 'Loading', el: <SelectableSingleTextButton attention="high" loading>Button</SelectableSingleTextButton> },
                  ].map(({ label, el }) => (
                    <tr key={label}>
                      <td style={tdLabel}>{label}</td>
                      <td style={{ padding: 'var(--Spacing-3)', verticalAlign: 'middle' }}>{el}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th style={thCenter}>Selected</th>
                    <th style={thCenter}>Unselected</th>
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
                          '--SelectableSingleTextButton-backgroundColor-selected-high': `var(--${roleTokenCasing}-Bold, ${roleTokenSet.surfaces.bold.hex})`,
                          '--SelectableSingleTextButton-textColor-selected-high': `var(--${roleTokenCasing}-Bold-High, ${roleTokenSet.onBoldContent.high.blendedHex})`,
                        }
                      : {};
                    return (
                      <tr key={role} style={{ ...roleVars } as React.CSSProperties}>
                        <td style={{ ...tdLabel, textTransform: 'capitalize' }}>{role}</td>
                        <td style={tdCenter}><SelectableSingleTextButton appearance={role as any} attention="high" defaultSelected>{role}</SelectableSingleTextButton></td>
                        <td style={tdCenter}><SelectableSingleTextButton appearance={role as any} attention="high">{role}</SelectableSingleTextButton></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Variants on Surfaces"
            description="SelectableSingleTextButtons adapt to different surface backgrounds for proper contrast."
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
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap' }}>
                      <SelectableSingleTextButton attention="high" defaultSelected>High</SelectableSingleTextButton>
                      <SelectableSingleTextButton attention="medium" defaultSelected>Medium</SelectableSingleTextButton>
                      <SelectableSingleTextButton attention="low" defaultSelected>Low</SelectableSingleTextButton>
                    </div>
                  </Surface>
                ))}
              </div>
            )}
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard title="Props & Usage" collapsible>
            <ComponentDocumentation
              componentName="SelectableSingleTextButton"
              tokenManifest={SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST}
              recipeDefinition={SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION}
              baselineSpec={selectableSingleTextButtonMachineDocs}
              minimal
            />
          </FoundationCard>
        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="SelectableSingleTextButton"
            manifest={SELECTABLE_SINGLE_TEXT_BUTTON_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <SelectableSingleTextButtonPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * SelectableSingleTextButton Component Page — outer shell with Convex data
 */
export default function SelectableSingleTextButtonPage() {
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'selectable-single-text-button' }
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

  // Fetch recipe selections
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'selectable-single-text-button' }
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
        componentName: 'selectable-single-text-button',
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
        componentName: 'selectable-single-text-button',
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
      componentName: 'selectable-single-text-button',
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
      componentName="selectable-single-text-button"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={SELECTABLE_SINGLE_TEXT_BUTTON_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <SelectableSingleTextButtonPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
