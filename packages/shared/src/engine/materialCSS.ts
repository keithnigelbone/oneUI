/**
 * Metallic material token generation.
 *
 * Gradients are emitted as derived CSS variables from primitive stop tokens so
 * components can consume one material API without hard-coding stops locally.
 */

export const VISIBLE_METALLIC_PRESETS = ['bronze', 'silver', 'gold', 'custom'] as const;
export const METALLIC_PRESETS = ['gold', 'silver', 'bronze', 'custom', 'platinum', 'roseGold'] as const;
export const METALLIC_PROPERTIES = ['shadow', 'baseDark', 'base', 'baseLight', 'highlight'] as const;
export const METALLIC_GRADIENT_TYPES = ['linear', 'radial', 'conic'] as const;
export const MATERIAL_ASSIGNMENT_TARGETS = [
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
  'neutral',
  'positive',
  'negative',
  'warning',
  'informative',
  'logo',
] as const;

export type VisibleMetallicPresetName = typeof VISIBLE_METALLIC_PRESETS[number];
export type MetallicPresetName = typeof METALLIC_PRESETS[number];
export type MetallicProperty = typeof METALLIC_PROPERTIES[number];
export type MetallicGradientType = typeof METALLIC_GRADIENT_TYPES[number];
export type MaterialAssignmentTarget = typeof MATERIAL_ASSIGNMENT_TARGETS[number];
export interface MetallicPreset extends Record<MetallicProperty, string> {
  gradientType: MetallicGradientType;
  gradientAngle: number;
}
export type MetallicConfig = Record<MetallicPresetName, MetallicPreset>;
export type ActiveMetallicMap = Partial<Record<VisibleMetallicPresetName, boolean>>;
export type MaterialAssignmentMap = Partial<Record<MaterialAssignmentTarget, VisibleMetallicPresetName>>;

/** Max variants a brand may define per metallic material type. */
export const MAX_METALLIC_VARIANTS = 3;

/**
 * A single named variant of a metallic material (e.g. "Radial Gold").
 *
 * A variant is a full {@link MetallicPreset} plus a stable `id` (used for
 * assignment references) and a human `name` (drives the token label segment).
 */
export interface MetallicVariant extends MetallicPreset {
  id: string;
  name: string;
}

/**
 * A metallic material type holding 1..{@link MAX_METALLIC_VARIANTS} variants.
 * `variants[0]` is the base variant and emits the legacy unsuffixed tokens
 * (`--Material-Metallic-Gold-*`); later variants emit a label segment
 * (`--Material-Metallic-Gold-Radial-*`).
 */
export interface MetallicMaterial {
  variants: MetallicVariant[];
}

export type MetallicMaterialsConfig = Record<MetallicPresetName, MetallicMaterial>;

export interface MetallicTokenEntry {
  name: string;
  value: string;
  description: string;
}

export const DEFAULT_METALLIC_PRESETS: MetallicConfig = {
  gold: {
    shadow: '#462523',
    baseDark: '#9a7b2d',
    base: '#cb9b51',
    baseLight: '#f6e27a',
    highlight: '#f6f2c0',
    gradientType: 'linear',
    gradientAngle: 135,
  },
  silver: {
    shadow: '#3d3d3d',
    baseDark: '#6a6a6a',
    base: '#8c8c8c',
    baseLight: '#c0c0c0',
    highlight: '#f0f0f0',
    gradientType: 'linear',
    gradientAngle: 135,
  },
  bronze: {
    shadow: '#3d2314',
    baseDark: '#7a4a2a',
    base: '#a97142',
    baseLight: '#cd9355',
    highlight: '#e8c896',
    gradientType: 'linear',
    gradientAngle: 135,
  },
  custom: {
    shadow: '#1f2933',
    baseDark: '#52606d',
    base: '#7b8794',
    baseLight: '#cbd2d9',
    highlight: '#f5f7fa',
    gradientType: 'radial',
    gradientAngle: 45,
  },
  platinum: {
    shadow: '#2a2a2a',
    baseDark: '#5a5a5a',
    base: '#a0a0a0',
    baseLight: '#d0d0d0',
    highlight: '#ffffff',
    gradientType: 'linear',
    gradientAngle: 135,
  },
  roseGold: {
    shadow: '#4a2020',
    baseDark: '#b76e79',
    base: '#e8a39e',
    baseLight: '#f4c4bf',
    highlight: '#fff0ed',
    gradientType: 'linear',
    gradientAngle: 135,
  },
};

const TOKEN_LABELS: Record<MetallicPresetName, string> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
  custom: 'Custom',
  platinum: 'Platinum',
  roseGold: 'RoseGold',
};

const ASSIGNMENT_TOKEN_LABELS: Record<MaterialAssignmentTarget, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  sparkle: 'Sparkle',
  'brand-bg': 'Brand-Bg',
  neutral: 'Neutral',
  positive: 'Positive',
  negative: 'Negative',
  warning: 'Warning',
  informative: 'Informative',
  logo: 'Logo',
};

const PROPERTY_LABELS: Record<MetallicProperty, string> = {
  shadow: 'Shadow',
  baseDark: 'BaseDark',
  base: 'Base',
  baseLight: 'BaseLight',
  highlight: 'Highlight',
};

export const FILL_STOPS: Array<{ property: MetallicProperty; position: string }> = [
  { property: 'shadow', position: '0%' },
  { property: 'base', position: '15%' },
  { property: 'baseLight', position: '30%' },
  { property: 'highlight', position: '45%' },
  { property: 'baseLight', position: '55%' },
  { property: 'base', position: '70%' },
  { property: 'baseLight', position: '85%' },
  { property: 'shadow', position: '100%' },
];

export const STROKE_STOPS: Array<{ property: MetallicProperty; position: string }> = [
  { property: 'baseDark', position: '0%' },
  { property: 'highlight', position: '18%' },
  { property: 'base', position: '38%' },
  { property: 'baseLight', position: '62%' },
  { property: 'shadow', position: '82%' },
  { property: 'baseDark', position: '100%' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
}

function isMetallicGradientType(value: unknown): value is MetallicGradientType {
  return typeof value === 'string' && METALLIC_GRADIENT_TYPES.includes(value as MetallicGradientType);
}

function isVisibleMetallicPreset(value: unknown): value is VisibleMetallicPresetName {
  return typeof value === 'string' && VISIBLE_METALLIC_PRESETS.includes(value as VisibleMetallicPresetName);
}

function isMaterialAssignmentTarget(value: unknown): value is MaterialAssignmentTarget {
  return typeof value === 'string' && MATERIAL_ASSIGNMENT_TARGETS.includes(value as MaterialAssignmentTarget);
}

function normalizeGradientAngle(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function normalizeMetallicPreset(value: unknown, fallback: MetallicPreset): MetallicPreset {
  const source = isRecord(value) ? value : {};
  return {
    shadow: isHexColor(source.shadow) ? source.shadow : fallback.shadow,
    baseDark: isHexColor(source.baseDark) ? source.baseDark : fallback.baseDark,
    base: isHexColor(source.base) ? source.base : fallback.base,
    baseLight: isHexColor(source.baseLight) ? source.baseLight : fallback.baseLight,
    highlight: isHexColor(source.highlight) ? source.highlight : fallback.highlight,
    gradientType: isMetallicGradientType(source.gradientType) ? source.gradientType : fallback.gradientType,
    gradientAngle: normalizeGradientAngle(source.gradientAngle, fallback.gradientAngle),
  };
}

/** Derive a PascalCase token-label segment from a free-text variant name. */
function toTokenSegment(name: unknown): string {
  if (typeof name !== 'string') return '';
  const words = name.match(/[A-Za-z0-9]+/g);
  if (!words) return '';
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

/**
 * Normalize an arbitrary input into a {@link MetallicMaterial} (variant list).
 *
 * Accepts both the legacy single-preset shape (`{ shadow, base, ... }`) and the
 * new `{ variants: [...] }` shape, so old Convex documents round-trip cleanly.
 */
function normalizeMetallicMaterial(
  value: unknown,
  fallback: MetallicPreset,
  metal: MetallicPresetName,
): MetallicMaterial {
  const baseLabel = TOKEN_LABELS[metal];
  const rawVariants =
    isRecord(value) && Array.isArray((value as { variants?: unknown }).variants)
      ? ((value as { variants: unknown[] }).variants)
      : [value];

  const variants: MetallicVariant[] = [];
  for (let i = 0; i < rawVariants.length && variants.length < MAX_METALLIC_VARIANTS; i += 1) {
    const raw = rawVariants[i];
    const preset = normalizeMetallicPreset(raw, fallback);
    const rawId = isRecord(raw) && typeof raw.id === 'string' ? raw.id : '';
    const rawName = isRecord(raw) && typeof raw.name === 'string' ? raw.name : '';
    variants.push({
      ...preset,
      id: rawId || (i === 0 ? metal : `${metal}-${i + 1}`),
      name: rawName || (i === 0 ? baseLabel : `${baseLabel} ${i + 1}`),
    });
  }

  if (variants.length === 0) {
    variants.push({ ...fallback, id: metal, name: baseLabel });
  }

  return { variants };
}

/**
 * Normalize brand metallic config into the variant-aware
 * {@link MetallicMaterialsConfig}. Tolerates legacy and new shapes alike.
 */
export function normalizeMetallicMaterials(input: unknown): MetallicMaterialsConfig {
  const maybeConfig = isRecord(input) && isRecord(input.metallic) ? input.metallic : input;
  const source = isRecord(maybeConfig) ? maybeConfig : {};
  return {
    gold: normalizeMetallicMaterial(source.gold, DEFAULT_METALLIC_PRESETS.gold, 'gold'),
    silver: normalizeMetallicMaterial(source.silver, DEFAULT_METALLIC_PRESETS.silver, 'silver'),
    bronze: normalizeMetallicMaterial(source.bronze, DEFAULT_METALLIC_PRESETS.bronze, 'bronze'),
    custom: normalizeMetallicMaterial(source.custom, DEFAULT_METALLIC_PRESETS.custom, 'custom'),
    platinum: normalizeMetallicMaterial(source.platinum, DEFAULT_METALLIC_PRESETS.platinum, 'platinum'),
    roseGold: normalizeMetallicMaterial(source.roseGold, DEFAULT_METALLIC_PRESETS.roseGold, 'roseGold'),
  };
}

/**
 * Resolve the unique token-label segment for each variant of a material.
 * Index 0 (base) is always `''` (legacy unsuffixed tokens). Later variants use
 * a PascalCase segment derived from their name, deduplicated and guaranteed
 * non-empty / non-colliding with the base.
 */
export function getMetallicVariantSegments(material: MetallicMaterial): string[] {
  const used = new Set<string>(['']);
  return material.variants.map((variant, index) => {
    if (index === 0) return '';
    let segment = toTokenSegment(variant.name);
    if (!segment || used.has(segment)) segment = `Variant${index + 1}`;
    let candidate = segment;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${segment}${suffix}`;
      suffix += 1;
    }
    used.add(candidate);
    return candidate;
  });
}

export function getMetallicTokenLabel(preset: MetallicPresetName): string {
  return TOKEN_LABELS[preset];
}

export function getMetallicTokenPrefix(preset: MetallicPresetName): string {
  return `Material-Metallic-${getMetallicTokenLabel(preset)}`;
}

/** Strip variant metadata, returning the bare preset of a variant. */
function toPreset(variant: MetallicVariant): MetallicPreset {
  const { id: _id, name: _name, ...preset } = variant;
  return preset;
}

/**
 * Flat base-variant view of the metallic config. Each metal resolves to its
 * base variant (`variants[0]`) so legacy consumers that key by preset name keep
 * working unchanged after the move to multi-variant materials.
 */
export function normalizeMetallicConfig(input: unknown): MetallicConfig {
  const materials = normalizeMetallicMaterials(input);
  return {
    gold: toPreset(materials.gold.variants[0]),
    silver: toPreset(materials.silver.variants[0]),
    bronze: toPreset(materials.bronze.variants[0]),
    custom: toPreset(materials.custom.variants[0]),
    platinum: toPreset(materials.platinum.variants[0]),
    roseGold: toPreset(materials.roseGold.variants[0]),
  };
}

export function normalizeActiveMetallicMap(input: unknown): ActiveMetallicMap | undefined {
  const maybeActive = isRecord(input) ? input.activeMetals : undefined;
  if (!isRecord(maybeActive)) return undefined;

  const active: ActiveMetallicMap = {};
  for (const preset of VISIBLE_METALLIC_PRESETS) {
    if (typeof maybeActive[preset] === 'boolean') {
      active[preset] = maybeActive[preset];
    }
  }
  return Object.keys(active).length > 0 ? active : undefined;
}

export function getEnabledMetallicPresets(input: unknown): MetallicPresetName[] {
  const active = normalizeActiveMetallicMap(input);
  if (!active) return [...METALLIC_PRESETS];

  return VISIBLE_METALLIC_PRESETS.filter((preset) => active[preset] === true);
}

export function normalizeMaterialAssignments(input: unknown): MaterialAssignmentMap {
  const source = isRecord(input)
    ? (isRecord(input.materials) ? input.materials : input)
    : {};
  const rawAssignments = isRecord(source.materialAssignments)
    ? source.materialAssignments
    : isRecord(source.assignments)
      ? source.assignments
      : source;
  const assignments: MaterialAssignmentMap = {};

  if (!isRecord(rawAssignments)) return assignments;

  for (const [target, value] of Object.entries(rawAssignments)) {
    if (isMaterialAssignmentTarget(target) && isVisibleMetallicPreset(value)) {
      assignments[target] = value;
    }
  }

  return assignments;
}

export function mergeMaterialConfigWithFoundationConfig(
  materialConfig: unknown,
  materialsFoundationConfig: unknown,
): unknown {
  const foundationConfig = isRecord(materialsFoundationConfig) ? materialsFoundationConfig : {};
  const foundationMetallic = foundationConfig.metallic;
  const activeMetals = foundationConfig.activeMetals;
  const materialAssignments = foundationConfig.materialAssignments;

  if (!foundationMetallic && !activeMetals && !materialAssignments) return materialConfig;

  const merged: Record<string, unknown> = isRecord(materialConfig) ? { ...materialConfig } : {};

  if (isRecord(foundationMetallic)) {
    // Foundation overrides are a base-only layer: apply them to each material's
    // base variant (index 0) while preserving every additional variant. Values
    // are re-validated downstream by normalizeMetallicMaterials at generation.
    const materials = normalizeMetallicMaterials(materialConfig);
    merged.metallic = Object.fromEntries(
      (Object.entries(materials) as Array<[MetallicPresetName, MetallicMaterial]>).map(([preset, material]) => {
        const override = isRecord(foundationMetallic[preset]) ? foundationMetallic[preset] : undefined;
        if (!override) return [preset, material];
        return [
          preset,
          {
            variants: material.variants.map((variant, index) =>
              index === 0 ? { ...variant, ...override } : variant,
            ),
          },
        ];
      }),
    );
  }

  if (isRecord(activeMetals)) {
    merged.activeMetals = activeMetals;
  }

  if (isRecord(materialAssignments)) {
    merged.materialAssignments = materialAssignments;
  }

  return merged;
}

function getRadialPosition(angle: number): string {
  const normalized = normalizeGradientAngle(angle, 135);
  if (normalized < 22.5 || normalized >= 337.5) return 'center top';
  if (normalized < 67.5) return 'right top';
  if (normalized < 112.5) return 'right center';
  if (normalized < 157.5) return 'right bottom';
  if (normalized < 202.5) return 'center bottom';
  if (normalized < 247.5) return 'left bottom';
  if (normalized < 292.5) return 'left center';
  return 'left top';
}

function buildGradient(
  stopList: string,
  gradientType: MetallicGradientType,
  angle: number,
): string {
  if (gradientType === 'radial') {
    return `radial-gradient(circle at ${getRadialPosition(angle)}, ${stopList})`;
  }
  if (gradientType === 'conic') {
    return `conic-gradient(from ${normalizeGradientAngle(angle, 135)}deg, ${stopList})`;
  }
  return `linear-gradient(${normalizeGradientAngle(angle, 135)}deg, ${stopList})`;
}

function buildGradientFromPreset(
  preset: MetallicPreset,
  stops: Array<{ property: MetallicProperty; position: string }>,
): string {
  const stopList = stops.map(({ property, position }) => `${preset[property]} ${position}`).join(', ');
  return buildGradient(stopList, preset.gradientType, preset.gradientAngle);
}

function buildGradientFromTokenVars(
  prefix: string,
  values: MetallicPreset,
  stops: Array<{ property: MetallicProperty; position: string }>,
): string {
  const stopList = stops
    .map(({ property, position }) => `var(--${prefix}-${PROPERTY_LABELS[property]}) ${position}`)
    .join(', ');
  return buildGradient(stopList, values.gradientType, values.gradientAngle);
}

/** Token prefix for a specific variant. Base variant (empty segment) keeps the legacy prefix. */
export function getMetallicVariantTokenPrefix(preset: MetallicPresetName, segment: string): string {
  const base = getMetallicTokenPrefix(preset);
  return segment ? `${base}-${segment}` : base;
}

export function buildMetallicFillGradient(preset: MetallicPreset): string {
  return buildGradientFromPreset(preset, FILL_STOPS);
}

export function buildMetallicStrokeGradient(preset: MetallicPreset): string {
  return buildGradientFromPreset(preset, STROKE_STOPS);
}

export function buildMetallicFillTokenGradient(prefix: string, values: MetallicPreset): string {
  return buildGradientFromTokenVars(prefix, values, FILL_STOPS);
}

export function buildMetallicStrokeTokenGradient(prefix: string, values: MetallicPreset): string {
  return buildGradientFromTokenVars(prefix, values, STROKE_STOPS);
}

export function generateMetallicTokenEntries(input: unknown): MetallicTokenEntry[] {
  const materials = normalizeMetallicMaterials(input);
  const entries: MetallicTokenEntry[] = [];

  for (const preset of getEnabledMetallicPresets(input)) {
    const material = materials[preset];
    const segments = getMetallicVariantSegments(material);
    material.variants.forEach((values, index) => {
      const prefix = getMetallicVariantTokenPrefix(preset, segments[index]);
      const label = values.name;
      for (const property of METALLIC_PROPERTIES) {
        entries.push({
          name: `${prefix}-${PROPERTY_LABELS[property]}`,
          value: values[property],
          description: `${label} metallic ${PROPERTY_LABELS[property]} stop`,
        });
      }
      entries.push({
        name: `${prefix}-GradientType`,
        value: values.gradientType,
        description: `${label} metallic gradient style`,
      });
      entries.push({
        name: `${prefix}-GradientAngle`,
        value: `${values.gradientAngle}deg`,
        description: `${label} metallic gradient direction`,
      });
      entries.push({
        name: `${prefix}-Fill`,
        value: buildMetallicFillGradient(values),
        description: `${label} metallic surface fill`,
      });
      entries.push({
        name: `${prefix}-Stroke`,
        value: buildMetallicStrokeGradient(values),
        description: `${label} metallic image stroke`,
      });
      entries.push({
        name: `${prefix}-StrokeColor`,
        value: values.baseDark,
        description: `${label} metallic solid stroke fallback`,
      });
      entries.push({
        name: `${prefix}-Text`,
        value: values.shadow,
        description: `${label} readable text color on metallic fill`,
      });
      entries.push({
        name: `${prefix}-Gradient`,
        value: buildMetallicFillGradient(values),
        description: `${label} metallic fill gradient legacy alias`,
      });
    });
  }

  return entries;
}

export function generateMaterialAssignmentTokenEntries(input: unknown, materialInput?: unknown): MetallicTokenEntry[] {
  const assignments = {
    ...normalizeMaterialAssignments(input),
    ...(materialInput !== undefined ? normalizeMaterialAssignments(materialInput) : {}),
  };
  const enabledPresets = new Set(getEnabledMetallicPresets(materialInput ?? input));
  const entries: MetallicTokenEntry[] = [];

  for (const [target, preset] of Object.entries(assignments) as Array<[MaterialAssignmentTarget, VisibleMetallicPresetName]>) {
    if (!enabledPresets.has(preset)) continue;
    const targetLabel = ASSIGNMENT_TOKEN_LABELS[target];
    const metalLabel = getMetallicTokenLabel(preset);
    const targetName = target === 'logo' ? 'Logo' : targetLabel;
    const descriptionTarget = target === 'logo' ? 'logo' : `${target} appearance`;

    entries.push({
      name: `${targetLabel}-Material`,
      value: preset,
      description: `${descriptionTarget} active metallic material`,
    });
    entries.push({
      name: `${targetLabel}-Material-Fill`,
      value: `var(--Material-Metallic-${metalLabel}-Fill)`,
      description: `${targetName} metallic fill`,
    });
    entries.push({
      name: `${targetLabel}-Material-Stroke`,
      value: `var(--Material-Metallic-${metalLabel}-Stroke)`,
      description: `${targetName} metallic stroke image`,
    });
    entries.push({
      name: `${targetLabel}-Material-StrokeColor`,
      value: `var(--Material-Metallic-${metalLabel}-StrokeColor)`,
      description: `${targetName} metallic solid stroke fallback`,
    });
    entries.push({
      name: `${targetLabel}-Material-Text`,
      value: `var(--Material-Metallic-${metalLabel}-Text)`,
      description: `${targetName} readable text on metallic fill`,
    });
  }

  return entries;
}

export function generateMetallicMaterialCSS(input: unknown): string {
  const materials = normalizeMetallicMaterials(input);
  const declarations: string[] = [];

  for (const preset of getEnabledMetallicPresets(input)) {
    const material = materials[preset];
    const segments = getMetallicVariantSegments(material);
    material.variants.forEach((values, index) => {
      const prefix = getMetallicVariantTokenPrefix(preset, segments[index]);
      for (const property of METALLIC_PROPERTIES) {
        declarations.push(`--${prefix}-${PROPERTY_LABELS[property]}: ${values[property]};`);
      }
      declarations.push(`--${prefix}-GradientType: ${values.gradientType};`);
      declarations.push(`--${prefix}-GradientAngle: ${values.gradientAngle}deg;`);
      declarations.push(`--${prefix}-Fill: ${buildMetallicFillTokenGradient(prefix, values)};`);
      declarations.push(`--${prefix}-Stroke: ${buildMetallicStrokeTokenGradient(prefix, values)};`);
      declarations.push(`--${prefix}-StrokeColor: var(--${prefix}-BaseDark);`);
      declarations.push(`--${prefix}-Text: var(--${prefix}-Shadow);`);
      declarations.push(`--${prefix}-Gradient: var(--${prefix}-Fill);`);
    });
  }

  return declarations.join('\n  ');
}

export function generateMaterialAssignmentCSS(input: unknown, materialInput?: unknown): string {
  return generateMaterialAssignmentTokenEntries(input, materialInput)
    .map((token) => `--${token.name}: ${token.value};`)
    .join('\n  ');
}
