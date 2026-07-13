/**
 * materialNative.ts
 *
 * Pure-function material resolver for native (React Native).
 *
 * Mirrors the web pipeline's `generateMetallicMaterialCSS` output but emits
 * typed gradient stop arrays instead of CSS strings — ready for direct
 * consumption by `expo-linear-gradient` or `react-native-svg`.
 *
 * All stop arrays are derived from the same `FILL_STOPS` / `STROKE_STOPS`
 * constants used by the web engine so colour values stay byte-identical.
 */

import {
  DEFAULT_METALLIC_PRESETS,
  FILL_STOPS,
  STROKE_STOPS,
  getEnabledMetallicPresets,
  normalizeMetallicConfig,
  normalizeMaterialAssignments,
  mergeMaterialConfigWithFoundationConfig,
  type MetallicPresetName,
  type MetallicGradientType,
  type MaterialAssignmentTarget,
} from './materialCSS';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A fully resolved metallic gradient preset, ready for native rendering.
 *
 * `colors` / `locations` match the 8-stop fill gradient web emits for the
 * `--Material-Metallic-{Preset}-Fill` CSS variable. `strokeColors` /
 * `strokeLocations` correspond to the 6-stop stroke gradient.
 */
export interface ResolvedMetallicGradient {
  preset: MetallicPresetName;
  /** 8 fill-gradient stops (hex), ordered 0 → 100 %. */
  colors: readonly [string, string, string, string, string, string, string, string];
  /** 8 normalised positions (0–1) matching `colors`. */
  locations: readonly [number, number, number, number, number, number, number, number];
  /** CSS-convention angle: 0 = upward, 90 = right, 135 = bottom-right. */
  angle: number;
  gradientType: MetallicGradientType;
  /** Readable text colour on metallic fill (= shadow stop, AA-verified by the engine). */
  text: string;
  /** Solid border fallback colour (= baseDark stop). */
  strokeColor: string;
  /** 6 stroke-gradient stops (hex). */
  strokeColors: readonly [string, string, string, string, string, string];
  /** 6 normalised positions (0–1) matching `strokeColors`. */
  strokeLocations: readonly [number, number, number, number, number, number];
}

/** Full material resolution for a brand — threaded into `OneUINativeTheme.materials`. */
export interface ResolvedMaterials {
  /** Resolved gradient data keyed by preset name. Only enabled presets are present. */
  metallic: Partial<Record<MetallicPresetName, ResolvedMetallicGradient>>;
  /** Per-role material assignments (e.g. primary → 'gold'). */
  assignments: Partial<Record<MaterialAssignmentTarget, MetallicPresetName>>;
  /** Names of enabled presets (subset of all METALLIC_PRESETS). */
  enabled: MetallicPresetName[];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function parsePosition(position: string): number {
  return parseFloat(position) / 100;
}

// ─── Main resolver ────────────────────────────────────────────────────────────

/**
 * Resolve brand material configuration into ready-to-render native gradient data.
 *
 * @param materialConfig            Raw `materialConfig` (from `materialConfigs` Convex table row).
 * @param materialsFoundationConfig Raw `foundation.materials.config` from `getBrandOverviewData`.
 *
 * Either or both may be `null` / `undefined` — the function returns defaults from
 * `DEFAULT_METALLIC_PRESETS` with no assignments in that case.
 */
export function resolveMaterials(
  materialConfig: unknown,
  materialsFoundationConfig: unknown,
): ResolvedMaterials {
  const merged = mergeMaterialConfigWithFoundationConfig(
    materialConfig ?? {},
    materialsFoundationConfig,
  );

  const config = normalizeMetallicConfig(merged);
  const assignments = normalizeMaterialAssignments(materialsFoundationConfig ?? merged);
  const enabled = getEnabledMetallicPresets(merged) as MetallicPresetName[];

  const metallic: Partial<Record<MetallicPresetName, ResolvedMetallicGradient>> = {};

  for (const presetName of enabled) {
    const preset = config[presetName] ?? DEFAULT_METALLIC_PRESETS[presetName];

    const fillColors = FILL_STOPS.map(({ property }) => preset[property]);
    const fillLocations = FILL_STOPS.map(({ position }) => parsePosition(position));

    const strokeColors = STROKE_STOPS.map(({ property }) => preset[property]);
    const strokeLocations = STROKE_STOPS.map(({ position }) => parsePosition(position));

    metallic[presetName] = {
      preset: presetName,
      colors: fillColors as unknown as ResolvedMetallicGradient['colors'],
      locations: fillLocations as unknown as ResolvedMetallicGradient['locations'],
      angle: preset.gradientAngle,
      gradientType: preset.gradientType,
      text: preset.shadow,
      strokeColor: preset.baseDark,
      strokeColors: strokeColors as unknown as ResolvedMetallicGradient['strokeColors'],
      strokeLocations: strokeLocations as unknown as ResolvedMetallicGradient['strokeLocations'],
    };
  }

  return { metallic, assignments, enabled };
}
