/**
 * components/divider/DividerPageContent.tsx
 *
 * Divider component showcase page. Displays sizes, attention levels,
 * content slots, orientations, round caps, and surface context adaptation.
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import {
  Divider,
  DIVIDER_TOKEN_MANIFEST,
  DividerSizes,
  DividerAttentionLevels,
  DividerWithIcon,
  DividerWithLabel,
  DividerVertical,
  DividerRoundCaps,
} from '@oneui/ui/components/Divider';
import { Surface } from '@oneui/ui/components/Surface';
import { Text } from '@oneui/ui/components/Text';
import { FoundationCard } from '@/design-tools/Foundations/shared';

import type { PlatformsFoundationConfig, PlatformEntry, PlatformBreakpoint } from '@oneui/shared';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import styles from '../component.module.css';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import { ComponentDocumentation } from '@/components/machine-docs';
import type { ComponentDocumentationSpec } from '@oneui/shared';
import dividerMachineDocsJson from '@/generated/component-docs/divider.docs.json';
import { useMigratedPlatformsConfig } from '@/hooks';

const dividerMachineDocs = dividerMachineDocsJson as ComponentDocumentationSpec;

/**
 * Inner content — renders the showcase sections
 */
function DividerPageInner({
  platformsConfig,
  allRoleSurfaceVars,
}: {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
}) {
  const { breakpointId } = usePlatformContext();
  const { previewDensity, selectedPlatformId, selectedBreakpointId, setPlatformsConfig } =
    useComponentControls();

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

  const platformTokens = useDensityDimensionOverrides(
    previewDensity,
    selectedPlatformEntry,
    breakpointViewport,
    breakpointId
  );

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>Divider</h1>
        <p className={styles.description}>
          Visual separator for content sections. Supports orientation, stroke sizes, attention
          levels, optional <code>content</code> slot (<code>&lt;Icon /&gt;</code> /{' '}
          <code>&lt;Text /&gt;</code>) with inherited appearance and attention, alignment, round
          caps, and automatic surface context adaptation.
        </p>
      </div>

      <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="Three stroke widths mapped to the Stroke token scale: S (0.5px), M (1px), L (1.5px)."
        >
          <div style={{ ...allRoleSurfaceVars }}>
            <DividerSizes />
          </div>
        </FoundationCard>

        {/* Attention Levels */}
        <FoundationCard
          title="Attention Levels"
          description="Three prominence levels control the stroke and content color intensity."
        >
          <div style={{ ...allRoleSurfaceVars }}>
            <DividerAttentionLevels />
          </div>
        </FoundationCard>

        {/* With Icon */}
        <FoundationCard
          title="With Icon"
          description="Icon content slot with start, center, and end alignment."
        >
          <div style={{ ...allRoleSurfaceVars }}>
            <DividerWithIcon />
          </div>
        </FoundationCard>

        {/* With Text (showcase export name: DividerWithLabel) */}
        <FoundationCard
          title="With Text"
          description="Text slot (design-system Text) with start, center, and end alignment."
        >
          <div style={{ ...allRoleSurfaceVars }}>
            <DividerWithLabel />
          </div>
        </FoundationCard>

        {/* Vertical Orientation */}
        <FoundationCard
          title="Vertical Orientation"
          description="Vertical dividers for inline separation between sibling elements."
        >
          <div style={{ ...allRoleSurfaceVars }}>
            <DividerVertical />
          </div>
        </FoundationCard>

        {/* Round Caps */}
        <FoundationCard
          title="Round Caps"
          description="Rounded stroke ends for softer visual appearance."
        >
          <div style={{ ...allRoleSurfaceVars }}>
            <DividerRoundCaps />
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="Divider automatically adapts when placed on different surface backgrounds."
        >
          {allRoleSurfaceVars ? (
            <div
              className={styles.showcase}
              style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}
            >
              {[
                { mode: 'default' as const, label: 'Default' },
                { mode: 'minimal' as const, label: 'Minimal' },
                { mode: 'subtle' as const, label: 'Subtle' },
                { mode: 'moderate' as const, label: 'Moderate' },
                { mode: 'bold' as const, label: 'Bold' },
                { mode: 'elevated' as const, label: 'Elevated' },
              ].map(({ mode, label }) => {
                const surfaceVars = {};
                return (
                  <Surface
                    key={mode}
                    mode={mode}
                    style={{
                      padding: 'var(--Spacing-4)',
                      borderRadius: 'var(--Shape-4)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--Spacing-3-5)',
                      width: '100%',
                      ...surfaceVars,
                    }}
                  >
                    <span
                      style={{
                        color: 'var(--Text-High)',
                        fontWeight: 'var(--Typography-Weight-Medium)',
                        fontSize: 'var(--Typography-Size-S)',
                      }}
                    >
                      {label}
                    </span>
                    <Divider attention="medium">
                      {label}
                    </Divider>
                  </Surface>
                );
              })}
            </div>
          ) : (
            <div className={styles.showcase}>
              <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                Surface data unavailable — configure colors and surfaces in Foundations.
              </p>
            </div>
          )}
        </FoundationCard>

        {/* Props & Usage */}
        <FoundationCard title="Props & Usage" collapsible>
          <ComponentDocumentation
            componentName="Divider"
            tokenManifest={DIVIDER_TOKEN_MANIFEST}
            baselineSpec={dividerMachineDocs}
            minimal
          />
        </FoundationCard>
      </div>
    </div>
  );
}

/**
 * Divider Component Page
 */
export default function DividerPage() {
  const { theme } = usePlatformContext();
  const foundationData = useFoundationData();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars } = useSurfaceTokenVars({
    foundationData,
    theme: themeKey,
  });

  if (foundationData === undefined) {
    return <PageSkeleton cards={3} />;
  }

  return (
    <DividerPageInner platformsConfig={platformsConfig} allRoleSurfaceVars={allRoleSurfaceVars} />
  );
}
