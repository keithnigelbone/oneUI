/**
 * CheckboxFieldPageContent.tsx
 *
 * Platform documentation + token manifest for CheckboxField.
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import {
  CHECKBOX_FIELD_TOKEN_MANIFEST,
  CheckboxFieldDefault,
  CheckboxFieldSizes,
  CheckboxFieldStates,
  CheckboxFieldSurfaceContext,
} from '@oneui/ui/components/CheckboxField';
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

function CheckboxFieldPageInner({
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
        <h1 className={styles.title}>CheckboxField</h1>
        <p className={styles.description}>
          Figma-aligned field shell matching InputField: Field.Root + integrated Checkbox (label, description, info
          slot), then InputFeedback, native Field.Error slot, and optional InputDynamicText row.
        </p>
      </div>

      <div className={styles.content} style={{ ...platformTokens }} data-density={previewDensity}>
        <FoundationCard title="Default" description="Label stack + checkbox + feedback and optional dynamic row.">
          <div style={{ ...allRoleSurfaceVars, width: '100%', maxWidth: 'none', boxSizing: 'border-box' }}>
            <CheckboxFieldDefault />
          </div>
        </FoundationCard>

        <FoundationCard title="Sizes" description="S / M / L scales Checkbox, label stack, InputDynamicText, and InputFeedback.">
          <div style={{ ...allRoleSurfaceVars }}>
            <CheckboxFieldSizes />
          </div>
        </FoundationCard>

        <FoundationCard title="States" description="Selected, indeterminate, disabled, read-only.">
          <div style={{ ...allRoleSurfaceVars }}>
            <CheckboxFieldStates />
          </div>
        </FoundationCard>

        <FoundationCard title="Surface context" description="Checkbox tokens remap on bold surfaces.">
          <div style={{ ...allRoleSurfaceVars }}>
            <CheckboxFieldSurfaceContext />
          </div>
        </FoundationCard>

        <FoundationCard title="On subtle surface" description="Field chrome stays readable on tinted containers.">
          <div style={{ ...allRoleSurfaceVars }}>
            <Surface mode="subtle" style={{ padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-4)' }}>
              <CheckboxFieldDefault />
            </Surface>
          </div>
        </FoundationCard>

        <FoundationCard title="Props & Usage" collapsible>
          <ComponentDocumentation
            componentName="CheckboxField"
            tokenManifest={CHECKBOX_FIELD_TOKEN_MANIFEST}
            minimal
          />
        </FoundationCard>
      </div>
    </div>
  );
}

export default function CheckboxFieldPageContent() {
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
    <CheckboxFieldPageInner platformsConfig={platformsConfig} allRoleSurfaceVars={allRoleSurfaceVars} />
  );
}
