'use client';

/**
 * Sidebar concerns extracted from `(platform)/layout.tsx`:
 *
 *   - `useSidebarLogoColor` — resolves the colour applied to the sidebar
 *     `<BrandLogo>`. Honours the brand's explicit Logo override (from the
 *     Appearance editor) before falling back to the editing brand's
 *     `--Primary-Bold`. Independent of Theme Scope so the logo always
 *     reflects the user's deliberate choice.
 *
 *   - `useSecondaryNav` — derives the secondary-nav tab list + active-tab
 *     id from the current route. Threads agent sub-trees and chat
 *     history into the same secondary rail vocabulary.
 */

import { useMemo } from 'react';
import {
  buildAvailableScales,
  normalizeMaterialAssignments,
  type VisibleMetallicPresetName,
} from '@oneui/shared/engine';
import {
  brandConfigTabs,
  toneOfVoiceTabs,
  designCompositionTabs,
  foundationTabs,
  componentTabs,
  createTabs,
} from '@/config/navigation';

interface ColorScale {
  name: string;
  colors?: Array<{ step: number; hex: string }>;
}

interface AppearanceLogo {
  scaleName: string;
  baseStep: number;
}

interface FoundationDataLike {
  appearanceConfig?: { logo?: AppearanceLogo; materials?: unknown } | null;
  color?: { config?: unknown } | null;
  materials?: { config?: unknown } | Record<string, unknown> | null;
  presetSelection?: unknown;
}

function getMaterialsFoundationConfig(foundationData: FoundationDataLike | null | undefined): unknown {
  const materials = foundationData?.materials;
  if (!materials || typeof materials !== 'object' || Array.isArray(materials)) return undefined;
  return 'config' in materials ? materials.config : materials;
}

export function useSidebarLogoMaterial(
  foundationData: FoundationDataLike | null | undefined,
): VisibleMetallicPresetName | undefined {
  return useMemo(() => {
    const appearanceAssignments = normalizeMaterialAssignments(foundationData?.appearanceConfig);
    if (appearanceAssignments.logo) return appearanceAssignments.logo;

    const materialAssignments = normalizeMaterialAssignments(getMaterialsFoundationConfig(foundationData));
    return materialAssignments.logo;
  }, [
    foundationData?.appearanceConfig,
    foundationData?.materials,
  ]);
}

export function useSidebarLogoColor(
  foundationData: FoundationDataLike | null | undefined,
  brandPrimaryColor: string | undefined,
): string | undefined {
  const sidebarLogoOverrideColor = useMemo<string | undefined>(() => {
    const logoMaterial = normalizeMaterialAssignments(foundationData?.appearanceConfig).logo
      ?? normalizeMaterialAssignments(getMaterialsFoundationConfig(foundationData)).logo;
    if (logoMaterial) return undefined;

    const logoCfg = foundationData?.appearanceConfig?.logo;
    const colorConfig = foundationData?.color?.config;
    const presetSelection = foundationData?.presetSelection;

    if (!logoCfg || !colorConfig) return undefined;
    const scales = buildAvailableScales(
      colorConfig as Parameters<typeof buildAvailableScales>[0],
      presetSelection as Parameters<typeof buildAvailableScales>[1],
    ) as ColorScale[];
    const matchedScale = scales.find(
      (s) => s.name.toLowerCase() === logoCfg.scaleName.toLowerCase(),
    );
    return matchedScale?.colors?.find((c) => c.step === logoCfg.baseStep)?.hex;
  }, [
    foundationData?.appearanceConfig?.logo,
    foundationData?.appearanceConfig,
    foundationData?.materials,
    foundationData?.color?.config,
    foundationData?.presetSelection,
  ]);

  return sidebarLogoOverrideColor ?? brandPrimaryColor;
}

interface RecentThread {
  _id: string;
  title: string;
}

interface UseSecondaryNavArgs {
  currentSection: string | undefined;
  currentSubSection: string | undefined;
  thirdPart: string | undefined;
  recentThreads: ReadonlyArray<RecentThread> | undefined;
}

interface SecondaryNavTab {
  id: string;
  label: string;
}

export function useSecondaryNav({
  currentSection,
  currentSubSection,
  thirdPart,
  recentThreads,
}: UseSecondaryNavArgs): { tabs: SecondaryNavTab[]; activeTab: string } {
  const tabs = useMemo<SecondaryNavTab[]>(() => {
    if (currentSection === 'brand') {
      return brandConfigTabs;
    }
    if (currentSection === 'agents') {
      if (currentSubSection === 'tone-of-voice') return toneOfVoiceTabs;
      if (currentSubSection === 'design-composition') return designCompositionTabs;
      return [];
    }
    if (currentSection === 'foundations') return foundationTabs;
    if (currentSection === 'components') return componentTabs;
    if (currentSection === 'create') return createTabs;
    if (currentSection === 'chat') {
      return (recentThreads ?? []).map((t) => ({ id: t._id, label: t.title }));
    }
    return [];
  }, [currentSection, currentSubSection, recentThreads]);

  const activeTab = useMemo<string>(() => {
    if (currentSection === 'brand') {
      return currentSubSection || 'overview';
    }
    if (currentSection === 'agents') {
      if (currentSubSection === 'tone-of-voice' && thirdPart) {
        return `tone-of-voice/${thirdPart}`;
      }
      if (currentSubSection === 'design-composition' && thirdPart) {
        return `design-composition/${thirdPart}`;
      }
      return currentSubSection || '';
    }
    if (currentSection === 'foundations') return currentSubSection || 'color';
    if (currentSection === 'components') return currentSubSection || 'global';
    if (currentSection === 'create') return currentSubSection || 'start-here';
    if (currentSection === 'chat') return currentSubSection || '';
    return currentSubSection || 'overview';
  }, [currentSubSection, currentSection, thirdPart]);

  return { tabs, activeTab };
}
