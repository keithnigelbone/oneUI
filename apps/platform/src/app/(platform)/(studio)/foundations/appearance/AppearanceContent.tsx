/**
 * foundations/appearance/page.tsx
 *
 * Appearance Foundation - Configure accent color roles and background
 * Features:
 * - Accent count selector (1-4)
 * - Background configuration (scale + per-mode steps)
 * - Accent role assignments (scale + base step + preview)
 * - Full color swatch support for all brand scales
 *
 * Scale loading uses getBrandSelection (full 25-step data needed for accent pickers).
 * Also includes the sync mechanism that creates brand selection records
 * when they don't exist yet (for legacy scales).
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  oklchToHex,
  generateColorScale,
} from '@oneui/shared';
import {
  buildMetallicFillGradient,
  getMetallicTokenLabel,
  normalizeActiveMetallicMap,
  normalizeMaterialAssignments,
  normalizeMetallicConfig,
  VISIBLE_METALLIC_PRESETS,
  type MaterialAssignmentMap,
  type VisibleMetallicPresetName,
} from '@oneui/shared/engine';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { Button } from '@oneui/ui/components/Button';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import {
  AccentConfigEditor,
  type AccentConfigAccent,
  type AccentConfigBackground,
  type AccentConfigLogo,
  type AccentConfigMaterialOption,
} from '@/design-tools/Brand/AccentConfig';
import { type AvailableScale } from '@/design-tools/Foundations/Surfaces';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import styles from '../foundation.module.css';

const SUBBRAND_EDITABLE_ROLES = ['primary', 'secondary', 'sparkle', 'brand-bg'] as const;
const INHERITED_SEMANTIC_ROLES = ['neutral', 'positive', 'negative', 'warning', 'informative'] as const;
const DEFAULT_ACTIVE_METALS: Record<VisibleMetallicPresetName, boolean> = {
  bronze: true,
  silver: true,
  gold: true,
  custom: false,
};

type SubBrandAccentFields = {
  primary: { scaleName: string; baseStep: number };
  secondary: { scaleName: string; baseStep: number };
  sparkle: { scaleName: string; baseStep: number };
  brandBg: {
    scaleName: string;
    backgroundStep: { light: number; dark: number };
  };
};

type MaterialAssignmentSource = {
  materials?: {
    materialAssignments?: MaterialAssignmentMap;
  };
};

type MaterialsFoundationAssignmentConfig = {
  materialAssignments?: MaterialAssignmentMap;
  subBrandMaterialAssignments?: Record<string, MaterialAssignmentMap>;
};

function getMaterialsFoundationConfig(foundationData: Record<string, unknown> | null | undefined): unknown {
  const materials = foundationData?.materials;
  if (!isRecord(materials)) return undefined;
  return isRecord(materials.config) ? materials.config : materials;
}

function buildSubBrandAccentItems(subBrand: SubBrandAccentFields): AccentConfigAccent[] {
  return [
    { role: 'primary', label: 'Primary', scaleName: subBrand.primary.scaleName, baseStep: subBrand.primary.baseStep },
    { role: 'secondary', label: 'Secondary', scaleName: subBrand.secondary.scaleName, baseStep: subBrand.secondary.baseStep },
    { role: 'sparkle', label: 'Sparkle', scaleName: subBrand.sparkle.scaleName, baseStep: subBrand.sparkle.baseStep },
    { role: 'brand-bg', label: 'Brand BG', scaleName: subBrand.brandBg.scaleName, baseStep: subBrand.brandBg.backgroundStep.light },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function buildMetallicPreviewConfig(foundationData: Record<string, unknown> | null | undefined) {
  const materialConfig = foundationData?.materialConfig;
  const materialsFoundationConfig = getMaterialsFoundationConfig(foundationData);
  const foundationMetallic = isRecord(materialsFoundationConfig)
    ? materialsFoundationConfig.metallic
    : undefined;
  const baseConfig = normalizeMetallicConfig(materialConfig);

  if (!isRecord(foundationMetallic)) return baseConfig;

  return normalizeMetallicConfig({
    metallic: Object.fromEntries(
      Object.entries(baseConfig).map(([preset, values]) => [
        preset,
        {
          ...values,
          ...(isRecord(foundationMetallic[preset]) ? foundationMetallic[preset] : {}),
        },
      ]),
    ),
  });
}

function normalizeAssignmentsFromRecord(input: unknown): MaterialAssignmentMap {
  return normalizeMaterialAssignments({ materialAssignments: input });
}

function getMaterialAssignmentsForScope(
  materialsFoundationConfig: unknown,
  appearanceConfig: MaterialAssignmentSource | null | undefined,
  subBrandId: string | undefined,
): MaterialAssignmentMap {
  const source = isRecord(materialsFoundationConfig) ? materialsFoundationConfig : {};
  if (subBrandId && isRecord(source.subBrandMaterialAssignments)) {
    const subBrandAssignments = source.subBrandMaterialAssignments[subBrandId];
    if (isRecord(subBrandAssignments)) {
      return normalizeAssignmentsFromRecord(subBrandAssignments);
    }
  }

  if (isRecord(source.materialAssignments)) {
    return normalizeAssignmentsFromRecord(source.materialAssignments);
  }

  return normalizeMaterialAssignments(appearanceConfig);
}

function buildMaterialsFoundationWithAssignments(
  materialsFoundationConfig: unknown,
  assignments: MaterialAssignmentMap,
  subBrandId: string | undefined,
): MaterialsFoundationAssignmentConfig & Record<string, unknown> {
  const base = isRecord(materialsFoundationConfig) ? { ...materialsFoundationConfig } : {};
  if (subBrandId) {
    const currentSubBrandAssignments = isRecord(base.subBrandMaterialAssignments)
      ? base.subBrandMaterialAssignments as Record<string, MaterialAssignmentMap>
      : {};
    return {
      ...base,
      subBrandMaterialAssignments: {
        ...currentSubBrandAssignments,
        [subBrandId]: assignments,
      },
    };
  }

  return {
    ...base,
    materialAssignments: assignments,
  };
}

function filterActiveMaterialAssignments(
  assignments: MaterialAssignmentMap,
  activeMetalMap: Record<VisibleMetallicPresetName, boolean>,
): MaterialAssignmentMap {
  return Object.fromEntries(
    Object.entries(assignments).filter(([, preset]) =>
      VISIBLE_METALLIC_PRESETS.includes(preset as VisibleMetallicPresetName)
      && activeMetalMap[preset as VisibleMetallicPresetName],
    ),
  ) as MaterialAssignmentMap;
}

export default function AppearanceContent() {
  const { handleNavigate } = usePlatformNavigation();
  const { currentBrand, theme, currentSubBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  // ─── Convex Queries ──────────────────────────────────────────────────

  const appearanceConfig = useQuery(
    api.appearanceConfigs.getByBrand,
    brandId ? { brandId } : 'skip'
  );

  // Read color foundation from shared context (avoids duplicate subscription)
  const foundationData = useFoundationData();
  const colorFoundation = foundationData?.color ?? undefined;
  const materialsFoundationConfig = getMaterialsFoundationConfig(foundationData as Record<string, unknown> | null | undefined);
  const materialsAssignmentFingerprint = JSON.stringify({
    materialAssignments: isRecord(materialsFoundationConfig) ? materialsFoundationConfig.materialAssignments ?? null : null,
    subBrandMaterialAssignments: isRecord(materialsFoundationConfig) ? materialsFoundationConfig.subBrandMaterialAssignments ?? null : null,
  });

  const colorConfig = colorFoundation?.config;
  const presetCollectionId = colorConfig?.brandScales?.find(
    (s: { source: string; presetCollectionId?: string }) => s.source === 'preset' && s.presetCollectionId
  )?.presetCollectionId;

  // Full preset scale data (all 25 steps per scale) — needed for accent color pickers
  const brandPresetSelection = useQuery(
    api.presetColorScales.getBrandSelection,
    brandId ? { brandId } : 'skip'
  );

  // Direct collection query: always fetch so we have full step data for ALL scales,
  // not just the ones in the brand selection record (which may be partial).
  const directCollection = useQuery(
    api.presetColorScales.getCollection,
    presetCollectionId
      ? { collectionId: presetCollectionId as Id<'presetColorScaleCollections'> }
      : 'skip'
  );

  const upsertAppearanceConfig = useMutation(api.appearanceConfigs.upsert);
  const upsertMaterialsFoundation = useMutation(api.foundations.upsertByType);
  const selectScalesForBrand = useMutation(api.presetColorScales.selectScalesForBrand);
  const upsertSubBrandConfig = useMutation(api.subBrandConfigs.upsert);

  // ─── Sync Preset Scales (same mechanism as surfaces page) ────────────
  // Creates brandPresetScaleSelections record when one doesn't exist yet

  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!brandId || hasSyncedRef.current) return;
    if (!colorConfig?.brandScales) return;

    const presetScales = colorConfig.brandScales.filter(
      (s: { source: string; presetCollectionId?: string }) => s.source === 'preset' && s.presetCollectionId
    );
    if (presetScales.length === 0) return;

    // Wait for query to return
    if (brandPresetSelection === undefined) return; // Still loading

    const collectionId = presetScales[0].presetCollectionId;
    if (!collectionId) return;

    // Sync if no selection exists OR if some scales are missing from the selection
    const allPresetNames = presetScales.map((s: { name: string }) => s.name);
    const selectedNames = new Set(brandPresetSelection?.selectedScaleNames ?? []);
    const missingScales = allPresetNames.filter((n: string) => !selectedNames.has(n));
    if (brandPresetSelection !== null && missingScales.length === 0) return;

    hasSyncedRef.current = true;
    selectScalesForBrand({
      brandId,
      collectionId: collectionId as Id<'presetColorScaleCollections'>,
      selectedScales: allPresetNames,
    }).catch(err => {
      console.warn('[Appearance] Failed to sync brand selection:', err);
      hasSyncedRef.current = false;
    });
  }, [brandId, colorConfig, brandPresetSelection, selectScalesForBrand]);

  // ─── Build Available Scales ─────────────────────────────────────────
  //
  // Merges scale data from brandPresetSelection and directCollection.
  // directCollection ensures ALL scales have data even when the brand selection
  // record is missing or partial.

  const availableScales = useMemo<AvailableScale[]>(() => {
    if (!colorConfig?.brandScales?.length) return [];

    const parseOklch = (oklch: string): string => {
      const match = oklch.match(/oklch\(\s*(\d*\.?\d+)(%?)\s+(\d*\.?\d+)\s+(\d*\.?\d+)/);
      if (!match) return '#808080';
      let l = parseFloat(match[1]);
      if (match[2] !== '%' && l <= 1) l = l * 100;
      return oklchToHex(l, parseFloat(match[3]), parseFloat(match[4]));
    };

    // Merge scale data from both sources:
    // 1. directCollection (all scales in the collection — covers unsynced scales)
    // 2. brandPresetSelection (synced scales — higher priority)
    const scaleDataMap = new Map<string, { steps: Array<{ step: string; oklch: string }>; baseStep: string }>();

    if (directCollection?.scales) {
      for (const s of directCollection.scales) {
        if (s.steps?.length) {
          scaleDataMap.set(s.name.toLowerCase(), { steps: s.steps, baseStep: s.baseStep });
        }
      }
    }

    if (brandPresetSelection?.selectedScales) {
      for (const s of brandPresetSelection.selectedScales as Array<{ name: string; steps?: Array<{ step: string; oklch: string }>; baseStep?: string }>) {
        if (s.steps?.length) {
          scaleDataMap.set(s.name.toLowerCase(), { steps: s.steps, baseStep: s.baseStep ?? '' });
        }
      }
    }

    return colorConfig.brandScales
      .map((scale: { name: string; source: string; baseColor?: string; lightnessBias?: number }) => {
        // For preset scales, use scaleDataMap
        const data = scaleDataMap.get(scale.name.toLowerCase());
        if (data?.steps?.length) {
          return {
            name: scale.name,
            steps: data.steps.map((step: { step: string }) => parseInt(step.step, 10)),
            colors: data.steps.map((step: { step: string; oklch: string }) => ({
              step: parseInt(step.step, 10),
              oklch: step.oklch,
              hex: parseOklch(step.oklch),
            })),
            baseStep: data.baseStep ? parseInt(data.baseStep, 10) : undefined,
          };
        }

        // For preset scales with lightweight data (baseColor only), generate approximation
        if (scale.source === 'preset' && brandPresetSelection?.selectedScales) {
          const presetScale = (brandPresetSelection.selectedScales as Array<{ name: string; baseColor?: string; baseStep?: string }>)
            .find(s => s.name === scale.name);
          if (presetScale?.baseColor) {
            const baseHex = parseOklch(presetScale.baseColor);
            const generated = generateColorScale(scale.name, baseHex, 'linear', 0);
            return {
              name: scale.name,
              steps: generated.steps.map(step => step.step),
              colors: generated.steps.map(step => ({
                step: step.step,
                oklch: step.oklch,
                hex: step.hex,
              })),
              baseStep: presetScale.baseStep ? parseInt(presetScale.baseStep, 10) : generated.config.baseStep,
            };
          }
        }

        // For custom scales, generate from baseColor
        if (scale.source === 'custom' && scale.baseColor) {
          const generated = generateColorScale(scale.name, scale.baseColor, 'linear', scale.lightnessBias ?? 0);
          return {
            name: scale.name,
            steps: generated.steps.map(step => step.step),
            colors: generated.steps.map(step => ({
              step: step.step,
              oklch: step.oklch,
              hex: step.hex,
            })),
            baseStep: generated.config.baseStep,
          };
        }

        return null;
      })
      .filter((s: AvailableScale | null): s is AvailableScale => s !== null);
  }, [colorConfig, brandPresetSelection, directCollection]);


  // ─── Local State ─────────────────────────────────────────────────────

  const [accentCount, setAccentCount] = useState(1);
  const [accentBackground, setAccentBackground] = useState<AccentConfigBackground>({
    scaleName: '',
    backgroundStep: { light: 2500, dark: 200 },
  });
  const [accentItems, setAccentItems] = useState<AccentConfigAccent[]>([]);
  const [logo, setLogo] = useState<AccentConfigLogo | null>(null);
  const [materialAssignments, setMaterialAssignments] = useState<MaterialAssignmentMap>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  // Effect 1: When the active sub-brand ID changes (including deselect), reset hasInitialized
  // so Effect 2 below runs fresh with the new sub-brand's data.
  // prevSubBrandIdRef is initialized with the current ID — this means we only reset on
  // *changes*, not on mount. Effect 2 handles the mount case via hasInitialized=false.
  const prevSubBrandIdRef = useRef(currentSubBrand?.id);
  useEffect(() => {
    if (prevSubBrandIdRef.current === currentSubBrand?.id) return;
    prevSubBrandIdRef.current = currentSubBrand?.id;
    setHasInitialized(false);
  }, [currentSubBrand?.id]);

  // Effect 2: Whenever a sub-brand is active and not yet initialized, load its config.
  // This fires both on mount (hasInitialized starts false) and after Effect 1 resets it.
  // Roles mirror the CSS mapping in applySubBrandAccents:
  //   sub-brand primary    → primary role
  //   sub-brand secondary  → secondary role
  //   sub-brand sparkle    → sparkle role
  //   sub-brand brandBg → brand-bg role (same scale also drives surface background)
  useEffect(() => {
    if (!currentSubBrand || hasInitialized) return;
    setAccentItems(buildSubBrandAccentItems(currentSubBrand));
    setAccentCount(4);
    setAccentBackground({
      scaleName: currentSubBrand.brandBg.scaleName,
      backgroundStep: { light: currentSubBrand.brandBg.backgroundStep.light, dark: currentSubBrand.brandBg.backgroundStep.dark },
    });
    setMaterialAssignments(getMaterialAssignmentsForScope(
      materialsFoundationConfig,
      appearanceConfig as MaterialAssignmentSource | null | undefined,
      currentSubBrand.id,
    ));
    setHasInitialized(true);
  }, [currentSubBrand, hasInitialized, materialsAssignmentFingerprint, appearanceConfig]);

  // Initialize from Convex — combined with brand-reset to avoid race condition
  const prevBrandIdRef = useRef(brandId);

  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      setHasInitialized(false);
      return;
    }

    // Sub-brand Effect 2 handles initialization when a sub-brand is active.
    // Skip here so we never overwrite sub-brand state with base brand data.
    if (currentSubBrand) return;

    if (appearanceConfig && !hasInitialized) {
      setAccentCount(appearanceConfig.accentCount);
      setAccentBackground(appearanceConfig.background);
      setAccentItems(appearanceConfig.accents);
      setLogo(appearanceConfig.logo ?? null);
      setMaterialAssignments(getMaterialAssignmentsForScope(
        materialsFoundationConfig,
        appearanceConfig as MaterialAssignmentSource,
        undefined,
      ));
      setHasInitialized(true);
    } else if (appearanceConfig === null && !hasInitialized) {
      if (availableScales.length > 0) {
        // No config yet but has scales — set defaults
        const defaultScale = availableScales[0]?.name ?? '';
        setAccentCount(1);
        setAccentBackground({
          scaleName: defaultScale,
          backgroundStep: { light: 2500, dark: 200 },
        });
        setAccentItems([{
          role: 'primary',
          label: 'Primary',
          scaleName: defaultScale,
          baseStep: 1300,
        }]);
        setLogo(null);
      }
      setMaterialAssignments({});
      // Mark initialized even with no scales — allows empty state to render
      setHasInitialized(true);
    }
  }, [appearanceConfig, hasInitialized, availableScales, brandId, currentSubBrand, materialsAssignmentFingerprint]);

  // ─── Sub-brand editor helpers ────────────────────────────────────────

  // When sub-brand is active, restrict the brand accent scale pickers to the 4 sub-brand
  // scales only. Neutral/semantic pickers use the full availableScales list (via AccentConfigEditor
  // internals) so their inherited base-brand colors display correctly.
  const subBrandScaleOptions = useMemo(() => {
    if (!currentSubBrand) return undefined;
    const subBrandScaleNames = new Set([
      currentSubBrand.primary.scaleName,
      currentSubBrand.secondary.scaleName,
      currentSubBrand.sparkle.scaleName,
      currentSubBrand.brandBg.scaleName,
    ].map(n => n.toLowerCase()));
    return availableScales
      .filter(s => subBrandScaleNames.has(s.name.toLowerCase()))
      .map(s => {
        const repColor = s.colors?.find(c => c.step === (s.baseStep ?? 1300))?.hex
          ?? s.colors?.[Math.floor((s.colors.length ?? 0) / 2)]?.hex;
        return { value: s.name, label: s.name, color: repColor };
      });
  }, [currentSubBrand, availableScales]);

  // When sub-brand is active, include inherited neutral/semantic rows from the base brand
  // so they show up as read-only in the Appearance editor.
  const accentsForEditor = useMemo<AccentConfigAccent[]>(() => {
    if (!currentSubBrand || !hasInitialized) return accentItems;
    const baseAccents: AccentConfigAccent[] = appearanceConfig?.accents ?? [];
    const inherited = baseAccents.filter((a: AccentConfigAccent) =>
      (INHERITED_SEMANTIC_ROLES as readonly string[]).includes(a.role),
    );
    return [...accentItems, ...inherited];
  }, [currentSubBrand, accentItems, appearanceConfig, hasInitialized]);

  const activeMetalsSource = isRecord(materialsFoundationConfig)
    ? materialsFoundationConfig.activeMetals
    : undefined;
  const activeMetalsFingerprint = JSON.stringify(activeMetalsSource ?? null);
  const activeMetalMap = useMemo(() => {
    const activeMetals = JSON.parse(activeMetalsFingerprint) as unknown;
    return {
      ...DEFAULT_ACTIVE_METALS,
      ...(normalizeActiveMetallicMap({ activeMetals }) ?? {}),
    };
  }, [activeMetalsFingerprint]);

  const activeMetalPresets = useMemo(
    () => VISIBLE_METALLIC_PRESETS.filter((preset) => activeMetalMap[preset]),
    [activeMetalMap],
  );

  const metallicPreviewConfig = useMemo(
    () => buildMetallicPreviewConfig(foundationData as Record<string, unknown> | null | undefined),
    [foundationData],
  );

  const materialOptions = useMemo<AccentConfigMaterialOption[]>(() => (
    activeMetalPresets.map((preset) => ({
      value: preset,
      label: getMetallicTokenLabel(preset),
      fill: buildMetallicFillGradient(metallicPreviewConfig[preset]),
      text: metallicPreviewConfig[preset].shadow,
    }))
  ), [activeMetalPresets, metallicPreviewConfig]);

  // When sub-brand is active, filter out inherited roles before updating state so
  // neutral/semantic from the base brand are never overwritten by sub-brand edits.
  const handleAccentsChange = (newAccents: AccentConfigAccent[]) => {
    if (currentSubBrand) {
      setAccentItems(newAccents.filter(a =>
        (SUBBRAND_EDITABLE_ROLES as readonly string[]).includes(a.role),
      ));
    } else {
      setAccentItems(newAccents);
    }
  };

  // When sub-brand is active, accent count is always fixed at 4 — ignore changes.
  const handleAccentCountChange = (count: number) => {
    if (!currentSubBrand) setAccentCount(count);
  };

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveMaterialAssignmentsNow = useCallback((assignments: MaterialAssignmentMap) => {
    if (!brandId) return;

    const activeMaterialAssignments = filterActiveMaterialAssignments(assignments, activeMetalMap);
    setIsSaving(true);
    upsertMaterialsFoundation({
      brandId,
      type: 'materials',
      config: buildMaterialsFoundationWithAssignments(
        materialsFoundationConfig,
        activeMaterialAssignments,
        currentSubBrand?.id,
      ),
    })
      .catch(err => console.warn('[Appearance] Material assignment save failed:', err))
      .finally(() => setIsSaving(false));
  }, [
    activeMetalMap,
    brandId,
    currentSubBrand,
    materialsFoundationConfig,
    upsertMaterialsFoundation,
  ]);

  const handleMaterialAssignmentsChange = useCallback((assignments: Partial<Record<string, string>>) => {
    const nextAssignments: MaterialAssignmentMap = {};
    for (const [target, preset] of Object.entries(assignments)) {
      if (VISIBLE_METALLIC_PRESETS.includes(preset as VisibleMetallicPresetName)) {
        nextAssignments[target as keyof MaterialAssignmentMap] = preset as VisibleMetallicPresetName;
      }
    }
    setMaterialAssignments(nextAssignments);
    saveMaterialAssignmentsNow(nextAssignments);
  }, [saveMaterialAssignmentsNow]);

  // ─── Auto-Save (debounced mutation) ──────────────────────────────────

  useEffect(() => {
    if (!hasInitialized || !brandId || accentItems.length === 0) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      setIsSaving(true);
      const activeMaterialAssignments = filterActiveMaterialAssignments(materialAssignments, activeMetalMap);
      const saveMaterialFoundation = () => upsertMaterialsFoundation({
        brandId,
        type: 'materials',
        config: buildMaterialsFoundationWithAssignments(
          materialsFoundationConfig,
          activeMaterialAssignments,
          currentSubBrand?.id,
        ),
      });

      // When a sub-brand is active, save changes back to the sub-brand config.
      // Role mapping (UI editor → Convex subBrandConfigs field):
      //   primary   role → primary field
      //   secondary role → secondary field
      //   sparkle   role → sparkle field
      //   brand-bg  role scaleName → brandBg.scaleName (same scale also drives surface background)
      if (currentSubBrand) {
        const primaryAccent   = accentItems.find(a => a.role === 'primary');
        const secondaryAccent = accentItems.find(a => a.role === 'secondary');
        const sparkleAccent   = accentItems.find(a => a.role === 'sparkle');
        if (!primaryAccent || !secondaryAccent || !sparkleAccent) {
          setIsSaving(false);
          return;
        }
        // brand-bg scaleName overrides background scale (same scale drives both surface bg + brand-bg role)
        const brandBgAccent = accentItems.find(a => a.role === 'brand-bg');
        const bgScaleName = brandBgAccent?.scaleName ?? accentBackground.scaleName;
        Promise.all([
          upsertSubBrandConfig({
          id: currentSubBrand.id as Id<'subBrandConfigs'>,
          parentBrandId: brandId,
          name: currentSubBrand.name,
          slug: currentSubBrand.slug,
          primary:   { scaleName: primaryAccent.scaleName,   baseStep: primaryAccent.baseStep },
          secondary: { scaleName: secondaryAccent.scaleName, baseStep: secondaryAccent.baseStep },
          sparkle:   { scaleName: sparkleAccent.scaleName,   baseStep: sparkleAccent.baseStep },
          brandBg: {
            scaleName: bgScaleName,
            backgroundStep: {
              light: accentBackground.backgroundStep.light,
              dark:  accentBackground.backgroundStep.dark,
            },
          },
          }),
          saveMaterialFoundation(),
        ])
          .catch(err => console.warn('[Appearance] Sub-brand save failed:', err))
          .finally(() => setIsSaving(false));
        return;
      }

      Promise.all([
        upsertAppearanceConfig({
        brandId,
        accentCount,
        background: accentBackground,
        accents: accentItems,
        logo: logo ?? undefined,
        }),
        saveMaterialFoundation(),
      ])
        .catch(err => console.warn('[Appearance] Auto-save failed:', err))
        .finally(() => setIsSaving(false));
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [accentCount, accentBackground, accentItems, logo, materialAssignments, activeMetalMap, brandId, hasInitialized, currentSubBrand, materialsAssignmentFingerprint, upsertAppearanceConfig, upsertMaterialsFoundation, upsertSubBrandConfig]);

  // ─── Render ──────────────────────────────────────────────────────────

  const isLoading = (brandId != null && appearanceConfig === undefined) || !hasInitialized;
  const hasNoScales = availableScales.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Appearance</h1>
        <p className={styles.description}>
          Configure accent roles, neutral, semantic colors, and background for your brand.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      {currentSubBrand && (
        <div style={{
          margin: 'var(--Spacing-4) 0',
          padding: 'var(--Spacing-3-5) var(--Spacing-4-5)',
          background: 'color-mix(in srgb, var(--Primary-Subtle, var(--Surface-Ghost)) 60%, transparent)',
          border: 'var(--Stroke-M) solid var(--Primary-Bold, var(--Border-Subtle))',
          borderRadius: 'var(--Shape-4)',
          color: 'var(--Text-Medium)',
          fontSize: 'var(--Typography-Size-S)',
        }}>
          Viewing sub-brand: <strong style={{ color: 'var(--Text-High)' }}>{currentSubBrand.name}</strong>
          {' '}— you can reassign the 4 sub-brand scales across roles. Neutral and semantic colors are inherited from the base brand.
        </div>
      )}

      <div className={styles.content}>
        {isLoading && <PageSkeleton cards={2} />}

        {!isLoading && (
          <div className={styles.tabPanelStack}>
            {hasNoScales && (
              <FoundationCard
                title="Color Scales Required"
                description="Appearance configuration depends on color scales being set up first."
              >
                <div style={{
                  padding: 'var(--Spacing-4-5)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 'var(--Spacing-4)',
                }}>
                  <p style={{
                    color: 'var(--Text-Medium)',
                    margin: 0,
                    lineHeight: 'var(--Typography-LineHeight-Body)',
                  }}>
                    Appearance roles (primary, secondary, neutral, etc.) are assigned from your brand&apos;s
                    color scales. Define at least one color scale to get started.
                  </p>
                  <Button attention="high" size="s" onPress={() => handleNavigate('/foundations/color')}>
                    Go to Color Foundation
                  </Button>
                </div>
              </FoundationCard>
            )}

            {!hasNoScales && hasInitialized && (
              <FoundationCard
                title="Accent Configuration"
                description="Set accent roles, neutral override, semantic colors, and background scale for each role."
              >
                <AccentConfigEditor
                  accentCount={accentCount}
                  onAccentCountChange={handleAccentCountChange}
                  background={accentBackground}
                  onBackgroundChange={setAccentBackground}
                  accents={accentsForEditor}
                  onAccentsChange={handleAccentsChange}
                  logo={logo}
                  onLogoChange={setLogo}
                  availableScales={availableScales}
                  theme={theme}
                  readOnlyExtras={!!currentSubBrand}
                  subBrandScaleOptions={subBrandScaleOptions}
                  materialOptions={materialOptions}
                  materialAssignments={materialAssignments}
                  onMaterialAssignmentsChange={handleMaterialAssignmentsChange}
                />
              </FoundationCard>
            )}
          </div>
        )}
      </div>

      {isSaving && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--Spacing-4-5)',
            right: 'var(--Spacing-4-5)',
            padding: 'var(--Spacing-3-5) var(--Spacing-4)',
            backgroundColor: 'var(--Surface-Bold)',
            color: 'var(--Text-OnBold-High)',
            borderRadius: 'var(--Shape-Pill)',
            fontSize: 'var(--Typography-Size-XS)',
            opacity: 0.9,
          }}
        >
          Saving...
        </div>
      )}
    </div>
  );
}
