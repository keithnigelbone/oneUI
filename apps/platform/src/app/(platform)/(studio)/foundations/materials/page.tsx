'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  buildMetallicFillGradient,
  buildMetallicStrokeGradient,
  buildAvailableScales,
  DEFAULT_METALLIC_PRESETS,
  getMetallicTokenLabel,
  getMetallicVariantSegments,
  MAX_METALLIC_VARIANTS,
  normalizeActiveMetallicMap,
  normalizeMetallicMaterials,
  METALLIC_PRESETS,
  METALLIC_PROPERTIES,
  VISIBLE_METALLIC_PRESETS,
  type MetallicConfig,
  type MetallicGradientType,
  type MetallicMaterial,
  type MetallicMaterialsConfig,
  type MetallicPresetName,
  type MetallicProperty,
  type MetallicVariant,
  type SurfaceToken,
  type VisibleMetallicPresetName,
} from '@oneui/shared/engine';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Divider } from '@oneui/ui/components/Divider';
import { Input } from '@oneui/ui/components/Input';
import { Logo } from '@oneui/ui/components/Logo';
import { Select, type SelectOption } from '@oneui/ui/components/Select';
import { Surface } from '@oneui/ui/components/Surface';
import { Switch } from '@oneui/ui/components/Switch';
import { Tabs } from '@oneui/ui/components/Tabs';
import { FoundationCard, SliderControl } from '@/design-tools/Foundations/shared';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import foundationStyles from '../foundation.module.css';
import styles from './MaterialsPage.module.css';

type MaterialMode = 'solid' | 'transparent';
type MediaContext = 'dynamic' | 'dark' | 'light';
type MaterialsTab = 'material' | 'metals' | 'effects' | 'tokens';

interface MaterialsFoundationConfig {
  version: 1;
  algorithm: 'oneui-material-media-v1';
  capabilities: {
    materialModes: MaterialMode[];
    mediaContexts: MediaContext[];
    surfaceModes: SurfaceToken[];
  };
  defaultMaterialMode: MaterialMode;
  defaultMediaContext: MediaContext;
  effectsSource: 'materialConfigs';
  activeMetals: ActiveMetallicMap;
  materialAssignments?: Partial<Record<string, VisibleMetallicPresetName>>;
  subBrandMaterialAssignments?: Record<string, Partial<Record<string, VisibleMetallicPresetName>>>;
  metallic?: MetallicOverrides;
}

interface MaterialEffectsConfig {
  translucent: {
    light: { minimal: number; subtle: number; moderate: number; heavy: number };
    dark: { minimal: number; subtle: number; moderate: number; heavy: number };
  };
  frosted: {
    blur: { ultraThin: number; thin: number; regular: number; thick: number; ultraThick: number };
    backgroundOpacity: { ultraThin: number; thin: number; regular: number; thick: number; ultraThick: number };
  };
  glass: {
    blur: { regular: number; clear: number };
    saturation: { regular: number; clear: number };
    highlightIntensity: { minimal: number; moderate: number; strong: number };
    tintOpacity: { light: number; dark: number };
  };
  metallic: MetallicMaterialsConfig;
}

interface MaterialEffectsDocument extends MaterialEffectsConfig {
  _id: Id<'materialConfigs'>;
}

interface BrandColorOption {
  id: string;
  label: string;
  value: string;
  scaleName: string;
  stepLabel: string;
}

type MetallicOverrides = Partial<Record<MetallicPresetName, Partial<MetallicConfig[MetallicPresetName]>>>;
type ActiveMetallicMap = Record<VisibleMetallicPresetName, boolean>;
type MetallicVariantPayload = { id: string; name: string } & Record<MetallicProperty, string> & {
  gradientType: MetallicGradientType;
  gradientAngle: number;
};
type MetallicMaterialPayload = { variants: MetallicVariantPayload[] };

type MaterialEffectsTab = 'translucent' | 'frosted' | 'glass';
type TranslucentTone = 'light' | 'dark';
type TranslucentIntensity = 'minimal' | 'subtle' | 'moderate' | 'heavy';
type FrostedIntensity = 'ultraThin' | 'thin' | 'regular' | 'thick' | 'ultraThick';
type GlassPairKey = 'regular' | 'clear';
type GlassHighlightKey = 'minimal' | 'moderate' | 'strong';

const MATERIAL_MODES: MaterialMode[] = ['solid', 'transparent'];
const MEDIA_CONTEXTS: MediaContext[] = ['dynamic', 'dark', 'light'];
const SURFACE_MODES: SurfaceToken[] = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'blend',
];

const DEFAULT_ACTIVE_METALS: ActiveMetallicMap = {
  bronze: true,
  silver: true,
  gold: true,
  custom: false,
};

const DEFAULT_MATERIALS_CONFIG: MaterialsFoundationConfig = {
  version: 1,
  algorithm: 'oneui-material-media-v1',
  capabilities: {
    materialModes: MATERIAL_MODES,
    mediaContexts: MEDIA_CONTEXTS,
    surfaceModes: SURFACE_MODES,
  },
  defaultMaterialMode: 'solid',
  defaultMediaContext: 'dynamic',
  effectsSource: 'materialConfigs',
  activeMetals: DEFAULT_ACTIVE_METALS,
};

const MATERIAL_TABS: Array<{ id: MaterialsTab; label: string }> = [
  { id: 'material', label: 'Material & Media' },
  { id: 'metals', label: 'Metals' },
  { id: 'effects', label: 'Effects' },
  { id: 'tokens', label: 'Tokens' },
];

const EFFECT_TABS: Array<{ id: MaterialEffectsTab; label: string }> = [
  { id: 'translucent', label: 'Translucent' },
  { id: 'frosted', label: 'Frosted' },
  { id: 'glass', label: 'Glass' },
];

const TRANSLUCENT_INTENSITIES: TranslucentIntensity[] = ['minimal', 'subtle', 'moderate', 'heavy'];
const FROSTED_INTENSITIES: FrostedIntensity[] = ['ultraThin', 'thin', 'regular', 'thick', 'ultraThick'];
const GLASS_PAIR_KEYS: GlassPairKey[] = ['regular', 'clear'];
const GLASS_HIGHLIGHT_KEYS: GlassHighlightKey[] = ['minimal', 'moderate', 'strong'];
const CUSTOM_COLOR_VALUE = '__custom_override__';
const METALLIC_GRADIENT_TYPES = ['linear', 'radial', 'conic'] as const satisfies readonly MetallicGradientType[];
const GRADIENT_TYPE_OPTIONS: SelectOption<MetallicGradientType>[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];
const GRADIENT_DIRECTION_OPTIONS: SelectOption<number>[] = [
  { value: 135, label: 'Diagonal down' },
  { value: 45, label: 'Diagonal up' },
  { value: 90, label: 'Left to right' },
  { value: 270, label: 'Right to left' },
  { value: 180, label: 'Top to bottom' },
  { value: 0, label: 'Bottom to top' },
  { value: 225, label: 'Diagonal back' },
  { value: 315, label: 'Diagonal forward' },
];
const METALLIC_TOKEN_SUFFIXES = [
  { suffix: 'Shadow', label: 'Shadow stop' },
  { suffix: 'BaseDark', label: 'Base dark stop' },
  { suffix: 'Base', label: 'Base stop' },
  { suffix: 'BaseLight', label: 'Base light stop' },
  { suffix: 'Highlight', label: 'Highlight stop' },
  { suffix: 'GradientType', label: 'Gradient style' },
  { suffix: 'GradientAngle', label: 'Gradient direction' },
  { suffix: 'Fill', label: 'Surface fill' },
  { suffix: 'Stroke', label: 'Image stroke' },
  { suffix: 'StrokeColor', label: 'Stroke fallback' },
  { suffix: 'Text', label: 'Readable text' },
  { suffix: 'Gradient', label: 'Legacy alias' },
] as const;

const EFFECT_LABELS: Record<string, string> = {
  minimal: 'Minimal',
  subtle: 'Subtle',
  moderate: 'Moderate',
  heavy: 'Heavy',
  ultraThin: 'Ultra thin',
  thin: 'Thin',
  regular: 'Regular',
  thick: 'Thick',
  ultraThick: 'Ultra thick',
  clear: 'Clear',
  strong: 'Strong',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  platinum: 'Platinum',
  roseGold: 'Rose gold',
  custom: 'Custom material',
  shadow: 'Shadow',
  baseDark: 'Base dark',
  base: 'Base',
  baseLight: 'Base light',
  highlight: 'Highlight',
};

const MEDIA_COPY: Record<MediaContext, { label: string; description: string }> = {
  dynamic: {
    label: 'Dynamic',
    description: 'Unknown imagery, video, or mixed luminance.',
  },
  dark: {
    label: 'Dark',
    description: 'Known dark media where lighter overlays carry the content.',
  },
  light: {
    label: 'Light',
    description: 'Known light media where darker overlays carry the content.',
  },
};

function getMetalTokenPrefix(preset: MetallicPresetName): string {
  return `--Material-Metallic-${getMetallicTokenLabel(preset)}`;
}

function getBrandInitials(name: string | undefined): string {
  if (!name) return 'UI';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'UI';
}

function isMaterialMode(value: unknown): value is MaterialMode {
  return value === 'solid' || value === 'transparent';
}

function isMediaContext(value: unknown): value is MediaContext {
  return value === 'dynamic' || value === 'dark' || value === 'light';
}

function normalizeMaterialsConfig(config: unknown): MaterialsFoundationConfig {
  if (!config || typeof config !== 'object') return DEFAULT_MATERIALS_CONFIG;
  const source = config as Partial<MaterialsFoundationConfig>;
  const activeMetals = normalizeActiveMetallicMap(source);

  return {
    ...DEFAULT_MATERIALS_CONFIG,
    defaultMaterialMode: isMaterialMode(source.defaultMaterialMode)
      ? source.defaultMaterialMode
      : DEFAULT_MATERIALS_CONFIG.defaultMaterialMode,
    defaultMediaContext: isMediaContext(source.defaultMediaContext)
      ? source.defaultMediaContext
      : DEFAULT_MATERIALS_CONFIG.defaultMediaContext,
    capabilities: DEFAULT_MATERIALS_CONFIG.capabilities,
    effectsSource: 'materialConfigs',
    activeMetals: {
      ...DEFAULT_ACTIVE_METALS,
      ...(activeMetals ?? {}),
    },
    materialAssignments: (source as { materialAssignments?: MaterialsFoundationConfig['materialAssignments'] }).materialAssignments,
    subBrandMaterialAssignments: (source as { subBrandMaterialAssignments?: MaterialsFoundationConfig['subBrandMaterialAssignments'] }).subBrandMaterialAssignments,
    metallic: normalizeMetallicOverrides((source as { metallic?: unknown }).metallic),
  };
}

function normalizeMetallicOverrides(input: unknown): MetallicOverrides | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const source = input as Record<string, unknown>;
  const overrides: MetallicOverrides = {};

  for (const preset of METALLIC_PRESETS) {
    const rawPreset = source[preset];
    if (!rawPreset || typeof rawPreset !== 'object' || Array.isArray(rawPreset)) continue;
    const rawValues = rawPreset as Record<string, unknown>;
    const next: Partial<MetallicConfig[MetallicPresetName]> = {};

    for (const prop of METALLIC_PROPERTIES) {
      const value = rawValues[prop];
      if (typeof value === 'string' && isValidHexColor(value)) {
        next[prop] = value;
      }
    }

    if (isMetallicGradientType(rawValues.gradientType)) {
      next.gradientType = rawValues.gradientType;
    }

    if (typeof rawValues.gradientAngle === 'number' && Number.isFinite(rawValues.gradientAngle)) {
      next.gradientAngle = rawValues.gradientAngle;
    }

    if (Object.keys(next).length > 0) {
      overrides[preset] = next;
    }
  }

  return Object.keys(overrides).length > 0 ? overrides : undefined;
}

/**
 * Apply foundation-level brand overrides onto the base variant (`variants[0]`)
 * of each material. Overrides are a base-only layer — additional variants live
 * solely in the materialConfigs document.
 */
function mergeMetallicOverrides(
  base: MetallicMaterialsConfig,
  overrides: MetallicOverrides | undefined,
): MetallicMaterialsConfig {
  if (!overrides) return base;
  const merged = {} as MetallicMaterialsConfig;
  for (const preset of METALLIC_PRESETS) {
    const material = base[preset];
    const override = overrides[preset];
    if (!override) {
      merged[preset] = material;
      continue;
    }
    merged[preset] = {
      variants: material.variants.map((variant, index) =>
        index === 0 ? { ...variant, ...override } : variant,
      ),
    };
  }
  return merged;
}

function pickMaterialEffectsConfig(
  effects: MaterialEffectsDocument,
  overrides: MetallicOverrides | undefined,
): MaterialEffectsConfig {
  return {
    translucent: effects.translucent,
    frosted: effects.frosted,
    glass: effects.glass,
    metallic: mergeMetallicOverrides(normalizeMetallicMaterials(effects), overrides),
  };
}

function isValidHexColor(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return isValidHexColor(trimmed) ? trimmed.toLowerCase() : null;
}

function getBrandColorOptions(foundationData: Record<string, unknown> | null | undefined): BrandColorOption[] {
  const colorConfig = (foundationData?.color as { config?: unknown } | undefined)?.config;
  const presetSelection = foundationData?.presetSelection;
  const scales = buildAvailableScales(
    colorConfig as Parameters<typeof buildAvailableScales>[0],
    presetSelection as Parameters<typeof buildAvailableScales>[1],
  );
  const seen = new Set<string>();
  const options: BrandColorOption[] = [];

  for (const scale of scales) {
    for (const color of scale.colors ?? []) {
      const hex = normalizeHexColor(color.hex);
      if (!hex) continue;
      const key = hex;
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({
        id: `${scale.name}:${color.step}:${hex}`,
        label: `${scale.name} ${color.step}`,
        value: hex,
        scaleName: scale.name,
        stepLabel: String(color.step),
      });
    }
  }

  return options;
}

function getSelectedBrandColorValue(value: string, options: BrandColorOption[]): string {
  const normalized = normalizeHexColor(value);
  if (!normalized) return CUSTOM_COLOR_VALUE;
  return options.some((option) => option.value === normalized) ? normalized : CUSTOM_COLOR_VALUE;
}

function isMetallicGradientType(value: unknown): value is MetallicGradientType {
  return typeof value === 'string' && METALLIC_GRADIENT_TYPES.includes(value as MetallicGradientType);
}

function pickMetallicVariantPayload(variant: MetallicVariant): MetallicVariantPayload {
  return {
    id: variant.id,
    name: variant.name,
    shadow: variant.shadow,
    baseDark: variant.baseDark,
    base: variant.base,
    baseLight: variant.baseLight,
    highlight: variant.highlight,
    gradientType: variant.gradientType,
    gradientAngle: variant.gradientAngle,
  };
}

/** Default single-variant material for a metal, used to reset a customized metal. */
function defaultMetallicMaterial(preset: MetallicPresetName): MetallicMaterial {
  return {
    variants: [
      { ...DEFAULT_METALLIC_PRESETS[preset], id: preset, name: getMetallicTokenLabel(preset) },
    ],
  };
}

function buildMetallicMaterialsPayload(
  config: MetallicMaterialsConfig,
): Record<MetallicPresetName, MetallicMaterialPayload> {
  const buildMaterial = (material: MetallicMaterial): MetallicMaterialPayload => ({
    variants: material.variants.map(pickMetallicVariantPayload),
  });
  return {
    gold: buildMaterial(config.gold),
    silver: buildMaterial(config.silver),
    bronze: buildMaterial(config.bronze),
    custom: buildMaterial(config.custom),
    platinum: buildMaterial(config.platinum),
    roseGold: buildMaterial(config.roseGold),
  };
}

function isValidEffectsConfig(effects: MaterialEffectsConfig | null): effects is MaterialEffectsConfig {
  if (!effects) return false;
  for (const preset of METALLIC_PRESETS) {
    const material = effects.metallic[preset];
    if (!material || material.variants.length === 0) return false;
    for (const variant of material.variants) {
      for (const prop of METALLIC_PROPERTIES) {
        if (!isValidHexColor(variant[prop])) return false;
      }
      if (!isMetallicGradientType(variant.gradientType)) return false;
      if (typeof variant.gradientAngle !== 'number' || !Number.isFinite(variant.gradientAngle)) return false;
    }
  }
  return true;
}

function TokenPill({ children }: { children: ReactNode }) {
  const label = typeof children === 'string' ? children : 'Material token';
  return (
    <Badge
      className={styles.tokenPill}
      size="s"
      attention="medium"
      appearance="neutral"
      aria-label={`Token ${label}`}
    >
      {children}
    </Badge>
  );
}

function StatusText({ isSaving, hasError }: { isSaving: boolean; hasError?: boolean }) {
  return (
    <span className={styles.statusText}>
      {hasError ? 'Invalid hex value' : isSaving ? 'Saving' : 'Saved'}
    </span>
  );
}

function MaterialPreview({ config }: { config: MaterialsFoundationConfig }) {
  const materialMode = config.defaultMaterialMode;

  return (
    <div className={styles.previewStack}>
      {MEDIA_CONTEXTS.map((context) => (
        <div key={context} className={styles.mediaGroup}>
          <div className={styles.mediaHeader}>
            <h3 className={styles.sectionHeading}>
              mediaContext=&quot;{context}&quot;
            </h3>
            <p className={styles.bodyText}>
              {MEDIA_COPY[context].description}
            </p>
          </div>
          <div className={styles.mediaBackdrop} data-media-context={context}>
            {SURFACE_MODES.map((mode) => {
              const materialProps =
                materialMode === 'transparent'
                  ? ({ material: 'transparent' as const, mediaContext: context })
                  : ({ material: 'solid' as const });

              return (
                <Surface
                  key={`${context}-${mode}`}
                  mode={mode}
                  {...materialProps}
                  className={styles.surfaceTile}
                >
                  <div className={styles.tileHeader}>
                    <TokenPill>mode=&quot;{mode}&quot;</TokenPill>
                    <span className={styles.metaText}>{MEDIA_COPY[context].label}</span>
                  </div>
                  <div className={styles.buttonRow}>
                    <Button attention="high" size="s">Bold</Button>
                    <Button attention="medium" size="s">Subtle</Button>
                    <Button attention="low" size="s">Ghost</Button>
                  </div>
                </Surface>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function EffectsSummary({ effects }: { effects: MaterialEffectsConfig | null | undefined }) {
  if (effects === undefined) {
    return <p className={styles.bodyText}>Loading material effects.</p>;
  }

  if (!effects) {
    return <p className={styles.bodyText}>No material effects record exists for this brand yet.</p>;
  }

  const effectRows = [
    {
      label: 'Translucent',
      value: `${Math.round(effects.translucent.light.subtle * 100)}% light subtle / ${Math.round(effects.translucent.dark.subtle * 100)}% dark subtle`,
      token: '--Material-Translucent-*',
    },
    {
      label: 'Frosted',
      value: `${effects.frosted.blur.regular} blur, ${Math.round(effects.frosted.backgroundOpacity.regular * 100)}% regular background`,
      token: '--Material-Frosted-*',
    },
    {
      label: 'Glass',
      value: `${effects.glass.blur.regular} blur, ${effects.glass.saturation.regular}% saturation`,
      token: '--Material-Glass-*',
    },
  ];

  return (
    <div className={styles.effectGrid}>
      {effectRows.map((row) => (
        <Surface key={row.label} mode="subtle" className={styles.effectTile}>
          <h3 className={styles.sectionHeading}>{row.label}</h3>
          <p className={styles.bodyText}>{row.value}</p>
          <TokenPill>{row.token}</TokenPill>
        </Surface>
      ))}
    </div>
  );
}

function EffectPreviewTile({
  label,
  token,
  style,
}: {
  label: string;
  token: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={styles.effectPreviewTile} style={style}>
      <span className={styles.controlLabel}>{label}</span>
      <TokenPill>{token}</TokenPill>
    </div>
  );
}

function EffectsEditor({
  activeTab,
  effects,
  onTranslucentChange,
  onFrostedBlurChange,
  onFrostedOpacityChange,
  onGlassChange,
}: {
  activeTab: MaterialEffectsTab;
  effects: MaterialEffectsConfig | null;
  onTranslucentChange: (tone: TranslucentTone, intensity: TranslucentIntensity, value: number) => void;
  onFrostedBlurChange: (intensity: FrostedIntensity, value: number) => void;
  onFrostedOpacityChange: (intensity: FrostedIntensity, value: number) => void;
  onGlassChange: (
    property: 'blur' | 'saturation' | 'highlightIntensity' | 'tintOpacity',
    key: string,
    value: number,
  ) => void;
}) {
  if (!effects) {
    return <p className={styles.bodyText}>Creating material effects for this brand.</p>;
  }

  if (activeTab === 'translucent') {
    return (
      <div className={styles.editorGrid}>
        {(['light', 'dark'] as TranslucentTone[]).map((tone) => (
          <div key={tone} className={styles.editorPanel}>
            <h3 className={styles.sectionHeading}>{tone === 'light' ? 'Light overlay' : 'Dark overlay'}</h3>
            <div className={styles.effectPreviewRow}>
              {TRANSLUCENT_INTENSITIES.map((intensity) => {
                const percent = Math.round(effects.translucent[tone][intensity] * 100);
                return (
                  <EffectPreviewTile
                    key={intensity}
                    label={EFFECT_LABELS[intensity]}
                    token={`--Material-Translucent-${tone === 'light' ? 'Light' : 'Dark'}-${EFFECT_LABELS[intensity].replace(/\s/g, '')}`}
                    style={{
                      background: `color-mix(in srgb, ${tone === 'light' ? 'var(--Surface-Default)' : 'var(--Neutral-Bold)'} ${percent}%, transparent)`,
                    }}
                  />
                );
              })}
            </div>
            <div className={styles.sliderStack}>
              {TRANSLUCENT_INTENSITIES.map((intensity) => (
                <SliderControl
                  key={intensity}
                  label={EFFECT_LABELS[intensity]}
                  value={effects.translucent[tone][intensity] * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(value) => onTranslucentChange(tone, intensity, value / 100)}
                  formatValue={(value) => `${Math.round(value)}%`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === 'frosted') {
    return (
      <div className={styles.editorGrid}>
        <div className={styles.editorPanel}>
          <h3 className={styles.sectionHeading}>Blur radius</h3>
          <div className={styles.effectPreviewRow}>
            {FROSTED_INTENSITIES.map((intensity) => (
              <EffectPreviewTile
                key={intensity}
                label={EFFECT_LABELS[intensity]}
                token={`--Material-Frosted-Blur-${EFFECT_LABELS[intensity].replace(/\s/g, '')}`}
                style={{
                  backdropFilter: `blur(${effects.frosted.blur[intensity]}px)`,
                  WebkitBackdropFilter: `blur(${effects.frosted.blur[intensity]}px)`,
                }}
              />
            ))}
          </div>
          <div className={styles.sliderStack}>
            {FROSTED_INTENSITIES.map((intensity) => (
              <SliderControl
                key={intensity}
                label={EFFECT_LABELS[intensity]}
                value={effects.frosted.blur[intensity]}
                min={0}
                max={50}
                step={1}
                onChange={(value) => onFrostedBlurChange(intensity, value)}
                formatValue={(value) => `${Math.round(value)}px`}
              />
            ))}
          </div>
        </div>
        <div className={styles.editorPanel}>
          <h3 className={styles.sectionHeading}>Background opacity</h3>
          <div className={styles.sliderStack}>
            {FROSTED_INTENSITIES.map((intensity) => (
              <SliderControl
                key={intensity}
                label={EFFECT_LABELS[intensity]}
                value={effects.frosted.backgroundOpacity[intensity] * 100}
                min={0}
                max={100}
                step={1}
                onChange={(value) => onFrostedOpacityChange(intensity, value / 100)}
                formatValue={(value) => `${Math.round(value)}%`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'glass') {
    return (
      <div className={styles.editorGrid}>
        <div className={styles.editorPanel}>
          <h3 className={styles.sectionHeading}>Blur & saturation</h3>
          <div className={styles.sliderStack}>
            {GLASS_PAIR_KEYS.map((key) => (
              <SliderControl
                key={`blur-${key}`}
                label={`${EFFECT_LABELS[key]} blur`}
                value={effects.glass.blur[key]}
                min={0}
                max={40}
                step={1}
                onChange={(value) => onGlassChange('blur', key, value)}
                formatValue={(value) => `${Math.round(value)}px`}
              />
            ))}
            {GLASS_PAIR_KEYS.map((key) => (
              <SliderControl
                key={`saturation-${key}`}
                label={`${EFFECT_LABELS[key]} saturation`}
                value={effects.glass.saturation[key]}
                min={100}
                max={300}
                step={5}
                onChange={(value) => onGlassChange('saturation', key, value)}
                formatValue={(value) => `${Math.round(value)}%`}
              />
            ))}
          </div>
        </div>
        <div className={styles.editorPanel}>
          <h3 className={styles.sectionHeading}>Tint & highlight</h3>
          <div className={styles.sliderStack}>
            {(['light', 'dark'] as TranslucentTone[]).map((tone) => (
              <SliderControl
                key={`tint-${tone}`}
                label={`${tone === 'light' ? 'Light' : 'Dark'} tint`}
                value={effects.glass.tintOpacity[tone] * 100}
                min={0}
                max={100}
                step={1}
                onChange={(value) => onGlassChange('tintOpacity', tone, value / 100)}
                formatValue={(value) => `${Math.round(value)}%`}
              />
            ))}
            {GLASS_HIGHLIGHT_KEYS.map((key) => (
              <SliderControl
                key={`highlight-${key}`}
                label={`${EFFECT_LABELS[key]} highlight`}
                value={effects.glass.highlightIntensity[key] * 100}
                min={0}
                max={100}
                step={1}
                onChange={(value) => onGlassChange('highlightIntensity', key, value / 100)}
                formatValue={(value) => `${Math.round(value)}%`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function MetalPreviewLogo({
  brandName,
  logoSvg,
  preset,
  gradientType,
  gradientAngle,
}: {
  brandName: string | undefined;
  logoSvg: string | undefined;
  preset: VisibleMetallicPresetName;
  gradientType: MetallicGradientType;
  gradientAngle: number;
}) {
  const label = EFFECT_LABELS[preset];
  if (logoSvg) {
    return (
      <Logo
        alt={`${brandName ?? 'Brand'} ${label} logo`}
        svgContent={logoSvg}
        size="xl"
        material={preset}
        materialGradientType={gradientType}
        materialGradientAngle={gradientAngle}
      />
    );
  }

  return (
    <Logo
      alt={`${brandName ?? 'Brand'} ${label} logo`}
      size="xl"
      fallback={<span className={styles.logoFallback}>{getBrandInitials(brandName)}</span>}
    />
  );
}

function MetalsEditor({
  effects,
  activeMetals,
  brandName,
  logoSvg,
  brandColorOptions,
  onActiveMetalChange,
  onMetallicChange,
  onMetallicGradientTypeChange,
  onMetallicGradientAngleChange,
  onAddVariant,
  onRemoveVariant,
  onVariantNameChange,
  onResetMetal,
}: {
  effects: MaterialEffectsConfig | null;
  activeMetals: ActiveMetallicMap;
  brandName: string | undefined;
  logoSvg: string | undefined;
  brandColorOptions: BrandColorOption[];
  onActiveMetalChange: (preset: VisibleMetallicPresetName, active: boolean) => void;
  onMetallicChange: (preset: MetallicPresetName, variantIndex: number, property: MetallicProperty, value: string) => void;
  onMetallicGradientTypeChange: (preset: MetallicPresetName, variantIndex: number, value: MetallicGradientType) => void;
  onMetallicGradientAngleChange: (preset: MetallicPresetName, variantIndex: number, value: number) => void;
  onAddVariant: (preset: MetallicPresetName) => void;
  onRemoveVariant: (preset: MetallicPresetName, variantIndex: number) => void;
  onVariantNameChange: (preset: MetallicPresetName, variantIndex: number, name: string) => void;
  onResetMetal: (preset: MetallicPresetName) => void;
}) {
  const [selectedVariant, setSelectedVariant] = useState<Partial<Record<MetallicPresetName, number>>>({});

  if (!effects) {
    return <p className={styles.bodyText}>Creating material effects for this brand.</p>;
  }

  const colorOptions: SelectOption<string>[] = [
    { value: CUSTOM_COLOR_VALUE, label: 'Custom override' },
    ...brandColorOptions.map((option) => ({
      value: option.value,
      label: option.label,
      badge: option.value,
      color: option.value,
    })),
  ];
  const hasBrandColors = brandColorOptions.length > 0;

  return (
    <div className={styles.metallicStack}>
      <div className={styles.activeMetalsPanel}>
        <div className={styles.activeMetalsHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Active Metals</h3>
            <p className={styles.bodyText}>Only active metals emit material tokens and appear in Appearance material assignments.</p>
          </div>
          <Badge attention="medium" appearance="neutral">
            {VISIBLE_METALLIC_PRESETS.filter((preset) => activeMetals[preset]).length} active
          </Badge>
        </div>
        <div className={styles.activeMetalsGrid}>
          {VISIBLE_METALLIC_PRESETS.map((preset) => {
            const baseVariant = effects.metallic[preset].variants[0];
            const tokenLabel = getMetallicTokenLabel(preset);
            const tokenPrefix = getMetalTokenPrefix(preset);
            const fillGradient = buildMetallicFillGradient(baseVariant);
            const active = activeMetals[preset];
            const variantCount = effects.metallic[preset].variants.length;
            const tileStyle = {
              '--metal-fill': fillGradient,
              '--metal-text': baseVariant.shadow,
            } as React.CSSProperties;

            return (
              <div key={preset} className={styles.activeMetalTile} style={tileStyle}>
                <div className={styles.activeMetalSwatch} aria-hidden="true" />
                <div className={styles.activeMetalBody}>
                  <div className={styles.activeMetalTop}>
                    <h4 className={styles.activeMetalName}>{tokenLabel}</h4>
                    <Switch
                      className={styles.activeMetalSwitch}
                      checked={active}
                      onCheckedChange={(checked) => onActiveMetalChange(preset, checked)}
                      size="s"
                      appearance="secondary"
                      aria-label={`${EFFECT_LABELS[preset]} active`}
                    />
                  </div>
                  <div className={styles.metalTitleRow}>
                    <TokenPill>{`${tokenPrefix}-Fill`}</TokenPill>
                    {variantCount > 1 ? (
                      <Badge size="s" attention="low" appearance="neutral">{`${variantCount} variants`}</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {VISIBLE_METALLIC_PRESETS.map((preset) => {
        const material = effects.metallic[preset];
        const tokenLabel = getMetallicTokenLabel(preset);
        const active = activeMetals[preset];
        const segments = getMetallicVariantSegments(material);
        const variantIndex = Math.min(selectedVariant[preset] ?? 0, material.variants.length - 1);
        const variant = material.variants[variantIndex];
        const segment = segments[variantIndex];
        const tokenPrefix = getMetalTokenPrefix(preset) + (segment ? `-${segment}` : '');
        const canAddVariant = material.variants.length < MAX_METALLIC_VARIANTS;
        const fillGradient = buildMetallicFillGradient(variant);
        const strokeGradient = buildMetallicStrokeGradient(variant);
        const tokenStyle = {
          '--metal-fill': fillGradient,
          '--metal-stroke': strokeGradient,
          '--metal-stroke-color': variant.baseDark,
          '--metal-text': variant.shadow,
          [`--Material-Metallic-${tokenLabel}-Shadow`]: variant.shadow,
          [`--Material-Metallic-${tokenLabel}-BaseDark`]: variant.baseDark,
          [`--Material-Metallic-${tokenLabel}-Base`]: variant.base,
          [`--Material-Metallic-${tokenLabel}-BaseLight`]: variant.baseLight,
          [`--Material-Metallic-${tokenLabel}-Highlight`]: variant.highlight,
          [`--Material-Metallic-${tokenLabel}-GradientType`]: variant.gradientType,
          [`--Material-Metallic-${tokenLabel}-GradientAngle`]: `${variant.gradientAngle}deg`,
          [`--Material-Metallic-${tokenLabel}-Fill`]: fillGradient,
          [`--Material-Metallic-${tokenLabel}-Stroke`]: strokeGradient,
          [`--Material-Metallic-${tokenLabel}-StrokeColor`]: variant.baseDark,
          [`--Material-Metallic-${tokenLabel}-Text`]: variant.shadow,
          [`--Material-Metallic-${tokenLabel}-Gradient`]: fillGradient,
        } as React.CSSProperties;

        return (
          <section key={preset} className={styles.metalCard} style={tokenStyle}>
            <div className={styles.metalHeader}>
              <div>
                <div className={styles.metalTitleRow}>
                  <h3 className={styles.sectionTitle}>{EFFECT_LABELS[preset]}</h3>
                  <Badge attention={active ? 'medium' : 'low'} appearance={active ? 'positive' : 'neutral'}>
                    {active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className={styles.bodyText}>Tokenized stops, gradient style, surface fill, logo paint, and stroke fallback. Add up to {MAX_METALLIC_VARIANTS} variants per metal.</p>
              </div>
              <TokenPill>{`${tokenPrefix}-Fill`}</TokenPill>
            </div>

            <div className={styles.variantBar}>
              <div className={styles.variantTabsRow}>
                <div className={styles.variantTabs} role="group" aria-label={`${EFFECT_LABELS[preset]} variants`}>
                  {material.variants.map((entry, index) => (
                    <Button
                      key={entry.id}
                      attention={index === variantIndex ? 'medium' : 'low'}
                      size="s"
                      aria-label={`Select ${index === 0 ? `${getMetallicTokenLabel(preset)} base` : entry.name} variant`}
                      onPress={() => setSelectedVariant((prev) => ({ ...prev, [preset]: index }))}
                    >
                      {index === 0 ? `${getMetallicTokenLabel(preset)} (base)` : entry.name}
                    </Button>
                  ))}
                </div>
                <div className={styles.variantActions}>
                  <Button
                    attention="low"
                    size="s"
                    appearance="secondary"
                    disabled={!canAddVariant}
                    onPress={() => {
                      onAddVariant(preset);
                      setSelectedVariant((prev) => ({ ...prev, [preset]: material.variants.length }));
                    }}
                    aria-label={`Add ${EFFECT_LABELS[preset]} variant`}
                  >
                    + Variant
                  </Button>
                  <Button
                    attention="low"
                    size="s"
                    appearance="neutral"
                    onPress={() => {
                      onResetMetal(preset);
                      setSelectedVariant((prev) => ({ ...prev, [preset]: 0 }));
                    }}
                    aria-label={`Reset ${EFFECT_LABELS[preset]} to default`}
                  >
                    Reset
                  </Button>
                </div>
              </div>
              {variantIndex > 0 ? (
                <div className={styles.variantMeta}>
                  <div className={styles.controlGroup}>
                    <span className={styles.controlLabel}>Variant name</span>
                    <Input
                      value={variant.name}
                      onChange={(value) => onVariantNameChange(preset, variantIndex, value)}
                      size="s"
                      aria-label={`${EFFECT_LABELS[preset]} variant name`}
                    />
                  </div>
                  <Button
                    attention="low"
                    size="s"
                    appearance="negative"
                    onPress={() => {
                      onRemoveVariant(preset, variantIndex);
                      setSelectedVariant((prev) => ({ ...prev, [preset]: 0 }));
                    }}
                  >
                    Remove variant
                  </Button>
                </div>
              ) : null}
            </div>

            <div className={styles.gradientControls}>
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Gradient style</span>
                <Select
                  value={variant.gradientType}
                  onChange={(value) => onMetallicGradientTypeChange(preset, variantIndex, value)}
                  options={GRADIENT_TYPE_OPTIONS}
                  size="sm"
                  aria-label={`${EFFECT_LABELS[preset]} gradient style`}
                />
              </div>
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Direction</span>
                <Select
                  value={variant.gradientAngle}
                  onChange={(value) => onMetallicGradientAngleChange(preset, variantIndex, value)}
                  options={GRADIENT_DIRECTION_OPTIONS}
                  size="sm"
                  aria-label={`${EFFECT_LABELS[preset]} gradient direction`}
                />
              </div>
              <div className={styles.tokenPair}>
                <TokenPill>{`${tokenPrefix}-GradientType`}</TokenPill>
                <TokenPill>{`${tokenPrefix}-GradientAngle`}</TokenPill>
              </div>
            </div>

            <div className={styles.metalPreviewGrid}>
              <div className={styles.metalPreviewGroup}>
                <span className={styles.controlLabel}>Logo</span>
                <div className={styles.metalLogoPreview}>
                  <MetalPreviewLogo
                    brandName={brandName}
                    logoSvg={logoSvg}
                    preset={preset}
                    gradientType={variant.gradientType}
                    gradientAngle={variant.gradientAngle}
                  />
                </div>
              </div>
              <div className={styles.metalPreviewGroup}>
                <span className={styles.controlLabel}>Surface</span>
                <div className={styles.metalSurfaceSwatch}>
                  <span className={styles.metalSwatchLabel}>{EFFECT_LABELS[preset]}</span>
                </div>
              </div>
              <div className={styles.metalPreviewGroup}>
                <span className={styles.controlLabel}>Stroke</span>
                <div className={styles.metalStrokeSwatch}>
                  <span className={styles.metalSwatchLabel}>Stroke</span>
                </div>
              </div>
            </div>

            <div className={styles.colorGrid}>
              {METALLIC_PROPERTIES.map((prop) => {
                const selectedBrandColor = getSelectedBrandColorValue(variant[prop], brandColorOptions);
                const swatchStyle = {
                  '--stop-color': variant[prop],
                } as React.CSSProperties;

                return (
                  <div key={prop} className={styles.colorField}>
                    <span className={styles.controlLabel}>{EFFECT_LABELS[prop]}</span>
                    <Select
                      value={selectedBrandColor}
                      onChange={(value) => {
                        if (value === CUSTOM_COLOR_VALUE) return;
                        onMetallicChange(preset, variantIndex, prop, value);
                      }}
                      options={colorOptions}
                      size="sm"
                      searchable={hasBrandColors}
                      disabled={!hasBrandColors}
                      aria-label={`${EFFECT_LABELS[preset]} ${EFFECT_LABELS[prop]} brand color`}
                    />
                    <div className={styles.overrideField}>
                      <span className={styles.metaText}>Override hex</span>
                      <span className={styles.overrideInputRow}>
                        <span className={styles.colorPreviewDot} style={swatchStyle} aria-hidden="true" />
                        <Input
                          value={variant[prop]}
                          onChange={(value) => onMetallicChange(preset, variantIndex, prop, value)}
                          size="s"
                          errorHighlight={!isValidHexColor(variant[prop])}
                          aria-label={`${EFFECT_LABELS[preset]} ${EFFECT_LABELS[prop]} override`}
                        />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.metalTokenList}>
              <TokenPill>{`${tokenPrefix}-Stroke`}</TokenPill>
              <TokenPill>{`${tokenPrefix}-StrokeColor`}</TokenPill>
              <TokenPill>{`${tokenPrefix}-Text`}</TokenPill>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TokenReference() {
  const rows = [
    { label: 'Material modes', value: 'solid, transparent' },
    { label: 'Media contexts', value: 'dynamic, dark, light' },
    { label: 'Surface modes', value: SURFACE_MODES.join(', ') },
    { label: 'Metal presets', value: VISIBLE_METALLIC_PRESETS.map((preset) => EFFECT_LABELS[preset]).join(', ') },
    { label: 'Runtime selector', value: '[data-material="transparent"][data-media]' },
  ];

  return (
    <div className={styles.tokenReference}>
      <section className={styles.tokenReferenceSection}>
        <h3 className={styles.sectionTitle}>Foundation reference</h3>
        <div className={styles.tokenGrid}>
          {rows.map((row) => (
            <div key={row.label} className={styles.tokenRow}>
              <span className={styles.metaText}>{row.label}</span>
              <TokenPill>{row.value}</TokenPill>
            </div>
          ))}
        </div>
      </section>
      {VISIBLE_METALLIC_PRESETS.map((preset) => {
        const tokenPrefix = getMetalTokenPrefix(preset);
        return (
          <Fragment key={preset}>
            <Divider />
            <section className={styles.tokenReferenceSection}>
              <div className={styles.tokenSectionHeader}>
                <h3 className={styles.sectionTitle}>{EFFECT_LABELS[preset]}</h3>
                <TokenPill>{tokenPrefix}-*</TokenPill>
              </div>
              <div className={styles.tokenGrid}>
                {METALLIC_TOKEN_SUFFIXES.map((token) => (
                  <div key={token.suffix} className={styles.tokenRow}>
                    <span className={styles.metaText}>{token.label}</span>
                    <TokenPill>{`${tokenPrefix}-${token.suffix}`}</TokenPill>
                  </div>
                ))}
              </div>
            </section>
          </Fragment>
        );
      })}
    </div>
  );
}

export default function MaterialsFoundationPage() {
  const { currentBrand } = usePlatformContext();
  const foundationData = useFoundationData();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const foundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'materials' as const } : 'skip',
  );
  const effects = useQuery(api.materials.get, brandId ? { brandId } : 'skip') as MaterialEffectsDocument | null | undefined;
  const upsertFoundation = useMutation(api.foundations.upsertByType);
  const createEffectsDefaults = useMutation(api.materials.createDefaults);
  const resetEffectsDefaults = useMutation(api.materials.resetToDefaults);
  const updateEffects = useMutation(api.materials.update);

  const [activeTab, setActiveTab] = useState<MaterialsTab>('material');
  const [activeEffectTab, setActiveEffectTab] = useState<MaterialEffectsTab>('translucent');
  const [config, setConfig] = useState<MaterialsFoundationConfig>(DEFAULT_MATERIALS_CONFIG);
  const [effectsConfig, setEffectsConfig] = useState<MaterialEffectsConfig | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasEffectsInitialized, setHasEffectsInitialized] = useState(false);
  const [isEffectsSaving, setIsEffectsSaving] = useState(false);
  const ensuredFoundationForBrand = useRef<string | null>(null);
  const ensuredEffectsForBrand = useRef<string | null>(null);
  const previousEffectsConfigRef = useRef<string>('');
  const effectsSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brandColorOptions = useMemo(
    () => getBrandColorOptions(foundationData as Record<string, unknown> | null | undefined),
    [foundationData],
  );

  useEffect(() => {
    setHasInitialized(false);
    setHasEffectsInitialized(false);
    setEffectsConfig(null);
    previousEffectsConfigRef.current = '';
    ensuredFoundationForBrand.current = null;
    ensuredEffectsForBrand.current = null;
  }, [brandId]);

  useEffect(() => {
    if (foundation === undefined || hasInitialized) return;
    setConfig(normalizeMaterialsConfig(foundation?.config));
    setHasInitialized(true);
  }, [foundation, hasInitialized]);

  const effectsConfigString = useMemo(
    () => effectsConfig ? JSON.stringify(effectsConfig) : '',
    [effectsConfig],
  );

  useEffect(() => {
    if (effects === undefined || effects === null) return;
    const next = pickMaterialEffectsConfig(effects, config.metallic);
    const nextString = JSON.stringify(next);
    const hasLocalEdits =
      hasEffectsInitialized
      && effectsConfigString !== ''
      && effectsConfigString !== previousEffectsConfigRef.current;
    if (hasLocalEdits) return;
    if (hasEffectsInitialized && effectsConfigString === nextString) {
      previousEffectsConfigRef.current = nextString;
      return;
    }
    setEffectsConfig(next);
    previousEffectsConfigRef.current = nextString;
    setHasEffectsInitialized(true);
  }, [effects, effectsConfigString, hasEffectsInitialized, config.metallic]);

  useEffect(() => {
    if (!brandId || foundation !== null || ensuredFoundationForBrand.current === brandId) return;
    ensuredFoundationForBrand.current = brandId;
    void upsertFoundation({
      brandId,
      type: 'materials',
      config: DEFAULT_MATERIALS_CONFIG,
    });
  }, [brandId, foundation, upsertFoundation]);

  useEffect(() => {
    if (!brandId || effects !== null || ensuredEffectsForBrand.current === brandId) return;
    ensuredEffectsForBrand.current = brandId;
    void createEffectsDefaults({ brandId });
  }, [brandId, effects, createEffectsDefaults]);

  const { isSaving, saveNow } = useAutoSave({
    config,
    brandId,
    type: 'materials',
    enabled: hasInitialized,
  });

  const saveEffectsNow = useCallback(async () => {
    if (!effects?._id || !isValidEffectsConfig(effectsConfig)) return;
    if (effectsSaveTimerRef.current) {
      clearTimeout(effectsSaveTimerRef.current);
      effectsSaveTimerRef.current = null;
    }
    setIsEffectsSaving(true);
    try {
      await updateEffects({
        id: effects._id,
        translucent: effectsConfig.translucent,
        frosted: effectsConfig.frosted,
        glass: effectsConfig.glass,
        metallic: buildMetallicMaterialsPayload(effectsConfig.metallic),
      });
      previousEffectsConfigRef.current = JSON.stringify(effectsConfig);
    } finally {
      setIsEffectsSaving(false);
    }
  }, [effects?._id, effectsConfig, updateEffects]);

  useEffect(() => {
    if (!effects?._id || !hasEffectsInitialized || !isValidEffectsConfig(effectsConfig)) return;
    const current = JSON.stringify(effectsConfig);
    if (current === previousEffectsConfigRef.current) return;

    if (effectsSaveTimerRef.current) {
      clearTimeout(effectsSaveTimerRef.current);
    }
    effectsSaveTimerRef.current = setTimeout(() => {
      effectsSaveTimerRef.current = null;
      void saveEffectsNow();
    }, 800);

    return () => {
      if (effectsSaveTimerRef.current) {
        clearTimeout(effectsSaveTimerRef.current);
        effectsSaveTimerRef.current = null;
      }
    };
  }, [effects?._id, effectsConfig, hasEffectsInitialized, saveEffectsNow]);

  const actions = useMemo(
    () => (
      <div className={styles.actionRow}>
        <StatusText isSaving={isSaving} />
        <Button attention="low" size="s" onPress={saveNow}>
          Save
        </Button>
      </div>
    ),
    [isSaving, saveNow],
  );

  const effectsActions = useMemo(
    () => (
      <div className={styles.actionRow}>
        <StatusText
          isSaving={isEffectsSaving}
          hasError={effectsConfig !== null && !isValidEffectsConfig(effectsConfig)}
        />
        <Button attention="low" size="s" onPress={saveEffectsNow}>
          Save effects
        </Button>
      </div>
    ),
    [isEffectsSaving, saveEffectsNow, effectsConfig],
  );

  const handleMaterialModeChange = useCallback((value: unknown) => {
    if (!isMaterialMode(value)) return;
    setConfig((prev) => ({ ...prev, defaultMaterialMode: value }));
  }, []);

  const handleMediaContextChange = useCallback((value: unknown) => {
    if (!isMediaContext(value)) return;
    setConfig((prev) => ({ ...prev, defaultMediaContext: value }));
  }, []);

  const handleTranslucentChange = useCallback((
    tone: TranslucentTone,
    intensity: TranslucentIntensity,
    value: number,
  ) => {
    setEffectsConfig((prev) => prev
      ? {
        ...prev,
        translucent: {
          ...prev.translucent,
          [tone]: { ...prev.translucent[tone], [intensity]: value },
        },
      }
      : prev);
  }, []);

  const handleFrostedBlurChange = useCallback((intensity: FrostedIntensity, value: number) => {
    setEffectsConfig((prev) => prev
      ? {
        ...prev,
        frosted: {
          ...prev.frosted,
          blur: { ...prev.frosted.blur, [intensity]: value },
        },
      }
      : prev);
  }, []);

  const handleFrostedOpacityChange = useCallback((intensity: FrostedIntensity, value: number) => {
    setEffectsConfig((prev) => prev
      ? {
        ...prev,
        frosted: {
          ...prev.frosted,
          backgroundOpacity: { ...prev.frosted.backgroundOpacity, [intensity]: value },
        },
      }
      : prev);
  }, []);

  const handleGlassChange = useCallback((
    property: 'blur' | 'saturation' | 'highlightIntensity' | 'tintOpacity',
    key: string,
    value: number,
  ) => {
    setEffectsConfig((prev) => prev
      ? {
        ...prev,
        glass: {
          ...prev.glass,
          [property]: { ...prev.glass[property], [key]: value },
        },
      }
      : prev);
  }, []);

  // Patch a single variant of a metal in the effects config. When the base
  // variant (index 0) changes we also mirror the patch into the foundation
  // override layer (`config.metallic`), preserving the existing dual-write so
  // live brand CSS reflects base edits immediately. Additional variants live
  // only in the materialConfigs document.
  const patchMetallicVariant = useCallback((
    preset: MetallicPresetName,
    variantIndex: number,
    patch: Partial<MetallicVariant>,
  ) => {
    if (variantIndex === 0) {
      setConfig((prev) => ({
        ...prev,
        metallic: {
          ...(prev.metallic ?? {}),
          [preset]: {
            ...(prev.metallic?.[preset] ?? {}),
            ...patch,
          },
        },
      }));
    }
    setEffectsConfig((prev) => {
      if (!prev) return prev;
      const material = prev.metallic[preset];
      return {
        ...prev,
        metallic: {
          ...prev.metallic,
          [preset]: {
            variants: material.variants.map((variant, index) =>
              index === variantIndex ? { ...variant, ...patch } : variant,
            ),
          },
        },
      };
    });
  }, []);

  const handleMetallicChange = useCallback((
    preset: MetallicPresetName,
    variantIndex: number,
    property: MetallicProperty,
    value: string,
  ) => {
    patchMetallicVariant(preset, variantIndex, { [property]: value });
  }, [patchMetallicVariant]);

  const handleActiveMetalChange = useCallback((preset: VisibleMetallicPresetName, active: boolean) => {
    setConfig((prev) => ({
      ...prev,
      activeMetals: {
        ...DEFAULT_ACTIVE_METALS,
        ...prev.activeMetals,
        [preset]: active,
      },
    }));
  }, []);

  const handleMetallicGradientTypeChange = useCallback((
    preset: MetallicPresetName,
    variantIndex: number,
    value: MetallicGradientType,
  ) => {
    patchMetallicVariant(preset, variantIndex, { gradientType: value });
  }, [patchMetallicVariant]);

  const handleMetallicGradientAngleChange = useCallback((
    preset: MetallicPresetName,
    variantIndex: number,
    value: number,
  ) => {
    patchMetallicVariant(preset, variantIndex, { gradientAngle: value });
  }, [patchMetallicVariant]);

  const handleVariantNameChange = useCallback((
    preset: MetallicPresetName,
    variantIndex: number,
    name: string,
  ) => {
    // Variant names are display-only metadata; never written to the base
    // override layer (they would not round-trip through MetallicOverrides).
    setEffectsConfig((prev) => {
      if (!prev) return prev;
      const material = prev.metallic[preset];
      return {
        ...prev,
        metallic: {
          ...prev.metallic,
          [preset]: {
            variants: material.variants.map((variant, index) =>
              index === variantIndex ? { ...variant, name } : variant,
            ),
          },
        },
      };
    });
  }, []);

  const handleAddVariant = useCallback((preset: MetallicPresetName) => {
    setEffectsConfig((prev) => {
      if (!prev) return prev;
      const material = prev.metallic[preset];
      if (material.variants.length >= MAX_METALLIC_VARIANTS) return prev;
      const base = material.variants[0];
      const usedIds = new Set(material.variants.map((variant) => variant.id));
      let counter = material.variants.length + 1;
      let id = `${preset}-${counter}`;
      while (usedIds.has(id)) {
        counter += 1;
        id = `${preset}-${counter}`;
      }
      const newVariant: MetallicVariant = {
        ...base,
        id,
        name: `${getMetallicTokenLabel(preset)} ${material.variants.length + 1}`,
      };
      return {
        ...prev,
        metallic: {
          ...prev.metallic,
          [preset]: { variants: [...material.variants, newVariant] },
        },
      };
    });
  }, []);

  const handleResetMetal = useCallback((preset: MetallicPresetName) => {
    // Restore the metal to its default single base variant and drop any
    // foundation base-colour override so the reset also clears edited stops.
    const material = defaultMetallicMaterial(preset);
    setConfig((prev) => {
      if (!prev.metallic?.[preset]) return prev;
      const nextMetallic = { ...prev.metallic };
      delete nextMetallic[preset];
      return { ...prev, metallic: nextMetallic };
    });
    setEffectsConfig((prev) => prev
      ? { ...prev, metallic: { ...prev.metallic, [preset]: material } }
      : prev);
  }, []);

  const handleRemoveVariant = useCallback((preset: MetallicPresetName, variantIndex: number) => {
    // The base variant (index 0) emits the legacy tokens and cannot be removed.
    if (variantIndex === 0) return;
    setEffectsConfig((prev) => {
      if (!prev) return prev;
      const material = prev.metallic[preset];
      if (variantIndex >= material.variants.length) return prev;
      return {
        ...prev,
        metallic: {
          ...prev.metallic,
          [preset]: {
            variants: material.variants.filter((_, index) => index !== variantIndex),
          },
        },
      };
    });
  }, []);

  const handleReset = useCallback(async () => {
    setConfig(DEFAULT_MATERIALS_CONFIG);
    if (brandId && effects) {
      await resetEffectsDefaults({ brandId });
      setEffectsConfig(null);
      setHasEffectsInitialized(false);
      previousEffectsConfigRef.current = '';
    }
  }, [brandId, effects, resetEffectsDefaults]);

  const isLoading = brandId != null && (
    foundation === undefined
    || effects === undefined
    || !hasInitialized
    || !hasEffectsInitialized
  );

  return (
    <div className={foundationStyles.page}>
      <div className={foundationStyles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={foundationStyles.title}>Materials Foundation</h1>
            <p className={foundationStyles.description}>
              Material mode and media context parity with the plugin, backed by Convex foundation data.
              {currentBrand && (
                <span className={foundationStyles.brandIndicator}>
                  {' '}Configuring for <strong>{currentBrand.name}</strong>
                </span>
              )}
            </p>
          </div>
          <Button attention="low" size="s" onPress={handleReset}>
            Reset defaults
          </Button>
        </div>
      </div>

      <div className={foundationStyles.content}>
        <div className={foundationStyles.foundationTabsRow}>
          <Tabs.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab((value as MaterialsTab) ?? 'material')}
          >
            <Tabs.List className={foundationStyles.foundationTabsList}>
              {MATERIAL_TABS.map((tab) => (
                <Tabs.Item key={tab.id} value={tab.id}>{tab.label}</Tabs.Item>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div className={foundationStyles.tabPanelStack}>
          {isLoading && (
            <FoundationCard title="Materials" description="Loading material configuration.">
              <p className={styles.bodyText}>Loading.</p>
            </FoundationCard>
          )}

          {!isLoading && activeTab === 'material' && (
            <FoundationCard
              title="Material & Media"
              description="Transparent material remaps the existing surface and content tokens over media; components adapt through the same Surface cascade."
              actions={actions}
            >
              <div className={styles.controlGrid}>
                <div className={styles.controlGroup}>
                  <span className={styles.controlLabel}>Default material</span>
                  <Tabs.Root
                    value={config.defaultMaterialMode}
                    onValueChange={handleMaterialModeChange}
                  >
                    <Tabs.List className={styles.segmentedList}>
                      {MATERIAL_MODES.map((mode) => (
                        <Tabs.Item key={mode} value={mode}>{mode}</Tabs.Item>
                      ))}
                      <Tabs.Indicator />
                    </Tabs.List>
                  </Tabs.Root>
                </div>
                <div className={styles.controlGroup}>
                  <span className={styles.controlLabel}>Default media</span>
                  <Tabs.Root
                    value={config.defaultMediaContext}
                    onValueChange={handleMediaContextChange}
                  >
                    <Tabs.List className={styles.segmentedList}>
                      {MEDIA_CONTEXTS.map((context) => (
                        <Tabs.Item key={context} value={context}>{context}</Tabs.Item>
                      ))}
                      <Tabs.Indicator />
                    </Tabs.List>
                  </Tabs.Root>
                </div>
              </div>
              <MaterialPreview config={config} />
            </FoundationCard>
          )}

          {!isLoading && activeTab === 'metals' && (
            <FoundationCard
              title="Metals"
              description="Bronze, silver, gold, and custom material presets emit stop, gradient style, fill, stroke, stroke fallback, and text tokens for logos and components."
              actions={effectsActions}
            >
              <MetalsEditor
                effects={effectsConfig}
                activeMetals={config.activeMetals}
                brandName={currentBrand?.name}
                logoSvg={currentBrand?.logoSvg}
                brandColorOptions={brandColorOptions}
                onActiveMetalChange={handleActiveMetalChange}
                onMetallicChange={handleMetallicChange}
                onMetallicGradientTypeChange={handleMetallicGradientTypeChange}
                onMetallicGradientAngleChange={handleMetallicGradientAngleChange}
                onAddVariant={handleAddVariant}
                onRemoveVariant={handleRemoveVariant}
                onVariantNameChange={handleVariantNameChange}
                onResetMetal={handleResetMetal}
              />
            </FoundationCard>
          )}

          {!isLoading && activeTab === 'effects' && (
            <FoundationCard
              title="Material Effects"
              description="Translucent, frosted, and glass effect tokens are stored in Convex materialConfigs and exported through the material token generator."
              actions={effectsActions}
            >
              <div className={styles.effectsStack}>
                <section className={styles.effectsSection}>
                  <h3 className={styles.sectionTitle}>Overview</h3>
                  <EffectsSummary effects={effectsConfig} />
                </section>
                <Divider />
                <section className={styles.effectsSection}>
                  <h3 className={styles.sectionTitle}>Effect controls</h3>
                  <Tabs.Root
                    value={activeEffectTab}
                    onValueChange={(value) => setActiveEffectTab((value as MaterialEffectsTab) ?? 'translucent')}
                  >
                    <Tabs.List className={styles.segmentedList}>
                      {EFFECT_TABS.map((tab) => (
                        <Tabs.Item key={tab.id} value={tab.id}>{tab.label}</Tabs.Item>
                      ))}
                      <Tabs.Indicator />
                    </Tabs.List>
                  </Tabs.Root>
                  <EffectsEditor
                    activeTab={activeEffectTab}
                    effects={effectsConfig}
                    onTranslucentChange={handleTranslucentChange}
                    onFrostedBlurChange={handleFrostedBlurChange}
                    onFrostedOpacityChange={handleFrostedOpacityChange}
                    onGlassChange={handleGlassChange}
                  />
                </section>
              </div>
            </FoundationCard>
          )}

          {!isLoading && activeTab === 'tokens' && (
            <FoundationCard
              title="Token Reference"
              description="The Material foundation emits brand-injected material tokens for metals, while transparent material still remaps existing surface tokens over media."
            >
              <TokenReference />
            </FoundationCard>
          )}
        </div>
      </div>
    </div>
  );
}
