/**
 * components/selectable-button/SelectableButtonPageContent.tsx
 *
 * SelectableButton component showcase page with Advanced Mode token editor.
 * Displays attention levels, sizes, contained/uncontained, icons, condensed mode,
 * states, appearance roles, and surface context. Allows token customization per brand.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  SelectableButton,
  SELECTABLE_BUTTON_TOKEN_MANIFEST,
  SELECTABLE_BUTTON_RECIPE_DEFINITION,
} from '@oneui/ui/components/SelectableButton';
import { Icon } from '@oneui/ui/icons/Icon';
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
import selectableButtonMachineDocsJson from '@/generated/component-docs/selectablebutton.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const selectableButtonMachineDocs = selectableButtonMachineDocsJson as ComponentDocumentationSpec;

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
function SelectableButtonPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', ...tokens }}>
      <SelectableButton attention="high" defaultSelected>Selected</SelectableButton>
      <SelectableButton attention="high">Unselected</SelectableButton>
    </div>
  );
}

interface SelectableButtonPageContentProps {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  configuredRoles: string[];
  tokenSetsBg: MultiRoleTokenSets | null;
}

function SelectableButtonPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  configuredRoles,
  tokenSetsBg,
}: SelectableButtonPageContentProps) {
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
    () => buildComponentPreviewStyles('SelectableButton', draftOverrides, SELECTABLE_BUTTON_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  const previewTokenStylesNoColors = useMemo(() => {
    const colorPrefixes = ['--SelectableButton-backgroundColor', '--SelectableButton-textColor', '--SelectableButton-borderColor'];
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
          <h1 className={styles.title}>SelectableButton</h1>
          <p className={styles.description}>
            Text toggle button with optional icon slots. Stays selected after click.
            Supports attention levels (high/medium/low), contained and uncontained modes,
            start/end icon slots, and multi-accent appearance roles.
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
                      <td style={tdCenter}><SelectableButton attention={attention} defaultSelected>{attention.charAt(0).toUpperCase() + attention.slice(1)}</SelectableButton></td>
                      <td style={tdCenter}><SelectableButton attention={attention}>{attention.charAt(0).toUpperCase() + attention.slice(1)}</SelectableButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Four size options: XS, S, M, L."
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
                  {(['xs', 's', 'm', 'l'] as const).map((size) => (
                    <tr key={size}>
                      <td style={tdLabel}>{size.toUpperCase()}</td>
                      <td style={tdCenter}><SelectableButton size={size} attention="high" defaultSelected>{size.toUpperCase()}</SelectableButton></td>
                      <td style={tdCenter}><SelectableButton size={size} attention="high">{size.toUpperCase()}</SelectableButton></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* Contained vs Uncontained */}
          <FoundationCard
            title="Contained vs Uncontained"
            description="Contained mode adds a background fill. Uncontained renders as text-only with no fill."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Mode</th>
                    <th style={thCenter}>XS</th>
                    <th style={thCenter}>S</th>
                    <th style={thCenter}>M</th>
                    <th style={thCenter}>L</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdLabel}>Contained</td>
                    {(['xs', 's', 'm', 'l'] as const).map((size) => (
                      <td key={size} style={tdCenter}><SelectableButton size={size} attention="high" contained defaultSelected>{size.toUpperCase()}</SelectableButton></td>
                    ))}
                  </tr>
                  <tr>
                    <td style={tdLabel}>Uncontained</td>
                    {(['xs', 's', 'm', 'l'] as const).map((size) => (
                      <td key={size} style={tdCenter}><SelectableButton size={size} attention="high" defaultSelected>{size.toUpperCase()}</SelectableButton></td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </FoundationCard>

          {/* With Icons */}
          <FoundationCard
            title="With Icons"
            description="Start and end icon slots. Icons scale with button size."
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-4-5)', ...allRoleSurfaceVars, ...previewTokenStyles }}>
              {/* Start Icon */}
              <div>
                <p style={{ ...thStyle, display: 'block', marginTop: 0, marginBottom: 'var(--Spacing-3)' }}>Start Icon</p>
                <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <SelectableButton size="xs" attention="high" defaultSelected start={<Icon name="bookmarkFilled" size={12} />}>XS</SelectableButton>
                  <SelectableButton size="s" attention="high" defaultSelected start={<Icon name="bookmarkFilled" size={14} />}>S</SelectableButton>
                  <SelectableButton size="m" attention="high" defaultSelected start={<Icon name="bookmarkFilled" size={16} />}>M</SelectableButton>
                  <SelectableButton size="l" attention="high" defaultSelected start={<Icon name="bookmarkFilled" size={20} />}>L</SelectableButton>
                </div>
              </div>
              {/* End Icon */}
              <div>
                <p style={{ ...thStyle, display: 'block', marginTop: 0, marginBottom: 'var(--Spacing-3)' }}>End Icon</p>
                <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <SelectableButton size="xs" attention="high" defaultSelected end={<Icon name="close" size={12} />}>XS</SelectableButton>
                  <SelectableButton size="s" attention="high" defaultSelected end={<Icon name="close" size={14} />}>S</SelectableButton>
                  <SelectableButton size="m" attention="high" defaultSelected end={<Icon name="close" size={16} />}>M</SelectableButton>
                  <SelectableButton size="l" attention="high" defaultSelected end={<Icon name="close" size={20} />}>L</SelectableButton>
                </div>
              </div>
              {/* Both Slots */}
              <div>
                <p style={{ ...thStyle, display: 'block', marginTop: 0, marginBottom: 'var(--Spacing-3)' }}>Both Slots (M size)</p>
                <div style={{ display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <SelectableButton size="m" attention="high" defaultSelected start={<Icon name="bookmarkFilled" size={16} />} end={<Icon name="close" size={16} />}>Both Icons</SelectableButton>
                  <SelectableButton size="m" attention="medium" defaultSelected start={<Icon name="bookmarkFilled" size={16} />} end={<Icon name="close" size={16} />}>Medium</SelectableButton>
                  <SelectableButton size="m" attention="low" defaultSelected start={<Icon name="bookmarkFilled" size={16} />} end={<Icon name="close" size={16} />}>Low</SelectableButton>
                </div>
              </div>
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
                    <th style={thCenter}>XS</th>
                    <th style={thCenter}>S</th>
                    <th style={thCenter}>M</th>
                    <th style={thCenter}>L</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={tdLabel}>Default</td>
                    {(['xs', 's', 'm', 'l'] as const).map((size) => (
                      <td key={size} style={tdCenter}><SelectableButton size={size} attention="high" defaultSelected>{size.toUpperCase()}</SelectableButton></td>
                    ))}
                  </tr>
                  <tr>
                    <td style={tdLabel}>Condensed</td>
                    {(['xs', 's', 'm', 'l'] as const).map((size) => (
                      <td key={size} style={tdCenter}><SelectableButton size={size} attention="high" condensed defaultSelected>{size.toUpperCase()}</SelectableButton></td>
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
                    { label: 'Default (unselected)', el: <SelectableButton attention="high">SelectableButton</SelectableButton> },
                    { label: 'Selected', el: <SelectableButton attention="high" defaultSelected>SelectableButton</SelectableButton> },
                    { label: 'Disabled (unselected)', el: <SelectableButton attention="high" disabled>SelectableButton</SelectableButton> },
                    { label: 'Disabled (selected)', el: <SelectableButton attention="high" disabled defaultSelected>SelectableButton</SelectableButton> },
                    { label: 'Loading', el: <SelectableButton attention="high" loading>SelectableButton</SelectableButton> },
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
                          '--SelectableButton-backgroundColor-selected-high': `var(--${roleTokenCasing}-Bold, ${roleTokenSet.surfaces.bold.hex})`,
                          '--SelectableButton-textColor-selected-high': `var(--${roleTokenCasing}-Bold-High, ${roleTokenSet.onBoldContent.high.blendedHex})`,
                        }
                      : {};
                    return (
                      <tr key={role} style={{ ...roleVars } as React.CSSProperties}>
                        <td style={{ ...tdLabel, textTransform: 'capitalize' }}>{role}</td>
                        <td style={tdCenter}><SelectableButton appearance={role as any} attention="high" defaultSelected>{role}</SelectableButton></td>
                        <td style={tdCenter}><SelectableButton appearance={role as any} attention="high">{role}</SelectableButton></td>
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
            description="SelectableButtons adapt to different surface backgrounds for proper contrast."
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
                      <SelectableButton attention="high" defaultSelected>High</SelectableButton>
                      <SelectableButton attention="medium" defaultSelected>Medium</SelectableButton>
                      <SelectableButton attention="low" defaultSelected>Low</SelectableButton>
                    </div>
                  </Surface>
                ))}
              </div>
            )}
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard title="Props & Usage" collapsible>
            <ComponentDocumentation
              componentName="SelectableButton"
              tokenManifest={SELECTABLE_BUTTON_TOKEN_MANIFEST}
              recipeDefinition={SELECTABLE_BUTTON_RECIPE_DEFINITION}
              baselineSpec={selectableButtonMachineDocs}
              minimal
            />
          </FoundationCard>
        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="SelectableButton"
            manifest={SELECTABLE_BUTTON_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <SelectableButtonPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * SelectableButton Component Page — outer shell with Convex data
 */
export default function SelectableButtonPage() {
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'selectable-button' }
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'selectable-button' }
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
        componentName: 'selectable-button',
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
        componentName: 'selectable-button',
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
      componentName: 'selectable-button',
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
      componentName="selectable-button"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={SELECTABLE_BUTTON_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <SelectableButtonPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        configuredRoles={configuredRoles}
        tokenSetsBg={tokenSetsBg}
      />
    </ComponentTokenEditorProvider>
  );
}
