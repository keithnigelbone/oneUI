/**
 * RadioFieldPageContent.tsx
 *
 * Platform documentation + token manifest for RadioField.
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import {
  RADIO_FIELD_TOKEN_MANIFEST,
  RadioFieldDefault,
  RadioFieldSizes,
  RadioFieldStates,
  RadioFieldSurfaceContext,
} from '@oneui/ui/components/RadioField';
import { Surface } from '@oneui/ui/components/Surface';
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
import { useMigratedPlatformsConfig } from '@/hooks';

function RadioFieldPageInner({
  platformsConfig,
  allRoleSurfaceVars,
}: {
  platformsConfig: PlatformsFoundationConfig;
  allRoleSurfaceVars: Record<string, string>;
}) {
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
      (b: PlatformBreakpoint) => b.id === selectedBreakpointId,
    );
    return bp?.viewportWidth ?? null;
  }, [selectedPlatformEntry, selectedBreakpointId]);

  const platformTokens = useDensityDimensionOverrides(
    previewDensity,
    selectedPlatformEntry,
    breakpointViewport,
    breakpointId,
  );

  return (
    <div className={styles.mainContent}>
      <div className={styles.header}>
        <h1 className={styles.title}>RadioField</h1>
        <p className={styles.description}>
          Figma-aligned field shell matching InputField and CheckboxField: group label and description above RadioGroup,
          then InputFeedback, native Field.Error slot, and optional InputDynamicText.
        </p>
      </div>

      <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
        <FoundationCard title="Default" description="Label stack + radios + feedback and optional dynamic row.">
          <div style={{ ...allRoleSurfaceVars, width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
            <RadioFieldDefault />
          </div>
        </FoundationCard>

        <FoundationCard title="Sizes" description="S / M / L scales Radio group, label stack, InputDynamicText, and InputFeedback.">
          <div style={{ ...allRoleSurfaceVars }}>
            <RadioFieldSizes />
          </div>
        </FoundationCard>

        <FoundationCard title="States" description="Default selection, disabled group, read-only.">
          <div style={{ ...allRoleSurfaceVars }}>
            <RadioFieldStates />
          </div>
        </FoundationCard>

        <FoundationCard title="Surface context" description="Radio tokens remap on bold surfaces.">
          <div style={{ ...allRoleSurfaceVars }}>
            <RadioFieldSurfaceContext />
          </div>
        </FoundationCard>

        <FoundationCard title="On subtle surface" description="Field chrome stays readable on tinted containers.">
          <div style={{ ...allRoleSurfaceVars }}>
            <Surface mode="subtle" style={{ padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-4)' }}>
              <RadioFieldDefault />
            </Surface>
          </div>
        </FoundationCard>

        <FoundationCard title="Props & Usage" collapsible>
          <ComponentDocumentation
            componentName="RadioField"
            tokenManifest={RADIO_FIELD_TOKEN_MANIFEST}
            minimal
          />
        </FoundationCard>
      </div>
    </div>
  );
}

export default function RadioFieldPageContent() {
  const { theme } = usePlatformContext();
  const foundationData = useFoundationData();
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const { surfaceVars: allRoleSurfaceVars } = useSurfaceTokenVars({
    foundationData,
    theme: themeKey,
  });

  if (foundationData === undefined) {
    return <PageSkeleton cards={4} />;
  }

  return (
    <RadioFieldPageInner platformsConfig={platformsConfig} allRoleSurfaceVars={allRoleSurfaceVars} />
  );
}
