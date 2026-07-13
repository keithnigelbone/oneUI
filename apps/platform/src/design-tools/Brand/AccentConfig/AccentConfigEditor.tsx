/**
 * AccentConfigEditor.tsx
 *
 * Table-based UI for configuring accent roles, neutral, and semantic colors.
 *
 * Three sections separated by dividers:
 * 1. Accent Count (1-4 brand accents) + Background + Accent Roles grid
 * 2. Neutral (toggle on/off, optional custom scale override)
 * 3. Semantic Colors (positive/negative/warning/informative, each toggleable)
 *
 * All role sections use a consistent 4-column grid (Role | Scale | Base Step | Preview).
 * Neutral and semantic rows show a Switch toggle in the Role column.
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { Switch } from '@oneui/ui/components/Switch';
import {
  buildPaletteFromScale,
} from '../../Foundations/Surfaces';
import type { AvailableScale } from '../../Foundations/Surfaces';
import { resolveTokenSet, buildScaleDefinition } from '@oneui/shared/engine';

const ACCENT_ROLES = ['primary', 'secondary', 'sparkle', 'brand-bg'] as const;
type AccentRoleId = typeof ACCENT_ROLES[number];
const ACCENT_ROLE_LABELS: Record<AccentRoleId, string> = {
  primary: 'Primary', secondary: 'Secondary', sparkle: 'Sparkle', 'brand-bg': 'Brand BG',
};
import {
  BRAND_ACCENT_ROLES,
  NEUTRAL_ROLE,
  SEMANTIC_ROLES,
  MAX_ROLE_COUNT,
  DEFAULT_BASE_STEP,
  EXTRA_ROLE_LABELS,
  splitAccents,
  mergeAccents,
} from './roleCategories';
import styles from './AccentConfigEditor.module.css';

// ============================================================================
// Types
// ============================================================================

export interface AccentConfigAccent {
  role: string;
  label: string;
  scaleName: string;
  baseStep: number;
}

export interface AccentConfigBackground {
  scaleName: string;
  backgroundStep: {
    light: number;
    dark: number;
    /** @deprecated V4 dropped dim mode — kept optional for backward compat with stored data */
    dim?: number;
  };
}

export interface AccentConfigLogo {
  scaleName: string;
  baseStep: number;
}

export interface AccentConfigMaterialOption {
  value: string;
  label: string;
  fill: string;
  text: string;
}

export interface AccentConfigEditorProps {
  /** Number of active accent roles (1-4) */
  accentCount: number;
  /** Callback when accent count changes */
  onAccentCountChange: (count: number) => void;
  /** Background configuration */
  background: AccentConfigBackground;
  /** Callback when background changes */
  onBackgroundChange: (background: AccentConfigBackground) => void;
  /** Accent configurations */
  accents: AccentConfigAccent[];
  /** Callback when accents change */
  onAccentsChange: (accents: AccentConfigAccent[]) => void;
  /** Optional logo color override — null when disabled (logo falls back to Primary-Bold) */
  logo: AccentConfigLogo | null;
  /** Callback when logo changes (null = disabled) */
  onLogoChange: (logo: AccentConfigLogo | null) => void;
  /** Available color scales from the brand's color foundation */
  availableScales: AvailableScale[];
  /** Current theme for preview swatches (default: 'light') */
  theme?: 'light' | 'dark';
  /**
   * When true, the scale/family selectors are disabled (read-only).
   * Used when editing a sub-brand where the color families are locked.
   */
  readOnlyScales?: boolean;
  /**
   * When true, the accent count toggle, neutral section, and semantic section
   * are all locked (read-only). Used in sub-brand mode where neutral/semantic
   * roles are inherited from the parent brand and cannot be changed per sub-brand.
   */
  readOnlyExtras?: boolean;
  /**
   * When provided, overrides the scale options shown in brand accent pickers only.
   * Neutral and semantic pickers always use the full availableScales list.
   * Used in sub-brand mode to restrict brand accent pickers to the 4 sub-brand scales.
   */
  subBrandScaleOptions?: SelectOption<string>[];
  /** Active material options shown inside role/logo scale dropdowns. */
  materialOptions?: AccentConfigMaterialOption[];
  /** Per target material assignments, keyed by role id or `logo`. */
  materialAssignments?: Partial<Record<string, string>>;
  /** Callback when role/logo material assignments change. */
  onMaterialAssignmentsChange?: (assignments: Partial<Record<string, string>>) => void;
}

// ============================================================================
// Constants
// ============================================================================

const ACCENT_COUNT_OPTIONS = ['1', '2', '3', '4'];
const MATERIAL_VALUE_PREFIX = 'material-';

const STEP_VALUES = [
  200, 300, 400, 500, 600, 700, 800, 900, 1000,
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900,
  2000, 2100, 2200, 2300, 2400, 2500,
];

const SURFACE_LABELS = ['Default', 'Minimal', 'Subtle', 'Bold', 'Elevated'] as const;

// ============================================================================
// Helpers
// ============================================================================

/** Build step options with color swatches from a scale */
function buildStepOptionsWithColors(
  scaleName: string,
  availableScales: AvailableScale[],
): SelectOption<number>[] {
  const scale = availableScales.find(
    s => s.name.toLowerCase() === scaleName.toLowerCase()
  );
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

/** Get a representative color for a scale using its baseStep (or middle entry as fallback) */
function getScaleRepColor(scale: AvailableScale): string | undefined {
  if (!scale.colors?.length) return undefined;
  const target = scale.baseStep ?? 1300;
  const entry = scale.colors.find(c => c.step === target)
    ?? scale.colors[Math.floor(scale.colors.length / 2)];
  return entry?.hex;
}

/** Find a default scale name — prefer "Neutral" for neutral role, else first available */
function findDefaultScale(availableScales: AvailableScale[], preferName?: string): string {
  if (preferName) {
    const found = availableScales.find(
      s => s.name.toLowerCase() === preferName.toLowerCase()
    );
    if (found) return found.name;
  }
  return availableScales[0]?.name ?? '';
}

// ============================================================================
// Component
// ============================================================================

export function AccentConfigEditor({
  accentCount,
  onAccentCountChange,
  background,
  onBackgroundChange,
  accents,
  onAccentsChange,
  logo,
  onLogoChange,
  availableScales,
  theme = 'light',
  readOnlyScales = false,
  readOnlyExtras = false,
  subBrandScaleOptions,
  materialOptions = [],
  materialAssignments = {},
  onMaterialAssignmentsChange,
}: AccentConfigEditorProps) {
  // Split accents into 3 categories
  const { brandAccents, neutralAccent, semanticAccents } = useMemo(
    () => splitAccents(accents),
    [accents]
  );

  const totalRoleCount = accents.length;

  // Build scale options with representative color swatches
  const scaleOptions = useMemo<SelectOption<string>[]>(() => {
    return availableScales.map(s => ({
      value: s.name,
      label: s.name,
      color: getScaleRepColor(s),
    }));
  }, [availableScales]);

  const materialSelectOptions = useMemo<SelectOption<string>[]>(() => (
    materialOptions.map((material) => ({
      value: `${MATERIAL_VALUE_PREFIX}${material.value}`,
      label: material.label,
      swatch: material.fill,
    }))
  ), [materialOptions]);

  const buildScaleOptionsWithMaterials = useCallback((options: SelectOption<string>[]) => (
    materialSelectOptions.length > 0 ? [...options, ...materialSelectOptions] : options
  ), [materialSelectOptions]);

  // Build step options per scale (background + each accent)
  const bgStepOptions = useMemo(
    () => buildStepOptionsWithColors(background.scaleName, availableScales),
    [background.scaleName, availableScales]
  );

  const accentStepOptions = useMemo(
    () => brandAccents.map(a => buildStepOptionsWithColors(a.scaleName, availableScales)),
    [brandAccents, availableScales]
  );

  // Resolve the background step for the active theme (for swatch previews)
  const activeBackgroundStep = theme === 'dark'
    ? background.backgroundStep.dark
    : background.backgroundStep.light;

  // ── Emit merged accents ──────────────────────────────────────────────

  const emitMerged = useCallback((
    brand: AccentConfigAccent[],
    neutral: AccentConfigAccent | null,
    semantic: AccentConfigAccent[],
  ) => {
    const merged = mergeAccents(brand, neutral, semantic);
    onAccentsChange(merged);
    // In readOnlyExtras mode (sub-brand), neutral/semantic are inherited — only count brand accents
    onAccentCountChange(readOnlyExtras ? brand.length : merged.length);
  }, [onAccentsChange, onAccentCountChange, readOnlyExtras]);

  // ── Brand accent count change ────────────────────────────────────────

  const handleAccentCountChange = (countStr: string) => {
    const newCount = parseInt(countStr, 10);
    const newBrand = [...brandAccents];

    while (newBrand.length < newCount) {
      const role = ACCENT_ROLES[newBrand.length];
      newBrand.push({
        role,
        label: ACCENT_ROLE_LABELS[role],
        scaleName: availableScales[0]?.name ?? '',
        baseStep: DEFAULT_BASE_STEP,
      });
    }
    if (newBrand.length > newCount) {
      newBrand.length = newCount;
    }

    emitMerged(newBrand, neutralAccent, semanticAccents);
  };

  // ── Background handlers ──────────────────────────────────────────────

  const handleBackgroundScaleChange = (scaleName: string) => {
    onBackgroundChange({ ...background, scaleName });
  };

  const handleBackgroundStepChange = (mode: 'light' | 'dark', step: number) => {
    onBackgroundChange({
      ...background,
      backgroundStep: { ...background.backgroundStep, [mode]: step },
    });
  };

  // ── Brand accent field change ────────────────────────────────────────

  const handleAccentChange = (index: number, field: 'scaleName' | 'baseStep', value: string | number) => {
    const newBrand = [...brandAccents];
    newBrand[index] = { ...newBrand[index], [field]: value };
    emitMerged(newBrand, neutralAccent, semanticAccents);
  };

  const handleMaterialSelectionChange = (
    target: string,
    selectedValue: string,
    onScaleChange: (scaleName: string) => void,
  ) => {
    if (selectedValue.startsWith(MATERIAL_VALUE_PREFIX)) {
      const materialValue = selectedValue.slice(MATERIAL_VALUE_PREFIX.length);
      onMaterialAssignmentsChange?.({
        ...materialAssignments,
        [target]: materialValue,
      });
      return;
    }

    if (materialAssignments[target]) {
      const nextAssignments = { ...materialAssignments };
      delete nextAssignments[target];
      onMaterialAssignmentsChange?.(nextAssignments);
    }
    onScaleChange(selectedValue);
  };

  const getScaleSelectValue = (target: string, scaleName: string): string => {
    const materialValue = materialAssignments[target];
    const hasActiveMaterial = materialValue && materialOptions.some((option) => option.value === materialValue);
    return hasActiveMaterial ? `${MATERIAL_VALUE_PREFIX}${materialValue}` : scaleName;
  };

  const getAssignedMaterial = (target: string): AccentConfigMaterialOption | undefined => {
    const materialValue = materialAssignments[target];
    return materialValue ? materialOptions.find((option) => option.value === materialValue) : undefined;
  };

  const buildDisabledMaterialStepOption = (baseStep: number): SelectOption<number>[] => [
    { value: baseStep, label: 'Not applicable' },
  ];

  // ── Neutral toggle ──────────────────────────────────────────────────

  const handleNeutralToggle = (checked: boolean) => {
    if (checked) {
      const newNeutral: AccentConfigAccent = {
        role: NEUTRAL_ROLE,
        label: EXTRA_ROLE_LABELS[NEUTRAL_ROLE],
        scaleName: findDefaultScale(availableScales, 'Neutral'),
        baseStep: DEFAULT_BASE_STEP,
      };
      emitMerged(brandAccents, newNeutral, semanticAccents);
    } else {
      emitMerged(brandAccents, null, semanticAccents);
    }
  };

  const handleNeutralChange = (field: 'scaleName' | 'baseStep', value: string | number) => {
    if (!neutralAccent) return;
    const updated = { ...neutralAccent, [field]: value };
    emitMerged(brandAccents, updated, semanticAccents);
  };

  // ── Semantic role toggle ─────────────────────────────────────────────

  const handleSemanticToggle = (role: string, checked: boolean) => {
    let newSemantic = [...semanticAccents];
    if (checked) {
      newSemantic.push({
        role,
        label: EXTRA_ROLE_LABELS[role] ?? role,
        scaleName: availableScales[0]?.name ?? '',
        baseStep: DEFAULT_BASE_STEP,
      });
    } else {
      newSemantic = newSemantic.filter(a => a.role !== role);
    }
    emitMerged(brandAccents, neutralAccent, newSemantic);
  };

  const handleSemanticChange = (role: string, field: 'scaleName' | 'baseStep', value: string | number) => {
    const newSemantic = semanticAccents.map(a =>
      a.role === role ? { ...a, [field]: value } : a
    );
    emitMerged(brandAccents, neutralAccent, newSemantic);
  };

  // ── Logo handlers ───────────────────────────────────────────────────

  const handleLogoToggle = (checked: boolean) => {
    if (checked) {
      onLogoChange({
        scaleName: availableScales[0]?.name ?? '',
        baseStep: DEFAULT_BASE_STEP,
      });
    } else {
      onLogoChange(null);
    }
  };

  const handleLogoChange = (field: 'scaleName' | 'baseStep', value: string | number) => {
    if (!logo) return;
    onLogoChange({ ...logo, [field]: value });
  };

  // Logo preview resolves directly from the scale's color entry at baseStep
  // (no surface stacking — it's a single foreground color).
  const logoPreviewColor = useMemo(() => {
    if (!logo) return undefined;
    const scale = availableScales.find(
      s => s.name.toLowerCase() === logo.scaleName.toLowerCase()
    );
    return scale?.colors?.find(c => c.step === logo.baseStep)?.hex;
  }, [logo, availableScales]);

  // ── Swatch previews (theme-reactive) ─────────────────────────────────

  const computeSwatches = useCallback((accent: AccentConfigAccent) => {
    const scale = availableScales.find(
      s => s.name.toLowerCase() === accent.scaleName.toLowerCase()
    );
    if (!scale?.colors) return null;

    const palette = buildPaletteFromScale(scale);
    if (Object.keys(palette).length === 0) return null;

    const scaleDef = buildScaleDefinition(accent.scaleName, palette, scale.baseStep ?? accent.baseStep);
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
  }, [availableScales, theme]);

  const brandSwatches = useMemo(
    () => brandAccents.map(computeSwatches),
    [brandAccents, computeSwatches]
  );

  const neutralSwatches = useMemo(
    () => neutralAccent ? computeSwatches(neutralAccent) : null,
    [neutralAccent, computeSwatches]
  );

  const semanticSwatchMap = useMemo(
    () => Object.fromEntries(
      semanticAccents.map(a => [a.role, computeSwatches(a)])
    ),
    [semanticAccents, computeSwatches]
  );

  // Helper: can add more roles?
  const canAddRole = totalRoleCount < MAX_ROLE_COUNT;

  // ── Render helpers ──────────────────────────────────────────────────

  const renderLogoPreview = (hex: string | undefined) => {
    if (!hex) return null;
    return (
      <div className={styles.swatchWrapper}>
        <div className={styles.swatchContainer}>
          <div className={styles.swatchRow}>
            <div
              className={styles.swatchSegment}
              title="Logo"
              aria-label="Logo color preview"
              style={{ backgroundColor: hex }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMaterialPreview = (material: AccentConfigMaterialOption | undefined) => {
    if (!material) return null;
    return (
      <div className={styles.swatchWrapper}>
        <div
          className={styles.materialSwatch}
          style={{
            '--material-fill': material.fill,
            '--material-text': material.text,
          } as React.CSSProperties}
          title={material.label}
          aria-label={`${material.label} material preview`}
        >
          {material.label}
        </div>
      </div>
    );
  };

  const renderSwatchPreview = (swatches: ReturnType<typeof computeSwatches>) => {
    if (!swatches) return null;
    return (
      <div className={styles.swatchWrapper}>
        <div className={styles.swatchContainer}>
          <div className={styles.swatchRow}>
            {SURFACE_LABELS.map((label) => {
              const key = label.toLowerCase() as keyof typeof swatches;
              return (
                <div
                  key={label}
                  className={styles.swatchSegment}
                  title={label}
                  aria-label={`${label} surface preview`}
                  style={{ backgroundColor: swatches[key] }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* ── Accent Count ──────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Accent Count</div>
        <div className={styles.accentCountRow}>
          <ToggleGroup
            value={[String(brandAccents.length)]}
            onValueChange={(values) => {
              if (!readOnlyExtras && values[0]) handleAccentCountChange(values[0]);
            }}
            size="large"
            aria-label="Number of accent colors"
            disabled={readOnlyExtras}
          >
            {ACCENT_COUNT_OPTIONS.map((v) => (
              <ToggleGroup.Item key={v} value={v}>{v}</ToggleGroup.Item>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Background ────────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Background</div>
        <div className={styles.grid3}>
          <div className={styles.gridHeader}>Scale</div>
          <div className={styles.gridHeader}>Light Step</div>
          <div className={styles.gridHeader}>Dark Step</div>
          <div className={styles.gridCell}>
            <Select
              value={background.scaleName}
              onChange={handleBackgroundScaleChange}
              options={subBrandScaleOptions ?? scaleOptions}
              size="md"
              aria-label="Background scale"
              searchable
              disabled={readOnlyScales}
            />
          </div>
          <div className={styles.gridCell}>
            <Select
              value={background.backgroundStep.light}
              onChange={(v) => handleBackgroundStepChange('light', v)}
              options={bgStepOptions}
              size="md"
              aria-label="Light mode background step"
              searchable
            />
          </div>
          <div className={styles.gridCell}>
            <Select
              value={background.backgroundStep.dark}
              onChange={(v) => handleBackgroundStepChange('dark', v)}
              options={bgStepOptions}
              size="md"
              aria-label="Dark mode background step"
              searchable
            />
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Logo</div>
        <div className={styles.grid}>
          <div className={styles.gridHeader}>Role</div>
          <div className={styles.gridHeader}>Scale</div>
          <div className={styles.gridHeader}>Base Step</div>
          <div className={styles.gridHeader}>Preview</div>
          <div className={styles.gridCell}>
            <Switch
              checked={logo !== null}
              onCheckedChange={handleLogoToggle}
              size="l"
              disabled={readOnlyExtras}
            >
              Logo
            </Switch>
          </div>
          {logo ? (
            <>
              {(() => {
                const assignedMaterial = getAssignedMaterial('logo');
                return (
                  <>
              <div className={styles.gridCell}>
                <Select
                  value={getScaleSelectValue('logo', logo.scaleName)}
                  onChange={(v) => handleMaterialSelectionChange('logo', v, (scaleName) => handleLogoChange('scaleName', scaleName))}
                  options={buildScaleOptionsWithMaterials(scaleOptions)}
                  size="md"
                  aria-label="Logo scale"
                  searchable
                  disabled={readOnlyExtras}
                />
              </div>
              <div className={styles.gridCell}>
                <Select
                  value={logo.baseStep}
                  onChange={(v) => handleLogoChange('baseStep', v)}
                  options={assignedMaterial
                    ? buildDisabledMaterialStepOption(logo.baseStep)
                    : buildStepOptionsWithColors(logo.scaleName, availableScales)}
                  size="md"
                  aria-label="Logo base step"
                  searchable
                  disabled={readOnlyExtras || !!assignedMaterial}
                />
              </div>
              <div className={styles.gridCell}>
                {renderMaterialPreview(assignedMaterial) ?? renderLogoPreview(logoPreviewColor)}
              </div>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              <div className={styles.gridCell}>
                <span className={styles.hintText}>Falls back to Primary-Bold</span>
              </div>
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
            </>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Accent Roles ──────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Accent Roles</div>
        <div className={styles.grid}>
          <div className={styles.gridHeader}>Role</div>
          <div className={styles.gridHeader}>Scale</div>
          <div className={styles.gridHeader}>Base Step</div>
          <div className={styles.gridHeader}>Preview</div>
          {brandAccents.map((accent, index) => {
            const stepOpts = accentStepOptions[index] ?? STEP_VALUES.map(s => ({ value: s, label: String(s) }));
            const swatches = brandSwatches[index];
            const assignedMaterial = getAssignedMaterial(accent.role);
            return (
              <React.Fragment key={accent.role}>
                {index > 0 && <div className={styles.gridRowDivider} />}
                <div className={styles.gridCell}>
                  <span className={styles.accentRoleBadge}>{accent.label}</span>
                </div>
                <div className={styles.gridCell}>
                  <Select
                    value={getScaleSelectValue(accent.role, accent.scaleName)}
                    onChange={(v) => handleMaterialSelectionChange(accent.role, v, (scaleName) => handleAccentChange(index, 'scaleName', scaleName))}
                    options={buildScaleOptionsWithMaterials(subBrandScaleOptions ?? scaleOptions)}
                    size="md"
                    aria-label={`${accent.label} scale`}
                    searchable
                    disabled={readOnlyScales}
                  />
                </div>
                <div className={styles.gridCell}>
                  <Select
                    value={accent.baseStep}
                    onChange={(v) => handleAccentChange(index, 'baseStep', v)}
                    options={assignedMaterial
                      ? buildDisabledMaterialStepOption(accent.baseStep)
                      : stepOpts}
                    size="md"
                    aria-label={`${accent.label} base step`}
                    searchable
                    disabled={!!assignedMaterial}
                  />
                </div>
                <div className={styles.gridCell}>
                  {renderMaterialPreview(assignedMaterial) ?? renderSwatchPreview(swatches)}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Neutral ────────────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Neutral</div>
        <div className={styles.grid}>
          <div className={styles.gridHeader}>Role</div>
          <div className={styles.gridHeader}>Scale</div>
          <div className={styles.gridHeader}>Base Step</div>
          <div className={styles.gridHeader}>Preview</div>
          <div className={styles.gridCell}>
            <Switch
              checked={neutralAccent !== null}
              onCheckedChange={handleNeutralToggle}
              size="l"
              disabled={readOnlyExtras || (!canAddRole && neutralAccent === null)}
            >
              Neutral
            </Switch>
          </div>
          {neutralAccent ? (
            <>
              {(() => {
                const assignedMaterial = getAssignedMaterial(neutralAccent.role);
                return (
                  <>
              <div className={styles.gridCell}>
                <Select
                  value={getScaleSelectValue(neutralAccent.role, neutralAccent.scaleName)}
                  onChange={(v) => handleMaterialSelectionChange(neutralAccent.role, v, (scaleName) => handleNeutralChange('scaleName', scaleName))}
                  options={buildScaleOptionsWithMaterials(scaleOptions)}
                  size="md"
                  aria-label="Neutral scale"
                  searchable
                  disabled={readOnlyExtras}
                />
              </div>
              <div className={styles.gridCell}>
                <Select
                  value={neutralAccent.baseStep}
                  onChange={(v) => handleNeutralChange('baseStep', v)}
                  options={assignedMaterial
                    ? buildDisabledMaterialStepOption(neutralAccent.baseStep)
                    : buildStepOptionsWithColors(neutralAccent.scaleName, availableScales)}
                  size="md"
                  aria-label="Neutral base step"
                  searchable
                  disabled={readOnlyExtras || !!assignedMaterial}
                />
              </div>
              <div className={styles.gridCell}>
                {renderMaterialPreview(assignedMaterial) ?? renderSwatchPreview(neutralSwatches)}
              </div>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              <div className={styles.gridCell}>
                <span className={styles.hintText}>Auto-generated from built-in scale</span>
              </div>
              <div className={styles.gridCell} />
              <div className={styles.gridCell} />
            </>
          )}
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Semantic Colors ─────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Semantic Colors</div>
        <div className={styles.grid}>
          <div className={styles.gridHeader}>Role</div>
          <div className={styles.gridHeader}>Scale</div>
          <div className={styles.gridHeader}>Base Step</div>
          <div className={styles.gridHeader}>Preview</div>
          {SEMANTIC_ROLES.map((role, index) => {
            const accent = semanticAccents.find(a => a.role === role);
            const isEnabled = accent != null;
            const label = EXTRA_ROLE_LABELS[role] ?? role;
            const assignedMaterial = getAssignedMaterial(role);

            return (
              <React.Fragment key={role}>
                {index > 0 && <div className={styles.gridRowDivider} />}
                <div className={styles.gridCell}>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleSemanticToggle(role, checked)}
                    size="l"
                    disabled={readOnlyExtras || (!canAddRole && !isEnabled)}
                  >
                    {label}
                  </Switch>
                </div>
                {isEnabled && accent ? (
                  <>
                    <div className={styles.gridCell}>
                      <Select
                        value={getScaleSelectValue(role, accent.scaleName)}
                        onChange={(v) => handleMaterialSelectionChange(role, v, (scaleName) => handleSemanticChange(role, 'scaleName', scaleName))}
                        options={buildScaleOptionsWithMaterials(scaleOptions)}
                        size="md"
                        aria-label={`${label} scale`}
                        searchable
                        disabled={readOnlyExtras}
                      />
                    </div>
                    <div className={styles.gridCell}>
                      <Select
                        value={accent.baseStep}
                        onChange={(v) => handleSemanticChange(role, 'baseStep', v)}
                        options={assignedMaterial
                          ? buildDisabledMaterialStepOption(accent.baseStep)
                          : buildStepOptionsWithColors(accent.scaleName, availableScales)}
                        size="md"
                        aria-label={`${label} base step`}
                        searchable
                        disabled={readOnlyExtras || !!assignedMaterial}
                      />
                    </div>
                    <div className={styles.gridCell}>
                      {renderMaterialPreview(assignedMaterial) ?? renderSwatchPreview(semanticSwatchMap[role])}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.gridCell} />
                    <div className={styles.gridCell} />
                    <div className={styles.gridCell} />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
