/**
 * GenericComponentPageContent.tsx
 *
 * Registry-driven showcase page for components without a bespoke
 * <Name>PageContent. Renders meta header, a preview (registry
 * previewComponent, falling back to the real component), generated docs
 * when available, and the PropertyPanel token editor — all wired through
 * useComponentEditorWiring.
 *
 * Bespoke pages (the 16 hand-built ones) win via Next.js static-segment
 * precedence; this covers every other manifest-bearing slug for free.
 */

'use client';

import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { getComponentBySlug, resolveComponentSlug } from '@oneui/ui/registry/componentRegistry';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import {
  ComponentTokenEditorProvider,
  useComponentTokenEditor,
  PropertyPanelSkeleton,
} from '@/design-tools/ComponentTokenEditor';
import {
  buildComponentPreviewStyles,
  filterNonColorTokens,
} from '@/design-tools/ComponentTokenEditor/utils/buildPreviewStyles';
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { useComponentEditorWiring } from './useComponentEditorWiring';
import styles from '../component.module.css';

const PropertyPanel = lazy(() =>
  import('@/design-tools/ComponentTokenEditor').then((mod) => ({ default: mod.PropertyPanel })),
);

/** Load the generated docs spec for a slug, or null when none exists. */
function useGeneratedDocs(slug: string): ComponentDocumentationSpec | null {
  const [docs, setDocs] = useState<ComponentDocumentationSpec | null>(null);
  useEffect(() => {
    let cancelled = false;
    const docName = slug.replace(/-/g, '');
    import(`@/generated/component-docs/${docName}.docs.json`)
      .then((mod) => {
        if (!cancelled) setDocs(mod.default as ComponentDocumentationSpec);
      })
      .catch(() => {
        if (!cancelled) setDocs(null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return docs;
}

function GenericPageInner({ slug }: { slug: string }) {
  const entry = getComponentBySlug(slug);
  const { isOpen, closePanel, draftOverrides } = useComponentTokenEditor();
  const { theme } = usePlatformContext();
  const foundationData = useFoundationData();
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars } = useSurfaceTokenVars({
    foundationData,
    theme: themeKey,
  });
  const docs = useGeneratedDocs(slug);

  const manifest = entry?.manifest;
  const componentName = manifest?.componentName ?? resolveComponentSlug(slug) ?? slug;
  const meta = entry?.meta;

  const previewTokenStyles = useMemo(
    () =>
      manifest
        ? buildComponentPreviewStyles(componentName, draftOverrides, manifest.tokens)
        : {},
    [componentName, draftOverrides, manifest],
  );

  // Color tokens rely on the per-role intermediate-variable architecture; setting
  // them inline short-circuits appearance remapping (collapses every role to
  // Primary). For multi-context sections (sizes, surface ladder) build from the
  // manifest with color-category tokens filtered out — this uses the token's
  // authoritative `category` metadata, so it catches every color token (e.g.
  // Stepper's `trackColor`), not just a hardcoded prefix list.
  const previewTokenStylesNoColors = useMemo(
    () =>
      manifest
        ? buildComponentPreviewStyles(
            componentName,
            draftOverrides,
            filterNonColorTokens(manifest.tokens),
          )
        : {},
    [componentName, draftOverrides, manifest],
  );

  if (!entry || !manifest) {
    return (
      <div className={styles.header}>
        <h1 className={styles.title}>Component not found</h1>
        <p className={styles.description}>No registry entry exists for “{slug}”.</p>
      </div>
    );
  }

  const Preview = entry.previewComponent;
  const RealComponent = entry.component;
  const Variants = entry.docShowcase?.variants;
  const Sizes = entry.docShowcase?.sizes;
  const Surfaces = entry.docShowcase?.surfaces;

  const renderPreview = (tokens: Record<string, string>) => {
    if (Preview) return <Preview tokens={tokens} showAllVariations />;
    if (RealComponent) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4)', ...tokens }}>
          <RealComponent>Preview</RealComponent>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.pageWithPanel}>
      <div className={styles.mainContent} data-panel-open={isOpen}>
        <div className={styles.header}>
          <h1 className={styles.title}>{meta?.displayName ?? componentName}</h1>
          <p className={styles.description}>
            {meta?.description ?? manifest.description}
          </p>
        </div>

        <div className={styles.content}>
          <FoundationCard
            title="Variants"
            description="Live preview reflecting brand foundations and the saved global component theme."
          >
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars, ...previewTokenStyles }}>
              {Variants ? <Variants /> : renderPreview(previewTokenStyles)}
            </div>
          </FoundationCard>

          {Sizes && (
            <FoundationCard title="Sizes" description="Size ramp across the component's supported sizes.">
              <div
                className={styles.showcase}
                style={{ ...allRoleSurfaceVars, ...previewTokenStylesNoColors }}
              >
                <Sizes />
              </div>
            </FoundationCard>
          )}

          {Surfaces && (
            <FoundationCard
              title="Variants on Surfaces"
              description="The component adapts to each surface background (default → elevated) for correct contrast."
            >
              <div
                className={styles.showcase}
                style={{
                  flexDirection: 'column',
                  ...allRoleSurfaceVars,
                  ...previewTokenStylesNoColors,
                }}
              >
                <Surfaces />
              </div>
            </FoundationCard>
          )}

          {docs && (
            <FoundationCard title="Props & Usage" collapsible>
              <ComponentDocumentation
                componentName={componentName}
                tokenManifest={manifest}
                recipeDefinition={entry.recipe}
                baselineSpec={docs}
                minimal
              />
            </FoundationCard>
          )}
        </div>
      </div>

      {isOpen && (
        <Suspense fallback={<PropertyPanelSkeleton />}>
          <PropertyPanel
            componentName={componentName}
            manifest={manifest}
            onClose={closePanel}
            renderPreview={(tokens) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)', ...tokens }}>
                {renderPreview(tokens)}
              </div>
            )}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function GenericComponentPageContent({ slug }: { slug: string }) {
  const { theme, currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const entry = getComponentBySlug(slug);

  const wiring = useComponentEditorWiring(brandId, slug);

  if (foundationData === undefined) {
    return <PageSkeleton cards={2} />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName={slug}
      savedOverrides={wiring.savedOverrides}
      onSaveOverrides={wiring.onSaveOverrides}
      onClearOverrides={wiring.onClearOverrides}
      recipeDefinition={entry?.recipe}
      savedRecipeSelections={wiring.savedRecipeSelections}
      onSaveRecipeSelections={wiring.onSaveRecipeSelections}
    >
      <GenericPageInner slug={slug} />
    </ComponentTokenEditorProvider>
  );
}
