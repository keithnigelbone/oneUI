/**
 * components/avatar/AvatarPageContent.tsx
 *
 * Avatar component showcase page with token editor.
 * Displays variants, sizes, attention levels, appearances, and allows token customization per brand.
 *
 * Surface tokens are computed via useSurfaceTokenVars — the same centralized pipeline
 * used by useBrandCSS for Storybook/global CSS injection. ONE code path, no duplication.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Avatar,
  AVATAR_TOKEN_MANIFEST,
  AVATAR_RECIPE_DEFINITION,
  AvatarVariants,
  AvatarAttentionLevels,
  AvatarSizes,
  AvatarStates,
  AvatarImageFallback,
} from '@oneui/ui/components/Avatar';
import {
  FoundationCard,
} from '@/design-tools/Foundations/shared';
import {
  ComponentTokenEditorProvider,
  useComponentTokenEditor,
  PropertyPanelSkeleton,
  type SavedTokenOverride,
} from '@/design-tools/ComponentTokenEditor';
import { buildComponentPreviewStyles } from '@/design-tools/ComponentTokenEditor/utils/buildPreviewStyles';

import type { PlatformsFoundationConfig, PlatformEntry, PlatformBreakpoint, RecipeSelections } from '@oneui/shared';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import styles from '../component.module.css';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { ComponentDocumentation } from '@/components/machine-docs';
import avatarMachineDocsJson from '@/generated/component-docs/avatar.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const avatarMachineDocs = avatarMachineDocsJson as ComponentDocumentationSpec;

/** Lazy load PropertyPanel for performance */
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

/** IcProfile icon — matches Figma's Avatar icon variant (filled person silhouette) */
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0m4 10.5c0 3.038-3.582 5.5-8 5.5s-8-2.462-8-5.5S7.582 11 12 11s8 2.462 8 5.5"
      clipRule="evenodd"
    />
  </svg>
);

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

/** Avatar preview for the token editor */
function AvatarPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center', ...tokens }}>
      <Avatar content="icon" alt="User" size="xl" attention="high" icon={<PersonIcon />} />
      <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<PersonIcon />} />
      <Avatar content="icon" alt="User" size="xl" attention="low" icon={<PersonIcon />} />
      <Avatar content="text" alt="John Smith" size="xl" attention="high" />
      <Avatar content="text" alt="John Smith" size="xl" attention="medium" />
      <Avatar content="text" alt="John Smith" size="xl" attention="low" />
    </div>
  );
}

/** Inner content with access to editor context */
function AvatarPageInner({
  platformsConfig,
  allRoleSurfaceVars,
  allRoleSurfaceVarsDark,
  configuredRoles,
  bgBoldContextVars,
}: {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
  allRoleSurfaceVarsDark: Record<string, string>;
  configuredRoles: string[];
  /** Inline token remapping for fg-bold surface context (replaces data-surface="bold") */
  bgBoldContextVars: Record<string, string>;
}) {
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

  // Density-isolated dimension overrides — uses preview density (TopBar), NOT global density (Settings)
  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Avatar', draftOverrides, AVATAR_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Avatar</h1>
          <p className={styles.description}>
            Visual representation of a user or entity. Supports image, icon, and text (initials)
            variants with multi-accent appearance roles and attention levels.
          </p>
        </div>

        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Variants */}
          <FoundationCard
            title="Variants"
            description="Three display variants: image, icon, and text (initials)."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <AvatarVariants />
            </div>
          </FoundationCard>

          {/* Attention Levels */}
          <FoundationCard
            title="Attention Levels"
            description="High (filled), Medium (tinted), Low (transparent) — same pattern as Button."
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-4)', ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <AvatarAttentionLevels />
            </div>
          </FoundationCard>

          {/* Sizes */}
          <FoundationCard
            title="Sizes"
            description="Eight size options from 2XS to 2XL plus custom pixel size."
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--Spacing-4)', ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <AvatarSizes />
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="Default and disabled states. Disabled applies reduced opacity."
          >
            <div className={styles.showcase} style={{ gap: 'var(--Spacing-5)', ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <AvatarStates />
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Avatar adapts automatically on different surface backgrounds."
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-4)', ...allRoleSurfaceVars, ...previewTokenStyles }}>
              {/* BG surface modes — raw divs with explicit background-color.
                  Cannot use <Surface> here because its data-surface attribute triggers
                  global CSS [data-surface] remapping with platform theme values (grey),
                  overriding the editing brand's inline surface vars. */}
              {([
                { token: '--Primary-Default', fallback: '--Surface-Default', label: 'Default' },
                { token: '--Primary-Minimal', fallback: '--Surface-Minimal', label: 'BG Minimal' },
                { token: '--Primary-Subtle', fallback: '--Surface-Subtle', label: 'BG Subtle' },
                { token: '--Primary-Elevated', fallback: '--Surface-Elevated', label: 'Elevated' },
              ]).map(({ token, fallback, label }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4)',
                    padding: 'var(--Spacing-4)',
                    borderRadius: 'var(--Shape-4)',
                    width: '100%',
                    backgroundColor: `var(${token}, var(${fallback}))`,
                  }}
                >
                  <span className={styles.showcaseLabel} style={{ minWidth: 'var(--Spacing-9)', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)' }}>{label}</span>
                  <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="xl" attention="high" />
                  <Avatar content="icon" alt="User" size="xl" attention="high" icon={<PersonIcon />} />
                  <Avatar content="text" alt="JS" size="xl" attention="high" />
                  <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<PersonIcon />} />
                  <Avatar content="text" alt="JS" size="xl" attention="medium" />
                  <Avatar content="icon" alt="User" size="xl" attention="low" icon={<PersonIcon />} />
                  <Avatar content="text" alt="JS" size="xl" attention="low" />
                </div>
              ))}
              {/* BG Bold — two-div pattern: outer reads actual bold hex from parent's
                  allRoleSurfaceVars, inner provides on-colour remapping via bgBoldContextVars.
                  Cannot merge into one div because bgBoldContextVars remaps --Primary-Bold
                  to the inversion value, which would make backgroundColor wrong. */}
              <div style={{ borderRadius: 'var(--Shape-4)', backgroundColor: 'var(--Primary-Bold, var(--Surface-Bold))', width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4)',
                    padding: 'var(--Spacing-4)',
                    width: '100%',
                    ...bgBoldContextVars,
                  }}
                >
                  <span className={styles.showcaseLabel} style={{ minWidth: 'var(--Spacing-9)', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)' }}>BG Bold</span>
                  <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="xl" attention="high" />
                  <Avatar content="icon" alt="User" size="xl" attention="high" icon={<PersonIcon />} />
                  <Avatar content="text" alt="JS" size="xl" attention="high" />
                  <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<PersonIcon />} />
                  <Avatar content="text" alt="JS" size="xl" attention="medium" />
                  <Avatar content="icon" alt="User" size="xl" attention="low" icon={<PersonIcon />} />
                  <Avatar content="text" alt="JS" size="xl" attention="low" />
                </div>
              </div>
            </div>
          </FoundationCard>

          {/* Appearance Roles — dynamic per brand's configured accents */}
          <FoundationCard
            title="Appearance Roles"
            description={`${configuredRoles.length} appearance role${configuredRoles.length !== 1 ? 's' : ''} configured for this brand.`}
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-4)', ...allRoleSurfaceVars, ...previewTokenStyles }}>
              {configuredRoles.map((role) => (
                <div
                  key={role}
                  className={styles.showcaseItem}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4)',
                    width: '100%',
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
                    <Avatar content="icon" alt="User" size="xl" appearance={role as any} attention="high" icon={<PersonIcon />} />
                    <Avatar content="icon" alt="User" size="xl" appearance={role as any} attention="medium" icon={<PersonIcon />} />
                    <Avatar content="icon" alt="User" size="xl" appearance={role as any} attention="low" icon={<PersonIcon />} />
                    <Avatar content="text" alt="JS" size="xl" appearance={role as any} attention="high" />
                    <Avatar content="text" alt="JS" size="xl" appearance={role as any} attention="medium" />
                    <Avatar content="text" alt="JS" size="xl" appearance={role as any} attention="low" />
                  </div>
                </div>
              ))}
            </div>
          </FoundationCard>

          {/* Image Fallback */}
          <FoundationCard
            title="Image Fallback"
            description="When an image fails to load, avatar gracefully falls back to a default person icon."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              <AvatarImageFallback />
            </div>
          </FoundationCard>

          <FoundationCard title="Props & Usage" collapsible>
            <ComponentDocumentation
              componentName="Avatar"
              baselineSpec={avatarMachineDocs}
              tokenManifest={AVATAR_TOKEN_MANIFEST}
              recipeDefinition={AVATAR_RECIPE_DEFINITION}
              minimal
            />
          </FoundationCard>
        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Avatar"
            manifest={AVATAR_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <AvatarPreview tokens={{ ...tokens, ...allRoleSurfaceVars, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Avatar Component Page
 *
 * Uses useSurfaceTokenVars for surface token computation — the same centralized
 * pipeline as useBrandCSS. No duplicate palette/stacking computation.
 */
export default function AvatarPage() {
  const { theme, currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  // Centralized surface token computation — same pipeline as useBrandCSS
  const { surfaceVars: allRoleSurfaceVars, configuredRoles, tokenSets: tokenSetsBg } = useSurfaceTokenVars({
    foundationData,
    theme: theme === 'dark' ? 'dark' : 'light',
    includeTokenSets: true,
  });

  // Compute inline bold context vars from editing brand's token set data.
  // Replicates what [data-surface="bold"] does in global CSS, but with
  // editing brand values instead of platform theme values.
  const primaryTokenSet = tokenSetsBg?.roles?.['primary'] ?? tokenSetsBg?.roles?.['neutral'] ?? null;
  const bgBoldContextVars = useMemo<Record<string, string>>(() => {
    if (!primaryTokenSet) return {};
    const ob = primaryTokenSet.onBoldContent;
    const st = primaryTokenSet.states;
    const s = primaryTokenSet.surfaces;
    const vars: Record<string, string> = {};

    // Default-context on-colours remapped for bold surface
    vars['--Primary-High'] = ob.high.blendedHex;
    vars['--Primary-Medium-Text'] = ob.medium.blendedHex;
    vars['--Primary-Low'] = ob.low.blendedHex;
    vars['--Primary-Stroke-Medium'] = ob.strokeMedium.blendedHex;
    vars['--Primary-Stroke-Low'] = ob.strokeLow.blendedHex;
    vars['--Primary-Tinted'] = ob.tinted.blendedHex;
    vars['--Primary-TintedA11y'] = ob.tintedA11y.blendedHex;
    vars['--Primary-Hover'] = st.boldHover.hex;
    vars['--Primary-Pressed'] = st.boldPressed.hex;

    // Bold surface fill + on-bold content
    vars['--Primary-Bold'] = s.bold.hex;
    vars['--Primary-Bold-High'] = ob.tintedA11y.blendedHex;
    vars['--Primary-Bold-Hover'] = st.boldHover.hex;
    vars['--Primary-Bold-Pressed'] = st.boldPressed.hex;

    // Backward compat aliases
    vars['--Text-High'] = ob.high.blendedHex;
    vars['--Text-Medium'] = ob.medium.blendedHex;
    vars['--Text-Low'] = ob.low.blendedHex;
    vars['--Text-OnBold-High'] = ob.tintedA11y.blendedHex;
    vars['--Surface-Bold'] = s.bold.hex;

    return vars;
  }, [primaryTokenSet]);

  const { surfaceVars: allRoleSurfaceVarsDark } = useSurfaceTokenVars({
    foundationData,
    theme: 'dark',
  });

  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'avatar' }
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'avatar' }
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
        componentName: 'avatar',
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
        componentName: 'avatar',
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
      componentName: 'avatar',
    });
  }, [removeAllForComponent, currentBrand?.id]);

  const isFoundationReady = foundationData !== undefined;

  if (!isFoundationReady) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName="avatar"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={AVATAR_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <AvatarPageInner
        platformsConfig={platformsConfig}
        allRoleSurfaceVars={allRoleSurfaceVars}
        allRoleSurfaceVarsDark={allRoleSurfaceVarsDark}
        configuredRoles={configuredRoles}
        bgBoldContextVars={bgBoldContextVars}
      />
    </ComponentTokenEditorProvider>
  );
}
