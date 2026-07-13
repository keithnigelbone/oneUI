/**
 * components/image/ImagePageContent.tsx
 *
 * Image component showcase page with token editor.
 * Displays aspect ratios, interactive mode, fallback, and allows token customization per brand.
 */

'use client';

import React, { Suspense, lazy, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  Image,
  IMAGE_TOKEN_MANIFEST,
  IMAGE_RECIPE_DEFINITION,
} from '@oneui/ui/components/Image';
import {
  FoundationCard,
} from '@/design-tools/Foundations/shared';
import { Surface } from '@oneui/ui/components/Surface';
import {
  ComponentTokenEditorProvider,
  useComponentTokenEditor,
  PropertyPanelSkeleton,
  type SavedTokenOverride,
} from '@/design-tools/ComponentTokenEditor';
import { buildComponentPreviewStyles } from '@/design-tools/ComponentTokenEditor/utils/buildPreviewStyles';

import type { PlatformsFoundationConfig, PlatformEntry, PlatformBreakpoint, RecipeSelections } from '@oneui/shared';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import styles from '../component.module.css';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import imageMachineDocsJson from '@/generated/component-docs/image.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const imageMachineDocs = imageMachineDocsJson as ComponentDocumentationSpec;

/** Lazy load PropertyPanel for performance */
const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel }))
);

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop';
const PORTRAIT_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';

/** Image preview for the token editor */
function ImageEditorPreview({ tokens }: { tokens: Record<string, string> }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'flex-start', ...tokens }}>
      <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="1:1" width={80} />
      <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="16:9" width={120} />
      <Image src={SAMPLE_IMAGE} alt="Interactive" aspectRatio="1:1" width={80} interactive onPress={() => {}} />
      <Image src="https://invalid.example/broken.jpg" alt="Fallback" aspectRatio="1:1" width={80} />
    </div>
  );
}

/** Inner content with access to editor context */
function ImagePageInner({
  platformsConfig,
}: {
  platformsConfig: PlatformsFoundationConfig;
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

  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  const overrideStyles = useMemo(
    () => buildComponentPreviewStyles('Image', draftOverrides, IMAGE_TOKEN_MANIFEST.tokens),
    [draftOverrides]
  );
  const previewTokenStyles = overrideStyles;

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Image</h1>
          <p className={styles.description}>
            Images display visual content that enhances communication, provides context, or represents media within the interface.
          </p>
        </div>

        <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
          {/* Aspect Ratios */}
          <FoundationCard
            title="Aspect Ratios"
            description="Ten aspect ratio presets from Figma spec. 'auto' uses natural image dimensions."
          >
            <div className={styles.showcase} style={{ flexWrap: 'wrap', gap: 'var(--Spacing-4-5)', ...previewTokenStyles }}>
              {(['auto', '1:1', '1:2', '2:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9'] as const).map((ratio) => (
                <div key={ratio} className={styles.showcaseItem}>
                  <Image
                    src={SAMPLE_IMAGE}
                    alt={`${ratio} ratio`}
                    aspectRatio={ratio}
                    width={ratio === 'auto' ? 120 : 100}
                    height={ratio === 'auto' ? 80 : undefined}
                  />
                  <span className={styles.showcaseLabel}>{ratio}</span>
                </div>
              ))}
            </div>
          </FoundationCard>

          {/* Object Fit */}
          <FoundationCard
            title="Object Fit"
            description="Controls how the image is resized to fit its container."
          >
            <div className={styles.showcase} style={{ gap: 'var(--Spacing-4-5)', ...previewTokenStyles }}>
              {(['cover', 'contain', 'fill', 'none'] as const).map((fit) => (
                <div key={fit} className={styles.showcaseItem}>
                  <div style={{ border: 'var(--Stroke-M) solid var(--Border-Subtle)' }}>
                    <Image
                      src={PORTRAIT_IMAGE}
                      alt={`${fit} mode`}
                      aspectRatio="1:1"
                      width={120}
                      objectFit={fit}
                    />
                  </div>
                  <span className={styles.showcaseLabel}>{fit}</span>
                </div>
              ))}
            </div>
          </FoundationCard>

          {/* Interactive Mode */}
          <FoundationCard
            title="Interactive Mode"
            description="When interactive, renders as a button with state layer overlay on hover/press and focus ring on keyboard navigation."
          >
            <div className={styles.showcase} style={{ gap: 'var(--Spacing-5)', ...previewTokenStyles }}>
              <div className={styles.showcaseItem}>
                <Image src={SAMPLE_IMAGE} alt="Static" aspectRatio="16:9" width={200} />
                <span className={styles.showcaseLabel}>Static</span>
              </div>
              <div className={styles.showcaseItem}>
                <Image src={SAMPLE_IMAGE} alt="Clickable" aspectRatio="16:9" width={200} interactive onPress={() => {}} />
                <span className={styles.showcaseLabel}>Interactive</span>
              </div>
            </div>
          </FoundationCard>

          {/* States */}
          <FoundationCard
            title="States"
            description="Default and disabled states. Disabled applies reduced opacity."
          >
            <div className={styles.showcase} style={{ gap: 'var(--Spacing-5)', ...previewTokenStyles }}>
              <div className={styles.showcaseItem}>
                <Image src={SAMPLE_IMAGE} alt="Default" aspectRatio="1:1" width={120} />
                <span className={styles.showcaseLabel}>Default</span>
              </div>
              <div className={styles.showcaseItem}>
                <Image src={SAMPLE_IMAGE} alt="Disabled" aspectRatio="1:1" width={120} disabled />
                <span className={styles.showcaseLabel}>Disabled</span>
              </div>
            </div>
          </FoundationCard>

          {/* Fallback */}
          <FoundationCard
            title="Image Fallback"
            description="When an image fails to load, a placeholder icon is shown. Custom fallback content can be provided."
          >
            <div className={styles.showcase} style={{ gap: 'var(--Spacing-5)', ...previewTokenStyles }}>
              <div className={styles.showcaseItem}>
                <Image src={SAMPLE_IMAGE} alt="Valid" aspectRatio="16:9" width={200} />
                <span className={styles.showcaseLabel}>Valid Image</span>
              </div>
              <div className={styles.showcaseItem}>
                <Image src="https://invalid.example/broken.jpg" alt="Broken" aspectRatio="16:9" width={200} />
                <span className={styles.showcaseLabel}>Default Fallback</span>
              </div>
              <div className={styles.showcaseItem}>
                <Image
                  src="https://invalid.example/broken.jpg"
                  alt="Custom"
                  aspectRatio="16:9"
                  width={200}
                  fallback={
                    <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>
                      No image available
                    </span>
                  }
                />
                <span className={styles.showcaseLabel}>Custom Fallback</span>
              </div>
            </div>
          </FoundationCard>

          {/* Surface Context */}
          <FoundationCard
            title="Surface Context"
            description="Image on different surface backgrounds."
          >
            <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-4)', ...previewTokenStyles }}>
              {([
                { mode: 'default' as const, label: 'Default' },
                { mode: 'minimal' as const, label: 'Minimal' },
                { mode: 'subtle' as const, label: 'Subtle' },
                { mode: 'moderate' as const, label: 'Moderate' },
                { mode: 'bold' as const, label: 'Bold' },
                { mode: 'elevated' as const, label: 'Elevated' },
              ]).map(({ mode, label }) => (
                <Surface
                  key={mode}
                  mode={mode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4)',
                    padding: 'var(--Spacing-4)',
                    borderRadius: 'var(--Shape-4)',
                    width: '100%',
                  }}
                >
                  <span
                    className={styles.showcaseLabel}
                    style={{
                      minWidth: 'var(--Spacing-9)',
                      margin: 0,
                      fontWeight: 'var(--Typography-Weight-Medium)',
                    }}
                  >
                    {label}
                  </span>
                  <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="1:1" width={60} />
                  <Image src={SAMPLE_IMAGE} alt="Landscape" aspectRatio="16:9" width={100} />
                  <Image src={SAMPLE_IMAGE} alt="Interactive" aspectRatio="1:1" width={60} interactive onPress={() => {}} />
                </Surface>
              ))}
            </div>
          </FoundationCard>

          {/* Props & Usage */}
          <FoundationCard title="Props & Usage" collapsible>
            <ComponentDocumentation
              componentName="Image"
              tokenManifest={IMAGE_TOKEN_MANIFEST}
              recipeDefinition={IMAGE_RECIPE_DEFINITION}
              baselineSpec={imageMachineDocs}
              minimal
            />
          </FoundationCard>

        </div>
      </div>

      {/* Property Panel (lazy loaded) */}
      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName="Image"
            manifest={IMAGE_TOKEN_MANIFEST}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <ImageEditorPreview tokens={{ ...tokens, ...previewTokenStyles }} />
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Image Component Page
 */
export default function ImagePage() {
  const { theme, currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'image' }
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
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: 'image' }
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
        componentName: 'image',
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
        componentName: 'image',
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
      componentName: 'image',
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
      componentName="image"
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={IMAGE_RECIPE_DEFINITION}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
    >
      <ImagePageInner
        platformsConfig={platformsConfig}
      />
    </ComponentTokenEditorProvider>
  );
}
