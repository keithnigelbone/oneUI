/**
 * Merge sub-brand accent picks into foundation overview data (appearance + Brand BG).
 * Used by platform global injection and ExperienceCanvas per-artboard scoped CSS.
 */

import { INHERITED_SEMANTIC_ROLES } from '../types/appearance';

export type SubBrandAccentFields = {
  id?: string;
  primary: { scaleName: string; baseStep: number };
  secondary: { scaleName: string; baseStep: number };
  sparkle: { scaleName: string; baseStep: number };
  brandBg: {
    scaleName: string;
    backgroundStep: { light: number; dark: number };
  };
  materials?: {
    materialAssignments?: Record<string, string | undefined>;
  };
};

export type AccentEntry = { role: string; label: string; scaleName: string; baseStep: number };

/**
 * Build the 4 accent rows a sub-brand owns directly: primary, secondary, sparkle, brand-bg.
 *
 * Role mapping:
 *   sub-brand primary    → primary role
 *   sub-brand secondary  → secondary role
 *   sub-brand sparkle    → sparkle role
 *   sub-brand brandBg    → brand-bg role
 *
 * `brand-bg`'s baseStep is `brandBg.backgroundStep.light` so bg-bold resolves to
 * exactly the colour the sub-brand author picked (useBrandCSS always runs with
 * brandMode=false).
 */
export function buildSubBrandAccentItems(subBrand: SubBrandAccentFields): AccentEntry[] {
  return [
    { role: 'primary',   label: 'Primary',   scaleName: subBrand.primary.scaleName,    baseStep: subBrand.primary.baseStep },
    { role: 'secondary', label: 'Secondary', scaleName: subBrand.secondary.scaleName,  baseStep: subBrand.secondary.baseStep },
    { role: 'sparkle',   label: 'Sparkle',   scaleName: subBrand.sparkle.scaleName,    baseStep: subBrand.sparkle.baseStep },
    { role: 'brand-bg',  label: 'Brand BG',  scaleName: subBrand.brandBg.scaleName, baseStep: subBrand.brandBg.backgroundStep.light },
  ];
}

const INHERITED_ROLES_SET: ReadonlySet<string> = new Set(INHERITED_SEMANTIC_ROLES);

/**
 * Merges a sub-brand's 4 color fields into a brand's appearance config.
 * Sub-brand owns primary/secondary/sparkle/brand-bg; neutral + semantic roles
 * are inherited from the parent.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySubBrandAccentsToFoundation(
  baseData: Record<string, any> | undefined | null,
  currentSubBrand: SubBrandAccentFields | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | undefined | null {
  if (!baseData || !currentSubBrand) return baseData;

  const parentAccents: AccentEntry[] = baseData?.appearanceConfig?.accents ?? [];
  const inherited = parentAccents.filter((a) => INHERITED_ROLES_SET.has(a.role));

  const subBrandAccents: AccentEntry[] = [
    ...buildSubBrandAccentItems(currentSubBrand),
    ...inherited,
  ];

  const parentLogo = baseData?.appearanceConfig?.logo;
  const materialsConfig = baseData?.materials?.config;
  const subBrandAssignments =
    currentSubBrand.id
    && materialsConfig?.subBrandMaterialAssignments
    && typeof materialsConfig.subBrandMaterialAssignments === 'object'
      ? materialsConfig.subBrandMaterialAssignments[currentSubBrand.id]
      : undefined;
  const baseAssignments =
    materialsConfig?.materialAssignments
    && typeof materialsConfig.materialAssignments === 'object'
      ? materialsConfig.materialAssignments
      : undefined;
  const materials = subBrandAssignments
    ? { materialAssignments: subBrandAssignments }
    : currentSubBrand.materials ?? (baseAssignments ? { materialAssignments: baseAssignments } : baseData?.appearanceConfig?.materials);

  return {
    ...baseData,
    appearanceConfig: {
      accentCount: subBrandAccents.length,
      background: {
        scaleName: currentSubBrand.brandBg.scaleName,
        backgroundStep: currentSubBrand.brandBg.backgroundStep,
      },
      accents: subBrandAccents,
      ...(parentLogo ? { logo: parentLogo } : {}),
      ...(materials ? { materials } : {}),
    },
  };
}
