/**
 * brand/sub-brands/SubBrandsContent.tsx
 *
 * Sub-brand management page.
 * The role editor mirrors AccentConfigEditor exactly:
 *   4-column grid · Role badge | Color Family | Base Step | Preview
 * Nomenclature: Primary · Secondary · Sparkle · Brand BG
 */

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { oklchToHex, generateColorScale } from '@oneui/shared';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { Button } from '@oneui/ui/components/Button';
import { InputField } from '@oneui/ui/components/Input';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import {
  type AvailableScale,
  buildPaletteFromScale,
} from '@/design-tools/Foundations/Surfaces';
import { resolveTokenSet, buildScaleDefinition } from '@oneui/shared/engine';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageSkeleton } from '@/components/PageSkeleton';
import styles from '../../foundations/foundation.module.css';
import s from './SubBrandsContent.module.css';

// ─── Types ──────────────────────────────────────────────────────────────────

interface RoleConfig {
  scaleName: string;
  baseStep: number;
}

interface BrandBgConfig {
  scaleName: string;
  backgroundStep: { light: number; dark: number };
}

interface SubBrandDraft {
  id: string | null;
  name: string;
  slug: string;
  primary: RoleConfig;
  secondary: RoleConfig;
  sparkle: RoleConfig;
  brandBg: BrandBgConfig;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STEP_VALUES = [
  200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900,
  2000, 2100, 2200, 2300, 2400, 2500,
];

const SURFACE_LABELS = ['Default', 'Minimal', 'Subtle', 'Bold', 'Elevated'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function buildStepOptions(scaleName: string, availableScales: AvailableScale[]): SelectOption<number>[] {
  const scale = availableScales.find(s => s.name.toLowerCase() === scaleName.toLowerCase());
  const baseStep = scale?.baseStep;
  return STEP_VALUES.map(step => {
    const colorEntry = scale?.colors?.find(c => c.step === step);
    return {
      value: step,
      label: String(step),
      color: colorEntry?.hex,
      badge: step === baseStep ? 'base' : undefined,
    };
  });
}

function buildScaleOptions(availableScales: AvailableScale[]): SelectOption<string>[] {
  return availableScales.map(sc => {
    const target = sc.baseStep ?? 1300;
    const entry = sc.colors?.find(c => c.step === target) ?? sc.colors?.[Math.floor((sc.colors.length ?? 0) / 2)];
    return { value: sc.name, label: sc.name, color: entry?.hex };
  });
}

function makeDefaultDraft(availableScales: AvailableScale[]): Omit<SubBrandDraft, 'id' | 'name' | 'slug'> {
  const defaultScale = availableScales[0]?.name ?? '';
  return {
    primary:    { scaleName: defaultScale, baseStep: 1300 },
    secondary:  { scaleName: defaultScale, baseStep: 1100 },
    sparkle:    { scaleName: defaultScale, baseStep: 900 },
    brandBg: { scaleName: defaultScale, backgroundStep: { light: 2500, dark: 200 } },
  };
}

// ─── Color preview dots (shown in the collapsed card header) ─────────────────

function getHexForRole(
  scaleName: string,
  step: number,
  availableScales: AvailableScale[],
): string | null {
  const scale = availableScales.find(
    (sc) => sc.name.toLowerCase() === scaleName.toLowerCase(),
  );
  const entry = scale?.colors?.find((c) => c.step === step);
  return entry?.hex ?? null;
}

function SubBrandColorPreview({
  draft,
  availableScales,
  theme,
}: {
  draft: SubBrandDraft;
  availableScales: AvailableScale[];
  theme: 'light' | 'dark';
}) {
  const bgStep = theme === 'dark'
    ? draft.brandBg.backgroundStep.dark
    : draft.brandBg.backgroundStep.light;

  const swatches = [
    { role: 'Primary', hex: getHexForRole(draft.primary.scaleName, draft.primary.baseStep, availableScales) },
    { role: 'Secondary', hex: getHexForRole(draft.secondary.scaleName, draft.secondary.baseStep, availableScales) },
    { role: 'Sparkle', hex: getHexForRole(draft.sparkle.scaleName, draft.sparkle.baseStep, availableScales) },
    { role: 'Brand BG', hex: getHexForRole(draft.brandBg.scaleName, bgStep, availableScales) },
  ];

  return (
    <div className={s.previewSwatches}>
      {swatches.map((sw) => (
        <span
          key={sw.role}
          className={s.previewSwatch}
          style={{ backgroundColor: sw.hex ?? 'var(--Surface-Ghost)' }}
          title={`${sw.role}: ${sw.hex ?? 'unresolved'}`}
        />
      ))}
    </div>
  );
}

// ─── Sub-brand role editor ────────────────────────────────────────────────────

function SubBrandRoleEditor({
  draft,
  availableScales,
  onChange,
  onDelete,
  isSaving,
  theme,
}: {
  draft: SubBrandDraft;
  availableScales: AvailableScale[];
  onChange: (updated: SubBrandDraft) => void;
  onDelete: () => void;
  isSaving: boolean;
  theme: 'light' | 'dark';
}) {
  const scaleOptions = useMemo(() => buildScaleOptions(availableScales), [availableScales]);

  // Active Brand BG step drives surface swatch computation
  const activeBrandBgStep = theme === 'dark'
    ? draft.brandBg.backgroundStep.dark
    : draft.brandBg.backgroundStep.light;

  // Compute swatch preview for a role using the new surface algorithm.
  // `anchorBoldToBaseStep`: Base Step is the authored anchor per role; generic `resolveSurface(bold)`
  // otherwise offsets when the page parent is fewer than 700 steps from base (e.g. yellow 2100 → ~1800 Bold).
  const computeSwatches = useCallback((scaleName: string, baseStep: number) => {
    const scale = availableScales.find(sc => sc.name.toLowerCase() === scaleName.toLowerCase());
    if (!scale?.colors) return null;
    const palette = buildPaletteFromScale(scale);
    if (Object.keys(palette).length === 0) return null;
    const scaleDef = buildScaleDefinition(scaleName, palette, baseStep, {
      anchorBoldToBaseStep: true,
    });
    const darkMode = theme === 'dark';
    const parentStep = darkMode ? 200 : 2500;
    const tokenSet = resolveTokenSet(scaleDef, parentStep, darkMode);
    return {
      default:  tokenSet.surfaces.default.hex,
      minimal:  tokenSet.surfaces.minimal.hex,
      subtle:   tokenSet.surfaces.subtle.hex,
      bold:     tokenSet.surfaces.bold.hex,
      elevated: tokenSet.surfaces.elevated.hex,
    };
  }, [availableScales, theme]);

  const renderSwatchPreview = (swatches: ReturnType<typeof computeSwatches>) => {
    if (!swatches) return null;
    return (
      <div className={s.swatchWrapper}>
        <div className={s.swatchContainer}>
          <div className={s.swatchRow}>
            {SURFACE_LABELS.map((label) => {
              const key = label.toLowerCase() as keyof typeof swatches;
              return (
                <div
                  key={label}
                  className={s.swatchSegment}
                  style={{ backgroundColor: swatches[key] }}
                />
              );
            })}
          </div>
        </div>
        <div className={s.swatchLabels}>
          {SURFACE_LABELS.map((label) => (
            <span key={label} className={s.swatchLabel}>{label}</span>
          ))}
        </div>
      </div>
    );
  };

  // The 4 roles — same order as AccentConfigEditor accent roles section
  const roles = [
    {
      label: 'Primary',
      scaleName: draft.primary.scaleName,
      baseStep: draft.primary.baseStep,
      onScaleChange: (v: string) => onChange({ ...draft, primary: { ...draft.primary, scaleName: v } }),
      onStepChange:  (v: number) => onChange({ ...draft, primary: { ...draft.primary, baseStep: v } }),
    },
    {
      label: 'Secondary',
      scaleName: draft.secondary.scaleName,
      baseStep: draft.secondary.baseStep,
      onScaleChange: (v: string) => onChange({ ...draft, secondary: { ...draft.secondary, scaleName: v } }),
      onStepChange:  (v: number) => onChange({ ...draft, secondary: { ...draft.secondary, baseStep: v } }),
    },
    {
      label: 'Sparkle',
      scaleName: draft.sparkle.scaleName,
      baseStep: draft.sparkle.baseStep,
      onScaleChange: (v: string) => onChange({ ...draft, sparkle: { ...draft.sparkle, scaleName: v } }),
      onStepChange:  (v: number) => onChange({ ...draft, sparkle: { ...draft.sparkle, baseStep: v } }),
    },
    {
      label: 'Brand BG',
      scaleName: draft.brandBg.scaleName,
      baseStep: activeBrandBgStep,
      onScaleChange: (v: string) => onChange({ ...draft, brandBg: { ...draft.brandBg, scaleName: v } }),
      onStepChange:  (v: number) => {
        const key = theme === 'dark' ? 'dark' : 'light';
        onChange({ ...draft, brandBg: { ...draft.brandBg, backgroundStep: { ...draft.brandBg.backgroundStep, [key]: v } } });
      },
    },
  ] as const;

  return (
    <div className={s.container}>
      <div className={s.section}>
        <div className={s.sectionTitle}>Color Roles</div>
        <div className={s.grid}>
          <div className={s.gridHeader}>Role</div>
          <div className={s.gridHeader}>Color Family</div>
          <div className={s.gridHeader}>Base Step</div>
          <div className={s.gridHeader}>Preview</div>

          {roles.map((role, index) => {
            const stepOpts = buildStepOptions(role.scaleName, availableScales);
            const swatches = computeSwatches(role.scaleName, role.baseStep);
            return (
              <React.Fragment key={role.label}>
                {index > 0 && <div className={s.gridRowDivider} />}
                <div className={s.gridCell}>
                  <span className={s.accentRoleBadge}>{role.label}</span>
                </div>
                <div className={s.gridCell}>
                  <Select
                    value={role.scaleName}
                    onChange={role.onScaleChange}
                    options={scaleOptions}
                    size="md"
                    aria-label={`${role.label} color family`}
                    searchable
                  />
                </div>
                <div className={s.gridCell}>
                  <Select
                    value={role.baseStep}
                    onChange={role.onStepChange}
                    options={stepOpts}
                    size="md"
                    aria-label={`${role.label} base step`}
                    searchable
                  />
                </div>
                <div className={s.gridCell}>
                  {renderSwatchPreview(swatches)}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={s.divider} />

      <div className={s.cardActions}>
        <Button
          attention="low"
          size="small"
          onPress={onDelete}
          disabled={isSaving}
        >
          Delete sub-brand
        </Button>
      </div>
    </div>
  );
}

// ─── Base brand read-only card ────────────────────────────────────────────────

function BaseBrandCard({
  brandName,
  availableScales,
  appearanceConfig,
  theme,
}: {
  brandName: string;
  availableScales: AvailableScale[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appearanceConfig: Record<string, any> | null | undefined;
  theme: 'light' | 'dark';
}) {
  const accents: Array<{ role: string; scaleName: string; baseStep: number }> =
    appearanceConfig?.accents ?? [];
  const bg = appearanceConfig?.background;

  const primaryAccent  = accents.find((a) => a.role === 'primary');
  const secondaryAccent = accents.find((a) => a.role === 'secondary');
  const sparkleAccent = accents.find((a) => a.role === 'sparkle');

  const bgStep = theme === 'dark'
    ? (bg?.backgroundStep?.dark ?? 200)
    : (bg?.backgroundStep?.light ?? 2500);

  const draft: SubBrandDraft | null = primaryAccent
    ? {
        id: null,
        name: brandName,
        slug: 'base',
        primary:    { scaleName: primaryAccent.scaleName,   baseStep: primaryAccent.baseStep },
        secondary:  secondaryAccent
          ? { scaleName: secondaryAccent.scaleName, baseStep: secondaryAccent.baseStep }
          : { scaleName: primaryAccent.scaleName,   baseStep: 1100 },
        sparkle:    sparkleAccent
          ? { scaleName: sparkleAccent.scaleName,  baseStep: sparkleAccent.baseStep }
          : { scaleName: primaryAccent.scaleName,   baseStep: 900 },
        brandBg: bg
          ? { scaleName: bg.scaleName, backgroundStep: bg.backgroundStep }
          : { scaleName: primaryAccent.scaleName,   backgroundStep: { light: 2500, dark: 200 } },
      }
    : null;

  const activeBrandBgStep = bgStep;

  /** Same surface preview as SubBrandRoleEditor — resolveTokenSet per role scale + base step */
  const computeSwatches = (scaleName: string, baseStep: number) => {
    const scale = availableScales.find((sc) => sc.name.toLowerCase() === scaleName.toLowerCase());
    if (!scale?.colors) return null;
    const palette = buildPaletteFromScale(scale);
    if (Object.keys(palette).length === 0) return null;
    const scaleDef = buildScaleDefinition(scaleName, palette, baseStep, {
      anchorBoldToBaseStep: true,
    });
    const darkMode = theme === 'dark';
    const parentStep = darkMode ? 200 : 2500;
    const tokenSet = resolveTokenSet(scaleDef, parentStep, darkMode);
    return {
      default: tokenSet.surfaces.default.hex,
      minimal: tokenSet.surfaces.minimal.hex,
      subtle: tokenSet.surfaces.subtle.hex,
      bold: tokenSet.surfaces.bold.hex,
      elevated: tokenSet.surfaces.elevated.hex,
    };
  };

  const roles = draft
    ? [
        { label: 'Primary',    scaleName: draft.primary.scaleName,    baseStep: draft.primary.baseStep },
        { label: 'Secondary',  scaleName: draft.secondary.scaleName,  baseStep: draft.secondary.baseStep },
        { label: 'Sparkle',    scaleName: draft.sparkle.scaleName,    baseStep: draft.sparkle.baseStep },
        { label: 'Brand BG', scaleName: draft.brandBg.scaleName, baseStep: activeBrandBgStep },
      ]
    : [];

  if (!draft) return null;

  return (
    <FoundationCard
      title={brandName}
      description="Base brand · read-only"
      collapsible
      defaultCollapsed
      actions={
        <SubBrandColorPreview
          draft={draft}
          availableScales={availableScales}
          theme={theme}
        />
      }
    >
      <div className={s.container}>
        <div className={s.section}>
          <div className={s.sectionTitle}>Color Roles</div>
          <div className={s.grid}>
            <div className={s.gridHeader}>Role</div>
            <div className={s.gridHeader}>Color Family</div>
            <div className={s.gridHeader}>Base Step</div>
            <div className={s.gridHeader}>Preview</div>

            {roles.map((role, index) => {
              const swatches = computeSwatches(role.scaleName, role.baseStep);
              return (
                <React.Fragment key={role.label}>
                  {index > 0 && <div className={s.gridRowDivider} />}
                  <div className={s.gridCell}>
                    <span className={s.accentRoleBadge}>{role.label}</span>
                  </div>
                  <div className={s.gridCell}>
                    <span style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Body-S-FontSize)' }}>
                      {role.scaleName || '—'}
                    </span>
                  </div>
                  <div className={s.gridCell}>
                    <span style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Body-S-FontSize)' }}>
                      {role.baseStep}
                    </span>
                  </div>
                  <div className={s.gridCell}>
                    {swatches && (
                      <div className={s.swatchWrapper}>
                        <div className={s.swatchContainer}>
                          <div className={s.swatchRow}>
                            {SURFACE_LABELS.map((label) => {
                              const key = label.toLowerCase() as 'default' | 'minimal' | 'subtle' | 'bold' | 'elevated';
                              return (
                                <div
                                  key={label}
                                  className={s.swatchSegment}
                                  style={{ backgroundColor: swatches[key] }}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className={s.swatchLabels}>
                          {SURFACE_LABELS.map((label) => (
                            <span key={label} className={s.swatchLabel}>{label}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </FoundationCard>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubBrandsContent() {
  const { currentBrand, theme } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  // ─── Convex ───────────────────────────────────────────────────────────
  const subBrandsData = useQuery(
    api.subBrandConfigs.getByParentBrand,
    brandId ? { parentBrandId: brandId } : 'skip',
  );

  const upsertSubBrand = useMutation(api.subBrandConfigs.upsert);
  const removeSubBrand = useMutation(api.subBrandConfigs.remove);

  // ─── Available scales (same pattern as AppearanceContent) ─────────────
  const foundationData = useFoundationData();
  const colorFoundation = foundationData?.color ?? undefined;
  const colorConfig = colorFoundation?.config;
  const presetCollectionId = colorConfig?.brandScales?.find(
    (sc: { source: string; presetCollectionId?: string }) => sc.source === 'preset' && sc.presetCollectionId,
  )?.presetCollectionId;

  const brandPresetSelection = useQuery(
    api.presetColorScales.getBrandSelection,
    brandId ? { brandId } : 'skip',
  );
  const directCollection = useQuery(
    api.presetColorScales.getCollection,
    presetCollectionId
      ? { collectionId: presetCollectionId as Id<'presetColorScaleCollections'> }
      : 'skip',
  );

  const availableScales = useMemo<AvailableScale[]>(() => {
    if (!colorConfig?.brandScales?.length) return [];

    const parseOklch = (oklch: string): string => {
      const match = oklch.match(/oklch\(\s*(\d*\.?\d+)(%?)\s+(\d*\.?\d+)\s+(\d*\.?\d+)/);
      if (!match) return '#808080';
      let l = parseFloat(match[1]);
      if (match[2] !== '%' && l <= 1) l = l * 100;
      return oklchToHex(l, parseFloat(match[3]), parseFloat(match[4]));
    };

    const scaleDataMap = new Map<string, { steps: Array<{ step: string; oklch: string }>; baseStep: string }>();
    if (directCollection?.scales) {
      for (const sc of directCollection.scales) {
        if (sc.steps?.length) scaleDataMap.set(sc.name.toLowerCase(), { steps: sc.steps, baseStep: sc.baseStep });
      }
    }
    if (brandPresetSelection?.selectedScales) {
      for (const sc of brandPresetSelection.selectedScales as Array<{ name: string; steps?: Array<{ step: string; oklch: string }>; baseStep?: string }>) {
        if (sc.steps?.length) scaleDataMap.set(sc.name.toLowerCase(), { steps: sc.steps, baseStep: sc.baseStep ?? '' });
      }
    }

    return colorConfig.brandScales
      .map((scale: { name: string; source: string; baseColor?: string; lightnessBias?: number }) => {
        const data = scaleDataMap.get(scale.name.toLowerCase());
        if (data?.steps?.length) {
          return {
            name: scale.name,
            steps: data.steps.map((st: { step: string }) => parseInt(st.step, 10)),
            colors: data.steps.map((st: { step: string; oklch: string }) => ({
              step: parseInt(st.step, 10),
              oklch: st.oklch,
              hex: parseOklch(st.oklch),
            })),
            baseStep: data.baseStep ? parseInt(data.baseStep, 10) : undefined,
          };
        }
        if (scale.source === 'custom' && scale.baseColor) {
          const generated = generateColorScale(scale.name, scale.baseColor, 'linear', scale.lightnessBias ?? 0);
          return {
            name: scale.name,
            steps: generated.steps.map((st: { step: number }) => st.step),
            colors: generated.steps.map((st: { step: number; oklch: string; hex: string }) => ({
              step: st.step,
              oklch: st.oklch,
              hex: st.hex,
            })),
            baseStep: generated.config.baseStep,
          };
        }
        return null;
      })
      .filter((sc: AvailableScale | null): sc is AvailableScale => sc !== null);
  }, [colorConfig, brandPresetSelection, directCollection]);

  // ─── Local drafts (keyed by sub-brand id) ────────────────────────────
  const [drafts, setDrafts] = useState<Record<string, SubBrandDraft>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const prevBrandIdRef = useRef(brandId);

  // Reset when brand changes
  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      setDrafts({});
      setIsCreating(false);
      setNewName('');
    }
  }, [brandId]);

  // Seed drafts from Convex (only for sub-brands not yet in local state)
  useEffect(() => {
    if (!subBrandsData) return;
    setDrafts((prev) => {
      const next: Record<string, SubBrandDraft> = { ...prev };
      for (const sub of subBrandsData) {
        if (!(sub._id in next)) {
          next[sub._id] = {
            id: sub._id,
            name: sub.name,
            slug: sub.slug,
            primary: sub.primary,
            secondary: sub.secondary,
            sparkle: sub.sparkle,
            brandBg: sub.brandBg,
          };
        }
      }
      return next;
    });
  }, [subBrandsData]);

  // ─── Auto-save (800 ms debounce per sub-brand) ────────────────────────
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const scheduleSave = useCallback((id: string, draft: SubBrandDraft) => {
    if (!brandId) return;
    if (saveTimersRef.current[id]) clearTimeout(saveTimersRef.current[id]);
    saveTimersRef.current[id] = setTimeout(async () => {
      setSavingIds((prev) => new Set(prev).add(id));
      try {
        await upsertSubBrand({
          id: draft.id ? (draft.id as Id<'subBrandConfigs'>) : undefined,
          parentBrandId: brandId,
          name: draft.name,
          slug: draft.slug,
          primary: draft.primary,
          secondary: draft.secondary,
          sparkle: draft.sparkle,
          brandBg: draft.brandBg,
        });
      } catch (err) {
        console.warn('[SubBrands] Auto-save failed:', err);
      } finally {
        setSavingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      }
    }, 800);
  }, [brandId, upsertSubBrand]);

  const handleDraftChange = useCallback((id: string, updated: SubBrandDraft) => {
    setDrafts((prev) => ({ ...prev, [id]: updated }));
    scheduleSave(id, updated);
  }, [scheduleSave]);

  const handleDelete = useCallback(async (id: string) => {
    if (saveTimersRef.current[id]) clearTimeout(saveTimersRef.current[id]);
    try {
      await removeSubBrand({ id: id as Id<'subBrandConfigs'> });
      setDrafts((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } catch (err) {
      console.warn('[SubBrands] Delete failed:', err);
    }
  }, [removeSubBrand]);

  const handleCreateNew = useCallback(async () => {
    if (!brandId || !newName.trim()) return;
    const slug = slugify(newName.trim());
    const defaults = makeDefaultDraft(availableScales);
    setSavingIds((prev) => new Set(prev).add('new'));
    try {
      const newId = await upsertSubBrand({
        parentBrandId: brandId,
        name: newName.trim(),
        slug,
        ...defaults,
      });
      setDrafts((prev) => ({
        ...prev,
        [newId as string]: {
          id: newId as string,
          name: newName.trim(),
          slug,
          ...defaults,
        },
      }));
      setIsCreating(false);
      setNewName('');
    } catch (err) {
      console.warn('[SubBrands] Create failed:', err);
    } finally {
      setSavingIds((prev) => { const s = new Set(prev); s.delete('new'); return s; });
    }
  }, [brandId, newName, availableScales, upsertSubBrand]);

  // ─── Render ───────────────────────────────────────────────────────────
  const isLoading = brandId != null && subBrandsData === undefined;
  const hasNoScales = availableScales.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Sub-brands</h1>
        <p className={styles.description}>
          Define theme variants of <strong>{currentBrand?.name}</strong>.
          Each sub-brand sets 4 color roles and inherits all other foundations from the parent brand.
        </p>
      </div>

      <div className={styles.content}>
        {isLoading && <PageSkeleton cards={1} />}

        {!isLoading && hasNoScales && (
          <FoundationCard
            title="Color Scales Required"
            description="Sub-brands depend on color scales being set up first."
          >
            <div style={{ padding: 'var(--Spacing-4-5)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
              <p style={{ color: 'var(--Text-Medium)', margin: 0 }}>
                Define at least one color scale in the Color foundation before creating sub-brands.
              </p>
            </div>
          </FoundationCard>
        )}

        {!isLoading && !hasNoScales && (
          <>
            {/* Base brand always at the top — read-only reference */}
            <BaseBrandCard
              brandName={currentBrand?.name ?? 'Base brand'}
              availableScales={availableScales}
              appearanceConfig={foundationData?.appearanceConfig}
              theme={theme}
            />

            {subBrandsData?.map((sub) => {
              const draft = drafts[sub._id];
              if (!draft) return null;
              return (
                <FoundationCard
                  key={sub._id}
                  title={draft.name || sub.name}
                  description={`Sub-brand · ${sub.slug}`}
                  collapsible
                  defaultCollapsed
                  actions={
                    <SubBrandColorPreview
                      draft={draft}
                      availableScales={availableScales}
                      theme={theme}
                    />
                  }
                >
                  <SubBrandRoleEditor
                    draft={draft}
                    availableScales={availableScales}
                    onChange={(updated) => handleDraftChange(sub._id, updated)}
                    onDelete={() => handleDelete(sub._id)}
                    isSaving={savingIds.has(sub._id)}
                    theme={theme}
                  />
                </FoundationCard>
              );
            })}

            {isCreating ? (
              <FoundationCard
                title="New Sub-brand"
                description="Define the 4 color roles for this sub-brand."
              >
                <div className={s.createForm}>
                  <InputField
                    placeholder="Sub-brand name (e.g. JioMart)"
                    value={newName}
                    onChange={setNewName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNew();
                      if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                    }}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                  />
                  <div className={s.createActions}>
                    <Button attention="low" size="small" onPress={() => { setIsCreating(false); setNewName(''); }}>
                      Cancel
                    </Button>
                    <Button
                      attention="high"
                      size="small"
                      onPress={handleCreateNew}
                      disabled={!newName.trim() || savingIds.has('new')}
                    >
                      {savingIds.has('new') ? 'Creating…' : 'Create'}
                    </Button>
                  </div>
                </div>
              </FoundationCard>
            ) : (
              <div className={s.addRow}>
                <Button attention="medium" size="small" onPress={() => setIsCreating(true)}>
                  + Add Sub-brand
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {savingIds.size > 0 && !savingIds.has('new') && (
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
          Saving…
        </div>
      )}
    </div>
  );
}
